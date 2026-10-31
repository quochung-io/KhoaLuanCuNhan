// ============================================================================
// TỆP MÃ NGUỒN: backend/Ecc.Infrastructure/Entities/ProductImage.cs
// MÔ TẢ: Thực thể dữ liệu (Entity) ProductImage - Biểu diễn cấu trúc bảng và mối quan hệ của ProductImage trong cơ sở dữ liệu.
// ============================================================================
using System.Text.Json.Serialization;

namespace Ecc.Infrastructure.Entities;

public class ProductImage
{
    public long ProductImageId { get; set; }
    public long ProductId { get; set; }
    public string ImageUrl { get; set; } = null!;
    public bool IsPrimary { get; set; }
    public int SortOrder { get; set; }

    [JsonIgnore]
    public Product? Product { get; set; }
}
