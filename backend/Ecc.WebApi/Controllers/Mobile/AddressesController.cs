using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ecc.Infrastructure.Data;
using Ecc.Infrastructure.Entities;

namespace Ecc.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AddressesController : ControllerBase
{
    private readonly AppDbContext _context;

    public AddressesController(AppDbContext context)
    {
        _context = context;
    }

    private async Task EnsureAddressTypeColumnExistsAsync()
    {
        try
        {
            var sql = @"
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Addresses')
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Addresses') AND name = 'AddressType')
    BEGIN
        ALTER TABLE Addresses ADD AddressType NVARCHAR(50) NULL;
    END
END";
            await _context.Database.ExecuteSqlRawAsync(sql);
        }
        catch { }
    }

    // ── 1. Lấy danh sách địa chỉ của khách hàng ──────────────────────
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<Address>>> GetAddressesByUser(long userId)
    {
        await EnsureAddressTypeColumnExistsAsync();
        return await _context.Addresses
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.IsDefault)
            .ThenByDescending(a => a.AddressId)
            .ToListAsync();
    }

    // ── 2. Lấy chi tiết một địa chỉ ──────────────────────────────────
    [HttpGet("{id}")]
    public async Task<ActionResult<Address>> GetAddress(long id)
    {
        await EnsureAddressTypeColumnExistsAsync();
        var address = await _context.Addresses.FindAsync(id);
        if (address == null) return NotFound();
        return address;
    }

    // ── 3. Thêm địa chỉ mới (chọn Nhà ở hoặc Công ty, đặt mặc định) ───
    [HttpPost]
    public async Task<ActionResult<Address>> CreateAddress(Address address)
    {
        await EnsureAddressTypeColumnExistsAsync();
        // Chuẩn hóa loại địa chỉ ("Nhà ở" hoặc "Công ty")
        if (string.IsNullOrWhiteSpace(address.AddressType))
        {
            address.AddressType = "Nhà ở";
        }

        // Kiểm tra số lượng địa chỉ hiện tại của khách hàng
        var userAddressCount = await _context.Addresses.CountAsync(a => a.UserId == address.UserId);

        // Nếu là địa chỉ đầu tiên hoặc được chỉ định làm mặc định
        if (userAddressCount == 0 || address.IsDefault)
        {
            // Bỏ mặc định các địa chỉ cũ
            var existingAddresses = await _context.Addresses
                .Where(a => a.UserId == address.UserId)
                .ToListAsync();

            foreach (var addr in existingAddresses)
            {
                addr.IsDefault = false;
            }

            address.IsDefault = true;
        }

        _context.Addresses.Add(address);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAddress), new { id = address.AddressId }, address);
    }

    // ── 4. Cập nhật thông tin địa chỉ ────────────────────────────────
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAddress(long id, Address address)
    {
        if (id != address.AddressId) return BadRequest();

        var existing = await _context.Addresses.FindAsync(id);
        if (existing == null) return NotFound();

        // Nếu địa chỉ này được đặt làm mặc định, hủy mặc định ở các địa chỉ khác
        if (address.IsDefault && !existing.IsDefault)
        {
            var otherAddresses = await _context.Addresses
                .Where(a => a.UserId == existing.UserId && a.AddressId != id)
                .ToListAsync();

            foreach (var addr in otherAddresses)
            {
                addr.IsDefault = false;
            }
        }

        existing.ReceiverName = address.ReceiverName;
        existing.Phone = address.Phone;
        existing.Province = address.Province;
        existing.District = address.District;
        existing.Ward = address.Ward;
        existing.AddressDetail = address.AddressDetail;
        existing.AddressType = string.IsNullOrWhiteSpace(address.AddressType) ? "Nhà ở" : address.AddressType;
        existing.IsDefault = address.IsDefault;

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    // ── 5. Thiết lập nhanh một địa chỉ làm Mặc định ──────────────────
    [HttpPut("{id}/set-default")]
    public async Task<IActionResult> SetDefaultAddress(long id)
    {
        var target = await _context.Addresses.FindAsync(id);
        if (target == null) return NotFound();

        // Bỏ mặc định tất cả địa chỉ của user này
        var allUserAddresses = await _context.Addresses
            .Where(a => a.UserId == target.UserId)
            .ToListAsync();

        foreach (var addr in allUserAddresses)
        {
            addr.IsDefault = (addr.AddressId == id);
        }

        await _context.SaveChangesAsync();
        return Ok(target);
    }

    // ── 6. Xóa địa chỉ ───────────────────────────────────────────────
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAddress(long id)
    {
        var address = await _context.Addresses.FindAsync(id);
        if (address == null) return NotFound();

        var userId = address.UserId;
        var wasDefault = address.IsDefault;

        _context.Addresses.Remove(address);
        await _context.SaveChangesAsync();

        // Nếu địa chỉ vừa xóa là mặc định, tự động chuyển một địa chỉ còn lại thành mặc định
        if (wasDefault)
        {
            var nextDefault = await _context.Addresses
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.AddressId)
                .FirstOrDefaultAsync();

            if (nextDefault != null)
            {
                nextDefault.IsDefault = true;
                await _context.SaveChangesAsync();
            }
        }

        return NoContent();
    }
}
