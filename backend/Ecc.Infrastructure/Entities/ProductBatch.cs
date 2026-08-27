namespace Ecc.Infrastructure.Entities;

public class ProductBatch
{
    public int Id { get; set; }
    public int? ProductId { get; set; }
    public int? SupplierId { get; set; }
    public string BatchCode { get; set; } = null!;
    public int Quantity { get; set; }
    public int OriginalQuantity { get; set; }
    public decimal Price { get; set; }
    public DateOnly ManufacturedDate { get; set; }
    public DateOnly ExpiryDate { get; set; } // Dùng cho FEFO
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    public Product? Product { get; set; }
    public User? Supplier { get; set; }
}
