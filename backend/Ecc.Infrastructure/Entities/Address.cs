// ============================================================================
// TỆP MÃ NGUỒN: backend/Ecc.Infrastructure/Entities/Address.cs
// MÔ TẢ: Thực thể dữ liệu (Entity) Address - Biểu diễn cấu trúc bảng và mối quan hệ của Address trong cơ sở dữ liệu.
// ============================================================================
namespace Ecc.Infrastructure.Entities;

public class Address
{
    public long AddressId { get; set; }
    public long UserId { get; set; }
    public string ReceiverName { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string Province { get; set; } = null!;
    public string District { get; set; } = null!;
    public string Ward { get; set; } = null!;
    public string AddressDetail { get; set; } = null!;
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public bool IsDefault { get; set; }
    public string? AddressType { get; set; } = "Nhà ở";
}
