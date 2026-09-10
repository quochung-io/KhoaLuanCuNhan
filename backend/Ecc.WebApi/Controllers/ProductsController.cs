using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ecc.Infrastructure.Data;
using Ecc.Infrastructure.Entities;

namespace Ecc.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProductsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts(
        [FromQuery] string? search,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice)
    {
        var query = _context.Products
            .Include(p => p.Category)
            .Include(p => p.ProductImages)
            .AsQueryable();

        // 1. Tìm kiếm theo tên
        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(p => p.ProductName.Contains(search));
        }

        // 2. Lọc theo khoảng giá
        if (minPrice.HasValue)
        {
            query = query.Where(p => p.Price >= minPrice.Value);
        }

        if (maxPrice.HasValue)
        {
            query = query.Where(p => p.Price <= maxPrice.Value);
        }

        return await query.ToListAsync();
    }

    [HttpGet("autocomplete")]
    public async Task<ActionResult<IEnumerable<object>>> GetAutocompleteSuggestions([FromQuery] string prefix)
    {
        if (string.IsNullOrEmpty(prefix))
        {
            return BadRequest("Prefix query parameter is required.");
        }

        // Tìm các sản phẩm có tên chứa prefix và lấy thông tin cơ bản kèm ảnh
        var suggestions = await _context.Products
            .Include(p => p.ProductImages)
            .Where(p => p.ProductName.Contains(prefix))
            .Select(p => new {
                ProductId = p.ProductId,
                ProductName = p.ProductName,
                Price = p.Price,
                Unit = p.Unit,
                ImageUrl = p.ProductImages.OrderBy(img => img.SortOrder).Select(img => img.ImageUrl).FirstOrDefault()
            })
            .Take(5)
            .ToListAsync();

        return Ok(suggestions);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Product>> GetProduct(long id)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.ProductImages)
            .FirstOrDefaultAsync(p => p.ProductId == id);

        if (product == null) return NotFound();
        return product;
    }

    [HttpPost]
    public async Task<ActionResult<Product>> CreateProduct(Product product)
    {
        _context.Products.Add(product);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetProduct), new { id = product.ProductId }, product);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(long id, Product product)
    {
        if (id != product.ProductId) return BadRequest();
        _context.Entry(product).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Products.Any(e => e.ProductId == id)) return NotFound();
            throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(long id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound();

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
