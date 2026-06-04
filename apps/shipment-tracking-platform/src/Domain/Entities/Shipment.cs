using ShipmentTracking.Domain.Enums;
using ShipmentTracking.Domain.Exceptions;
using ShipmentTracking.Domain.ValueObjects;

namespace ShipmentTracking.Domain.Entities;

public sealed class Shipment
{
    // --- Toegelaten statusovergangen ---
    private static readonly Dictionary<ShipmentStatus, IReadOnlyList<ShipmentStatus>> AllowedTransitions = new()
    {
        [ShipmentStatus.Draft]          = [ShipmentStatus.Confirmed, ShipmentStatus.Cancelled],
        [ShipmentStatus.Confirmed]      = [ShipmentStatus.InTransit, ShipmentStatus.Cancelled],
        [ShipmentStatus.InTransit]      = [ShipmentStatus.OutForDelivery, ShipmentStatus.Failed],
        [ShipmentStatus.OutForDelivery] = [ShipmentStatus.Delivered, ShipmentStatus.Failed],
        [ShipmentStatus.Delivered]      = [],
        [ShipmentStatus.Failed]         = [ShipmentStatus.InTransit],
        [ShipmentStatus.Cancelled]      = [],
    };

    // --- Properties ---
    public Guid Id { get; private set; }
    public string TrackingNumber { get; private set; } = string.Empty;
    public string SenderName { get; private set; } = string.Empty;
    public string SenderAddress { get; private set; } = string.Empty;
    public string RecipientName { get; private set; } = string.Empty;
    public string RecipientAddress { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public decimal WeightKg { get; private set; }
    public ShipmentStatus Status { get; private set; }
    public bool IsDeleted { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }
    public string CreatedBy { get; private set; } = string.Empty;

    private readonly List<ShipmentStatusHistory> _statusHistory = [];
    public IReadOnlyList<ShipmentStatusHistory> StatusHistory => _statusHistory.AsReadOnly();

    private readonly List<Document> _documents = [];
    public IReadOnlyList<Document> Documents => _documents.AsReadOnly();

    // EF Core constructor
    private Shipment() { }

    // --- Factory method ---
    public static Shipment Create(
        string senderName,
        string senderAddress,
        string recipientName,
        string recipientAddress,
        string description,
        decimal weightKg,
        string createdBy)
    {
        if (weightKg <= 0)
            throw new DomainException("Gewicht moet groter zijn dan 0 kg.");

        var shipment = new Shipment
        {
            Id = Guid.NewGuid(),
            TrackingNumber = ValueObjects.TrackingNumber.Generate().Value,
            SenderName = senderName.Trim(),
            SenderAddress = senderAddress.Trim(),
            RecipientName = recipientName.Trim(),
            RecipientAddress = recipientAddress.Trim(),
            Description = description.Trim(),
            WeightKg = weightKg,
            Status = ShipmentStatus.Draft,
            IsDeleted = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            CreatedBy = createdBy
        };

        shipment._statusHistory.Add(ShipmentStatusHistory.Create(
            shipment.Id, ShipmentStatus.Draft, "Zending aangemaakt.", createdBy));

        return shipment;
    }

    // --- Gedrag ---
    public void UpdateStatus(ShipmentStatus newStatus, string notes, string updatedBy)
    {
        if (!AllowedTransitions[Status].Contains(newStatus))
            throw new InvalidStatusTransitionException(Status.ToString(), newStatus.ToString());

        Status = newStatus;
        UpdatedAt = DateTime.UtcNow;

        _statusHistory.Add(ShipmentStatusHistory.Create(Id, newStatus, notes, updatedBy));
    }

    public void AddDocument(Document document)
    {
        _documents.Add(document);
        UpdatedAt = DateTime.UtcNow;
    }

    public void SoftDelete()
    {
        if (Status == ShipmentStatus.InTransit || Status == ShipmentStatus.OutForDelivery)
            throw new DomainException("Een zending in transit kan niet worden verwijderd.");

        IsDeleted = true;
        UpdatedAt = DateTime.UtcNow;
    }
}
