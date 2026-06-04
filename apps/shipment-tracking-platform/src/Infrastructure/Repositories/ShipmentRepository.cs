using Microsoft.EntityFrameworkCore;
using ShipmentTracking.Application.Common.Interfaces;
using ShipmentTracking.Domain.Entities;
using ShipmentTracking.Domain.Enums;
using ShipmentTracking.Infrastructure.Persistence;

namespace ShipmentTracking.Infrastructure.Repositories;

public sealed class ShipmentRepository(ApplicationDbContext db) : IShipmentRepository
{
    public async Task<Shipment?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await db.Shipments.FindAsync([id], ct);

    public async Task<Shipment?> GetByIdWithDetailsAsync(Guid id, CancellationToken ct = default)
        => await db.Shipments
            .Include(s => s.StatusHistory)
            .Include(s => s.Documents)
            .FirstOrDefaultAsync(s => s.Id == id, ct);

    public async Task<(IReadOnlyList<Shipment> Items, int TotalCount)> GetPagedAsync(
        ShipmentStatus? statusFilter,
        string? searchTerm,
        int page,
        int pageSize,
        CancellationToken ct = default)
    {
        var query = db.Shipments.AsQueryable();

        if (statusFilter.HasValue)
            query = query.Where(s => s.Status == statusFilter.Value);

        if (!string.IsNullOrWhiteSpace(searchTerm))
            query = query.Where(s =>
                s.TrackingNumber.Contains(searchTerm) ||
                s.RecipientName.Contains(searchTerm) ||
                s.RecipientAddress.Contains(searchTerm));

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(s => s.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, totalCount);
    }

    public async Task AddAsync(Shipment shipment, CancellationToken ct = default)
        => await db.Shipments.AddAsync(shipment, ct);

    public async Task SaveChangesAsync(CancellationToken ct = default)
        => await db.SaveChangesAsync(ct);
}

public sealed class DocumentRepository(ApplicationDbContext db) : IDocumentRepository
{
    public async Task<Document?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await db.Documents.FindAsync([id], ct);

    public async Task<IReadOnlyList<Document>> GetByShipmentIdAsync(Guid shipmentId, CancellationToken ct = default)
        => await db.Documents
            .Where(d => d.ShipmentId == shipmentId)
            .OrderByDescending(d => d.UploadedAt)
            .ToListAsync(ct);

    public async Task AddAsync(Document document, CancellationToken ct = default)
        => await db.Documents.AddAsync(document, ct);

    public async Task SaveChangesAsync(CancellationToken ct = default)
        => await db.SaveChangesAsync(ct);
}
