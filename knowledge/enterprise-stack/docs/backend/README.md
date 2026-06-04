# Backend — .NET / C# / ASP.NET Core

## Wat is dit en waarom gebruik je het?

De **backend** is de server-kant van een applicatie — het deel dat de gebruiker niet ziet maar dat alle logica en data verwerkt. Als je op een knop klikt in een webapplicatie, stuurt de frontend een verzoek naar de backend. De backend verwerkt dat verzoek, raadpleegt de database, voert business regels uit en stuurt een antwoord terug.

**.NET** is het platform van Microsoft voor het bouwen van applicaties. **C#** is de programmeertaal. **ASP.NET Core** is het webframework waarmee je API's en webapplicaties bouwt.

**Waarom .NET/C#?**
- Type-safe: fouten worden al bij het compileren ontdekt, niet pas in productie
- Enorme community en ecosysteem (NuGet packages)
- Uitstekende tooling (Visual Studio, Rider)
- Naadloze integratie met SQL Server, Azure en Business Central
- Hoge performantie — .NET is een van de snelste web frameworks

---

## .NET Versies — Welke kiezen?

Microsoft brengt elk jaar een nieuwe .NET versie uit:
- **LTS (Long Term Support)**: 3 jaar ondersteuning — gebruik dit in productie
- **STS (Standard Term Support)**: 18 maanden — voor wie snel nieuwe features wil

| Versie | Type | Support tot | Aanbeveling |
|--------|------|-------------|-------------|
| .NET 6 | LTS | November 2024 | Niet meer gebruiken |
| .NET 8 | LTS | November 2026 | ✅ Stabiele keuze voor productie |
| .NET 9 | STS | Mei 2026 | Experimenteel / cutting edge |
| .NET 10 | LTS | November 2027 | ✅ Volgende stabiele keuze |

> **Vuistregel:** gebruik altijd de laatste LTS versie voor nieuwe projecten. Migreer bestaande LTS projecten pas wanneer de volgende LTS uitkomt.

---

## Projectstructuur — Clean Architecture

### Waarom Clean Architecture?

Stel je voor: je bouwt een applicatie en je database engine verandert van SQL Server naar PostgreSQL. Of je wilt unit tests schrijven zonder dat de echte database aanwezig hoeft te zijn. Clean Architecture maakt dit mogelijk door de code in lagen op te splitsen met duidelijke afhankelijkheidsregels.

**De gouden regel:** afhankelijkheden wijzen altijd naar het midden (naar Domain). Domain weet niets van de buitenwereld.

```
┌─────────────────────────────────────────────┐
│              API Layer                      │  ← Praat met de wereld
│  (Controllers, Middleware, Swagger)         │
└──────────────────┬──────────────────────────┘
                   │ gebruikt
┌──────────────────▼──────────────────────────┐
│          Application Layer                  │  ← Orkestrator
│  (Use cases, CQRS Commands/Queries, DTOs)   │
└──────────────────┬──────────────────────────┘
                   │ gebruikt
┌──────────────────▼──────────────────────────┐
│           Domain Layer                      │  ← Kern van het systeem
│  (Entities, Value Objects, Domain Events)   │
└─────────────────────────────────────────────┘
                   ▲
┌──────────────────┴──────────────────────────┐
│         Infrastructure Layer                │  ← Technische details
│  (EF Core, externe API's, e-mail, cache)    │
└─────────────────────────────────────────────┘
```

### Mappenstructuur

```
MySolution/
├── src/
│   ├── MyApp.Domain/
│   │   ├── Entities/
│   │   │   ├── Order.cs
│   │   │   ├── OrderLine.cs
│   │   │   └── Customer.cs
│   │   ├── ValueObjects/
│   │   │   ├── Money.cs
│   │   │   └── Address.cs
│   │   ├── Enums/
│   │   │   └── OrderStatus.cs
│   │   └── Exceptions/
│   │       └── DomainException.cs
│   │
│   ├── MyApp.Application/
│   │   ├── Orders/
│   │   │   ├── Commands/
│   │   │   │   ├── CreateOrderCommand.cs
│   │   │   │   └── CreateOrderHandler.cs
│   │   │   ├── Queries/
│   │   │   │   ├── GetOrderQuery.cs
│   │   │   │   └── GetOrderHandler.cs
│   │   │   └── DTOs/
│   │   │       └── OrderDto.cs
│   │   └── Interfaces/
│   │       ├── IOrderRepository.cs
│   │       └── IEmailService.cs
│   │
│   ├── MyApp.Infrastructure/
│   │   ├── Persistence/
│   │   │   ├── AppDbContext.cs
│   │   │   ├── Configurations/
│   │   │   │   └── OrderConfiguration.cs
│   │   │   └── Repositories/
│   │   │       └── OrderRepository.cs
│   │   ├── Services/
│   │   │   └── SmtpEmailService.cs
│   │   └── DependencyInjection.cs
│   │
│   └── MyApp.API/
│       ├── Controllers/
│       │   └── OrdersController.cs
│       ├── Middleware/
│       │   └── ExceptionMiddleware.cs
│       ├── Program.cs
│       └── appsettings.json
│
└── tests/
    ├── MyApp.UnitTests/
    │   └── Orders/
    │       ├── CreateOrderHandlerTests.cs
    │       └── OrderTests.cs
    └── MyApp.IntegrationTests/
        └── Orders/
            └── OrdersApiTests.cs
```

