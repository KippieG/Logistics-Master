# Frontend — Angular

## Wat is Angular en waarom?

**Angular** is een volledig framework van Google voor het bouwen van webapplicaties. Het is gebouwd met **TypeScript** — een getypeerde superset van JavaScript — en is "opinionated": het schrijft voor hoe je dingen organiseert.

**Waarom Angular voor enterprise?**
- **Structuur**: Angular dwingt een vaste structuur af — in een groot team weet iedereen waar iets staat
- **TypeScript**: type-fouten worden vroeg gevonden, code is zelfgedocumenteerd
- **Volledig pakket**: routing, forms, HTTP, animaties, testing — alles ingebouwd
- **Long-term support**: Google garandeert backwards-compatibiliteit en LTS
- **Grote community**: enorm ecosysteem, veel documentatie

**Angular vs. React vs. Vue:**
- React: meer vrijheid, grotere community, maar je moet zelf veel keuzes maken
- Vue: eenvoudiger te leren, kleinere community
- Angular: meeste structuur, ideaal voor grote teams en complexe applicaties

---

## Het concept begrijpen

### Hoe werkt een Angular applicatie?

```
Browser laadt index.html
    → index.html laadt de Angular bundle (JavaScript bestanden)
    → Angular bootstrap: laadt AppComponent
    → Angular router: bekijkt de URL en laadt het juiste component
    → Component laadt zijn template (HTML) + logica (TypeScript)
    → Service haalt data op via HTTP (backend API)
    → Component toont de data in de template
    → Gebruiker klikt iets → component reageert → cycle herhaalt
```

### De bouwstenen van Angular

| Concept | Wat is het? | Voorbeeld |
|---------|-------------|----------|
| **Component** | Een stuk UI met zijn eigen logica | `OrderListComponent` |
| **Template** | De HTML van een component | `<div *ngFor="let order of orders">` |
| **Service** | Herbruikbare logica / data ophalen | `OrderService` |
| **Module/Route** | Groepeert gerelateerde onderdelen | `OrdersModule` |
| **Directive** | Voegt gedrag toe aan HTML elementen | `*ngIf`, `*ngFor` |
| **Pipe** | Transformeert data in de template | `{{ date \| date:'dd/MM/yyyy' }}` |
| **Signal** | Reactieve state (Angular 17+) | `const count = signal(0)` |

---

## Projectstructuur — Feature-based organisatie

```
src/
├── app/
│   ├── core/                          ← Eenmalig geladen singletons
│   │   ├── auth/
│   │   │   ├── auth.service.ts        ← Login, token beheer
│   │   │   └── auth.guard.ts          ← Bescherm routes
│   │   ├── interceptors/
│   │   │   ├── auth.interceptor.ts    ← Voeg JWT token toe aan requests
│   │   │   └── error.interceptor.ts   ← Globale foutafhandeling
│   │   └── services/
│   │       └── api.service.ts         ← Basis HTTP service
│   │
│   ├── shared/                        ← Herbruikbaar in meerdere features
│   │   ├── components/
│   │   │   ├── data-table/            ← Herbruikbare tabel component
│   │   │   ├── confirm-dialog/        ← Bevestigingsdialoog
│   │   │   └── loading-spinner/       ← Laadanimatie
│   │   ├── pipes/
│   │   │   ├── currency-format.pipe.ts
│   │   │   └── status-label.pipe.ts
│   │   └── directives/
│   │       └── debounce-click.directive.ts
│   │
│   ├── features/                      ← Per feature/domein
│   │   ├── orders/
│   │   │   ├── components/
│   │   │   │   ├── order-list/
│   │   │   │   │   ├── order-list.component.ts
│   │   │   │   │   └── order-list.component.html
│   │   │   │   ├── order-detail/
│   │   │   │   └── order-form/
│   │   │   ├── services/
│   │   │   │   └── order.service.ts
│   │   │   ├── models/
│   │   │   │   └── order.model.ts
│   │   │   └── orders.routes.ts
│   │   │
│   │   ├── customers/
│   │   └── warehouse/
│   │
│   ├── app.config.ts                  ← Globale configuratie
│   ├── app.routes.ts                  ← Hoofdroutes
│   └── app.component.ts              ← Root component
│
├── environments/
│   ├── environment.ts                 ← Dev configuratie
│   └── environment.prod.ts           ← Productie configuratie
└── styles.scss                       ← Globale stijlen
```

