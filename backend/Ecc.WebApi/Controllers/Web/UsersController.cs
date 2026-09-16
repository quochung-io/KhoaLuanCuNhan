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
        var cleanPhone = dto.Phone?.Trim();

        if (string.IsNullOrWhiteSpace(cleanFullName))
            return BadRequest(new { message = "Vui lòng nhập tên người dùng!" });

        if (string.IsNullOrWhiteSpace(cleanEmail))
            return BadRequest(new { message = "Vui lòng nhập địa chỉ email!" });

        // 1. Kiểm tra Tên người dùng (FullName)
        if (await _context.Users.AnyAsync(u => u.FullName.ToLower() == cleanFullName.ToLower()))
            return BadRequest(new { message = $"Tên người dùng '{cleanFullName}' đã tồn tại trên hệ thống! Vui lòng chọn tên người dùng khác." });

        // 2. Kiểm tra Email
        if (await _context.Users.AnyAsync(u => u.Email.ToLower() == cleanEmail))
            return BadRequest(new { message = $"Email '{cleanEmail}' đã được đăng ký tài khoản! Vui lòng nhập email khác." });

        // 3. Kiểm tra Số điện thoại
        if (!string.IsNullOrWhiteSpace(cleanPhone) && await _context.Users.AnyAsync(u => u.Phone == cleanPhone))
            return BadRequest(new { message = $"Số điện thoại '{cleanPhone}' đã được đăng ký cho một tài khoản khác! Vui lòng sử dụng số điện thoại khác." });

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
        await _context.SaveChangesAsync();

        return Ok(new { message = $"Đã phê duyệt tài khoản nhà cung cấp '{user.FullName}' thành công!", status = "Active" });
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

