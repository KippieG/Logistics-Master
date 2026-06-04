using ECS.EcoLoad.Domain;
using ECS.EcoLoad.Services;
using Microsoft.AspNetCore.Mvc;

namespace ECS.EcoLoad.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TrailersController(ConsolidationEngine engine) : ControllerBase
{
    [HttpPost("optimize")]
    public ActionResult<ConsolidationResult> Optimize([FromBody] OptimizeRequest request)
    {
        if (request.Pallets.Count == 0)
            return BadRequest("Geen pallets opgegeven.");

        var result = engine.Optimize(request.TrailerNumber, request.Destination, request.Pallets);
        return Ok(result);
    }

    [HttpPost("demo")]
    public ActionResult<ConsolidationResult> Demo()
    {
        var pallets = GenerateDemoPallets();
        var result = engine.Optimize("ECS-TRL-2024-001", "Tilbury, UK", pallets);
        return Ok(result);
    }

    private static List<Pallet> GenerateDemoPallets()
    {
        var rng = new Random(42);
        var clients = new[] { "Tesco UK", "Sainsbury's", "ASDA", "Morrisons", "Waitrose" };
        var types = new[] { CargoType.FMCG, CargoType.Ambient, CargoType.Chilled };
        var pallets = new List<Pallet>();

        for (int i = 0; i < 28; i++)
        {
            pallets.Add(new Pallet
            {
                Client = clients[rng.Next(clients.Length)],
                Destination = "Tilbury",
                WeightKg = Math.Round(200 + rng.NextDouble() * 1000, 1),
                HeightCm = rng.Next(80, 200),
                CargoType = types[rng.Next(types.Length)]
            });
        }
        return pallets;
    }
}

public record OptimizeRequest(string TrailerNumber, string Destination, List<Pallet> Pallets);
