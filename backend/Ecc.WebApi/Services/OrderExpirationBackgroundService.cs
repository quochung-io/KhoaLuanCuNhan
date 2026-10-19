using Microsoft.EntityFrameworkCore;
using Ecc.Infrastructure.Data;
using Ecc.Infrastructure.Entities;

namespace Ecc.WebApi.Services;

/// <summary>
/// Background Service tự động kiểm tra và hủy các đơn hàng chưa thanh toán quá hạn (mặc định 15 phút)
/// Chạy định kỳ mỗi 30 giây:
/// - Lọc các đơn Pending, không phải COD, PaymentStatus != 'Paid', quá hạn.
/// - Chống race condition với Webhook bằng Database Transaction.
/// - Hoàn trả số lượng tồn kho theo lô hàng (FEFO Restore).
/// - Tạo thông báo hệ thống gửi đến khách hàng.
/// </summary>
public class OrderExpirationBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<OrderExpirationBackgroundService> _logger;

    public OrderExpirationBackgroundService(
        IServiceScopeFactory scopeFactory,
        IConfiguration configuration,
        ILogger<OrderExpirationBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _configuration = configuration;
        _logger = logger;
    }

    private int ExpirationMinutes => _configuration.GetValue<int>("PaymentSettings:OrderExpirationMinutes", 15);

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

        // Lấy danh sách ID các đơn hàng có thể đã quá hạn
        var candidateOrderIds = await context.Orders
            .Where(o => o.OrderStatus == "Pending"
                     && o.PaymentStatus != "Paid"
                     && o.PaymentMethod != "COD"
                     && o.CreatedAt.HasValue
                     && (o.CreatedAt.Value < cutoffTime || o.CreatedAt.Value < cutoffTimeUtc))
            .Select(o => o.OrderId)
            .ToListAsync();

        if (!candidateOrderIds.Any()) return 0;

        int cancelledCount = 0;

        foreach (var orderId in candidateOrderIds)
        {
            // Sử dụng Transaction cho từng đơn để chống race condition với Webhook thanh toán đồng thời
            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                var order = await context.Orders
                    .Include(o => o.OrderItems)
                    .FirstOrDefaultAsync(o => o.OrderId == orderId);

                if (order == null)
                {
                    await transaction.RollbackAsync();
                    continue;
                }

                // Race condition check: Nếu đơn vừa được thanh toán xong ở thread khác hoặc qua webhook
                if (order.PaymentStatus == "Paid" || order.OrderStatus == "Completed" || order.OrderStatus == "Confirmed")
                {
                    _logger.LogInformation("Đơn hàng #{OrderCode} đã thanh toán thành công, bỏ qua lệnh hủy tự động.", order.OrderCode);
                    await transaction.RollbackAsync();
                    continue;
                }

                if (order.OrderStatus == "Cancelled")
                {
                    await transaction.RollbackAsync();
                    continue;
                }

                // 1. Cập nhật trạng thái hủy
                order.OrderStatus = "Cancelled";
                order.UpdatedAt = DateTime.Now;

                // 2. Hoàn trả tồn kho cho các lô hàng tương ứng (FEFO Restore)
                foreach (var item in order.OrderItems)
                {
                    if (item.BatchId > 0 && item.Quantity > 0)
                    {
                        var batch = await context.ProductBatches.FindAsync(item.BatchId);
                        if (batch != null)
                        {
                            batch.InitialQuantity += item.Quantity;
                            if (batch.Status == "OutOfStock")
                            {
                                batch.Status = "Active";
                            }
                            _logger.LogInformation("Hoàn lại {Qty} vào lô #{BatchCode} (BatchId: {BatchId}) do đơn #{OrderCode} bị hủy.",
                                item.Quantity, batch.BatchCode, batch.BatchId, order.OrderCode);
                        }
                    }
                }

                // 3. Tạo thông báo cho khách hàng
                try
                {
                    context.Notifications.Add(new Notification
                    {
                        UserId = order.CustomerId,
                        Type = "ORDER",
                        Title = "Đơn hàng đã tự động hủy",
                        Message = $"Đơn hàng #{order.OrderCode} đã tự động hủy do quá thời gian thanh toán ({ExpirationMinutes} phút). Các sản phẩm đã được hoàn lại kho.",
                        ReferenceId = order.OrderId.ToString(),
                        IsRead = false,
                        CreatedAt = DateTime.Now
                    });
                }
                catch
                {
                    // Không chặn transaction nếu thông báo lỗi
                }

                await context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Tự động hủy đơn hàng #{OrderCode} (ID: {OrderId}) và hoàn kho thành công.",
                    order.OrderCode, order.OrderId);

                cancelledCount++;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Lỗi khi xử lý hủy đơn hàng ID {OrderId}", orderId);
            }
        }

        return cancelledCount;
    }
}
