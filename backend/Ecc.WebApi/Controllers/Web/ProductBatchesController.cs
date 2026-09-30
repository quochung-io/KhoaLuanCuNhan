using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ecc.Infrastructure.Data;
using Ecc.Infrastructure.Entities;

using Ecc.WebApi.Services;

namespace Ecc.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductBatchesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly FefoClearanceBackgroundService _clearanceService;

    public ProductBatchesController(AppDbContext context, FefoClearanceBackgroundService clearanceService)
    {
        _context = context;
        _clearanceService = clearanceService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductBatch>>> GetProductBatches([FromQuery] long? productId = null)
    {
        var query = _context.ProductBatches.Include(b => b.Product).AsQueryable();
        if (productId.HasValue)
        {
            query = query.Where(b => b.ProductId == productId.Value);
        }
        return await query.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductBatch>> GetProductBatch(long id)
    {
        var batch = await _context.ProductBatches
            .Include(b => b.Product)
            .FirstOrDefaultAsync(b => b.BatchId == id);

        if (batch == null) return NotFound();
        return batch;
    }

    [HttpPost]
    public async Task<ActionResult<ProductBatch>> CreateProductBatch(ProductBatch batch)
    {
        if (batch.ExpiryDate <= batch.HarvestDate)
        {
            return BadRequest(new { message = "Hạn sử dụng phải sau ngày thu hoạch ít nhất 1 ngày!" });
        }

        if (string.IsNullOrWhiteSpace(batch.BatchCode))
        {
            batch.BatchCode = $"LHN-{DateTime.Now:yyyyMMdd}-{new Random().Next(1000, 9999)}";
        }
        else
        {
            if (await _context.ProductBatches.AnyAsync(b => b.BatchCode == batch.BatchCode))
            {
                return BadRequest(new { message = $"Mã lô hàng '{batch.BatchCode}' đã tồn tại trên hệ thống!" });
            }
        }

        if (batch.FarmId > 0)
        {
            var farmExists = await _context.Farms.AnyAsync(f => f.FarmId == batch.FarmId);
            if (!farmExists)
            {
                var farmBySup = await _context.Farms.FirstOrDefaultAsync(f => f.SupplierId == batch.FarmId);
                if (farmBySup != null)
                {
                    batch.FarmId = farmBySup.FarmId;
                }
            }
        }

        batch.CreatedAt = DateTime.UtcNow;
        if (string.IsNullOrEmpty(batch.Status)) batch.Status = "Active";

        _context.ProductBatches.Add(batch);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetProductBatch), new { id = batch.BatchId }, batch);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProductBatch(long id, ProductBatch batch)
    {
        if (id != batch.BatchId) return BadRequest();

        if (batch.ExpiryDate <= batch.HarvestDate)
        {
            return BadRequest(new { message = "Hạn sử dụng phải sau ngày thu hoạch ít nhất 1 ngày!" });
        }

        var existing = await _context.ProductBatches.FindAsync(id);
        if (existing == null) return NotFound(new { message = "Không tìm thấy lô hàng." });

        existing.ProductId = batch.ProductId;
        existing.FarmId = batch.FarmId;
        existing.BatchCode = batch.BatchCode;
        existing.InitialQuantity = batch.InitialQuantity;
        existing.Unit = batch.Unit;
        existing.HarvestDate = batch.HarvestDate;
        existing.ExpiryDate = batch.ExpiryDate;
        existing.Status = batch.Status;

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProductBatch(long id)
    {
        var batch = await _context.ProductBatches.FindAsync(id);
        if (batch == null) return NotFound();

        _context.ProductBatches.Remove(batch);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // ── FEFO 1. Thống kê ma trận hạn sử dụng FEFO ──────────────────
    [HttpGet("fefo-summary")]
    public async Task<IActionResult> GetFefoSummary()
    {
        var today = DateTime.Today;
        var batches = await _context.ProductBatches
            .Include(b => b.Product)
            .ToListAsync();

        var safe = 0;
        var warning = 0;
        var urgent = 0;
        var expired = 0;

        foreach (var b in batches)
        {
            var diff = (b.ExpiryDate.Date - today).Days;
            if (diff < 0 || b.Status == "Expired")
            {
                expired++;
            }
            else if (diff <= 3)
            {
                urgent++;
            }
            else if (diff <= 5)
            {
                warning++;
            }
            else
            {
                safe++;
            }
        }

        return Ok(new
        {
            total = batches.Count,
            safe,
            warning,
            urgent,
            expired,
            scannedAt = DateTime.Now
        });
    }

    // ── FEFO 2. Tự động quét và khóa toàn bộ lô hàng đã hết hạn sử dụng ────
    [HttpPost("auto-scan-expired")]
    public async Task<IActionResult> AutoScanExpiredBatches()
    {
        var today = DateTime.Today;
        var expiredBatches = await _context.ProductBatches
            .Where(b => b.ExpiryDate < today && b.Status != "Expired")
            .ToListAsync();

        foreach (var b in expiredBatches)
        {
            b.Status = "Expired";
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = $"Đã tự động quét và khóa thành công {expiredBatches.Count} lô hàng hết hạn.",
            lockedCount = expiredBatches.Count
        });
    }

    // ── FEFO 3. Xuất hủy / Tiêu hủy lô hàng hết hạn (Write-off) ────
    [HttpPost("{id}/write-off")]
    public async Task<IActionResult> WriteOffBatch(long id, [FromBody] WriteOffRequest? req)
    {
        var batch = await _context.ProductBatches.Include(b => b.Product).FirstOrDefaultAsync(b => b.BatchId == id);
        if (batch == null) return NotFound(new { message = "Không tìm thấy lô hàng." });

        batch.Status = "Expired";
        batch.InitialQuantity = 0; // Đưa tồn kho vật lý về 0

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = $"Đã xuất hủy thành công lô hàng {batch.BatchCode}. Lý do: {req?.Reason ?? "Hết hạn sử dụng"}.",
            batchId = id,
            status = batch.Status
        });
    }

    // ── FEFO 4. Lấy danh sách nông sản cận hạn cần kích hoạt khuyến mãi xả hàng (Clearance Candidates) ──
    [HttpGet("clearance-candidates")]
    public async Task<IActionResult> GetClearanceCandidates()
    {
        var today = DateTime.Today;
        var products = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.ProductBatches)
            .Where(p => p.ProductBatches.Any(b => (b.Status == "Active" || string.IsNullOrEmpty(b.Status)) && b.InitialQuantity > 0))
            .ToListAsync();

        var candidates = new List<object>();

        foreach (var p in products)
        {
            var validBatches = p.ProductBatches
                .Where(b => (b.Status == "Active" || string.IsNullOrEmpty(b.Status)) && b.InitialQuantity > 0)
                .OrderBy(b => b.ExpiryDate)
                .ToList();

            if (!validBatches.Any()) continue;

            var nearestBatch = validBatches.First();
            var diffDays = (nearestBatch.ExpiryDate.Date - today).Days;

            // Chỉ xét các lô cận hạn <= 5 ngày (và chưa bị quá hạn < 0 ngày)
            if (diffDays >= 0 && diffDays <= 5)
            {
                int recommendedDiscount;
                string urgencyLevel;
                string suggestionNote;

                if (diffDays <= 1)
                {
                    recommendedDiscount = 50;
                    urgencyLevel = "Urgent";
                    suggestionNote = "Cận hạn khẩn cấp (≤ 1 ngày). Xả gấp 50% để thu hồi tối đa chi phí trước khi phải xuất hủy.";
                }
                else if (diffDays <= 2)
                {
                    recommendedDiscount = 40;
                    urgencyLevel = "Urgent";
                    suggestionNote = "Cận hạn (2 ngày). Đề xuất Flash Sale giảm 40% kích cầu tiêu dùng trong ngày.";
                }
                else if (diffDays <= 3)
                {
                    recommendedDiscount = 30;
                    urgencyLevel = "Urgent";
                    suggestionNote = "Cận hạn (3 ngày). Đề xuất giảm 30% xả kho nhanh.";
                }
                else
                {
                    recommendedDiscount = 20;
                    urgencyLevel = "Warning";
                    suggestionNote = "Cần chú ý (4-5 ngày). Đề xuất giảm 20% giữ biên lợi nhuận mỏng.";
                }

                decimal basePrice = p.OriginalPrice.HasValue && p.OriginalPrice.Value > 0 ? p.OriginalPrice.Value : p.Price;
                decimal salePrice = Math.Round(basePrice * (100 - recommendedDiscount) / 100m, 0);

                candidates.Add(new
                {
                    productId = p.ProductId,
                    productName = p.ProductName,
                    unit = p.Unit,
                    categoryName = p.Category?.CategoryName ?? "Nông sản",
                    currentPrice = p.Price,
                    originalPrice = basePrice,
                    currentDiscountPercent = p.DiscountPercent ?? 0,
                    batchId = nearestBatch.BatchId,
                    batchCode = nearestBatch.BatchCode,
                    batchQuantity = nearestBatch.InitialQuantity,
                    expiryDate = nearestBatch.ExpiryDate,
                    daysRemaining = diffDays,
                    recommendedDiscountPercent = recommendedDiscount,
                    recommendedSalePrice = salePrice,
                    urgencyLevel,
                    suggestionNote,
                    isDiscountActive = p.DiscountPercent.HasValue && p.DiscountPercent.Value > 0
                });
            }
        }

        return Ok(candidates);
    }

    // ── FEFO 5. Áp dụng giảm giá xả hàng cận hạn cho sản phẩm ────
    [HttpPost("apply-clearance-discount")]
    public async Task<IActionResult> ApplyClearanceDiscount([FromBody] ApplyClearanceDiscountRequest req)
    {
        if (req == null || req.Items == null || !req.Items.Any())
        {
            return BadRequest(new { message = "Danh sách sản phẩm áp dụng giảm giá không hợp lệ." });
        }

        var productIds = req.Items.Select(i => i.ProductId).Distinct().ToList();
        var products = await _context.Products.Where(p => productIds.Contains(p.ProductId)).ToListAsync();

        int appliedCount = 0;
        foreach (var item in req.Items)
        {
            var p = products.FirstOrDefault(x => x.ProductId == item.ProductId);
            if (p == null) continue;

            if (!p.OriginalPrice.HasValue || p.OriginalPrice.Value <= 0)
            {
                p.OriginalPrice = p.Price;
            }

            int discount = Math.Clamp(item.DiscountPercent, 5, 90);
            p.DiscountPercent = discount;
            p.Price = Math.Round(p.OriginalPrice.Value * (100 - discount) / 100m, 0);
            p.UpdatedAt = DateTime.UtcNow;
            appliedCount++;
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = $"Đã áp dụng giảm giá xả hàng cận hạn thành công cho {appliedCount} sản phẩm.",
            appliedCount
        });
    }

    // ── FEFO 6. Khôi phục giá gốc ban đầu ────
    [HttpPost("revert-clearance-discount")]
    public async Task<IActionResult> RevertClearanceDiscount([FromBody] RevertDiscountRequest req)
    {
        if (req == null || req.ProductIds == null || !req.ProductIds.Any())
        {
            return BadRequest(new { message = "Danh sách sản phẩm không hợp lệ." });
        }

        var products = await _context.Products.Where(p => req.ProductIds.Contains(p.ProductId)).ToListAsync();
        int revertedCount = 0;

        foreach (var p in products)
        {
            if (p.OriginalPrice.HasValue && p.OriginalPrice.Value > 0)
            {
                p.Price = p.OriginalPrice.Value;
                p.DiscountPercent = 0;
                p.UpdatedAt = DateTime.UtcNow;
                revertedCount++;
            }
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = $"Đã khôi phục giá gốc thành công cho {revertedCount} sản phẩm.",
            revertedCount
        });
    }

    // ── FEFO 7. Kích hoạt quét tự động FEFO Auto Markdown tức thì ────
    [HttpPost("auto-sync-clearance")]
    public async Task<IActionResult> AutoSyncClearance()
    {
        var count = await _clearanceService.RunAutoMarkdownAsync();
        return Ok(new
        {
            message = $"Đã tự động rà quét và đồng bộ khuyến mãi xả hàng cho {count} sản phẩm cận hạn.",
            syncedCount = count
        });
    }
}

public class WriteOffRequest
{
    public string? Reason { get; set; } = "Hết hạn sử dụng";
}

public class ApplyClearanceDiscountRequest
{
    public List<ClearanceDiscountItem> Items { get; set; } = new();
}

public class ClearanceDiscountItem
{
    public long ProductId { get; set; }
    public int DiscountPercent { get; set; }
}

public class RevertDiscountRequest
{
    public List<long> ProductIds { get; set; } = new();
}
