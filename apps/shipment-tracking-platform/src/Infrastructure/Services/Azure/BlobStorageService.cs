using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ShipmentTracking.Application.Common.Interfaces;

namespace ShipmentTracking.Infrastructure.Services.Azure;

public sealed class BlobStorageService(
    IConfiguration configuration,
    ILogger<BlobStorageService> logger) : IBlobStorageService
{
    private readonly string _connectionString =
        configuration["Azure:BlobStorage:ConnectionString"]
        ?? throw new InvalidOperationException("Azure Blob Storage connection string ontbreekt.");

    private readonly string _containerName =
        configuration["Azure:BlobStorage:DocumentsContainer"] ?? "shipment-documents";

    public async Task<string> UploadAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        CancellationToken ct = default)
    {
        var container = await GetContainerAsync(ct);
        var blobName = $"{Guid.NewGuid()}/{fileName}";
        var blobClient = container.GetBlobClient(blobName);

        var uploadOptions = new BlobUploadOptions
        {
            HttpHeaders = new BlobHttpHeaders { ContentType = contentType }
        };

        logger.LogInformation("Upload gestart: {BlobName}", blobName);
        await blobClient.UploadAsync(fileStream, uploadOptions, ct);
        logger.LogInformation("Upload voltooid: {BlobUri}", blobClient.Uri);

        return blobClient.Uri.ToString();
    }

    public async Task<Stream> DownloadAsync(string blobUri, CancellationToken ct = default)
    {
        var blobClient = new BlobClient(new Uri(blobUri));
        var response = await blobClient.DownloadStreamingAsync(cancellationToken: ct);
        return response.Value.Content;
    }

    public async Task DeleteAsync(string blobUri, CancellationToken ct = default)
    {
        var blobClient = new BlobClient(new Uri(blobUri));
        await blobClient.DeleteIfExistsAsync(cancellationToken: ct);
        logger.LogInformation("Blob verwijderd: {BlobUri}", blobUri);
    }

    private async Task<BlobContainerClient> GetContainerAsync(CancellationToken ct)
    {
        var serviceClient = new BlobServiceClient(_connectionString);
        var container = serviceClient.GetBlobContainerClient(_containerName);
        await container.CreateIfNotExistsAsync(PublicAccessType.None, cancellationToken: ct);
        return container;
    }
}
