// ============================================================================
// TỆP MÃ NGUỒN: backend/Ecc.WebApi/Hubs/OrderNotificationHub.cs
// MÔ TẢ: SignalR Hub xử lý thông báo thời gian thực (Real-time WebSockets) khi có đơn hàng mới hoặc thay đổi trạng thái đơn hàng.
// ============================================================================
using Microsoft.AspNetCore.SignalR;

namespace Ecc.WebApi.Hubs;

public class OrderNotificationHub : Hub
{
    /// <summary>Thực thi nghiệp vụ hàm JoinAdminGroup</summary>
    public async Task JoinAdminGroup()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "AdminGroup");
    }

    /// <summary>Thực thi nghiệp vụ hàm JoinSupplierGroup</summary>
    public async Task JoinSupplierGroup(string supplierId)
    {
        if (!string.IsNullOrWhiteSpace(supplierId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Supplier_{supplierId}");
        }
    }

    /// <summary>Thực thi nghiệp vụ hàm JoinCustomerGroup</summary>
    public async Task JoinCustomerGroup(string customerId)
    {
        if (!string.IsNullOrWhiteSpace(customerId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Customer_{customerId}");
        }
    }

    /// <summary>Thực thi nghiệp vụ hàm JoinOrderGroup</summary>
    public async Task JoinOrderGroup(string orderId)
    {
        if (!string.IsNullOrWhiteSpace(orderId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Order_{orderId}");
        }
    }

    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
    }
}
