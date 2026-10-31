// ============================================================================
// TỆP MÃ NGUỒN: backend/Ecc.Domain/Entities/Role.cs
// MÔ TẢ: Thực thể dữ liệu (Entity) Role - Biểu diễn cấu trúc bảng và mối quan hệ của Role trong cơ sở dữ liệu.
// ============================================================================
namespace Ecc.Domain.Entities;

public class Role
{
    public int RoleId { get; set; }
    public string RoleName { get; set; } = string.Empty;
}