---

## Domain Entities

Een **entity** is een object met een unieke identiteit. Een Order is een entity: het heeft een ID, het heeft gedrag (bevestigen, annuleren) en het heeft regels (je kan een afgeleverde order niet meer annuleren).

```csharp
// Domain/Entities/Order.cs
public class Order
{
    // Privé constructor: Order kan alleen via factory methoden aangemaakt worden
    private Order() { }

    public int Id { get; private set; }
    public string OrderNumber { get; private set; } = default!;
    public int CustomerId { get; private set; }
    public OrderStatus Status { get; private set; }
    public DateTime OrderDate { get; private set; }
    public DateTime? DeliveryDate { get; private set; }

    private readonly List<OrderLine> _lines = new();
    public IReadOnlyList<OrderLine> Lines => _lines.AsReadOnly();

    public Money TotalAmount => new(
        _lines.Sum(l => l.UnitPrice.Amount * l.Quantity),
        "EUR"
    );

    // Factory methode: validatie bij aanmaken
    public static Order Create(string orderNumber, int customerId)
    {
        if (string.IsNullOrWhiteSpace(orderNumber))
            throw new DomainException("Ordernummer mag niet leeg zijn.");

        return new Order
        {
            OrderNumber = orderNumber,
            CustomerId = customerId,
            Status = OrderStatus.Draft,
            OrderDate = DateTime.UtcNow
        };
    }

    // Gedrag van de entity — business regels zitten hier
    public void AddLine(string productCode, int quantity, Money unitPrice)
    {
        if (Status != OrderStatus.Draft)
            throw new DomainException("Je kan alleen regels toevoegen aan een Draft order.");

        if (quantity <= 0)
            throw new DomainException("Hoeveelheid moet groter zijn dan 0.");

        _lines.Add(new OrderLine(productCode, quantity, unitPrice));
    }

    public void Confirm()
    {
        if (Status != OrderStatus.Draft)
            throw new DomainException($"Een order met status {Status} kan niet bevestigd worden.");

        if (!_lines.Any())
            throw new DomainException("Je kan geen lege order bevestigen.");

        Status = OrderStatus.Confirmed;
    }

    public void Cancel(string reason)
    {
        if (Status == OrderStatus.Delivered)
            throw new DomainException("Een afgeleverde order kan niet geannuleerd worden.");

        Status = OrderStatus.Cancelled;
    }
}

// Domain/Enums/OrderStatus.cs
public enum OrderStatus
{
    Draft,
    Confirmed,
    InProgress,
    Shipped,
    Delivered,
    Cancelled
}
```

---

## ASP.NET Core REST API

### Twee stijlen: Minimal API vs. Controllers

**Minimal API** (modern, .NET 6+): minder code, ideaal voor kleine API's of microservices.
**Controllers**: meer structuur, beter voor grote API's met veel endpoints.

### Program.cs — De bootstrap van je applicatie

```csharp
// Program.cs — Alles begint hier
var builder = WebApplication.CreateBuilder(args);

// ============================
// SERVICES REGISTREREN (DI)
// ============================
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "MyApp API",
        Version = "v1",
        Description = "API voor het beheren van orders"
    });
});

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Eigen services
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddTransient<IEmailService, SmtpEmailService>();

// CQRS via MediatR
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(CreateOrderCommand).Assembly));

// Authenticatie
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = builder.Configuration["Auth:Authority"];
        options.Audience = builder.Configuration["Auth:Audience"];
    });

// Health checks voor Kubernetes
builder.Services.AddHealthChecks()
    .AddSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")!);

// ============================
// HTTP PIPELINE OPBOUWEN
// ============================
var app = builder.Build();

// Volgorde is belangrijk!
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseMiddleware<ExceptionMiddleware>();  // Altijd vroeg in de pipeline
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health");

app.Run();
```

