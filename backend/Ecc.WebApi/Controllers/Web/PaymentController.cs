// ============================================================================
// TỆP MÃ NGUỒN: backend/Ecc.WebApi/Controllers/Web/PaymentController.cs
// MÔ TẢ: Controller khởi tạo giao dịch thanh toán trực tuyến (Ví MoMo, VietQR ngân hàng) và kiểm tra trạng thái thanh toán.
// ============================================================================
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ecc.Infrastructure.Data;
using Ecc.Infrastructure.Entities;
using Ecc.WebApi.Services;

namespace Ecc.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IMoMoPaymentService _momoService;
    private readonly ILogger<PaymentController> _logger;

    public PaymentController(
        AppDbContext context,
        IMoMoPaymentService momoService,
        ILogger<PaymentController> logger)
    {
        _context = context;
        _momoService = momoService;
        _logger = logger;
    }

    /// <summary>
    /// Tạo phiên giao dịch thanh toán MoMo (Môi trường Sandbox)
    /// Endpoint: POST api/Payment/momo/create
    /// </summary>
    [HttpPost("momo/create")]
    public async Task<IActionResult> CreateMomoPayment([FromBody] CreateMomoPaymentDto dto)
    {
        if (dto == null || dto.OrderId <= 0)
        {
            return BadRequest(new { success = false, message = "OrderId không hợp lệ." });
        }

        var order = await _context.Orders
            .Include(o => o.Customer)
            .FirstOrDefaultAsync(o => o.OrderId == dto.OrderId);

        if (order == null)
        {
            return NotFound(new { success = false, message = "Không tìm thấy đơn hàng." });
        }

        if (order.PaymentStatus == "Paid")
        {
            return BadRequest(new { success = false, message = "Đơn hàng này đã được thanh toán trước đó." });
        }

        if (order.OrderStatus == "Cancelled")
        {
            return BadRequest(new { success = false, message = "Đơn hàng này đã bị hủy, không thể thanh toán." });
        }

        try
        {
            var momoRes = await _momoService.CreatePaymentAsync(
                order.OrderId,
                order.OrderCode,
                order.TotalAmount,
                $"Thanh toán đơn hàng #{order.OrderCode}"
            );

            if (momoRes.ResultCode == 0)
            {
                order.PaymentMethod = "MoMo";
                order.MomoOrderId = momoRes.OrderId;
                order.MomoRequestId = momoRes.RequestId;
                order.UpdatedAt = DateTime.Now;
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    orderId = order.OrderId,
                    orderCode = order.OrderCode,
                    amount = order.TotalAmount,
                    payUrl = momoRes.PayUrl,
                    deeplink = momoRes.Deeplink,
                    qrCodeUrl = momoRes.QrCodeUrl,
                    momoOrderId = momoRes.OrderId,
                    momoRequestId = momoRes.RequestId
                });
            }

            _logger.LogWarning("Tạo giao dịch MoMo thất bại: {Message} (Code: {Code})", momoRes.Message, momoRes.ResultCode);
            return StatusCode(500, new
            {
                success = false,
                message = $"Không thể khởi tạo giao dịch MoMo: {momoRes.Message}",
                resultCode = momoRes.ResultCode
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi ngoại lệ khi tạo giao dịch MoMo cho đơn hàng #{OrderCode}", order.OrderCode);
            return StatusCode(500, new
            {
                success = false,
                message = "Lỗi kết nối tới cổng thanh toán MoMo.",
                error = ex.Message
            });
        }
    }
}

public class CreateMomoPaymentDto
{
    public long OrderId { get; set; }
}
