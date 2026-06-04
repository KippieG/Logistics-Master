using ECS.EcoLoad.Domain;
using FluentAssertions;
using Xunit;

namespace ECS.EcoLoad.Tests;

public class ShipmentBrexitTests
{
    [Fact]
    public void RunBrexitCheck_WithAllDocuments_StatusIsCleared()
    {
        var shipment = new Shipment
        {
            ShipmentNumber = "TEST-001",
            Client = "Tesco",
            OriginCountry = "BE",
            DestinationCountry = "GB",
            GoodsValueEur = 5000,
            WeightKg = 10000,
            Documents = [DocumentType.EUR1, DocumentType.CMR, DocumentType.PackingList, DocumentType.T1]
        };

        shipment.RunBrexitCheck();

        shipment.Status.Should().Be(CustomsStatus.Cleared);
        shipment.BlockReasons.Should().BeEmpty();
    }

    [Fact]
    public void RunBrexitCheck_MissingEUR1_StatusIsBlocked()
    {
        var shipment = new Shipment
        {
            ShipmentNumber = "TEST-002",
            Client = "Sainsbury's",
            OriginCountry = "BE",
            DestinationCountry = "GB",
            GoodsValueEur = 2000,
            WeightKg = 5000,
            Documents = [DocumentType.CMR, DocumentType.PackingList, DocumentType.T1]
        };

        shipment.RunBrexitCheck();

        shipment.Status.Should().Be(CustomsStatus.Blocked);
        shipment.BlockReasons.Should().ContainMatch("*EUR1*");
    }

    [Fact]
    public void RunBrexitCheck_GoodsOver1000WithoutT1_RequiresT1()
    {
        var shipment = new Shipment
        {
            ShipmentNumber = "TEST-003",
            Client = "ASDA",
            OriginCountry = "NL",
            DestinationCountry = "GB",
            GoodsValueEur = 1500,
            WeightKg = 3000,
            Documents = [DocumentType.EUR1, DocumentType.CMR, DocumentType.PackingList]
            // T1 ontbreekt voor goederen > €1000
        };

        shipment.RunBrexitCheck();

        shipment.Status.Should().Be(CustomsStatus.Blocked);
        shipment.BlockReasons.Should().ContainMatch("*T1*");
    }

    [Fact]
    public void RunBrexitCheck_NonUKDestination_AlwaysCleared()
    {
        var shipment = new Shipment
        {
            ShipmentNumber = "TEST-004",
            Client = "Carrefour",
            OriginCountry = "FR",
            DestinationCountry = "BE", // niet UK
            GoodsValueEur = 9999,
            WeightKg = 5000,
            Documents = [] // geen documenten — maar niet UK-bound
        };

        shipment.RunBrexitCheck();

        shipment.Status.Should().Be(CustomsStatus.Cleared);
        shipment.IsUKBound.Should().BeFalse();
    }

    [Fact]
    public void RunBrexitCheck_MultipleDocumentsMissing_ReturnsMultipleReasons()
    {
        var shipment = new Shipment
        {
            ShipmentNumber = "TEST-005",
            Client = "Morrisons",
            OriginCountry = "DE",
            DestinationCountry = "GB",
            GoodsValueEur = 2000,
            WeightKg = 4000,
            Documents = [DocumentType.CMR] // alleen CMR
        };

        shipment.RunBrexitCheck();

        shipment.Status.Should().Be(CustomsStatus.Blocked);
        shipment.BlockReasons.Should().HaveCountGreaterThan(1);
    }
}