### Controller voorbeeld

```csharp
// API/Controllers/OrdersController.cs
[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class OrdersController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<OrdersController> _logger;

    public OrdersController(IMediator mediator, ILogger<OrdersController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>Haal een order op via ID</summary>
    [HttpGet("{id:int}", Name = "GetOrderById")]
    [ProducesResponseType(typeof(OrderDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
    {
        _logger.LogInformation("Order opvragen met ID {OrderId}", id);
        var result = await _mediator.Send(new GetOrderQuery(id), ct);
        return result is null ? NotFound() : Ok(result);
    }

    /// <summary>Haal alle orders op, optioneel gefilterd</summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<OrderDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(
            new GetOrdersQuery(status, page, pageSize), ct);
        return Ok(result);
    }

    /// <summary>Maak een nieuwe order aan</summary>
    [HttpPost]
    [ProducesResponseType(typeof(int), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create(
        [FromBody] CreateOrderCommand command,
        CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return CreatedAtRoute("GetOrderById", new { id }, new { id });
    }

    /// <summary>Bevestig een order</summary>
    [HttpPost("{id:int}/confirm")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Confirm(int id, CancellationToken ct)
    {
        await _mediator.Send(new ConfirmOrderCommand(id), ct);
        return NoContent();
    }

    /// <summary>Annuleer een order</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Cancel(int id, [FromBody] string reason, CancellationToken ct)
    {
        await _mediator.Send(new CancelOrderCommand(id, reason), ct);
        return NoContent();
    }
}
```

---

## Dependency Injection — Wat is dat?

**Dependency Injection (DI)** is een patroon waarbij een klasse zijn afhankelijkheden niet zelf aanmaakt, maar ze "geïnjecteerd" krijgt van buitenaf.

**Zonder DI (slecht):**
```csharp
public class OrderService
{
    private readonly OrderRepository _repo;

    public OrderService()
    {
        // OrderService maakt zelf zijn afhankelijkheden aan
        // Probleem: je kan dit niet testen zonder echte database!
        _repo = new OrderRepository(new AppDbContext(...));
    }
}
```

**Met DI (goed):**
```csharp
public class OrderService
{
    private readonly IOrderRepository _repo;

    // De afhankelijkheid wordt van buiten meegegeven
    // In tests geef je een nep-implementatie mee (mock)
    public OrderService(IOrderRepository repo)
    {
        _repo = repo;
    }
}
```

### De drie lifecycles

```csharp
// TRANSIENT — Nieuwe instantie bij elke injectie
// Gebruik voor: lichte, stateless services
builder.Services.AddTransient<IEmailService, SmtpEmailService>();

// SCOPED — Één instantie per HTTP request
// Gebruik voor: database contexten, repositories
// Alle klassen binnen één request delen dezelfde instantie
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<AppDbContext>();

// SINGLETON — Één instantie voor de hele applicatie
// Gebruik voor: caches, configuratie, zware objecten die herbruikbaar zijn
// LET OP: mag geen Scoped services injecteren!
builder.Services.AddSingleton<ICacheService, MemoryCacheService>();
```

---

## Entity Framework Core — ORM

**ORM (Object-Relational Mapper)** vertaalt tussen C# objecten en databasetabellen. Je schrijft C# code, EF Core vertaalt dat naar SQL.

```csharp
// Infrastructure/Persistence/AppDbContext.cs
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // Elke DbSet is een tabel
    public DbSet<Order> Orders { get; set; } = default!;
    public DbSet<OrderLine> OrderLines { get; set; } = default!;
    public DbSet<Customer> Customers { get; set; } = default!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Laad alle configuraties in de assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}

// Infrastructure/Persistence/Configurations/OrderConfiguration.cs
public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("Orders");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.OrderNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.Status)
            .HasConversion<string>()  // Sla enum op als string in DB
            .HasMaxLength(20);

        // Relatie: één Order heeft veel OrderLines
        builder.HasMany(e => e.Lines)
            .WithOne(l => l.Order)
            .HasForeignKey(l => l.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        // Audit kolommen automatisch invullen
        builder.Property<DateTime>("CreatedAt")
            .HasDefaultValueSql("SYSDATETIME()");
    }
}
```

