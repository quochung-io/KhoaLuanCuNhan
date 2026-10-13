using Microsoft.EntityFrameworkCore;
using Ecc.Infrastructure.Data;
using Ecc.Infrastructure.Entities;

namespace Ecc.WebApi.Services;

/// <summary>
/// Background Service tự động kiểm tra và hủy các đơn hàng chưa thanh toán quá hạn 15 phút
/// Chạy ngầm định kỳ mỗi 30 giây.
/// </summary>
public class OrderExpirationBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<OrderExpirationBackgroundService> _logger;
    private const int ExpirationMinutes = 15;

    public OrderExpirationBackgroundService(
        IServiceScopeFactory scopeFactory,
        ILogger<OrderExpirationBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("OrderExpirationBackgroundService đã khởi động (Quét hủy đơn quá hạn {Minutes} phút).", ExpirationMinutes);

        // Chờ 10 giây sau khi server khởi động
        await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CancelExpiredOrdersAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi xảy ra trong quá trình quét hủy đơn hàng hết hạn thanh toán.");
            }

            // Quét định kỳ mỗi 30 giây
            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
        }
    }

    public async Task<int> CancelExpiredOrdersAsync()
    {
        using var scope = _scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var cutoffTime = DateTime.Now.AddMinutes(-ExpirationMinutes);
        var cutoffTimeUtc = DateTime.UtcNow.AddMinutes(-ExpirationMinutes);

        // Lọc các đơn hàng chưa thanh toán, không phải COD, quá hạn 15 phút
        var expiredOrders = await context.Orders
            .Where(o => o.OrderStatus == "Pending"
                     && o.PaymentStatus != "Paid"
                     && o.PaymentMethod != "COD"
                     && o.CreatedAt.HasValue
                     && (o.CreatedAt.Value < cutoffTime || o.CreatedAt.Value < cutoffTimeUtc))
            .ToListAsync();

        if (!expiredOrders.Any()) return 0;

        foreach (var order in expiredOrders)
        {
            order.OrderStatus = "Cancelled";
            order.UpdatedAt = DateTime.Now;

            _logger.LogInformation("Tự động hủy đơn hàng #{OrderCode} (ID: {OrderId}) do quá thời hạn thanh toán {Minutes} phút.",
                order.OrderCode, order.OrderId, ExpirationMinutes);

            try
            {
                context.Notifications.Add(new Notification
                {
                    UserId = order.CustomerId,
                    Type = "ORDER",
                    Title = "Đơn hàng đã tự động hủy",
                    Message = $"Đơn hàng #{order.OrderCode} đã tự động hủy do quá thời gian thanh toán ({ExpirationMinutes} phút). Quý khách vui lòng đặt lại đơn mới nếu vẫn có nhu cầu.",
                    ReferenceId = order.OrderId.ToString(),
                    IsRead = false,
                    CreatedAt = DateTime.Now
                });
            }
            catch
            {
                // Bỏ qua nếu lỗi tạo notification
            }
        }

        await context.SaveChangesAsync();
        return expiredOrders.Count;
    }
}
