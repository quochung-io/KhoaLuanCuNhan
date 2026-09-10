-- ==============================================================================
-- Seed Script: Bổ sung 64 sản phẩm nông sản theo danh sách tổng hợp của người dùng
-- Phân loại chuẩn 4 nhóm:
--   CategoryId = 1: Rau củ (Rau ăn lá, củ & thân rễ, quả nấu, nấm & bông cải)
--   CategoryId = 2: Trái cây (Trái cây hàng ngày, nhiệt đới theo mùa, ôn đới Đà Lạt)
--   CategoryId = 3: Rau thơm (Rau thơm & gia vị tươi)
--   CategoryId = 4: Hạt (Các loại đậu, hạt dinh dưỡng đặc sản, gạo & ngũ cốc)
-- ==============================================================================

USE QL_WebMuaBanNongSan;
GO

SET NOCOUNT ON;

BEGIN TRANSACTION;

BEGIN TRY
    -- Bảng tạm chứa 64 sản phẩm mới bổ sung
    CREATE TABLE #TempCompiledProducts (
        TempId INT IDENTITY(1,1) PRIMARY KEY,
        SupplierId BIGINT,
        CategoryId INT,
        FarmId BIGINT,
        ProductName NVARCHAR(150),
        Description NVARCHAR(MAX),
        Price DECIMAL(18,2),
        Unit NVARCHAR(20),
        Status NVARCHAR(20),
        CertId INT,
        Region NVARCHAR(50),
        ImageUrl VARCHAR(500),
        ShelfLifeDays INT,
        InitialQty DECIMAL(18,2)
    );

    INSERT INTO #TempCompiledProducts 
    (SupplierId, CategoryId, FarmId, ProductName, Description, Price, Unit, Status, CertId, Region, ImageUrl, ShelfLifeDays, InitialQty)
    VALUES
    -- =========================================================================
    -- NHÓM 1: RAU CỦ (CategoryId = 1)
    -- =========================================================================
    -- A. Rau ăn lá
    (2, 1, 3, N'Rau dền xanh non', N'Rau dền xanh ngọt thanh mát, giàu canxi và sắt, nấu canh tôm hoặc xào tỏi thơm bùi.', 22000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80', 6, 120),
    (1, 1, 1, N'Cải cúc (Tần ô) Đà Lạt', N'Cải cúc thân mềm lá mỡ, hương thơm nồng nàn đặc trưng, nhúng lẩu hoặc nấu canh thịt bò tuyệt đỉnh.', 35000, N'kg', N'VietGAP', 1, N'Đà Lạt', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80', 7, 90),
    (1, 1, 1, N'Xà lách Carol Đà Lạt', N'Xà lách Carol lá xoăn giòn ngọt, vị đắng nhẹ tinh tế, chuyên dùng cho các món salad dầu giấm.', 45000, N'kg', N'VietGAP', 1, N'Đà Lạt', 'https://images.unsplash.com/photo-1556801712-76c8eb07bbc9?auto=format&fit=crop&w=600&q=80', 8, 100),
    (1, 1, 2, N'Xà lách mỡ (Butterhead)', N'Xà lách búp mỡ lá mềm mịn như bơ, vị ngọt dịu thanh mát, thích hợp cuốn thịt nướng.', 48000, N'kg', N'USDA', 3, N'Đà Lạt', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80', 8, 85),
    (1, 1, 1, N'Bắp cải trắng Đà Lạt', N'Bắp cải trắng cuộn chặt tròn đều, lá dày giòn ngọt đậm, luộc chấm trứng dầm nước mắm cực ngon.', 26000, N'bắp', N'VietGAP', 1, N'Đà Lạt', 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=600&q=80', 20, 160),
    (1, 1, 2, N'Cải thảo Đà Lạt', N'Cải thảo bẹ trắng lá vàng nhạt, ngọt mát giòn bọng nước, nguyên liệu số một để làm kim chi và nấu canh sườn.', 32000, N'bắp', N'VietGAP', 1, N'Đà Lạt', 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80', 15, 140),

    -- B. Rau củ ăn quả
    (2, 1, 3, N'Cà chua thường quê', N'Cà chua chín mọng đỏ tự nhiên trên cành, nhiều bột chua ngọt hài hòa, nấu canh xào rất dậy vị.', 28000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80', 12, 180),
    (2, 1, 4, N'Bí xanh (Bí đao chanh)', N'Bí đao chanh vỏ xanh đậm phấn trắng, ruột đặc ít hạt, nấu canh sườn hoặc ép nước giảm cân thanh nhiệt.', 22000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1582515073490-39981397c445?auto=format&fit=crop&w=600&q=80', 30, 200),
    (2, 1, 3, N'Khổ qua (Mướp đắng) trái to', N'Khổ qua xanh trái to gai thoai thoải, thịt dày vị đắng thanh dịu, thích hợp dồn thịt hầm canh.', 32000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80', 10, 130),
    (1, 1, 1, N'Cà tím dài Đà Lạt', N'Cà tím vỏ tím bóng mượt ruột mềm ngọt, nướng mỡ hành hay kho tiêu đậm đà đưa cơm.', 28000, N'kg', N'VietGAP', 1, N'Đà Lạt', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80', 12, 110),
    (1, 1, 1, N'Ớt chuông Đà Lạt (Đỏ/Vàng)', N'Ớt chuông nhà màng giòn tan ngọt bọng nước, không hăng cay, giàu vitamin A và C số 1.', 65000, N'kg', N'VietGAP', 1, N'Đà Lạt', 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80', 14, 100),

    -- C. Củ & Thân rễ
    (1, 1, 2, N'Khoai tây hồng Đà Lạt', N'Khoai tây giống hồng vỏ mỏng thịt vàng ươm, dẻo bùi thơm nức, nấu súp hay chiên đều tuyệt.', 42000, N'kg', N'VietGAP', 1, N'Đà Lạt', 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80', 30, 220),
    (1, 1, 1, N'Cà rốt tươi Đà Lạt', N'Cà rốt tươi còn cuống lá xanh, củ thon đỏ cam au mọng nước, vị ngọt tự nhiên xào luộc đều giòn.', 32000, N'kg', N'VietGAP', 1, N'Đà Lạt', 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80', 25, 250),
    (1, 1, 2, N'Khoai lang tím Nhật', N'Khoai lang ruột tím thẫm đậm đà, thơm dẻo bùi ngậy, chứa hàm lượng anthocyanin chống lão hóa cao.', 38000, N'kg', N'VietGAP', 1, N'Đà Lạt', 'https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?auto=format&fit=crop&w=600&q=80', 30, 150),
    (2, 1, 4, N'Củ sắn (Củ đậu) ngọt mát', N'Củ đậu vỏ mỏng mọng nước ngọt thanh, ăn sống giải nhiệt mùa hè hoặc xào mực giòn rụm.', 18000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80', 20, 170),
    (2, 1, 3, N'Khoai môn sáp ruột tím', N'Khoai môn sáp dẻo quánh bùi béo, thơm ngậy khi hầm canh xương hoặc nấu chè tráng miệng.', 52000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?auto=format&fit=crop&w=600&q=80', 35, 140),
    (1, 1, 1, N'Khoai sọ nếp Tây Bắc', N'Khoai sọ nếp củ tròn nhỏ, nấu chín dẻo dính thơm bùi, món ngon truyền thống nấu canh cua rau rút.', 45000, N'kg', N'VietGAP', 1, N'Mộc Châu', 'https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?auto=format&fit=crop&w=600&q=80', 30, 130),
    (1, 1, 2, N'Hành tây Đà Lạt', N'Hành tây củ tròn vỏ vàng nhạt, cay nhẹ ngọt hậu, xào thịt bò giòn rụm hoặc trộn gỏi không hăng.', 30000, N'kg', N'VietGAP', 1, N'Đà Lạt', 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80', 30, 190),

    -- D. Nấm & Bông cải
    (2, 1, 3, N'Nấm rơm tươi quê', N'Nấm rơm búp tròn đen xám hái từ rơm lúa mới, vị ngọt giòn thanh đượm hương đồng gió nội.', 95000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80', 5, 80),
    (1, 1, 2, N'Nấm bào ngư xám (Nấm sò)', N'Nấm bào ngư xám tai to dai ngọt, giàu dinh dưỡng, nhúng lẩu hoặc xào sả ớt cực kỳ thơm.', 45000, N'hộp', N'VietGAP', 1, N'Đà Lạt', 'https://images.unsplash.com/photo-1504472478235-9bc48ba4d60f?auto=format&fit=crop&w=600&q=80', 8, 95),
    (1, 1, 1, N'Súp lơ trắng (Bông cải trắng)', N'Súp lơ trắng búp khít trắng tinh, vị ngọt dịu giòn ngọt, giàu khoáng chất tốt cho hệ tiêu hóa.', 55000, N'kg', N'VietGAP', 1, N'Đà Lạt', 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=600&q=80', 12, 100),
    (2, 1, 3, N'Bắp non (Ngô bao tử)', N'Bắp non búp tơ giòn sần sật ngọt lành, thích hợp xào thập cẩm hoặc nấu súp khai vị.', 42000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80', 8, 85),

    -- =========================================================================
    -- NHÓM 2: RAU THƠM & GIA VỊ TƯƠI (CategoryId = 3)
    -- =========================================================================
    (2, 3, 3, N'Ngò gai (Mùi tàu) tươi', N'Ngò gai lá xanh răng cưa thơm nồng đậm đà, gia vị chuẩn không thể thiếu cho món canh chua và phở.', 30000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=600&q=80', 7, 70),
    (2, 3, 4, N'Húng lủi (Húng nhủi) sạch', N'Húng lủi lá nhỏ tinh dầu the mát sảng khoái, ăn kèm thịt luộc, gỏi cuốn hoặc pha cocktail giải nhiệt.', 35000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=600&q=80', 7, 65),
    (1, 3, 1, N'Rau kinh giới thơm', N'Kinh giới lá xanh thơm cay nồng ấm, tính ấm giải cảm, ăn kèm bún đậu mắm tôm ngon đúng điệu.', 32000, N'kg', N'VietGAP', 1, N'Mộc Châu', 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=600&q=80', 6, 60),
    (1, 3, 1, N'Tía tô xanh đỏ hữu cơ', N'Tía tô hai mặt tía xanh thơm ngát nhiều tinh dầu, dược liệu quý giải độc thanh lọc cơ thể.', 35000, N'kg', N'VietGAP', 1, N'Mộc Châu', 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=600&q=80', 7, 75),
    (2, 3, 3, N'Rau diếp cá mát lành', N'Diếp cá lá hình tim mọng nước, tính mát thanh nhiệt tiêu đờm, ăn kèm bánh xèo chả cá trứ danh.', 28000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80', 6, 80),
    (1, 3, 1, N'Thì là thơm Tây Bắc', N'Thì là lá kim nhỏ thơm dịu thảo mộc, linh hồn của món chả cá Lã Vọng và canh riêu cá nấu chua.', 40000, N'kg', N'VietGAP', 1, N'Mộc Châu', 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=600&q=80', 6, 50),
    (2, 3, 4, N'Ớt hiểm chỉ thiên cay nồng', N'Ớt chỉ thiên trái nhỏ đỏ au cay xé lưỡi thơm gắt, gia vị kích thích vị giác trong từng bữa ăn.', 60000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80', 20, 90),
    (2, 3, 3, N'Ớt sừng đỏ tươi', N'Ớt sừng trái to đỏ bóng vỏ dày, cay dịu thoang thoảng, dùng tỉa hoa trang trí hoặc kho cá bắt mắt.', 45000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80', 20, 100),
    (1, 3, 1, N'Tỏi cô đơn Lý Sơn', N'Tỏi một tép đảo Lý Sơn thơm nồng dịu, không hăng cay gắt, dược tính cao ngâm mật ong bồi bổ.', 180000, N'kg', N'VietGAP', 1, N'Đà Lạt', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80', 90, 80),
    (2, 3, 3, N'Nghệ vàng tươi Hưng Yên', N'Nghệ vàng củ chắc thịt vàng sẫm đậm curcumin, kháng viêm làm lành vết thương và tạo màu tự nhiên.', 42000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80', 45, 110),

    -- =========================================================================
    -- NHÓM 3: TRÁI CÂY (CategoryId = 2)
    -- =========================================================================
    -- A. Trái cây hàng ngày
    (2, 2, 3, N'Chuối già Nam Mỹ (Chuối tiêu)', N'Chuối già quả thon dài vỏ vàng ươm, ruột thơm ngậy dẻo bùi, cung cấp năng lượng và kali dồi dào.', 28000, N'nải', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80', 10, 120),
    (2, 2, 3, N'Chuối sứ (Chuối xiêm) Bến Tre', N'Chuối sứ quả mập tròn ngọt sắc thơm đậm, dùng ăn tươi, nướng mỡ hành hoặc nấu chè chuối.', 30000, N'nải', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80', 10, 110),
    (2, 2, 4, N'Dưa hấu không hạt Mặt Trời Đỏ', N'Dưa hấu ruột đỏ au giòn ngọt mọng nước, không hạt tiện lợi, giải khát tức thì ngày hè nắng nóng.', 25000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80', 15, 200),
    (2, 2, 3, N'Ổi lê ruột trắng giòn ngọt', N'Ổi lê trái thuôn dài vỏ xanh mướt, ruột trắng xốp giòn ngọt thanh tao, chấm muối ớt tuyệt ngon.', 32000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=600&q=80', 12, 140),
    (3, 2, 6, N'Thanh long ruột trắng Bình Thuận', N'Thanh long ruột trắng tai xanh giòn ngọt thanh mát, vị chua nhẹ tự nhiên hỗ trợ tiêu hóa.', 38000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=600&q=80', 15, 170),
    (2, 2, 4, N'Bưởi Năm Roi Vĩnh Long', N'Bưởi Năm Roi tép vàng róc vỏ mọng nước, vị chua ngọt thanh dịu đặc trưng không hạt.', 65000, N'quả', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?auto=format&fit=crop&w=600&q=80', 30, 150),
    (1, 2, 1, N'Táo mèo Tây Bắc (Sơn tra)', N'Táo mèo rừng thơm phức vị chua chát ngọt hậu, dùng ngâm rượu quý hoặc ngâm mật ong thanh lọc.', 55000, N'kg', N'VietGAP', 1, N'Mộc Châu', 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=600&q=80', 25, 100),
    (3, 2, 5, N'Xoài cát Hòa Lộc Tiền Giang', N'Đệ nhất xoài Nam Bộ quả thuôn mình đầy, thịt vàng ươm dẻo quánh, vị ngọt lịm thơm ngát.', 110000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=600&q=80', 10, 120),
    (3, 2, 5, N'Xoài keo vàng giòn', N'Xoài keo Campuchia trồng tại Miền Tây, thịt vàng giòn sần sật chua ngọt vừa vặn ăn sống chấm mắm ruốc.', 35000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=600&q=80', 12, 160),
    (2, 2, 4, N'Cóc non bao tử', N'Cóc bao tử quả nhỏ không hạt, giòn rụm chua thanh rôm rốp, món ăn vặt khoái khẩu chấm muối tôm.', 35000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=600&q=80', 14, 110),
    (2, 2, 4, N'Thơm (Dứa) mật Cầu Đúc', N'Thơm mật Cầu Đúc quả to mắt phẳng, thịt vàng đậm mật ứa ngọt lịm không rát lưỡi.', 32000, N'quả', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=600&q=80', 15, 130),

    -- B. Trái cây nhiệt đới theo mùa
    (3, 2, 5, N'Sầu riêng Monthong (Dona)', N'Sầu riêng Monthong quả to gai thưa, cơm vàng nhạt hạt dẹt, vị ngọt béo thanh nhẹ dễ ăn.', 145000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?auto=format&fit=crop&w=600&q=80', 8, 180),
    (3, 2, 5, N'Chôm chôm Thái Chợ Lách', N'Chôm chôm Thái trái bầu dục râu dài xanh, cùi dày giòn tróc hạt vị ngọt thanh mát rượi.', 58000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=600&q=80', 8, 140),
    (1, 2, 1, N'Nhãn lồng Hưng Yên tiến vua', N'Nhãn lồng cùi dày ráo nước trắng ngần như ngọc bích, thơm ngát mùi hoa cúc vị ngọt thanh khiết.', 85000, N'kg', N'VietGAP', 1, N'Mộc Châu', 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=600&q=80', 10, 110),
    (3, 2, 5, N'Vú sữa Lò Rèn Vĩnh Kim', N'Vú sữa Lò Rèn vỏ mỏng bóng sáng, dòng sữa trắng ngọt lịm ngát hương thơm dịu mát.', 75000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=600&q=80', 8, 100),
    (3, 2, 5, N'Mít Thái siêu sớm múi giòn', N'Mít Thái múi vàng óng dày cùi, giòn sần sật ngọt đậm thơm nức mũi, xơ mít cũng ngọt lịm.', 45000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80', 12, 150),
    (1, 2, 2, N'Bơ sáp Đắk Lắk', N'Bơ sáp tròn đầy thịt vàng dẻo quánh béo ngậy như phô mai, xay sinh tố bổ dưỡng ngày hè.', 55000, N'kg', N'VietGAP', 1, N'Đà Lạt', 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=600&q=80', 10, 130),
    (1, 2, 2, N'Bơ 034 Lâm Đồng', N'Bơ 034 quả thon dài hạt lép kẹp, cơm dày dẻo thơm béo đậm đà, đặc sản số một xứ ngàn hoa.', 68000, N'kg', N'VietGAP', 1, N'Đà Lạt', 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=600&q=80', 12, 140),
    (1, 2, 1, N'Hồng giòn Fuyu Đà Lạt', N'Hồng giòn Fuyu giống Nhật Bản hái chín cây không cần giấm, thịt vàng giòn rụm ngọt lịm không chát.', 65000, N'kg', N'VietGAP', 1, N'Đà Lạt', 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=600&q=80', 15, 120),

    -- =========================================================================
    -- NHÓM 4: HẠT & ĐẬU & NGŨ CỐC (CategoryId = 4)
    -- =========================================================================
    -- A. Các loại đậu
    (1, 4, 1, N'Đậu xanh cà bóc vỏ', N'Đậu xanh bóc sạch vỏ hạt vàng tươi mẩy đều, nấu chè bà ba hoặc xôi vò mềm thơm bùi béo.', 65000, N'kg', N'VietGAP', 1, N'Mộc Châu', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', 180, 150),
    (1, 4, 2, N'Đậu đỏ hạt nhỏ Đà Lạt', N'Đậu đỏ hạt nhỏ vùng cao giàu sắt và chất xơ, món ngon truyền thống nấu chè đậu đỏ cầu duyên.', 68000, N'kg', N'VietGAP', 1, N'Đà Lạt', 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&w=600&q=80', 180, 130),
    (1, 4, 1, N'Đậu nành thuần chủng không GMO', N'Đậu nành giống bản địa Tây Bắc hạt mẩy tròn nhiều đạm, làm sữa đậu nành hoặc đậu hũ béo ngậy.', 45000, N'kg', N'USDA', 3, N'Mộc Châu', 'https://images.unsplash.com/photo-1509912760195-451e04c05877?auto=format&fit=crop&w=600&q=80', 180, 160),
    (1, 4, 2, N'Đậu trắng hạt to vùng cao', N'Đậu trắng hạt to mẩy căng mọng, nấu chè đậu trắng nước cốt dừa dẻo thơm nức tiếng.', 58000, N'kg', N'VietGAP', 1, N'Đà Lạt', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', 180, 110),

    -- B. Hạt dinh dưỡng & đặc sản
    (3, 4, 5, N'Hạt điều nhân trắng sấy khô', N'Hạt điều nhân trắng nguyên hạt loại W240 xuất khẩu, vị béo ngọt thanh thuần khiết không gia vị.', 260000, N'hộp', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1509912760195-451e04c05877?auto=format&fit=crop&w=600&q=80', 180, 120),
    (2, 4, 4, N'Hạt sen khô Huế tiến vua', N'Hạt sen khô giống sen ngự hồ Tịnh Tâm hạt nhỏ trắng ngà, ninh nhanh nhừ thơm bùi béo ngậy.', 220000, N'gói', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=600&q=80', 180, 100),
    (1, 4, 1, N'Hạt dẻ Trùng Khánh Cao Bằng', N'Hạt dẻ rừng Trùng Khánh vỏ nâu bóng, nướng thơm nức mũi ruột vàng ươm ngọt bùi béo bở.', 120000, N'kg', N'VietGAP', 1, N'Mộc Châu', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80', 60, 140),
    (2, 4, 4, N'Mè đen (Vừng đen) nguyên vỏ', N'Mè đen hạt chắc mẩy giàu canxi và vitamin E, bồi bổ sức khỏe dưỡng tóc đen mượt.', 85000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=600&q=80', 180, 130),

    -- C. Gạo & Ngũ cốc nguyên cám
    (2, 4, 4, N'Gạo ST25 Sóc Trăng', N'Gạo ST25 chuẩn thương hiệu ông Cua, hạt thon dài trắng trong, cơm dẻo mềm thơm mùi lá dứa tự nhiên.', 38000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', 180, 500),
    (1, 4, 1, N'Gạo lứt đỏ Điện Biên hữu cơ', N'Gạo lứt đỏ nương Điện Biên giàu chất xơ và vitamin nhóm B, hỗ trợ ăn kiêng tiểu đường dưỡng sinh.', 45000, N'kg', N'USDA', 3, N'Mộc Châu', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', 180, 300),
    (1, 4, 1, N'Ngô nếp (Bắp nếp) dẻo ngọt', N'Ngô nếp bản địa bắp chắc nịch hạt căng bóng, luộc dẻo quánh ngọt lịm thơm mùi ngô đồng quê.', 25000, N'bắp', N'VietGAP', 1, N'Mộc Châu', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80', 10, 160),
    (2, 4, 3, N'Ngô ngọt (Bắp Mỹ) giòn thơm', N'Bắp ngọt hạt vàng tươi giòn bọng nước ngọt lịm, dùng luộc ăn vặt nấu canh sườn hay làm sữa bắp.', 28000, N'bắp', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80', 10, 180),
    (1, 4, 2, N'Yến mạch nguyên hạt cán dẹt', N'Yến mạch nguyên cám giàu beta-glucan tốt cho tim mạch và tiêu hóa, bữa sáng lành mạnh hoàn hảo.', 85000, N'gói', N'USDA', 3, N'Đà Lạt', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', 365, 140);

    -- Duyệt qua từng sản phẩm để chèn vào Products, ProductImages, Batches, Inventories
    DECLARE @Index INT = 1;
    DECLARE @TotalCount INT = (SELECT COUNT(*) FROM #TempCompiledProducts);

    WHILE @Index <= @TotalCount
    BEGIN
        DECLARE @SuppId BIGINT, @CatId INT, @FmId BIGINT, @PName NVARCHAR(150), @Desc NVARCHAR(MAX);
        DECLARE @Pr DECIMAL(18,2), @Un NVARCHAR(20), @St NVARCHAR(20), @CId INT, @Reg NVARCHAR(50);
        DECLARE @Img VARCHAR(500), @Life INT, @Qty DECIMAL(18,2);
        DECLARE @NewProductId BIGINT, @NewBatchId BIGINT;
        DECLARE @BatchCode VARCHAR(50);

        SELECT 
            @SuppId = SupplierId,
            @CatId = CategoryId,
            @FmId = FarmId,
            @PName = ProductName,
            @Desc = Description,
            @Pr = Price,
            @Un = Unit,
            @St = Status,
            @CId = CertId,
            @Reg = Region,
            @Img = ImageUrl,
            @Life = ShelfLifeDays,
            @Qty = InitialQty
        FROM #TempCompiledProducts
        WHERE TempId = @Index;

        -- 1. Insert Products
        INSERT INTO Products (SupplierId, CategoryId, ProductName, Description, Price, Unit, Status, ApprovedBy, ApprovedAt, CreatedAt, UpdatedAt)
        VALUES (@SuppId, @CatId, @PName, @Desc, @Pr, @Un, @St, 1, GETDATE(), GETDATE(), GETDATE());

        SET @NewProductId = SCOPE_IDENTITY();

        -- 2. Insert ProductImages
        INSERT INTO ProductImages (ProductId, ImageUrl, IsPrimary, SortOrder)
        VALUES (@NewProductId, @Img, 1, 1);

        -- 3. Insert Batches
        SET @BatchCode = 'LOT-' + FORMAT(GETDATE(), 'yyMMdd') + '-' + RIGHT('000' + CAST(@NewProductId AS VARCHAR(10)), 3);

        INSERT INTO Batches (ProductId, FarmId, BatchCode, HarvestDate, ReceivedDate, ExpiryDate, InitialQuantity, Unit, Status, CreatedAt)
        VALUES (
            @NewProductId,
            @FmId,
            @BatchCode,
            DATEADD(DAY, -2, CAST(GETDATE() AS DATE)),
            GETDATE(),
            DATEADD(DAY, @Life, CAST(GETDATE() AS DATE)),
            @Qty,
            @Un,
            'Active',
            GETDATE()
        );

        SET @NewBatchId = SCOPE_IDENTITY();

        -- 4. Insert Inventories
        INSERT INTO Inventories (BatchId, QuantityOnHand, ReservedQuantity, ReorderLevel, UpdatedAt)
        VALUES (@NewBatchId, @Qty, 0, 10, GETDATE());

        -- 5. Insert Certifications
        IF @CId IS NOT NULL
        BEGIN
            INSERT INTO ProductCertifications (ProductId, CertificationId)
            VALUES (@NewProductId, @CId);
        END

        -- 6. Insert Seasons
        INSERT INTO ProductSeasons (ProductId, Region, StartMonth, EndMonth)
        VALUES (@NewProductId, @Reg, 1, 12);

        SET @Index = @Index + 1;
    END;

    DROP TABLE #TempCompiledProducts;

    COMMIT TRANSACTION;
    PRINT N'Đã nạp thành công toàn bộ sản phẩm bổ sung theo yêu cầu!';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
    DECLARE @ErrSeverity INT = ERROR_SEVERITY();
    DECLARE @ErrState INT = ERROR_STATE();
    RAISERROR(@ErrMsg, @ErrSeverity, @ErrState);
END CATCH;
GO
