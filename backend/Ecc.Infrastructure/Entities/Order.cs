// ============================================================================
// TỆP MÃ NGUỒN: backend/Ecc.Infrastructure/Entities/Order.cs
// MÔ TẢ: Thực thể dữ liệu (Entity) Order - Biểu diễn cấu trúc bảng và mối quan hệ của Order trong cơ sở dữ liệu.
// ============================================================================
using System.Text.Json.Serialization;

namespace Ecc.Infrastructure.Entities;

public class Order
{
    public long OrderId { get; set; }
    public long CustomerId { get; set; }
    public string OrderCode { get; set; } = null!;
    public long AddressId { get; set; }
    public decimal Subtotal { get; set; }
    public decimal? DiscountAmount { get; set; }
    public decimal? ShippingFee { get; set; }
    public decimal TotalAmount { get; set; }
    public string PaymentMethod { get; set; } = null!;
    public string? PaymentStatus { get; set; }
    public string? OrderStatus { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public string? MomoOrderId { get; set; }
    public string? MomoRequestId { get; set; }
    public string? MomoTransId { get; set; }

    public User? Customer { get; set; }
    public Address? Address { get; set; }
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
