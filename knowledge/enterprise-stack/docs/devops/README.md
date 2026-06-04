# DevOps — Docker / Kubernetes

## Wat is DevOps?

**DevOps** is de combinatie van Development (ontwikkeling) en Operations (beheer). Het doel: code sneller, veiliger en betrouwbaarder naar productie brengen, door de kloof tussen developers en systeembeheerders te overbruggen.

**Docker** en **Kubernetes** zijn de twee pijlers van moderne DevOps:
- **Docker**: verpakt een applicatie in een container — een geïsoleerde, reproduceerbare omgeving
- **Kubernetes**: beheert en orchestreert die containers op schaal

---

## Docker — Waarom containers?

### Het probleem dat Docker oplost

```
Zonder Docker:
  Developer: "Bij mij werkt het!"
  Ops: "Op de server werkt het niet."

  Oorzaak:
  - Andere .NET versie op server vs. laptop
  - Ontbrekende libraries of verkeerde versies
  - Andere omgevingsvariabelen
  - Andere OS-configuratie

Met Docker:
  Developer bouwt een container die alles bevat wat nodig is.
  Die container draait IDENTIEK op elke machine.
  "Bij mij werkt het" = "Overal werkt het"
```

### Container vs. Virtual Machine

```
Virtual Machine:                   Container:
┌─────────────────────┐           ┌─────────────────────┐
│  App A              │           │  App A              │
│  Libraries A        │           │  Libraries A        │
│  Guest OS (Ubuntu)  │           └─────────┬───────────┘
├─────────────────────┤                     │
│  App B              │           ┌─────────▼───────────┐
│  Libraries B        │           │  App B              │
│  Guest OS (Windows) │           │  Libraries B        │
├─────────────────────┤           └─────────┬───────────┘
│  Hypervisor         │                     │
│  Host OS            │           ┌─────────▼───────────┐
│  Hardware           │           │  Container Runtime  │
└─────────────────────┘           │  Host OS            │
                                  │  Hardware           │
Groot (GBs), traag om te starten  └─────────────────────┘
                                  Klein (MBs), start in seconden
```

---

## Dockerfile schrijven

### Dockerfile voor ASP.NET Core

Een **Dockerfile** beschrijft hoe een image gebouwd wordt — stap voor stap.

```dockerfile
# ─── STAP 1: BUILD STAGE ────────────────────────────────────────────────
# Gebruik de .NET SDK image — bevat alles om code te compileren
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Kopieer eerst alleen de project bestanden voor caching
# Als je code verandert maar de .csproj niet, wordt restore gecached
COPY ["src/MyApp.API/MyApp.API.csproj", "src/MyApp.API/"]
COPY ["src/MyApp.Application/MyApp.Application.csproj", "src/MyApp.Application/"]
COPY ["src/MyApp.Infrastructure/MyApp.Infrastructure.csproj", "src/MyApp.Infrastructure/"]
COPY ["src/MyApp.Domain/MyApp.Domain.csproj", "src/MyApp.Domain/"]

# Herstel NuGet packages (gecached als .csproj niet veranderd)
RUN dotnet restore "src/MyApp.API/MyApp.API.csproj"

# Kopieer alle broncode
COPY src/ src/

# Bouw en publiceer de applicatie
RUN dotnet publish "src/MyApp.API/MyApp.API.csproj" \
    -c Release \
    -o /app/publish \
    --no-restore

# ─── STAP 2: RUNTIME STAGE ──────────────────────────────────────────────
# Gebruik de kleinere runtime image — geen SDK, enkel wat nodig is om te draaien
# SDK image: ~700MB, Runtime image: ~200MB
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Stel poort in (documentatief — EXPOSE opent de poort niet echt)
EXPOSE 8080

# Beveiligingsmaatregel: draai als non-root gebruiker
# Root draaiende containers zijn een veiligheidsrisico
RUN addgroup --system appgroup && \
    adduser --system --ingroup appgroup --no-create-home appuser

# Kopieer de gecompileerde applicatie van de build stage
COPY --from=build /app/publish .

# Verander naar de non-root gebruiker
USER appuser

# Start commando
ENTRYPOINT ["dotnet", "MyApp.API.dll"]
```

### Dockerfile voor Angular

