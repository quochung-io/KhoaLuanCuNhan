using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ecc.Infrastructure.Data;
using Ecc.Infrastructure.Entities;

namespace Ecc.WebApi.Controllers.Web;

[ApiController]
[Route("api/[controller]")]
public class CertificatesController : ControllerBase
{
    private readonly AppDbContext _context;

    public CertificatesController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Lấy danh sách toàn bộ giấy chứng nhận (có lọc theo supplier, farm, tiêu chuẩn, trạng thái)
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] long? supplierId = null,
        [FromQuery] long? farmId = null,
        [FromQuery] string? standardType = null,
        [FromQuery] string? status = null,
        [FromQuery] string? search = null)
    {
        var query = _context.Certificates
            .Include(c => c.Supplier)
            .Include(c => c.Farm)
            .AsNoTracking()
            .AsQueryable();

        if (supplierId.HasValue && supplierId.Value > 0)
        {
            query = query.Where(c => c.SupplierId == supplierId.Value);
        }

        if (farmId.HasValue && farmId.Value > 0)
        {
            query = query.Where(c => c.FarmId == farmId.Value);
        }

        if (!string.IsNullOrWhiteSpace(standardType) && standardType != "all")
        {
            query = query.Where(c => c.StandardType.ToLower() == standardType.ToLower());
        }

        if (!string.IsNullOrWhiteSpace(status) && status != "all")
        {
            query = query.Where(c => c.Status.ToLower() == status.ToLower());
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var q = search.Trim().ToLower();
            query = query.Where(c => 
                c.CertificateCode.ToLower().Contains(q) || 
                c.CertificateName.ToLower().Contains(q) ||
                c.IssuedBy.ToLower().Contains(q) ||
                (c.Supplier != null && c.Supplier.SupplierName.ToLower().Contains(q)) ||
                (c.Farm != null && c.Farm.FarmName.ToLower().Contains(q)));
        }

        var certificates = await query
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        var now = DateTime.UtcNow;
        var result = certificates.Select(c => {
            var diffDays = (c.ExpiryDate.Date - now.Date).Days;
            var dynamicStatus = c.Status;

            // Tự động suy biến trạng thái theo dòng thời gian nếu đang là hợp lệ
            if (c.Status == "Valid" || c.Status == "ExpiringSoon")
            {
                if (diffDays < 0) dynamicStatus = "Expired";
                else if (diffDays <= 30) dynamicStatus = "ExpiringSoon";
                else dynamicStatus = "Valid";
            }

            return new {
                c.CertificateId,
                c.SupplierId,
                supplierName = c.Supplier?.SupplierName ?? "Chưa định danh",
                c.FarmId,
                farmName = c.Farm?.FarmName ?? "Toàn bộ cơ sở HTX",
                c.CertificateCode,
                c.CertificateName,
                c.StandardType,
                c.IssuedBy,
                c.IssueDate,
                c.ExpiryDate,
                daysRemaining = diffDays,
                c.CertificateUrl,
                status = dynamicStatus,
                c.ApprovedBy,
                c.ApprovedAt,
                c.RejectReason,
                c.Notes,
                c.CreatedAt
            };
        });

        return Ok(result);
    }

    /// <summary>
    /// Thống kê pháp lý và tình trạng hiệu lực chứng nhận tổng quan
    /// </summary>
    [HttpGet("compliance-summary")]
    public async Task<IActionResult> GetComplianceSummary([FromQuery] long? supplierId = null)
    {
        var query = _context.Certificates.AsNoTracking().AsQueryable();
        if (supplierId.HasValue && supplierId.Value > 0)
        {
            query = query.Where(c => c.SupplierId == supplierId.Value);
        }

        var certs = await query.ToListAsync();
        var now = DateTime.UtcNow;

        int total = certs.Count;
        int valid = 0;
        int expiringSoon = 0;
        int expired = 0;
        int pending = 0;
        int rejected = 0;

        int vietGap = 0;
        int globalGap = 0;
        int organic = 0;
        int ocop = 0;

        foreach (var c in certs)
        {
            var diffDays = (c.ExpiryDate.Date - now.Date).Days;
            if (c.Status == "Pending") pending++;
            else if (c.Status == "Rejected" || c.Status == "Revoked") rejected++;
            else if (diffDays < 0) expired++;
            else if (diffDays <= 30) expiringSoon++;
            else valid++;

            var std = (c.StandardType ?? "").ToUpper();
            if (std.Contains("VIETGAP")) vietGap++;
            else if (std.Contains("GLOBALGAP")) globalGap++;
            else if (std.Contains("ORGANIC") || std.Contains("HỮU CƠ")) organic++;
            else if (std.Contains("OCOP")) ocop++;
        }

        return Ok(new {
            total,
            valid,
            expiringSoon,
            expired,
            pending,
            rejected,
            complianceRate = total > 0 ? Math.Round((double)(valid + expiringSoon) / total * 100, 1) : 100.0,
            standardBreakdown = new {
                vietGap,
                globalGap,
                organic,
                ocop
            }
        });
    }

    /// <summary>
    /// Chi tiết 1 giấy chứng nhận
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(long id)
    {
        var c = await _context.Certificates
            .Include(x => x.Supplier)
            .Include(x => x.Farm)
            .FirstOrDefaultAsync(x => x.CertificateId == id);

        if (c == null) return NotFound(new { message = "Không tìm thấy giấy chứng nhận." });

        var now = DateTime.UtcNow;
        var diffDays = (c.ExpiryDate.Date - now.Date).Days;
        var dynamicStatus = c.Status;
        if (c.Status == "Valid" || c.Status == "ExpiringSoon")
        {
            if (diffDays < 0) dynamicStatus = "Expired";
            else if (diffDays <= 30) dynamicStatus = "ExpiringSoon";
        }

        return Ok(new {
            c.CertificateId,
            c.SupplierId,
            supplierName = c.Supplier?.SupplierName,
            c.FarmId,
            farmName = c.Farm?.FarmName,
            c.CertificateCode,
            c.CertificateName,
            c.StandardType,
            c.IssuedBy,
            c.IssueDate,
            c.ExpiryDate,
            daysRemaining = diffDays,
            c.CertificateUrl,
            status = dynamicStatus,
            c.ApprovedBy,
            c.ApprovedAt,
            c.RejectReason,
            c.Notes,
            c.CreatedAt,
            c.UpdatedAt
        });
    }

    /// <summary>
    /// API công khai tra cứu & thẩm định tính pháp lý của giấy chứng nhận (dành cho người tiêu dùng & quét QR)
    /// </summary>
    [HttpGet("verify/{certificateCode}")]
    public async Task<IActionResult> VerifyCertificate(string certificateCode)
    {
        if (string.IsNullOrWhiteSpace(certificateCode))
        {
            return BadRequest(new { message = "Vui lòng cung cấp mã chứng nhận cần tra cứu." });
        }

        var code = certificateCode.Trim();
        var cert = await _context.Certificates
            .Include(c => c.Supplier)
            .Include(c => c.Farm)
            .FirstOrDefaultAsync(c => c.CertificateCode == code);

        if (cert == null)
        {
            return NotFound(new { 
                verified = false, 
                message = $"Không tìm thấy giấy chứng nhận có mã số '{certificateCode}' trong hệ thống dữ liệu quốc gia ECC Agri-Chain." 
            });
        }

        var now = DateTime.UtcNow;
        var diffDays = (cert.ExpiryDate.Date - now.Date).Days;
        bool isValid = cert.Status != "Rejected" && cert.Status != "Revoked" && diffDays >= 0;

        return Ok(new {
            verified = true,
            isLegallyValid = isValid,
            certificateCode = cert.CertificateCode,
            certificateName = cert.CertificateName,
            standardType = cert.StandardType,
            issuedBy = cert.IssuedBy,
            issueDate = cert.IssueDate,
            expiryDate = cert.ExpiryDate,
            daysRemaining = diffDays,
            status = diffDays < 0 ? "Expired" : cert.Status,
            legalNotice = isValid 
                ? "Giấy chứng nhận đang có hiệu lực pháp lý đầy đủ, bảo chứng cho nguồn gốc nông sản an toàn."
                : (diffDays < 0 ? "CẢNH BÁO: Giấy chứng nhận này đã hết hạn sử dụng!" : "CẢNH BÁO: Giấy chứng nhận này chưa được phê duyệt hoặc đã bị thu hồi!"),
            supplier = new {
                cert.Supplier?.SupplierId,
                cert.Supplier?.SupplierName,
                cert.Supplier?.Representative,
                cert.Supplier?.Province
            },
            farm = cert.Farm != null ? new {
                cert.Farm.FarmId,
                cert.Farm.FarmName,
                cert.Farm.Address,
                cert.Farm.Province,
                cert.Farm.Area
            } : null,
            certificateUrl = cert.CertificateUrl
        });
    }

    /// <summary>
    /// Kiểm tra nông trại có chứng nhận đạt chuẩn hợp lệ hay không (dùng khi kiểm tra xuất kho lô hàng)
    /// </summary>
    [HttpGet("check-farm/{farmId}")]
    public async Task<IActionResult> CheckFarmCompliance(long farmId)
    {
        var now = DateTime.UtcNow;
        var validCert = await _context.Certificates
            .Where(c => c.FarmId == farmId && c.Status == "Valid" && c.ExpiryDate >= now)
            .OrderByDescending(c => c.ExpiryDate)
            .FirstOrDefaultAsync();

        if (validCert != null)
        {
            return Ok(new {
                hasValidCertificate = true,
                certificateCode = validCert.CertificateCode,
                standardType = validCert.StandardType,
                expiryDate = validCert.ExpiryDate,
                message = $"Nông trại đạt chuẩn {validCert.StandardType} hợp lệ."
            });
        }

        // Kiểm tra chứng nhận chung cấp cho Nhà cung cấp quản lý Farm này
        var farm = await _context.Farms.FindAsync(farmId);
        if (farm != null)
        {
            var supCert = await _context.Certificates
                .Where(c => c.SupplierId == farm.SupplierId && c.FarmId == null && c.Status == "Valid" && c.ExpiryDate >= now)
                .OrderByDescending(c => c.ExpiryDate)
                .FirstOrDefaultAsync();

            if (supCert != null)
            {
                return Ok(new {
                    hasValidCertificate = true,
                    certificateCode = supCert.CertificateCode,
                    standardType = supCert.StandardType,
                    expiryDate = supCert.ExpiryDate,
                    message = $"Nông trại thuộc HTX có chứng nhận {supCert.StandardType} cơ sở hợp lệ."
                });
            }
        }

        return Ok(new {
            hasValidCertificate = false,
            message = "CẢNH BÁO: Nông trại chưa có hoặc đã hết hạn giấy chứng nhận tiêu chuẩn an toàn (VietGAP/GlobalGAP)!"
        });
    }

    /// <summary>
    /// Tạo mới giấy chứng nhận (NCC gửi chờ duyệt hoặc Admin tạo trực tiếp)
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CertificateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.CertificateCode))
        {
            return BadRequest(new { message = "Mã số giấy chứng nhận không được để trống." });
        }

        if (await _context.Certificates.AnyAsync(c => c.CertificateCode.ToLower() == dto.CertificateCode.Trim().ToLower()))
        {
            return BadRequest(new { message = $"Mã chứng nhận '{dto.CertificateCode}' đã tồn tại trên hệ thống!" });
        }

        if (dto.ExpiryDate <= dto.IssueDate)
        {
            return BadRequest(new { message = "Ngày hết hạn phải sau ngày cấp chứng nhận!" });
        }

        var supplier = await _context.Suppliers.FindAsync(dto.SupplierId);
        if (supplier == null)
        {
            return BadRequest(new { message = "Nhà cung cấp không tồn tại trong hệ thống." });
        }

        var cert = new Certificate
        {
            SupplierId = dto.SupplierId,
            FarmId = dto.FarmId > 0 ? dto.FarmId : null,
            CertificateCode = dto.CertificateCode.Trim(),
            CertificateName = string.IsNullOrWhiteSpace(dto.CertificateName) 
                ? $"Chứng nhận {dto.StandardType} - {dto.CertificateCode}" 
                : dto.CertificateName.Trim(),
            StandardType = string.IsNullOrWhiteSpace(dto.StandardType) ? "VietGAP" : dto.StandardType.Trim(),
            IssuedBy = dto.IssuedBy?.Trim() ?? "Cơ quan Quản lý Chất lượng Nông nghiệp",
            IssueDate = dto.IssueDate,
            ExpiryDate = dto.ExpiryDate,
            CertificateUrl = dto.CertificateUrl,
            Status = dto.IsAdminCreated ? "Valid" : "Pending",
            ApprovedBy = dto.IsAdminCreated ? dto.CurrentUserId : null,
            ApprovedAt = dto.IsAdminCreated ? DateTime.UtcNow : null,
            Notes = dto.Notes,
            CreatedAt = DateTime.UtcNow
        };

        _context.Certificates.Add(cert);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = cert.CertificateId }, cert);
    }

    /// <summary>
    /// Cập nhật thông tin giấy chứng nhận
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(long id, [FromBody] CertificateDto dto)
    {
        var cert = await _context.Certificates.FindAsync(id);
        if (cert == null) return NotFound(new { message = "Không tìm thấy giấy chứng nhận." });

        if (dto.ExpiryDate <= dto.IssueDate)
        {
            return BadRequest(new { message = "Ngày hết hạn phải sau ngày cấp chứng nhận!" });
        }

        cert.CertificateCode = dto.CertificateCode?.Trim() ?? cert.CertificateCode;
        cert.CertificateName = dto.CertificateName?.Trim() ?? cert.CertificateName;
        cert.StandardType = dto.StandardType?.Trim() ?? cert.StandardType;
        cert.IssuedBy = dto.IssuedBy?.Trim() ?? cert.IssuedBy;
        cert.IssueDate = dto.IssueDate;
        cert.ExpiryDate = dto.ExpiryDate;
        if (!string.IsNullOrEmpty(dto.CertificateUrl)) cert.CertificateUrl = dto.CertificateUrl;
        if (dto.FarmId.HasValue) cert.FarmId = dto.FarmId.Value > 0 ? dto.FarmId.Value : null;
        cert.Notes = dto.Notes;
        cert.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Cập nhật giấy chứng nhận thành công.", cert });
    }

    /// <summary>
    /// Phê duyệt giấy chứng nhận (Dành cho Admin)
    /// </summary>
    [HttpPut("{id}/approve")]
    public async Task<IActionResult> Approve(long id, [FromQuery] long? adminId = 1)
    {
        var cert = await _context.Certificates.FindAsync(id);
        if (cert == null) return NotFound(new { message = "Không tìm thấy giấy chứng nhận." });

        cert.Status = "Valid";
        cert.ApprovedBy = adminId;
        cert.ApprovedAt = DateTime.UtcNow;
        cert.RejectReason = null;
        cert.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Đã thẩm định và phê duyệt giấy chứng nhận thành công!", cert });
    }

    /// <summary>
    /// Từ chối giấy chứng nhận (Dành cho Admin)
    /// </summary>
    [HttpPut("{id}/reject")]
    public async Task<IActionResult> Reject(long id, [FromBody] RejectDto dto)
    {
        var cert = await _context.Certificates.FindAsync(id);
        if (cert == null) return NotFound(new { message = "Không tìm thấy giấy chứng nhận." });

        cert.Status = "Rejected";
        cert.RejectReason = string.IsNullOrWhiteSpace(dto.Reason) 
            ? "Hồ sơ chứng nhận không đáp ứng quy chuẩn pháp lý hoặc tài liệu scan mờ/không hợp lệ." 
            : dto.Reason;
        cert.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Đã từ chối giấy chứng nhận.", cert });
    }

    /// <summary>
    /// Xóa giấy chứng nhận
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(long id)
    {
        var cert = await _context.Certificates.FindAsync(id);
        if (cert == null) return NotFound(new { message = "Không tìm thấy giấy chứng nhận." });

        _context.Certificates.Remove(cert);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Đã xóa giấy chứng nhận thành công." });
    }
}

public class CertificateDto
{
    public long SupplierId { get; set; }
    public long? FarmId { get; set; }
    public string CertificateCode { get; set; } = null!;
    public string CertificateName { get; set; } = null!;
    public string StandardType { get; set; } = "VietGAP";
    public string IssuedBy { get; set; } = null!;
    public DateTime IssueDate { get; set; }
    public DateTime ExpiryDate { get; set; }
    public string? CertificateUrl { get; set; }
    public string? Notes { get; set; }
    public bool IsAdminCreated { get; set; } = false;
    public long? CurrentUserId { get; set; }
}

public class RejectDto
{
    public string? Reason { get; set; }
}
