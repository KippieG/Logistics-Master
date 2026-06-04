using ECS.EcoLoad.Domain;
using ECS.EcoLoad.Services;
using FluentAssertions;
using Xunit;

namespace ECS.EcoLoad.Tests;

public class ConsolidationEngineTests
{
    private readonly ConsolidationEngine _engine = new();

    [Fact]
    public void Optimize_WithEmptyPallets_ReturnsEmptyTrailer()
    {
        var result = _engine.Optimize("TRL-001", "Tilbury", []);

        result.Trailer.LoadedPallets.Should().BeEmpty();
        result.Trailer.VolumeUtilizationPct.Should().Be(0);
    }

    [Fact]
    public void Optimize_SortsByDensityDescending_HeaviestPalletsLoadedFirst()
    {
        var pallets = new List<Pallet>
        {
            new() { Client = "Light Co", WeightKg = 100, HeightCm = 150, CargoType = CargoType.FMCG },
            new() { Client = "Heavy Co", WeightKg = 1200, HeightCm = 120, CargoType = CargoType.Ambient },
            new() { Client = "Mid Co",   WeightKg = 500,  HeightCm = 100, CargoType = CargoType.Chilled },
        };

        var result = _engine.Optimize("TRL-001", "Tilbury", pallets);

        result.Trailer.LoadedPallets.Should().HaveCount(3);
        // First pallet loaded = highest density = heaviest relative to size
        result.Trailer.LoadedPallets[0].Pallet.Client.Should().Be("Heavy Co");
    }

    [Fact]
    public void Optimize_MaxCapacity33Pallets_ExcessGoesToUnassigned()
    {
        var pallets = Enumerable.Range(0, 40)
            .Select(i => new Pallet { Client = $"Client {i}", WeightKg = 500, HeightCm = 100, CargoType = CargoType.Ambient })
            .ToList();

        var result = _engine.Optimize("TRL-001", "Tilbury", pallets);

        result.Trailer.LoadedPallets.Should().HaveCount(33);
        result.UnassignedPallets.Should().HaveCount(7);
    }

    [Fact]
    public void Optimize_FullTrailer_ReturnsHighVolumeUtilization()
    {
        var pallets = Enumerable.Range(0, 33)
            .Select(i => new Pallet { Client = "Tesco", WeightKg = 800, HeightCm = 120, CargoType = CargoType.FMCG })
            .ToList();

        var result = _engine.Optimize("TRL-002", "Tilbury", pallets);

        result.Trailer.VolumeUtilizationPct.Should().Be(100);
    }

    [Fact]
    public void Optimize_Summary_ContainsExpectedKeywords()
    {
        var pallets = new List<Pallet>
        {
            new() { Client = "Tesco", WeightKg = 600, HeightCm = 120, CargoType = CargoType.FMCG }
        };

        var result = _engine.Optimize("TRL-003", "Tilbury", pallets);

        result.OptimizationSummary.Should().Contain("pallets");
        result.OptimizationSummary.Should().Contain("Volumebenutting");
    }

    [Fact]
    public void Pallet_RequiresRefrigeration_TrueForChilledAndFrozen()
    {
        var chilled = new Pallet { CargoType = CargoType.Chilled, WeightKg = 100, HeightCm = 100 };
        var frozen  = new Pallet { CargoType = CargoType.Frozen,  WeightKg = 100, HeightCm = 100 };
        var ambient = new Pallet { CargoType = CargoType.Ambient, WeightKg = 100, HeightCm = 100 };

        chilled.RequiresRefrigeration.Should().BeTrue();
        frozen.RequiresRefrigeration.Should().BeTrue();
        ambient.RequiresRefrigeration.Should().BeFalse();
    }

    [Fact]
    public void ReeferContainer_IsOutOfRange_WhenTempExceedsMax()
    {
        var reefer = new ReeferContainer
        {
            TargetTempMin = 2,
            TargetTempMax = 5,
            CurrentTemp = 7.5
        };

        reefer.IsOutOfRange.Should().BeTrue();
        reefer.DeviationCelsius.Should().Be(2.5);
    }

    [Fact]
    public void ReeferContainer_IsOutOfRange_WhenTempBelowMin()
    {
        var reefer = new ReeferContainer
        {
            TargetTempMin = -18,
            TargetTempMax = -15,
            CurrentTemp = -21
        };

        reefer.IsOutOfRange.Should().BeTrue();
        reefer.DeviationCelsius.Should().Be(3);
    }

    [Fact]
    public void Trailer_TotalWeightKg_SumsAllLoadedPallets()
    {
        var pallets = new List<Pallet>
        {
            new() { WeightKg = 400, HeightCm = 100, CargoType = CargoType.Ambient },
            new() { WeightKg = 600, HeightCm = 100, CargoType = CargoType.FMCG },
        };

        var result = _engine.Optimize("TRL-004", "Tilbury", pallets);

        result.Trailer.TotalWeightKg.Should().Be(1000);
    }
}
