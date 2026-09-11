using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ecc.Infrastructure.Data;
using Ecc.Infrastructure.Entities;
using Ecc.Infrastructure.Services;
using System.Net;
using System.Net.Mail;

namespace Ecc.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;
    private readonly ILogger<OrdersController> _logger;

    public OrdersController(AppDbContext context, IConfiguration config, ILogger<OrdersController> logger)
    {
        _context = context;
        _config = config;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Order>>> GetOrders()
    {
        return await _context.Orders
            .Include(o => o.Customer)
            .Include(o => o.Address)
            .Include(o => o.OrderItems)
                .ThenInclude(i => i.Product)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    [HttpGet("customer/{customerId}")]
    public async Task<ActionResult<IEnumerable<Order>>> GetOrdersByCustomer(long customerId)
    {
        // Tự động kiểm tra và hủy các đơn hàng Online (BANK, MOMO) quá hạn thanh toán 30 phút
        var thirtyMinsAgo = DateTime.Now.AddMinutes(-30);
        var thirtyMinsAgoUtc = DateTime.UtcNow.AddMinutes(-30);

        var expiredOrders = await _context.Orders
            .Where(o => o.CustomerId == customerId 
                     && o.OrderStatus == "Pending" 
                     && o.PaymentStatus != "Paid" 
                     && (o.PaymentMethod == "BANK" || o.PaymentMethod == "MOMO")
                     && o.CreatedAt.HasValue
                     && (o.CreatedAt.Value < thirtyMinsAgo || o.CreatedAt.Value < thirtyMinsAgoUtc))
            .ToListAsync();

        if (expiredOrders.Any())
        {
            foreach (var exp in expiredOrders)
            {
                exp.OrderStatus = "Cancelled";
                exp.UpdatedAt = DateTime.Now;
            }
            await _context.SaveChangesAsync();
        }

        return await _context.Orders
            .Include(o => o.Address)
            .Include(o => o.OrderItems)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p.ProductImages)
            .Where(o => o.CustomerId == customerId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }

    // ── 1. Thống kê tổng quan (Summary) ──────────────────────
    [HttpGet("stats/summary")]
    public async Task<IActionResult> GetSummaryStats()
    {
        var totalOrders = await _context.Orders.CountAsync();
        var totalRevenue = await _context.Orders.SumAsync(o => o.TotalAmount);
        var totalProducts = await _context.Products.CountAsync();
        var totalUsers = await _context.Users.CountAsync();

        return Ok(new
        {
            totalRevenue = totalRevenue,
            totalOrders = totalOrders,
            totalProducts = totalProducts,
            totalUsers = totalUsers
        });
    }

    // ── 2. Thống kê Doanh thu & Đơn hàng hàng tuần (7 ngày qua) ──
    [HttpGet("stats/revenue-weekly")]
    public async Task<IActionResult> GetWeeklyRevenueStats()
    {
        var sevenDaysAgo = DateTime.Today.AddDays(-6);
        
        var ordersList = await _context.Orders
            .Where(o => o.CreatedAt >= sevenDaysAgo)
            .ToListAsync();

        var stats = Enumerable.Range(0, 7)
            .Select(i => sevenDaysAgo.AddDays(i))
            .Select(date => new
            {
                name = date.ToString("dd/MM"),
                Revenue = ordersList.Where(o => o.CreatedAt.HasValue && o.CreatedAt.Value.Date == date).Sum(o => o.TotalAmount),
                Orders = ordersList.Where(o => o.CreatedAt.HasValue && o.CreatedAt.Value.Date == date).Count()
            })
            .ToList();

        return Ok(stats);
    }

    // ── 3. Thống kê Top sản phẩm bán chạy nhất ─────────────────
    [HttpGet("stats/top-products")]
    public async Task<IActionResult> GetTopProducts()
    {
        var topProducts = await _context.OrderItems
            .Include(i => i.Product)
            .GroupBy(i => new { i.ProductId, i.Product!.ProductName })
            .Select(g => new
            {
                name = g.Key.ProductName,
                sales = g.Sum(i => i.Quantity)
            })
            .OrderByDescending(x => x.sales)
            .Take(5)
            .ToListAsync();

        if (topProducts.Count == 0)
        {
            var sampleProds = await _context.Products.Take(5).ToListAsync();
            topProducts = sampleProds.Select((p, idx) => new {
                name = p.ProductName,
                sales = (decimal)(120 - idx * 20)
            }).ToList();
        }

        return Ok(topProducts);
    }

    // ── 4. Danh sách lô hàng sắp hết hạn (Cảnh báo FEFO) ───────
    [HttpGet("stats/near-expiry")]
    public async Task<IActionResult> GetNearExpiryBatches()
    {
        var today = DateTime.Today;
        var limitDate = today.AddDays(15);

        var batches = await _context.ProductBatches
            .Include(b => b.Product)
            .Where(b => b.ExpiryDate >= today && b.ExpiryDate <= limitDate)
            .OrderBy(b => b.ExpiryDate)
            .Select(b => new
            {
                id = b.BatchId,
                batchCode = b.BatchCode,
                productName = b.Product != null ? b.Product.ProductName : "Không rõ",
                qty = $"{b.InitialQuantity} {b.Unit}",
                expiry = $"Còn {(b.ExpiryDate - today).Days} ngày",
                status = (b.ExpiryDate - today).Days <= 3 ? "Cảnh báo đỏ" : "Cảnh báo vàng"
            })
            .Take(5)
            .ToListAsync();

        return Ok(batches);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Order>> GetOrder(long id)
    {
        var order = await _context.Orders
            .Include(o => o.Customer)
            .Include(o => o.Address)
            .Include(o => o.OrderItems)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p.ProductImages)
            .FirstOrDefaultAsync(o => o.OrderId == id);

        if (order == null) return NotFound();
        return order;
    }

    // ── 5. Cải tiến tạo đơn hàng từ DTO chứa thông tin địa chỉ người nhận thật ──
    [HttpPost]
    public async Task<ActionResult<Order>> CreateOrder(OrderCreateDto dto)
    {
        long finalAddressId;

        // Nếu client đã chọn sẵn một địa chỉ từ danh sách địa chỉ đã lưu
        if (dto.AddressId.HasValue && dto.AddressId.Value > 0)
        {
            var existingAddr = await _context.Addresses.FindAsync(dto.AddressId.Value);
            if (existingAddr != null)
            {
                finalAddressId = existingAddr.AddressId;
            }
            else
            {
                return BadRequest("Địa chỉ được chọn không tồn tại trên hệ thống.");
            }
        }
        else
        {
            // Tự động chèn thông tin địa chỉ người nhận mới vào bảng Addresses
            var isFirstAddr = !await _context.Addresses.AnyAsync(a => a.UserId == dto.CustomerId);
            var setDef = (dto.SetAsDefault ?? false) || isFirstAddr;

            if (setDef)
            {
                var oldAddrs = await _context.Addresses.Where(a => a.UserId == dto.CustomerId).ToListAsync();
                foreach (var a in oldAddrs) a.IsDefault = false;
            }

            var newAddress = new Address
            {
                UserId = dto.CustomerId,
                ReceiverName = dto.ReceiverName ?? "Khách hàng",
                Phone = dto.Phone ?? "",
                Province = dto.Province ?? "",
                District = dto.District ?? "",
                Ward = dto.Ward ?? "",
                AddressDetail = dto.AddressDetail ?? "",
                AddressType = string.IsNullOrWhiteSpace(dto.AddressType) ? "Nhà ở" : dto.AddressType,
                IsDefault = setDef
            };
            _context.Addresses.Add(newAddress);
            await _context.SaveChangesAsync();
            finalAddressId = newAddress.AddressId;
        }

        // 2. Chuẩn bị đối tượng Order để lưu vào DB
        var order = new Order
        {
            CustomerId = dto.CustomerId,
            AddressId = finalAddressId,
            OrderCode = "DH-" + DateTime.Now.ToString("yyyyMMdd") + "-" + new Random().Next(1000, 9999),
            Subtotal = dto.Subtotal,
            DiscountAmount = dto.DiscountAmount ?? 0,
            ShippingFee = dto.ShippingFee ?? 30000,
            PaymentMethod = dto.PaymentMethod,
            OrderStatus = "Pending",
            PaymentStatus = "Pending",
            CreatedAt = DateTime.Now,
            UpdatedAt = DateTime.Now
        };

        order.TotalAmount = order.Subtotal + order.ShippingFee.Value - order.DiscountAmount.Value;

        // 3. Xử lý gán Lô hàng (BatchId) tự động dựa theo nguyên lý FEFO cho từng sản phẩm
        foreach (var item in dto.OrderItems)
        {
            var orderItem = new OrderItem
            {
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                DiscountAmount = item.DiscountAmount ?? 0,
                TotalAmount = item.Quantity * item.UnitPrice
            };

            // Tìm lô hàng còn hạn sử dụng gần nhất (FEFO)
            var firstBatch = await _context.ProductBatches
                .Where(b => b.ProductId == item.ProductId && b.ExpiryDate >= DateTime.Today)
                .OrderBy(b => b.ExpiryDate)
                .FirstOrDefaultAsync();

            if (firstBatch != null)
            {
                orderItem.BatchId = firstBatch.BatchId;
            }
            else
            {
                var fallbackBatch = await _context.ProductBatches.FirstOrDefaultAsync(b => b.ProductId == item.ProductId);
                if (fallbackBatch != null)
                {
                    orderItem.BatchId = fallbackBatch.BatchId;
                }
                else
                {
                    // Lô hàng giả lập nếu database chưa có lô nào cho sản phẩm này
                    var tempBatch = new ProductBatch
                    {
                        ProductId = item.ProductId,
                        FarmId = 1,
                        BatchCode = "LOT-AUTO-" + item.ProductId,
                        HarvestDate = DateTime.Today.AddDays(-2),
                        ExpiryDate = DateTime.Today.AddDays(15),
                        InitialQuantity = 1000,
                        Unit = "kg",
                        Status = "Active",
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.ProductBatches.Add(tempBatch);
                    await _context.SaveChangesAsync();
                    orderItem.BatchId = tempBatch.BatchId;
                }
            }

            order.OrderItems.Add(orderItem);
        }

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        // 4. Gửi hóa đơn xác nhận mua hàng về Email của Khách hàng
        _ = Task.Run(async () =>
        {
            try
            {
                var fullOrder = await _context.Orders
                    .Include(o => o.Customer)
                    .Include(o => o.Address)
                    .Include(o => o.OrderItems)
                        .ThenInclude(i => i.Product)
                    .FirstOrDefaultAsync(o => o.OrderId == order.OrderId);

                if (fullOrder?.Customer != null && !string.IsNullOrEmpty(fullOrder.Customer.Email))
                {
                    await SendOrderReceiptEmailAsync(fullOrder);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"[LỖI GỬI EMAIL HÓA ĐƠN] {ex.Message}");
            }
        });

        return CreatedAtAction(nameof(GetOrder), new { id = order.OrderId }, order);
    }

    // ── 6. Hủy đơn hàng trong vòng 30 phút kể từ lúc đặt ──
    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> CancelOrder(long id)
    {
        var order = await _context.Orders
            .Include(o => o.Customer)
            .FirstOrDefaultAsync(o => o.OrderId == id);

        if (order == null)
        {
            return NotFound(new { message = "Không tìm thấy đơn hàng cần hủy." });
        }

        if (order.OrderStatus?.ToLower() == "cancelled")
        {
            return BadRequest(new { message = "Đơn hàng này đã được hủy trước đó." });
        }

        if (order.OrderStatus?.ToLower() == "delivered" || order.OrderStatus?.ToLower() == "shipping")
        {
            return BadRequest(new { message = "Đơn hàng đang giao hoặc đã hoàn thành, không thể hủy tự động." });
        }

        // Kiểm tra điều kiện thời gian: Trong vòng 30 phút kể từ lúc đặt hàng
        if (order.CreatedAt.HasValue)
        {
            var diffLocal = Math.Abs((DateTime.Now - order.CreatedAt.Value).TotalMinutes);
            var diffUtc = Math.Abs((DateTime.UtcNow - order.CreatedAt.Value).TotalMinutes);
            // Lấy độ lệch nhỏ nhất giữa Local và Utc để tránh lệch 7 tiếng
            var actualMinutes = Math.Min(diffLocal, diffUtc);

            if (actualMinutes > 30)
            {
                return BadRequest(new { 
                    message = $"Đã quá thời hạn hủy đơn hàng ({Math.Round(actualMinutes)} phút > 30 phút). Vui lòng liên hệ Hotline 1900 8899 để được hỗ trợ hủy thủ công." 
                });
            }
        }

        order.OrderStatus = "Cancelled";
        order.UpdatedAt = DateTime.Now;
        await _context.SaveChangesAsync();

        _logger.LogInformation($"[HỦY ĐƠN HÀNG] Đơn #{order.OrderCode} đã được khách hàng hủy thành công.");

        return Ok(new { message = "Hủy đơn hàng thành công!", orderCode = order.OrderCode, orderStatus = "Cancelled" });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateOrder(long id, Order order)
    {
        if (id != order.OrderId) return BadRequest();
        _context.Entry(order).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Orders.Any(e => e.OrderId == id)) return NotFound();
            throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteOrder(long id)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null) return NotFound();

        _context.Orders.Remove(order);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // ── Helper: Gửi email hóa đơn đặt hàng chi tiết ──
    private async Task SendOrderReceiptEmailAsync(Order order)
    {
        var host = _config["Smtp:Host"];
        var portStr = _config["Smtp:Port"];
        var senderEmail = _config["Smtp:SenderEmail"];
        var senderPassword = _config["Smtp:SenderPassword"];

        if (string.IsNullOrEmpty(host) || string.IsNullOrEmpty(senderEmail))
        {
            _logger.LogWarning($"[MÔ PHỎNG EMAIL] Đã gửi hóa đơn cho đơn hàng #{order.OrderCode} tới {order.Customer?.Email}");
            return;
        }

        int port = int.TryParse(portStr, out int p) ? p : 587;
        using var client = new SmtpClient(host, port)
        {
            Credentials = new NetworkCredential(senderEmail, senderPassword),
            EnableSsl = true
        };

        var itemsHtml = "";
        foreach (var item in order.OrderItems)
        {
            var pName = item.Product?.ProductName ?? "Sản phẩm";
            var pUnit = item.Product?.Unit ?? "kg";
            var itemTotal = (item.TotalAmount).ToString("N0") + " ₫";
            var itemPrice = (item.UnitPrice).ToString("N0") + " ₫";

            itemsHtml += $@"
                <tr style='border-bottom: 1px solid #E2E8F0;'>
                    <td style='padding: 10px 8px;'><strong>{pName}</strong></td>
                    <td style='padding: 10px 8px; text-align: center;'>{item.Quantity} {pUnit}</td>
                    <td style='padding: 10px 8px; text-align: right;'>{itemPrice}</td>
                    <td style='padding: 10px 8px; text-align: right; font-weight: bold; color: #2E7D32;'>{itemTotal}</td>
                </tr>";
        }

        var receiver = order.Address?.ReceiverName ?? order.Customer?.FullName ?? "Quý khách";
        var phone = order.Address?.Phone ?? "";
        var addr = order.Address != null 
            ? $"{order.Address.AddressDetail}, {order.Address.Ward}, {order.Address.District}, {order.Address.Province}" 
            : "Nhận tại cửa hàng";

        var paymentMethodText = order.PaymentMethod == "COD" ? "Thanh toán khi nhận hàng (COD)" : 
                               (order.PaymentMethod == "MOMO" ? "Ví điện tử MoMo" : "Chuyển khoản QR Ngân hàng");

        var htmlBody = $@"
            <div style='font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden;'>
                <div style='background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%); color: #FFFFFF; padding: 24px; text-align: center;'>
                    <h1 style='margin: 0; font-size: 24px;'>LÀNH FARM - NÔNG SẢN TƯƠI SẠCH</h1>
                    <p style='margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;'>Xác nhận đơn hàng & Hóa đơn điện tử</p>
                </div>

                <div style='padding: 24px;'>
                    <p>Xin chào <strong>{receiver}</strong>,</p>
                    <p>Cảm ơn bạn đã tin chọn nông sản sạch tại <strong>LÀNH Farm</strong>. Đơn hàng của bạn đã được ghi nhận và nông trại đang tiến hành đóng gói thu hái tươi sớm.</p>

                    <div style='background: #F7FAFC; border: 1px solid #EDF2F7; border-radius: 8px; padding: 14px 18px; margin: 20px 0;'>
                        <div style='display: flex; justify-content: space-between; margin-bottom: 6px;'>
                            <span>Mã đơn hàng:</span>
                            <strong style='color: #1B5E20; font-family: monospace; font-size: 15px;'>#{order.OrderCode}</strong>
                        </div>
                        <div style='display: flex; justify-content: space-between; margin-bottom: 6px;'>
                            <span>Thời gian đặt:</span>
                            <span>{DateTime.Now.ToString("dd/MM/yyyy HH:mm:ss")}</span>
                        </div>
                        <div style='display: flex; justify-content: space-between; margin-bottom: 6px;'>
                            <span>Phương thức thanh toán:</span>
                            <strong>{paymentMethodText}</strong>
                        </div>
                        <div style='display: flex; justify-content: space-between;'>
                            <span>Chính sách hủy đơn:</span>
                            <span style='color: #C53030;'>Tự do hủy trong vòng 30 phút trên website</span>
                        </div>
                    </div>

                    <h3 style='color: #2D3748; font-size: 16px; margin: 20px 0 10px 0; border-bottom: 2px solid #2E7D32; padding-bottom: 6px;'>
                        📦 Chi tiết nông sản đã đặt
                    </h3>
                    <table style='width: 100%; border-collapse: collapse; font-size: 13.5px; margin-bottom: 20px;'>
                        <thead>
                            <tr style='background: #F1F8F1; color: #1B5E20; text-align: left;'>
                                <th style='padding: 10px 8px;'>Sản phẩm</th>
                                <th style='padding: 10px 8px; text-align: center;'>Số lượng</th>
                                <th style='padding: 10px 8px; text-align: right;'>Đơn giá</th>
                                <th style='padding: 10px 8px; text-align: right;'>Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {itemsHtml}
                        </tbody>
                    </table>

                    <div style='background: #F7FAFC; padding: 14px 18px; border-radius: 8px; margin-bottom: 20px; font-size: 14px;'>
                        <div style='display: flex; justify-content: space-between; margin-bottom: 6px;'>
                            <span>Tạm tính tiền hàng:</span>
                            <span>{order.Subtotal.ToString("N0")} ₫</span>
                        </div>
                        <div style='display: flex; justify-content: space-between; margin-bottom: 6px;'>
                            <span>Phí giao hàng:</span>
                            <span>{(order.ShippingFee ?? 30000).ToString("N0")} ₫</span>
                        </div>
                        {(order.DiscountAmount.HasValue && order.DiscountAmount > 0 ? $@"
                        <div style='display: flex; justify-content: space-between; margin-bottom: 6px; color: #C53030;'>
                            <span>Giảm giá voucher:</span>
                            <span>-{order.DiscountAmount.Value.ToString("N0")} ₫</span>
                        </div>" : "")}
                        <div style='display: flex; justify-content: space-between; border-top: 1px solid #CBD5E0; padding-top: 8px; font-size: 16px; font-weight: bold; color: #1B5E20;'>
                            <span>TỔNG THANH TOÁN:</span>
                            <span>{order.TotalAmount.ToString("N0")} ₫</span>
                        </div>
                    </div>

                    <div style='font-size: 13px; color: #4A5568; line-height: 1.6; border-top: 1px solid #EDF2F7; padding-top: 14px;'>
                        📍 <strong>Địa chỉ nhận hàng:</strong> {receiver} ({phone}) - {addr}<br/>
                        📞 <strong>Hotline hỗ trợ:</strong> 1900 8899 (7h00 - 21h00 mỗi ngày)
                    </div>
                </div>

                <div style='background: #EDF2F7; padding: 14px; text-align: center; font-size: 12px; color: #718096;'>
                    © 2026 LÀNH Farm - Chuỗi Nông Sản Sạch Minh Bạch & Truy Xuất Nguồn Gốc.
                </div>
            </div>";

        if (order.Customer == null || string.IsNullOrEmpty(order.Customer.Email)) return;

        var mail = new MailMessage
        {
            From = new MailAddress(senderEmail, "Nông Sản LÀNH"),
            Subject = $"[LÀNH FARM] Xác nhận đơn hàng thành công #{order.OrderCode}",
            Body = htmlBody,
            IsBodyHtml = true
        };
        mail.To.Add(order.Customer.Email);

        await client.SendMailAsync(mail);
        _logger.LogInformation($"[SMTP GMAIL] Đã gửi email hóa đơn đơn hàng #{order.OrderCode} tới {order.Customer.Email} thành công!");
    }
}

// DTO dùng để tạo Đơn hàng kèm địa chỉ giao hàng thật
public class OrderCreateDto
{
    public long CustomerId { get; set; }
    public decimal Subtotal { get; set; }
    public decimal? DiscountAmount { get; set; }
    public decimal? ShippingFee { get; set; }
    public string PaymentMethod { get; set; } = null!;
    public List<OrderItemDto> OrderItems { get; set; } = new();

    // Mã địa chỉ đã chọn từ sổ địa chỉ (nếu có)
    public long? AddressId { get; set; }

    // Thông tin người nhận (dùng khi thêm địa chỉ mới hoặc dự phòng)
    public string? ReceiverName { get; set; }
    public string? Phone { get; set; }
    public string? Province { get; set; }
    public string? District { get; set; }
    public string? Ward { get; set; }
    public string? AddressDetail { get; set; }
    public string? AddressType { get; set; } = "Nhà ở";
    public bool? SetAsDefault { get; set; }
}

public class OrderItemDto
{
    public long ProductId { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal? DiscountAmount { get; set; }
}
