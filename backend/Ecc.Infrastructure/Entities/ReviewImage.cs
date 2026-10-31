// ============================================================================
// TỆP MÃ NGUỒN: backend/Ecc.Infrastructure/Entities/ReviewImage.cs
// MÔ TẢ: Thực thể dữ liệu (Entity) ReviewImage - Biểu diễn cấu trúc bảng và mối quan hệ của ReviewImage trong cơ sở dữ liệu.
// ============================================================================
using System.Text.Json.Serialization;

namespace Ecc.Infrastructure.Entities;

public class ReviewImage
{
    public long ReviewImageId { get; set; }
    public long ReviewId { get; set; }
    public string ImageUrl { get; set; } = null!;

    [JsonIgnore]
    public Review? Review { get; set; }
}
