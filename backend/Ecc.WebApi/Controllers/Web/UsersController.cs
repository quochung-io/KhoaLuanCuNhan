using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ecc.Infrastructure.Data;
using Ecc.Infrastructure.Entities;
using System.Security.Cryptography;
using System.Text;

namespace Ecc.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetUsers()
    {
        return await _context.Users.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetUser(long id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();
        return user;
    }

    [HttpPost("register")]
    public async Task<ActionResult<User>> Register(RegisterDto dto)
    {
        var cleanFullName = dto.Username?.Trim();
        var cleanEmail = dto.Email?.Trim().ToLower();
        var cleanPhone = dto.Phone?.Trim().Replace(" ", "").Replace("-", "");
        if (cleanPhone != null && cleanPhone.StartsWith("+84")) cleanPhone = "0" + cleanPhone.Substring(3);

        if (string.IsNullOrWhiteSpace(cleanFullName))
            return BadRequest(new { message = "Vui lòng nhập tên người dùng!" });

        if (string.IsNullOrWhiteSpace(cleanEmail))
            return BadRequest(new { message = "Vui lòng nhập địa chỉ email!" });

        var emailRegex = new System.Text.RegularExpressions.Regex(@"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$");
        if (!emailRegex.IsMatch(cleanEmail))
            return BadRequest(new { message = "Định dạng email không hợp lệ (ví dụ: contact@dalatgap.com)!" });

        if (!string.IsNullOrWhiteSpace(cleanPhone))
        {
            var phoneRegex = new System.Text.RegularExpressions.Regex(@"^0\d{9}$");
            if (!phoneRegex.IsMatch(cleanPhone))
                return BadRequest(new { message = "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0 (ví dụ: 0912345678)!" });
        }

        // Ràng buộc mật khẩu: tối thiểu 8 ký tự, có 1 ký tự đặc biệt, có chữ hoa, chữ thường và số
        if (string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest(new { message = "Vui lòng nhập mật khẩu!" });

        if (dto.Password.Length < 8)
            return BadRequest(new { message = "Mật khẩu phải có tối thiểu 8 ký tự!" });

        if (!dto.Password.Any(char.IsUpper))
            return BadRequest(new { message = "Mật khẩu phải chứa ít nhất 1 chữ cái in hoa (A-Z)!" });

        if (!dto.Password.Any(char.IsLower))
            return BadRequest(new { message = "Mật khẩu phải chứa ít nhất 1 chữ cái thường (a-z)!" });

        if (!dto.Password.Any(char.IsDigit))
            return BadRequest(new { message = "Mật khẩu phải chứa ít nhất 1 chữ số (0-9)!" });

        if (!dto.Password.Any(ch => !char.IsLetterOrDigit(ch)))
            return BadRequest(new { message = "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*...)!" });

        // 1. Kiểm tra Tên người dùng (FullName)
        if (await _context.Users.AnyAsync(u => u.FullName.ToLower() == cleanFullName.ToLower()))
            return BadRequest(new { message = $"Tên người dùng '{cleanFullName}' đã tồn tại trên hệ thống! Vui lòng chọn tên người dùng khác." });

        // 2. Kiểm tra Email
        if (await _context.Users.AnyAsync(u => u.Email.ToLower() == cleanEmail))
            return BadRequest(new { message = $"Email '{cleanEmail}' đã tồn tại trong hệ thống! Mỗi email chỉ được đăng ký 1 tài khoản." });

        // 3. Kiểm tra Số điện thoại
        if (!string.IsNullOrWhiteSpace(cleanPhone) && await _context.Users.AnyAsync(u => u.Phone == cleanPhone))
            return BadRequest(new { message = $"Số điện thoại '{cleanPhone}' đã tồn tại trong hệ thống! Mỗi số điện thoại chỉ được đăng ký 1 tài khoản." });

        // Quyết định RoleId dựa theo Role string
        int roleId = (dto.Role ?? "customer").ToLower() switch
        {
            "admin" => 1,
            "supplier" => 2,
            _ => 3 // customer mặc định
        };

        var user = new User
        {
            FullName = cleanFullName,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Email = cleanEmail,
            RoleId = roleId,
            Phone = cleanPhone,
            Status = "Active",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        try
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, user);
        }
        catch (DbUpdateException)
        {
            return BadRequest(new { message = "Thông tin đăng ký (Tên người dùng, Email hoặc Số điện thoại) đã tồn tại trên hệ thống. Vui lòng nhập thông tin khác!" });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<User>> Login(LoginDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.FullName == dto.Username || u.Email == dto.Username);
        if (user == null) return Unauthorized("Invalid username or password.");

        bool isPasswordValid = false;
        try
        {
            isPasswordValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
        }
        catch
        {
            isPasswordValid = (user.PasswordHash == dto.Password || user.PasswordHash == HashPassword(dto.Password));
        }

        if (!isPasswordValid) return Unauthorized("Invalid username or password.");

        return user;
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(long id, [FromBody] UpdateUserDto dto)
    {
        if (dto.UserId.HasValue && dto.UserId.Value > 0 && id != dto.UserId.Value)
            return BadRequest(new { message = "ID không trùng khớp." });
        
        var existingUser = await _context.Users.FindAsync(id);
        if (existingUser == null) return NotFound(new { message = "Không tìm thấy người dùng." });

        var cleanFullName = dto.FullName?.Trim();
        var cleanEmail = dto.Email?.Trim().ToLower();
        var cleanPhone = dto.Phone?.Trim();

        if (!string.IsNullOrWhiteSpace(cleanFullName) && cleanFullName.ToLower() != existingUser.FullName.ToLower())
        {
            if (await _context.Users.AnyAsync(u => u.UserId != id && u.FullName.ToLower() == cleanFullName.ToLower()))
            {
                return BadRequest(new { message = $"Tên người dùng '{cleanFullName}' đã tồn tại trên hệ thống! Vui lòng chọn tên người dùng khác." });
            }
            existingUser.FullName = cleanFullName;
        }

        if (!string.IsNullOrWhiteSpace(cleanEmail) && cleanEmail != existingUser.Email.ToLower())
        {
            if (await _context.Users.AnyAsync(u => u.UserId != id && u.Email.ToLower() == cleanEmail))
            {
                return BadRequest(new { message = $"Email '{cleanEmail}' đã được đăng ký tài khoản! Vui lòng nhập email khác." });
            }
            existingUser.Email = cleanEmail;
        }

        if (!string.IsNullOrWhiteSpace(cleanPhone) && cleanPhone != existingUser.Phone)
        {
            if (await _context.Users.AnyAsync(u => u.UserId != id && u.Phone == cleanPhone))
            {
                return BadRequest(new { message = $"Số điện thoại '{cleanPhone}' đã được đăng ký cho một tài khoản khác! Vui lòng sử dụng số điện thoại khác." });
            }
            existingUser.Phone = cleanPhone;
        }

        if (dto.RoleId.HasValue && dto.RoleId.Value > 0)
        {
            existingUser.RoleId = dto.RoleId.Value;
        }

        if (!string.IsNullOrEmpty(dto.Status))
        {
            existingUser.Status = dto.Status;
        }

        var newPass = !string.IsNullOrEmpty(dto.Password) ? dto.Password : dto.PasswordHash;
        if (!string.IsNullOrEmpty(newPass) && newPass != existingUser.PasswordHash)
        {
            existingUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPass);
        }

        existingUser.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
            return Ok(existingUser);
        }
        catch (DbUpdateException)
        {
            return BadRequest(new { message = "Thông tin cập nhật (Tên người dùng, Email hoặc Số điện thoại) bị trùng lặp với người dùng khác!" });
        }
    }

    // Danh sách đối tác / Nhà cung cấp (kèm thông tin trang trại và chứng nhận)
    [HttpGet("suppliers")]
    public async Task<IActionResult> GetSuppliers()
    {
        var suppliers = await _context.Suppliers
            .Include(s => s.User)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

        var supplierIds = suppliers.Select(s => (long?)s.SupplierId).ToList();
        var farms = await _context.Farms
            .Where(f => supplierIds.Contains(f.SupplierId))
            .ToListAsync();

        var result = suppliers.Select(s => {
            var farm = farms.FirstOrDefault(f => f.SupplierId == s.SupplierId);
            return new {
                supplierId = s.SupplierId,
                userId = s.UserId,
                fullName = s.SupplierName,
                representative = s.Representative ?? s.User?.FullName,
                businessLicense = s.BusinessLicense,
                email = s.User?.Email,
                phone = s.User?.Phone,
                status = s.ApprovalStatus ?? s.User?.Status ?? "Pending",
                rejectReason = s.RejectReason,
                createdAt = s.CreatedAt,
                approvedAt = s.ApprovedAt,
                farm = farm == null ? null : new {
                    farmId = farm.FarmId,
                    farmName = farm.FarmName,
                    address = farm.Address,
                    province = farm.Province,
                    district = farm.District,
                    area = farm.Area,
                    cropType = farm.CropType,
                    productionStandard = farm.ProductionStandard,
                    status = farm.Status
                }
            };
        });

        return Ok(result);
    }

    // Đăng ký tài khoản Nhà cung cấp / Đối tác mới
    [HttpPost("supplier-register")]
    public async Task<IActionResult> SupplierRegister([FromBody] SupplierRegisterDto dto)
    {
        var cleanFullName = dto.FullName?.Trim() ?? dto.StoreName?.Trim();
        var cleanEmail = dto.Email?.Trim().ToLower();
        var cleanPhone = dto.Phone?.Trim().Replace(" ", "").Replace("-", "");
        if (cleanPhone != null && cleanPhone.StartsWith("+84")) cleanPhone = "0" + cleanPhone.Substring(3);

        if (string.IsNullOrWhiteSpace(cleanFullName))
            return BadRequest(new { message = "Vui lòng nhập tên nhà cung cấp / hợp tác xã!" });

        if (string.IsNullOrWhiteSpace(cleanEmail))
            return BadRequest(new { message = "Vui lòng nhập địa chỉ email!" });

        var emailRegex = new System.Text.RegularExpressions.Regex(@"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$");
        if (!emailRegex.IsMatch(cleanEmail))
            return BadRequest(new { message = "Định dạng email không hợp lệ (ví dụ: contact@dalatgap.com)!" });

        if (string.IsNullOrWhiteSpace(cleanPhone))
            return BadRequest(new { message = "Vui lòng nhập số điện thoại liên hệ!" });

        var phoneRegex = new System.Text.RegularExpressions.Regex(@"^0\d{9}$");
        if (!phoneRegex.IsMatch(cleanPhone))
            return BadRequest(new { message = "Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 chữ số và bắt đầu bằng số 0 (ví dụ: 0912345678)." });

        // Ràng buộc mật khẩu: tối thiểu 8 ký tự, có 1 ký tự đặc biệt, có chữ hoa, chữ thường và số
        if (string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest(new { message = "Vui lòng nhập mật khẩu!" });

        if (dto.Password.Length < 8)
            return BadRequest(new { message = "Mật khẩu phải có tối thiểu 8 ký tự!" });

        if (!dto.Password.Any(char.IsUpper))
            return BadRequest(new { message = "Mật khẩu phải chứa ít nhất 1 chữ cái in hoa (A-Z)!" });

        if (!dto.Password.Any(char.IsLower))
            return BadRequest(new { message = "Mật khẩu phải chứa ít nhất 1 chữ cái thường (a-z)!" });

        if (!dto.Password.Any(char.IsDigit))
            return BadRequest(new { message = "Mật khẩu phải chứa ít nhất 1 chữ số (0-9)!" });

        if (!dto.Password.Any(ch => !char.IsLetterOrDigit(ch)))
            return BadRequest(new { message = "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*...)!" });

        // Ràng buộc tính duy nhất trong database
        if (await _context.Users.AnyAsync(u => u.FullName.ToLower() == cleanFullName.ToLower()))
            return BadRequest(new { message = $"Tên đơn vị '{cleanFullName}' đã tồn tại trên hệ thống! Vui lòng chọn tên khác." });

        if (await _context.Users.AnyAsync(u => u.Email.ToLower() == cleanEmail))
            return BadRequest(new { message = $"Email '{cleanEmail}' đã tồn tại trong hệ thống! Mỗi email chỉ được đăng ký 1 tài khoản." });

        if (await _context.Users.AnyAsync(u => u.Phone == cleanPhone))
            return BadRequest(new { message = $"Số điện thoại '{cleanPhone}' đã tồn tại trong hệ thống! Mỗi số điện thoại chỉ được đăng ký 1 tài khoản." });

        try
        {
            // 1. Tạo tài khoản User (Role = 2 SUPPLIER, Status = "Pending")
            var user = new User
            {
                FullName = cleanFullName,
                Email = cleanEmail,
                Phone = cleanPhone,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                RoleId = 2,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // 2. Tạo bản ghi Supplier trong bảng Suppliers (bảng có sẵn trong CSDL)
            var supplier = new Supplier
            {
                UserId = user.UserId,
                SupplierName = cleanFullName,
                Representative = !string.IsNullOrWhiteSpace(dto.FullName) ? dto.FullName.Trim() : cleanFullName,
                BusinessLicense = dto.BusinessLicense ?? dto.IdentityCard ?? $"BL-{DateTime.UtcNow:yyyyMMdd}-{user.UserId}",
                Address = dto.Address ?? "Đang cập nhật",
                Province = dto.Province ?? "Lâm Đồng",
                Description = $"Chuyên nông sản sạch, đạt chuẩn {dto.ProductionStandard ?? "VietGAP"}",
                ApprovalStatus = "Pending",
                CreatedAt = DateTime.UtcNow
            };
            _context.Suppliers.Add(supplier);
            await _context.SaveChangesAsync();

            // 3. Tạo thông tin vùng trồng / trang trại tương ứng trong bảng Farms
            var farm = new Farm
            {
                SupplierId = supplier.SupplierId,
                FarmName = !string.IsNullOrWhiteSpace(dto.FarmName) ? dto.FarmName.Trim() : $"{cleanFullName} Farm",
                Address = dto.Address ?? "Đang cập nhật",
                Province = dto.Province ?? "Lâm Đồng",
                District = dto.District ?? "Đà Lạt",
                Area = dto.Area.HasValue && dto.Area > 0 ? dto.Area.Value : 2.5m,
                CropType = dto.CropType ?? "Rau củ quả sạch",
                ProductionStandard = dto.ProductionStandard ?? "VietGAP",
                Status = "Pending"
            };
            _context.Farms.Add(farm);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Đăng ký hồ sơ đối tác thành công! Hồ sơ của bạn đã được tiếp nhận và đang chờ Admin kiểm duyệt (thường trong vòng 24h).",
                userId = user.UserId,
                supplierId = supplier.SupplierId,
                status = "Pending"
            });
        }
        catch (DbUpdateException)
        {
            return BadRequest(new { message = "Thông tin đăng ký (Tên đơn vị, Email hoặc Số điện thoại) đã tồn tại trên hệ thống. Mỗi email và số điện thoại chỉ được đăng ký 1 tài khoản!" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Lỗi khi đăng ký đối tác: {ex.Message}" });
        }
    }

    // Phê duyệt tài khoản Nhà cung cấp (Supplier/HTX)
    [HttpPut("{id}/approve")]
    public async Task<IActionResult> ApproveSupplier(long id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound(new { message = "Không tìm thấy người dùng." });

        if (user.RoleId != 2)
        {
            return BadRequest(new { message = "Chỉ áp dụng phê duyệt cho tài khoản Nhà cung cấp (Supplier)." });
        }

        user.Status = "Active";
        user.UpdatedAt = DateTime.UtcNow;

        var supplier = await _context.Suppliers.FirstOrDefaultAsync(s => s.UserId == id);
        if (supplier != null)
        {
            supplier.ApprovalStatus = "Approved";
            supplier.ApprovedBy = 1;
            supplier.ApprovedAt = DateTime.UtcNow;
            supplier.RejectReason = null;

            var farms = await _context.Farms.Where(f => f.SupplierId == supplier.SupplierId).ToListAsync();
            foreach (var f in farms) f.Status = "Active";
        }

        await _context.SaveChangesAsync();

        return Ok(new { message = $"Đã phê duyệt tài khoản nhà cung cấp '{user.FullName}' thành công!", status = "Active" });
    }

    // Từ chối hồ sơ Nhà cung cấp
    [HttpPut("{id}/reject")]
    public async Task<IActionResult> RejectSupplier(long id, [FromBody] RejectSupplierDto? dto)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound(new { message = "Không tìm thấy người dùng." });

        if (user.RoleId != 2)
        {
            return BadRequest(new { message = "Chỉ áp dụng từ chối cho tài khoản Nhà cung cấp (Supplier)." });
        }

        var reason = !string.IsNullOrWhiteSpace(dto?.Reason) 
            ? dto.Reason 
            : "Hồ sơ chưa đạt tiêu chuẩn nông sản an toàn hoặc thiếu giấy tờ xác thực.";

        user.Status = "Rejected";
        user.UpdatedAt = DateTime.UtcNow;

        var supplier = await _context.Suppliers.FirstOrDefaultAsync(s => s.UserId == id);
        if (supplier != null)
        {
            supplier.ApprovalStatus = "Rejected";
            supplier.RejectReason = reason;

            var farms = await _context.Farms.Where(f => f.SupplierId == supplier.SupplierId).ToListAsync();
            foreach (var f in farms) f.Status = "Rejected";
        }

        await _context.SaveChangesAsync();

        return Ok(new { 
            message = $"Đã từ chối hồ sơ của nhà cung cấp '{user.FullName}'.", 
            status = "Rejected",
            reason = reason
        });
    }

    // Khóa / Mở khóa trạng thái tài khoản
    [HttpPut("{id}/toggle-status")]
    public async Task<IActionResult> ToggleUserStatus(long id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound(new { message = "Không tìm thấy người dùng." });

        user.Status = (user.Status?.ToLower() == "active" || user.Status?.ToLower() == "hoạt động") ? "Inactive" : "Active";
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { message = $"Đã chuyển trạng thái tài khoản sang '{user.Status}'.", status = user.Status });
    }

    // Xóa người dùng (Tự động Soft Delete nếu đã có dữ liệu ràng buộc)
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(long id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound(new { message = "Không tìm thấy người dùng." });

        bool hasOrders = await _context.Orders.AnyAsync(o => o.CustomerId == id);
        bool hasProducts = await _context.Products.AnyAsync(p => p.SupplierId == id);

        if (hasOrders || hasProducts)
        {
            // Chuyển sang Soft Delete để tránh lỗi Foreign Key Constraint
            user.Status = "Inactive";
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok(new { 
                message = $"Người dùng này đã có {(hasOrders ? "đơn hàng" : "sản phẩm")} trong hệ thống nên đã được chuyển sang trạng thái Khóa (Soft Delete) để bảo vệ toàn vẹn dữ liệu.", 
                softDeleted = true 
            });
        }

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Đã xóa người dùng thành công khỏi cơ sở dữ liệu.", softDeleted = false });
    }

    private static string HashPassword(string password)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password));
        var builder = new StringBuilder();
        foreach (var b in bytes)
        {
            builder.Append(b.ToString("x2"));
        }
        return builder.ToString();
    }
}

public class RegisterDto
{
    public string Username { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Role { get; set; } = null!;
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
}

public class LoginDto
{
    public string Username { get; set; } = null!;
    public string Password { get; set; } = null!;
}

public class UpdateUserDto
{
    public long? UserId { get; set; }
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Password { get; set; }
    public string? PasswordHash { get; set; }
    public int? RoleId { get; set; }
    public string? Status { get; set; }
}

public class SupplierRegisterDto
{
    public string? FullName { get; set; }
    public string? StoreName { get; set; }
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string? Phone { get; set; }
    public string? FarmName { get; set; }
    public string? Address { get; set; }
    public string? Province { get; set; }
    public string? District { get; set; }
    public decimal? Area { get; set; }
    public string? CropType { get; set; }
    public string? ProductionStandard { get; set; }
    public string? IdentityCard { get; set; }
    public string? BusinessLicense { get; set; }
    public string? CertNumber { get; set; }
}

public class RejectSupplierDto
{
    public string? Reason { get; set; }
}

