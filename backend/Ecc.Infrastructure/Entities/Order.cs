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

    public User? Customer { get; set; }
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
