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

    // GET: api/products?search=...&minPrice=...&maxPrice=...
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] decimal? minPrice, [FromQuery] decimal? maxPrice)
    {
        try
        {
            var query = _context.Products
                .Include(p => p.Category)
                .Include(p => p.ProductImages)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                string s = search.Trim().ToLower();
                query = query.Where(p => p.ProductName.ToLower().Contains(s) || (p.Description != null && p.Description.ToLower().Contains(s)));
            }

            if (minPrice.HasValue)
            {
                query = query.Where(p => p.Price >= minPrice.Value);
            }

            if (maxPrice.HasValue)
            {
                query = query.Where(p => p.Price <= maxPrice.Value);
            }

            var products = await query
                .OrderByDescending(p => p.ProductId)
                .ToListAsync();

            return Ok(products);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Lỗi khi tải danh sách sản phẩm: {ex.Message}" });
        }
    }

    // GET: api/products/autocomplete?prefix=...
    [HttpGet("autocomplete")]
    public async Task<IActionResult> Autocomplete([FromQuery] string prefix)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(prefix))
            {
                return Ok(new List<object>());
            }

            string p = prefix.Trim().ToLower();
            var matches = await _context.Products
                .Include(prod => prod.ProductImages)
                .Where(prod => prod.ProductName.ToLower().Contains(p))
                .Take(6)
                .Select(prod => new
                {
                    productId = prod.ProductId,
                    productName = prod.ProductName,
                    price = prod.Price,
                    unit = prod.Unit,
                    imageUrl = prod.ProductImages.Where(img => img.IsPrimary).Select(img => img.ImageUrl).FirstOrDefault() 
                               ?? prod.ProductImages.Select(img => img.ImageUrl).FirstOrDefault() 
                               ?? ""
                })
                .ToListAsync();

            return Ok(matches);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Lỗi autocomplete: {ex.Message}" });
        }
    }

    // GET: api/products/5
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(long id)
    {
        try
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.ProductImages)
                .Include(p => p.ProductBatches)
                .FirstOrDefaultAsync(p => p.ProductId == id);

            if (product == null)
            {
                return NotFound(new { message = $"Không tìm thấy sản phẩm có ID = {id}" });
            }

            return Ok(product);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Lỗi khi tải chi tiết sản phẩm: {ex.Message}" });
        }
    }

    // POST: api/products
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Product product)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(product.ProductName))
            {
                return BadRequest(new { message = "Tên sản phẩm không được để trống!" });
            }

            product.CreatedAt = DateTime.UtcNow;
            product.UpdatedAt = DateTime.UtcNow;

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = product.ProductId }, product);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Lỗi khi tạo sản phẩm: {ex.Message}" });
        }
    }

    // PUT: api/products/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(long id, [FromBody] Product product)
    {
        try
        {
            if (id != product.ProductId)
            {
                return BadRequest(new { message = "ID sản phẩm không khớp!" });
            }

            var existing = await _context.Products.FindAsync(id);
            if (existing == null)
            {
                return NotFound(new { message = "Không tìm thấy sản phẩm cần cập nhật!" });
            }

            existing.ProductName = product.ProductName;
            existing.CategoryId = product.CategoryId;
            existing.SupplierId = product.SupplierId;
            existing.Price = product.Price;
            existing.Unit = product.Unit;
            existing.Description = product.Description;
            existing.Status = product.Status;
            existing.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(existing);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Lỗi khi cập nhật sản phẩm: {ex.Message}" });
        }
    }

    // DELETE: api/products/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(long id)
    {
        try
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound(new { message = "Không tìm thấy sản phẩm để xóa!" });
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa sản phẩm thành công." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Lỗi khi xóa sản phẩm: {ex.Message}" });
        }
    }
}
