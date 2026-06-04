namespace ECS.EcoLoad.Domain;

public class Trailer
{
    public const int MaxHeightCm = 360;   // Super Mega Trailer ECS spec
    public const int MaxCapacityPallets = 33;

    public Guid Id { get; init; } = Guid.NewGuid();
    public string TrailerNumber { get; init; } = string.Empty;
    public string Destination { get; init; } = string.Empty;
    public List<LoadedPallet> LoadedPallets { get; private set; } = [];

    public int TotalUsedHeightCm => LoadedPallets.Sum(p => p.Pallet.HeightCm);
    public double VolumeUtilizationPct => Math.Round((double)LoadedPallets.Count / MaxCapacityPallets * 100, 1);
    public double HeightUtilizationPct => Math.Round((double)TotalUsedHeightCm / (MaxHeightCm * MaxCapacityPallets) * 100, 1);
    public double TotalWeightKg => LoadedPallets.Sum(p => p.Pallet.WeightKg);
    public TrailerStatus Status { get; set; } = TrailerStatus.Loading;

    public void Load(List<Pallet> pallets)
    {
        int layer = 1;
        int posInLayer = 1;
        foreach (var pallet in pallets)
        {
            LoadedPallets.Add(new LoadedPallet { Pallet = pallet, Layer = layer, PositionInLayer = posInLayer });
            posInLayer++;
            if (posInLayer > 3) { posInLayer = 1; layer++; }
        }
    }
}

public class LoadedPallet
{
    public Pallet Pallet { get; init; } = null!;
    public int Layer { get; init; }
    public int PositionInLayer { get; init; }
}

public enum TrailerStatus { Loading, ReadyForDispatch, InTransit, AtCustoms, Delivered }
