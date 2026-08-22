# ECC Database Module

Module chứa các script khởi tạo cơ sở dữ liệu và tài liệu hướng dẫn liên quan đến thiết kế Database cho dự án ECC.

## Nội dung thư mục
- `scripts/`: Chứa các script SQL khởi tạo và migrations.
  - [01_init_schema.sql](file:///D:/Năm 4/IOT_HopThuocThongMinh/database/scripts/01_init_schema.sql): Script SQL khởi tạo schema cho Microsoft SQL Server.

## Hướng dẫn kết nối & Chạy
1. Đảm bảo bạn đã cài đặt Microsoft SQL Server và công cụ quản trị (SSMS hoặc Azure Data Studio).
2. Tạo một Database mới (ví dụ: `ECC_DB`).
3. Mở file `01_init_schema.sql` và thực thi trên Database vừa tạo để khởi tạo cấu trúc bảng.
