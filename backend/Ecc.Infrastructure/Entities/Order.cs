namespace Ecc.Infrastructure.Entities;

public class Order
{
    public int Id { get; set; }
    public int? CustomerId { get; set; }
    public DateTime OrderDate { get; set; } = DateTime.Now;
    public string Status { get; set; } = null!; // 'Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled'
    public decimal TotalAmount { get; set; }
    public string? ShippingAddress { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    public User? Customer { get; set; }
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
