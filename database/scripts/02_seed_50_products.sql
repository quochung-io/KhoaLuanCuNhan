-- ==============================================================================
-- Seed script: Thêm 50 loại nông sản ngẫu nhiên và đa dạng vào CSDL QL_WebMuaBanNongSan
-- Đồng bộ: Products, ProductImages, Batches (FEFO), Inventories, ProductCertifications, ProductSeasons
-- ==============================================================================

USE QL_WebMuaBanNongSan;
GO

SET NOCOUNT ON;

BEGIN TRANSACTION;

BEGIN TRY
    -- Bảng tạm chứa thông tin 50 nông sản
    CREATE TABLE #Temp50Products (
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

    INSERT INTO #Temp50Products 
    (SupplierId, CategoryId, FarmId, ProductName, Description, Price, Unit, Status, CertId, Region, ImageUrl, ShelfLifeDays, InitialQty)
    VALUES
    -- 1 -> 10: Rau ăn lá
    (1, 4, 1, N'Cải thìa hữu cơ Đà Lạt', N'Cải thìa bẹ trắng xanh tươi mát, giòn ngọt, giàu vitamin C và chất xơ, trồng theo tiêu chuẩn hữu cơ.', 35000, N'kg', N'VietGAP', 1, N'Đà Lạt', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80', 7, 120),
    (1, 4, 2, N'Bắp cải tím Đà Lạt', N'Bắp cải tím giòn ngọt, búp chắc nịch, giàu anthocyanin chống oxy hóa, thích hợp làm salad.', 42000, N'bắp', N'USDA', 3, N'Đà Lạt', 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=600&q=80', 14, 85),
    (2, 4, 3, N'Cải ngọt VietGAP', N'Cải ngọt thân mập, lá xanh mướt, vị ngọt tự nhiên, rất thích hợp nấu canh thịt bằm hoặc xào tỏi.', 28000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80', 7, 150),
    (1, 4, 1, N'Cải ngồng Mộc Châu', N'Cải ngồng tươi non hái từ cao nguyên Mộc Châu, ngọn mập mạp xào giòn ngọt đậm đà.', 38000, N'kg', N'VietGAP', 1, N'Mộc Châu', 'https://images.unsplash.com/photo-1524179091875-bf99a9a6af57?auto=format&fit=crop&w=600&q=80', 8, 90),
    (2, 4, 3, N'Rau dền đỏ Miền Tây', N'Rau dền đỏ lá tía mọng nước, vị ngọt thanh, tính mát, thanh nhiệt giải độc ngày hè.', 25000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=600&q=80', 6, 110),
    (2, 4, 4, N'Rau mồng tơi vườn', N'Rau mồng tơi sạch tự nhiên, ngọn mập búp xanh, nấu canh cua đồng thơm ngon nức tiếng.', 24000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?auto=format&fit=crop&w=600&q=80', 6, 130),
    (1, 4, 1, N'Xà lách Romaine hữu cơ', N'Xà lách Romaine lá dài giòn ngọt, chuyên dùng cho món salad Caesar chuẩn vị Âu.', 52000, N'kg', N'USDA', 3, N'Đà Lạt', 'https://images.unsplash.com/photo-1556801712-76c8eb07bbc9?auto=format&fit=crop&w=600&q=80', 10, 75),
    (2, 4, 3, N'Rau càng cua tự nhiên', N'Rau càng cua giòn rụm, vị hơi chua thanh dịu, trộn gỏi thịt bò chua ngọt tuyệt hảo.', 48000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80', 5, 60),
    (1, 4, 2, N'Rau ngót Nhật sạch', N'Rau ngót Nhật mềm mát, giàu đạm thực vật và khoáng chất, an toàn cho bé ăn dặm.', 35000, N'kg', N'VietGAP', 1, N'Đà Lạt', 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80', 7, 80),
    (1, 4, 1, N'Đọt bí non Mộc Châu', N'Đọt bí ngô non tơ, cọng giòn bùi, hoa bí ngọt dịu, xào tỏi hay luộc chấm kho quẹt đều ngon.', 45000, N'kg', N'VietGAP', 1, N'Mộc Châu', 'https://images.unsplash.com/photo-1592417817098-8f3d69109853?auto=format&fit=crop&w=600&q=80', 6, 70),

    -- 11 -> 20: Rau củ & Quả ăn quả
    (1, 1, 1, N'Bông cải xanh Đà Lạt', N'Bông cải súp lơ xanh búp khít chắc nịch, giàu sulforaphane phòng ngừa ung thư và tim mạch.', 62000, N'kg', N'VietGAP', 1, N'Đà Lạt', 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=600&q=80', 12, 95),
    (1, 1, 2, N'Củ dền đỏ Đà Lạt', N'Củ dền đỏ mọng nước ruột thẫm, dùng ép nước detox hoặc hầm súp bổ máu.', 42000, N'kg', N'VietGAP', 1, N'Đà Lạt', 'https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?auto=format&fit=crop&w=600&q=80', 20, 140),
    (2, 1, 4, N'Bí đỏ hồ lô Hưng Yên', N'Bí hồ lô thịt vàng cam sánh mịn, vị bùi dẻo béo ngậy, nấu chè hay hầm canh sườn đều tuyệt.', 32000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?auto=format&fit=crop&w=600&q=80', 45, 180),
    (2, 1, 3, N'Bầu sao Miền Tây', N'Trái bầu sao thon dài vỏ xanh lốm đốm, ruột non ngọt mát, nấu canh hến hoặc luộc ăn nóng.', 22000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1582515073490-39981397c445?auto=format&fit=crop&w=600&q=80', 12, 160),
    (2, 1, 3, N'Mướp hương đồng quê', N'Mướp hương thơm ngát đặc trưng khi nấu chín, vỏ mỏng ruột mềm ngọt, ăn rất thanh.', 28000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=600&q=80', 10, 130),
    (1, 1, 2, N'Khổ qua rừng Đắk Lắk', N'Khổ qua rừng trái nhỏ gai nhọn, đắng dịu hậu ngọt sâu, dược tính cao giúp hạ đường huyết.', 58000, N'kg', N'USDA', 3, N'Đà Lạt', 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80', 12, 70),
    (2, 1, 4, N'Đậu bắp baby xanh', N'Đậu bắp trái non không xơ, luộc chấm chao hay nướng mỡ hành giòn sần sật bổ khớp.', 35000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?auto=format&fit=crop&w=600&q=80', 8, 110),
    (1, 1, 1, N'Su hào Mộc Châu', N'Su hào Mộc Châu củ căng tròn, vị ngọt đậm không xơ, luộc hay xào mực đều giòn ngon.', 32000, N'kg', N'VietGAP', 1, N'Mộc Châu', 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&w=600&q=80', 20, 150),
    (1, 1, 2, N'Củ cải trắng hữu cơ', N'Củ cải trắng Đà Lạt củ thon dài mọng nước, vị ngọt thanh mát được ví như nhân sâm mùa đông.', 26000, N'kg', N'VietGAP', 1, N'Đà Lạt', 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80', 18, 170),
    (1, 1, 2, N'Khoai lang mật Đà Lạt', N'Khoai lang mật trồng vùng đất đỏ bazan, khi nướng chảy mật vàng ươm, ngọt lịm thơm phức.', 48000, N'kg', N'VietGAP', 1, N'Đà Lạt', 'https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?auto=format&fit=crop&w=600&q=80', 35, 200),

    -- 21 -> 32: Trái cây & Trái cây nhiệt đới
    (3, 9, 5, N'Sầu riêng Ri6 Bến Tre', N'Sầu riêng Ri6 cơm vàng hạt lép, múi khô ráo dày cùi, vị béo ngậy đậm đà thơm nức.', 135000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?auto=format&fit=crop&w=600&q=80', 7, 250),
    (3, 8, 5, N'Bưởi da xanh Ruột Hồng Bến Tre', N'Bưởi da xanh vỏ mỏng mọng nước, múi hồng tép giòn tan không hạt, vị ngọt thanh tao.', 85000, N'quả', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?auto=format&fit=crop&w=600&q=80', 30, 180),
    (3, 9, 5, N'Măng cụt Lái Thiêu', N'Nữ hoàng trái cây vỏ tím thẫm mỏng, múi trắng muốt ngọt thanh dịu dàng, ăn giải nhiệt cực tốt.', 95000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=600&q=80', 10, 120),
    (3, 9, 5, N'Chôm chôm nhãn Tiền Giang', N'Chôm chôm nhãn râu ngắn trái tròn, cơm khô róc hạt, vị ngọt đậm giòn tan cuốn hút.', 48000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=600&q=80', 8, 160),
    (1, 2, 1, N'Mận hậu Bắc Hà', N'Mận hậu quả to phủ phấn trắng, vỏ xanh đỏ giòn tan rôm rốp, chấm muối ớt Tây Bắc ngon khó cưỡng.', 75000, N'kg', N'VietGAP', 1, N'Mộc Châu', 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=600&q=80', 14, 140),
    (3, 9, 5, N'Nhãn xuồng cơm vàng Vũng Tàu', N'Nhãn xuồng vỏ vàng sáng, cùi dày giòn sần sật mọng nước, hương thơm thanh khiết đặc trưng.', 68000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=600&q=80', 10, 130),
    (2, 2, 4, N'Đu đủ ruột đỏ tự nhiên', N'Đu đủ giống ruột đỏ tự nhiên, thịt dẻo ngọt lịm không hạt, giàu vitamin A và enzyme tiêu hóa papain.', 28000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?auto=format&fit=crop&w=600&q=80', 12, 150),
    (1, 2, 1, N'Dưa lưới Taki Nhật Bản', N'Dưa lưới vân nổi sắc nét trồng nhà màng công nghệ cao, ruột cam giòn rụm thơm mùi sữa.', 65000, N'kg', N'VietGAP', 1, N'Đà Lạt', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80', 20, 110),
    (2, 2, 3, N'Chuối ngự Đại Hoàng', N'Chuối ngự tiến vua quả nhỏ vỏ mỏng vàng ruộm, ruột vàng cam thơm ngát vị ngọt thanh tao.', 45000, N'nải', N'VietGAP', 1, N'Mộc Châu', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80', 10, 90),
    (1, 2, 1, N'Vải thiều Lục Ngạn', N'Vải thiều chín đỏ cành, gai nhẵn cùi dày hạt nhỏ như hạt đậu, nước ngọt lịm thơm mát.', 78000, N'kg', N'VietGAP', 1, N'Mộc Châu', 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=600&q=80', 8, 140),
    (1, 2, 1, N'Na dai Đồng Mỏ Chi Lăng', N'Na dai núi đá mắt to phẳng, thịt dai trắng ngần, ít hạt vị ngọt sắc thơm ngát hương rừng.', 85000, N'kg', N'VietGAP', 1, N'Mộc Châu', 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=600&q=80', 7, 100),
    (3, 9, 5, N'Mít tố nữ Miền Tây', N'Mít tố nữ trái nhỏ múi vàng óng bám dính cùi lõi, hương thơm nồng nàn vị ngọt lịm béo ngậy.', 55000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80', 10, 120),

    -- 33 -> 36: Cam quýt
    (3, 8, 5, N'Quýt hồng Lai Vung', N'Quýt hồng vỏ màu cam đỏ óng ả, mọng nước tép ngọt thanh ít hạt, đặc sản nức tiếng xứ Đồng Tháp.', 68000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1557800636-894a64c1696f?auto=format&fit=crop&w=600&q=80', 15, 140),
    (2, 8, 3, N'Chanh không hạt Long An', N'Chanh không hạt vỏ mỏng xanh bóng, siêu nhiều nước thơm gắt, không bị đắng khi vắt.', 35000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1533082608670-3157a55fb120?auto=format&fit=crop&w=600&q=80', 25, 160),
    (3, 8, 5, N'Tắc sành Bến Tre (Quất tươi)', N'Trái tắc sành vỏ tinh dầu thơm lừng, dùng pha nước giải khát thanh nhiệt hoặc ngâm mật ong trị ho.', 32000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=600&q=80', 20, 100),
    (1, 8, 1, N'Cam sành Hàm Yên', N'Cam sành Hàm Yên vỏ sần sùi cùi dày tép vàng cam, nước ngọt thanh đậm đà bổ sung năng lượng.', 45000, N'kg', N'VietGAP', 1, N'Mộc Châu', 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=600&q=80', 18, 170),

    -- 37 -> 42: Cà chua & Quả mọng / Dâu
    (1, 5, 1, N'Cà chua socola Đà Lạt', N'Cà chua socola màu nâu tím độc đáo, độ ngọt brix cao vượt trội, giòn ngọt như trái cây ăn vặt.', 75000, N'hộp', N'USDA', 3, N'Đà Lạt', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80', 12, 80),
    (1, 5, 2, N'Cà chua beef hữu cơ', N'Cà chua beef trái to chắc thịt, cùi dày ít hạt, chuyên dùng làm sốt mì Ý hoặc kẹp burger chuẩn vị.', 48000, N'kg', N'VietGAP', 1, N'Đà Lạt', 'https://images.unsplash.com/photo-1561136594-7f68413baa99?auto=format&fit=crop&w=600&q=80', 14, 110),
    (1, 7, 1, N'Việt quất tươi Đà Lạt', N'Việt quất trái căng mọng phủ lớp phấn tự nhiên, vị chua ngọt hài hòa giàu chất chống oxy hóa bảo vệ mắt.', 160000, N'hộp', N'USDA', 3, N'Đà Lạt', 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=600&q=80', 10, 50),
    (1, 7, 2, N'Phúc bồn tử đen (Mâm xôi)', N'Phúc bồn tử mâm xôi đen thu hoạch từ nhà kính hữu cơ Đà Lạt, vị thơm quyến rũ bổ dưỡng cho tim mạch.', 155000, N'hộp', N'USDA', 3, N'Đà Lạt', 'https://images.unsplash.com/photo-1577069808021-72944b7d5268?auto=format&fit=crop&w=600&q=80', 8, 45),
    (1, 7, 1, N'Dâu tằm tươi Đà Lạt', N'Dâu tằm chín mọng tím sẫm, vị chua ngọt dịu, dùng ngâm siro nước mát hoặc làm rượu dâu tuyệt ngon.', 62000, N'kg', N'VietGAP', 1, N'Đà Lạt', 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?auto=format&fit=crop&w=600&q=80', 7, 65),
    (3, 7, 6, N'Nho xanh Ninh Thuận', N'Nho xanh NH01-48 chùm khít trái bầu dục, thịt giòn rụm vị ngọt thanh pha chua nhẹ tự nhiên.', 85000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=600&q=80', 15, 120),

    -- 43 -> 46: Nấm tươi
    (1, 3, 2, N'Nấm mối đen hữu cơ', N'Nấm mối đen thân chắc giòn sần sật, vị ngọt đậm như thịt gà, giàu hoạt chất sinh học bồi bổ sức khỏe.', 125000, N'hộp', N'USDA', 3, N'Đà Lạt', 'https://images.unsplash.com/photo-1504472478235-9bc48ba4d60f?auto=format&fit=crop&w=600&q=80', 10, 60),
    (1, 3, 1, N'Nấm hoàng kim tươi', N'Nấm hoàng kim màu vàng tươi rực rỡ, thịt nấm mềm dai thơm mùi hạt điều bùi bùi.', 55000, N'hộp', N'VietGAP', 1, N'Đà Lạt', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80', 7, 70),
    (1, 3, 2, N'Nấm kim châm sạch', N'Nấm kim châm sợi dài trắng muốt, giòn ngọt thanh tao, chuyên dùng cho các món lẩu và nướng cuộn thịt bò.', 28000, N'gói', N'VietGAP', 1, N'Đà Lạt', 'https://images.unsplash.com/photo-1518736114810-3f3bf3666688?auto=format&fit=crop&w=600&q=80', 12, 150),
    (1, 3, 1, N'Nấm hương tươi Sapa', N'Nấm hương tươi nuôi trồng trên thân gỗ tự nhiên xứ lạnh, mũ dày thơm nức mũi khi nấu canh xào.', 92000, N'hộp', N'VietGAP', 1, N'Mộc Châu', 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80', 10, 85),

    -- 47 -> 50: Rau gia vị & Thảo mộc
    (2, 6, 3, N'Hành lá tươi gốc to', N'Hành lá gốc trắng nõn nà, thân xanh mỡ màng thơm cay nồng ấm, gia vị không thể thiếu trong mọi gian bếp.', 35000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=600&q=80', 10, 100),
    (2, 6, 4, N'Húng quế thơm hữu cơ', N'Húng quế lá xanh rì tinh dầu thơm nồng đậm đà, ăn kèm phở, bún bò hay các món nướng cực kỳ dậy vị.', 38000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=600&q=80', 7, 80),
    (1, 6, 1, N'Gừng sẻ đồi Tây Bắc', N'Gừng sẻ củ nhỏ cay nồng thơm ấm, thịt vàng ươm nhiều tinh dầu, giải cảm ấm tỳ vị rất tốt.', 65000, N'kg', N'VietGAP', 1, N'Mộc Châu', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80', 60, 120),
    (2, 6, 3, N'Sả chanh củ tươi', N'Sả chanh củ mập mạp gốc tím nhạt, hương thơm tinh dầu the mát sảng khoái, gia vị ướp kho xào tuyệt đỉnh.', 26000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80', 25, 140);

    -- Duyệt qua từng sản phẩm để chèn vào Products, ProductImages, Batches, Inventories, ProductCertifications, ProductSeasons
    DECLARE @TempId INT = 1;
    DECLARE @MaxTempId INT = (SELECT COUNT(*) FROM #Temp50Products);

    WHILE @TempId <= @MaxTempId
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
        FROM #Temp50Products
        WHERE TempId = @TempId;

        -- 1. Chèn vào bảng Products
        INSERT INTO Products (SupplierId, CategoryId, ProductName, Description, Price, Unit, Status, ApprovedBy, ApprovedAt, CreatedAt, UpdatedAt)
        VALUES (@SuppId, @CatId, @PName, @Desc, @Pr, @Un, @St, 1, GETDATE(), GETDATE(), GETDATE());

        SET @NewProductId = SCOPE_IDENTITY();

        -- 2. Chèn vào bảng ProductImages
        INSERT INTO ProductImages (ProductId, ImageUrl, IsPrimary, SortOrder)
        VALUES (@NewProductId, @Img, 1, 1);

        -- 3. Tạo Batch tương ứng cho sản phẩm (FEFO)
        SET @BatchCode = 'LOT-' + FORMAT(GETDATE(), 'yyMMdd') + '-' + RIGHT('000' + CAST(@NewProductId AS VARCHAR(10)), 3);
        
        INSERT INTO Batches (ProductId, FarmId, BatchCode, HarvestDate, ReceivedDate, ExpiryDate, InitialQuantity, Unit, Status, CreatedAt)
        VALUES (
            @NewProductId,
            @FmId,
            @BatchCode,
            DATEADD(DAY, -1, CAST(GETDATE() AS DATE)),
            GETDATE(),
            DATEADD(DAY, @Life, CAST(GETDATE() AS DATE)),
            @Qty,
            @Un,
            'Active',
            GETDATE()
        );

        SET @NewBatchId = SCOPE_IDENTITY();

        -- 4. Chèn vào bảng Inventories
        INSERT INTO Inventories (BatchId, QuantityOnHand, ReservedQuantity, ReorderLevel, UpdatedAt)
        VALUES (@NewBatchId, @Qty, 0, 10, GETDATE());

        -- 5. Chèn chứng nhận vào ProductCertifications nếu có
        IF @CId IS NOT NULL
        BEGIN
            INSERT INTO ProductCertifications (ProductId, CertificationId)
            VALUES (@NewProductId, @CId);
        END

        -- 6. Chèn thông tin mùa vụ vào ProductSeasons
        INSERT INTO ProductSeasons (ProductId, Region, StartMonth, EndMonth)
        VALUES (@NewProductId, @Reg, 1, 12);

        SET @TempId = @TempId + 1;
    END;

    DROP TABLE #Temp50Products;

    COMMIT TRANSACTION;
    PRINT N'Đã thêm thành công 50 loại nông sản vào CSDL QL_WebMuaBanNongSan!';
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
