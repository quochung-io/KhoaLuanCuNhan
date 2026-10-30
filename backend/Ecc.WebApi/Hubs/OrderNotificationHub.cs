using Microsoft.AspNetCore.SignalR;

namespace Ecc.WebApi.Hubs;

public class OrderNotificationHub : Hub
{
    public async Task JoinAdminGroup()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "AdminGroup");
    }

    public async Task JoinSupplierGroup(string supplierId)
    {
        if (!string.IsNullOrWhiteSpace(supplierId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Supplier_{supplierId}");
        }
    }

    public async Task JoinCustomerGroup(string customerId)
    {
        if (!string.IsNullOrWhiteSpace(customerId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Customer_{customerId}");
        }
    }

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
