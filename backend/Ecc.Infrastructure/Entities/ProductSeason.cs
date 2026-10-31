// ============================================================================
// TỆP MÃ NGUỒN: backend/Ecc.Infrastructure/Entities/ProductSeason.cs
// MÔ TẢ: Thực thể dữ liệu (Entity) ProductSeason - Biểu diễn cấu trúc bảng và mối quan hệ của ProductSeason trong cơ sở dữ liệu.
// ============================================================================
using System.Text.Json.Serialization;

namespace Ecc.Infrastructure.Entities;

public class ProductSeason
{
    public long ProductSeasonId { get; set; }
    public long ProductId { get; set; }
    public string? Region { get; set; }
    public int StartMonth { get; set; }
    public int EndMonth { get; set; }

    [JsonIgnore]
    public Product? Product { get; set; }
}
