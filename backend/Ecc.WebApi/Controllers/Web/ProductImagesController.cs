using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ecc.Infrastructure.Data;
using Ecc.Infrastructure.Entities;

namespace Ecc.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductImagesController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProductImagesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductImage>>> GetProductImages()
    {
        return await _context.ProductImages.ToListAsync();
    }

    [HttpGet("product/{productId}")]
    public async Task<ActionResult<IEnumerable<ProductImage>>> GetProductImagesByProduct(long productId)
    {
        return await _context.ProductImages
            .Where(i => i.ProductId == productId)
            .OrderBy(i => i.SortOrder)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<ProductImage>> CreateProductImage(ProductImage image)
    {
        _context.ProductImages.Add(image);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetProductImages), new { id = image.ProductImageId }, image);
    }

    [HttpPut("product/{productId}/sync")]
    public async Task<ActionResult<IEnumerable<ProductImage>>> SyncProductImages(long productId, [FromBody] List<SyncProductImagesDto> images)
    {
        var existing = await _context.ProductImages.Where(i => i.ProductId == productId).ToListAsync();
        _context.ProductImages.RemoveRange(existing);

        if (images != null)
        {
            int order = 1;
            foreach (var img in images)
            {
                if (!string.IsNullOrWhiteSpace(img.ImageUrl))
                {
                    _context.ProductImages.Add(new ProductImage
                    {
                        ProductId = productId,
                        ImageUrl = img.ImageUrl.Trim(),
                        IsPrimary = img.IsPrimary,
                        SortOrder = img.SortOrder > 0 ? img.SortOrder : order
                    });
                    order++;
                }
            }
        }

        await _context.SaveChangesAsync();

        var result = await _context.ProductImages
            .Where(i => i.ProductId == productId)
            .OrderBy(i => i.SortOrder)
            .ToListAsync();

        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProductImage(long id)
    {
        var image = await _context.ProductImages.FindAsync(id);
        if (image == null) return NotFound();

        _context.ProductImages.Remove(image);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

public class SyncProductImagesDto
{
    public string ImageUrl { get; set; } = null!;
    public bool IsPrimary { get; set; }
    public int SortOrder { get; set; }
}
