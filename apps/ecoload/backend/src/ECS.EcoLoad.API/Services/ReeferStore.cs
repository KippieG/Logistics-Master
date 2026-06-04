using ECS.EcoLoad.Domain;

namespace ECS.EcoLoad.Services;

public class ReeferStore
{
    private readonly List<ReeferContainer> _reefers =
    [
        new() { ContainerNumber = "ECSU-4401820", Client = "Tesco UK", Destination = "Tilbury", TargetTempMin = 2, TargetTempMax = 5, CurrentTemp = 3.8 },
        new() { ContainerNumber = "ECSU-4401821", Client = "Sainsbury's", Destination = "Felixstowe", TargetTempMin = -18, TargetTempMax = -15, CurrentTemp = -16.5 },
        new() { ContainerNumber = "ECSU-4401822", Client = "ASDA", Destination = "Tilbury", TargetTempMin = 1, TargetTempMax = 4, CurrentTemp = 2.1 },
        new() { ContainerNumber = "ECSU-4401823", Client = "Morrisons", Destination = "Purfleet", TargetTempMin = -20, TargetTempMax = -18, CurrentTemp = -19.2 },
        new() { ContainerNumber = "ECSU-4401824", Client = "Waitrose", Destination = "Tilbury", TargetTempMin = 0, TargetTempMax = 3, CurrentTemp = 1.4 },
    ];

    public IReadOnlyList<ReeferContainer> All => _reefers.AsReadOnly();

    public ReeferContainer? GetById(Guid id) => _reefers.FirstOrDefault(r => r.Id == id);

    public void Add(ReeferContainer reefer) => _reefers.Add(reefer);
}
