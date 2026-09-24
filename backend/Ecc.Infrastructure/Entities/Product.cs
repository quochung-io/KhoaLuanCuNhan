using System.Text.Json.Serialization;

namespace Ecc.Infrastructure.Entities;

public class Product
{
    public long ProductId { get; set; }
    public long SupplierId { get; set; }
    public int CategoryId { get; set; }
    public string ProductName { get; set; } = null!;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public string Unit { get; set; } = null!;
    public string? Status { get; set; }
    public long? ApprovedBy { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? RejectReason { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Thông tin mở rộng cho Combo Định Kỳ & Combo Theo Chương Trình
    public string? ComboType { get; set; } // 'periodic' | 'program'
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public decimal? OriginalPrice { get; set; }
    public int? DiscountPercent { get; set; }
    public int? ProgramLimit { get; set; }
    public int? SoldQuantity { get; set; } = 0;
    public int? MaxSlots { get; set; } // Số lượng món tự chọn (3, 4, 5)

    public Category? Category { get; set; }
    
    public ICollection<ProductImage> ProductImages { get; set; } = new List<ProductImage>();
    
    [JsonIgnore]
    public ICollection<ProductBatch> ProductBatches { get; set; } = new List<ProductBatch>();
    
    [JsonIgnore]
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    [JsonIgnore]
    public ICollection<Review> Reviews { get; set; } = new List<Review>();

    public double? AverageRating { get; set; }
    public int? ReviewsCount { get; set; }
    public bool? IsOutOfStock { get; set; }
    public decimal? AvailableStock { get; set; }
}
