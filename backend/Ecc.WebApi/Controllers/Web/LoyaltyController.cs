using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ecc.Infrastructure.Data;
using Ecc.Infrastructure.Entities;

namespace Ecc.WebApi.Controllers.Web;

[ApiController]
[Route("api/[controller]")]
public class LoyaltyController : ControllerBase
{
    private readonly AppDbContext _context;

    public LoyaltyController(AppDbContext context)
    {
        _context = context;
    }

    private async Task EnsureSeededAsync(long userId)
    {
        var sql = @"
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MembershipTiers')
BEGIN
    CREATE TABLE MembershipTiers (
        TierId INT IDENTITY(1,1) PRIMARY KEY,
        TierName NVARCHAR(50) NOT NULL,
        MinSpend DECIMAL(18,2) NOT NULL,
        PointRate DECIMAL(18,4) NOT NULL,
        Description NVARCHAR(MAX) NULL,
        Icon NVARCHAR(50) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserLoyalties')
BEGIN
    CREATE TABLE UserLoyalties (
        LoyaltyId INT IDENTITY(1,1) PRIMARY KEY,
        UserId BIGINT NOT NULL,
        CurrentPoints INT NOT NULL DEFAULT 0,
        TotalSpentYear DECIMAL(18,2) NOT NULL DEFAULT 0,
        TierId INT NOT NULL,
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_UserLoyalties_Users FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE,
        CONSTRAINT FK_UserLoyalties_Tiers FOREIGN KEY (TierId) REFERENCES MembershipTiers(TierId)
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PointTransactions')
BEGIN
    CREATE TABLE PointTransactions (
        TransactionId INT IDENTITY(1,1) PRIMARY KEY,
        UserId BIGINT NOT NULL,
        OrderId BIGINT NULL,
        PointsDelta INT NOT NULL,
        TransactionType NVARCHAR(50) NOT NULL DEFAULT 'Earn',
        Description NVARCHAR(255) NOT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_PointTransactions_Users FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE,
        CONSTRAINT FK_PointTransactions_Orders FOREIGN KEY (OrderId) REFERENCES Orders(OrderId) ON DELETE SET NULL
    );
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserVouchers')
BEGIN
    CREATE TABLE UserVouchers (
        VoucherId INT IDENTITY(1,1) PRIMARY KEY,
        UserId BIGINT NOT NULL,
        Code NVARCHAR(50) NOT NULL,
        Title NVARCHAR(150) NOT NULL,
        VoucherType NVARCHAR(50) NOT NULL DEFAULT 'cash',
        DiscountValue DECIMAL(18,2) NOT NULL,
        MinOrderAmount DECIMAL(18,2) NOT NULL,
        ExpiryDate DATETIME2 NOT NULL,
        IsUsed BIT NOT NULL DEFAULT 0,
        UsedAt DATETIME2 NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_UserVouchers_Users FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE
    );
END";

        await _context.Database.ExecuteSqlRawAsync(sql);

        if (!await _context.MembershipTiers.AnyAsync())
        {
            _context.MembershipTiers.AddRange(
                new MembershipTier { TierName = "Mới", MinSpend = 0, PointRate = 0.0100m, Description = "Tích 1% giá trị đơn hàng", Icon = "🌱" },
                new MembershipTier { TierName = "Bạc", MinSpend = 2000000, PointRate = 0.0150m, Description = "Tích 1.5%, 1 Freeship/tháng", Icon = "🥈" },
                new MembershipTier { TierName = "Vàng", MinSpend = 5000000, PointRate = 0.0200m, Description = "Tích 2%, 3 Freeship/tháng, quà sinh nhật", Icon = "🥇" },
                new MembershipTier { TierName = "Kim Cương", MinSpend = 10000000, PointRate = 0.0300m, Description = "Tích 3%, Freeship trọn đời, tài trợ cây giống", Icon = "💎" }
            );
            await _context.SaveChangesAsync();
        }

        var userLoyalty = await _context.UserLoyalties.FirstOrDefaultAsync(l => l.UserId == userId);
        if (userLoyalty == null)
        {
            var user = await _context.Users.FindAsync(userId);
            var isDemoUser = user != null && user.UserId <= 10; // Các tài khoản mẫu có sẵn trong database (1..10)

            if (isDemoUser)
            {
                var goldTier = await _context.MembershipTiers.FirstOrDefaultAsync(t => t.TierName == "Vàng") 
                               ?? await _context.MembershipTiers.FirstAsync();

                userLoyalty = new UserLoyalty
                {
                    UserId = userId,
                    CurrentPoints = 12450,
                    TotalSpentYear = 8450000,
                    TierId = goldTier.TierId,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.UserLoyalties.Add(userLoyalty);
                await _context.SaveChangesAsync();

                _context.PointTransactions.AddRange(
                    new PointTransaction { UserId = userId, PointsDelta = 1850, TransactionType = "Earn", Description = "Mua đơn hàng #ORD-84920 (Dâu tây & Bơ sáp)", CreatedAt = DateTime.UtcNow.AddDays(-1) },
                    new PointTransaction { UserId = userId, PointsDelta = 100, TransactionType = "Bonus", Description = "Check-in quét mã QR nguồn gốc dưa lưới IoT", CreatedAt = DateTime.UtcNow.AddDays(-3) },
                    new PointTransaction { UserId = userId, PointsDelta = -5000, TransactionType = "Redeem", Description = "Đổi Mã giảm giá 50.000 đ", CreatedAt = DateTime.UtcNow.AddDays(-10) },
                    new PointTransaction { UserId = userId, PointsDelta = 500, TransactionType = "Bonus", Description = "Thưởng đánh giá 5 sao kèm hình ảnh sản phẩm", CreatedAt = DateTime.UtcNow.AddDays(-15) }
                );

                _context.UserVouchers.AddRange(
                    new UserVoucher { UserId = userId, Code = "LANHFRESH20", Title = "Giảm 20.000đ Đơn Nông Sản", VoucherType = "cash", DiscountValue = 20000, MinOrderAmount = 150000, ExpiryDate = DateTime.UtcNow.AddMonths(3), IsUsed = false },
                    new UserVoucher { UserId = userId, Code = "FREESHIP50", Title = "Miễn Phí Vận Chuyển Hạng Vàng", VoucherType = "ship", DiscountValue = 30000, MinOrderAmount = 200000, ExpiryDate = DateTime.UtcNow.AddMonths(1), IsUsed = false },
                    new UserVoucher { UserId = userId, Code = "VIETGAP10", Title = "Giảm 10% Rau Hữu Cơ VietGAP", VoucherType = "discount", DiscountValue = 15000, MinOrderAmount = 100000, ExpiryDate = DateTime.UtcNow.AddMonths(2), IsUsed = false },
                    new UserVoucher { UserId = userId, Code = "WELCOME50", Title = "Voucher Chào Mừng Thành Viên Mới", VoucherType = "cash", DiscountValue = 50000, MinOrderAmount = 250000, ExpiryDate = DateTime.UtcNow.AddMonths(-1), IsUsed = true }
                );

                await _context.SaveChangesAsync();
            }
            else
            {
                // User đăng ký mới thực tế (như buiquochung0942@gmail.com): Bắt đầu từ 0 điểm, Hạng Mới
                var newTier = await _context.MembershipTiers.FirstOrDefaultAsync(t => t.TierName == "Mới") 
                              ?? await _context.MembershipTiers.FirstAsync();

                userLoyalty = new UserLoyalty
                {
                    UserId = userId,
                    CurrentPoints = 0,
                    TotalSpentYear = 0,
                    TierId = newTier.TierId,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.UserLoyalties.Add(userLoyalty);
                await _context.SaveChangesAsync();

                // Tặng 1 voucher chào mừng thành viên mới
                _context.UserVouchers.Add(
                    new UserVoucher { UserId = userId, Code = "WELCOME50", Title = "Voucher Chào Mừng Thành Viên Mới", VoucherType = "cash", DiscountValue = 50000, MinOrderAmount = 200000, ExpiryDate = DateTime.UtcNow.AddMonths(1), IsUsed = false }
                );
                await _context.SaveChangesAsync();
            }
        }
    }

    // GET /api/loyalty/{userId}
    [HttpGet("{userId}")]
    public async Task<IActionResult> GetUserLoyalty(long userId)
    {
        try
        {
            await EnsureSeededAsync(userId);

            var loyalty = await _context.UserLoyalties
                .Include(l => l.Tier)
                .FirstOrDefaultAsync(l => l.UserId == userId);

            var tiers = await _context.MembershipTiers
                .OrderBy(t => t.MinSpend)
                .ToListAsync();

            var history = await _context.PointTransactions
                .Where(t => t.UserId == userId)
                .OrderByDescending(t => t.CreatedAt)
                .Take(20)
                .ToListAsync();

            var vouchers = await _context.UserVouchers
                .Where(v => v.UserId == userId)
                .OrderBy(v => v.IsUsed)
                .ThenByDescending(v => v.CreatedAt)
                .ToListAsync();

            return Ok(new
            {
                currentPoints = loyalty?.CurrentPoints ?? 0,
                totalSpentYear = loyalty?.TotalSpentYear ?? 0,
                tier = loyalty?.Tier?.TierName ?? "Mới",
                pointRate = loyalty?.Tier?.PointRate ?? 0.01m,
                tiers,
                history,
                vouchers
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi lấy thông tin loyalty", error = ex.Message });
        }
    }

    // POST /api/loyalty/reset/{userId}
    [HttpPost("reset/{userId}")]
    public async Task<IActionResult> ResetUserLoyalty(long userId)
    {
        try
        {
            await _context.Database.ExecuteSqlRawAsync(@"
                DELETE FROM PointTransactions WHERE UserId = {0};
                DELETE FROM UserVouchers WHERE UserId = {0};
                DELETE FROM UserLoyalties WHERE UserId = {0};
            ", userId);

            await EnsureSeededAsync(userId);

            return Ok(new { message = $"Đã reset dữ liệu loyalty của user {userId} thành công!" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi reset loyalty", error = ex.Message });
        }
    }

    // POST /api/loyalty/redeem
    [HttpPost("redeem")]
    public async Task<IActionResult> RedeemReward([FromBody] RedeemRequest request)
    {
        try
        {
            if (request == null || request.UserId <= 0 || request.PointsRequired <= 0)
            {
                return BadRequest(new { message = "Yêu cầu đổi quà không hợp lệ." });
            }

            var loyalty = await _context.UserLoyalties.FirstOrDefaultAsync(l => l.UserId == request.UserId);
            if (loyalty == null || loyalty.CurrentPoints < request.PointsRequired)
            {
                return BadRequest(new { message = "Điểm tích lũy hiện tại không đủ để thực hiện đổi quà." });
            }

            loyalty.CurrentPoints -= request.PointsRequired;
            loyalty.UpdatedAt = DateTime.UtcNow;

            var transaction = new PointTransaction
            {
                UserId = request.UserId,
                PointsDelta = -request.PointsRequired,
                TransactionType = "Redeem",
                Description = $"Đổi quà: {request.RewardTitle}",
                CreatedAt = DateTime.UtcNow
            };
            _context.PointTransactions.Add(transaction);

            if (request.IsVoucher)
            {
                var newVoucher = new UserVoucher
                {
                    UserId = request.UserId,
                    Code = "REWARD" + new Random().Next(1000, 9999),
                    Title = request.RewardTitle,
                    VoucherType = request.VoucherType ?? "cash",
                    DiscountValue = request.DiscountValue,
                    MinOrderAmount = request.MinOrderAmount,
                    ExpiryDate = DateTime.UtcNow.AddMonths(2),
                    IsUsed = false,
                    CreatedAt = DateTime.UtcNow
                };
                _context.UserVouchers.Add(newVoucher);
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Đổi quà thành công!",
                currentPoints = loyalty.CurrentPoints
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi đổi điểm", error = ex.Message });
        }
    }
}

public class RedeemRequest
{
    public long UserId { get; set; }
    public int PointsRequired { get; set; }
    public string RewardTitle { get; set; } = string.Empty;
    public bool IsVoucher { get; set; }
    public string? VoucherType { get; set; }
    public decimal DiscountValue { get; set; }
    public decimal MinOrderAmount { get; set; }
}
