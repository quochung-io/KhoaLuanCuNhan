# ECC - Engineered AI Command Center System (v2.0.0)

Hệ thống quản lý chuỗi cung ứng nông sản thông minh tích hợp gợi ý AI Top-K.

## 📁 Cấu trúc Thư mục Hệ thống (Monorepo)

Hệ thống được tổ chức thành các phân hệ chính sau:

- 💻 [**`backend/`**](file:///D:/Năm 4/IOT_HopThuocThongMinh/backend) - ASP.NET Core 8 Web API (.NET 9 SDK), triển khai theo Clean Architecture:
  - `Ecc.Domain/`: Chứa các thực thể (Entities), Value Objects và quy tắc nghiệp vụ cốt lõi.
  - `Ecc.Application/`: Chứa logic ứng dụng, CQRS (MediatR), Interfaces và DTOs.
  - `Ecc.Infrastructure/`: Chứa cấu hình Persistence (EF Core DbContext), External Services, Identity.
  - `Ecc.WebApi/`: Điểm khởi chạy API (Controllers, Middlewares, Configuration).
- 🌐 **Các ứng dụng Web (độc lập tại thư mục gốc):**
  - [**`web-admin/`**](file:///D:/Năm 4/IOT_HopThuocThongMinh/web-admin) - Web Admin dành cho Quản trị viên (React.js + Vite + TypeScript + Ant Design).
  - [**`web-supplier/`**](file:///D:/Năm 4/IOT_HopThuocThongMinh/web-supplier) - Website dành cho Nhà cung cấp và Hợp tác xã (React.js + Vite + TypeScript + Ant Design).
  - [**`web-store/`**](file:///D:/Năm 4/IOT_HopThuocThongMinh/web-store) - Website bán hàng nông sản dành cho Khách hàng (Next.js + Tailwind CSS + TypeScript - tối ưu hóa SEO).
- 📱 [**`mobile-app/`**](file:///D:/Năm 4/IOT_HopThuocThongMinh/mobile-app) - Ứng dụng di động Flutter dành cho khách hàng và quét mã QR Code.
- 🤖 [**`ai-service/`**](file:///D:/Năm 4/IOT_HopThuocThongMinh/ai-service) - Dịch vụ gợi ý AI viết bằng Python & FastAPI (Sử dụng Pandas, Scikit-learn, Implicit ALS để gợi ý Top-K sản phẩm theo mùa vụ, vị trí và hành vi).
- 🗄️ [**`database/`**](file:///D:/Năm 4/IOT_HopThuocThongMinh/database) - Chứa các script khởi tạo cơ sở dữ liệu Microsoft SQL Server.

---

## 🚀 Hướng dẫn Chạy Từng Phân Hệ

### 1. Backend Core API
Yêu cầu: .NET Core SDK 8.0 hoặc cao hơn.
```bash
cd backend/Ecc.WebApi
dotnet run
```
API mặc định sẽ chạy tại `http://localhost:5000` hoặc `https://localhost:5001`.

### 2. Frontend Web
#### Web Admin (React + Vite)
```bash
cd web-admin
npm install
npm run dev
```
#### Web Nhà Cung Cấp / Hợp Tác Xã (React + Vite)
```bash
cd web-supplier
npm install
npm run dev
```
#### Website Bán Hàng - Khách Hàng (Next.js)
```bash
cd web-store
npm install
npm run dev
```

### 3. Mobile App (Flutter)
Yêu cầu: Flutter SDK và các IDE hỗ trợ (VS Code, Android Studio) đã cài Emulator/Thiết bị thật.
```bash
cd mobile-app
flutter pub get
flutter run
```

### 4. AI Recommendation Service (Python FastAPI)
Yêu cầu: Python 3.10+, khuyến khích tạo môi trường ảo (venv).
```bash
cd ai-service
python -m venv venv
.\venv\Scripts\activate    # Trên Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Swagger UI sẽ hoạt động tại: `http://localhost:8000/docs`.

### 5. Cơ sở dữ liệu (Microsoft SQL Server)
Xem hướng dẫn chi tiết tại [database/README.md](file:///D:/Năm 4/IOT_HopThuocThongMinh/database/README.md).
