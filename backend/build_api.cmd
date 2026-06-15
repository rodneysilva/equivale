@echo off
cd /d "%~dp0"
dotnet build src\equivale.Api\equivale.Api.csproj --no-restore
