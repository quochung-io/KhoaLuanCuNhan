// ============================================================================
// TỆP MÃ NGUỒN: backend/Ecc.WebApi/Services/JwtService.cs
// MÔ TẢ: Dịch vụ khởi tạo và xác thực mã thông báo bảo mật JWT (Access Token & Refresh Token) cho người dùng.
// ============================================================================
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Ecc.Infrastructure.Entities;
using Microsoft.IdentityModel.Tokens;

namespace Ecc.WebApi.Services;

public interface IJwtService
{
    string GenerateAccessToken(User user, long? supplierId = null, long? farmId = null);
    string GenerateRefreshToken();
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
}

public class JwtService : IJwtService
{
    private readonly IConfiguration _config;

    public JwtService(IConfiguration config)
    {
        _config = config;
    }

    /// <summary>Thực thi nghiệp vụ hàm GenerateAccessToken</summary>
    public string GenerateAccessToken(User user, long? supplierId = null, long? farmId = null)
    {
        var secretKey = _config["JwtSettings:SecretKey"] ?? "ECC_NongSanLanh_Secret_Key_Super_Secure_2026_JWT_Token_Key!#$";
        var issuer = _config["JwtSettings:Issuer"] ?? "ECC_NongSanLanh";
        var audience = _config["JwtSettings:Audience"] ?? "ECC_NongSanLanh_Users";
        var expirationMinutes = int.TryParse(_config["JwtSettings:AccessTokenExpirationMinutes"], out var exp) ? exp : 60;

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        string roleName = user.RoleId switch
        {
            1 => "ADMIN",
            2 => "SUPPLIER",
            _ => "CUSTOMER"
        };

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new(ClaimTypes.Name, user.FullName ?? ""),
            new(ClaimTypes.Email, user.Email ?? ""),
            new(ClaimTypes.Role, roleName),
            new("roleId", user.RoleId.ToString()),
            new("status", user.Status ?? "Active")
        };

        if (supplierId.HasValue)
        {
            claims.Add(new Claim("supplierId", supplierId.Value.ToString()));
        }

        if (farmId.HasValue)
        {
            claims.Add(new Claim("farmId", farmId.Value.ToString()));
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(expirationMinutes),
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = credentials
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    /// <summary>Thực thi nghiệp vụ hàm GenerateRefreshToken</summary>
    public string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    public ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
    {
        var secretKey = _config["JwtSettings:SecretKey"] ?? "ECC_NongSanLanh_Secret_Key_Super_Secure_2026_JWT_Token_Key!#$";
        var issuer = _config["JwtSettings:Issuer"] ?? "ECC_NongSanLanh";
        var audience = _config["JwtSettings:Audience"] ?? "ECC_NongSanLanh_Users";

        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateAudience = true,
            ValidAudience = audience,
            ValidateIssuer = true,
            ValidIssuer = issuer,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
            ValidateLifetime = false // Bỏ qua hạn token để đọc claims khi refresh token
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        try
        {
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out var securityToken);
            if (securityToken is not JwtSecurityToken jwtSecurityToken ||
                !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
            {
                return null;
            }

            return principal;
        }
        catch
        {
            return null;
        }
    }
}
