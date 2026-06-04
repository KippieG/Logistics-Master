using FluentValidation;
using MediatR;
using ShipmentTracking.Application.Common.Interfaces;
using ShipmentTracking.Domain.Entities;
using ShipmentTracking.Domain.Exceptions;

namespace ShipmentTracking.Application.Features.Documents.Commands.UploadDocument;

public sealed record UploadDocumentCommand(
    Guid ShipmentId,
    string FileName,
    string ContentType,
    long FileSizeBytes,
    Stream FileStream) : IRequest<Guid>;

public sealed class UploadDocumentValidator : AbstractValidator<UploadDocumentCommand>
{
    private static readonly string[] AllowedTypes =
        ["application/pdf", "image/jpeg", "image/png", "application/msword",
         "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

    public UploadDocumentValidator()
    {
        RuleFor(x => x.ShipmentId).NotEmpty();
        RuleFor(x => x.FileName).NotEmpty().MaximumLength(255);
        RuleFor(x => x.ContentType).Must(t => AllowedTypes.Contains(t))
            .WithMessage("Bestandstype niet toegestaan. Gebruik PDF, JPG, PNG of Word.");
        RuleFor(x => x.FileSizeBytes)
            .GreaterThan(0)
            .LessThanOrEqualTo(20 * 1024 * 1024) // 20 MB max
            .WithMessage("Bestand mag maximaal 20 MB zijn.");
    }
}

public sealed class UploadDocumentHandler(
    IShipmentRepository shipmentRepository,
    IDocumentRepository documentRepository,
    IBlobStorageService blobStorage,
    ICurrentUserService currentUser)
    : IRequestHandler<UploadDocumentCommand, Guid>
{
    public async Task<Guid> Handle(UploadDocumentCommand command, CancellationToken ct)
    {
        var shipment = await shipmentRepository.GetByIdAsync(command.ShipmentId, ct)
            ?? throw new ShipmentNotFoundException(command.ShipmentId);

        var blobUri = await blobStorage.UploadAsync(
            command.FileStream,
            $"{shipment.TrackingNumber}/{command.FileName}",
            command.ContentType,
            ct);

        var document = Document.Create(
            shipment.Id,
            command.FileName,
            command.ContentType,
            command.FileSizeBytes,
            blobUri,
            currentUser.UserName);

        shipment.AddDocument(document);
        await documentRepository.AddAsync(document, ct);
        await documentRepository.SaveChangesAsync(ct);

        return document.Id;
    }
}
