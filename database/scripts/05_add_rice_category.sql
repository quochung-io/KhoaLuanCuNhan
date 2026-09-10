-- ==============================================================================
-- Script: Thêm danh mục "Gạo" và bổ sung các sản phẩm gạo đặc sản Việt Nam
-- ==============================================================================

USE QL_WebMuaBanNongSan;
GO

SET NOCOUNT ON;

BEGIN TRANSACTION;

BEGIN TRY
    -- 1. Thêm Category "Gạo" nếu chưa tồn tại
    DECLARE @RiceCatId INT;

    IF NOT EXISTS (SELECT 1 FROM Categories WHERE CategoryName = N'Gạo')
    BEGIN
        INSERT INTO Categories (CategoryName, ParentCategoryId, Status)
        VALUES (N'Gạo', NULL, 'Active');
        SET @RiceCatId = SCOPE_IDENTITY();
    END
    ELSE
    BEGIN
        SELECT @RiceCatId = CategoryId FROM Categories WHERE CategoryName = N'Gạo';
    END

    -- 2. Chuyển các sản phẩm gạo có sẵn (130, 131) sang danh mục "Gạo"
    UPDATE Products
    SET CategoryId = @RiceCatId
    WHERE ProductId IN (130, 131);

    -- 3. Bổ sung thêm các sản phẩm gạo đặc sản nổi tiếng Việt Nam
    CREATE TABLE #TempRiceProducts (
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

    INSERT INTO #TempRiceProducts
    (SupplierId, FarmId, ProductName, Description, Price, Unit, Status, CertId, Region, ImageUrl, ShelfLifeDays, InitialQty)
    VALUES
    (2, 3, N'Gạo Nàng Thơm Chợ Đào', N'Gạo Nàng Thơm Chợ Đào nức tiếng Long An, hạt thon dài bóng bẩy, khi nấu tỏa hương thơm ngát tự nhiên, cơm dẻo mềm ngọt vị.', 42000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', 180, 400),
    (1, 1, N'Gạo Séng Cù Mường Khương', N'Gạo Séng Cù vùng cao Tây Bắc hạt mẩy đều trắng trong, cơm dẻo đậm đà thơm bùi đặc trưng của thổ nhưỡng núi rừng.', 48000, N'kg', N'VietGAP', 1, N'Mộc Châu', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', 180, 350),
    (2, 4, N'Gạo lứt tím than Sóc Trăng', N'Gạo lứt tím than giàu anthocyanin và chất xơ hòa tan, vị bùi dẻo dễ ăn, thực phẩm vàng cho người ăn thực dưỡng.', 46000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', 180, 250),
    (1, 1, N'Gạo nếp cái hoa vàng Kinh Môn', N'Gạo nếp cái hoa vàng hạt tròn mẩy bóng bẩy, đồ xôi thơm lừng cả gian bếp, xôi dẻo quánh bùi béo để lâu không bị cứng.', 52000, N'kg', N'VietGAP', 1, N'Mộc Châu', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', 180, 300),
    (1, 1, N'Gạo nếp nương Điện Biên', N'Nếp nương Điện Biên hạt to tròn mẩy bóng như hạt ngọc, xôi nếp nương dẻo ngọt thơm lừng hương vị núi rừng Tây Bắc.', 55000, N'kg', N'VietGAP', 1, N'Mộc Châu', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', 180, 280),
    (2, 3, N'Gạo tấm thơm Sa Giang', N'Gạo tấm thơm từ hạt gạo gãy tự nhiên giàu phôi mầm, dẻo mềm đậm vị, chuyên dùng nấu món cơm tấm sườn bì chả.', 30000, N'kg', N'VietGAP', 1, N'Đồng Tháp', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', 180, 350);

    -- Duyệt và chèn vào Products, ProductImages, Batches, Inventories
    DECLARE @Index INT = 1;
    DECLARE @TotalCount INT = (SELECT COUNT(*) FROM #TempRiceProducts);

    WHILE @Index <= @TotalCount
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
        FROM #TempRiceProducts
        WHERE TempId = @Index;

        -- Insert Product với CategoryId = @RiceCatId (Gạo)
        INSERT INTO Products (SupplierId, CategoryId, ProductName, Description, Price, Unit, Status, ApprovedBy, ApprovedAt, CreatedAt, UpdatedAt)
        VALUES (@SuppId, @RiceCatId, @PName, @Desc, @Pr, @Un, @St, 1, GETDATE(), GETDATE(), GETDATE());

        SET @NewProductId = SCOPE_IDENTITY();

        -- Insert ProductImages
        INSERT INTO ProductImages (ProductId, ImageUrl, IsPrimary, SortOrder)
        VALUES (@NewProductId, @Img, 1, 1);

        -- Insert Batches
        SET @BatchCode = 'LOT-GAO-' + FORMAT(GETDATE(), 'yyMMdd') + '-' + RIGHT('000' + CAST(@NewProductId AS VARCHAR(10)), 3);

        INSERT INTO Batches (ProductId, FarmId, BatchCode, HarvestDate, ReceivedDate, ExpiryDate, InitialQuantity, Unit, Status, CreatedAt)
        VALUES (
            @NewProductId,
            @FmId,
            @BatchCode,
            DATEADD(DAY, -10, CAST(GETDATE() AS DATE)),
            GETDATE(),
            DATEADD(DAY, @Life, CAST(GETDATE() AS DATE)),
            @Qty,
            @Un,
            'Active',
            GETDATE()
        );

        SET @NewBatchId = SCOPE_IDENTITY();

        -- Insert Inventories
        INSERT INTO Inventories (BatchId, QuantityOnHand, ReservedQuantity, ReorderLevel, UpdatedAt)
        VALUES (@NewBatchId, @Qty, 0, 20, GETDATE());

        -- Insert Certifications
        IF @CId IS NOT NULL
        BEGIN
            INSERT INTO ProductCertifications (ProductId, CertificationId)
            VALUES (@NewProductId, @CId);
        END

        -- Insert Seasons
        INSERT INTO ProductSeasons (ProductId, Region, StartMonth, EndMonth)
        VALUES (@NewProductId, @Reg, 1, 12);

        SET @Index = @Index + 1;
    END;

    DROP TABLE #TempRiceProducts;

    COMMIT TRANSACTION;
    PRINT N'Đã thêm danh mục Gạo và các sản phẩm gạo đặc sản thành công!';
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
