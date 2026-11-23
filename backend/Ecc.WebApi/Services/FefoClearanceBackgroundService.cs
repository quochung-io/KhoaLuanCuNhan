// ============================================================================
// TỆP MÃ NGUỒN: backend/Ecc.WebApi/Services/FefoClearanceBackgroundService.cs
// MÔ TẢ: Dịch vụ chạy ngầm (Background Service) tự động đồng bộ hạn sử dụng lô hàng, quét lô cận hạn theo nguyên tắc FEFO và áp dụng mức giảm giá xả kho tự động.
// ============================================================================
using Microsoft.EntityFrameworkCore;
using Ecc.Infrastructure.Data;
using Ecc.Infrastructure.Entities;

namespace Ecc.WebApi.Services;

/// <summary>
/// Background Service tự động kiểm tra, gia hạn các lô hàng mẫu luôn còn hạn sử dụng
/// và duy trì 10 sản phẩm cận hạn (FEFO Auto-Pilot) để hiển thị chương trình giảm giá xả kho trên Web/App.
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

        // Chạy lần đầu ngay sau khi server vừa bật
        await Task.Delay(TimeSpan.FromSeconds(2), stoppingToken);

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

    /// <summary>
    /// Đảm bảo 100% lô hàng đều còn hạn sử dụng (Active) và có đúng 10 sản phẩm nông sản cận date (1-5 ngày) được giảm giá 20%-50%.
    /// </summary>
    public async Task<int> RunAutoMarkdownAsync()
    {
        using var scope = _scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var today = DateTime.Today;

        var products = await context.Products
            .Include(p => p.ProductBatches)
            .OrderByDescending(p => p.ProductId)
            .ToListAsync();

        var defaultFarmId = await context.Farms.Select(f => f.FarmId).FirstOrDefaultAsync();
        if (defaultFarmId <= 0) defaultFarmId = 1;

        var nonComboProducts = products
            .Where(p => p.CategoryId != 5 && !(p.ProductName ?? "").Contains("Combo", StringComparison.OrdinalIgnoreCase))
            .ToList();

        // Chọn 10 sản phẩm nông sản lẻ tiêu biểu (6 sản phẩm đầu danh sách + 4 sản phẩm chủ lực ID 1..4) để thiết lập lô cận date (1 -> 5 ngày)
        var nearExpiryTargets = nonComboProducts
            .OrderByDescending(p => p.ProductId)
            .Take(6)
            .Concat(nonComboProducts.OrderBy(p => p.ProductId).Take(4))
            .Select(p => p.ProductId)
            .Distinct()
            .Take(10)
            .ToList();

        var nearExpirySet = new HashSet<long>(nearExpiryTargets);

        // Bảng phân bổ số ngày cận hạn cho 10 sản phẩm (1 ngày: -50%, 2 ngày: -40%, 3 ngày: -30%, 4-5 ngày: -20%)
        int[] nearExpiryDaysPattern = new[] { 1, 2, 3, 4, 1, 2, 3, 4, 3, 5 };

        for (int i = 0; i < products.Count; i++)
        {
            var p = products[i];

            // Nếu sản phẩm chưa có lô hàng nào thì tự động khởi tạo 1 lô hàng còn hạn
            if (p.ProductBatches == null || !p.ProductBatches.Any())
            {
                var newBatch = new ProductBatch
                {
                    ProductId = p.ProductId,
                    FarmId = defaultFarmId,
                    BatchCode = $"LOT-VN-{p.ProductId:D4}",
                    HarvestDate = today.AddDays(-2),
                    ReceivedDate = today.AddDays(-1),
                    ExpiryDate = today.AddDays(20 + (int)(p.ProductId % 15)),
                    InitialQuantity = 85,
                    Unit = string.IsNullOrWhiteSpace(p.Unit) ? "kg" : p.Unit,
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow
                };
                context.ProductBatches.Add(newBatch);
                p.ProductBatches = new List<ProductBatch> { newBatch };
            }

            bool isNearTarget = nearExpirySet.Contains(p.ProductId);

            if (isNearTarget)
            {
                int idx = nearExpiryTargets.IndexOf(p.ProductId);
                int daysLeft = nearExpiryDaysPattern[idx % nearExpiryDaysPattern.Length];
                var targetExpiry = today.AddDays(daysLeft);

                var orderedBatches = p.ProductBatches.OrderBy(b => b.BatchId).ToList();
                for (int bIdx = 0; bIdx < orderedBatches.Count; bIdx++)
                {
                    var b = orderedBatches[bIdx];
                    b.Status = "Active";
                    if (b.InitialQuantity <= 0) b.InitialQuantity = 45;
                    b.HarvestDate = today.AddDays(-4);
                    b.ReceivedDate = today.AddDays(-3);
                    // Lô đầu tiên mang hạn cận date (1-5 ngày), các lô phụ (nếu có) mang hạn xa hơn để FEFO chọn lô đầu tiên
                    b.ExpiryDate = bIdx == 0 ? targetExpiry : today.AddDays(15 + bIdx * 5);
                }
            }
            else
            {
                // Tất cả các sản phẩm còn lại: Đảm bảo 100% lô hàng đều còn hạn sử dụng dài (14 - 35 ngày) và còn tồn kho
                foreach (var b in p.ProductBatches)
                {
                    b.Status = "Active";
                    if (b.InitialQuantity <= 0) b.InitialQuantity = 90;
                    var diff = (b.ExpiryDate.Date - today).Days;
                    if (diff <= 5)
                    {
                        b.HarvestDate = today.AddDays(-2);
                        b.ReceivedDate = today.AddDays(-1);
                        b.ExpiryDate = today.AddDays(14 + (int)(b.BatchId % 20));
                    }
                }
            }
        }

        await context.SaveChangesAsync();

        // 2. Tính toán và đồng bộ giá giảm FEFO cho toàn bộ sản phẩm
        int updatedCount = 0;

        foreach (var p in products)
        {
            var activeBatches = p.ProductBatches
                .Where(b => (b.Status == "Active" || string.IsNullOrEmpty(b.Status)) && b.InitialQuantity > 0)
                .OrderBy(b => b.ExpiryDate)
                .ToList();

            if (!activeBatches.Any()) continue;

            var nearestBatch = activeBatches.First();
            var diffDays = (nearestBatch.ExpiryDate.Date - today).Days;

            if (diffDays >= 0 && diffDays <= 5)
            {
                int recommendedDiscount = diffDays <= 1 ? 50 : diffDays <= 2 ? 40 : diffDays <= 3 ? 30 : 20;

                if (!p.OriginalPrice.HasValue || p.OriginalPrice.Value <= 0)
                {
                    p.OriginalPrice = p.Price;
                }

                decimal original = p.OriginalPrice.Value;
                decimal targetPrice = Math.Round(original * (100 - recommendedDiscount) / 100m, 0);

                if (p.DiscountPercent != recommendedDiscount || p.Price != targetPrice)
                {
                    p.DiscountPercent = recommendedDiscount;
                    p.Price = targetPrice;
                    p.UpdatedAt = DateTime.UtcNow;
                    updatedCount++;
                }
            }
            else if (diffDays > 5)
            {
                // Sản phẩm còn hạn dài: khôi phục về giá gốc (không giảm giá cận hạn)
                if (p.DiscountPercent.HasValue && p.DiscountPercent.Value > 0)
                {
                    if (p.OriginalPrice.HasValue && p.OriginalPrice.Value > 0)
                    {
                        p.Price = p.OriginalPrice.Value;
                    }
                    p.DiscountPercent = 0;
                    p.UpdatedAt = DateTime.UtcNow;
                    updatedCount++;
                }
            }
        }

        await context.SaveChangesAsync();

        if (context.Database.IsSqlite())
        {
            await context.Database.ExecuteSqlRawAsync("PRAGMA wal_checkpoint(TRUNCATE);");
        }

        _logger.LogInformation($"FEFO Auto Markdown hoàn tất: 100% lô hàng còn hạn, 10 sản phẩm cận date đang giảm giá (Cập nhật {updatedCount} sản phẩm).");
        return updatedCount;
    }
}
