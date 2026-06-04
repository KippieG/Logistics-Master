namespace ShipmentTracking.Domain.Entities;

public sealed class Document
{
    public Guid Id { get; private set; }
    public Guid ShipmentId { get; private set; }
    public string FileName { get; private set; } = string.Empty;
    public string ContentType { get; private set; } = string.Empty;
    public long FileSizeBytes { get; private set; }
    public string BlobUri { get; private set; } = string.Empty;
    public string UploadedBy { get; private set; } = string.Empty;
    public DateTime UploadedAt { get; private set; }

    private Document() { }

    public static Document Create(
        Guid shipmentId,
        string fileName,
        string contentType,
        long fileSizeBytes,
        string blobUri,
        string uploadedBy) => new()
    {
        Id = Guid.NewGuid(),
        ShipmentId = shipmentId,
        FileName = fileName.Trim(),
        ContentType = contentType,
        FileSizeBytes = fileSizeBytes,
        BlobUri = blobUri,
        UploadedBy = uploadedBy,
        UploadedAt = DateTime.UtcNow
    };
}
