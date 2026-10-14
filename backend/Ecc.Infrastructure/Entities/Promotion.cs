using System;

namespace Ecc.Infrastructure.Entities;

public class Promotion
{
    public long PromotionId { get; set; }
    public string PromotionCode { get; set; } = string.Empty;
    public string PromotionName { get; set; } = string.Empty;
    public string? DiscountType { get; set; } = "Percent"; // Percent, Fixed, Ship
    public decimal DiscountValue { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public decimal? MinOrderValue { get; set; }
    public decimal? MaxDiscount { get; set; }
    public int? UsageLimit { get; set; }
    public string? Status { get; set; } = "Active"; // Active, Inactive, Expired
}
