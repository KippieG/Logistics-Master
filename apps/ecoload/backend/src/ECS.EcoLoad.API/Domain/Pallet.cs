namespace ECS.EcoLoad.Domain;

public enum CargoType { Ambient, Chilled, Frozen, FMCG }

public class Pallet
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public string Client { get; init; } = string.Empty;
    public string Destination { get; init; } = string.Empty;
    public double WeightKg { get; init; }
    public int HeightCm { get; init; }
    public CargoType CargoType { get; init; }
    public bool RequiresRefrigeration => CargoType is CargoType.Chilled or CargoType.Frozen;
    public double Density => WeightKg / (HeightCm * 0.8 * 1.2); // kg/m³ approx
}
