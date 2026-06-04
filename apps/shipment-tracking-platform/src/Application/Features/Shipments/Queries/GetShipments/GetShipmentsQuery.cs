using MediatR;
using ShipmentTracking.Application.Common.Interfaces;
using ShipmentTracking.Domain.Enums;

namespace ShipmentTracking.Application.Features.Shipments.Queries.GetShipments;

public sealed record GetShipmentsQuery(
    ShipmentStatus? StatusFilter = null,
    string? SearchTerm = null,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<ShipmentSummaryDto>>;

public sealed record ShipmentSummaryDto(
    Guid Id,
    string TrackingNumber,
    string RecipientName,
    string RecipientAddress,
    ShipmentStatus Status,
    string StatusLabel,
    decimal WeightKg,
    DateTime CreatedAt);

public sealed record PagedResult<T>(
    IReadOnlyList<T> Items,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages);

public sealed class GetShipmentsHandler(IShipmentRepository repository)
    : IRequestHandler<GetShipmentsQuery, PagedResult<ShipmentSummaryDto>>
{
    public async Task<PagedResult<ShipmentSummaryDto>> Handle(
        GetShipmentsQuery query,
        CancellationToken ct)
    {
        var (items, totalCount) = await repository.GetPagedAsync(
            query.StatusFilter,
            query.SearchTerm,
            query.Page,
            query.PageSize,
            ct);

        var dtos = items.Select(s => new ShipmentSummaryDto(
            s.Id,
            s.TrackingNumber,
            s.RecipientName,
            s.RecipientAddress,
            s.Status,
            s.Status.ToString(),
            s.WeightKg,
            s.CreatedAt)).ToList();

        return new PagedResult<ShipmentSummaryDto>(
            dtos,
            totalCount,
            query.Page,
            query.PageSize,
            (int)Math.Ceiling(totalCount / (double)query.PageSize));
    }
}
