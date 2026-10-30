using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Ecc.Infrastructure.Data;
using Ecc.Infrastructure.Services;
using Ecc.WebApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// ── Cấu hình Swagger Gen hỗ trợ Authorize Bearer Token ──
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "ECC WebApi", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Nhập Token theo cú pháp: Bearer {your_token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ── Đăng ký AppDbContext (Hỗ trợ cả SQL Server Local/Cloud và SQLite nhúng sẵn trên Cloud) ──
var useSqlite = string.Equals(Environment.GetEnvironmentVariable("USE_SQLITE"), "true", StringComparison.OrdinalIgnoreCase);
var appDataDir = Path.Combine(builder.Environment.ContentRootPath, "App_Data");
Directory.CreateDirectory(appDataDir);
var sqliteDbPath = Path.Combine(appDataDir, "QL_WebMuaBanNongSan.db");

builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (useSqlite)
    {
        options.UseSqlite($"Data Source={sqliteDbPath}");
    }
    else
    {
        options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
    }
});

// ── Cấu hình JWT Bearer Authentication ───────────────
var jwtSecretKey = builder.Configuration["JwtSettings:SecretKey"] ?? "ECC_NongSanLanh_Secret_Key_Super_Secure_2026_JWT_Token_Key!#$";
var jwtIssuer = builder.Configuration["JwtSettings:Issuer"] ?? "ECC_NongSanLanh";
var jwtAudience = builder.Configuration["JwtSettings:Audience"] ?? "ECC_NongSanLanh_Users";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey)),
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// ── Đăng ký dịch vụ JWT ──────────────────────────────
builder.Services.AddSingleton<IJwtService, JwtService>();

// ── Đăng ký dịch vụ gửi mã OTP qua Gmail thực tế ───────
builder.Services.AddSingleton<IOtpService, OtpService>();

// ── Đăng ký dịch vụ thanh toán MoMo ───────────────────
builder.Services.AddSingleton<IMoMoPaymentService, MoMoPaymentService>();

// ── Đăng ký Background Service tự động áp dụng FEFO Auto Markdown cho sản phẩm cận date ──
builder.Services.AddSingleton<FefoClearanceBackgroundService>();
builder.Services.AddHostedService(sp => sp.GetRequiredService<FefoClearanceBackgroundService>());

// ── Đăng ký Background Service tự động hủy đơn hàng chưa thanh toán quá 15 phút ──
builder.Services.AddSingleton<OrderExpirationBackgroundService>();
builder.Services.AddHostedService(sp => sp.GetRequiredService<OrderExpirationBackgroundService>());

// ── Đăng ký SignalR Realtime Hub ───────────────────────
builder.Services.AddSignalR();

// ── Cấu hình CORS cho phép tất cả các nguồn (Web + Mobile App + SignalR WebSockets) ──
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

// ── Tự động tạo bảng RefreshTokens / Certificates và đồng bộ Cloud DB ──
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        if (db.Database.IsSqlServer())
        {
            var sql = @"
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'RefreshTokens')
BEGIN
    CREATE TABLE RefreshTokens (
        TokenId BIGINT IDENTITY(1,1) PRIMARY KEY,
        UserId BIGINT NOT NULL,
        Token NVARCHAR(255) NOT NULL,
        ExpiresAt DATETIME2 NOT NULL,
        IsRevoked BIT NOT NULL DEFAULT 0,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        ReplacedByToken NVARCHAR(255) NULL,
        CONSTRAINT FK_RefreshTokens_Users FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE
    );
