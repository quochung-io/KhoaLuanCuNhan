using System;
using System.Text.Json.Serialization;

namespace Ecc.Infrastructure.Entities;

public class Certificate
{
    public long CertificateId { get; set; }
    public long SupplierId { get; set; }
    public long? FarmId { get; set; }
    public string CertificateCode { get; set; } = null!;
    public string CertificateName { get; set; } = null!;
    public string StandardType { get; set; } = "VietGAP"; // VietGAP, GlobalGAP, Organic, OCOP, ISO22000, HACCP
    public string IssuedBy { get; set; } = null!; // Cơ quan / Tổ chức cấp chứng nhận
    public DateTime IssueDate { get; set; }
    public DateTime ExpiryDate { get; set; }
    public string? CertificateUrl { get; set; } // Link ảnh scan / tài liệu PDF chứng nhận
    public string Status { get; set; } = "Valid"; // Valid, ExpiringSoon, Expired, Pending, Revoked
    public long? ApprovedBy { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public string? RejectReason { get; set; }
    public string? Notes { get; set; }
    public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties
    public Supplier? Supplier { get; set; }
    public Farm? Farm { get; set; }
}
