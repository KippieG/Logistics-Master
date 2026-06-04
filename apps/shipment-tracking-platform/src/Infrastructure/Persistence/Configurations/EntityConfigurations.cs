using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ShipmentTracking.Domain.Entities;

namespace ShipmentTracking.Infrastructure.Persistence.Configurations;

public sealed class ShipmentConfiguration : IEntityTypeConfiguration<Shipment>
{
    public void Configure(EntityTypeBuilder<Shipment> builder)
    {
        builder.HasKey(s => s.Id);

        builder.Property(s => s.TrackingNumber)
            .HasMaxLength(50)
            .IsRequired();

        builder.HasIndex(s => s.TrackingNumber).IsUnique();

        builder.Property(s => s.SenderName).HasMaxLength(200).IsRequired();
        builder.Property(s => s.SenderAddress).HasMaxLength(500).IsRequired();
        builder.Property(s => s.RecipientName).HasMaxLength(200).IsRequired();
        builder.Property(s => s.RecipientAddress).HasMaxLength(500).IsRequired();
        builder.Property(s => s.Description).HasMaxLength(1000).IsRequired();

        builder.Property(s => s.WeightKg)
            .HasColumnType("decimal(10,3)")
            .IsRequired();

        builder.Property(s => s.Status)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(s => s.CreatedBy).HasMaxLength(256).IsRequired();

        builder.HasMany(s => s.StatusHistory)
            .WithOne()
            .HasForeignKey(h => h.ShipmentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(s => s.Documents)
            .WithOne()
            .HasForeignKey(d => d.ShipmentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.ToTable("Shipments");
    }
}

public sealed class ShipmentStatusHistoryConfiguration : IEntityTypeConfiguration<ShipmentStatusHistory>
{
    public void Configure(EntityTypeBuilder<ShipmentStatusHistory> builder)
    {
        builder.HasKey(h => h.Id);
        builder.Property(h => h.Status).HasConversion<string>().HasMaxLength(50);
        builder.Property(h => h.Notes).HasMaxLength(500);
        builder.Property(h => h.ChangedBy).HasMaxLength(256);
        builder.ToTable("ShipmentStatusHistories");
    }
}

public sealed class DocumentConfiguration : IEntityTypeConfiguration<Document>
{
    public void Configure(EntityTypeBuilder<Document> builder)
    {
        builder.HasKey(d => d.Id);
        builder.Property(d => d.FileName).HasMaxLength(255).IsRequired();
        builder.Property(d => d.ContentType).HasMaxLength(100).IsRequired();
        builder.Property(d => d.BlobUri).HasMaxLength(1000).IsRequired();
        builder.Property(d => d.UploadedBy).HasMaxLength(256).IsRequired();
        builder.ToTable("Documents");
    }
}
