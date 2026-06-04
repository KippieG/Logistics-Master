using FluentAssertions;
using FluentValidation;
using Moq;
using ShipmentTracking.Application.Common.Interfaces;
using ShipmentTracking.Application.Features.Shipments.Commands.CreateShipment;
using ShipmentTracking.Domain.Entities;
using Xunit;

namespace ShipmentTracking.Tests.Unit.Application;

public sealed class CreateShipmentHandlerTests
{
    private readonly Mock<IShipmentRepository> _repositoryMock = new();
    private readonly Mock<ICurrentUserService> _currentUserMock = new();
    private readonly CreateShipmentHandler _handler;

    public CreateShipmentHandlerTests()
    {
        _currentUserMock.Setup(u => u.UserName).Returns("testuser");
        _handler = new CreateShipmentHandler(_repositoryMock.Object, _currentUserMock.Object);
    }

    [Fact]
    public async Task Handle_WithValidCommand_ShouldCreateShipmentAndReturnResult()
    {
        // Arrange
        var command = ValidCommand();
        _repositoryMock.Setup(r => r.AddAsync(It.IsAny<Shipment>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _repositoryMock.Setup(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Id.Should().NotBeEmpty();
        result.TrackingNumber.Should().StartWith("STP-");

        _repositoryMock.Verify(r => r.AddAsync(It.IsAny<Shipment>(), It.IsAny<CancellationToken>()), Times.Once);
        _repositoryMock.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldUsernameFromCurrentUserService()
    {
        // Arrange
        var command = ValidCommand();
        Shipment? capturedShipment = null;

        _repositoryMock.Setup(r => r.AddAsync(It.IsAny<Shipment>(), It.IsAny<CancellationToken>()))
            .Callback<Shipment, CancellationToken>((s, _) => capturedShipment = s)
            .Returns(Task.CompletedTask);
        _repositoryMock.Setup(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        capturedShipment.Should().NotBeNull();
        capturedShipment!.CreatedBy.Should().Be("testuser");
    }

    private static CreateShipmentCommand ValidCommand() => new(
        SenderName: "Sender NV",
        SenderAddress: "Industrieweg 1, Gent",
        RecipientName: "Ontvanger BV",
        RecipientAddress: "Havenstraat 5, Antwerpen",
        Description: "Elektronica",
        WeightKg: 5.5m);
}

public sealed class CreateShipmentValidatorTests
{
    private readonly CreateShipmentValidator _validator = new();

    [Fact]
    public void Validate_WithValidCommand_ShouldHaveNoErrors()
    {
        var command = new CreateShipmentCommand(
            "Sender", "Adres 1", "Ontvanger", "Adres 2", "Beschrijving", 10m);
        var result = _validator.Validate(command);
        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData("", "Adres", "Ontvanger", "Adres", "Omschrijving", 1)]
    [InlineData("Sender", "", "Ontvanger", "Adres", "Omschrijving", 1)]
    [InlineData("Sender", "Adres", "", "Adres", "Omschrijving", 1)]
    [InlineData("Sender", "Adres", "Ontvanger", "", "Omschrijving", 1)]
    [InlineData("Sender", "Adres", "Ontvanger", "Adres", "", 1)]
    public void Validate_WithMissingRequiredFields_ShouldHaveErrors(
        string sender, string senderAddr, string recipient, string recipientAddr,
        string desc, decimal weight)
    {
        var command = new CreateShipmentCommand(sender, senderAddr, recipient, recipientAddr, desc, weight);
        var result = _validator.Validate(command);
        result.IsValid.Should().BeFalse();
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(5001)]
    public void Validate_WithInvalidWeight_ShouldHaveWeightError(decimal weight)
    {
        var command = new CreateShipmentCommand("S", "A", "R", "A", "D", weight);
        var result = _validator.Validate(command);
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateShipmentCommand.WeightKg));
    }
}
