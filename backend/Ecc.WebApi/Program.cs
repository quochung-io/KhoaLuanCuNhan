using Microsoft.EntityFrameworkCore;
using Ecc.Infrastructure.Data;
using Ecc.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// ── Đăng ký AppDbContext với SQL Server ──────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ── Đăng ký dịch vụ gửi mã OTP qua Gmail thực tế ───────
builder.Services.AddSingleton<IOtpService, OtpService>();

// ── Cấu hình CORS cho phép tất cả các nguồn (để các phân hệ frontend kết nối) ──
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
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Sử dụng CORS
app.UseCors("AllowAll");

app.UseAuthorization();

// Map controllers
app.MapControllers();

app.Run();