END
ELSE
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'IsRevoked' AND Object_ID = Object_ID(N'RefreshTokens'))
    BEGIN
        ALTER TABLE RefreshTokens ADD IsRevoked BIT NOT NULL DEFAULT 0;
    END
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Certificates')
BEGIN
    CREATE TABLE Certificates (
        CertificateId BIGINT IDENTITY(1,1) PRIMARY KEY,
        SupplierId BIGINT NOT NULL,
        FarmId BIGINT NULL,
        CertificateCode NVARCHAR(100) NOT NULL,
        CertificateName NVARCHAR(200) NOT NULL,
        StandardType NVARCHAR(50) NOT NULL,
        IssuedBy NVARCHAR(255) NOT NULL,
        IssueDate DATETIME2 NOT NULL,
        ExpiryDate DATETIME2 NOT NULL,
        CertificateUrl NVARCHAR(500) NULL,
        Status NVARCHAR(50) NOT NULL DEFAULT 'Valid',
        ApprovedBy BIGINT NULL,
        ApprovedAt DATETIME2 NULL,
        RejectReason NVARCHAR(255) NULL,
        Notes NVARCHAR(500) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NULL,
        CONSTRAINT FK_Certificates_Suppliers FOREIGN KEY (SupplierId) REFERENCES Suppliers(SupplierId) ON DELETE CASCADE
    );
END

IF NOT EXISTS (SELECT 1 FROM Certificates)
BEGIN
    INSERT INTO Certificates (SupplierId, FarmId, CertificateCode, CertificateName, StandardType, IssuedBy, IssueDate, ExpiryDate, CertificateUrl, Status, ApprovedBy, ApprovedAt, Notes)
    SELECT TOP 1 s.SupplierId, f.FarmId, 'VG-2024-VN-0892', N'Chứng nhận Tiêu chuẩn Thực hành Nông nghiệp Tốt VietGAP', 'VietGAP', N'Trung tâm Kiểm nghiệm & Chứng nhận Chất lượng Nông nghiệp Quốc gia', DATEADD(month, -6, GETUTCDATE()), DATEADD(month, 18, GETUTCDATE()), 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800', 'Valid', 1, GETUTCDATE(), N'Chứng nhận đạt chuẩn VietGAP toàn diện cho vùng trồng trọt và đóng gói rau củ an toàn.'
    FROM Suppliers s
    LEFT JOIN Farms f ON f.SupplierId = s.SupplierId;

    INSERT INTO Certificates (SupplierId, FarmId, CertificateCode, CertificateName, StandardType, IssuedBy, IssueDate, ExpiryDate, CertificateUrl, Status, ApprovedBy, ApprovedAt, Notes)
    SELECT TOP 1 s.SupplierId, f.FarmId, 'GG-GLOBAL-8831', N'Chứng nhận Tiêu chuẩn Nông sản Toàn cầu GlobalG.A.P', 'GlobalGAP', N'Tổ chức Chứng nhận Quốc tế Control Union Certifications', DATEADD(month, -11, GETUTCDATE()), DATEADD(day, 20, GETUTCDATE()), 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800', 'ExpiringSoon', 1, GETUTCDATE(), N'Hồ sơ nông sản xuất khẩu chất lượng cao, cảnh báo gia hạn trước 30 ngày.'
    FROM Suppliers s
    LEFT JOIN Farms f ON f.SupplierId = s.SupplierId;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'MomoOrderId' AND Object_ID = Object_ID(N'Orders'))
BEGIN
    ALTER TABLE Orders ADD MomoOrderId NVARCHAR(100) NULL;
END
IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'MomoRequestId' AND Object_ID = Object_ID(N'Orders'))
BEGIN
    ALTER TABLE Orders ADD MomoRequestId NVARCHAR(100) NULL;
END
IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'MomoTransId' AND Object_ID = Object_ID(N'Orders'))
BEGIN
    ALTER TABLE Orders ADD MomoTransId NVARCHAR(100) NULL;