### Repository patroon met EF Core

```csharp
// Infrastructure/Repositories/OrderRepository.cs
public class OrderRepository : IOrderRepository
{
    private readonly AppDbContext _context;

    public OrderRepository(AppDbContext context) => _context = context;

    public async Task<Order?> GetByIdAsync(int id, CancellationToken ct = default)
        => await _context.Orders
            .Include(o => o.Lines)       // Laad order lines mee
            .Include(o => o.Customer)    // Laad klant mee
            .FirstOrDefaultAsync(o => o.Id == id, ct);

    public async Task<IReadOnlyList<Order>> GetOpenOrdersAsync(CancellationToken ct = default)
        => await _context.Orders
            .Where(o => o.Status == OrderStatus.Confirmed || o.Status == OrderStatus.InProgress)
            .Where(o => !o.IsDeleted)
            .OrderByDescending(o => o.OrderDate)
            .AsNoTracking()  // Geen change tracking nodig bij lezen — sneller
            .ToListAsync(ct);

    public async Task<int> AddAsync(Order order, CancellationToken ct = default)
    {
        _context.Orders.Add(order);
        await _context.SaveChangesAsync(ct);
        return order.Id;
    }

    public async Task UpdateAsync(Order order, CancellationToken ct = default)
    {
        _context.Orders.Update(order);
        await _context.SaveChangesAsync(ct);
    }

    // Paginering — essentieel voor grote datasets
    public async Task<PagedResult<Order>> GetPagedAsync(
        int page, int pageSize, CancellationToken ct = default)
    {
        var query = _context.Orders
            .Where(o => !o.IsDeleted)
            .OrderByDescending(o => o.OrderDate);

        var total = await query.CountAsync(ct);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .AsNoTracking()
            .ToListAsync(ct);

        return new PagedResult<Order>(items, total, page, pageSize);
    }
}
```

---

## CQRS met MediatR

**CQRS = Command Query Responsibility Segregation**

Het idee is simpel: scheid lees-operaties (Queries) van schrijf-operaties (Commands).

- **Query**: leest data, verandert niets — mag gecached worden
- **Command**: verandert data, leest niets (of zo min mogelijk)

**Waarom?** Queries en commands hebben andere eigenschappen. Queries wil je snel en gecached; commands wil je gevalideerd, getransactioneerd en gelogd.

```csharp
// Application/Orders/Commands/CreateOrderCommand.cs
public record CreateOrderCommand(
    string OrderNumber,
    int CustomerId,
    DateTime RequestedDeliveryDate,
    List<CreateOrderLineDto> Lines
) : IRequest<int>;  // IRequest<int> = dit command returnt een int (het nieuwe ID)

// Application/Orders/Commands/CreateOrderHandler.cs
public class CreateOrderHandler : IRequestHandler<CreateOrderCommand, int>
{
    private readonly IOrderRepository _repo;
    private readonly ICustomerRepository _customerRepo;
    private readonly ILogger<CreateOrderHandler> _logger;

    public CreateOrderHandler(
        IOrderRepository repo,
        ICustomerRepository customerRepo,
        ILogger<CreateOrderHandler> logger)
    {
        _repo = repo;
        _customerRepo = customerRepo;
        _logger = logger;
    }

    public async Task<int> Handle(CreateOrderCommand command, CancellationToken ct)
    {
        // 1. Valideer de business rules
        var customer = await _customerRepo.GetByIdAsync(command.CustomerId, ct)
            ?? throw new NotFoundException($"Klant {command.CustomerId} niet gevonden.");

        if (!customer.IsActive)
            throw new DomainException("Je kan geen order aanmaken voor een inactieve klant.");

        // 2. Maak de domain entity aan
        var order = Order.Create(command.OrderNumber, command.CustomerId);

        foreach (var line in command.Lines)
        {
            order.AddLine(line.ProductCode, line.Quantity, new Money(line.UnitPrice, "EUR"));
        }

        // 3. Persisteer
        var id = await _repo.AddAsync(order, ct);

        _logger.LogInformation(
            "Order {OrderNumber} aangemaakt voor klant {CustomerId} met ID {OrderId}",
            command.OrderNumber, command.CustomerId, id);

        return id;
    }
}

// Application/Orders/Queries/GetOrderQuery.cs
public record GetOrderQuery(int Id) : IRequest<OrderDto?>;

public class GetOrderHandler : IRequestHandler<GetOrderQuery, OrderDto?>
{
    private readonly IOrderRepository _repo;

    public GetOrderHandler(IOrderRepository repo) => _repo = repo;

    public async Task<OrderDto?> Handle(GetOrderQuery query, CancellationToken ct)
    {
        var order = await _repo.GetByIdAsync(query.Id, ct);
        if (order is null) return null;

        return new OrderDto(
            order.Id,
            order.OrderNumber,
            order.Status.ToString(),
            order.OrderDate,
            order.Customer.Name,
            order.Lines.Select(l => new OrderLineDto(
                l.ProductCode, l.Description, l.Quantity, l.UnitPrice.Amount
            )).ToList()
        );
    }
}
```

