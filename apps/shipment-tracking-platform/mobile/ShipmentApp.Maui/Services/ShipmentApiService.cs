using System.Net.Http.Json;

namespace ShipmentApp.Maui.Services;

public sealed class ShipmentApiService(HttpClient httpClient)
{
    public async Task<PagedResult<ShipmentSummaryDto>?> GetShipmentsAsync(
        int page = 1, int pageSize = 20, CancellationToken ct = default)
    {
        return await httpClient.GetFromJsonAsync<PagedResult<ShipmentSummaryDto>>(
            $"api/shipments?page={page}&pageSize={pageSize}", ct);
    }

    public async Task<ShipmentDetailDto?> GetShipmentAsync(Guid id, CancellationToken ct = default)
    {
        return await httpClient.GetFromJsonAsync<ShipmentDetailDto>($"api/shipments/{id}", ct);
    }

    public async Task<string?> TrackByNumberAsync(string trackingNumber, CancellationToken ct = default)
    {
        var response = await httpClient.GetAsync(
            $"api/shipments?search={Uri.EscapeDataString(trackingNumber)}&pageSize=1", ct);

        if (!response.IsSuccessStatusCode) return null;

        var result = await response.Content.ReadFromJsonAsync<PagedResult<ShipmentSummaryDto>>(ct);
        return result?.Items.FirstOrDefault()?.TrackingNumber;
    }
}

// DTOs gekopieerd van Application-laag (in productie: gedeelde NuGet package)
public sealed record PagedResult<T>(
    List<T> Items, int TotalCount, int Page, int PageSize, int TotalPages);

public sealed record ShipmentSummaryDto(
    Guid Id, string TrackingNumber, string RecipientName,
    string RecipientAddress, string Status, string StatusLabel,
    decimal WeightKg, DateTime CreatedAt);

public sealed record ShipmentDetailDto(
    Guid Id, string TrackingNumber, string SenderName, string SenderAddress,
    string RecipientName, string RecipientAddress, string Description,
    decimal WeightKg, string Status, string StatusLabel,
    DateTime CreatedAt, DateTime UpdatedAt,
    List<StatusHistoryDto> StatusHistory, List<DocumentDto> Documents);

public sealed record StatusHistoryDto(
    string Status, string StatusLabel, string Notes, string ChangedBy, DateTime ChangedAt);

public sealed record DocumentDto(
    Guid Id, string FileName, string ContentType, long FileSizeBytes,
    string UploadedBy, DateTime UploadedAt);
