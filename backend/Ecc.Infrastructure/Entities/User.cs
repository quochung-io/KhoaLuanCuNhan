// ============================================================================
// TỆP MÃ NGUỒN: backend/Ecc.Infrastructure/Entities/User.cs
// MÔ TẢ: Thực thể dữ liệu (Entity) User - Biểu diễn cấu trúc bảng và mối quan hệ của User trong cơ sở dữ liệu.
// ============================================================================
using System.Text.Json.Serialization;

namespace Ecc.Infrastructure.Entities;

public class User
{
    public long UserId { get; set; }
    public string FullName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? Phone { get; set; }
    public string PasswordHash { get; set; } = null!;
    public int RoleId { get; set; }
    public string? Status { get; set; }
    public string? AvatarUrl { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    [JsonIgnore]
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
