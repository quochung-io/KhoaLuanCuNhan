# ECC Database Module - Quản Lý Web Mua Bán Nông Sản

Module chứa các script khởi tạo cơ sở dữ liệu, dữ liệu mẫu thực tế và tài liệu hướng dẫn liên quan đến thiết kế Database cho dự án Mua Bán Nông Sản & Truy Xuất Nguồn Gốc.

---

## 📁 Danh sách tệp & Scripts

### 🌟 Bản sao lưu đầy đủ (Khuyên dùng)
- **`QL_WebMuaBanNongSan_Full.sql`** (hoặc **`scripts/06_full_database_dump.sql`**):
  - **Bản sao lưu đầy đủ nhất (Full Schema + Seed Data)** của 31 bảng trong hệ thống.
  - Bao gồm: Cấu trúc bảng (DDL), chỉ mục (Indexes), khóa ngoại (Foreign Keys), ràng buộc (Constraints) và toàn bộ dữ liệu mẫu thực tế (Users, Products, Batches, Inventories, Orders, Payments, Vouchers, Points, Reviews...).
  - Tự động tạo Database `QL_WebMuaBanNongSan` nếu chưa có và tự động xử lý `IDENTITY_INSERT` cũng như vô hiệu hóa/bật lại ràng buộc khóa ngoại an toàn.

### 📜 Các script thành phần (Scripts lịch sử)
- `scripts/01_init_schema.sql`: Script khởi tạo cấu trúc bảng ban đầu.
- `scripts/02_seed_50_products.sql`: Script seed 50 nông sản mẫu đa dạng danh mục.
- `scripts/03_categorize_products.sql`: Cập nhật và chuẩn hóa danh mục.
- `scripts/04_seed_user_compiled_products.sql`: Script dữ liệu nông sản tổng hợp.
- `scripts/05_add_rice_category.sql`: Bổ sung danh mục gạo và nông sản khô.
- `scripts/06_full_database_dump.sql`: Bản sao của file Full Dump đồng bộ trong thư mục scripts.

---

## 🚀 Hướng dẫn phục hồi / Import Database

### Cách 1: Sử dụng SQL Server Management Studio (SSMS) hoặc Azure Data Studio (Đơn giản nhất)
1. Mở SSMS hoặc Azure Data Studio và kết nối tới SQL Server của bạn (ví dụ: `.` hoặc `localhost`).
2. Mở file **`QL_WebMuaBanNongSan_Full.sql`** (File -> Open -> File...).
3. Nhấn **Execute** (hoặc phím tắt **F5**).
4. Hệ thống sẽ tự động tạo cơ sở dữ liệu `QL_WebMuaBanNongSan` và nạp toàn bộ cấu trúc cùng dữ liệu.

### Cách 2: Sử dụng PowerShell
Mở PowerShell tại thư mục dự án và chạy:
```powershell
$connStr = "Server=.;Database=master;Integrated Security=True;TrustServerCertificate=True"
Invoke-Sqlcmd -ConnectionString $connStr -InputFile "database/QL_WebMuaBanNongSan_Full.sql"
```

---

## ⚙️ Chuỗi kết nối Backend (.NET 9)
Trong file `backend/Ecc.WebApi/appsettings.json`:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=.;Database=QL_WebMuaBanNongSan;Trusted_Connection=True;TrustServerCertificate=True;Encrypt=False"
}
```
Sau khi import thành công database, backend sẽ kết nối và hoạt động ngay mà không cần cấu hình thêm.
