using ECS.EcoLoad.Domain;

namespace ECS.EcoLoad.Services;

public class ConsolidationResult
{
    public Trailer Trailer { get; init; } = null!;
    public List<Pallet> UnassignedPallets { get; init; } = [];
    public double EstimatedCo2SavedKg { get; init; }
    public int TripsSaved { get; init; }
    public string OptimizationSummary { get; init; } = string.Empty;
}

public class ConsolidationEngine
{
    private const double Co2PerTripKg = 850.0; // avg kg CO2 per truck trip ZBR->UK

    public ConsolidationResult Optimize(string trailerNumber, string destination, List<Pallet> pallets)
    {
        // Sort: heavy and dense go bottom (descending density), light on top (ascending)
        var sorted = pallets
            .OrderByDescending(p => p.Density)
            .ThenByDescending(p => p.WeightKg)
            .ToList();

        var trailer = new Trailer { TrailerNumber = trailerNumber, Destination = destination };
        var assigned = sorted.Take(Trailer.MaxCapacityPallets).ToList();
        var unassigned = sorted.Skip(Trailer.MaxCapacityPallets).ToList();

        trailer.Load(assigned);

        int tripsSaved = unassigned.Count > 0 ? 0 : (int)Math.Floor((double)pallets.Count / Trailer.MaxCapacityPallets) - 1;
        tripsSaved = Math.Max(0, tripsSaved);
        double co2Saved = tripsSaved * Co2PerTripKg;

        string summary = $"Geladen: {assigned.Count}/{pallets.Count} pallets. " +
                         $"Volumebenutting: {trailer.VolumeUtilizationPct}%. " +
                         $"Hoogte: {trailer.TotalUsedHeightCm}/{Trailer.MaxHeightCm * Trailer.MaxCapacityPallets}cm (eff). " +
                         $"Gewicht: {trailer.TotalWeightKg:N0}kg. " +
                         $"Geraamde CO₂-besparing: {co2Saved:N0}kg ({tripsSaved} rittenbesparingen).";

        return new ConsolidationResult
        {
            Trailer = trailer,
            UnassignedPallets = unassigned,
            EstimatedCo2SavedKg = co2Saved,
            TripsSaved = tripsSaved,
            OptimizationSummary = summary
        };
    }
}
