namespace ShipmentTracking.Domain.Enums;

public enum ShipmentStatus
{
    Draft = 0,
    Confirmed = 1,
    InTransit = 2,
    OutForDelivery = 3,
    Delivered = 4,
    Failed = 5,
    Cancelled = 6
}
