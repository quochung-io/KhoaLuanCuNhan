// ============================================================================
// TỆP MÃ NGUỒN: backend/Ecc.WebApi/Controllers/Web/ProductImagesController.cs
// MÔ TẢ: Controller quản lý thư viện hình ảnh chính và ảnh phụ của từng sản phẩm nông sản.
// ============================================================================
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

    /// <summary>Xóa hoặc làm mới dữ liệu (DeleteProductImage)</summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProductImage(long id)
    {
        var image = await _context.ProductImages.FindAsync(id);
        if (image == null) return NotFound();

        _context.ProductImages.Remove(image);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private static readonly HttpClient _imageHttpClient = new HttpClient
    {
        Timeout = TimeSpan.FromSeconds(10)
    };

    /// <summary>Thực thi nghiệp vụ hàm ProxyImage</summary>
    [HttpGet("proxy")]
    public async Task<IActionResult> ProxyImage([FromQuery] string url)
    {
        if (string.IsNullOrWhiteSpace(url)) return BadRequest("Url is required");
        try
        {
            var request = new HttpRequestMessage(HttpMethod.Get, url);
            request.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

            var response = await _imageHttpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead);
            if (!response.IsSuccessStatusCode)
            {
                return StatusCode((int)response.StatusCode);
            }
            var contentType = response.Content.Headers.ContentType?.MediaType ?? "image/jpeg";
            var stream = await response.Content.ReadAsStreamAsync();
            Response.Headers["Cache-Control"] = "public, max-age=604800";
            return File(stream, contentType);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Lỗi proxy ảnh: {ex.Message}" });
        }
    }
}

public class SyncProductImagesDto
{
    public string ImageUrl { get; set; } = null!;
    public bool IsPrimary { get; set; }
    public int SortOrder { get; set; }
}