END";
            db.Database.ExecuteSqlRaw(sql);

            // Tự động xuất bản sao đầy đủ sang App_Data/QL_WebMuaBanNongSan.db để đóng gói lên Cloud 24/24
            if (!File.Exists(sqliteDbPath))
            {
                app.Logger.LogInformation("[CLOUD DB EXPORT] Đang tạo bản sao SQLite từ SQL Server...");
                var sqliteOptions = new DbContextOptionsBuilder<AppDbContext>()
                    .UseSqlite($"Data Source={sqliteDbPath}")
                    .Options;
                using var sqliteDb = new AppDbContext(sqliteOptions);
                sqliteDb.Database.EnsureCreated();
                sqliteDb.Database.ExecuteSqlRaw("PRAGMA foreign_keys = OFF;");

                sqliteDb.Users.AddRange(db.Users.AsNoTracking().ToList());
                sqliteDb.Categories.AddRange(db.Categories.AsNoTracking().ToList());
                sqliteDb.Suppliers.AddRange(db.Suppliers.AsNoTracking().ToList());
                sqliteDb.Farms.AddRange(db.Farms.AsNoTracking().ToList());
                sqliteDb.Products.AddRange(db.Products.AsNoTracking().ToList());
                sqliteDb.ProductImages.AddRange(db.ProductImages.AsNoTracking().ToList());
                sqliteDb.ProductBatches.AddRange(db.ProductBatches.AsNoTracking().ToList());
                sqliteDb.ProductSeasons.AddRange(db.ProductSeasons.AsNoTracking().ToList());
                sqliteDb.Promotions.AddRange(db.Promotions.AsNoTracking().ToList());
                sqliteDb.Certificates.AddRange(db.Certificates.AsNoTracking().ToList());
                sqliteDb.MembershipTiers.AddRange(db.MembershipTiers.AsNoTracking().ToList());
                sqliteDb.UserLoyalties.AddRange(db.UserLoyalties.AsNoTracking().ToList());
                sqliteDb.PointTransactions.AddRange(db.PointTransactions.AsNoTracking().ToList());
                sqliteDb.UserVouchers.AddRange(db.UserVouchers.AsNoTracking().ToList());
                sqliteDb.Addresses.AddRange(db.Addresses.AsNoTracking().ToList());
                sqliteDb.Orders.AddRange(db.Orders.AsNoTracking().ToList());
                sqliteDb.OrderItems.AddRange(db.OrderItems.AsNoTracking().ToList());
                sqliteDb.Reviews.AddRange(db.Reviews.AsNoTracking().ToList());
                sqliteDb.ReviewImages.AddRange(db.ReviewImages.AsNoTracking().ToList());
                sqliteDb.ReviewHelpfulVotes.AddRange(db.ReviewHelpfulVotes.AsNoTracking().ToList());
                sqliteDb.Notifications.AddRange(db.Notifications.AsNoTracking().ToList());
                sqliteDb.SaveChanges();
                sqliteDb.Database.ExecuteSqlRaw("PRAGMA foreign_keys = ON;");
                app.Logger.LogInformation("[CLOUD DB EXPORT] Hoàn tất xuất dữ liệu sang App_Data/QL_WebMuaBanNongSan.db!");
            }
        }
        else
        {
            db.Database.EnsureCreated();
        }
    }
    catch (Exception ex)
    {
        app.Logger.LogError($"[LỖI KHỞI TẠO CSDL]: {ex.Message}");
    }
}

// Configure the HTTP request pipeline (cho phép Swagger cả trên Production Cloud).
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Ecc.WebApi v1");
    c.RoutePrefix = string.Empty; // Mở trực tiếp ra Swagger UI
});

// Route trạng thái và điều hướng
app.MapGet("/api/health", () => Results.Ok(new { status = "Healthy", service = "Ecc.WebApi", port = 5023 }));
app.MapGet("/swagger", () => Results.Redirect("/"));

// Hỗ trợ Chrome/Edge Private Network Access (cho phép web HTTPS trên Vercel gọi về http://localhost:5023)
app.Use(async (context, next) =>
{
    if (context.Request.Headers.ContainsKey("Access-Control-Request-Private-Network"))
    {
        context.Response.Headers["Access-Control-Allow-Private-Network"] = "true";
    }
    await next();
});

// Sử dụng CORS
app.UseCors("AllowAll");

// Cho phép truy cập thư mục static files (ảnh uploads)
app.UseStaticFiles();

// Sử dụng Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// Map SignalR Hub
app.MapHub<Ecc.WebApi.Hubs.OrderNotificationHub>("/hubs/notifications");

// Map controllers
app.MapControllers();

app.Run();
