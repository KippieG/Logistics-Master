namespace ECS.EcoLoad.Domain;

public enum CustomsStatus { Cleared, Pending, Blocked, InspectionRequired }
public enum DocumentType { EUR1, T1, CMR, PackingList, HealthCertificate }

public class Shipment
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public string ShipmentNumber { get; init; } = string.Empty;
    public string Client { get; init; } = string.Empty;
    public string OriginCountry { get; init; } = string.Empty;
    public string DestinationCountry { get; init; } = string.Empty;
    public bool IsUKBound => DestinationCountry == "GB";
    public List<DocumentType> Documents { get; init; } = [];
    public double GoodsValueEur { get; init; }
    public double WeightKg { get; init; }
    public CustomsStatus Status { get; set; } = CustomsStatus.Pending;
    public List<string> BlockReasons { get; private set; } = [];
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;

    public void RunBrexitCheck()
    {
        BlockReasons.Clear();

        if (IsUKBound)
        {
            if (!Documents.Contains(DocumentType.EUR1))
                BlockReasons.Add("EUR1-certificaat ontbreekt (vereist voor preferentieel tarief UK)");

            if (!Documents.Contains(DocumentType.CMR))
                BlockReasons.Add("CMR-vrachtbrief ontbreekt");

            if (!Documents.Contains(DocumentType.PackingList))
                BlockReasons.Add("Paklijst (Packing List) ontbreekt");

            if (GoodsValueEur > 1000 && !Documents.Contains(DocumentType.T1))
                BlockReasons.Add($"T1-document vereist voor goederen boven €1.000 (waarde: €{GoodsValueEur:N0})");
        }

        Status = BlockReasons.Count == 0 ? CustomsStatus.Cleared : CustomsStatus.Blocked;
    }
}
