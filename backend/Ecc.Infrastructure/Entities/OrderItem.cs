// ============================================================================
// TỆP MÃ NGUỒN: backend/Ecc.Infrastructure/Entities/OrderItem.cs
// MÔ TẢ: Thực thể dữ liệu (Entity) OrderItem - Biểu diễn cấu trúc bảng và mối quan hệ của OrderItem trong cơ sở dữ liệu.
// ============================================================================
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
