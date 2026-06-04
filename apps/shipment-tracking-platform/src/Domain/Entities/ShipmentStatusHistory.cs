using ShipmentTracking.Domain.Enums;

namespace ShipmentTracking.Domain.Entities;

public sealed class ShipmentStatusHistory
{
    public Guid Id { get; private set; }
    public Guid ShipmentId { get; private set; }
    public ShipmentStatus Status { get; private set; }
    public string Notes { get; private set; } = string.Empty;
    public string ChangedBy { get; private set; } = string.Empty;
    public DateTime ChangedAt { get; private set; }

    private ShipmentStatusHistory() { }

    public static ShipmentStatusHistory Create(
        Guid shipmentId,
        ShipmentStatus status,
        string notes,
        string changedBy) => new()
    {
        Id = Guid.NewGuid(),
        ShipmentId = shipmentId,
        Status = status,
        Notes = notes.Trim(),
        ChangedBy = changedBy,
        ChangedAt = DateTime.UtcNow
    };
}
