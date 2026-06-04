namespace ShipmentTracking.Domain.ValueObjects;

public sealed class TrackingNumber : IEquatable<TrackingNumber>
{
    public string Value { get; }

    private TrackingNumber(string value) => Value = value;

    public static TrackingNumber Generate()
    {
        var prefix = "STP";
        var timestamp = DateTime.UtcNow.ToString("yyyyMMdd");
        var random = Random.Shared.Next(1000, 9999);
        return new TrackingNumber($"{prefix}-{timestamp}-{random}");
    }

    public static TrackingNumber From(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("Tracking number mag niet leeg zijn.", nameof(value));
        return new TrackingNumber(value.ToUpperInvariant());
    }

    public bool Equals(TrackingNumber? other) => other is not null && Value == other.Value;
    public override bool Equals(object? obj) => obj is TrackingNumber t && Equals(t);
    public override int GetHashCode() => Value.GetHashCode();
    public override string ToString() => Value;

    public static implicit operator string(TrackingNumber t) => t.Value;
}
