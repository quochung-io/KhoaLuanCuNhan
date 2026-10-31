// ============================================================================
// TỆP MÃ NGUỒN: backend/Ecc.WebApi/Services/MoMoPaymentService.cs
// MÔ TẢ: Dịch vụ tích hợp cổng thanh toán điện tử MoMo (Tạo chữ ký điện tử HMAC-SHA256 và khởi tạo giao dịch thanh toán).
// ============================================================================
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace Ecc.WebApi.Services;

public class MoMoSettings
{
    public string Endpoint { get; set; } = "https://test-payment.momo.vn/v2/gateway/api/create";
    public string PartnerCode { get; set; } = "MOMO";
    public string AccessKey { get; set; } = "F8BBA842ECF85";
    public string SecretKey { get; set; } = "K951B6PE1waDMi640xX0huTrY0hs6AHq";
    public string ReturnUrl { get; set; } = "lanhfarm://payment/momo-result";
    public string IpnUrl { get; set; } = "http://localhost:5023/api/PaymentWebhook/momo";
}

public class MoMoCreatePaymentResponse
{
    public string PartnerCode { get; set; } = string.Empty;
    public string OrderId { get; set; } = string.Empty;
    public string RequestId { get; set; } = string.Empty;
    public long Amount { get; set; }
    public long ResponseTime { get; set; }
    public string Message { get; set; } = string.Empty;
    public int ResultCode { get; set; }
    public string? PayUrl { get; set; }
    public string? Deeplink { get; set; }
    public string? QrCodeUrl { get; set; }
}

public class MoMoIpnRequest
{
    public string PartnerCode { get; set; } = string.Empty;
    public string OrderId { get; set; } = string.Empty;
    public string RequestId { get; set; } = string.Empty;
    public long Amount { get; set; }
    public string OrderInfo { get; set; } = string.Empty;
    public string OrderType { get; set; } = string.Empty;
    public long TransId { get; set; }
    public int ResultCode { get; set; }
    public string Message { get; set; } = string.Empty;
    public string PayType { get; set; } = string.Empty;
    public long ResponseTime { get; set; }
    public string ExtraData { get; set; } = string.Empty;
    public string Signature { get; set; } = string.Empty;
}

public interface IMoMoPaymentService
{
    Task<MoMoCreatePaymentResponse> CreatePaymentAsync(long orderId, string orderCode, decimal amount, string? orderInfo = null);
    bool VerifySignature(MoMoIpnRequest ipn);
}

public class MoMoPaymentService : IMoMoPaymentService
{
    private readonly MoMoSettings _settings;
    private readonly HttpClient _httpClient;
    private readonly ILogger<MoMoPaymentService> _logger;

    public MoMoPaymentService(IConfiguration config, ILogger<MoMoPaymentService> logger)
    {
        _settings = new MoMoSettings();
        config.GetSection("MoMo").Bind(_settings);
        _httpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(15) };
        _logger = logger;
    }

    /// <summary>Tạo mới hoặc thêm dữ liệu (CreatePaymentAsync)</summary>
    public async Task<MoMoCreatePaymentResponse> CreatePaymentAsync(long orderId, string orderCode, decimal amount, string? orderInfo = null)
    {
        string requestId = $"{orderCode}_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";
        string momoOrderId = $"{orderCode}_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";
        long longAmount = (long)Math.Round(amount);
        string info = string.IsNullOrWhiteSpace(orderInfo) 
            ? $"Thanh toan don hang #{orderCode} tai LANH Farm" 
            : orderInfo;
        string extraData = "";
        string requestType = "captureWallet";

        // Chuỗi dữ liệu thô để ký HMAC-SHA256 theo tài liệu MoMo v2
        string rawSignature = $"accessKey={_settings.AccessKey}" +
                              $"&amount={longAmount}" +
                              $"&extraData={extraData}" +
                              $"&ipnUrl={_settings.IpnUrl}" +
                              $"&orderId={momoOrderId}" +
                              $"&orderInfo={info}" +
                              $"&partnerCode={_settings.PartnerCode}" +
                              $"&redirectUrl={_settings.ReturnUrl}" +
                              $"&requestId={requestId}" +
                              $"&requestType={requestType}";

        string signature = ComputeHmacSha256(rawSignature, _settings.SecretKey);

        var requestBody = new
        {
            partnerCode = _settings.PartnerCode,
            partnerName = "LÀNH Farm",
            storeId = "LanhFarmStore",
            requestId,
            amount = longAmount,
            orderId = momoOrderId,
            orderInfo = info,
            redirectUrl = _settings.ReturnUrl,
            ipnUrl = _settings.IpnUrl,
            lang = "vi",
            extraData,
            requestType,
            signature
        };

        var jsonOptions = new JsonSerializerOptions
        {
            Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
        };
        var json = JsonSerializer.Serialize(requestBody, jsonOptions);
        _logger.LogInformation("Gửi request tạo giao dịch MoMo: {Json}", json);

        var content = new StringContent(json, Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync(_settings.Endpoint, content);
        var responseBody = await response.Content.ReadAsStringAsync();

        _logger.LogInformation("MoMo API response: {Body}", responseBody);

        var result = JsonSerializer.Deserialize<MoMoCreatePaymentResponse>(
            responseBody,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
        );

        return result ?? new MoMoCreatePaymentResponse
        {
            ResultCode = -1,
            Message = "Không thể phân tích phản hồi từ MoMo API"
        };
    }

    /// <summary>Kiểm tra, xác thực hoặc phê duyệt nghiệp vụ (VerifySignature)</summary>
    public bool VerifySignature(MoMoIpnRequest ipn)
    {
        // Chuỗi ký xác thực IPN từ MoMo
        string rawSignature = $"accessKey={_settings.AccessKey}" +
                              $"&amount={ipn.Amount}" +
                              $"&extraData={ipn.ExtraData}" +
                              $"&message={ipn.Message}" +
                              $"&orderId={ipn.OrderId}" +
                              $"&orderInfo={ipn.OrderInfo}" +
                              $"&orderType={ipn.OrderType}" +
                              $"&partnerCode={ipn.PartnerCode}" +
                              $"&payType={ipn.PayType}" +
                              $"&requestId={ipn.RequestId}" +
                              $"&responseTime={ipn.ResponseTime}" +
                              $"&resultCode={ipn.ResultCode}" +
                              $"&transId={ipn.TransId}";

        string expectedSignature = ComputeHmacSha256(rawSignature, _settings.SecretKey);
        return string.Equals(expectedSignature, ipn.Signature, StringComparison.OrdinalIgnoreCase);
    }

    private static string ComputeHmacSha256(string message, string secretKey)
    {
        byte[] keyBytes = Encoding.UTF8.GetBytes(secretKey);
        byte[] messageBytes = Encoding.UTF8.GetBytes(message);

        using var hmac = new HMACSHA256(keyBytes);
        byte[] hashBytes = hmac.ComputeHash(messageBytes);
        return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
    }
}
