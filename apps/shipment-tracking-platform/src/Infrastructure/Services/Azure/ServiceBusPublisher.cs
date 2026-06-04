using Azure.Messaging.ServiceBus;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ShipmentTracking.Application.Common.Interfaces;
using System.Text.Json;

namespace ShipmentTracking.Infrastructure.Services.Azure;

public sealed class ServiceBusPublisher(
    IConfiguration configuration,
    ILogger<ServiceBusPublisher> logger) : IShipmentEventPublisher, IAsyncDisposable
{
    private readonly ServiceBusClient _client = new(
        configuration["Azure:ServiceBus:ConnectionString"]
        ?? throw new InvalidOperationException("Service Bus connection string ontbreekt."));

    private readonly string _queueName =
        configuration["Azure:ServiceBus:ShipmentEventsQueue"] ?? "shipment-events";

    public async Task PublishStatusChangedAsync(
        Guid shipmentId,
        string trackingNumber,
        string newStatus,
        CancellationToken ct = default)
    {
        var payload = new
        {
            EventType = "ShipmentStatusChanged",
            ShipmentId = shipmentId,
            TrackingNumber = trackingNumber,
            NewStatus = newStatus,
            OccurredAt = DateTime.UtcNow
        };

        var sender = _client.CreateSender(_queueName);
        var message = new ServiceBusMessage(JsonSerializer.Serialize(payload))
        {
            ContentType = "application/json",
            Subject = "ShipmentStatusChanged"
        };

        await sender.SendMessageAsync(message, ct);
        logger.LogInformation(
            "Event gepubliceerd: ShipmentStatusChanged voor {TrackingNumber} → {Status}",
            trackingNumber, newStatus);
    }

    public async ValueTask DisposeAsync() => await _client.DisposeAsync();
}
