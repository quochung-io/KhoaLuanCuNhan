// ============================================================================
// TỆP MÃ NGUỒN: backend/Ecc.Infrastructure/Entities/Category.cs
// MÔ TẢ: Thực thể dữ liệu (Entity) Category - Biểu diễn cấu trúc bảng và mối quan hệ của Category trong cơ sở dữ liệu.
// ============================================================================
using System.Text.Json.Serialization;

namespace Ecc.Infrastructure.Entities;

public class Category
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = null!;
    public int? ParentCategoryId { get; set; }
    public string? Status { get; set; }

    [JsonIgnore]
    public ICollection<Product> Products { get; set; } = new List<Product>();
}
