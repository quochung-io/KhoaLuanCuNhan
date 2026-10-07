using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ecc.Infrastructure.Data;
using Ecc.Infrastructure.Entities;

namespace Ecc.WebApi.Controllers.Web;

[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly AppDbContext _context;

    public NotificationsController(AppDbContext context)
    {
        _context = context;
    }

    // Lấy danh sách thông báo cho 1 User
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserNotifications(long userId)
    {
        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(50) // Giới hạn lấy 50 thông báo gần nhất
            .ToListAsync();
            
        return Ok(notifications);
    }

    // Đánh dấu đã đọc
    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(long id)
    {
        var notif = await _context.Notifications.FindAsync(id);
        if (notif == null) return NotFound();

        notif.IsRead = true;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // Đánh dấu tất cả đã đọc
    [HttpPut("user/{userId}/read-all")]
    public async Task<IActionResult> MarkAllAsRead(long userId)
    {
        var unread = await _context.Notifications
            .Where(n => n.UserId == userId && (n.IsRead == false || n.IsRead == null))
            .ToListAsync();
            
        foreach(var n in unread)
        {
            n.IsRead = true;
        }
        
        if (unread.Any())
        {
            await _context.SaveChangesAsync();
        }
        return NoContent();
    }

    public class AdminSendNotifDto
    {
        public long? UserId { get; set; } // Nếu null = Gửi All
        public string Title { get; set; } = null!;
        public string Message { get; set; } = null!;
        public string Type { get; set; } = "System"; // System, Promotion, Order
        public string? ReferenceId { get; set; }
    }

    // Admin gửi thông báo
    [HttpPost("admin/send")]
    public async Task<IActionResult> AdminSend([FromBody] AdminSendNotifDto dto)
    {
        if (dto.UserId.HasValue && dto.UserId.Value > 0)
        {
            // Gửi cá nhân
            var n = new Notification
            {
                UserId = dto.UserId.Value,
                Title = dto.Title,
                Message = dto.Message,
                Type = dto.Type,
                ReferenceId = dto.ReferenceId ?? "ADMIN",
                IsRead = false,
                CreatedAt = DateTime.Now
            };
            _context.Notifications.Add(n);
        }
        else
        {
            // Gửi toàn hệ thống
            var allUsers = await _context.Users.Select(u => u.UserId).ToListAsync();
            var notifications = allUsers.Select(uid => new Notification
            {
                UserId = uid,
                Title = dto.Title,
                Message = dto.Message,
                Type = dto.Type,
                ReferenceId = dto.ReferenceId ?? "ADMIN",
                IsRead = false,
                CreatedAt = DateTime.Now
            });
            _context.Notifications.AddRange(notifications);
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Gửi thông báo thành công" });
    }

    public class SupplierSendNotifDto
    {
        public string Title { get; set; } = null!;
        public string Message { get; set; } = null!;
        public string Type { get; set; } = "Supplier"; // Supplier, Update
    }

    // NCC gửi thông báo
    [HttpPost("supplier/{supplierId}/send")]
    public async Task<IActionResult> SupplierSend(int supplierId, [FromBody] SupplierSendNotifDto dto)
    {
        // 1. Xác minh NCC tồn tại
        var supplier = await _context.Suppliers.FindAsync(supplierId);
        if (supplier == null) return NotFound("Không tìm thấy Nhà cung cấp");

        // 2. Tìm danh sách User đã từng mua hàng của NCC này
        // (Order -> OrderItem -> Product -> SupplierId)
        var buyerIds = await _context.OrderItems
            .Include(i => i.Order)
            .Include(i => i.Product)
            .Where(i => i.Product.SupplierId == supplierId && i.Order != null)
            .Select(i => i.Order!.CustomerId)
            .Distinct()
            .ToListAsync();

        if (!buyerIds.Any())
        {
            return BadRequest("Nhà cung cấp chưa có khách hàng nào để gửi thông báo.");
        }

        var notifications = buyerIds.Select(uid => new Notification
        {
            UserId = uid,
            Title = dto.Title,
            Message = dto.Message,
            Type = dto.Type,
            ReferenceId = $"SUP-{supplierId}", // Đánh dấu ID NCC
            IsRead = false,
            CreatedAt = DateTime.Now
        });

        _context.Notifications.AddRange(notifications);
        await _context.SaveChangesAsync();

        return Ok(new { 
            message = $"Gửi thông báo thành công tới {buyerIds.Count} khách hàng.",
            sentCount = buyerIds.Count
        });
    }
}