---

## Components

### Wat is een Component?

Een component is de bouwsteen van een Angular app. Het bestaat uit:
1. **TypeScript klasse**: bevat de logica
2. **HTML template**: bepaalt wat er getoond wordt
3. **CSS/SCSS**: stijlen (alleen voor dit component)

```typescript
// orders/components/order-list/order-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { signal, computed } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { Order, OrderStatus } from '../../models/order.model';

@Component({
  selector: 'app-order-list',     // HTML tag: <app-order-list />
  standalone: true,                // Geen module nodig (Angular 17+)
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Filter balk -->
    <div class="toolbar">
      <input
        type="search"
        placeholder="Zoek op ordernummer..."
        (input)="onSearch($event)"
        class="search-input"
      />
      <select (change)="onStatusFilter($event)">
        <option value="">Alle statussen</option>
        <option value="Open">Open</option>
        <option value="Confirmed">Bevestigd</option>
        <option value="Shipped">Verzonden</option>
      </select>
    </div>

    <!-- Laadstatus -->
    @if (loading()) {
      <div class="loading">Laden...</div>
    }

    <!-- Foutmelding -->
    @if (error()) {
      <div class="error-banner">{{ error() }}</div>
    }

    <!-- Orders tabel -->
    @if (!loading() && !error()) {
      <table class="data-table">
        <thead>
          <tr>
            <th>Ordernummer</th>
            <th>Klant</th>
            <th>Datum</th>
            <th>Status</th>
            <th>Bedrag</th>
            <th>Acties</th>
          </tr>
        </thead>
        <tbody>
          <!-- @for is de moderne Angular syntax (vervangt *ngFor) -->
          @for (order of filteredOrders(); track order.id) {
            <tr [class.highlighted]="order.isUrgent">
              <td>{{ order.orderNumber }}</td>
              <td>{{ order.customerName }}</td>
              <td>{{ order.orderDate | date:'dd/MM/yyyy' }}</td>
              <td>
                <span [class]="'badge badge--' + order.status.toLowerCase()">
                  {{ order.status | statusLabel }}
                </span>
              </td>
              <td>{{ order.totalAmount | currency:'EUR':'symbol':'1.2-2' }}</td>
              <td>
                <a [routerLink]="['/orders', order.id]">Detail</a>
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="6" class="empty-state">
                Geen orders gevonden.
              </td>
            </tr>
          }
        </tbody>
      </table>

      <!-- Samenvatting -->
      <div class="summary">
        <strong>{{ filteredOrders().length }}</strong> orders
        · Totaal: <strong>{{ totalAmount() | currency:'EUR' }}</strong>
      </div>
    }
  `
})
export class OrderListComponent implements OnInit {
  // inject() is de moderne manier van dependency injection in Angular 17+
  private orderService = inject(OrderService);

