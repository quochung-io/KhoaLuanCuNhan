Write-Host "============================================="
Write-Host "Bat dau khoi tao cau truc thu muc he thong ECC..."
Write-Host "============================================="

# 1. Tao cac thu muc goc
New-Item -ItemType Directory -Force -Path "backend", "frontend-web", "mobile-app", "ai-service", "database"

# 2. Khoi tao Backend (.NET Core Clean Architecture)
Write-Host "-> Dang khoi tao Backend C# .NET (Clean Architecture)..."
cd backend
dotnet new sln -n Ecc.Backend
dotnet new classlib -n Ecc.Domain
dotnet new classlib -n Ecc.Application
dotnet new classlib -n Ecc.Infrastructure
dotnet new webapi -n Ecc.WebApi

# Them du an vao solution
dotnet sln Ecc.Backend.sln add Ecc.Domain/Ecc.Domain.csproj Ecc.Application/Ecc.Application.csproj Ecc.Infrastructure/Ecc.Infrastructure.csproj Ecc.WebApi/Ecc.WebApi.csproj

# Thiet lap tham chieu du an
dotnet add Ecc.Application/Ecc.Application.csproj reference Ecc.Domain/Ecc.Domain.csproj
dotnet add Ecc.Infrastructure/Ecc.Infrastructure.csproj reference Ecc.Application/Ecc.Application.csproj
dotnet add Ecc.WebApi/Ecc.WebApi.csproj reference Ecc.Application/Ecc.Application.csproj Ecc.Infrastructure/Ecc.Infrastructure.csproj

# Tao cac thu muc con cho Clean Architecture
New-Item -ItemType Directory -Force -Path "Ecc.Domain/Entities", "Ecc.Domain/Common", "Ecc.Domain/ValueObjects"
New-Item -ItemType Directory -Force -Path "Ecc.Application/Common/Interfaces", "Ecc.Application/Common/Mappings", "Ecc.Application/Features"
New-Item -ItemType Directory -Force -Path "Ecc.Infrastructure/Persistence", "Ecc.Infrastructure/Services", "Ecc.Infrastructure/Identity"
New-Item -ItemType Directory -Force -Path "Ecc.WebApi/Controllers", "Ecc.WebApi/Middlewares"

cd ..

# 3. Khoi tao Frontend Web
Write-Host "-> Dang khoi tao Frontend Web (React Vite & Next.js)..."
cd frontend-web
# React Vite Admin (Ant Design se duoc cai dat sau)
npm create vite@latest admin-ncc -- --template react-ts
# Next.js Customer Store
npx create-next-app@latest customer-store --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes
cd ..

# 4. Khoi tao Mobile App (Flutter)
Write-Host "-> Dang khoi tao Mobile App Flutter..."
cd mobile-app
flutter create --org com.ecc.app --project-name mobile_app mobile_app
cd ..

# 5. Khoi tao AI Service (FastAPI)
Write-Host "-> Dang khoi tao AI Service Python..."
New-Item -ItemType Directory -Force -Path "ai-service/app"
New-Item -ItemType Directory -Force -Path "ai-service/app/api"
New-Item -ItemType Directory -Force -Path "ai-service/app/core"
New-Item -ItemType Directory -Force -Path "ai-service/app/services"
New-Item -ItemType Directory -Force -Path "ai-service/app/models"

# 6. Khoi tao Database
Write-Host "-> Dang khoi tao Database Scripts..."
New-Item -ItemType Directory -Force -Path "database/scripts"

Write-Host "============================================="
Write-Host "KHOI TAO THANH CONG!"
Write-Host "============================================="
