using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ecc.Infrastructure.Data;
using Ecc.Infrastructure.Entities;

namespace Ecc.WebApi.Controllers.Web;

[ApiController]
[Route("api/[controller]")]
[Route("api/vouchers")]
public class PromotionsController : ControllerBase
{
    private readonly AppDbContext _context;

    public PromotionsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/promotions
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] string? status)
    {
        try
        {
            var query = _context.Promotions.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim().ToLower();
                query = query.Where(p => p.PromotionCode.ToLower().Contains(s) || p.PromotionName.ToLower().Contains(s));
            }

            var now = DateTime.UtcNow;

            var list = await query.OrderByDescending(p => p.PromotionId).ToListAsync();

            // Tự động đồng bộ trạng thái nếu hết hạn
            bool needSave = false;
            foreach (var item in list)
            {
                if (item.Status != null && item.Status.Equals("Active", StringComparison.OrdinalIgnoreCase) && item.EndDate.HasValue && item.EndDate.Value < now)
                {
                    item.Status = "Expired";
                    needSave = true;
                }
            }
            if (needSave)
            {
                await _context.SaveChangesAsync();
            }

            if (!string.IsNullOrWhiteSpace(status) && status.ToLower() != "all")
            {
                list = list.Where(p => (p.Status ?? "Active").Equals(status, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            // Map ra DTO chuẩn và thân thiện cho Frontend
            var result = list.Select(p => new
            {
                id = p.PromotionId,
                promotionId = p.PromotionId,
                code = p.PromotionCode,
                name = p.PromotionName,
                discountType = p.DiscountType ?? "Percent",
                discountValue = p.DiscountValue,
                discountFormatted = (p.DiscountType ?? "Percent").ToLower() == "percent" 
                    ? $"{p.DiscountValue:0.#}%" 
                    : (p.DiscountType ?? "").ToLower() == "ship" ? "Freeship" : $"{p.DiscountValue:N0} đ",
                startDate = p.StartDate.HasValue ? p.StartDate.Value.ToString("yyyy-MM-dd") : "",
                endDate = p.EndDate.HasValue ? p.EndDate.Value.ToString("yyyy-MM-dd") : "",
                minOrderAmount = p.MinOrderValue ?? 0,
                maxDiscount = p.MaxDiscount,
                usageLimit = p.UsageLimit,
                status = (p.Status ?? "Active").ToLower()
            });

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi lấy danh sách khuyến mãi: " + ex.Message });
        }
    }

    // GET: api/promotions/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(long id)
    {
        try
        {
            var p = await _context.Promotions.FindAsync(id);
            if (p == null)
            {
                return NotFound(new { message = $"Không tìm thấy chương trình khuyến mãi #{id}" });
            }

            return Ok(new
            {
                id = p.PromotionId,
                promotionId = p.PromotionId,
                code = p.PromotionCode,
                name = p.PromotionName,
                discountType = p.DiscountType ?? "Percent",
                discountValue = p.DiscountValue,
                startDate = p.StartDate.HasValue ? p.StartDate.Value.ToString("yyyy-MM-dd") : "",
                endDate = p.EndDate.HasValue ? p.EndDate.Value.ToString("yyyy-MM-dd") : "",
                minOrderAmount = p.MinOrderValue ?? 0,
                maxDiscount = p.MaxDiscount,
                usageLimit = p.UsageLimit,
                status = (p.Status ?? "Active").ToLower()
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi: " + ex.Message });
        }
    }

    // POST: api/promotions
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePromotionDto dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.Code) || string.IsNullOrWhiteSpace(dto.Name))
            {
                return BadRequest(new { message = "Mã voucher và Tên chương trình là bắt buộc." });
            }

            var cleanCode = dto.Code.Trim().ToUpper();
            if (await _context.Promotions.AnyAsync(p => p.PromotionCode.ToUpper() == cleanCode))
            {
                return BadRequest(new { message = $"Mã voucher '{cleanCode}' đã tồn tại trong hệ thống." });
            }

            var promo = new Promotion
            {
                PromotionCode = cleanCode,
                PromotionName = dto.Name.Trim(),
                DiscountType = string.IsNullOrWhiteSpace(dto.DiscountType) ? "Percent" : dto.DiscountType.Trim(),
                DiscountValue = dto.DiscountValue,
                MinOrderValue = dto.MinOrderAmount > 0 ? dto.MinOrderAmount : dto.MinOrderValue,
                MaxDiscount = dto.MaxDiscount,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                UsageLimit = dto.UsageLimit,
                Status = string.IsNullOrWhiteSpace(dto.Status) ? "Active" : dto.Status.Trim()
            };

            _context.Promotions.Add(promo);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Tạo mã khuyến mãi thành công!", promotion = promo });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi tạo khuyến mãi: " + ex.Message });
        }
    }

    // PUT: api/promotions/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(long id, [FromBody] UpdatePromotionDto dto)
    {
        try
        {
            var promo = await _context.Promotions.FindAsync(id);
            if (promo == null)
            {
                return NotFound(new { message = $"Không tìm thấy khuyến mãi #{id}" });
            }

            var cleanCode = dto.Code.Trim().ToUpper();
            if (await _context.Promotions.AnyAsync(p => p.PromotionCode.ToUpper() == cleanCode && p.PromotionId != id))
            {
                return BadRequest(new { message = $"Mã voucher '{cleanCode}' đã được sử dụng bởi chương trình khác." });
            }

            promo.PromotionCode = cleanCode;
            promo.PromotionName = dto.Name.Trim();
            promo.DiscountType = dto.DiscountType?.Trim() ?? promo.DiscountType;
            promo.DiscountValue = dto.DiscountValue;
            promo.MinOrderValue = dto.MinOrderAmount > 0 ? dto.MinOrderAmount : dto.MinOrderValue;
            promo.MaxDiscount = dto.MaxDiscount;
            promo.StartDate = dto.StartDate;
            promo.EndDate = dto.EndDate;
            promo.UsageLimit = dto.UsageLimit;
            promo.Status = dto.Status?.Trim() ?? promo.Status;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật mã khuyến mãi thành công!", promotion = promo });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi cập nhật khuyến mãi: " + ex.Message });
        }
    }

    // PUT: api/promotions/{id}/toggle-status
    [HttpPut("{id}/toggle-status")]
    public async Task<IActionResult> ToggleStatus(long id)
    {
        try
        {
            var promo = await _context.Promotions.FindAsync(id);
            if (promo == null)
            {
                return NotFound(new { message = $"Không tìm thấy khuyến mãi #{id}" });
            }

            var current = (promo.Status ?? "Active").ToLower();
            if (current == "active")
            {
                promo.Status = "Inactive";
            }
            else
            {
                promo.Status = (promo.EndDate.HasValue && promo.EndDate.Value < DateTime.UtcNow) ? "Expired" : "Active";
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = $"Đã chuyển trạng thái mã '{promo.PromotionCode}' sang: {promo.Status}", status = promo.Status });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi: " + ex.Message });
        }
    }

    // DELETE: api/promotions/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(long id)
    {
        try
        {
            var promo = await _context.Promotions.FindAsync(id);
            if (promo == null)
            {
                return NotFound(new { message = $"Không tìm thấy khuyến mãi #{id}" });
            }

            _context.Promotions.Remove(promo);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Đã xóa mã khuyến mãi '{promo.PromotionCode}' thành công!" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi xóa khuyến mãi: " + ex.Message });
        }
    }
}

public class CreatePromotionDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? DiscountType { get; set; } = "Percent";
    public decimal DiscountValue { get; set; }
    public decimal MinOrderAmount { get; set; }
    public decimal? MinOrderValue { get; set; }
    public decimal? MaxDiscount { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? UsageLimit { get; set; }
    public string? Status { get; set; } = "Active";
}

public class UpdatePromotionDto : CreatePromotionDto
{
}
