using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ecc.Infrastructure.Data;
using Ecc.Infrastructure.Entities;
using Ecc.Infrastructure.Services;
using BCrypt.Net;

namespace Ecc.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IOtpService _otpService;

    public AuthController(AppDbContext context, IOtpService otpService)
    {
        _context = context;
        _otpService = otpService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Vui lòng điền đầy đủ email/họ tên và mật khẩu!" });
        }

        var input = request.Email.Trim().ToLower();

        // Tìm user theo Email hoặc FullName
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == input || u.FullName.ToLower() == input);

        if (user == null)
        {
            return Unauthorized(new { message = "Email/Tên đăng nhập hoặc mật khẩu không chính xác!" });
        }

        if (user.Status != null && user.Status != "Active" && user.Status != "Hoạt động")
        {
            return BadRequest(new { message = "Tài khoản của bạn đã bị khóa hoặc chưa được kích hoạt!" });
        }

        // Kiểm tra mật khẩu (hỗ trợ cả mật khẩu băm BCrypt hoặc mật khẩu demo nếu có)
        bool isPasswordValid = false;
        try
        {
            isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        }
        catch
        {
            isPasswordValid = (user.PasswordHash == request.Password);
        }

        if (!isPasswordValid)
        {
            return Unauthorized(new { message = "Email/Tên đăng nhập hoặc mật khẩu không chính xác!" });
        }

        // Map role name theo RoleId: 1 = ADMIN, 2 = SUPPLIER, 3 = CUSTOMER
        string roleName = user.RoleId switch
        {
            1 => "ADMIN",
            2 => "SUPPLIER",
            _ => "CUSTOMER"
        };

        return Ok(new
        {
            token = "jwt_token_for_" + user.Email,
            user = new
            {
                userId = user.UserId,
                fullName = user.FullName,
                email = user.Email,
                phone = user.Phone,
                role = roleName,
                roleId = user.RoleId,
                status = user.Status ?? "Active"
            }
        });
    }

    [HttpPost("send-register-otp")]
    public async Task<IActionResult> SendRegisterOtp([FromBody] SendOtpRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Recipient))
        {
            return BadRequest(new { message = "Thông tin người nhận không hợp lệ!" });
        }

        if (request.Type.ToUpper() == "EMAIL")
        {
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == request.Recipient.Trim().ToLower());
            if (existingUser != null)
            {
                return BadRequest(new { message = "Email này đã được sử dụng bởi một tài khoản khác!" });
            }
        }

        string otp = await _otpService.GenerateAndSendOtpAsync(request.Recipient.Trim(), request.Type);

        return Ok(new
        {
            message = $"Đã tạo và gửi mã OTP thành công tới {request.Recipient} qua {request.Type}!",
            otp = otp
        });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FullName) || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Vui lòng nhập đầy đủ các thông tin bắt buộc!" });
        }

        // Xác thực mã OTP nếu có truyền mã OTP
        if (!string.IsNullOrWhiteSpace(request.Otp))
        {
            string verifyKey = request.VerifyMethod?.ToUpper() == "SMS" ? (request.Phone ?? "") : request.Email;
            bool isOtpValid = _otpService.VerifyOtp(verifyKey, request.Otp);
            if (!isOtpValid)
            {
                return BadRequest(new { message = "Mã OTP không chính xác hoặc đã hết hạn (5 phút)!" });
            }
        }

        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.Trim().ToLower());
        if (existingUser != null)
        {
            return BadRequest(new { message = "Email này đã được đăng ký tài khoản!" });
        }

        var newUser = new User
        {
            FullName = request.FullName.Trim(),
            Email = request.Email.Trim().ToLower(),
            Phone = request.Phone?.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            RoleId = 3, // Mặc định là CUSTOMER
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

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.Trim().ToLower());
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

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.Trim().ToLower());
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
    public string Type { get; set; } = "EMAIL";
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
    public string? Otp { get; set; }
    public string? VerifyMethod { get; set; }
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
