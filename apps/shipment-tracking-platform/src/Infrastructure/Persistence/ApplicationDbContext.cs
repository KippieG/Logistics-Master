using Microsoft.EntityFrameworkCore;
using ShipmentTracking.Domain.Entities;

namespace ShipmentTracking.Infrastructure.Persistence;

public sealed class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : DbContext(options)
{
    public DbSet<Shipment> Shipments => Set<Shipment>();
    public DbSet<ShipmentStatusHistory> ShipmentStatusHistories => Set<ShipmentStatusHistory>();
    public DbSet<Document> Documents => Set<Document>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Laad alle IEntityTypeConfiguration<T> implementaties in deze assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        // Globale query filter: soft-deleted zendingen nooit retourneren
        modelBuilder.Entity<Shipment>().HasQueryFilter(s => !s.IsDeleted);

        base.OnModelCreating(modelBuilder);
    }
}
