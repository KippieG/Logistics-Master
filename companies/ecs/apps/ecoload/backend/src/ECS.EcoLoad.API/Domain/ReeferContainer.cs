namespace ECS.EcoLoad.Domain;

public class ReeferContainer
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public string ContainerNumber { get; init; } = string.Empty;
    public string Client { get; init; } = string.Empty;
    public double TargetTempMin { get; init; }
    public double TargetTempMax { get; init; }
    public double CurrentTemp { get; set; }
    public DateTime LastReading { get; set; } = DateTime.UtcNow;
    public ReeferStatus Status { get; set; } = ReeferStatus.Normal;
    public string Destination { get; init; } = string.Empty;

    public bool IsOutOfRange => CurrentTemp < TargetTempMin || CurrentTemp > TargetTempMax;
    public double DeviationCelsius => IsOutOfRange
        ? Math.Round(CurrentTemp < TargetTempMin ? TargetTempMin - CurrentTemp : CurrentTemp - TargetTempMax, 2)
        : 0;
}

public enum ReeferStatus { Normal, Warning, Critical, Offline }
