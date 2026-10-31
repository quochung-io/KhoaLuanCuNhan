// ============================================================================
// TỆP MÃ NGUỒN: backend/Ecc.Domain/Entities/User.cs
// MÔ TẢ: Thực thể dữ liệu (Entity) User - Biểu diễn cấu trúc bảng và mối quan hệ của User trong cơ sở dữ liệu.
// ============================================================================
using System;

namespace Ecc.Domain.Entities;

public class User
{
    public long UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string PasswordHash { get; set; } = string.Empty;
    public int RoleId { get; set; }
    public string Status { get; set; } = "Active";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Role? Role { get; set; }
}