  // Signals: reactieve state die de template automatisch bijwerkt
  orders = signal<Order[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  searchTerm = signal('');
  statusFilter = signal('');

  // Computed signals: automatisch herberekend wanneer afhankelijke signals veranderen
  filteredOrders = computed(() => {
    let result = this.orders();

    const term = this.searchTerm().toLowerCase();
    if (term) {
      result = result.filter(o =>
        o.orderNumber.toLowerCase().includes(term) ||
        o.customerName.toLowerCase().includes(term)
      );
    }

    const status = this.statusFilter();
    if (status) {
      result = result.filter(o => o.status === status);
    }

    return result;
  });

  totalAmount = computed(() =>
    this.filteredOrders().reduce((sum, o) => sum + o.totalAmount, 0)
  );

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading.set(true);
    this.error.set(null);

    this.orderService.getAll().subscribe({
      next: orders => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: err => {
        this.error.set('Kan orders niet laden. Probeer later opnieuw.');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  onStatusFilter(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.statusFilter.set(value);
  }
}
```

---

## Services — Data en Logica

Services zijn klassen die logica en data bevatten die door meerdere components gedeeld kunnen worden. Het meest gebruik: data ophalen van de backend API.

```typescript
// orders/services/order.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Order, CreateOrderCommand, PagedResult } from '../models/order.model';

@Injectable({
  providedIn: 'root'  // Één instantie voor de hele app (singleton)
})
export class OrderService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/orders`;

  // Haal alle orders op
  getAll(): Observable<Order[]> {
    return this.http.get<Order[]>(this.baseUrl).pipe(
      tap(orders => console.log(`${orders.length} orders geladen`)),
      catchError(this.handleError)
    );
  }

  // Haal orders op met paginering en filters
  getPaged(page: number, pageSize: number, status?: string): Observable<PagedResult<Order>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<PagedResult<Order>>(this.baseUrl, { params });
  }

  // Haal één order op via ID
  getById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Maak nieuwe order aan
  create(command: CreateOrderCommand): Observable<number> {
    return this.http.post<{ id: number }>(this.baseUrl, command).pipe(
      map(response => response.id),
      catchError(this.handleError)
    );
  }

  // Bevestig order
  confirm(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/confirm`, {}).pipe(
      catchError(this.handleError)
    );
  }

  // Annuleer order
  cancel(id: number, reason: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, {
      body: { reason }
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Centrale foutafhandeling
  private handleError(error: any): Observable<never> {
    let message = 'Er is een onbekende fout opgetreden.';

    if (error.status === 404) {
      message = 'Order niet gevonden.';
    } else if (error.status === 400) {
      message = error.error?.detail ?? 'Ongeldige aanvraag.';
    } else if (error.status === 401) {
      message = 'Je bent niet ingelogd.';
    } else if (error.status === 403) {
      message = 'Je hebt geen toegang tot deze actie.';
    } else if (error.status === 0) {
      message = 'Kan de server niet bereiken. Controleer je verbinding.';
    }

    return throwError(() => new Error(message));
  }
}
```

---

## RxJS — Reactief programmeren

**RxJS** is een bibliotheek voor het werken met asynchrone data streams (Observables). Wanneer je data ophaalt van een API, of reageert op gebruikersacties, gebruik je RxJS.

**Een Observable** is als een waterstroom: data stroomt erdoorheen, jij kan erop reageren.

```typescript
// De meest gebruikte RxJS operators uitgelegd

import { combineLatest, forkJoin, EMPTY, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap,
         map, filter, catchError, takeUntilDestroyed,
         retry, timeout } from 'rxjs/operators';

// ────────────────────────────────────────────────
// ZOEKBALK MET DEBOUNCE
// Wacht 300ms na het typen voor de API aan te roepen
// ────────────────────────────────────────────────
this.searchControl.valueChanges.pipe(
  debounceTime(300),          // Wacht 300ms
  distinctUntilChanged(),     // Alleen als waarde echt veranderd is
  filter(term => term.length >= 2),  // Minimum 2 tekens
  switchMap(term =>
    // switchMap: als een nieuwe term binnenkomt, annuleer vorige API call
    this.orderService.search(term).pipe(
      catchError(() => EMPTY)  // Bij fout: toon gewoon niets
    )
  ),
  takeUntilDestroyed(this.destroyRef)  // Stop automatisch bij destroy component
).subscribe(results => this.searchResults.set(results));

// ────────────────────────────────────────────────
// MEERDERE API CALLS TEGELIJK
// ────────────────────────────────────────────────

// forkJoin: wacht tot ALLE calls klaar zijn
forkJoin({
  orders: this.orderService.getAll(),
  customers: this.customerService.getAll(),
  products: this.productService.getAll()
}).subscribe(({ orders, customers, products }) => {
  this.orders.set(orders);
  this.customers.set(customers);
  this.products.set(products);
});

// combineLatest: reageert elke keer als één van de streams emit
combineLatest([
  this.selectedDate$,
  this.selectedCustomer$
]).pipe(
  switchMap(([date, customerId]) =>
    this.orderService.getByDateAndCustomer(date, customerId)
  )
).subscribe(orders => this.orders.set(orders));

// ────────────────────────────────────────────────
// RETRY EN TIMEOUT
// ────────────────────────────────────────────────
this.orderService.getById(id).pipe(
  timeout(5000),       // Gooi fout als >5 seconden wacht
  retry(2),            // Probeer max 2 keer opnieuw bij fout
  catchError(err => {
    this.error.set('Kan order niet laden na 3 pogingen.');
    return EMPTY;
  })
).subscribe(order => this.order.set(order));
```

---

## Routing — Navigatie

Routing bepaalt welk component getoond wordt op basis van de URL.

```typescript
// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { adminGuard } from './core/auth/admin.guard';

export const routes: Routes = [
  // Redirect: lege URL → dashboard
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  // Publieke routes (geen login nodig)
  { path: 'login', loadComponent: () =>
      import('./features/auth/login/login.component')
        .then(m => m.LoginComponent)
  },

  // Beschermde routes: authGuard controleert of gebruiker ingelogd is
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component')
        .then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },

  // Feature met lazy loading: code wordt pas geladen als nodig
  {
    path: 'orders',
    loadChildren: () =>
      import('./features/orders/orders.routes')
        .then(m => m.ordersRoutes),
    canActivate: [authGuard]
  },

  // Admin sectie: twee guards — moet ingelogd EN admin zijn
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.routes')
        .then(m => m.adminRoutes),
    canActivate: [authGuard, adminGuard]
  },

  // 404 pagina
  { path: '**', redirectTo: '/dashboard' }
];

// features/orders/orders.routes.ts
export const ordersRoutes: Routes = [
  { path: '', component: OrderListComponent },
  { path: 'new', component: OrderFormComponent },
  { path: ':id', component: OrderDetailComponent },
  { path: ':id/edit', component: OrderFormComponent }
];
```

### Auth Guard

```typescript
// core/auth/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;  // Toegang verlenen
  }

  // Niet ingelogd: doorsturen naar login met returnUrl
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};
```

---

## HTTP Interceptors

Een interceptor onderschept ALLE HTTP requests/responses. Gebruik dit voor:
- JWT token toevoegen aan elke request
- Globale foutafhandeling
- Loading indicator
- Logging

```typescript
// core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Voeg JWT token toe aan request (als beschikbaar)
  const token = auth.getToken();
  const authReq = token
    ? req.clone({
        headers: req.headers
          .set('Authorization', `Bearer ${token}`)
          .set('X-Request-Id', crypto.randomUUID())  // Unieke ID voor tracing
      })
    : req;

  // Stuur request door en vang fouten op
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token verlopen: uitloggen en naar login sturen
        auth.logout();
        router.navigate(['/login']);
      }

      if (error.status === 403) {
        // Geen rechten: doorsturen naar forbidden pagina
        router.navigate(['/forbidden']);
      }

      return throwError(() => error);
    })
  );
};

