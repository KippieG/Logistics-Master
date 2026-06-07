using ECS.EcoLoad.Domain;
using ECS.EcoLoad.Services;
using Microsoft.AspNetCore.Mvc;

namespace ECS.EcoLoad.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReefersController(ReeferStore store) : ControllerBase
{
    [HttpGet]
    public ActionResult<IEnumerable<object>> GetAll() =>
        Ok(store.All.Select(r => new
        {
            r.Id,
            r.ContainerNumber,
            r.Client,
            r.Destination,
            r.CurrentTemp,
            r.TargetTempMin,
            r.TargetTempMax,
            r.Status,
            r.DeviationCelsius,
            r.IsOutOfRange,
            r.LastReading
        }));

    [HttpGet("{id:guid}")]
    public ActionResult<object> GetById(Guid id)
    {
        var reefer = store.GetById(id);
        if (reefer is null) return NotFound();
        return Ok(reefer);
    }

    [HttpPost("{id:guid}/telemetry")]
    public ActionResult PostTelemetry(Guid id, [FromBody] TelemetryPayload payload)
    {
        var reefer = store.GetById(id);
        if (reefer is null) return NotFound();

        reefer.CurrentTemp = payload.Temperature;
        reefer.LastReading = DateTime.UtcNow;
        return NoContent();
    }
}

public record TelemetryPayload(double Temperature);
