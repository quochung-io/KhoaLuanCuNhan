using Microsoft.EntityFrameworkCore;
using Ecc.Infrastructure.Data;
using Ecc.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ── Đăng ký AppDbContext với SQL Server ──────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ── Đăng ký dịch vụ gửi mã OTP qua Gmail thực tế ───────
builder.Services.AddSingleton<IOtpService, OtpService>();

// ── Cấu hình CORS cho phép tất cả các nguồn (Web + Mobile App) ──
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Ecc.WebApi v1");
        c.RoutePrefix = string.Empty; // Mở http://localhost:5023 trực tiếp ra Swagger UI
    });
}

// app.UseHttpsRedirection(); // Tắt để không bắt buộc HTTPS trên port 5023

// Route trạng thái và điều hướng
app.MapGet("/api/health", () => Results.Ok(new { status = "Healthy", service = "Ecc.WebApi", port = 5023 }));
app.MapGet("/swagger", () => Results.Redirect("/"));

// Sử dụng CORS
app.UseCors("AllowAll");

app.UseAuthorization();

// Map controllers
app.MapControllers();

app.Run();
