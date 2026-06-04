using ECS.EcoLoad.Domain;
using ECS.EcoLoad.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace ECS.EcoLoad.Services;

public class ReeferSimulator(IHubContext<ReeferHub> hub, ReeferStore store) : BackgroundService
{
    private readonly Random _rng = new();

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        while (!ct.IsCancellationRequested)
        {
            await Task.Delay(TimeSpan.FromSeconds(5), ct);

            foreach (var reefer in store.All)
            {
                double drift = (_rng.NextDouble() - 0.48) * 0.6; // slight upward drift bias
                reefer.CurrentTemp = Math.Round(reefer.CurrentTemp + drift, 2);
                reefer.LastReading = DateTime.UtcNow;

                reefer.Status = reefer.DeviationCelsius switch
                {
                    > 3 => ReeferStatus.Critical,
                    > 1 => ReeferStatus.Warning,
                    _ => ReeferStatus.Normal
                };

                await hub.Clients.Group($"reefer-{reefer.Id}")
                    .SendAsync("TemperatureUpdate", new
                    {
                        reefer.Id,
                        reefer.ContainerNumber,
                        reefer.CurrentTemp,
                        reefer.TargetTempMin,
                        reefer.TargetTempMax,
                        reefer.Status,
                        reefer.DeviationCelsius,
                        Timestamp = reefer.LastReading
                    }, ct);

                // broadcast critical alerts to all connected clients
                if (reefer.Status == ReeferStatus.Critical)
                {
                    await hub.Clients.All.SendAsync("CriticalAlert", new
                    {
                        reefer.Id,
                        reefer.ContainerNumber,
                        reefer.Client,
                        reefer.CurrentTemp,
                        reefer.DeviationCelsius,
                        Message = $"ALERT: {reefer.ContainerNumber} ({reefer.Client}) — temperatuur {reefer.CurrentTemp}°C (doel: {reefer.TargetTempMin}–{reefer.TargetTempMax}°C)"
                    }, ct);
                }
            }
        }
    }
}