// Registreren in app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
```

---

## Reactive Forms — Formulieren

```typescript
// orders/components/order-form/order-form.component.ts
@Component({ /* ... */ })
export class OrderFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private orderService = inject(OrderService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditMode = false;
  submitting = signal(false);

  // FormGroup: groepeert alle formuliervelden
  form = this.fb.group({
    orderNumber: ['', [
      Validators.required,
      Validators.maxLength(50),
      Validators.pattern(/^ORD-\d{4}-\d{3,}$/)  // bijv. ORD-2026-001
    ]],
    customerId: [null as number | null, Validators.required],
    requestedDeliveryDate: ['', Validators.required],
    notes: ['', Validators.maxLength(500)],
    lines: this.fb.array([])  // Dynamische array voor orderregels
  });

  // Gemakkelijk toegang tot de lines FormArray
  get lines(): FormArray {
    return this.form.get('lines') as FormArray;
  }

  // Gemakkelijk toegang tot errors (voor template)
  get orderNumberErrors() {
    const ctrl = this.form.get('orderNumber');
    if (!ctrl?.touched) return null;
    if (ctrl.hasError('required')) return 'Ordernummer is verplicht.';
    if (ctrl.hasError('maxlength')) return 'Max. 50 tekens.';
    if (ctrl.hasError('pattern')) return 'Formaat: ORD-JJJJ-NNN (bijv. ORD-2026-001)';
    return null;
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.loadOrder(+id);
    } else {
      this.addLine();  // Nieuwe order: start met één lege regel
    }
  }

  loadOrder(id: number) {
    this.orderService.getById(id).subscribe(order => {
      this.form.patchValue({
        orderNumber: order.orderNumber,
        customerId: order.customerId,
        notes: order.notes
      });
      order.lines.forEach(line => this.addLine(line));
    });
  }

  addLine(line?: OrderLine) {
    this.lines.push(this.fb.group({
      productCode: [line?.productCode ?? '', Validators.required],
      description: [line?.description ?? ''],
      quantity: [line?.quantity ?? 1, [Validators.required, Validators.min(1)]],
      unitPrice: [line?.unitPrice ?? 0, [Validators.required, Validators.min(0)]]
    }));
  }

  removeLine(index: number) {
    this.lines.removeAt(index);
  }

  submit() {
    if (this.form.invalid) {
      // Markeer alle velden als aangeraakt zodat validatiefouten zichtbaar worden
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const command = this.form.value as CreateOrderCommand;

    const action$ = this.isEditMode
      ? this.orderService.update(+this.route.snapshot.params['id'], command)
      : this.orderService.create(command);

    action$.subscribe({
      next: (id) => {
        this.router.navigate(['/orders', this.isEditMode ? this.route.snapshot.params['id'] : id]);
      },
      error: err => {
        this.submitting.set(false);
        alert(err.message);
      }
    });
  }
}
```

---

## State Management met Signals

Voor eenvoudige tot middelgrote state kan je zonder NgRx werken, enkel met Signals:

```typescript
// orders/services/order.store.ts
@Injectable({ providedIn: 'root' })
export class OrderStore {
  private orderService = inject(OrderService);

