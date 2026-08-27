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
    public async Task<ActionResult<IEnumerable<ProductBatch>>> GetProductBatches()
    {
        return await _context.ProductBatches
            .Include(b => b.Product)
            .Include(b => b.Supplier)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductBatch>> GetProductBatch(int id)
    {
        var batch = await _context.ProductBatches
            .Include(b => b.Product)
            .Include(b => b.Supplier)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (batch == null) return NotFound();
        return batch;
    }

    [HttpPost]
    public async Task<ActionResult<ProductBatch>> CreateProductBatch(ProductBatch batch)
    {
        _context.ProductBatches.Add(batch);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetProductBatch), new { id = batch.Id }, batch);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProductBatch(int id, ProductBatch batch)
    {
        if (id != batch.Id) return BadRequest();
        _context.Entry(batch).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.ProductBatches.Any(e => e.Id == id)) return NotFound();
            throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProductBatch(int id)
    {
        var batch = await _context.ProductBatches.FindAsync(id);
        if (batch == null) return NotFound();

        _context.ProductBatches.Remove(batch);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
