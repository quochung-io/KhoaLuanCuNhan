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

    public Category? Category { get; set; }
    
    [JsonIgnore]
    public ICollection<ProductBatch> ProductBatches { get; set; } = new List<ProductBatch>();
    
    [JsonIgnore]
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
