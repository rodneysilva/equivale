FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY src/equivale.Domain/equivale.Domain.csproj src/equivale.Domain/
COPY src/equivale.Application/equivale.Application.csproj src/equivale.Application/
COPY src/equivale.Infrastructure/equivale.Infrastructure.csproj src/equivale.Infrastructure/
COPY src/equivale.Api/equivale.Api.csproj src/equivale.Api/
RUN dotnet restore src/equivale.Api/equivale.Api.csproj

COPY src/ src/
RUN dotnet publish src/equivale.Api/equivale.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 5053
ENV ASPNETCORE_URLS=http://+:5053
ENTRYPOINT ["dotnet", "equivale.Api.dll"]
