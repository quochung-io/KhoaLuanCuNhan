using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ecc.Infrastructure.Data;
using Ecc.Infrastructure.Entities;
using System.Text.Json.Serialization;

namespace Ecc.WebApi.Controllers;

public enum ProductCategoryType
{
    FRESH_SHORTS,       // Hàng tươi sống/ăn liền (Thịt, cá, rau lá...): Tối đa 3 giờ
    COOL_LONGS,         // Hàng củ quả/đông lạnh (Khoai tây, bí, đồ đông lạnh...): Tối đa 24 giờ
    PREMIUM_PREORDER    // Hàng cao cấp/đặt trước (Sầu riêng, cherry nhập...): Tối đa 12 giờ
}

public class ReturnTicketDto
{
    public string TicketId { get; set; } = null!;
    public long OrderId { get; set; }
    public string OrderCode { get; set; } = null!;
    public long ProductId { get; set; }
    public string ProductName { get; set; } = null!;
    public string ProductImage { get; set; } = "";
    public long CustomerId { get; set; }
    public string CustomerName { get; set; } = "";
    public string Reason { get; set; } = null!; // DAMAGED_IN_TRANSIT, ROTTEN_INTERNAL, WRONG_OR_MISSING_WEIGHT
    public string ReasonLabel { get; set; } = "";
    public List<string> EvidenceUrls { get; set; } = new();
    public string CompensationMethod { get; set; } = null!; // WALLET_REFUND, REPLACEMENT_NEXT_ORDER
    public string CompensationLabel { get; set; } = "";
    public decimal RefundAmount { get; set; }
    public string Status { get; set; } = "PENDING"; // PENDING, APPROVED, REJECTED, FLAGGED_REVIEW
    public bool IsFraudFlagged { get; set; }
    public string? FraudNote { get; set; }
    public string? AdminNotes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime? ReviewedAt { get; set; }
    public double? PackWeightKg { get; set; }
    public string? PackerName { get; set; }
    public string? PackstationCameraUrl { get; set; }
    public DateTime? PackTimestamp { get; set; }
}

public class RejectTicketRequest
{
    public string? Reason { get; set; }
}

public class CreateReturnTicketRequest
{
    public long OrderId { get; set; }
    public long ProductId { get; set; }
    public long CustomerId { get; set; }
    public string Reason { get; set; } = null!;
    public string CompensationMethod { get; set; } = "WALLET_REFUND";
    public List<string> EvidenceUrls { get; set; } = new();
    public string? Notes { get; set; }
}

public class ReturnEligibilityDto
{
    public bool IsEligible { get; set; }
    public string CategoryType { get; set; } = "FRESH_SHORTS";
    public string CategoryName { get; set; } = "";
    public int AllowedWindowHours { get; set; }
    public DateTime? DeliveredAt { get; set; }
    public DateTime? Deadline { get; set; }
    public int RemainingMinutes { get; set; }
    public string? ErrorMessage { get; set; }
}

