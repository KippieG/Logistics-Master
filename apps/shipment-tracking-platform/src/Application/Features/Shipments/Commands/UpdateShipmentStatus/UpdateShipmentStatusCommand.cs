using FluentValidation;
using MediatR;
using ShipmentTracking.Application.Common.Interfaces;
using ShipmentTracking.Domain.Enums;
using ShipmentTracking.Domain.Exceptions;

namespace ShipmentTracking.Application.Features.Shipments.Commands.UpdateShipmentStatus;

public sealed record UpdateShipmentStatusCommand(
    Guid ShipmentId,
    ShipmentStatus NewStatus,
    string Notes) : IRequest;

public sealed class UpdateShipmentStatusValidator : AbstractValidator<UpdateShipmentStatusCommand>
{
    public UpdateShipmentStatusValidator()
    {
        RuleFor(x => x.ShipmentId).NotEmpty();
        RuleFor(x => x.Notes).NotEmpty().MaximumLength(500);
    }
}

public sealed class UpdateShipmentStatusHandler(
    IShipmentRepository repository,
    IShipmentEventPublisher eventPublisher,
    ICurrentUserService currentUser)
    : IRequestHandler<UpdateShipmentStatusCommand>
{
    public async Task Handle(UpdateShipmentStatusCommand command, CancellationToken ct)
    {
        var shipment = await repository.GetByIdAsync(command.ShipmentId, ct)
            ?? throw new ShipmentNotFoundException(command.ShipmentId);

        shipment.UpdateStatus(command.NewStatus, command.Notes, currentUser.UserName);
        await repository.SaveChangesAsync(ct);

        // Publiceer event naar Azure Service Bus
        await eventPublisher.PublishStatusChangedAsync(
            shipment.Id,
            shipment.TrackingNumber,
            command.NewStatus.ToString(),
            ct);
    }
}
