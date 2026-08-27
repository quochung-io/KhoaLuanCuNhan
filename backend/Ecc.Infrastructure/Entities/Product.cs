namespace Ecc.Infrastructure.Entities;

public class Product
{
    public int Id { get; set; }
    public int? CategoryId { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    public Category? Category { get; set; }
    public ICollection<ProductBatch> ProductBatches { get; set; } = new List<ProductBatch>();
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
