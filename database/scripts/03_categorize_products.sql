-- ==============================================================================
-- Script: Phân loại toàn bộ sản phẩm thành 4 danh mục: Trái cây, Rau củ, Rau thơm, Hạt
-- Đồng bộ: Categories, Products, ProductImages, Batches, Inventories
-- ==============================================================================

USE QL_WebMuaBanNongSan;
GO

SET NOCOUNT ON;

BEGIN TRANSACTION;

BEGIN TRY
    -- 1. Chuẩn hóa 4 danh mục chính trong bảng Categories
    -- Xóa liên kết ParentCategoryId trước để tránh lỗi FK
    UPDATE Categories SET ParentCategoryId = NULL;

    -- Cập nhật tên các Category 1, 2, 3, 4
    UPDATE Categories SET CategoryName = N'Rau củ', Status = 'Active' WHERE CategoryId = 1;
    UPDATE Categories SET CategoryName = N'Trái cây', Status = 'Active' WHERE CategoryId = 2;
    UPDATE Categories SET CategoryName = N'Rau thơm', Status = 'Active' WHERE CategoryId = 3;
    UPDATE Categories SET CategoryName = N'Hạt', Status = 'Active' WHERE CategoryId = 4;

    -- 2. Cập nhật CategoryId cho 62 sản phẩm hiện tại vào 3 nhóm (Rau củ, Trái cây, Rau thơm)
    -- Nhóm Rau củ (CategoryId = 1):
    UPDATE Products 
    SET CategoryId = 1 
    WHERE ProductId IN (
        1, 2, 3, 5, 6, 8, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 49, 50, 55, 56, 57, 58
    );

    -- Nhóm Trái cây (CategoryId = 2):
    UPDATE Products 
    SET CategoryId = 2 
    WHERE ProductId IN (
        4, 9, 10, 11, 12, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 51, 52, 53, 54
    );

    -- Nhóm Rau thơm (CategoryId = 3):
    UPDATE Products 
    SET CategoryId = 3 
    WHERE ProductId IN (
        7, 20, 59, 60, 61, 62
    );

    -- 3. Xóa các danh mục cũ không còn dùng (5, 6, 7, 8, 9)
    DELETE FROM Categories WHERE CategoryId IN (5, 6, 7, 8, 9);

    -- 4. Bổ sung 8 sản phẩm cho nhóm Hạt (CategoryId = 4)
    CREATE TABLE #TempNuts (
        TempId INT IDENTITY(1,1) PRIMARY KEY,
        SupplierId BIGINT,
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

    INSERT INTO #TempNuts 
    (SupplierId, FarmId, ProductName, Description, Price, Unit, Status, CertId, Region, ImageUrl, ShelfLifeDays, InitialQty)
    VALUES
    (3, 5, N'Hạt điều rang muối Bình Phước', N'Hạt điều loại 1 hạt mẩy căng tròn, rang củi thủ công giữ trọn vị giòn rụm béo ngậy đậm đà.', 240000, N'hộp', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1509912760195-451e04c05877?auto=format&fit=crop&w=600&q=80', 180, 150),
    (2, 4, N'Hạt sen tươi sấy giòn Đồng Tháp', N'Hạt sen tươi hồ Tháp Mười sấy thăng hoa giòn tan, vị bùi béo tự nhiên, bổ tâm an thần ngủ ngon.', 180000, N'hộp', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=600&q=80', 120, 120),
    (1, 1, N'Hạt macca nứt vỏ Lâm Đồng', N'Nữ hoàng hạt dinh dưỡng vỏ nứt tự nhiên dễ bóc, nhân trắng ngần ngọt thanh béo bùi giàu Omega-3.', 195000, N'hộp', N'USDA', 3, N'Đà Lạt', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80', 180, 100),
    (2, 3, N'Đậu phộng sẻ Củ Chi', N'Đậu phộng giống sẻ hạt nhỏ chắc mẩy nhiều dầu, vị thơm bùi đặc trưng, dùng nấu chè hay rang muối.', 45000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1567892323021-4d33458bfb7f?auto=format&fit=crop&w=600&q=80', 90, 200),
    (1, 1, N'Đậu xanh hạt tiêu sẻ Tây Bắc', N'Đậu xanh hạt tiêu lòng xanh đậm hạt nhỏ thơm, nấu chè giải nhiệt hoặc làm giá đỗ ngọt giòn.', 55000, N'kg', N'VietGAP', 1, N'Mộc Châu', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', 180, 220),
    (1, 1, N'Đậu đen xanh lòng Tây Bắc', N'Đậu đen xanh lòng hạt đều tăm tắp mẩy chắc, giàu anthocyanin giúp thanh lọc cơ thể và bổ thận.', 60000, N'kg', N'VietGAP', 1, N'Mộc Châu', 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&w=600&q=80', 180, 180),
    (2, 4, N'Hạt mè vàng tự nhiên (Vừng)', N'Mè vàng giống bản địa thơm nức mũi khi rang chín, cung cấp canxi và chất béo thực vật quý giá.', 70000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=600&q=80', 180, 160),
    (1, 2, N'Hạt chia hữu cơ tự nhiên', N'Hạt chia giàu chất xơ hòa tan và Omega-3, hỗ trợ giảm cân kiểm soát đường huyết và làm đẹp da.', 120000, N'gói', N'USDA', 3, N'Đà Lạt', 'https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&w=600&q=80', 365, 140);

    DECLARE @NutId INT = 1;
    DECLARE @MaxNutId INT = (SELECT COUNT(*) FROM #TempNuts);

    WHILE @NutId <= @MaxNutId
    BEGIN
        DECLARE @SuppId BIGINT, @FmId BIGINT, @PName NVARCHAR(150), @Desc NVARCHAR(MAX);
        DECLARE @Pr DECIMAL(18,2), @Un NVARCHAR(20), @St NVARCHAR(20), @CId INT, @Reg NVARCHAR(50);
        DECLARE @Img VARCHAR(500), @Life INT, @Qty DECIMAL(18,2);
        DECLARE @NewProductId BIGINT, @NewBatchId BIGINT;
        DECLARE @BatchCode VARCHAR(50);

        SELECT 
            @SuppId = SupplierId,
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
        FROM #TempNuts
        WHERE TempId = @NutId;

        -- Thêm vào Products với CategoryId = 4 (Hạt)
        INSERT INTO Products (SupplierId, CategoryId, ProductName, Description, Price, Unit, Status, ApprovedBy, ApprovedAt, CreatedAt, UpdatedAt)
        VALUES (@SuppId, 4, @PName, @Desc, @Pr, @Un, @St, 1, GETDATE(), GETDATE(), GETDATE());

        SET @NewProductId = SCOPE_IDENTITY();

        -- Thêm vào ProductImages
        INSERT INTO ProductImages (ProductId, ImageUrl, IsPrimary, SortOrder)
        VALUES (@NewProductId, @Img, 1, 1);

        -- Thêm vào Batches
        SET @BatchCode = 'LOT-HAT-' + FORMAT(GETDATE(), 'yyMMdd') + '-' + RIGHT('000' + CAST(@NewProductId AS VARCHAR(10)), 3);

        INSERT INTO Batches (ProductId, FarmId, BatchCode, HarvestDate, ReceivedDate, ExpiryDate, InitialQuantity, Unit, Status, CreatedAt)
        VALUES (
            @NewProductId,
            @FmId,
            @BatchCode,
            DATEADD(DAY, -5, CAST(GETDATE() AS DATE)),
            GETDATE(),
            DATEADD(DAY, @Life, CAST(GETDATE() AS DATE)),
            @Qty,
            @Un,
            'Active',
            GETDATE()
        );

        SET @NewBatchId = SCOPE_IDENTITY();

        -- Thêm vào Inventories
        INSERT INTO Inventories (BatchId, QuantityOnHand, ReservedQuantity, ReorderLevel, UpdatedAt)
        VALUES (@NewBatchId, @Qty, 0, 10, GETDATE());

        -- Thêm chứng nhận
        IF @CId IS NOT NULL
        BEGIN
            INSERT INTO ProductCertifications (ProductId, CertificationId)
            VALUES (@NewProductId, @CId);
        END

        -- Thêm mùa vụ
        INSERT INTO ProductSeasons (ProductId, Region, StartMonth, EndMonth)
        VALUES (@NewProductId, @Reg, 1, 12);

        SET @NutId = @NutId + 1;
    END;

    DROP TABLE #TempNuts;

    COMMIT TRANSACTION;
    PRINT N'Phân loại thành công 4 danh mục: Trái cây, Rau củ, Rau thơm, Hạt!';
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
