using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ecc.Infrastructure.Persistence;
using Ecc.Infrastructure.Services;
using Ecc.Domain.Entities;
using BCrypt.Net;

namespace Ecc.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IOtpService _otpService;

    public AuthController(ApplicationDbContext context, IOtpService otpService)
    {
        _context = context;
        _otpService = otpService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Vui lòng điền đầy đủ email và mật khẩu!" });
        }

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

        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        if (!isPasswordValid)
        {
            return Unauthorized(new { message = "Email hoặc mật khẩu không chính xác!" });
        }

        return Ok(new
        {
            token = "jwt_token_for_" + user.Email,
            user = new
            {
                userId = user.UserId,
                fullName = user.FullName,
                email = user.Email,
                phone = user.Phone,
                role = user.Role?.RoleName ?? "CUSTOMER",
                status = user.Status
            }
        });
    }

    // 1. API Gửi mã OTP đăng ký (qua Gmail hoặc SMS)
    [HttpPost("send-register-otp")]
    public async Task<IActionResult> SendRegisterOtp([FromBody] SendOtpRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Recipient))
        {
            return BadRequest(new { message = "Thông tin người nhận không hợp lệ!" });
        }

        // Kiểm tra xem email này đã tồn tại trong hệ thống chưa
        if (request.Type.ToUpper() == "EMAIL")
        {
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Recipient.Trim().ToLower());
            if (existingUser != null)
            {
                return BadRequest(new { message = "Email này đã được sử dụng bởi một tài khoản khác!" });
            }
        }

        string otp = await _otpService.GenerateAndSendOtpAsync(request.Recipient.Trim(), request.Type);

        return Ok(new
        {
            message = $"Đã tạo và gửi mã OTP thành công tới {request.Recipient} qua {request.Type}!",
            otp = otp // Trả về OTP trong response để hỗ trợ kiểm thử & môi trường demo
        });
    }

    // 2. API Đăng ký tài khoản kèm xác thực OTP thực tế
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FullName) || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Vui lòng nhập đầy đủ các thông tin bắt buộc!" });
        }

        // Xác thực mã OTP qua kênh người dùng đã chọn (Email hoặc SĐT)
        string verifyKey = request.VerifyMethod?.ToUpper() == "SMS" ? request.Phone ?? "" : request.Email;
        bool isOtpValid = _otpService.VerifyOtp(verifyKey, request.Otp);

        if (!isOtpValid)
        {
            return BadRequest(new { message = "Mã OTP không chính xác hoặc đã hết hạn (5 phút)!" });
        }

        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email.Trim().ToLower());
        if (existingUser != null)
        {
            return BadRequest(new { message = "Email này đã được đăng ký tài khoản!" });
        }

        var customerRole = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == "CUSTOMER");
        int roleId = customerRole?.RoleId ?? 3;

        var newUser = new User
        {
            FullName = request.FullName.Trim(),
            Email = request.Email.Trim().ToLower(),
            Phone = request.Phone?.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            RoleId = roleId,
            Status = "Active",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Users.Add(newUser);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Đăng ký tài khoản thành công! Vui lòng đăng nhập." });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(new { message = "Vui lòng nhập email tài khoản!" });
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email.Trim().ToLower());
        if (user == null)
        {
            return NotFound(new { message = "Không tìm thấy tài khoản với email này!" });
        }

        string otp = await _otpService.GenerateAndSendOtpAsync(request.Email.Trim(), "EMAIL");

        return Ok(new
        {
            message = "Đã gửi mã xác minh OTP về email của bạn!",
            otp = otp
        });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return BadRequest(new { message = "Vui lòng cung cấp đầy đủ email và mật khẩu mới!" });
        }

        bool isOtpValid = _otpService.VerifyOtp(request.Email, request.Otp);
        if (!isOtpValid)
        {
            return BadRequest(new { message = "Mã OTP không hợp lệ hoặc đã hết hạn!" });
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email.Trim().ToLower());
        if (user == null)
        {
            return NotFound(new { message = "Không tìm thấy tài khoản để đặt lại mật khẩu!" });
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại." });
    }
}

public class SendOtpRequest
{
    public string Recipient { get; set; } = string.Empty;
    public string Type { get; set; } = "EMAIL"; // EMAIL hoặc SMS
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class RegisterRequest
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string Password { get; set; } = string.Empty;
    public string Otp { get; set; } = string.Empty;
    public string VerifyMethod { get; set; } = "EMAIL";
}

public class ForgotPasswordRequest
{
    public string Email { get; set; } = string.Empty;
}

public class ResetPasswordRequest
{
    public string Email { get; set; } = string.Empty;
    public string Otp { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}