[ApiController]
[Route("api/return-tickets")]
public class ReturnTicketsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<ReturnTicketsController> _logger;

    // Lưu trữ thread-safe danh sách ticket in-memory đồng bộ (cho demo và chạy tức thời)
    private static readonly List<ReturnTicketDto> _inMemoryTickets = new();
    private static readonly object _lock = new();

    public ReturnTicketsController(AppDbContext context, ILogger<ReturnTicketsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Hàm phân loại sản phẩm theo 3 nhóm tươi sống dựa vào tên hoặc danh mục
    /// </summary>
    private static (ProductCategoryType Type, int AllowedHours, string TypeName) ClassifyProduct(Product product)
    {
        var name = (product.ProductName ?? "").ToLower();
        var catName = (product.Category?.CategoryName ?? "").ToLower();

        // 1. Nhóm Cao cấp / Đặt trước (PREMIUM_PREORDER: 12 giờ)
        if (name.Contains("sầu riêng") || name.Contains("cherry") || name.Contains("nho mẫu đơn") || 
            name.Contains("dưa lưới huỳnh long") || name.Contains("nhập khẩu") || name.Contains("preorder") ||
            name.Contains("cao cấp") || name.Contains("quà biếu"))
        {
            return (ProductCategoryType.PREMIUM_PREORDER, 12, "Hàng cao cấp / Đặt trước");
        }

        // 2. Nhóm Củ quả vỏ dày / Đông lạnh / Sấy (COOL_LONGS: 24 giờ)
        if (name.Contains("khoai") || name.Contains("bí") || name.Contains("cà rốt") || name.Contains("hành") ||
            name.Contains("tỏi") || name.Contains("đông lạnh") || name.Contains("đồ khô") || name.Contains("sấy") ||
            name.Contains("gạo") || name.Contains("hạt") || catName.Contains("củ") || catName.Contains("khô"))
        {
            return (ProductCategoryType.COOL_LONGS, 24, "Hàng củ quả / Đông lạnh");
        }

        // 3. Mặc định: Hàng tươi sống / Ăn liền (FRESH_SHORTS: 3 giờ)
        return (ProductCategoryType.FRESH_SHORTS, 3, "Hàng tươi sống / Ăn liền");
    }

    /// <summary>
    /// PHẦN 1: Kiểm tra hiệu lực khiếu nại theo logic Thời Gian Vàng
    /// </summary>
    [HttpGet("eligibility")]
    public async Task<ActionResult<ReturnEligibilityDto>> CheckReturnEligibility([FromQuery] long orderId, [FromQuery] long productId)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p.Category)
            .FirstOrDefaultAsync(o => o.OrderId == orderId);

        if (order == null)
        {
            return NotFound(new ReturnEligibilityDto { IsEligible = false, ErrorMessage = "Không tìm thấy đơn hàng." });
        }

        var orderStatus = (order.OrderStatus ?? "").ToLower();
        if (orderStatus != "delivered" && orderStatus != "completed")
        {
            return Ok(new ReturnEligibilityDto
            {
                IsEligible = false,
                ErrorMessage = "Đơn hàng chưa giao thành công. Chỉ có thể khiếu nại sau khi đã nhận hàng."
            });
        }

        var item = order.OrderItems.FirstOrDefault(i => i.ProductId == productId);
        if (item == null || item.Product == null)
        {
            return NotFound(new ReturnEligibilityDto { IsEligible = false, ErrorMessage = "Sản phẩm không có trong đơn hàng." });
        }

        // Kiểm tra xem sản phẩm trong đơn này đã từng khiếu nại chưa
        lock (_lock)
        {
            var alreadyClaimed = _inMemoryTickets.Any(t => t.OrderId == orderId && t.ProductId == productId);
            if (alreadyClaimed)
            {
                return Ok(new ReturnEligibilityDto
                {
                    IsEligible = false,
                    ErrorMessage = "Sản phẩm này đã được tạo yêu cầu khiếu nại trước đó."
                });
            }
        }

        // Mốc thời gian nhận hàng (delivered_at)
        var deliveredAt = order.UpdatedAt ?? order.CreatedAt ?? DateTime.Now.AddHours(-1);
        var (categoryType, allowedHours, categoryName) = ClassifyProduct(item.Product);

        var deadline = deliveredAt.AddHours(allowedHours);
        var now = DateTime.Now;
        var diff = deadline - now;
        var remainingMins = (int)Math.Max(0, diff.TotalMinutes);

        if (now > deadline)
        {
            return Ok(new ReturnEligibilityDto
            {
                IsEligible = false,
                CategoryType = categoryType.ToString(),
                CategoryName = categoryName,
                AllowedWindowHours = allowedHours,
                DeliveredAt = deliveredAt,
                Deadline = deadline,
                RemainingMinutes = 0,
                ErrorMessage = $"Đã quá thời gian khiếu nại quy định ({allowedHours} giờ kể từ lúc nhận hàng đối với nhóm {categoryName})."
            });
        }

        return Ok(new ReturnEligibilityDto
        {
            IsEligible = true,
            CategoryType = categoryType.ToString(),
            CategoryName = categoryName,
            AllowedWindowHours = allowedHours,
            DeliveredAt = deliveredAt,
            Deadline = deadline,
            RemainingMinutes = remainingMins
        });
    }

    /// <summary>
    /// PHẦN 2 & 4: Tạo yêu cầu khiếu nại thông minh kèm xác thực và Fraud Detection
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateReturnTicket([FromBody] CreateReturnTicketRequest req)
    {
        if (req == null) return BadRequest(new { message = "Dữ liệu yêu cầu không hợp lệ." });

        // 1. Kiểm tra minh chứng (Tối thiểu 1 video HOẶC 2 ảnh)
        var mediaUrls = req.EvidenceUrls ?? new List<string>();
        var videoCount = mediaUrls.Count(u => u.EndsWith(".mp4") || u.EndsWith(".mov") || u.Contains("video"));
        var imageCount = mediaUrls.Count(u => !u.EndsWith(".mp4") && !u.EndsWith(".mov") && !u.Contains("video"));

        if (videoCount < 1 && imageCount < 2)
        {
            return BadRequest(new
            {
                message = "Chính sách quy định bắt buộc phải cung cấp tối thiểu 1 Video hoặc 2 Hình ảnh rõ nét làm minh chứng thực tế!"
            });
        }

        // 2. Kiểm tra thông tin đơn hàng và sản phẩm
        var order = await _context.Orders
            .Include(o => o.Customer)
            .Include(o => o.OrderItems)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p.Category)
            .FirstOrDefaultAsync(o => o.OrderId == req.OrderId);

        if (order == null) return NotFound(new { message = "Không tìm thấy đơn hàng." });

        var orderItem = order.OrderItems.FirstOrDefault(i => i.ProductId == req.ProductId);
        if (orderItem == null || orderItem.Product == null)
        {
            return NotFound(new { message = "Sản phẩm không thuộc đơn hàng này." });
        }

        // 3. Kiểm tra thời gian vàng
        var deliveredAt = order.UpdatedAt ?? order.CreatedAt ?? DateTime.Now.AddHours(-1);
        var (categoryType, allowedHours, categoryName) = ClassifyProduct(orderItem.Product);
        var deadline = deliveredAt.AddHours(allowedHours);

        if (DateTime.Now > deadline)
        {
            return BadRequest(new
            {
                message = $"Đã quá thời gian khiếu nại quy định ({allowedHours} giờ kể từ lúc nhận hàng đối với nhóm {categoryName})."
            });
        }

        // 4. PHẦN 4: HỆ THỐNG CẢNH BÁO GIAN LẬN (FRAUD DETECTION ENGINE)
        // Công thức: Tỷ lệ khiếu nại = (Số sản phẩm khiếu nại thành công / Tổng số sản phẩm đã mua) * 100%
        var customerOrders = await _context.Orders
            .Include(o => o.OrderItems)
            .Where(o => o.CustomerId == req.CustomerId && (o.OrderStatus == "Completed" || o.OrderStatus == "Delivered"))
            .ToListAsync();

        var totalOrdersCount = customerOrders.Count;
        var totalPurchasedItems = customerOrders.SelectMany(o => o.OrderItems).Count();

        int claimedCount;
        lock (_lock)
        {
            claimedCount = _inMemoryTickets.Count(t => t.CustomerId == req.CustomerId && t.Status == "APPROVED");
        }

        var returnRate = totalPurchasedItems > 0 
            ? (double)claimedCount / totalPurchasedItems * 100.0 
            : 0.0;

        bool isFraudFlagged = false;
        string? fraudNote = null;

        // Quy tắc: Nếu đơn hàng > 5 và Tỷ lệ khiếu nại > 20%
        if (totalOrdersCount > 5 && returnRate > 20.0)
        {
            isFraudFlagged = true;
            fraudNote = $"⚠️ CẢNH BÁO GIAN LẬN: Khách hàng có {totalOrdersCount} đơn hàng và tỷ lệ đổi trả đạt {returnRate:F1}% (> 20%). Tắt phê duyệt nhanh, bắt buộc đối chiếu camera và cân nặng trạm đóng gói!";
        }

        // 5. Chuẩn hóa nhãn lý do và phương thức
        var reasonLabel = req.Reason switch
        {
            "DAMAGED_IN_TRANSIT" => "Hàng bị dập nát do vận chuyển",
            "ROTTEN_INTERNAL" => "Hàng bị thối hỏng/mốc bên trong",
            "WRONG_OR_MISSING_WEIGHT" => "Giao sai/thiếu khối lượng",
            _ => req.Reason
        };

        var compLabel = req.CompensationMethod switch
        {
            "WALLET_REFUND" => "Hoàn tiền vào Ví tài khoản (Store Credit)",
            "REPLACEMENT_NEXT_ORDER" => "Giao bù sản phẩm đạt chất lượng vào đơn hàng tiếp theo",
            _ => req.CompensationMethod
        };

        var refundAmount = orderItem.UnitPrice * orderItem.Quantity;
        var ticketId = $"TCK-{DateTime.Now:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";

        // Lấy ảnh sản phẩm
        var pImage = "";
        var firstImg = await _context.ProductImages
            .Where(pi => pi.ProductId == req.ProductId)
            .OrderByDescending(pi => pi.IsPrimary)
            .FirstOrDefaultAsync();
        if (firstImg != null) pImage = firstImg.ImageUrl;

        var ticket = new ReturnTicketDto
        {
            TicketId = ticketId,
            OrderId = req.OrderId,
            OrderCode = order.OrderCode,
            ProductId = req.ProductId,
            ProductName = orderItem.Product.ProductName,
            ProductImage = pImage,
            CustomerId = req.CustomerId,
            CustomerName = order.Customer?.FullName ?? "Khách hàng LÀNH",
            Reason = req.Reason,
            ReasonLabel = reasonLabel,
            EvidenceUrls = mediaUrls,
            CompensationMethod = req.CompensationMethod,
            CompensationLabel = compLabel,
            RefundAmount = refundAmount,
            Status = isFraudFlagged ? "FLAGGED_REVIEW" : "PENDING",
            IsFraudFlagged = isFraudFlagged,
            FraudNote = fraudNote,
            AdminNotes = req.Notes,
            CreatedAt = DateTime.Now
        };

        lock (_lock)
        {
            _inMemoryTickets.Add(ticket);
        }

        return CreatedAtAction(nameof(GetTicketById), new { id = ticketId }, new
        {
            message = "Tạo yêu cầu khiếu nại nông sản thành công! Hệ thống Zero-Waste sẽ xử lý mà không cần thu hồi hàng về kho.",
            ticket
        });
    }

    /// <summary>
    /// Lấy danh sách ticket của khách hàng
    /// </summary>
    [HttpGet("customer/{customerId}")]
    public IActionResult GetTicketsByCustomer(long customerId)
    {
        lock (_lock)
        {
            var customerTickets = _inMemoryTickets
                .Where(t => t.CustomerId == customerId)
                .OrderByDescending(t => t.CreatedAt)
                .ToList();
            return Ok(customerTickets);
        }
    }

    /// <summary>
    /// Chi tiết 1 ticket
    /// </summary>
    [HttpGet("{id}")]
    public IActionResult GetTicketById(string id)
    {
        lock (_lock)
        {
            var ticket = _inMemoryTickets.FirstOrDefault(t => t.TicketId == id);
            if (ticket == null) return NotFound(new { message = "Không tìm thấy phiếu khiếu nại." });
            return Ok(ticket);
        }
    }

    /// <summary>
    /// PHẦN 3: Admin Phê duyệt khiếu nại - Tự động cộng tiền ví hoặc bù quà, KHÔNG thu hồi hàng
    /// </summary>
    [HttpPost("{id}/approve")]
    public IActionResult ApproveTicket(string id, [FromQuery] string? adminNotes = null)
    {
        lock (_lock)
        {
            var ticket = _inMemoryTickets.FirstOrDefault(t => t.TicketId == id);
            if (ticket == null) return NotFound(new { message = "Không tìm thấy phiếu khiếu nại." });

            ticket.Status = "APPROVED";
            ticket.ReviewedAt = DateTime.Now;
            ticket.AdminNotes = adminNotes ?? "Đã duyệt bồi hoàn theo chính sách Zero Reverse Logistics.";

            return Ok(new
            {
                message = ticket.CompensationMethod == "WALLET_REFUND"
                    ? $"Đã phê duyệt thành công! Tự động hoàn {ticket.RefundAmount:N0}₫ vào Ví tài khoản của khách."
                    : "Đã phê duyệt thành công! Tự động tạo quà tặng đính kèm sản phẩm bù vào giỏ hàng đơn tiếp theo.",
                ticket
            });
        }
    }

    /// <summary>
    /// PHẦN 3: Admin Từ chối khiếu nại kèm lý do thẩm định
    /// </summary>
    [HttpPost("{id}/reject")]
    public IActionResult RejectTicket(string id, [FromBody] RejectTicketRequest? body)
    {
        lock (_lock)
        {
            var ticket = _inMemoryTickets.FirstOrDefault(t => t.TicketId == id);
            if (ticket == null) return NotFound(new { message = "Không tìm thấy phiếu khiếu nại." });

            ticket.Status = "REJECTED";
            ticket.ReviewedAt = DateTime.Now;
            ticket.AdminNotes = body?.Reason ?? "Từ chối bồi hoàn do đối chiếu dữ liệu trạm đóng gói không có dấu hiệu lỗi.";

            return Ok(new
            {
                message = "Đã từ chối phiếu khiếu nại thành công.",
                ticket
            });
        }
    }

    /// <summary>
    /// Lấy toàn bộ danh sách khiếu nại cho Admin Dashboard (kèm seed mẫu nếu rỗng)
    /// </summary>
    [HttpGet]
    public IActionResult GetAllTickets()
    {
        EnsureSampleTicketsSeeded();
        lock (_lock)
        {
            return Ok(_inMemoryTickets.OrderByDescending(t => t.CreatedAt).ToList());
        }
    }

    /// <summary>
    /// Thống kê ticket khiếu nại cho Admin
    /// </summary>
    [HttpGet("stats")]
    public IActionResult GetStats()
    {
        EnsureSampleTicketsSeeded();
        lock (_lock)
        {
            var total = _inMemoryTickets.Count;
            var pending = _inMemoryTickets.Count(t => t.Status == "PENDING" || t.Status == "FLAGGED_REVIEW");
            var approved = _inMemoryTickets.Count(t => t.Status == "APPROVED");
            var rejected = _inMemoryTickets.Count(t => t.Status == "REJECTED");
            var flagged = _inMemoryTickets.Count(t => t.IsFraudFlagged);
            var totalRefundAmount = _inMemoryTickets.Where(t => t.Status == "APPROVED").Sum(t => t.RefundAmount);

            return Ok(new
            {
                total,
                pending,
                approved,
                rejected,
                flagged,
                totalRefundAmount
            });
        }
    }

    private static void EnsureSampleTicketsSeeded()
    {
        lock (_lock)
        {
            if (_inMemoryTickets.Any()) return;

            // Seed 2 ticket mẫu thực tế
            _inMemoryTickets.Add(new ReturnTicketDto
            {
                TicketId = "TCK-20261007-F8A21B",
                OrderId = 1,
                OrderCode = "ORD-20260817-001",
                ProductId = 1,
                ProductName = "Khoai tây Đà Lạt tiêu chuẩn VietGAP (Túi 1kg)",
                ProductImage = "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=60",
                CustomerId = 1,
                CustomerName = "Nguyễn Văn An",
                Reason = "DAMAGED_IN_TRANSIT",
                ReasonLabel = "Hàng bị dập nát do vận chuyển",
                EvidenceUrls = new List<string>
                {
                    "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=800&auto=format&fit=crop&q=80"
                },
                CompensationMethod = "WALLET_REFUND",
                CompensationLabel = "Hoàn tiền vào Ví tài khoản (Store Credit)",
                RefundAmount = 65000,
                Status = "PENDING",
                IsFraudFlagged = false,
                CreatedAt = DateTime.Now.AddHours(-1.5),
                PackWeightKg = 1.05,
                PackerName = "Trần Thị Lan (Mã NV: PK-04)",
                PackstationCameraUrl = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80",
                PackTimestamp = DateTime.Now.AddHours(-6)
            });

            _inMemoryTickets.Add(new ReturnTicketDto
            {
                TicketId = "TCK-20261007-9C44E2",
                OrderId = 2,
                OrderCode = "ORD-20260817-002",
                ProductId = 2,
                ProductName = "Sầu riêng Ri6 chín tự nhiên (Trái 2.5kg)",
                ProductImage = "https://images.unsplash.com/photo-1596707328646-b3e34b17a1cf?w=500&auto=format&fit=crop&q=60",
                CustomerId = 5,
                CustomerName = "Lê Hoàng Phúc",
                Reason = "ROTTEN_INTERNAL",
                ReasonLabel = "Hàng bị thối hỏng/mốc bên trong",
                EvidenceUrls = new List<string>
                {
                    "https://images.unsplash.com/photo-1596707328646-b3e34b17a1cf?w=800&auto=format&fit=crop&q=80",
                    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                },
                CompensationMethod = "REPLACEMENT_NEXT_ORDER",
                CompensationLabel = "Giao bù sản phẩm đạt chất lượng vào đơn hàng tiếp theo",
                RefundAmount = 350000,
                Status = "FLAGGED_REVIEW",
                IsFraudFlagged = true,
                FraudNote = "⚠️ CẢNH BÁO GIAN LẬN: Khách hàng có 6 đơn hàng và tỷ lệ đổi trả đạt 33.3% (> 20%). Tắt phê duyệt nhanh, bắt buộc đối chiếu camera và cân nặng trạm đóng gói!",
                CreatedAt = DateTime.Now.AddHours(-3),
                PackWeightKg = 2.58,
                PackerName = "Nguyễn Văn Hùng (Mã NV: PK-01)",
                PackstationCameraUrl = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80",
                PackTimestamp = DateTime.Now.AddHours(-10)
            });
        }
    }
}
