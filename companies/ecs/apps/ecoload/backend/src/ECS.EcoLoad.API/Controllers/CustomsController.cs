using ECS.EcoLoad.Domain;
using ECS.EcoLoad.Services;
using Microsoft.AspNetCore.Mvc;

namespace ECS.EcoLoad.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomsController(ShipmentStore store) : ControllerBase
{
    [HttpGet]
    public ActionResult<IEnumerable<object>> GetAll() =>
        Ok(store.All.Select(s => MapToDto(s)));

    [HttpGet("{id:guid}")]
    public ActionResult<object> GetById(Guid id)
    {
        var shipment = store.GetById(id);
        if (shipment is null) return NotFound();
        return Ok(MapToDto(shipment));
    }

    [HttpPost("check")]
    public ActionResult<object> CheckShipment([FromBody] ShipmentCheckRequest request)
    {
        var shipment = new Shipment
        {
            ShipmentNumber = request.ShipmentNumber,
            Client = request.Client,
            OriginCountry = request.OriginCountry,
            DestinationCountry = request.DestinationCountry,
            GoodsValueEur = request.GoodsValueEur,
            WeightKg = request.WeightKg,
            Documents = request.Documents
        };
        shipment.RunBrexitCheck();
        store.Add(shipment);
        return CreatedAtAction(nameof(GetById), new { id = shipment.Id }, MapToDto(shipment));
    }

    private static object MapToDto(Shipment s) => new
    {
        s.Id,
        s.ShipmentNumber,
        s.Client,
        s.OriginCountry,
        s.DestinationCountry,
        s.IsUKBound,
        s.GoodsValueEur,
        s.WeightKg,
        s.Documents,
        s.Status,
        s.BlockReasons,
        s.CreatedAt
    };
}

public record ShipmentCheckRequest(
    string ShipmentNumber,
    string Client,
    string OriginCountry,
    string DestinationCountry,
    double GoodsValueEur,
    double WeightKg,
    List<DocumentType> Documents);
