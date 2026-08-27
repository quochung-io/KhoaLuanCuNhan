using System;

namespace Ecc.Domain.Entities;

public class Product
{
    public long ProductId { get; set; }
    public long SupplierId { get; set; }
    public int CategoryId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public string Unit { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending";
    public long? ApprovedBy { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? RejectReason { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
