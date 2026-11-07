// ============================================================================
// TỆP MÃ NGUỒN: backend/Ecc.WebApi/Controllers/Web/ProductsController.cs
// MÔ TẢ: Controller quản lý Sản phẩm nông sản lẻ và Gói Combo định kỳ (Tìm kiếm, lọc giá, gợi ý tự động Autocomplete, CRUD).
// ============================================================================
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Globalization;
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

    // GET: api/products?search=...&minPrice=...&maxPrice=...&comboType=...&region=...
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search, 
        [FromQuery] decimal? minPrice, 
        [FromQuery] decimal? maxPrice,
        [FromQuery] int? supplierId,
        [FromQuery] int? categoryId,
        [FromQuery] string? comboType,
        [FromQuery] string? region)
    {
        try
        {
            var query = _context.Products
                .Include(p => p.Category)
                .Include(p => p.ProductImages)
                .Include(p => p.Supplier)
                .Include(p => p.ProductBatches)
                    .ThenInclude(b => b.Farm)
                .Where(p => p.Status == null || p.Status != "Pending")
                .AsQueryable();

            if (supplierId.HasValue)
            {
                var targetSupplierId = supplierId.Value;
                var supExists = await _context.Suppliers.AnyAsync(s => s.SupplierId == targetSupplierId);
                if (!supExists)
                {
                    var supByUser = await _context.Suppliers.FirstOrDefaultAsync(s => s.UserId == targetSupplierId);
                    if (supByUser != null)
                    {
                        targetSupplierId = (int)supByUser.SupplierId;
                    }
                }
                query = query.Where(p => p.SupplierId == targetSupplierId);
            }

            if (categoryId.HasValue)
            {
                query = query.Where(p => p.CategoryId == categoryId.Value);
            }

            if (!string.IsNullOrWhiteSpace(comboType))
            {
                string ct = comboType.Trim().ToLower();
                query = query.Where(p => p.ComboType != null && p.ComboType.ToLower() == ct);
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
                .Include(p => p.Reviews)
                .OrderByDescending(p => p.ProductId)
                .ToListAsync();

            var now = DateTime.UtcNow;
            foreach (var prod in products)
            {
                var approvedReviews = prod.Reviews.Where(r => r.Status == "Approved" || string.IsNullOrEmpty(r.Status)).ToList();
                prod.ReviewsCount = approvedReviews.Count;
                prod.AverageRating = approvedReviews.Count > 0 
                    ? Math.Round(approvedReviews.Average(r => r.Rating), 1) 
                    : 0.0;

                var validBatches = prod.ProductBatches
                    .Where(b => (b.Status == "Active" || string.IsNullOrEmpty(b.Status)) &&
                                b.InitialQuantity > 0 &&
                                (b.ExpiryDate >= now || b.ExpiryDate == default))
                    .ToList();

                decimal availableStock = validBatches.Sum(b => b.InitialQuantity);
                prod.AvailableStock = availableStock;
                prod.IsOutOfStock = prod.ProductBatches.Any() && availableStock <= 0;

                var latestBatch = prod.ProductBatches.OrderByDescending(b => b.BatchId).FirstOrDefault();
                var farm = latestBatch?.Farm;
                var province = farm?.Province ?? prod.Supplier?.Province ?? "";
                prod.Origin = province;
                prod.Region = province;
                prod.FarmName = farm?.FarmName ?? prod.Supplier?.SupplierName ?? "";
                prod.LotCode = latestBatch?.BatchCode ?? "";
            }

            // Lọc tìm kiếm hỗ trợ cả tiếng Việt có dấu và không dấu (Case-insensitive, Diacritics-insensitive)
            if (!string.IsNullOrWhiteSpace(search))
            {
                var rawSearch = search.Trim();
                var sLower = rawSearch.ToLower();
                var sNorm = NormalizeSearchText(rawSearch);

                products = products.Where(p =>
                    (p.ProductName != null && (p.ProductName.ToLower().Contains(sLower) || NormalizeSearchText(p.ProductName).Contains(sNorm))) ||
                    (p.Description != null && (p.Description.ToLower().Contains(sLower) || NormalizeSearchText(p.Description).Contains(sNorm))) ||
                    (p.Category != null && p.Category.CategoryName != null && (p.Category.CategoryName.ToLower().Contains(sLower) || NormalizeSearchText(p.Category.CategoryName).Contains(sNorm))) ||
                    (p.Supplier != null && p.Supplier.SupplierName != null && (p.Supplier.SupplierName.ToLower().Contains(sLower) || NormalizeSearchText(p.Supplier.SupplierName).Contains(sNorm))) ||
                    (!string.IsNullOrEmpty(p.Origin) && (p.Origin.ToLower().Contains(sLower) || NormalizeSearchText(p.Origin).Contains(sNorm)))
                ).ToList();
            }

            // Lọc theo vùng miền / tỉnh thành sản xuất
            if (!string.IsNullOrWhiteSpace(region) && region != "all")
            {
                var regLower = region.Trim().ToLower();
                var regNorm = NormalizeSearchText(regLower);

                products = products.Where(p =>
                    (!string.IsNullOrEmpty(p.Region) && (p.Region.ToLower().Contains(regLower) || NormalizeSearchText(p.Region).Contains(regNorm))) ||
                    (!string.IsNullOrEmpty(p.Origin) && (p.Origin.ToLower().Contains(regLower) || NormalizeSearchText(p.Origin).Contains(regNorm))) ||
                    p.ProductBatches.Any(b => b.Farm != null && !string.IsNullOrEmpty(b.Farm.Province) && (b.Farm.Province.ToLower().Contains(regLower) || NormalizeSearchText(b.Farm.Province).Contains(regNorm))) ||
                    (p.Supplier != null && !string.IsNullOrEmpty(p.Supplier.Province) && (p.Supplier.Province.ToLower().Contains(regLower) || NormalizeSearchText(p.Supplier.Province).Contains(regNorm)))
                ).ToList();
            }

            return Ok(products);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Lỗi khi tải danh sách sản phẩm: {ex.Message}" });
        }
    }

    // GET: api/products/regions
    [HttpGet("regions")]
    public async Task<IActionResult> GetRegions()
    {
        try
        {
            var farmProvinces = await _context.Farms
                .Where(f => !string.IsNullOrEmpty(f.Province))
                .Select(f => f.Province!)
                .Distinct()
                .ToListAsync();

            var supplierProvinces = await _context.Suppliers
                .Where(s => !string.IsNullOrEmpty(s.Province))
                .Select(s => s.Province!)
                .Distinct()
                .ToListAsync();

            var allRegions = farmProvinces
                .Union(supplierProvinces)
                .OrderBy(r => r)
                .ToList();

            return Ok(allRegions);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Lỗi khi tải danh mục vùng miền: {ex.Message}" });
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

            string rawP = prefix.Trim();
            string pLower = rawP.ToLower();
            string pNorm = NormalizeSearchText(rawP);

            var prods = await _context.Products
                .Include(prod => prod.ProductImages)
                .Where(prod => prod.Status == null || prod.Status != "Pending")
                .ToListAsync();

            var matches = prods
                .Where(prod => 
                    (prod.ProductName != null && (prod.ProductName.ToLower().Contains(pLower) || NormalizeSearchText(prod.ProductName).Contains(pNorm))))
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
                .ToList();

            return Ok(matches);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Lỗi autocomplete: {ex.Message}" });
        }
    }

    // Helper: Chuẩn hóa tiếng Việt bỏ dấu và chuyển chữ thường để tìm kiếm không phân biệt HOA/thường và dấu
    public static string NormalizeSearchText(string? text)
    {
        if (string.IsNullOrWhiteSpace(text)) return string.Empty;
        var normalized = text.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder();
        foreach (var ch in normalized)
        {
            var uc = CharUnicodeInfo.GetUnicodeCategory(ch);
            if (uc != UnicodeCategory.NonSpacingMark)
            {
                sb.Append(ch);
            }
        }
        return sb.ToString().Normalize(NormalizationForm.FormC).ToLower().Replace("đ", "d");
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
                .Include(p => p.Supplier)
                .Include(p => p.ProductBatches)
                    .ThenInclude(b => b.Farm)
                .Include(p => p.Reviews)
                .FirstOrDefaultAsync(p => p.ProductId == id);

            if (product == null)
            {
                return NotFound(new { message = $"Không tìm thấy sản phẩm có ID = {id}" });
            }

            var approvedReviews = product.Reviews.Where(r => r.Status == "Approved" || string.IsNullOrEmpty(r.Status)).ToList();
            product.ReviewsCount = approvedReviews.Count;
            product.AverageRating = approvedReviews.Count > 0 
                ? Math.Round(approvedReviews.Average(r => r.Rating), 1) 
                : 0.0;

            var now = DateTime.UtcNow;
            var validBatches = product.ProductBatches
                .Where(b => (b.Status == "Active" || string.IsNullOrEmpty(b.Status)) &&
                            b.InitialQuantity > 0 &&
                            (b.ExpiryDate >= now || b.ExpiryDate == default))
                .ToList();

            decimal availableStock = validBatches.Sum(b => b.InitialQuantity);
            product.AvailableStock = availableStock;
            product.IsOutOfStock = product.ProductBatches.Any() && availableStock <= 0;

            var latestBatch = product.ProductBatches.OrderByDescending(b => b.BatchId).FirstOrDefault();
            var farm = latestBatch?.Farm;
            var province = farm?.Province ?? product.Supplier?.Province ?? "";
            product.Origin = province;
            product.Region = province;
            product.FarmName = farm?.FarmName ?? product.Supplier?.SupplierName ?? "";
            product.LotCode = latestBatch?.BatchCode ?? "";

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

            if (product.SupplierId > 0)
            {
                var supExists = await _context.Suppliers.AnyAsync(s => s.SupplierId == product.SupplierId);
                if (!supExists)
                {
                    var supByUser = await _context.Suppliers.FirstOrDefaultAsync(s => s.UserId == product.SupplierId);
                    if (supByUser != null)
                    {
                        product.SupplierId = supByUser.SupplierId;
                    }
                }
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
            existing.ComboType = product.ComboType;
            existing.StartDate = product.StartDate;
            existing.EndDate = product.EndDate;
            existing.OriginalPrice = product.OriginalPrice;
            existing.DiscountPercent = product.DiscountPercent;
            existing.ProgramLimit = product.ProgramLimit;
            existing.SoldQuantity = product.SoldQuantity;
            existing.MaxSlots = product.MaxSlots;
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
            var product = await _context.Products
                .Include(p => p.ProductImages)
                .Include(p => p.ProductBatches)
                .Include(p => p.Reviews)
                .FirstOrDefaultAsync(p => p.ProductId == id);

            if (product == null)
            {
                return NotFound(new { message = "Không tìm thấy sản phẩm để xóa!" });
            }

            // Kiểm tra xem sản phẩm đã có đơn hàng chưa
            bool hasOrders = await _context.OrderItems.AnyAsync(oi => oi.ProductId == id);
            if (hasOrders)
            {
                // Nếu đã có đơn hàng thực tế, không xóa cứng để bảo toàn dữ liệu lịch sử đơn hàng
                product.Status = "Inactive";
                product.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return Ok(new { message = "Sản phẩm đã phát sinh đơn hàng, hệ thống đã chuyển sang trạng thái Ngừng kinh doanh (Inactive) thay vì xóa hoàn toàn." });
            }

            // Nếu chưa có đơn hàng, xóa sạch các dữ liệu liên quan trước khi xóa sản phẩm
            if (product.ProductBatches != null && product.ProductBatches.Any())
            {
                _context.ProductBatches.RemoveRange(product.ProductBatches);
            }

            if (product.ProductImages != null && product.ProductImages.Any())
            {
                _context.ProductImages.RemoveRange(product.ProductImages);
            }

            if (product.Reviews != null && product.Reviews.Any())
            {
                _context.Reviews.RemoveRange(product.Reviews);
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa sản phẩm và toàn bộ dữ liệu lô hàng liên quan thành công." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Lỗi khi xóa sản phẩm: {ex.Message}" });
        }
    }
}