---

## Validatie met FluentValidation

```csharp
// Application/Orders/Commands/CreateOrderCommandValidator.cs
public class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
{
    private readonly IOrderRepository _repo;

    public CreateOrderCommandValidator(IOrderRepository repo)
    {
        _repo = repo;

        RuleFor(x => x.OrderNumber)
            .NotEmpty().WithMessage("Ordernummer is verplicht.")
            .MaximumLength(50).WithMessage("Ordernummer mag max. 50 tekens zijn.")
            .MustAsync(BeUniqueOrderNumber)
                .WithMessage("Dit ordernummer bestaat al.");

        RuleFor(x => x.CustomerId)
            .GreaterThan(0).WithMessage("Klant is verplicht.");

        RuleFor(x => x.RequestedDeliveryDate)
            .GreaterThan(DateTime.Today).WithMessage("Leveringsdatum moet in de toekomst liggen.");

        RuleFor(x => x.Lines)
            .NotEmpty().WithMessage("Een order moet minstens één regel bevatten.");

        RuleForEach(x => x.Lines).SetValidator(new CreateOrderLineDtoValidator());
    }

    private async Task<bool> BeUniqueOrderNumber(
        string orderNumber, CancellationToken ct)
        => !await _repo.ExistsWithOrderNumberAsync(orderNumber, ct);
}

public class CreateOrderLineDtoValidator : AbstractValidator<CreateOrderLineDto>
{
    public CreateOrderLineDtoValidator()
    {
        RuleFor(x => x.ProductCode).NotEmpty();
        RuleFor(x => x.Quantity).GreaterThan(0);
        RuleFor(x => x.UnitPrice).GreaterThanOrEqualTo(0);
    }
}
```

---

## Middleware — De HTTP Pipeline

Middleware verwerkt HTTP requests en responses in een keten. Elk stuk middleware kan de request aanpassen, doorgeven aan het volgende stuk, of een response retourneren.

```csharp
// API/Middleware/ExceptionMiddleware.cs
public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);  // Roep het volgende stuk middleware aan
        }
        catch (NotFoundException ex)
        {
            // Bekende uitzonderingen: stuur duidelijke foutmelding
            context.Response.StatusCode = StatusCodes.Status404NotFound;
            await context.Response.WriteAsJsonAsync(new ProblemDetails
            {
                Status = 404,
                Title = "Niet gevonden",
                Detail = ex.Message
            });
        }
        catch (DomainException ex)
        {
            // Business rule overtredingen: 400 Bad Request
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsJsonAsync(new ProblemDetails
            {
                Status = 400,
                Title = "Ongeldige aanvraag",
                Detail = ex.Message
            });
        }
        catch (Exception ex)
        {
            // Onverwachte fouten: 500 + log de details (maar stuur ze NIET naar de client)
            _logger.LogError(ex,
                "Onverwachte fout bij {Method} {Path}",
                context.Request.Method,
                context.Request.Path);

            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await context.Response.WriteAsJsonAsync(new ProblemDetails
            {
                Status = 500,
                Title = "Interne serverfout",
                Detail = "Er is iets misgegaan. Probeer later opnieuw."
            });
        }
    }
}
```

---

## Logging met Serilog

Serilog produceert **structured logging**: niet gewoon tekst, maar data met velden die je kan filteren en doorzoeken.

