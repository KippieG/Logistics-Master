using ECS.EcoLoad.Domain;

namespace ECS.EcoLoad.Services;

public class ShipmentStore
{
    private readonly List<Shipment> _shipments;

    public ShipmentStore()
    {
        _shipments =
        [
            new Shipment
            {
                ShipmentNumber = "ECS-2024-4401",
                Client = "Tesco UK",
                OriginCountry = "BE",
                DestinationCountry = "GB",
                GoodsValueEur = 18500,
                WeightKg = 24000,
                Documents = [DocumentType.EUR1, DocumentType.CMR, DocumentType.PackingList, DocumentType.T1]
            },
            new Shipment
            {
                ShipmentNumber = "ECS-2024-4402",
                Client = "Sainsbury's",
                OriginCountry = "BE",
                DestinationCountry = "GB",
                GoodsValueEur = 9200,
                WeightKg = 12500,
                Documents = [DocumentType.CMR, DocumentType.PackingList] // EUR1 ontbreekt!
            },
            new Shipment
            {
                ShipmentNumber = "ECS-2024-4403",
                Client = "ASDA Distribution",
                OriginCountry = "NL",
                DestinationCountry = "GB",
                GoodsValueEur = 6700,
                WeightKg = 8900,
                Documents = [DocumentType.EUR1, DocumentType.CMR, DocumentType.PackingList, DocumentType.T1]
            },
            new Shipment
            {
                ShipmentNumber = "ECS-2024-4404",
                Client = "Morrisons",
                OriginCountry = "DE",
                DestinationCountry = "GB",
                GoodsValueEur = 3400,
                WeightKg = 5200,
                Documents = [DocumentType.CMR] // meerdere documenten ontbreken
            },
            new Shipment
            {
                ShipmentNumber = "ECS-2024-4405",
                Client = "Carrefour BE",
                OriginCountry = "FR",
                DestinationCountry = "BE",
                GoodsValueEur = 4100,
                WeightKg = 6800,
                Documents = [DocumentType.CMR, DocumentType.PackingList]
            },
        ];

        foreach (var s in _shipments)
            s.RunBrexitCheck();
    }

    public IReadOnlyList<Shipment> All => _shipments.AsReadOnly();
    public Shipment? GetById(Guid id) => _shipments.FirstOrDefault(s => s.Id == id);
    public void Add(Shipment shipment) { shipment.RunBrexitCheck(); _shipments.Add(shipment); }
}
