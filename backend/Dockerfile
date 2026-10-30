FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY Ecc.Backend.sln ./
COPY Ecc.Domain/*.csproj Ecc.Domain/
COPY Ecc.Application/*.csproj Ecc.Application/
COPY Ecc.Infrastructure/*.csproj Ecc.Infrastructure/
COPY Ecc.WebApi/*.csproj Ecc.WebApi/
RUN dotnet restore Ecc.WebApi/Ecc.WebApi.csproj
COPY . .
RUN dotnet publish Ecc.WebApi/Ecc.WebApi.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:5023
ENV USE_SQLITE=true
EXPOSE 5023
ENTRYPOINT ["dotnet", "Ecc.WebApi.dll"]