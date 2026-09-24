using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ecc.Infrastructure.Data;
using Ecc.Infrastructure.Entities;

namespace Ecc.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductBatchesController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProductBatchesController(AppDbContext context)
    {
        _context = context;
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
}
