using FluentValidation;
using MediatR;
using ShipmentTracking.Application.Common.Interfaces;
using ShipmentTracking.Domain.Entities;

namespace ShipmentTracking.Application.Features.Shipments.Commands.CreateShipment;

// --- Command ---
public sealed record CreateShipmentCommand(
    string SenderName,
    string SenderAddress,
    string RecipientName,
    string RecipientAddress,
    string Description,
    decimal WeightKg) : IRequest<CreateShipmentResult>;

// --- Result ---
public sealed record CreateShipmentResult(
    Guid Id,
    string TrackingNumber);

// --- Validator ---
public sealed class CreateShipmentValidator : AbstractValidator<CreateShipmentCommand>
{
    public CreateShipmentValidator()
    {
        RuleFor(x => x.SenderName)
            .NotEmpty().WithMessage("Naam afzender is verplicht.")
            .MaximumLength(200);

        RuleFor(x => x.SenderAddress)
            .NotEmpty().WithMessage("Adres afzender is verplicht.")
            .MaximumLength(500);

        RuleFor(x => x.RecipientName)
            .NotEmpty().WithMessage("Naam ontvanger is verplicht.")
            .MaximumLength(200);

        RuleFor(x => x.RecipientAddress)
            .NotEmpty().WithMessage("Adres ontvanger is verplicht.")
            .MaximumLength(500);

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Omschrijving is verplicht.")
            .MaximumLength(1000);

        RuleFor(x => x.WeightKg)
            .GreaterThan(0).WithMessage("Gewicht moet groter zijn dan 0 kg.")
            .LessThanOrEqualTo(5000).WithMessage("Gewicht mag maximaal 5000 kg zijn.");
    }
}

// --- Handler ---
public sealed class CreateShipmentHandler(
    IShipmentRepository repository,
    ICurrentUserService currentUser)
    : IRequestHandler<CreateShipmentCommand, CreateShipmentResult>
{
    public async Task<CreateShipmentResult> Handle(
        CreateShipmentCommand command,
        CancellationToken ct)
    {
        var shipment = Shipment.Create(
            command.SenderName,
            command.SenderAddress,
            command.RecipientName,
            command.RecipientAddress,
            command.Description,
            command.WeightKg,
            currentUser.UserName);

        await repository.AddAsync(shipment, ct);
        await repository.SaveChangesAsync(ct);

        return new CreateShipmentResult(shipment.Id, shipment.TrackingNumber);
    }
}
