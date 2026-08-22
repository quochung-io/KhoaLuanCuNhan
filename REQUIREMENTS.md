# ECC - Tài liệu Đặc tả Yêu cầu Hệ thống

Tài liệu này định nghĩa chi tiết các yêu cầu chức năng cho từng phân hệ trong Hệ thống Quản lý Chuỗi Cung Ứng Nông Sản Thông Minh (ECC).

---

## 1. Phân hệ Web Admin (Quản trị viên)

Dành cho ban quản trị hệ thống để giám sát toàn bộ hoạt động của chuỗi cung ứng, người dùng và hệ thống gợi ý.

### Yêu cầu chức năng:
* **Quản lý thực thể cốt lõi:**
  - Thêm, sửa, xóa, tra cứu, duyệt và cập nhật trạng thái của Người dùng (Admin, Khách hàng, Nhà cung cấp / Hợp tác xã).
  - Quản lý danh mục nông sản và thông tin chi tiết của từng Sản phẩm nông sản.
* **Quản lý vận hành & giao dịch:**
  - Theo dõi và xử lý Đơn hàng (cập nhật trạng thái đơn hàng).
  - Quản lý Tồn kho tổng thể và theo dõi biến động tồn kho.
  - Thiết lập và quản lý các chương trình Khuyến mãi.
  - Quản lý và duyệt các Đánh giá sản phẩm từ khách hàng.
* **Quản lý & Kiểm soát nguồn gốc (Traceability):**
  - Quản lý thông tin Vùng trồng của từng nhà cung cấp.
  - Quản lý Lô hàng nông sản nhập kho.
  - Theo dõi Ngày thu hoạch, Hạn sử dụng (phục vụ FEFO) và Chứng nhận chất lượng (VietGAP, GlobalGAP, Organic...).
  - Quản lý Tình trạng kinh doanh (đang bán, dừng bán, hết hàng, hết hạn) của từng sản phẩm.
* **Dashboard & Thống kê báo cáo:**
  - Thống kê Doanh thu và Số lượng đơn hàng theo thời gian.
  - Thống kê Sản phẩm bán chạy và tình trạng Tồn kho tổng thể.
  - Cảnh báo tự động các sản phẩm/lô hàng Gần hết hạn sử dụng.
  - Phân tích hành vi người dùng, khu vực giao hàng phổ biến.
  - Đo lường hiệu quả và độ chính xác của Mô-đun gợi ý AI.

---

## 2. Phân hệ Website Nhà cung cấp (Nhà cung cấp / Hợp tác xã)

Dành riêng cho các Hộ nông dân, Hợp tác xã (HTX) hoặc Doanh nghiệp cung cấp nông sản để quản lý sản phẩm và đơn hàng của họ.

### Yêu cầu chức năng:
* **Quản lý hồ sơ & tài khoản:**
  - Đăng ký, đăng nhập và quản lý hồ sơ thông tin nhà cung cấp/HTX.
* **Quản lý nông sản & giá bán:**
  - Đăng tải và cập nhật thông tin sản phẩm nông sản (tên, hình ảnh, mô tả, danh mục).
  - Thiết lập và cập nhật giá bán linh hoạt theo thời điểm hoặc lô hàng.
* **Quản lý nguồn gốc lô hàng & tồn kho:**
  - Khai báo thông tin Vùng trồng tương ứng với sản phẩm.
  - Khởi tạo Lô hàng nông sản mới với các thông tin: ngày thu hoạch, hạn sử dụng, số lượng ban đầu và các chứng nhận chất lượng đính kèm.
  - Quản lý số lượng Tồn kho thực tế và Trạng thái kinh doanh của từng lô nông sản.
* **Xử lý đơn hàng & Cảnh báo:**
  - Tiếp nhận đơn hàng mới có chứa sản phẩm của mình.
  - Cập nhật trạng thái chuẩn bị hàng, giao hàng cho đơn vị vận chuyển.
  - Theo dõi báo cáo số lượng bán ra và nhận Cảnh báo sớm các lô hàng gần hết hạn để chủ động giảm giá hoặc xử lý.
* **Báo cáo doanh thu:**
  - Theo dõi báo cáo cơ bản về doanh thu, số đơn hàng, sản phẩm bán chạy nhất của riêng nhà cung cấp.

---

## 3. Phân hệ Website/Mobile App Khách hàng (Người mua)

Kênh tương tác trực tiếp với người tiêu dùng cuối cùng để mua sắm nông sản sạch và truy xuất nguồn gốc.

### Yêu cầu chức năng:
* **Trải nghiệm mua sắm:**
  - Đăng ký, đăng nhập tài khoản khách hàng.
  - Tìm kiếm sản phẩm thông minh và Lọc nông sản theo danh mục, giá, vị trí, độ tươi, chứng nhận.
  - Xem chi tiết sản phẩm và nguồn gốc xuất xứ rõ ràng (truy xuất từ vùng trồng, nhà cung cấp, ngày thu hoạch của lô hàng đó).
  - Quản lý Giỏ hàng, áp dụng các mã Khuyến mãi phù hợp.
  - Đặt hàng và thực hiện Thanh toán giả lập (sandbox).
  - Theo dõi trạng thái đơn hàng theo thời gian thực (Real-time tracking).
  - Viết đánh giá, bình luận và chấm điểm sản phẩm sau khi mua.
* **Hệ thống gợi ý thông minh (Recommender System):**
  - Hiển thị các nhóm gợi ý cá nhân hóa dựa trên hành vi mua sắm trước đó (Collaborative Filtering / Implicit ALS).
  - Gợi ý sản phẩm tối ưu theo Mùa vụ (sản phẩm đang mùa hoạch).
  - Gợi ý sản phẩm theo Khu vực địa lý (khoảng cách vận chuyển gần nhất để đảm bảo độ tươi ngon).
  - Gợi ý dựa trên Độ tươi và Hạn sử dụng (ưu tiên các sản phẩm chất lượng cao hoặc các chương trình giảm giá đẩy kho gần hết hạn).
* **RESTful API dùng chung & Đồng bộ dữ liệu:**
  - Hệ thống API thống nhất phục vụ kết nối dữ liệu giữa Web Admin, Web Nhà cung cấp, Web/App Khách hàng.
  - Ràng buộc và kiểm tra dữ liệu đầu vào nghiêm ngặt (Validation).
  - Phân quyền truy cập API chi tiết (Authentication & Authorization).
  - Xử lý lỗi hệ thống, xung đột dữ liệu tồn kho (Concurrency conflict khi nhiều người đặt hàng cùng lúc) và kiểm thử tích hợp toàn diện.