```csharp
// Program.cs
builder.Host.UseSerilog((context, config) =>
{
    config
        .ReadFrom.Configuration(context.Configuration)
        .Enrich.FromLogContext()
        .Enrich.WithMachineName()
        .Enrich.WithEnvironmentName()
        .WriteTo.Console(outputTemplate:
            "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}")
        .WriteTo.File(
            path: "logs/myapp-.log",
            rollingInterval: RollingInterval.Day,
            retainedFileCountLimit: 7)
        .WriteTo.ApplicationInsights(
            context.Configuration["ApplicationInsights:ConnectionString"],
            TelemetryConverter.Traces);
});

// In een service
public class OrderService
{
    private readonly ILogger<OrderService> _logger;

    public async Task ProcessOrderAsync(int orderId)
    {
        // Structured: {OrderId} is een property, niet gewoon string
        _logger.LogInformation("Start verwerking order {OrderId}", orderId);

        using var scope = _logger.BeginScope(new Dictionary<string, object>
        {
            ["OrderId"] = orderId,
            ["CorrelationId"] = Guid.NewGuid()
        });

        // Alle logs binnen deze scope hebben automatisch OrderId en CorrelationId
        _logger.LogDebug("Order geladen uit database");
        // ... verwerking
        _logger.LogInformation("Order {OrderId} succesvol verwerkt", orderId);
    }
}
```

---

## Unit Testing

```csharp
// Tests/MyApp.UnitTests/Orders/CreateOrderHandlerTests.cs
public class CreateOrderHandlerTests
{
    private readonly Mock<IOrderRepository> _orderRepoMock;
    private readonly Mock<ICustomerRepository> _customerRepoMock;
    private readonly CreateOrderHandler _handler;

    public CreateOrderHandlerTests()
    {
        _orderRepoMock = new Mock<IOrderRepository>();
        _customerRepoMock = new Mock<ICustomerRepository>();
        _handler = new CreateOrderHandler(
            _orderRepoMock.Object,
            _customerRepoMock.Object,
            NullLogger<CreateOrderHandler>.Instance);
    }

    [Fact]
    public async Task Handle_ValidCommand_ReturnsNewOrderId()
    {
        // Arrange — stel de nep-implementaties in
        var command = new CreateOrderCommand(
            "ORD-001", CustomerId: 1, DateTime.Today.AddDays(7),
            Lines: [new CreateOrderLineDto("PROD-001", 5, 10.00m)]);

        _customerRepoMock
            .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Customer { Id = 1, Name = "Test Klant", IsActive = true });

        _orderRepoMock
            .Setup(r => r.AddAsync(It.IsAny<Order>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(42);

        // Act — voer de handler uit
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert — controleer het resultaat
        result.Should().Be(42);
        _orderRepoMock.Verify(r => r.AddAsync(It.IsAny<Order>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_InactiveCustomer_ThrowsDomainException()
    {
        // Arrange
        var command = new CreateOrderCommand("ORD-001", 1, DateTime.Today.AddDays(7), []);

        _customerRepoMock
            .Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Customer { Id = 1, IsActive = false });

        // Act & Assert
        await _handler
            .Invoking(h => h.Handle(command, CancellationToken.None))
            .Should().ThrowAsync<DomainException>()
            .WithMessage("*inactieve klant*");
    }
}
```

---

## Veelgemaakte fouten & hoe ze te vermijden

| Fout | Probleem | Oplossing |
|------|---------|-----------|
| `.Result` of `.Wait()` aanroepen | Blokkeert de thread, kan deadlock veroorzaken | Gebruik altijd `await` |
| Logica in controllers | Controllers worden onTestbaar | Verplaats naar Application laag (handlers) |
| `SELECT *` via EF Core | Laadt onnodige data | Gebruik `Select()` projecties of `AsNoTracking()` |
| Secrets in appsettings.json | Veiligheidsrisico als repo publiek is | Gebruik Azure Key Vault of environment variables |
| Geen paginering | Bij grote datasets crasht de app | Altijd `Skip/Take` of cursor-based paginering |
| Synchrone I/O | Blokkeert threads | Gebruik altijd async methoden voor I/O |

---

## Nuttige NuGet Packages

| Package | Wat doet het? |
|---------|---------------|
| `MediatR` | CQRS en in-process messaging |
| `FluentValidation` | Expressieve validatieregels |
| `Serilog` + sinks | Structured logging naar console, file, Azure |
| `AutoMapper` | Automatisch mappen tussen classes |
| `Polly` | Retry-policies en circuit breakers voor externe calls |
| `Swashbuckle.AspNetCore` | Swagger UI en OpenAPI spec generatie |
| `xUnit` | Test framework |
| `Moq` | Mocking framework voor unit tests |
| `FluentAssertions` | Leesbare assertions in tests |
| `Testcontainers` | Start echte Docker containers in integration tests |

---

*[← Terug naar overzicht](../../README.md)*
