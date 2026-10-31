// ============================================================================
// TỆP MÃ NGUỒN: backend/Ecc.Infrastructure/Entities/ProductBatch.cs
// MÔ TẢ: Thực thể dữ liệu (Entity) ProductBatch - Biểu diễn cấu trúc bảng và mối quan hệ của ProductBatch trong cơ sở dữ liệu.
// ============================================================================
using System.Text.Json.Serialization;

namespace Ecc.Infrastructure.Entities;

public class ProductBatch
{
    public long BatchId { get; set; }
    public long ProductId { get; set; }
    public long FarmId { get; set; }
    public string BatchCode { get; set; } = null!;
    public DateTime HarvestDate { get; set; }
    public DateTime? ReceivedDate { get; set; }
    public DateTime ExpiryDate { get; set; }
    public decimal InitialQuantity { get; set; }
    public string Unit { get; set; } = null!;
    public string? Status { get; set; }
    public DateTime? CreatedAt { get; set; }

    [JsonIgnore]
    public Product? Product { get; set; }
}
