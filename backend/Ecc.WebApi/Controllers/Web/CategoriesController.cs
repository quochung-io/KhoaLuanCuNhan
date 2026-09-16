using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ecc.Infrastructure.Data;
using Ecc.Infrastructure.Entities;

namespace Ecc.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly AppDbContext _context;

    public CategoriesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
    {
        return await _context.Categories.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Category>> GetCategory(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null) return NotFound();
        return category;
    }

    [HttpPost]
    public async Task<ActionResult<Category>> CreateCategory(Category category)
    {
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetCategory), new { id = category.CategoryId }, category);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategory(int id, Category category)
    {
        if (id != category.CategoryId) return BadRequest();
        _context.Entry(category).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Categories.Any(e => e.CategoryId == id)) return NotFound();
            throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null) return NotFound(new { message = "Không tìm thấy danh mục cần xóa." });

        int productCount = await _context.Products.CountAsync(p => p.CategoryId == id);
        if (productCount > 0)
        {
            return BadRequest(new { 
                message = $"Không thể xóa danh mục '{category.CategoryName}' vì hiện có {productCount} sản phẩm nông sản trực thuộc danh mục này. Vui lòng chuyển danh mục hoặc xóa các sản phẩm đó trước!" 
            });
        }

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();
        return Ok(new { message = $"Đã xóa danh mục '{category.CategoryName}' thành công!" });
    }
}
