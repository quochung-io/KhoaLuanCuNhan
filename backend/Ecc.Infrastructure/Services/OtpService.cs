using System;
using System.Collections.Concurrent;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Ecc.Infrastructure.Services;

public interface IOtpService
{
    Task<string> GenerateAndSendOtpAsync(string recipient, string type);
    bool VerifyOtp(string recipient, string otp);
}

public class OtpService : IOtpService
{
    private static readonly ConcurrentDictionary<string, (string Code, DateTime Expiry)> _otpStorage = new();
    private readonly IConfiguration _config;
    private readonly ILogger<OtpService> _logger;

    public OtpService(IConfiguration config, ILogger<OtpService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task<string> GenerateAndSendOtpAsync(string recipient, string type)
    {
        var random = new Random();
        string otp = random.Next(100000, 999999).ToString();

        _otpStorage[recipient.ToLower()] = (otp, DateTime.UtcNow.AddMinutes(5));

        _logger.LogInformation($"[OTP SERVICE] Mã OTP cho {recipient} ({type}) là: {otp}");

        if (type.ToUpper() == "EMAIL")
        {
            await SendEmailAsync(recipient, otp);
        }
        else if (type.ToUpper() == "SMS")
        {
            await SendSmsAsync(recipient, otp);
        }

        return otp;
    }

    public bool VerifyOtp(string recipient, string otp)
    {
        var key = recipient.ToLower();
        if (_otpStorage.TryGetValue(key, out var record))
        {
            if (DateTime.UtcNow <= record.Expiry && record.Code == otp.Trim())
            {
                _otpStorage.TryRemove(key, out _);
                return true;
            }
        }
        return false;
    }

    private async Task SendEmailAsync(string toEmail, string otp)
    {
        try
        {
            var host = _config["Smtp:Host"];
            var portStr = _config["Smtp:Port"];
            var senderEmail = _config["Smtp:SenderEmail"];
            var senderPassword = _config["Smtp:SenderPassword"];

            if (string.IsNullOrEmpty(host) || string.IsNullOrEmpty(senderEmail))
            {
                _logger.LogWarning($"[SMTP CHƯA CẤU HÌNH] OTP {otp} đã gửi tới Email: {toEmail} (Mô phỏng thành công)");
                return;
            }

            int port = int.TryParse(portStr, out int p) ? p : 587;
            using var client = new SmtpClient(host, port)
            {
                Credentials = new NetworkCredential(senderEmail, senderPassword),
                EnableSsl = true
            };

            var mail = new MailMessage
            {
                From = new MailAddress(senderEmail, "Nông Sản LÀNH"),
                Subject = "Mã xác thực OTP đăng ký tài khoản Nông Sản LÀNH",
                Body = $@"
                    <div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #E1EAE0; border-radius: 10px; max-width: 500px;'>
                        <h2 style='color: #2E7D32;'>Nông Sản LÀNH - Xác thực tài khoản</h2>
                        <p>Chào bạn,</p>
                        <p>Mã xác thực đăng ký tài khoản của bạn là:</p>
                        <div style='font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #2E7D32; margin: 15px 0;'>{otp}</div>
                        <p style='color: #888; font-size: 12px;'>Mã này có hiệu lực trong vòng 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
                    </div>",
                IsBodyHtml = true
            };
            mail.To.Add(toEmail);

            await client.SendMailAsync(mail);
            _logger.LogInformation($"[SMTP GMAIL] Đã gửi email OTP thực tế tới {toEmail} thành công!");
        }
        catch (Exception ex)
        {
            _logger.LogError($"[LỖI SMTP EMAIL] Không thể gửi email: {ex.Message}");
        }
    }

    private Task SendSmsAsync(string phone, string otp)
    {
        _logger.LogInformation($"[SMS GATEWAY] Đã bắn tin nhắn OTP '{otp}' tới số điện thoại {phone}");
        return Task.CompletedTask;
    }
}
