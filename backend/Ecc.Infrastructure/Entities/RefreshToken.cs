// ============================================================================
// TỆP MÃ NGUỒN: backend/Ecc.Infrastructure/Entities/RefreshToken.cs
// MÔ TẢ: Thực thể dữ liệu (Entity) RefreshToken - Biểu diễn cấu trúc bảng và mối quan hệ của RefreshToken trong cơ sở dữ liệu.
// ============================================================================
namespace Ecc.Infrastructure.Entities;

public class RefreshToken
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public string Token { get; set; } = null!;
    public DateTime ExpiresAt { get; set; }
    public bool IsRevoked { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? ReplacedByToken { get; set; }

    public User? User { get; set; }
}
