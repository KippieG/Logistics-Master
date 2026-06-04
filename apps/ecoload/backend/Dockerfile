FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 5000

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY src/ECS.EcoLoad.API/ECS.EcoLoad.API.csproj ./ECS.EcoLoad.API/
RUN dotnet restore ./ECS.EcoLoad.API/ECS.EcoLoad.API.csproj
COPY src/ .
RUN dotnet build ./ECS.EcoLoad.API/ECS.EcoLoad.API.csproj -c Release -o /app/build

FROM build AS publish
RUN dotnet publish ./ECS.EcoLoad.API/ECS.EcoLoad.API.csproj -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ECS.EcoLoad.API.dll"]
