using Microsoft.EntityFrameworkCore;
using Ecc.Infrastructure.Data;

namespace Ecc.WebApi.Services;

/// <summary>
/// Background Service tự động kiểm tra và áp dụng giảm giá xả hàng cận hạn (FEFO Auto-Pilot)
/// Tự động chạy khi ứng dụng khởi động và định kỳ mỗi 30 phút.
/// </summary>
public class FefoClearanceBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<FefoClearanceBackgroundService> _logger;

    public FefoClearanceBackgroundService(
        IServiceScopeFactory scopeFactory,
        ILogger<FefoClearanceBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("FefoClearanceBackgroundService đã khởi động.");

        // Chạy lần đầu sau 5 giây khi server vừa bật
        await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await RunAutoMarkdownAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi xảy ra trong quá trình chạy tự động FEFO Auto Markdown.");
            }

            // Quét định kỳ mỗi 30 phút
            await Task.Delay(TimeSpan.FromMinutes(30), stoppingToken);
        }
    }

    public async Task<int> RunAutoMarkdownAsync()
    {
        using var scope = _scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var today = DateTime.Today;

        // 1. Tự động chuyển các lô hết hạn sang Expired
        var expiredBatches = await context.ProductBatches
            .Where(b => b.ExpiryDate < today && b.Status != "Expired")
            .ToListAsync();

        foreach (var b in expiredBatches)
        {
            b.Status = "Expired";
        }

        // 2. Lấy danh sách sản phẩm và các lô hàng
        var products = await context.Products
            .Include(p => p.ProductBatches)
            .ToListAsync();

        int updatedCount = 0;

        foreach (var p in products)
        {
            // Các lô còn hàng và hoạt động
            var activeBatches = p.ProductBatches
                .Where(b => (b.Status == "Active" || string.IsNullOrEmpty(b.Status)) && b.InitialQuantity > 0)
                .OrderBy(b => b.ExpiryDate)
                .ToList();

            if (!activeBatches.Any())
            {
                // Nếu không còn lô nào hoặc đã hết hàng
                continue;
            }

            var nearestBatch = activeBatches.First();
            var diffDays = (nearestBatch.ExpiryDate.Date - today).Days;

            // Kiểm tra nếu sản phẩm có lô cận hạn (0 - 5 ngày)
            if (diffDays >= 0 && diffDays <= 5)
            {
                int recommendedDiscount;
                if (diffDays <= 1)
                {
                    recommendedDiscount = 50; // Cận hạn khẩn cấp
                }
                else if (diffDays <= 2)
                {
                    recommendedDiscount = 40;
                }
                else if (diffDays <= 3)
                {
                    recommendedDiscount = 30;
                }
                else
                {
                    recommendedDiscount = 20; // 4-5 ngày
                }

                // Lưu giá gốc nếu chưa có
                if (!p.OriginalPrice.HasValue || p.OriginalPrice.Value <= 0)
                {
                    p.OriginalPrice = p.Price;
                }

                decimal original = p.OriginalPrice.Value;
                decimal targetPrice = Math.Round(original * (100 - recommendedDiscount) / 100m, 0);

                // Cập nhật nếu có sự thay đổi
                if (p.DiscountPercent != recommendedDiscount || p.Price != targetPrice)
                {
                    p.DiscountPercent = recommendedDiscount;
                    p.Price = targetPrice;
                    p.UpdatedAt = DateTime.UtcNow;
                    updatedCount++;
                }
            }
            else if (diffDays > 5 && p.DiscountPercent.HasValue && p.DiscountPercent.Value > 0 && p.OriginalPrice.HasValue && p.OriginalPrice.Value > 0)
            {
                // Nếu lô cận hạn trước đó đã bán hết và lô mới nhất còn > 5 ngày: Tự động khôi phục giá gốc!
                p.Price = p.OriginalPrice.Value;
                p.DiscountPercent = 0;
                p.UpdatedAt = DateTime.UtcNow;
                updatedCount++;
            }
        }

        await context.SaveChangesAsync();
        _logger.LogInformation($"FEFO Auto Markdown hoàn tất: Đã cập nhật/đồng bộ {updatedCount} sản phẩm.");
        return updatedCount;
    }
}
