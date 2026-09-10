using System.Text.Json.Serialization;

namespace Ecc.Infrastructure.Entities;

public class OrderItem
{
    public long OrderItemId { get; set; }
    public long OrderId { get; set; }
    public long ProductId { get; set; }
    public long BatchId { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal? DiscountAmount { get; set; }
    public decimal TotalAmount { get; set; }

    [JsonIgnore]
    public Order? Order { get; set; }
    
    public Product? Product { get; set; }
    
    public ProductBatch? Batch { get; set; }
}