  // Private schrijfbare signals
  private _orders = signal<Order[]>([]);
  private _selectedOrder = signal<Order | null>(null);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  // Public read-only signals (buiten de store kan niemand schrijven)
  readonly orders = this._orders.asReadonly();
  readonly selectedOrder = this._selectedOrder.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // Computed values
  readonly openOrders = computed(() =>
    this._orders().filter(o => o.status === 'Open')
  );

  readonly orderCount = computed(() => this._orders().length);

  readonly totalValue = computed(() =>
    this._orders().reduce((sum, o) => sum + o.totalAmount, 0)
  );

  // Actions
  loadAll() {
    this._loading.set(true);
    this._error.set(null);

    this.orderService.getAll().subscribe({
      next: orders => {
        this._orders.set(orders);
        this._loading.set(false);
      },
      error: err => {
        this._error.set(err.message);
        this._loading.set(false);
      }
    });
  }

  select(id: number) {
    this.orderService.getById(id).subscribe(order => {
      this._selectedOrder.set(order);
    });
  }

  addOrder(order: Order) {
    // Voeg toe aan de bestaande lijst zonder opnieuw te laden
    this._orders.update(orders => [...orders, order]);
  }

  updateStatus(id: number, status: string) {
    this._orders.update(orders =>
      orders.map(o => o.id === id ? { ...o, status } : o)
    );
  }

  removeOrder(id: number) {
    this._orders.update(orders => orders.filter(o => o.id !== id));
  }
}
```

---

## Custom Pipes

Pipes transformeren data in templates zonder de component te vervuilen:

```typescript
// shared/pipes/status-label.pipe.ts
@Pipe({ name: 'statusLabel', standalone: true })
export class StatusLabelPipe implements PipeTransform {
  transform(status: string): string {
    const labels: Record<string, string> = {
      'Draft': 'Concept',
      'Confirmed': 'Bevestigd',
      'InProgress': 'In verwerking',
      'Shipped': 'Verzonden',
      'Delivered': 'Afgeleverd',
      'Cancelled': 'Geannuleerd'
    };
    return labels[status] ?? status;
  }
}

// Gebruik in template:
// {{ order.status | statusLabel }}
// → "Confirmed" wordt "Bevestigd"
```

---

## Environment configuratie

```typescript
// environments/environment.ts (development)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api/v1',
  appInsightsKey: '',
  features: {
    darkMode: true,
    exportToExcel: true
  }
};

// environments/environment.prod.ts (productie)
export const environment = {
  production: true,
  apiUrl: 'https://api.myapp.be/api/v1',
  appInsightsKey: 'abc-123-...',
  features: {
    darkMode: false,
    exportToExcel: true
  }
};
```

---

## Best Practices & Veelgemaakte Fouten

| Fout | Probleem | Oplossing |
|------|---------|-----------|
| Logica in templates | Moeilijk te testen, traag | Verplaats naar component klasse of computed signal |
| Subscribe in subscribe | Memory leaks, moeilijk leesbaar | Gebruik `switchMap` of `combineLatest` |
| Geen `takeUntilDestroyed` | Memory leak na navigate | Altijd cleanup bij subscriptions |
| `any` type gebruiken | Type-veiligheid kwijt | Definieer altijd interfaces/types |
| Hardgecodeerde API URL | Werkt niet in productie | Gebruik `environment.apiUrl` |
| `ngOnDestroy` handmatig schrijven | Vergeten cleanup | Gebruik `takeUntilDestroyed(destroyRef)` |

---

*[← Terug naar overzicht](../../README.md)*
