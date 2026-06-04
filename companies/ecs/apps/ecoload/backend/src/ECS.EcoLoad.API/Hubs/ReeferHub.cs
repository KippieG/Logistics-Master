using Microsoft.AspNetCore.SignalR;

namespace ECS.EcoLoad.Hubs;

public class ReeferHub : Hub
{
    public async Task Subscribe(string containerId) =>
        await Groups.AddToGroupAsync(Context.ConnectionId, $"reefer-{containerId}");
}
