using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShipmentTracking.Application.Features.Shipments.Commands.CreateShipment;
using ShipmentTracking.Application.Features.Shipments.Commands.UpdateShipmentStatus;
using ShipmentTracking.Application.Features.Shipments.Queries.GetShipment;
using ShipmentTracking.Application.Features.Shipments.Queries.GetShipments;
using ShipmentTracking.Domain.Enums;

namespace ShipmentTracking.WebAPI.Controllers;

/// <summary>
/// Beheer van logistieke zendingen.
/// </summary>
[ApiController]
[Route("api/shipments")]
[Authorize]
[Produces("application/json")]
public sealed class ShipmentsController(IMediator mediator) : ControllerBase
{
    /// <summary>
    /// Haalt een gepagineerde lijst van zendingen op.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<ShipmentSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] ShipmentStatus? status,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var result = await mediator.Send(
            new GetShipmentsQuery(status, search, page, pageSize), ct);
        return Ok(result);
    }

    /// <summary>
    /// Haalt de details van één zending op.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ShipmentDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await mediator.Send(new GetShipmentQuery(id), ct);
        return Ok(result);
    }

    /// <summary>
    /// Maakt een nieuwe zending aan.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(CreateShipmentResult), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create(
        [FromBody] CreateShipmentCommand command,
        CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>
    /// Werkt de status van een zending bij.
    /// </summary>
    [HttpPut("{id:guid}/status")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> UpdateStatus(
        Guid id,
        [FromBody] UpdateStatusRequest request,
        CancellationToken ct)
    {
        await mediator.Send(
            new UpdateShipmentStatusCommand(id, request.NewStatus, request.Notes), ct);
        return NoContent();
    }
}

public sealed record UpdateStatusRequest(ShipmentStatus NewStatus, string Notes);
