// ============================================================================
// TỆP MÃ NGUỒN: backend/Ecc.Infrastructure/Entities/Notification.cs
// MÔ TẢ: Thực thể dữ liệu (Entity) Notification - Biểu diễn cấu trúc bảng và mối quan hệ của Notification trong cơ sở dữ liệu.
// ============================================================================
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ecc.Infrastructure.Entities;

public class Notification
{
    [Key]
    public long NotificationId { get; set; }
    
    public long UserId { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string Type { get; set; } = null!;
    
    [Required]
    [MaxLength(255)]
    public string Title { get; set; } = null!;
    
    [Required]
    public string Message { get; set; } = null!;
    
    [MaxLength(100)]
    public string? ReferenceId { get; set; }
    
    public bool? IsRead { get; set; }
    
    public DateTime? CreatedAt { get; set; }

    public User? User { get; set; }
}
