# ECC Database Module - Quản Lý Web Mua Bán Nông Sản

Module chứa các script khởi tạo cơ sở dữ liệu, dữ liệu mẫu thực tế và tài liệu hướng dẫn liên quan đến thiết kế Database cho dự án Mua Bán Nông Sản & Truy Xuất Nguồn Gốc.

---

## 📁 Danh sách tệp & Scripts

### 🌟 Bản sao lưu đầy đủ (Khuyên dùng)
- **`QL_WebMuaBanNongSan_Full.sql`**:
  - **Bản sao lưu hoàn chỉnh nhất (Full Schema 31 bảng + 131 Nông sản + 520 Hình ảnh + Seed Data thực tế)**.
  - Bao gồm: DDL 31 bảng chuẩn, các cột nghiệp vụ mới (`AddressType`, `ApprovedBy`, `ApprovedAt`, `RejectReason`), tài khoản chuẩn BCrypt (`Demo@123`), 31 đơn hàng, 68 chi tiết đơn, điểm thưởng (`UserLoyalties`, `PointTransactions`, `MembershipTiers`), ví voucher (`UserVouchers`), và trigger nghiệp vụ lô hàng.
  - Tự động tạo CSDL `QL_WebMuaBanNongSan` nếu chưa có và tự động xử lý `IDENTITY_INSERT` cũng như vô hiệu hóa/bật lại ràng buộc khóa ngoại an toàn.
  - Mã hóa: UTF-8 with BOM chuẩn hiển thị tiếng Việt.

---

## 🚀 Hướng dẫn phục hồi / Import Database

### Cách 1: Sử dụng SQL Server Management Studio (SSMS) hoặc Azure Data Studio (Đơn giản nhất)
1. Mở SSMS hoặc Azure Data Studio và kết nối tới SQL Server của bạn (ví dụ: `.` hoặc `localhost` hoặc `FATQY\nguye`).
2. Mở file **`QL_WebMuaBanNongSan_Full.sql`** (File -> Open -> File...).
3. Nhấn **Execute** (hoặc phím tắt **F5**).
4. Hệ thống sẽ tự động tạo cơ sở dữ liệu `QL_WebMuaBanNongSan` và nạp toàn bộ cấu trúc cùng 140 sản phẩm và dữ liệu mẫu.

### Cách 2: Sử dụng PowerShell
Mở PowerShell tại thư mục dự án và chạy:
```powershell
sqlcmd -S . -i "database/QL_WebMuaBanNongSan_Full.sql"
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
