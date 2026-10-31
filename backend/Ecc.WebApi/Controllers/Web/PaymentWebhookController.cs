// ============================================================================
// TỆP MÃ NGUỒN: backend/Ecc.WebApi/Controllers/Web/PaymentWebhookController.cs
// MÔ TẢ: Controller tiếp nhận Webhook IPN tự động từ cổng thanh toán MoMo và VietQR/Casso/SePay để xác nhận đơn hàng đã thanh toán.
// ============================================================================
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ecc.Infrastructure.Data;
using Ecc.Infrastructure.Entities;
using Ecc.WebApi.Services;
using System.Text.RegularExpressions;

namespace Ecc.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentWebhookController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IMoMoPaymentService _momoService;
    private readonly ILogger<PaymentWebhookController> _logger;

    public PaymentWebhookController(
        AppDbContext context,
        IMoMoPaymentService momoService,
        ILogger<PaymentWebhookController> logger)
    {
        _context = context;
        _momoService = momoService;
        _logger = logger;
    }

    /// <summary>
    /// Webhook tiếp nhận biến động số dư từ SePay / Casso / PayOS / Ngân hàng
    /// Endpoint: POST api/PaymentWebhook
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> ReceiveWebhook([FromBody] BankTransferWebhookDto dto)
    {
        _logger.LogInformation("Nhận webhook thanh toán: Gateway={Gateway}, Amount={Amount}, Content={Content}",
            dto.Gateway, dto.TransferAmount, dto.Content);

        var searchContent = dto.Content ?? dto.Description ?? dto.Code ?? "";
        if (string.IsNullOrWhiteSpace(searchContent))
        {
            return BadRequest(new { success = false, message = "Nội dung giao dịch trống." });
        }

        // Tìm mã đơn hàng từ nội dung chuyển khoản (Regex DH\d+ hoặc số đơn)
        string? matchedOrderCode = null;
        long? matchedOrderId = null;

        var codeMatch = Regex.Match(searchContent, @"DH[_-]?(\d+)", RegexOptions.IgnoreCase);
        if (codeMatch.Success)
        {
            matchedOrderCode = codeMatch.Value.ToUpper();
            // Chuẩn hóa thành dạng DHxxxx nếu nội dung có gạch nối
            if (long.TryParse(codeMatch.Groups[1].Value, out var numId))
            {
                matchedOrderId = numId;
            }
        }
        else
        {
            // Thử bắt dãy số đơn thuần (nếu khách chỉ gõ OrderId)
            var numMatch = Regex.Match(searchContent, @"\b(\d{3,8})\b");
            if (numMatch.Success && long.TryParse(numMatch.Value, out var id))
            {
                matchedOrderId = id;
            }
        }

        // Tìm đơn hàng trong Database
        Order? order = null;
        if (!string.IsNullOrEmpty(matchedOrderCode))
        {
            order = await _context.Orders
                .Include(o => o.Customer)
                .FirstOrDefaultAsync(o => o.OrderCode == matchedOrderCode);
        }

        if (order == null && matchedOrderId.HasValue)
        {
            order = await _context.Orders
                .Include(o => o.Customer)
                .FirstOrDefaultAsync(o => o.OrderId == matchedOrderId.Value || o.OrderCode == $"DH{matchedOrderId.Value}");
        }

        if (order == null)
        {
            _logger.LogWarning("Không tìm thấy đơn hàng tương ứng với nội dung: {Content}", searchContent);
            return NotFound(new { success = false, message = "Không tìm thấy đơn hàng tương ứng với nội dung chuyển khoản." });
        }

        // Nếu đơn hàng đã được đánh dấu là đã thanh toán
        if (order.PaymentStatus == "Paid")
        {
            return Ok(new { success = true, message = "Đơn hàng này đã được xác nhận thanh toán trước đó.", orderId = order.OrderId, orderCode = order.OrderCode });
        }

        // Cập nhật trạng thái thanh toán
        order.PaymentStatus = "Paid";
        if (order.OrderStatus == "Pending" || string.IsNullOrEmpty(order.OrderStatus))
        {
            order.OrderStatus = "Confirmed";
        }
        order.UpdatedAt = DateTime.Now;

        // Tạo thông báo cho khách hàng
        try
        {
            _context.Notifications.Add(new Notification
            {
                UserId = order.CustomerId,
                Type = "ORDER",
                Title = "Thanh toán thành công!",
                Message = $"Đơn hàng #{order.OrderCode} đã thanh toán thành công số tiền {order.TotalAmount:N0}đ. Người bán đang chuẩn bị giao hàng.",
                ReferenceId = order.OrderId.ToString(),
                IsRead = false,
                CreatedAt = DateTime.Now
            });
        }
        catch (Exception ex)
        {
            _logger.LogWarning("Lỗi khi thêm thông báo đơn hàng: {Message}", ex.Message);
        }

        await _context.SaveChangesAsync();
        _logger.LogInformation("Đã cập nhật đơn hàng #{OrderCode} (ID: {OrderId}) thành Paid!", order.OrderCode, order.OrderId);

        return Ok(new
        {
            success = true,
            message = $"Đã xác nhận thanh toán thành công đơn hàng #{order.OrderCode}",
            orderId = order.OrderId,
            orderCode = order.OrderCode,
            amount = order.TotalAmount
        });
    }

    /// <summary>
    /// Tiếp nhận IPN Webhook từ MoMo khi khách hoàn tất giao dịch
    /// Endpoint: POST api/PaymentWebhook/momo
    /// </summary>
    [HttpPost("momo")]
    public async Task<IActionResult> ReceiveMomoIpn([FromBody] MoMoIpnRequest ipn)
    {
        _logger.LogInformation("Nhận MoMo IPN: OrderId={OrderId}, TransId={TransId}, Amount={Amount}, ResultCode={Code}",
            ipn.OrderId, ipn.TransId, ipn.Amount, ipn.ResultCode);

        // 1. Kiểm tra chữ ký HMAC SHA256
        if (!_momoService.VerifySignature(ipn))
        {
            _logger.LogWarning("Chữ ký MoMo IPN không hợp lệ: {OrderId}", ipn.OrderId);
            return BadRequest(new { message = "Chữ ký không hợp lệ (Invalid signature)" });
        }

        // 2. Tìm đơn hàng tương ứng theo MomoOrderId hoặc OrderCode
        var order = await _context.Orders
            .Include(o => o.Customer)
            .FirstOrDefaultAsync(o => o.MomoOrderId == ipn.OrderId || o.OrderCode == ipn.OrderId || ipn.OrderId.StartsWith(o.OrderCode));

        if (order == null)
        {
            // Thử trích xuất OrderCode từ chuỗi dạng DH-xxxx_timestamp
            var codeMatch = Regex.Match(ipn.OrderId ?? "", @"DH[_-]?(\d+)", RegexOptions.IgnoreCase);
            if (codeMatch.Success)
            {
                var cleanCode = codeMatch.Value.ToUpper();
                order = await _context.Orders
                    .Include(o => o.Customer)
                    .FirstOrDefaultAsync(o => o.OrderCode == cleanCode);
            }
        }

        if (order == null)
        {
            _logger.LogWarning("Không tìm thấy đơn hàng cho MoMo IPN: {OrderId}", ipn.OrderId);
            return NotFound(new { message = "Không tìm thấy đơn hàng tương ứng." });
        }

        // 3. Xử lý Idempotent: Nếu đơn đã được xác nhận thanh toán trước đó
        if (order.PaymentStatus == "Paid")
        {
            return NoContent();
        }

        // 4. Kiểm tra số tiền thanh toán có khớp với tổng đơn hàng
        long expectedAmount = (long)Math.Round(order.TotalAmount);
        if (ipn.Amount != expectedAmount)
        {
            _logger.LogWarning("Số tiền MoMo ({Actual}) không khớp với đơn hàng #{OrderCode} ({Expected})",
                ipn.Amount, order.OrderCode, expectedAmount);
            return BadRequest(new { message = "Số tiền thanh toán không khớp giá trị đơn hàng." });
        }

        // 5. Cập nhật trạng thái đơn hàng khi giao dịch MoMo thành công (ResultCode = 0)
        if (ipn.ResultCode == 0)
        {
            order.PaymentStatus = "Paid";
            order.MomoTransId = ipn.TransId.ToString();
            if (order.OrderStatus == "Pending" || string.IsNullOrEmpty(order.OrderStatus))
            {
                order.OrderStatus = "Confirmed";
            }
            order.UpdatedAt = DateTime.Now;

            try
            {
                _context.Notifications.Add(new Notification
                {
                    UserId = order.CustomerId,
                    Type = "ORDER",
                    Title = "Thanh toán MoMo thành công!",
                    Message = $"Đơn hàng #{order.OrderCode} đã thanh toán thành công qua MoMo ({order.TotalAmount:N0}đ). Người bán đang chuẩn bị giao hàng.",
                    ReferenceId = order.OrderId.ToString(),
                    IsRead = false,
                    CreatedAt = DateTime.Now
                });
            }
            catch (Exception ex)
            {
                _logger.LogWarning("Lỗi khi thêm thông báo đơn hàng MoMo: {Message}", ex.Message);
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation("Đã cập nhật đơn hàng #{OrderCode} thành Paid qua MoMo (TransId: {TransId})",
                order.OrderCode, ipn.TransId);
        }
        else
        {
            _logger.LogWarning("Giao dịch MoMo đơn hàng #{OrderCode} không thành công: ResultCode={Code}, Message={Msg}",
                order.OrderCode, ipn.ResultCode, ipn.Message);
        }

        // Chuẩn phản hồi IPN của MoMo: HTTP 204 No Content
        return NoContent();
    }

    /// <summary>
    /// Kiểm tra trạng thái thanh toán thời gian thực cho Mobile App Polling
    /// Endpoint: GET api/PaymentWebhook/status/{orderId}
    /// </summary>
    [HttpGet("status/{orderId}")]
    public async Task<IActionResult> GetPaymentStatus(long orderId)
    {
        var order = await _context.Orders
            .FirstOrDefaultAsync(o => o.OrderId == orderId);

        if (order == null)
        {
            return NotFound(new { success = false, message = "Không tìm thấy đơn hàng." });
        }

        bool isPaid = string.Equals(order.PaymentStatus, "Paid", StringComparison.OrdinalIgnoreCase);
        bool isCancelled = string.Equals(order.OrderStatus, "Cancelled", StringComparison.OrdinalIgnoreCase);

        // Tính thời gian còn lại (15 phút từ lúc CreatedAt)
        var createdAt = order.CreatedAt ?? DateTime.Now;
        var elapsedSeconds = (int)(DateTime.Now - createdAt).TotalSeconds;
        var remainingSeconds = Math.Max(0, 15 * 60 - elapsedSeconds);
        bool isExpired = remainingSeconds <= 0 && !isPaid;

        // Nếu quá 15 phút chưa thanh toán và đang Pending (không phải COD), tự động hủy đơn ngay
        if (isExpired && !isCancelled && order.PaymentMethod != "COD")
        {
            order.OrderStatus = "Cancelled";
            order.UpdatedAt = DateTime.Now;
            await _context.SaveChangesAsync();
            isCancelled = true;
        }

        return Ok(new
        {
            success = true,
            orderId = order.OrderId,
            orderCode = order.OrderCode,
            paymentMethod = order.PaymentMethod,
            paymentStatus = order.PaymentStatus,
            orderStatus = order.OrderStatus,
            totalAmount = order.TotalAmount,
            createdAt = order.CreatedAt,
            isPaid = isPaid,
            isCancelled = isCancelled,
            isExpired = isExpired,
            remainingSeconds = remainingSeconds
        });
    }

    /// <summary>
    /// Endpoint giả lập Webhook để test ngay lập tức trên Swagger / Postman / Mobile App
    /// Endpoint: POST api/PaymentWebhook/simulate
    /// </summary>
    [HttpPost("simulate")]
    public async Task<IActionResult> SimulateTransfer([FromBody] SimulateTransferDto dto)
    {
        Order? order = null;

        if (!string.IsNullOrEmpty(dto.OrderCode))
        {
            order = await _context.Orders
                .Include(o => o.Customer)
                .FirstOrDefaultAsync(o => o.OrderCode == dto.OrderCode);
        }

        if (order == null && dto.OrderId.HasValue)
        {
            order = await _context.Orders
                .Include(o => o.Customer)
                .FirstOrDefaultAsync(o => o.OrderId == dto.OrderId.Value);
        }

        if (order == null)
        {
            return NotFound(new { success = false, message = "Không tìm thấy đơn hàng cần mô phỏng thanh toán." });
        }

        order.PaymentStatus = "Paid";
        if (order.OrderStatus == "Pending" || string.IsNullOrEmpty(order.OrderStatus))
        {
            order.OrderStatus = "Confirmed";
        }
        order.UpdatedAt = DateTime.Now;

        try
        {
            _context.Notifications.Add(new Notification
            {
                UserId = order.CustomerId,
                Type = "ORDER",
                Title = "Thanh toán thành công!",
                Message = $"Đơn hàng #{order.OrderCode} đã được thanh toán thành công ({order.TotalAmount:N0}đ).",
                ReferenceId = order.OrderId.ToString(),
                IsRead = false,
                CreatedAt = DateTime.Now
            });
        }
        catch { }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            success = true,
            message = $"[Simulate Webhook] Đơn hàng #{order.OrderCode} đã chuyển sang trạng thái Paid!",
            orderId = order.OrderId,
            orderCode = order.OrderCode,
            totalAmount = order.TotalAmount,
            isPaid = true
        });
    }
}

public class BankTransferWebhookDto
{
    public long? Id { get; set; }
    public string? Gateway { get; set; } // MBBank, VCB, Techcombank,...
    public string? TransactionDate { get; set; }
    public string? AccountNumber { get; set; }
    public string? Code { get; set; }
    public string? Content { get; set; } // Ví dụ: "DH1002 chuyen tien"
    public string? Description { get; set; }
    public string? TransferType { get; set; } // "in"
    public decimal TransferAmount { get; set; }
    public string? ReferenceCode { get; set; }
}

public class SimulateTransferDto
{
    public long? OrderId { get; set; }
    public string? OrderCode { get; set; }
    public decimal? Amount { get; set; }
}
