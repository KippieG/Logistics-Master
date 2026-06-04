using FluentAssertions;
using ShipmentTracking.Domain.Entities;
using ShipmentTracking.Domain.Enums;
using ShipmentTracking.Domain.Exceptions;
using Xunit;

namespace ShipmentTracking.Tests.Unit.Domain;

public sealed class ShipmentTests
{
    // ── Factory ──────────────────────────────────────────────────────────────

    [Fact]
    public void Create_WithValidData_ShouldReturnShipmentWithDraftStatus()
    {
        // Arrange & Act
        var shipment = CreateTestShipment();

        // Assert
        shipment.Status.Should().Be(ShipmentStatus.Draft);
        shipment.TrackingNumber.Should().StartWith("STP-");
        shipment.StatusHistory.Should().HaveCount(1);
        shipment.StatusHistory[0].Status.Should().Be(ShipmentStatus.Draft);
        shipment.IsDeleted.Should().BeFalse();
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(-100)]
    public void Create_WithInvalidWeight_ShouldThrowDomainException(decimal weight)
    {
        // Act
        var act = () => Shipment.Create("Afzender", "Adres A", "Ontvanger", "Adres B", "Pakket", weight, "user");

        // Assert
        act.Should().Throw<DomainException>()
           .WithMessage("*Gewicht*");
    }

    // ── Status transitions ────────────────────────────────────────────────────

    [Theory]
    [InlineData(ShipmentStatus.Draft,          ShipmentStatus.Confirmed)]
    [InlineData(ShipmentStatus.Draft,          ShipmentStatus.Cancelled)]
    [InlineData(ShipmentStatus.Confirmed,      ShipmentStatus.InTransit)]
    [InlineData(ShipmentStatus.InTransit,      ShipmentStatus.OutForDelivery)]
    [InlineData(ShipmentStatus.OutForDelivery, ShipmentStatus.Delivered)]
    [InlineData(ShipmentStatus.OutForDelivery, ShipmentStatus.Failed)]
    [InlineData(ShipmentStatus.Failed,         ShipmentStatus.InTransit)]
    public void UpdateStatus_WithValidTransition_ShouldSucceed(
        ShipmentStatus from, ShipmentStatus to)
    {
        // Arrange
        var shipment = CreateShipmentWithStatus(from);
        var countBefore = shipment.StatusHistory.Count;

        // Act
        shipment.UpdateStatus(to, "Test notitie", "testuser");

        // Assert
        shipment.Status.Should().Be(to);
        shipment.StatusHistory.Should().HaveCount(countBefore + 1);
    }

    [Theory]
    [InlineData(ShipmentStatus.Delivered,  ShipmentStatus.InTransit)]
    [InlineData(ShipmentStatus.Cancelled,  ShipmentStatus.Confirmed)]
    [InlineData(ShipmentStatus.Draft,      ShipmentStatus.Delivered)]
    [InlineData(ShipmentStatus.InTransit,  ShipmentStatus.Draft)]
    public void UpdateStatus_WithInvalidTransition_ShouldThrowException(
        ShipmentStatus from, ShipmentStatus to)
    {
        // Arrange
        var shipment = CreateShipmentWithStatus(from);

        // Act
        var act = () => shipment.UpdateStatus(to, "Test", "user");

        // Assert
        act.Should().Throw<InvalidStatusTransitionException>();
    }

    [Fact]
    public void UpdateStatus_ShouldAddToStatusHistory()
    {
        // Arrange
        var shipment = CreateTestShipment();
        var note = "Bevestigd door dispatcher";

        // Act
        shipment.UpdateStatus(ShipmentStatus.Confirmed, note, "dispatcher");

        // Assert
        var lastEntry = shipment.StatusHistory.Last();
        lastEntry.Status.Should().Be(ShipmentStatus.Confirmed);
        lastEntry.Notes.Should().Be(note);
        lastEntry.ChangedBy.Should().Be("dispatcher");
    }

    // ── Soft delete ───────────────────────────────────────────────────────────

    [Fact]
    public void SoftDelete_WhenStatusIsDraft_ShouldMarkAsDeleted()
    {
        // Arrange
        var shipment = CreateTestShipment();

        // Act
        shipment.SoftDelete();

        // Assert
        shipment.IsDeleted.Should().BeTrue();
    }

    [Theory]
    [InlineData(ShipmentStatus.InTransit)]
    [InlineData(ShipmentStatus.OutForDelivery)]
    public void SoftDelete_WhenShipmentIsInTransit_ShouldThrow(ShipmentStatus status)
    {
        // Arrange
        var shipment = CreateShipmentWithStatus(status);

        // Act
        var act = () => shipment.SoftDelete();

        // Assert
        act.Should().Throw<DomainException>()
           .WithMessage("*transit*");
    }

    // ── Documents ─────────────────────────────────────────────────────────────

    [Fact]
    public void AddDocument_ShouldIncreaseDocumentCount()
    {
        // Arrange
        var shipment = CreateTestShipment();
        var document = Document.Create(
            shipment.Id, "factuur.pdf", "application/pdf", 1024, "https://blob/factuur.pdf", "user");

        // Act
        shipment.AddDocument(document);

        // Assert
        shipment.Documents.Should().HaveCount(1);
        shipment.Documents[0].FileName.Should().Be("factuur.pdf");
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static Shipment CreateTestShipment() =>
        Shipment.Create("Sender NV", "Industrieweg 1, Gent",
            "Ontvanger BV", "Havenstraat 5, Antwerpen",
            "Elektronica - fragiel", 12.5m, "testuser");

    private static Shipment CreateShipmentWithStatus(ShipmentStatus targetStatus)
    {
        var shipment = CreateTestShipment();

        // Doorloop de statusmachine tot we de gewenste status bereiken
        var path = targetStatus switch
        {
            ShipmentStatus.Draft          => Array.Empty<ShipmentStatus>(),
            ShipmentStatus.Confirmed      => [ShipmentStatus.Confirmed],
            ShipmentStatus.Cancelled      => [ShipmentStatus.Cancelled],
            ShipmentStatus.InTransit      => [ShipmentStatus.Confirmed, ShipmentStatus.InTransit],
            ShipmentStatus.OutForDelivery => [ShipmentStatus.Confirmed, ShipmentStatus.InTransit, ShipmentStatus.OutForDelivery],
            ShipmentStatus.Delivered      => [ShipmentStatus.Confirmed, ShipmentStatus.InTransit, ShipmentStatus.OutForDelivery, ShipmentStatus.Delivered],
            ShipmentStatus.Failed         => [ShipmentStatus.Confirmed, ShipmentStatus.InTransit, ShipmentStatus.OutForDelivery, ShipmentStatus.Failed],
            _ => throw new ArgumentException($"Onbekende status: {targetStatus}")
        };

        foreach (var status in path)
            shipment.UpdateStatus(status, "Test", "testuser");

        return shipment;
    }
}