```dockerfile
# ─── STAP 1: BUILD ──────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Kopieer package bestanden apart voor betere caching
COPY package*.json ./
RUN npm ci --silent  # ci is sneller en strenger dan npm install

# Kopieer broncode en bouw
COPY . .
RUN npm run build -- --configuration production

# ─── STAP 2: SERVE ──────────────────────────────────────────────────────
FROM nginx:alpine AS serve
WORKDIR /usr/share/nginx/html

# Verwijder standaard nginx pagina
RUN rm -rf ./*

# Kopieer gebouwde Angular app
COPY --from=build /app/dist/my-app/browser .

# Kopieer nginx configuratie
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf voor Angular SPA

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # Compressie inschakelen — kleinere responses, snellere laadtijd
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/javascript
        application/javascript
        application/json
        image/svg+xml;

    # Cache headers voor statische bestanden
    location ~* \.(js|css|png|jpg|svg|ico|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing: alle routes sturen naar index.html
    # Zonder dit geeft nginx een 404 bij direct naar /orders navigeren
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy naar backend API
    location /api/ {
        proxy_pass http://backend:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

---

## Docker Compose — Lokale Ontwikkeling

**Docker Compose** laat je meerdere containers als één geheel beheren. Ideaal voor lokaal ontwikkelen: start je hele stack met één commando.

```yaml
# docker-compose.yml
services:

  # ─── DATABASE ─────────────────────────────────────────────────────────
  db:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: myapp_db
    environment:
      ACCEPT_EULA: "Y"
      SA_PASSWORD: "Dev@Passw0rd123"  # Sterk wachtwoord, ook voor dev
      MSSQL_PID: Developer             # Gratis Developer edition
    ports:
      - "1433:1433"  # host:container — bereikbaar op localhost:1433
    volumes:
      - sqldata:/var/opt/mssql  # Data blijft bewaard na restart
    healthcheck:
      test: ["CMD", "/opt/mssql-tools/bin/sqlcmd",
             "-S", "localhost", "-U", "sa",
             "-P", "Dev@Passw0rd123",
             "-Q", "SELECT 1"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s  # SQL Server heeft tijd nodig om op te starten

  # ─── BACKEND ─────────────────────────────────────────────────────────
  backend:
    build:
      context: .
      dockerfile: src/MyApp.API/Dockerfile
      target: runtime
    container_name: myapp_backend
    environment:
      ASPNETCORE_ENVIRONMENT: Development
      ConnectionStrings__DefaultConnection: >
        Server=db;Database=MyAppDb;User Id=sa;
        Password=Dev@Passw0rd123;TrustServerCertificate=true;
    ports:
      - "8080:8080"
    depends_on:
      db:
        condition: service_healthy  # Wacht tot DB klaar is
    volumes:
      # Hot reload van appsettings in dev (optioneel)
      - ./src/MyApp.API/appsettings.Development.json:/app/appsettings.Development.json:ro

  # ─── FRONTEND ─────────────────────────────────────────────────────────
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: myapp_frontend
    ports:
      - "4200:80"
    depends_on:
      - backend

  # ─── MONITORING (optioneel voor dev) ─────────────────────────────────
  seq:
    image: datalust/seq:latest
    container_name: myapp_seq
    environment:
      ACCEPT_EULA: "Y"
    ports:
      - "5341:5341"  # Serilog stuurt logs hierheen
      - "8081:80"    # Seq UI: http://localhost:8081

volumes:
  sqldata:
    driver: local
```

```bash
# Handige commando's
docker compose up -d           # Start alles op de achtergrond
docker compose up -d backend   # Start alleen backend opnieuw
docker compose down            # Stop alles
docker compose down -v         # Stop alles + verwijder volumes (database leeg!)
docker compose logs -f backend # Bekijk logs van backend live
docker compose ps              # Status van alle containers
docker compose exec backend sh # Open shell in backend container
```

---

## Kubernetes — Containers op Schaal

**Kubernetes (K8s)** is een systeem dat containers beheert op een cluster van servers. Het zorgt voor:
- **Hoge beschikbaarheid**: als een container crasht, start K8s automatisch een nieuwe
- **Schaalbaarheid**: voeg meer containers toe als de load toeneemt
- **Rolling updates**: deploy nieuwe versies zonder downtime
- **Self-healing**: defecte nodes worden automatisch vervangen

### Kernconcepten

```
Cluster: de hele K8s infrastructuur (meerdere nodes/servers)
    └── Node: één server in het cluster
            └── Pod: de kleinste K8s eenheid — bevat één of meer containers
                    └── Container: jouw applicatie

Deployment: beschrijft hoeveel pods er moeten draaien + hoe ze bijgewerkt worden
Service: een stabiel netwerkadressen voor pods (pods komen en gaan, Service blijft)
Ingress: de toegangspoort van buiten — routeert HTTP traffic naar de juiste Service
ConfigMap: niet-gevoelige configuratie (env vars, config bestanden)
Secret: gevoelige data (wachtwoorden, API keys) — versleuteld opgeslagen
Namespace: isolatielaag — groepeer resources per omgeving of team
```

### Deployment manifest

```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: myapp-prod
  labels:
    app: backend
    version: "1.0.0"
spec:
  replicas: 3  # Altijd 3 pods draaien

  selector:
    matchLabels:
      app: backend

  # Rolling update strategie: maximaal 1 pod onbeschikbaar tegelijk
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1

  template:
    metadata:
      labels:
        app: backend
        version: "1.0.0"
    spec:
      containers:
        - name: backend
          image: myregistry.azurecr.io/myapp-backend:1.0.0  # Nooit :latest!
          ports:
            - containerPort: 8080

          # Omgevingsvariabelen
          env:
            - name: ASPNETCORE_ENVIRONMENT
              value: Production
            - name: ConnectionStrings__DefaultConnection
              valueFrom:
                secretKeyRef:
                  name: db-credentials  # Naam van het Secret object
                  key: connectionString

          # Resource limiten — altijd instellen!
          # Zonder limiten kan één slechte pod de hele node laten crashen
          resources:
            requests:        # Gegarandeerde resources
              cpu: "250m"    # 250 millicores = 25% van één CPU kern
              memory: "256Mi"
            limits:          # Maximum — pod wordt gestopt als dit overschreden wordt
              cpu: "500m"
              memory: "512Mi"

          # Liveness probe: is de pod nog levend?
          # K8s herstart de pod als dit faalt
          livenessProbe:
            httpGet:
              path: /health/live
              port: 8080
            initialDelaySeconds: 15  # Wacht 15s voor eerste check
            periodSeconds: 20        # Check elke 20s
            failureThreshold: 3      # Herstart na 3 opeenvolgende mislukkingen

          # Readiness probe: is de pod klaar om traffic te ontvangen?
          # K8s stuurt geen traffic naar pods die niet "ready" zijn
          readinessProbe:
            httpGet:
              path: /health/ready
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 10
            failureThreshold: 3

      # Zorg dat pods op verschillende nodes draaien (voor HA)
      topologySpreadConstraints:
        - maxSkew: 1
          topologyKey: kubernetes.io/hostname
          whenUnsatisfiable: DoNotSchedule
          labelSelector:
            matchLabels:
              app: backend
```

### Service manifest

```yaml
# k8s/backend-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: backend
  namespace: myapp-prod
spec:
  selector:
    app: backend  # Verbindt met pods die deze label hebben
  ports:
    - port: 80           # Poort waarop andere pods deze service bereiken
      targetPort: 8080   # Poort op de pod zelf
  type: ClusterIP        # Alleen intern bereikbaar (niet van buiten het cluster)
```

### Ingress — Toegang van buiten

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-ingress
  namespace: myapp-prod
  annotations:
    # Automatisch Let's Encrypt certificaat aanvragen
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    # Rate limiting: max 100 requests per minuut per IP
    nginx.ingress.kubernetes.io/limit-rps: "100"
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - myapp.bedrijf.be
      secretName: myapp-tls-cert  # cert-manager slaat het certificaat hier op
  rules:
    - host: myapp.bedrijf.be
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: backend
                port:
                  number: 80
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend
                port:
                  number: 80
```

### Secrets & ConfigMaps

```yaml
# k8s/configmap.yaml — niet-gevoelige configuratie
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: myapp-prod
data:
  ASPNETCORE_ENVIRONMENT: "Production"
  Logging__LogLevel__Default: "Warning"
  FeatureFlags__NewPickingUI: "true"

---
# k8s/secret.yaml — NOOIT plaintext secrets in Git opslaan!
# Gebruik Azure Key Vault + External Secrets Operator, of Sealed Secrets
# Dit is enkel voor illustratie — in productie gebruik je een secret manager
apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
  namespace: myapp-prod
type: Opaque
stringData:
  # stringData wordt automatisch base64-encoded opgeslagen
  connectionString: "Server=myserver.database.windows.net;Database=mydb;..."
  apiKey: "super-geheime-api-sleutel"
```

---

## CI/CD Pipeline — Azure DevOps

**CI (Continuous Integration):** elke keer dat je code pusht, wordt automatisch gebouwd en getest.
**CD (Continuous Deployment):** na succesvolle tests wordt automatisch uitgerold.

```yaml
# azure-pipelines.yml
trigger:
  branches:
    include:
      - main       # Productie deployments
      - develop    # Test/staging deployments
  paths:
    exclude:
      - "*.md"     # Documentatiewijzigingen triggeren geen build

variables:
  imageTag: $(Build.BuildId)
  acrName: "mycompanyregistry"
  acrLoginServer: "mycompanyregistry.azurecr.io"

stages:

  # ─── STAGE 1: BUILD & TEST ────────────────────────────────────────────
  - stage: BuildAndTest
    displayName: "Build & Test"
    jobs:
      - job: BuildTest
        pool:
          vmImage: ubuntu-latest
        steps:
          - task: UseDotNet@2
            displayName: ".NET 8 installeren"
            inputs:
              version: "8.x"

          - task: DotNetCoreCLI@2
            displayName: "Dependencies herstellen"
            inputs:
              command: restore
              projects: "**/*.csproj"

          - task: DotNetCoreCLI@2
            displayName: "Unit tests uitvoeren"
            inputs:
              command: test
              projects: "**/*.UnitTests.csproj"
              arguments: "--collect:\"XPlat Code Coverage\""

          - task: DotNetCoreCLI@2
            displayName: "Integration tests uitvoeren"
            inputs:
              command: test
              projects: "**/*.IntegrationTests.csproj"

          - task: PublishCodeCoverageResults@1
            displayName: "Code coverage publiceren"
            inputs:
              codeCoverageTool: Cobertura
              summaryFileLocation: "$(Agent.TempDirectory)/**/coverage.cobertura.xml"

  # ─── STAGE 2: DOCKER BUILD & PUSH ────────────────────────────────────
  - stage: DockerBuild
    displayName: "Docker Build & Push"
    dependsOn: BuildAndTest
    condition: succeeded()
    jobs:
      - job: BuildPush
        pool:
          vmImage: ubuntu-latest
        steps:
          - task: Docker@2
            displayName: "Login bij ACR"
            inputs:
              command: login
              containerRegistry: "myACRServiceConnection"

          - task: Docker@2
            displayName: "Backend image bouwen en pushen"
            inputs:
              command: buildAndPush
              repository: "myapp-backend"
              dockerfile: "src/MyApp.API/Dockerfile"
              containerRegistry: "myACRServiceConnection"
              tags: |
                $(imageTag)
                latest

          - task: Docker@2
            displayName: "Frontend image bouwen en pushen"
            inputs:
              command: buildAndPush
              repository: "myapp-frontend"
              dockerfile: "frontend/Dockerfile"
              containerRegistry: "myACRServiceConnection"
              tags: $(imageTag)

  # ─── STAGE 3: DEPLOY NAAR STAGING ────────────────────────────────────
  - stage: DeployStaging
    displayName: "Deploy naar Staging"
    dependsOn: DockerBuild
    condition: succeeded()
    jobs:
      - deployment: DeployStaging
        pool:
          vmImage: ubuntu-latest
        environment: "staging"  # Azure DevOps environment met approval gates
        strategy:
          runOnce:
            deploy:
              steps:
                - task: KubernetesManifest@1
                  displayName: "Deploy naar staging namespace"
                  inputs:
                    action: deploy
                    kubernetesServiceConnection: "myAKSConnection"
                    namespace: myapp-staging
                    manifests: "k8s/*.yaml"
                    containers: |
                      $(acrLoginServer)/myapp-backend:$(imageTag)
                      $(acrLoginServer)/myapp-frontend:$(imageTag)

  # ─── STAGE 4: DEPLOY NAAR PRODUCTIE ──────────────────────────────────
  - stage: DeployProduction
    displayName: "Deploy naar Productie"
    dependsOn: DeployStaging
    condition: |
      and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
    jobs:
      - deployment: DeployProd
        pool:
          vmImage: ubuntu-latest
        environment: "production"  # Vereist handmatige goedkeuring!
        strategy:
          runOnce:
            deploy:
              steps:
                - task: KubernetesManifest@1
                  displayName: "Deploy naar productie namespace"
                  inputs:
                    action: deploy
                    kubernetesServiceConnection: "myAKSProdConnection"
                    namespace: myapp-prod
                    manifests: "k8s/*.yaml"
                    containers: |
                      $(acrLoginServer)/myapp-backend:$(imageTag)
                      $(acrLoginServer)/myapp-frontend:$(imageTag)
```

---

## Essentiële kubectl Commando's

```bash
# ─── STATUS BEKIJKEN ──────────────────────────────────────────────────
kubectl get pods -n myapp-prod                # Lijst alle pods
kubectl get pods -n myapp-prod -w             # Live updates (-w = watch)
kubectl get all -n myapp-prod                 # Alles: pods, services, deployments

# ─── DETAILS BEKIJKEN ────────────────────────────────────────────────
kubectl describe pod <pod-naam> -n myapp-prod   # Volledige info + events
kubectl describe deployment backend -n myapp-prod

# ─── LOGS BEKIJKEN ───────────────────────────────────────────────────
kubectl logs <pod-naam> -n myapp-prod           # Logs van de pod
kubectl logs <pod-naam> -n myapp-prod -f        # Live logs (-f = follow)
kubectl logs <pod-naam> -n myapp-prod --tail=100  # Laatste 100 regels
kubectl logs -l app=backend -n myapp-prod        # Logs van ALLE backend pods

# ─── DEBUGGEN ────────────────────────────────────────────────────────
kubectl exec -it <pod-naam> -n myapp-prod -- /bin/sh  # Shell in pod openen
kubectl port-forward pod/<pod-naam> 8080:8080 -n myapp-prod  # Lokaal testen

# ─── DEPLOYEN ────────────────────────────────────────────────────────
kubectl apply -f k8s/backend-deployment.yaml    # Pas manifest toe
kubectl set image deployment/backend \
  backend=myregistry.azurecr.io/myapp-backend:1.0.1 \
  -n myapp-prod                                 # Nieuwe image deployen

# ─── ROLLBACK ────────────────────────────────────────────────────────
kubectl rollout status deployment/backend -n myapp-prod   # Bekijk rollout
kubectl rollout history deployment/backend -n myapp-prod  # Versiegeschiedenis
kubectl rollout undo deployment/backend -n myapp-prod     # Rollback!

# ─── SCHALEN ─────────────────────────────────────────────────────────
kubectl scale deployment/backend --replicas=5 -n myapp-prod

# ─── RESOURCES VERWIJDEREN ───────────────────────────────────────────
kubectl delete pod <pod-naam> -n myapp-prod  # Pod verwijderen (K8s start nieuwe)
```

---

## Best Practices

### Docker
- **Multi-stage builds**: houd productie-images klein (geen SDK, geen testtools)
- **Non-root user**: draai containers nooit als root
- **Specifieke versie tags**: gebruik `8.0.3` niet `8.0` of `latest`
- **.dockerignore**: sluit `node_modules`, `bin`, `obj`, `.git` uit van de context

### Kubernetes
- **Altijd resource requests én limits** instellen — zonder limits is one-bad-pod-takes-all mogelijk
- **Liveness én readiness probes**: vergeet de readiness probe niet — anders krijgt een pod die nog aan het opstarten is al traffic
- **Namespaces per omgeving**: `myapp-dev`, `myapp-staging`, `myapp-prod`
- **Secrets nooit in Git**: gebruik Azure Key Vault + External Secrets Operator
- **Pod Disruption Budget**: garandeert minimum beschikbare pods tijdens maintenance
- **Horizontal Pod Autoscaler**: schaal automatisch op basis van CPU/memory

---

*[← Terug naar overzicht](../../README.md)*
