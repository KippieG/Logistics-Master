namespace ShipmentTracking.Domain.Exceptions;

public class DomainException : Exception
{
    public DomainException(string message) : base(message) { }
}

public class ShipmentNotFoundException : DomainException
{
    public ShipmentNotFoundException(Guid id)
        : base($"Zending met id '{id}' werd niet gevonden.") { }
}

public class InvalidStatusTransitionException : DomainException
{
    public InvalidStatusTransitionException(string from, string to)
        : base($"Statusovergang van '{from}' naar '{to}' is niet toegestaan.") { }
}
