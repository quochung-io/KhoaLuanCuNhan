// ============================================================================
// TỆP MÃ NGUỒN: backend/Ecc.Infrastructure/Entities/Supplier.cs
// MÔ TẢ: Thực thể dữ liệu (Entity) Supplier - Biểu diễn cấu trúc bảng và mối quan hệ của Supplier trong cơ sở dữ liệu.
// ============================================================================
namespace Ecc.Infrastructure.Entities;

public class Supplier
{
    public long SupplierId { get; set; }
    public long UserId { get; set; }
    public string SupplierName { get; set; } = null!;
    public string? Representative { get; set; }
    public string? BusinessLicense { get; set; }
    public string? Address { get; set; }
    public string? Province { get; set; }
    public string? Description { get; set; }
    public string? ApprovalStatus { get; set; }
    public long? ApprovedBy { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? RejectReason { get; set; }
    public DateTime? CreatedAt { get; set; }

    public User? User { get; set; }
    public ICollection<Farm> Farms { get; set; } = new List<Farm>();
}
