using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ecc.Infrastructure.Persistence;
using BCrypt.Net;

namespace Ecc.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AuthController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Vui lòng điền đầy đủ email và mật khẩu!" });
        }

        // Tìm user theo email
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null)
        {
            return Unauthorized(new { message = "Email hoặc mật khẩu không chính xác!" });
        }

        if (user.Status != "Active")
        {
            return BadRequest(new { message = "Tài khoản của bạn đã bị khóa hoặc chưa được kích hoạt!" });
        }

        // Kiểm tra mật khẩu Bcrypt Hash
        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        if (!isPasswordValid)
        {
            return Unauthorized(new { message = "Email hoặc mật khẩu không chính xác!" });
        }

        // Đăng nhập thành công, trả về thông tin user ảo kèm token demo
        return Ok(new
        {
            token = "demo_jwt_token_for_" + user.Email,
            user = new
            {
                userId = user.UserId,
                fullName = user.FullName,
                email = user.Email,
                role = user.Role?.RoleName ?? "CUSTOMER",
                status = user.Status
            }
        });
    }
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
