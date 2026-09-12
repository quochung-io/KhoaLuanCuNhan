-- ==============================================================================
-- FULL DATABASE BACKUP SCRIPT: QL_WebMuaBanNongSan
-- Generated at: 2026-09-11 11:59:38
-- Bao gom: Schema (DDL) day du 31 bang va Du lieu thuc te (Data) toan bo he thong
-- ==============================================================================

USE master;
GO
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'QL_WebMuaBanNongSan')
BEGIN
    CREATE DATABASE [QL_WebMuaBanNongSan] COLLATE SQL_Latin1_General_CP1_CI_AS;
END;
GO
USE [QL_WebMuaBanNongSan];
GO

-- Tat constraint de tao va nap du lieu an toan
EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT all';
GO

-- -------------------------------------------------------------
-- Table: [dbo].[Addresses]
-- -------------------------------------------------------------
IF OBJECT_ID('[dbo].[Addresses]', 'U') IS NULL
BEGIN
SET ANSI_NULLS ON
SET QUOTED_IDENTIFIER ON
SET ANSI_PADDING ON
CREATE TABLE [dbo].[Addresses](
	[AddressId] [bigint] IDENTITY(1,1) NOT NULL,
	[UserId] [bigint] NOT NULL,
	[ReceiverName] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Phone] [varchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Province] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[District] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Ward] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[AddressDetail] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Latitude] [decimal](10, 8) NULL,
	[Longitude] [decimal](11, 8) NULL,
	[IsDefault] [bit] NULL,
	[AddressType] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
PRIMARY KEY CLUSTERED 
(
	[AddressId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

SET ANSI_PADDING OFF
ALTER TABLE [dbo].[Addresses] ADD  DEFAULT ((0)) FOR [IsDefault]
ALTER TABLE [dbo].[Addresses]  WITH CHECK ADD  CONSTRAINT [FK_Addresses_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
ON DELETE CASCADE
ALTER TABLE [dbo].[Addresses] CHECK CONSTRAINT [FK_Addresses_Users]
END;
GO

-- -------------------------------------------------------------
-- Table: [dbo].[AuditLogs]
-- -------------------------------------------------------------
IF OBJECT_ID('[dbo].[AuditLogs]', 'U') IS NULL
BEGIN
SET ANSI_NULLS ON
SET QUOTED_IDENTIFIER ON
CREATE TABLE [dbo].[AuditLogs](
	[AuditLogId] [bigint] IDENTITY(1,1) NOT NULL,
	[UserId] [bigint] NOT NULL,
	[Action] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[TableName] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[RecordId] [bigint] NOT NULL,
	[OldValue] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[NewValue] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[CreatedAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[AuditLogId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

ALTER TABLE [dbo].[AuditLogs] ADD  DEFAULT (getdate()) FOR [CreatedAt]
ALTER TABLE [dbo].[AuditLogs]  WITH CHECK ADD  CONSTRAINT [FK_AuditLogs_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
ON DELETE CASCADE
ALTER TABLE [dbo].[AuditLogs] CHECK CONSTRAINT [FK_AuditLogs_Users]
END;
GO

-- -------------------------------------------------------------
-- Table: [dbo].[Batches]
-- -------------------------------------------------------------
IF OBJECT_ID('[dbo].[Batches]', 'U') IS NULL
BEGIN
SET ANSI_NULLS ON
SET QUOTED_IDENTIFIER ON
SET ANSI_PADDING ON
CREATE TABLE [dbo].[Batches](
	[BatchId] [bigint] IDENTITY(1,1) NOT NULL,
	[ProductId] [bigint] NOT NULL,
	[FarmId] [bigint] NOT NULL,
	[BatchCode] [varchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[HarvestDate] [datetime2](7) NOT NULL,
	[ReceivedDate] [datetime2](7) NULL,
	[ExpiryDate] [datetime2](7) NOT NULL,
	[InitialQuantity] [decimal](10, 2) NOT NULL,
	[Unit] [nvarchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Status] [nvarchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[CreatedAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[BatchId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[BatchCode] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

SET ANSI_PADDING OFF
ALTER TABLE [dbo].[Batches] ADD  DEFAULT (getdate()) FOR [ReceivedDate]
ALTER TABLE [dbo].[Batches] ADD  DEFAULT ((0.00)) FOR [InitialQuantity]
ALTER TABLE [dbo].[Batches] ADD  DEFAULT ('Active') FOR [Status]
ALTER TABLE [dbo].[Batches] ADD  DEFAULT (getdate()) FOR [CreatedAt]
ALTER TABLE [dbo].[Batches]  WITH CHECK ADD  CONSTRAINT [FK_Batches_Farms] FOREIGN KEY([FarmId])
REFERENCES [dbo].[Farms] ([FarmId])
ALTER TABLE [dbo].[Batches] CHECK CONSTRAINT [FK_Batches_Farms]
ALTER TABLE [dbo].[Batches]  WITH CHECK ADD  CONSTRAINT [FK_Batches_Products] FOREIGN KEY([ProductId])
REFERENCES [dbo].[Products] ([ProductId])
ALTER TABLE [dbo].[Batches] CHECK CONSTRAINT [FK_Batches_Products]
SET ANSI_NULLS ON
SET QUOTED_IDENTIFIER ON

-- =============================================================================
-- DATABASE TRIGGERS (RÀNG BUỘC LOGIC NGHIỆP VỤ)
-- =============================================================================

-- Đảm bảo Sản phẩm và Nông trại thu hoạch của một lô hàng thuộc về cùng một Nhà cung cấp
CREATE TRIGGER trg_CheckBatchSupplier
ON Batches
AFTER INSERT, UPDATE
AS
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM inserted i
        JOIN Products p ON i.ProductId = p.ProductId
        JOIN Farms f ON i.FarmId = f.FarmId
        WHERE p.SupplierId <> f.SupplierId
    )
    BEGIN
        RAISERROR (N'Lỗi hệ thống: Sản phẩm và Nông trại thu hoạch của lô hàng phải thuộc về cùng một Nhà cung cấp!', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;

ALTER TABLE [dbo].[Batches] ENABLE TRIGGER [trg_CheckBatchSupplier]
END;
GO

-- -------------------------------------------------------------
-- Table: [dbo].[CartItems]
-- -------------------------------------------------------------
IF OBJECT_ID('[dbo].[CartItems]', 'U') IS NULL
BEGIN
SET ANSI_NULLS ON
SET QUOTED_IDENTIFIER ON
CREATE TABLE [dbo].[CartItems](
	[CartItemId] [bigint] IDENTITY(1,1) NOT NULL,
	[CartId] [bigint] NOT NULL,
	[ProductId] [bigint] NOT NULL,
	[Quantity] [decimal](10, 2) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[CartItemId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

ALTER TABLE [dbo].[CartItems] ADD  DEFAULT ((1.00)) FOR [Quantity]
ALTER TABLE [dbo].[CartItems]  WITH CHECK ADD  CONSTRAINT [FK_CartItems_Carts] FOREIGN KEY([CartId])
REFERENCES [dbo].[Carts] ([CartId])
ON DELETE CASCADE
ALTER TABLE [dbo].[CartItems] CHECK CONSTRAINT [FK_CartItems_Carts]
ALTER TABLE [dbo].[CartItems]  WITH CHECK ADD  CONSTRAINT [FK_CartItems_Products] FOREIGN KEY([ProductId])
REFERENCES [dbo].[Products] ([ProductId])
ALTER TABLE [dbo].[CartItems] CHECK CONSTRAINT [FK_CartItems_Products]
END;
GO

-- -------------------------------------------------------------
-- Table: [dbo].[Carts]
-- -------------------------------------------------------------
IF OBJECT_ID('[dbo].[Carts]', 'U') IS NULL
BEGIN
SET ANSI_NULLS ON
SET QUOTED_IDENTIFIER ON
CREATE TABLE [dbo].[Carts](
	[CartId] [bigint] IDENTITY(1,1) NOT NULL,
	[CustomerId] [bigint] NOT NULL,
	[CreatedAt] [datetime2](7) NULL,
	[UpdatedAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[CartId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

ALTER TABLE [dbo].[Carts] ADD  DEFAULT (getdate()) FOR [CreatedAt]
ALTER TABLE [dbo].[Carts] ADD  DEFAULT (getdate()) FOR [UpdatedAt]
ALTER TABLE [dbo].[Carts]  WITH CHECK ADD  CONSTRAINT [FK_Carts_Users] FOREIGN KEY([CustomerId])
REFERENCES [dbo].[Users] ([UserId])
ON DELETE CASCADE
ALTER TABLE [dbo].[Carts] CHECK CONSTRAINT [FK_Carts_Users]
END;
GO

-- -------------------------------------------------------------
-- Table: [dbo].[Categories]
-- -------------------------------------------------------------
IF OBJECT_ID('[dbo].[Categories]', 'U') IS NULL
BEGIN
SET ANSI_NULLS ON
SET QUOTED_IDENTIFIER ON
CREATE TABLE [dbo].[Categories](
	[CategoryId] [int] IDENTITY(1,1) NOT NULL,
	[CategoryName] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ParentCategoryId] [int] NULL,
	[Status] [nvarchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
PRIMARY KEY CLUSTERED 
(
	[CategoryId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

ALTER TABLE [dbo].[Categories] ADD  DEFAULT ('Active') FOR [Status]
ALTER TABLE [dbo].[Categories]  WITH CHECK ADD  CONSTRAINT [FK_Categories_Parent] FOREIGN KEY([ParentCategoryId])
REFERENCES [dbo].[Categories] ([CategoryId])
ALTER TABLE [dbo].[Categories] CHECK CONSTRAINT [FK_Categories_Parent]
END;
GO

-- -------------------------------------------------------------
-- Table: [dbo].[Certifications]
-- -------------------------------------------------------------
IF OBJECT_ID('[dbo].[Certifications]', 'U') IS NULL
BEGIN
SET ANSI_NULLS ON
SET QUOTED_IDENTIFIER ON
SET ANSI_PADDING ON
CREATE TABLE [dbo].[Certifications](
	[CertificationId] [int] IDENTITY(1,1) NOT NULL,
	[CertificationName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[IssuingOrganization] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[CertificateCode] [varchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[IssuedDate] [date] NULL,
	[ExpiryDate] [date] NULL,
	[DocumentUrl] [varchar](500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Status] [nvarchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
PRIMARY KEY CLUSTERED 
(
	[CertificationId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

SET ANSI_PADDING OFF
ALTER TABLE [dbo].[Certifications] ADD  DEFAULT ('Active') FOR [Status]
END;
GO

-- -------------------------------------------------------------
-- Table: [dbo].[Farms]
-- -------------------------------------------------------------
IF OBJECT_ID('[dbo].[Farms]', 'U') IS NULL
BEGIN
SET ANSI_NULLS ON
SET QUOTED_IDENTIFIER ON
CREATE TABLE [dbo].[Farms](
	[FarmId] [bigint] IDENTITY(1,1) NOT NULL,
	[SupplierId] [bigint] NOT NULL,
	[FarmName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Address] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Province] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[District] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Latitude] [decimal](10, 8) NULL,
	[Longitude] [decimal](11, 8) NULL,
	[Area] [decimal](10, 2) NULL,
	[CropType] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[ProductionStandard] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Status] [nvarchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
PRIMARY KEY CLUSTERED 
(
	[FarmId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

ALTER TABLE [dbo].[Farms] ADD  DEFAULT ('Active') FOR [Status]
ALTER TABLE [dbo].[Farms]  WITH CHECK ADD  CONSTRAINT [FK_Farms_Suppliers] FOREIGN KEY([SupplierId])
REFERENCES [dbo].[Suppliers] ([SupplierId])
ON DELETE CASCADE
ALTER TABLE [dbo].[Farms] CHECK CONSTRAINT [FK_Farms_Suppliers]
END;
GO

-- -------------------------------------------------------------
-- Table: [dbo].[Inventories]
-- -------------------------------------------------------------
IF OBJECT_ID('[dbo].[Inventories]', 'U') IS NULL
BEGIN
SET ANSI_NULLS ON
SET QUOTED_IDENTIFIER ON
CREATE TABLE [dbo].[Inventories](
	[InventoryId] [bigint] IDENTITY(1,1) NOT NULL,
	[BatchId] [bigint] NOT NULL,
	[QuantityOnHand] [decimal](10, 2) NOT NULL,
	[ReservedQuantity] [decimal](10, 2) NOT NULL,
	[ReorderLevel] [decimal](10, 2) NULL,
	[UpdatedAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[InventoryId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[BatchId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

ALTER TABLE [dbo].[Inventories] ADD  DEFAULT ((0.00)) FOR [QuantityOnHand]
ALTER TABLE [dbo].[Inventories] ADD  DEFAULT ((0.00)) FOR [ReservedQuantity]
ALTER TABLE [dbo].[Inventories] ADD  DEFAULT ((10.00)) FOR [ReorderLevel]
ALTER TABLE [dbo].[Inventories] ADD  DEFAULT (getdate()) FOR [UpdatedAt]
ALTER TABLE [dbo].[Inventories]  WITH CHECK ADD  CONSTRAINT [FK_Inventories_Batches] FOREIGN KEY([BatchId])
REFERENCES [dbo].[Batches] ([BatchId])
ON DELETE CASCADE
ALTER TABLE [dbo].[Inventories] CHECK CONSTRAINT [FK_Inventories_Batches]
END;
GO

-- -------------------------------------------------------------
-- Table: [dbo].[MembershipTiers]
-- -------------------------------------------------------------
IF OBJECT_ID('[dbo].[MembershipTiers]', 'U') IS NULL
BEGIN
SET ANSI_NULLS ON
SET QUOTED_IDENTIFIER ON
CREATE TABLE [dbo].[MembershipTiers](
	[TierId] [int] IDENTITY(1,1) NOT NULL,
	[TierName] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[MinSpend] [decimal](18, 2) NOT NULL,
	[PointRate] [decimal](18, 4) NOT NULL,
	[Description] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Icon] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[CreatedAt] [datetime2](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[TierId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

ALTER TABLE [dbo].[MembershipTiers] ADD  DEFAULT (getutcdate()) FOR [CreatedAt]
END;
GO

-- -------------------------------------------------------------
-- Table: [dbo].[Notifications]
-- -------------------------------------------------------------
IF OBJECT_ID('[dbo].[Notifications]', 'U') IS NULL
BEGIN
SET ANSI_NULLS ON
SET QUOTED_IDENTIFIER ON
SET ANSI_PADDING ON
CREATE TABLE [dbo].[Notifications](
	[NotificationId] [bigint] IDENTITY(1,1) NOT NULL,
	[UserId] [bigint] NOT NULL,
	[Type] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Title] [nvarchar](200) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Message] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ReferenceId] [varchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[IsRead] [bit] NULL,
	[CreatedAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[NotificationId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

SET ANSI_PADDING OFF
ALTER TABLE [dbo].[Notifications] ADD  DEFAULT ((0)) FOR [IsRead]
ALTER TABLE [dbo].[Notifications] ADD  DEFAULT (getdate()) FOR [CreatedAt]
ALTER TABLE [dbo].[Notifications]  WITH CHECK ADD  CONSTRAINT [FK_Notifications_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
ON DELETE CASCADE
ALTER TABLE [dbo].[Notifications] CHECK CONSTRAINT [FK_Notifications_Users]
END;
GO

-- -------------------------------------------------------------
-- Table: [dbo].[OrderItems]
-- -------------------------------------------------------------
IF OBJECT_ID('[dbo].[OrderItems]', 'U') IS NULL
BEGIN
SET ANSI_NULLS ON
SET QUOTED_IDENTIFIER ON
CREATE TABLE [dbo].[OrderItems](
	[OrderItemId] [bigint] IDENTITY(1,1) NOT NULL,
	[OrderId] [bigint] NOT NULL,
	[ProductId] [bigint] NOT NULL,
	[BatchId] [bigint] NOT NULL,
	[Quantity] [decimal](10, 2) NOT NULL,
	[UnitPrice] [decimal](18, 2) NOT NULL,
	[DiscountAmount] [decimal](18, 2) NULL,
	[TotalAmount] [decimal](18, 2) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[OrderItemId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

ALTER TABLE [dbo].[OrderItems] ADD  DEFAULT ((0.00)) FOR [DiscountAmount]
ALTER TABLE [dbo].[OrderItems]  WITH CHECK ADD  CONSTRAINT [FK_OrderItems_Batches] FOREIGN KEY([BatchId])
REFERENCES [dbo].[Batches] ([BatchId])
ALTER TABLE [dbo].[OrderItems] CHECK CONSTRAINT [FK_OrderItems_Batches]
ALTER TABLE [dbo].[OrderItems]  WITH CHECK ADD  CONSTRAINT [FK_OrderItems_Orders] FOREIGN KEY([OrderId])
REFERENCES [dbo].[Orders] ([OrderId])
ON DELETE CASCADE
ALTER TABLE [dbo].[OrderItems] CHECK CONSTRAINT [FK_OrderItems_Orders]
ALTER TABLE [dbo].[OrderItems]  WITH CHECK ADD  CONSTRAINT [FK_OrderItems_Products] FOREIGN KEY([ProductId])
REFERENCES [dbo].[Products] ([ProductId])
ALTER TABLE [dbo].[OrderItems] CHECK CONSTRAINT [FK_OrderItems_Products]
END;
GO

-- -------------------------------------------------------------
-- Table: [dbo].[Orders]
-- -------------------------------------------------------------
IF OBJECT_ID('[dbo].[Orders]', 'U') IS NULL
BEGIN
SET ANSI_NULLS ON
SET QUOTED_IDENTIFIER ON
SET ANSI_PADDING ON
CREATE TABLE [dbo].[Orders](
	[OrderId] [bigint] IDENTITY(1,1) NOT NULL,
	[CustomerId] [bigint] NOT NULL,
	[OrderCode] [varchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[AddressId] [bigint] NOT NULL,
	[Subtotal] [decimal](18, 2) NOT NULL,
	[DiscountAmount] [decimal](18, 2) NULL,
	[ShippingFee] [decimal](18, 2) NULL,
	[TotalAmount] [decimal](18, 2) NOT NULL,
	[PaymentMethod] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[PaymentStatus] [nvarchar](30) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[OrderStatus] [nvarchar](30) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[CreatedAt] [datetime2](7) NULL,
	[UpdatedAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[OrderId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[OrderCode] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

SET ANSI_PADDING OFF
ALTER TABLE [dbo].[Orders] ADD  DEFAULT ((0.00)) FOR [Subtotal]
ALTER TABLE [dbo].[Orders] ADD  DEFAULT ((0.00)) FOR [DiscountAmount]
ALTER TABLE [dbo].[Orders] ADD  DEFAULT ((0.00)) FOR [ShippingFee]
ALTER TABLE [dbo].[Orders] ADD  DEFAULT ((0.00)) FOR [TotalAmount]
ALTER TABLE [dbo].[Orders] ADD  DEFAULT ('Unpaid') FOR [PaymentStatus]
ALTER TABLE [dbo].[Orders] ADD  DEFAULT ('Pending') FOR [OrderStatus]
ALTER TABLE [dbo].[Orders] ADD  DEFAULT (getdate()) FOR [CreatedAt]
ALTER TABLE [dbo].[Orders] ADD  DEFAULT (getdate()) FOR [UpdatedAt]
ALTER TABLE [dbo].[Orders]  WITH CHECK ADD  CONSTRAINT [FK_Orders_Addresses] FOREIGN KEY([AddressId])
REFERENCES [dbo].[Addresses] ([AddressId])
ALTER TABLE [dbo].[Orders] CHECK CONSTRAINT [FK_Orders_Addresses]
ALTER TABLE [dbo].[Orders]  WITH CHECK ADD  CONSTRAINT [FK_Orders_Users] FOREIGN KEY([CustomerId])
REFERENCES [dbo].[Users] ([UserId])
ALTER TABLE [dbo].[Orders] CHECK CONSTRAINT [FK_Orders_Users]
END;
GO

-- -------------------------------------------------------------
-- Table: [dbo].[Payments]
-- -------------------------------------------------------------
IF OBJECT_ID('[dbo].[Payments]', 'U') IS NULL
BEGIN
SET ANSI_NULLS ON
SET QUOTED_IDENTIFIER ON
SET ANSI_PADDING ON
CREATE TABLE [dbo].[Payments](
	[PaymentId] [bigint] IDENTITY(1,1) NOT NULL,
	[OrderId] [bigint] NOT NULL,
	[PaymentMethod] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Amount] [decimal](18, 2) NOT NULL,
	[TransactionCode] [varchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Status] [nvarchar](30) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[PaidAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[PaymentId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

SET ANSI_PADDING OFF
ALTER TABLE [dbo].[Payments] ADD  DEFAULT ('Pending') FOR [Status]
ALTER TABLE [dbo].[Payments]  WITH CHECK ADD  CONSTRAINT [FK_Payments_Orders] FOREIGN KEY([OrderId])
REFERENCES [dbo].[Orders] ([OrderId])
ON DELETE CASCADE
ALTER TABLE [dbo].[Payments] CHECK CONSTRAINT [FK_Payments_Orders]
END;
GO

-- -------------------------------------------------------------
-- Table: [dbo].[PointTransactions]
-- -------------------------------------------------------------
IF OBJECT_ID('[dbo].[PointTransactions]', 'U') IS NULL
BEGIN
SET ANSI_NULLS ON
SET QUOTED_IDENTIFIER ON
CREATE TABLE [dbo].[PointTransactions](
	[TransactionId] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [bigint] NOT NULL,
	[OrderId] [bigint] NULL,
	[PointsDelta] [int] NOT NULL,
	[TransactionType] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Description] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[CreatedAt] [datetime2](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[TransactionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

ALTER TABLE [dbo].[PointTransactions] ADD  DEFAULT ('Earn') FOR [TransactionType]
ALTER TABLE [dbo].[PointTransactions] ADD  DEFAULT (getutcdate()) FOR [CreatedAt]
ALTER TABLE [dbo].[PointTransactions]  WITH CHECK ADD  CONSTRAINT [FK_PointTransactions_Orders] FOREIGN KEY([OrderId])
REFERENCES [dbo].[Orders] ([OrderId])
ON DELETE SET NULL
ALTER TABLE [dbo].[PointTransactions] CHECK CONSTRAINT [FK_PointTransactions_Orders]
ALTER TABLE [dbo].[PointTransactions]  WITH CHECK ADD  CONSTRAINT [FK_PointTransactions_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
ON DELETE CASCADE
ALTER TABLE [dbo].[PointTransactions] CHECK CONSTRAINT [FK_PointTransactions_Users]
END;
GO

-- -------------------------------------------------------------
-- Table: [dbo].[ProductCertifications]
-- -------------------------------------------------------------
IF OBJECT_ID('[dbo].[ProductCertifications]', 'U') IS NULL
BEGIN
SET ANSI_NULLS ON
SET QUOTED_IDENTIFIER ON
CREATE TABLE [dbo].[ProductCertifications](
	[ProductId] [bigint] NOT NULL,
	[CertificationId] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ProductId] ASC,
	[CertificationId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

ALTER TABLE [dbo].[ProductCertifications]  WITH CHECK ADD  CONSTRAINT [FK_ProdCert_Certifications] FOREIGN KEY([CertificationId])
REFERENCES [dbo].[Certifications] ([CertificationId])
ON DELETE CASCADE
ALTER TABLE [dbo].[ProductCertifications] CHECK CONSTRAINT [FK_ProdCert_Certifications]
ALTER TABLE [dbo].[ProductCertifications]  WITH CHECK ADD  CONSTRAINT [FK_ProdCert_Products] FOREIGN KEY([ProductId])
REFERENCES [dbo].[Products] ([ProductId])
ON DELETE CASCADE
ALTER TABLE [dbo].[ProductCertifications] CHECK CONSTRAINT [FK_ProdCert_Products]
END;
GO

-- -------------------------------------------------------------
-- Table: [dbo].[ProductImages]
-- -------------------------------------------------------------
IF OBJECT_ID('[dbo].[ProductImages]', 'U') IS NULL
BEGIN
SET ANSI_NULLS ON
SET QUOTED_IDENTIFIER ON
SET ANSI_PADDING ON
CREATE TABLE [dbo].[ProductImages](
	[ProductImageId] [bigint] IDENTITY(1,1) NOT NULL,
	[ProductId] [bigint] NOT NULL,
	[ImageUrl] [varchar](500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[IsPrimary] [bit] NULL,
	[SortOrder] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[ProductImageId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

SET ANSI_PADDING OFF
ALTER TABLE [dbo].[ProductImages] ADD  DEFAULT ((0)) FOR [IsPrimary]
ALTER TABLE [dbo].[ProductImages] ADD  DEFAULT ((0)) FOR [SortOrder]
ALTER TABLE [dbo].[ProductImages]  WITH CHECK ADD  CONSTRAINT [FK_ProductImages_Products] FOREIGN KEY([ProductId])
REFERENCES [dbo].[Products] ([ProductId])
ON DELETE CASCADE
ALTER TABLE [dbo].[ProductImages] CHECK CONSTRAINT [FK_ProductImages_Products]
END;
GO

-- -------------------------------------------------------------
-- Table: [dbo].[Products]
-- -------------------------------------------------------------
IF OBJECT_ID('[dbo].[Products]', 'U') IS NULL
BEGIN
SET ANSI_NULLS ON
SET QUOTED_IDENTIFIER ON
CREATE TABLE [dbo].[Products](
	[ProductId] [bigint] IDENTITY(1,1) NOT NULL,
	[SupplierId] [bigint] NOT NULL,
	[CategoryId] [int] NOT NULL,
	[ProductName] [nvarchar](200) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Description] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Price] [decimal](18, 2) NOT NULL,
	[Unit] [nvarchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Status] [nvarchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[ApprovedBy] [bigint] NULL,
	[ApprovedAt] [datetime2](7) NULL,
	[RejectReason] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[CreatedAt] [datetime2](7) NULL,
	[UpdatedAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[ProductId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

ALTER TABLE [dbo].[Products] ADD  DEFAULT ((0.00)) FOR [Price]
ALTER TABLE [dbo].[Products] ADD  DEFAULT ('Pending') FOR [Status]
ALTER TABLE [dbo].[Products] ADD  DEFAULT (getdate()) FOR [CreatedAt]
ALTER TABLE [dbo].[Products] ADD  DEFAULT (getdate()) FOR [UpdatedAt]
ALTER TABLE [dbo].[Products]  WITH CHECK ADD  CONSTRAINT [FK_Products_ApprovedBy] FOREIGN KEY([ApprovedBy])
REFERENCES [dbo].[Users] ([UserId])
ALTER TABLE [dbo].[Products] CHECK CONSTRAINT [FK_Products_ApprovedBy]
ALTER TABLE [dbo].[Products]  WITH CHECK ADD  CONSTRAINT [FK_Products_Categories] FOREIGN KEY([CategoryId])
REFERENCES [dbo].[Categories] ([CategoryId])
ALTER TABLE [dbo].[Products] CHECK CONSTRAINT [FK_Products_Categories]
ALTER TABLE [dbo].[Products]  WITH CHECK ADD  CONSTRAINT [FK_Products_Suppliers] FOREIGN KEY([SupplierId])
REFERENCES [dbo].[Suppliers] ([SupplierId])
ALTER TABLE [dbo].[Products] CHECK CONSTRAINT [FK_Products_Suppliers]
END;
GO

-- -------------------------------------------------------------
-- Table: [dbo].[ProductSeasons]
-- -------------------------------------------------------------
IF OBJECT_ID('[dbo].[ProductSeasons]', 'U') IS NULL
BEGIN
SET ANSI_NULLS ON
SET QUOTED_IDENTIFIER ON
CREATE TABLE [dbo].[ProductSeasons](
	[ProductSeasonId] [bigint] IDENTITY(1,1) NOT NULL,
	[ProductId] [bigint] NOT NULL,
	[Region] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[StartMonth] [int] NOT NULL,
	[EndMonth] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ProductSeasonId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

ALTER TABLE [dbo].[ProductSeasons]  WITH CHECK ADD  CONSTRAINT [FK_ProductSeasons_Products] FOREIGN KEY([ProductId])
REFERENCES [dbo].[Products] ([ProductId])
ON DELETE CASCADE
ALTER TABLE [dbo].[ProductSeasons] CHECK CONSTRAINT [FK_ProductSeasons_Products]
ALTER TABLE [dbo].[ProductSeasons]  WITH CHECK ADD CHECK  (([EndMonth]>=(1) AND [EndMonth]<=(12)))
ALTER TABLE [dbo].[ProductSeasons]  WITH CHECK ADD CHECK  (([StartMonth]>=(1) AND [StartMonth]<=(12)))
END;
GO

-- -------------------------------------------------------------
-- Table: [dbo].[PromotionProducts]
-- -------------------------------------------------------------
IF OBJECT_ID('[dbo].[PromotionProducts]', 'U') IS NULL
BEGIN
SET ANSI_NULLS ON
SET QUOTED_IDENTIFIER ON
CREATE TABLE [dbo].[PromotionProducts](
	[PromotionId] [bigint] NOT NULL,
	[ProductId] [bigint] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[PromotionId] ASC,
	[ProductId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

ALTER TABLE [dbo].[PromotionProducts]  WITH CHECK ADD  CONSTRAINT [FK_PromoProd_Products] FOREIGN KEY([ProductId])
REFERENCES [dbo].[Products] ([ProductId])
ON DELETE CASCADE
ALTER TABLE [dbo].[PromotionProducts] CHECK CONSTRAINT [FK_PromoProd_Products]
ALTER TABLE [dbo].[PromotionProducts]  WITH CHECK ADD  CONSTRAINT [FK_PromoProd_Promotions] FOREIGN KEY([PromotionId])
REFERENCES [dbo].[Promotions] ([PromotionId])
ON DELETE CASCADE
ALTER TABLE [dbo].[PromotionProducts] CHECK CONSTRAINT [FK_PromoProd_Promotions]
END;
GO

-- -------------------------------------------------------------
-- Table: [dbo].[Promotions]
-- -------------------------------------------------------------
IF OBJECT_ID('[dbo].[Promotions]', 'U') IS NULL
BEGIN
SET ANSI_NULLS ON
SET QUOTED_IDENTIFIER ON
SET ANSI_PADDING ON
CREATE TABLE [dbo].[Promotions](
	[PromotionId] [bigint] IDENTITY(1,1) NOT NULL,
	[PromotionName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[PromotionCode] [varchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[DiscountType] [nvarchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[DiscountValue] [decimal](18, 2) NOT NULL,
	[StartDate] [datetime2](7) NOT NULL,
	[EndDate] [datetime2](7) NOT NULL,
	[MinOrderValue] [decimal](18, 2) NULL,
	[MaxDiscount] [decimal](18, 2) NULL,
	[UsageLimit] [int] NULL,
	[Status] [nvarchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
PRIMARY KEY CLUSTERED 
(
	[PromotionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[PromotionCode] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

SET ANSI_PADDING OFF
ALTER TABLE [dbo].[Promotions] ADD  DEFAULT ((0.00)) FOR [MinOrderValue]
ALTER TABLE [dbo].[Promotions] ADD  DEFAULT ((0.00)) FOR [MaxDiscount]
ALTER TABLE [dbo].[Promotions] ADD  DEFAULT ((0)) FOR [UsageLimit]
ALTER TABLE [dbo].[Promotions] ADD  DEFAULT ('Active') FOR [Status]
END;
GO

-- -------------------------------------------------------------
-- Table: [dbo].[RecommendationLogs]
-- -------------------------------------------------------------
IF OBJECT_ID('[dbo].[RecommendationLogs]', 'U') IS NULL
BEGIN
SET ANSI_NULLS ON
SET QUOTED_IDENTIFIER ON
CREATE TABLE [dbo].[RecommendationLogs](
	[RecommendationLogId] [bigint] IDENTITY(1,1) NOT NULL,
	[UserId] [bigint] NULL,
	[ProductId] [bigint] NOT NULL,
	[RecommendationType] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Score] [float] NULL,
	[Position] [int] NULL,
	[ShownAt] [datetime2](7) NULL,
	[Clicked] [bit] NULL,
	[AddedToCart] [bit] NULL,
	[Purchased] [bit] NULL,
PRIMARY KEY CLUSTERED 
(
	[RecommendationLogId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

ALTER TABLE [dbo].[RecommendationLogs] ADD  DEFAULT ((0.0)) FOR [Score]
ALTER TABLE [dbo].[RecommendationLogs] ADD  DEFAULT ((0)) FOR [Position]
ALTER TABLE [dbo].[RecommendationLogs] ADD  DEFAULT (getdate()) FOR [ShownAt]
ALTER TABLE [dbo].[RecommendationLogs] ADD  DEFAULT ((0)) FOR [Clicked]
ALTER TABLE [dbo].[RecommendationLogs] ADD  DEFAULT ((0)) FOR [AddedToCart]
ALTER TABLE [dbo].[RecommendationLogs] ADD  DEFAULT ((0)) FOR [Purchased]
ALTER TABLE [dbo].[RecommendationLogs]  WITH CHECK ADD  CONSTRAINT [FK_RecLogs_Products] FOREIGN KEY([ProductId])
REFERENCES [dbo].[Products] ([ProductId])
ON DELETE CASCADE
ALTER TABLE [dbo].[RecommendationLogs] CHECK CONSTRAINT [FK_RecLogs_Products]
ALTER TABLE [dbo].[RecommendationLogs]  WITH CHECK ADD  CONSTRAINT [FK_RecLogs_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
ON DELETE CASCADE
ALTER TABLE [dbo].[RecommendationLogs] CHECK CONSTRAINT [FK_RecLogs_Users]
END;
GO

-- -------------------------------------------------------------
-- Table: [dbo].[RefreshTokens]
-- -------------------------------------------------------------
IF OBJECT_ID('[dbo].[RefreshTokens]', 'U') IS NULL
BEGIN
SET ANSI_NULLS ON
SET QUOTED_IDENTIFIER ON
SET ANSI_PADDING ON
CREATE TABLE [dbo].[RefreshTokens](
	[TokenId] [bigint] IDENTITY(1,1) NOT NULL,
	[UserId] [bigint] NOT NULL,
	[Token] [varchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[ExpiresAt] [datetime2](7) NOT NULL,
	[CreatedAt] [datetime2](7) NULL,
	[CreatedByIp] [varchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[RevokedAt] [datetime2](7) NULL,
	[RevokedByIp] [varchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[ReplacedByToken] [varchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
PRIMARY KEY CLUSTERED 
(
	[TokenId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[Token] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

SET ANSI_PADDING OFF
ALTER TABLE [dbo].[RefreshTokens] ADD  DEFAULT (getdate()) FOR [CreatedAt]
ALTER TABLE [dbo].[RefreshTokens]  WITH CHECK ADD  CONSTRAINT [FK_RefreshTokens_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
ON DELETE CASCADE
ALTER TABLE [dbo].[RefreshTokens] CHECK CONSTRAINT [FK_RefreshTokens_Users]
END;
GO

-- -------------------------------------------------------------
-- Table: [dbo].[ReviewImages]
-- -------------------------------------------------------------
IF OBJECT_ID('[dbo].[ReviewImages]', 'U') IS NULL
BEGIN
SET ANSI_NULLS ON
SET QUOTED_IDENTIFIER ON
SET ANSI_PADDING ON
CREATE TABLE [dbo].[ReviewImages](
	[ReviewImageId] [bigint] IDENTITY(1,1) NOT NULL,
	[ReviewId] [bigint] NOT NULL,
	[ImageUrl] [varchar](500) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ReviewImageId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

SET ANSI_PADDING OFF
ALTER TABLE [dbo].[ReviewImages]  WITH CHECK ADD  CONSTRAINT [FK_ReviewImages_Reviews] FOREIGN KEY([ReviewId])
REFERENCES [dbo].[Reviews] ([ReviewId])
ON DELETE CASCADE
ALTER TABLE [dbo].[ReviewImages] CHECK CONSTRAINT [FK_ReviewImages_Reviews]
END;
GO

-- -------------------------------------------------------------
-- Table: [dbo].[Reviews]
-- -------------------------------------------------------------
IF OBJECT_ID('[dbo].[Reviews]', 'U') IS NULL
BEGIN
SET ANSI_NULLS ON
SET QUOTED_IDENTIFIER ON
CREATE TABLE [dbo].[Reviews](
	[ReviewId] [bigint] IDENTITY(1,1) NOT NULL,
	[CustomerId] [bigint] NOT NULL,
	[ProductId] [bigint] NOT NULL,
	[OrderId] [bigint] NULL,
	[Rating] [int] NOT NULL,
	[Comment] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[CreatedAt] [datetime2](7) NULL,
	[Status] [nvarchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[HelpfulCount] [int] NOT NULL,
	[ReportCount] [int] NOT NULL,
	[UpdatedAt] [datetime2](7) NULL,
	[IsPurchased] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ReviewId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

ALTER TABLE [dbo].[Reviews] ADD  DEFAULT (getdate()) FOR [CreatedAt]
ALTER TABLE [dbo].[Reviews] ADD  DEFAULT ('Approved') FOR [Status]
ALTER TABLE [dbo].[Reviews] ADD  DEFAULT ((0)) FOR [HelpfulCount]
ALTER TABLE [dbo].[Reviews] ADD  DEFAULT ((0)) FOR [ReportCount]
ALTER TABLE [dbo].[Reviews] ADD  DEFAULT ((1)) FOR [IsPurchased]
ALTER TABLE [dbo].[Reviews]  WITH CHECK ADD  CONSTRAINT [FK_Reviews_Orders] FOREIGN KEY([OrderId])
REFERENCES [dbo].[Orders] ([OrderId])
ALTER TABLE [dbo].[Reviews] CHECK CONSTRAINT [FK_Reviews_Orders]
ALTER TABLE [dbo].[Reviews]  WITH CHECK ADD  CONSTRAINT [FK_Reviews_Products] FOREIGN KEY([ProductId])
REFERENCES [dbo].[Products] ([ProductId])
ALTER TABLE [dbo].[Reviews] CHECK CONSTRAINT [FK_Reviews_Products]
ALTER TABLE [dbo].[Reviews]  WITH CHECK ADD  CONSTRAINT [FK_Reviews_Users] FOREIGN KEY([CustomerId])
REFERENCES [dbo].[Users] ([UserId])
ALTER TABLE [dbo].[Reviews] CHECK CONSTRAINT [FK_Reviews_Users]
ALTER TABLE [dbo].[Reviews]  WITH CHECK ADD CHECK  (([Rating]>=(1) AND [Rating]<=(5)))
END;
GO

-- -------------------------------------------------------------
-- Table: [dbo].[ReviewHelpfulVotes]
-- -------------------------------------------------------------
IF OBJECT_ID('[dbo].[ReviewHelpfulVotes]', 'U') IS NULL
BEGIN
SET ANSI_NULLS ON
SET QUOTED_IDENTIFIER ON
CREATE TABLE [dbo].[ReviewHelpfulVotes](
	[VoteId] [bigint] IDENTITY(1,1) NOT NULL,
	[ReviewId] [bigint] NOT NULL,
	[UserId] [bigint] NOT NULL,
	[CreatedAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[VoteId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

ALTER TABLE [dbo].[ReviewHelpfulVotes] ADD DEFAULT (getdate()) FOR [CreatedAt]
ALTER TABLE [dbo].[ReviewHelpfulVotes] WITH CHECK ADD CONSTRAINT [FK_ReviewHelpfulVotes_Reviews] FOREIGN KEY([ReviewId])
REFERENCES [dbo].[Reviews] ([ReviewId])
ON DELETE CASCADE
ALTER TABLE [dbo].[ReviewHelpfulVotes] CHECK CONSTRAINT [FK_ReviewHelpfulVotes_Reviews]
ALTER TABLE [dbo].[ReviewHelpfulVotes] WITH CHECK ADD CONSTRAINT [FK_ReviewHelpfulVotes_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
ALTER TABLE [dbo].[ReviewHelpfulVotes] CHECK CONSTRAINT [FK_ReviewHelpfulVotes_Users]
END;
GO

-- -------------------------------------------------------------
-- Table: [dbo].[Roles]
-- -------------------------------------------------------------
IF OBJECT_ID('[dbo].[Roles]', 'U') IS NULL
BEGIN
SET ANSI_NULLS ON
SET QUOTED_IDENTIFIER ON
CREATE TABLE [dbo].[Roles](
	[RoleId] [int] IDENTITY(1,1) NOT NULL,
	[RoleName] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[RoleId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[RoleName] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

END;
GO

-- -------------------------------------------------------------
-- Table: [dbo].[Suppliers]
-- -------------------------------------------------------------
IF OBJECT_ID('[dbo].[Suppliers]', 'U') IS NULL
BEGIN
SET ANSI_NULLS ON
SET QUOTED_IDENTIFIER ON
SET ANSI_PADDING ON
CREATE TABLE [dbo].[Suppliers](
	[SupplierId] [bigint] IDENTITY(1,1) NOT NULL,
	[UserId] [bigint] NOT NULL,
	[SupplierName] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Representative] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[BusinessLicense] [varchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Address] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Province] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[Description] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[ApprovalStatus] [nvarchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[ApprovedBy] [bigint] NULL,
	[ApprovedAt] [datetime2](7) NULL,
	[RejectReason] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[CreatedAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[SupplierId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

SET ANSI_PADDING OFF
ALTER TABLE [dbo].[Suppliers] ADD  DEFAULT ('Pending') FOR [ApprovalStatus]
ALTER TABLE [dbo].[Suppliers] ADD  DEFAULT (getdate()) FOR [CreatedAt]
ALTER TABLE [dbo].[Suppliers]  WITH CHECK ADD  CONSTRAINT [FK_Suppliers_ApprovedBy] FOREIGN KEY([ApprovedBy])
REFERENCES [dbo].[Users] ([UserId])
ALTER TABLE [dbo].[Suppliers] CHECK CONSTRAINT [FK_Suppliers_ApprovedBy]
ALTER TABLE [dbo].[Suppliers]  WITH CHECK ADD  CONSTRAINT [FK_Suppliers_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
ON DELETE CASCADE
ALTER TABLE [dbo].[Suppliers] CHECK CONSTRAINT [FK_Suppliers_Users]
END;
GO

-- -------------------------------------------------------------
-- Table: [dbo].[UserBehaviors]
-- -------------------------------------------------------------
IF OBJECT_ID('[dbo].[UserBehaviors]', 'U') IS NULL
BEGIN
SET ANSI_NULLS ON
SET QUOTED_IDENTIFIER ON
SET ANSI_PADDING ON
CREATE TABLE [dbo].[UserBehaviors](
	[BehaviorId] [bigint] IDENTITY(1,1) NOT NULL,
	[UserId] [bigint] NULL,
	[ProductId] [bigint] NULL,
	[ActionType] [nvarchar](30) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[SearchKeyword] [nvarchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[SessionId] [varchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[CreatedAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[BehaviorId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

SET ANSI_PADDING OFF
ALTER TABLE [dbo].[UserBehaviors] ADD  DEFAULT (getdate()) FOR [CreatedAt]
ALTER TABLE [dbo].[UserBehaviors]  WITH CHECK ADD  CONSTRAINT [FK_UserBehaviors_Products] FOREIGN KEY([ProductId])
REFERENCES [dbo].[Products] ([ProductId])
ON DELETE SET NULL
ALTER TABLE [dbo].[UserBehaviors] CHECK CONSTRAINT [FK_UserBehaviors_Products]
ALTER TABLE [dbo].[UserBehaviors]  WITH CHECK ADD  CONSTRAINT [FK_UserBehaviors_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
ON DELETE CASCADE
ALTER TABLE [dbo].[UserBehaviors] CHECK CONSTRAINT [FK_UserBehaviors_Users]
END;
GO

-- -------------------------------------------------------------
-- Table: [dbo].[UserLoyalties]
-- -------------------------------------------------------------
IF OBJECT_ID('[dbo].[UserLoyalties]', 'U') IS NULL
BEGIN
SET ANSI_NULLS ON
SET QUOTED_IDENTIFIER ON
CREATE TABLE [dbo].[UserLoyalties](
	[LoyaltyId] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [bigint] NOT NULL,
	[CurrentPoints] [int] NOT NULL,
	[TotalSpentYear] [decimal](18, 2) NOT NULL,
	[TierId] [int] NOT NULL,
	[UpdatedAt] [datetime2](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[LoyaltyId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

ALTER TABLE [dbo].[UserLoyalties] ADD  DEFAULT ((0)) FOR [CurrentPoints]
ALTER TABLE [dbo].[UserLoyalties] ADD  DEFAULT ((0)) FOR [TotalSpentYear]
ALTER TABLE [dbo].[UserLoyalties] ADD  DEFAULT (getutcdate()) FOR [UpdatedAt]
ALTER TABLE [dbo].[UserLoyalties]  WITH CHECK ADD  CONSTRAINT [FK_UserLoyalties_Tiers] FOREIGN KEY([TierId])
REFERENCES [dbo].[MembershipTiers] ([TierId])
ALTER TABLE [dbo].[UserLoyalties] CHECK CONSTRAINT [FK_UserLoyalties_Tiers]
ALTER TABLE [dbo].[UserLoyalties]  WITH CHECK ADD  CONSTRAINT [FK_UserLoyalties_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
ON DELETE CASCADE
ALTER TABLE [dbo].[UserLoyalties] CHECK CONSTRAINT [FK_UserLoyalties_Users]
END;
GO

-- -------------------------------------------------------------
-- Table: [dbo].[Users]
-- -------------------------------------------------------------
IF OBJECT_ID('[dbo].[Users]', 'U') IS NULL
BEGIN
SET ANSI_NULLS ON
SET QUOTED_IDENTIFIER ON
SET ANSI_PADDING ON
CREATE TABLE [dbo].[Users](
	[UserId] [bigint] IDENTITY(1,1) NOT NULL,
	[FullName] [nvarchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Email] [varchar](100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Phone] [varchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[PasswordHash] [varchar](255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[RoleId] [int] NOT NULL,
	[Status] [nvarchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[CreatedAt] [datetime2](7) NULL,
	[UpdatedAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[UserId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[Email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

SET ANSI_PADDING OFF
ALTER TABLE [dbo].[Users] ADD  DEFAULT ('Active') FOR [Status]
ALTER TABLE [dbo].[Users] ADD  DEFAULT (getdate()) FOR [CreatedAt]
ALTER TABLE [dbo].[Users] ADD  DEFAULT (getdate()) FOR [UpdatedAt]
ALTER TABLE [dbo].[Users]  WITH CHECK ADD  CONSTRAINT [FK_Users_Roles] FOREIGN KEY([RoleId])
REFERENCES [dbo].[Roles] ([RoleId])
ALTER TABLE [dbo].[Users] CHECK CONSTRAINT [FK_Users_Roles]
END;
GO

-- -------------------------------------------------------------
-- Table: [dbo].[UserVouchers]
-- -------------------------------------------------------------
IF OBJECT_ID('[dbo].[UserVouchers]', 'U') IS NULL
BEGIN
SET ANSI_NULLS ON
SET QUOTED_IDENTIFIER ON
CREATE TABLE [dbo].[UserVouchers](
	[VoucherId] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [bigint] NOT NULL,
	[Code] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[Title] [nvarchar](150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[VoucherType] [nvarchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[DiscountValue] [decimal](18, 2) NOT NULL,
	[MinOrderAmount] [decimal](18, 2) NOT NULL,
	[ExpiryDate] [datetime2](7) NOT NULL,
	[IsUsed] [bit] NOT NULL,
	[UsedAt] [datetime2](7) NULL,
	[CreatedAt] [datetime2](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[VoucherId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]

ALTER TABLE [dbo].[UserVouchers] ADD  DEFAULT ('cash') FOR [VoucherType]
ALTER TABLE [dbo].[UserVouchers] ADD  DEFAULT ((0)) FOR [IsUsed]
ALTER TABLE [dbo].[UserVouchers] ADD  DEFAULT (getutcdate()) FOR [CreatedAt]
ALTER TABLE [dbo].[UserVouchers]  WITH CHECK ADD  CONSTRAINT [FK_UserVouchers_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
ON DELETE CASCADE
ALTER TABLE [dbo].[UserVouchers] CHECK CONSTRAINT [FK_UserVouchers_Users]
END;
GO

-- -------------------------------------------------------------
-- Data for: [dbo].[Addresses] (8 rows)
-- -------------------------------------------------------------
SET IDENTITY_INSERT [dbo].[Addresses] ON;
INSERT INTO [dbo].[Addresses] ([AddressId], [UserId], [ReceiverName], [Phone], [Province], [District], [Ward], [AddressDetail], [Latitude], [Longitude], [IsDefault], [AddressType]) VALUES (1, 5, N'Nguyễn Minh Anh', N'0911000001', N'TP.HCM', N'Quận 1', N'Bến Nghé', N'25 Nguyễn Huệ', 10.77584360, 106.70098190, 1, NULL);
INSERT INTO [dbo].[Addresses] ([AddressId], [UserId], [ReceiverName], [Phone], [Province], [District], [Ward], [AddressDetail], [Latitude], [Longitude], [IsDefault], [AddressType]) VALUES (2, 5, N'Nguyễn Minh Anh', N'0911000001', N'TP.HCM', N'Thành phố Thủ Đức', N'Thảo Điền', N'18 Xuân Thủy', 10.80502660, 106.73970980, 0, NULL);
INSERT INTO [dbo].[Addresses] ([AddressId], [UserId], [ReceiverName], [Phone], [Province], [District], [Ward], [AddressDetail], [Latitude], [Longitude], [IsDefault], [AddressType]) VALUES (3, 6, N'Trần Gia Hân', N'0911000002', N'TP.HCM', N'Quận 3', N'Võ Thị Sáu', N'115 Võ Thị Sáu', 10.78401420, 106.68413200, 1, NULL);
INSERT INTO [dbo].[Addresses] ([AddressId], [UserId], [ReceiverName], [Phone], [Province], [District], [Ward], [AddressDetail], [Latitude], [Longitude], [IsDefault], [AddressType]) VALUES (4, 7, N'Lê Hoàng Nam', N'0911000003', N'TP.HCM', N'Quận 7', N'Tân Phong', N'42 Nguyễn Hữu Thọ', 10.73191200, 106.70541900, 1, NULL);
INSERT INTO [dbo].[Addresses] ([AddressId], [UserId], [ReceiverName], [Phone], [Province], [District], [Ward], [AddressDetail], [Latitude], [Longitude], [IsDefault], [AddressType]) VALUES (5, 8, N'Phạm Ngọc Mai', N'0911000004', N'TP.HCM', N'Bình Thạnh', N'25 Điện Biên Phủ', N'25 Điện Biên Phủ', 10.79987940, 106.71003040, 1, NULL);
INSERT INTO [dbo].[Addresses] ([AddressId], [UserId], [ReceiverName], [Phone], [Province], [District], [Ward], [AddressDetail], [Latitude], [Longitude], [IsDefault], [AddressType]) VALUES (6, 9, N'Võ Đức Minh', N'0911000005', N'TP.HCM', N'Tân Bình', N'Ward 4', N'120 Cộng Hòa', 10.80055000, 106.65049000, 1, NULL);
INSERT INTO [dbo].[Addresses] ([AddressId], [UserId], [ReceiverName], [Phone], [Province], [District], [Ward], [AddressDetail], [Latitude], [Longitude], [IsDefault], [AddressType]) VALUES (7, 10, N'Nguyễn Thảo Vy', N'0911000006', N'TP.HCM', N'Gò Vấp', N'Phường 10', N'88 Quang Trung', 10.83416600, 106.67018000, 1, NULL);
INSERT INTO [dbo].[Addresses] ([AddressId], [UserId], [ReceiverName], [Phone], [Province], [District], [Ward], [AddressDetail], [Latitude], [Longitude], [IsDefault], [AddressType]) VALUES (8, 11, N'Hung Quoc', N'0942367010', N'Tỉnh Hải Dương', N'Thành phố Hải Dương', N'Xã Quyết Thắng', N'aaa', NULL, NULL, 1, N'Nhà ở');
SET IDENTITY_INSERT [dbo].[Addresses] OFF;
GO

-- -------------------------------------------------------------
-- Data for: [dbo].[Batches] (14 rows)
-- -------------------------------------------------------------
SET IDENTITY_INSERT [dbo].[Batches] ON;
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (1, 1, 2, N'CT-260820-001', '2026-08-20 06:00:00.000', '2026-08-20 12:00:00.000', '2026-08-28 23:59:59.000', 120.00, N'kg', N'Active', '2026-08-20 12:00:00.000');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (2, 1, 1, N'CT-260817-001', '2026-08-17 06:00:00.000', '2026-08-17 12:00:00.000', '2026-08-24 23:59:59.000', 80.00, N'kg', N'Active', '2026-08-17 12:00:00.000');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (3, 2, 1, N'XL-260821-001', '2026-08-21 06:00:00.000', '2026-08-21 11:00:00.000', '2026-08-27 23:59:59.000', 100.00, N'kg', N'Active', '2026-08-21 11:00:00.000');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (4, 3, 1, N'NÐG-260819-001', '2026-08-19 06:00:00.000', '2026-08-19 11:00:00.000', '2026-08-29 23:59:59.000', 60.00, N'hộp', N'Active', '2026-08-19 11:00:00.000');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (5, 4, 2, N'DLC-260822-001', '2026-08-22 05:00:00.000', '2026-08-22 10:00:00.000', '2026-08-28 23:59:59.000', 80.00, N'hộp', N'Active', '2026-08-22 10:00:00.000');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (6, 5, 3, N'CCX-260821-001', '2026-08-21 06:00:00.000', '2026-08-21 10:00:00.000', '2026-08-25 23:59:59.000', 150.00, N'kg', N'Active', '2026-08-21 10:00:00.000');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (7, 6, 3, N'RM-260822-001', '2026-08-22 06:00:00.000', '2026-08-22 10:00:00.000', '2026-08-25 23:59:59.000', 130.00, N'kg', N'Active', '2026-08-22 10:00:00.000');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (8, 7, 4, N'NRI-260820-001', '2026-08-20 05:00:00.000', '2026-08-20 09:00:00.000', '2026-08-25 23:59:59.000', 50.00, N'kg', N'Active', '2026-08-20 09:00:00.000');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (9, 8, 4, N'DLO-260819-001', '2026-08-19 05:00:00.000', '2026-08-19 09:00:00.000', '2026-08-24 23:59:59.000', 90.00, N'kg', N'Active', '2026-08-19 09:00:00.000');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (10, 9, 5, N'CS-260815-001', '2026-08-15 05:00:00.000', '2026-08-15 12:00:00.000', '2026-08-30 23:59:59.000', 200.00, N'kg', N'Active', '2026-08-15 12:00:00.000');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (11, 10, 6, N'TL-260818-001', '2026-08-18 05:00:00.000', '2026-08-18 12:00:00.000', '2026-09-02 23:59:59.000', 180.00, N'kg', N'Active', '2026-08-18 12:00:00.000');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (12, 11, 6, N'XCC-260820-001', '2026-08-20 05:00:00.000', '2026-08-20 12:00:00.000', '2026-08-30 23:59:59.000', 140.00, N'kg', N'Active', '2026-08-20 12:00:00.000');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (13, 12, 5, N'OIQ-260819-001', '2026-08-19 05:00:00.000', '2026-08-19 12:00:00.000', '2026-08-27 23:59:59.000', 120.00, N'kg', N'Active', '2026-08-19 12:00:00.000');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (14, 8, 4, N'DLO-260810-001', '2026-08-10 05:00:00.000', '2026-08-10 09:00:00.000', '2026-08-20 23:59:59.000', 40.00, N'kg', N'Expired', '2026-08-10 09:00:00.000');
SET IDENTITY_INSERT [dbo].[Batches] OFF;
GO

-- -------------------------------------------------------------
-- Data for: [dbo].[CartItems] (11 rows)
-- -------------------------------------------------------------
SET IDENTITY_INSERT [dbo].[CartItems] ON;
INSERT INTO [dbo].[CartItems] ([CartItemId], [CartId], [ProductId], [Quantity]) VALUES (1, 1, 1, 2.00);
INSERT INTO [dbo].[CartItems] ([CartItemId], [CartId], [ProductId], [Quantity]) VALUES (2, 1, 2, 1.00);
INSERT INTO [dbo].[CartItems] ([CartItemId], [CartId], [ProductId], [Quantity]) VALUES (3, 1, 10, 2.00);
INSERT INTO [dbo].[CartItems] ([CartItemId], [CartId], [ProductId], [Quantity]) VALUES (4, 2, 5, 2.00);
INSERT INTO [dbo].[CartItems] ([CartItemId], [CartId], [ProductId], [Quantity]) VALUES (5, 2, 9, 1.00);
INSERT INTO [dbo].[CartItems] ([CartItemId], [CartId], [ProductId], [Quantity]) VALUES (6, 3, 4, 1.00);
INSERT INTO [dbo].[CartItems] ([CartItemId], [CartId], [ProductId], [Quantity]) VALUES (7, 3, 11, 2.00);
INSERT INTO [dbo].[CartItems] ([CartItemId], [CartId], [ProductId], [Quantity]) VALUES (8, 4, 6, 1.00);
INSERT INTO [dbo].[CartItems] ([CartItemId], [CartId], [ProductId], [Quantity]) VALUES (9, 4, 8, 2.00);
INSERT INTO [dbo].[CartItems] ([CartItemId], [CartId], [ProductId], [Quantity]) VALUES (10, 5, 3, 1.00);
INSERT INTO [dbo].[CartItems] ([CartItemId], [CartId], [ProductId], [Quantity]) VALUES (11, 6, 12, 2.00);
SET IDENTITY_INSERT [dbo].[CartItems] OFF;
GO

-- -------------------------------------------------------------
-- Data for: [dbo].[Carts] (6 rows)
-- -------------------------------------------------------------
SET IDENTITY_INSERT [dbo].[Carts] ON;
INSERT INTO [dbo].[Carts] ([CartId], [CustomerId], [CreatedAt], [UpdatedAt]) VALUES (1, 5, '2026-08-23 17:00:00.000', '2026-08-23 18:10:00.000');
INSERT INTO [dbo].[Carts] ([CartId], [CustomerId], [CreatedAt], [UpdatedAt]) VALUES (2, 6, '2026-08-23 16:00:00.000', '2026-08-23 18:20:00.000');
INSERT INTO [dbo].[Carts] ([CartId], [CustomerId], [CreatedAt], [UpdatedAt]) VALUES (3, 7, '2026-08-22 15:00:00.000', '2026-08-23 17:40:00.000');
INSERT INTO [dbo].[Carts] ([CartId], [CustomerId], [CreatedAt], [UpdatedAt]) VALUES (4, 8, '2026-08-21 10:00:00.000', '2026-08-22 19:00:00.000');
INSERT INTO [dbo].[Carts] ([CartId], [CustomerId], [CreatedAt], [UpdatedAt]) VALUES (5, 9, '2026-08-20 09:00:00.000', '2026-08-20 20:00:00.000');
INSERT INTO [dbo].[Carts] ([CartId], [CustomerId], [CreatedAt], [UpdatedAt]) VALUES (6, 10, '2026-08-20 11:00:00.000', '2026-08-21 20:00:00.000');
SET IDENTITY_INSERT [dbo].[Carts] OFF;
GO

-- -------------------------------------------------------------
-- Data for: [dbo].[Categories] (9 rows)
-- -------------------------------------------------------------
SET IDENTITY_INSERT [dbo].[Categories] ON;
INSERT INTO [dbo].[Categories] ([CategoryId], [CategoryName], [ParentCategoryId], [Status]) VALUES (1, N'Rau củ', NULL, N'Active');
INSERT INTO [dbo].[Categories] ([CategoryId], [CategoryName], [ParentCategoryId], [Status]) VALUES (2, N'Trái cây', NULL, N'Active');
INSERT INTO [dbo].[Categories] ([CategoryId], [CategoryName], [ParentCategoryId], [Status]) VALUES (3, N'Nấm', NULL, N'Active');
INSERT INTO [dbo].[Categories] ([CategoryId], [CategoryName], [ParentCategoryId], [Status]) VALUES (4, N'Rau ăn lá', 1, N'Active');
INSERT INTO [dbo].[Categories] ([CategoryId], [CategoryName], [ParentCategoryId], [Status]) VALUES (5, N'Cà chua', 1, N'Active');
INSERT INTO [dbo].[Categories] ([CategoryId], [CategoryName], [ParentCategoryId], [Status]) VALUES (6, N'Rau gia vị', 1, N'Active');
INSERT INTO [dbo].[Categories] ([CategoryId], [CategoryName], [ParentCategoryId], [Status]) VALUES (7, N'Dâu và quả mọng', 2, N'Active');
INSERT INTO [dbo].[Categories] ([CategoryId], [CategoryName], [ParentCategoryId], [Status]) VALUES (8, N'Cam quýt', 2, N'Active');
INSERT INTO [dbo].[Categories] ([CategoryId], [CategoryName], [ParentCategoryId], [Status]) VALUES (9, N'Trái cây nhiệt đới', 2, N'Active');
SET IDENTITY_INSERT [dbo].[Categories] OFF;
GO

-- -------------------------------------------------------------
-- Data for: [dbo].[Certifications] (4 rows)
-- -------------------------------------------------------------
SET IDENTITY_INSERT [dbo].[Certifications] ON;
INSERT INTO [dbo].[Certifications] ([CertificationId], [CertificationName], [IssuingOrganization], [CertificateCode], [IssuedDate], [ExpiryDate], [DocumentUrl], [Status]) VALUES (1, N'VietGAP', N'Đơn vị chứng nhận VietGAP', N'VG-DL-2026-001', '2026-01-10 00:00:00.000', '2027-01-10 00:00:00.000', N'https://example.local/certificates/vietgap-dalat.pdf', N'Active');
INSERT INTO [dbo].[Certifications] ([CertificationId], [CertificationName], [IssuingOrganization], [CertificateCode], [IssuedDate], [ExpiryDate], [DocumentUrl], [Status]) VALUES (2, N'VietGAP', N'Đơn vị chứng nhận VietGAP', N'VG-MT-2026-002', '2026-02-15 00:00:00.000', '2027-02-15 00:00:00.000', N'https://example.local/certificates/vietgap-mientay.pdf', N'Active');
INSERT INTO [dbo].[Certifications] ([CertificationId], [CertificationName], [IssuingOrganization], [CertificateCode], [IssuedDate], [ExpiryDate], [DocumentUrl], [Status]) VALUES (3, N'Organic', N'Tổ chức chứng nhận hữu cơ', N'ORG-MT-2026-003', '2026-03-05 00:00:00.000', '2027-03-05 00:00:00.000', N'https://example.local/certificates/organic-mientay.pdf', N'Active');
INSERT INTO [dbo].[Certifications] ([CertificationId], [CertificationName], [IssuingOrganization], [CertificateCode], [IssuedDate], [ExpiryDate], [DocumentUrl], [Status]) VALUES (4, N'VietGAP', N'Đơn vị chứng nhận VietGAP', N'VG-TC-2026-004', '2026-01-20 00:00:00.000', '2027-01-20 00:00:00.000', N'https://example.local/certificates/vietgap-traicay.pdf', N'Active');
SET IDENTITY_INSERT [dbo].[Certifications] OFF;
GO

-- -------------------------------------------------------------
-- Data for: [dbo].[Farms] (6 rows)
-- -------------------------------------------------------------
SET IDENTITY_INSERT [dbo].[Farms] ON;
INSERT INTO [dbo].[Farms] ([FarmId], [SupplierId], [FarmName], [Address], [Province], [District], [Latitude], [Longitude], [Area], [CropType], [ProductionStandard], [Status]) VALUES (1, 1, N'Vùng trồng Trại Mát', N'Trại Mát, Phường 11', N'Lâm Đồng', N'Đà Lạt', 11.97264800, 108.45689000, 8.50, N'Rau củ tổng hợp', N'VietGAP', N'Active');
INSERT INTO [dbo].[Farms] ([FarmId], [SupplierId], [FarmName], [Address], [Province], [District], [Latitude], [Longitude], [Area], [CropType], [ProductionStandard], [Status]) VALUES (2, 1, N'Vùng trồng Xuân Trường', N'Xuân Trường, Đà Lạt', N'Lâm Đồng', N'Đà Lạt', 12.00921000, 108.59642000, 5.20, N'Cà chua, dâu tây', N'VietGAP', N'Active');
INSERT INTO [dbo].[Farms] ([FarmId], [SupplierId], [FarmName], [Address], [Province], [District], [Latitude], [Longitude], [Area], [CropType], [ProductionStandard], [Status]) VALUES (3, 2, N'Vùng rau Châu Thành', N'Châu Thành', N'Đồng Tháp', N'Châu Thành', 10.25160000, 105.97390000, 12.00, N'Rau ăn lá', N'VietGAP', N'Active');
INSERT INTO [dbo].[Farms] ([FarmId], [SupplierId], [FarmName], [Address], [Province], [District], [Latitude], [Longitude], [Area], [CropType], [ProductionStandard], [Status]) VALUES (4, 2, N'Vùng rau Tân Hồng', N'Tân Hồng', N'Đồng Tháp', N'Tân Hồng', 10.87070000, 105.61300000, 9.50, N'Rau gia vị', N'Organic', N'Active');
INSERT INTO [dbo].[Farms] ([FarmId], [SupplierId], [FarmName], [Address], [Province], [District], [Latitude], [Longitude], [Area], [CropType], [ProductionStandard], [Status]) VALUES (5, 3, N'Vùng cam Long Khánh', N'Xuân Lộc', N'Đồng Nai', N'Long Khánh', 10.92710000, 107.24300000, 18.00, N'Cam, quýt', N'VietGAP', N'Active');
INSERT INTO [dbo].[Farms] ([FarmId], [SupplierId], [FarmName], [Address], [Province], [District], [Latitude], [Longitude], [Area], [CropType], [ProductionStandard], [Status]) VALUES (6, 3, N'Vùng thanh long Bình Thuận', N'Bắc Bình', N'Bình Thuận', N'Bắc Bình', 11.30650000, 108.11150000, 24.00, N'Thanh long', N'VietGAP', N'Active');
SET IDENTITY_INSERT [dbo].[Farms] OFF;
GO

-- -------------------------------------------------------------
-- Data for: [dbo].[Inventories] (14 rows)
-- -------------------------------------------------------------
SET IDENTITY_INSERT [dbo].[Inventories] ON;
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (1, 1, 95.00, 8.00, 15.00, '2026-08-23 18:00:00.000');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (2, 2, 10.00, 0.00, 10.00, '2026-08-23 18:00:00.000');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (3, 3, 82.00, 5.00, 15.00, '2026-08-23 18:00:00.000');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (4, 4, 40.00, 0.00, 8.00, '2026-08-23 18:00:00.000');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (5, 5, 62.00, 3.00, 10.00, '2026-08-23 18:00:00.000');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (6, 6, 100.00, 12.00, 20.00, '2026-08-23 18:00:00.000');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (7, 7, 80.00, 10.00, 20.00, '2026-08-23 18:00:00.000');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (8, 8, 35.00, 4.00, 10.00, '2026-08-23 18:00:00.000');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (9, 9, 22.00, 5.00, 10.00, '2026-08-23 18:00:00.000');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (10, 10, 150.00, 8.00, 20.00, '2026-08-23 18:00:00.000');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (11, 11, 135.00, 10.00, 20.00, '2026-08-23 18:00:00.000');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (12, 12, 120.00, 12.00, 20.00, '2026-08-23 18:00:00.000');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (13, 13, 90.00, 3.00, 15.00, '2026-08-23 18:00:00.000');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (14, 14, 0.00, 0.00, 5.00, '2026-08-23 18:00:00.000');
SET IDENTITY_INSERT [dbo].[Inventories] OFF;
GO

-- -------------------------------------------------------------
-- Data for: [dbo].[MembershipTiers] (4 rows)
-- -------------------------------------------------------------
SET IDENTITY_INSERT [dbo].[MembershipTiers] ON;
INSERT INTO [dbo].[MembershipTiers] ([TierId], [TierName], [MinSpend], [PointRate], [Description], [Icon], [CreatedAt]) VALUES (1, N'Mới', 0.00, 0.0100, N'Tích 1% giá trị đơn hàng', N'🌱', '2026-09-10 21:48:07.422');
INSERT INTO [dbo].[MembershipTiers] ([TierId], [TierName], [MinSpend], [PointRate], [Description], [Icon], [CreatedAt]) VALUES (2, N'Bạc', 2000000.00, 0.0150, N'Tích 1.5%, 1 Freeship/tháng', N'🥈', '2026-09-10 21:48:07.422');
INSERT INTO [dbo].[MembershipTiers] ([TierId], [TierName], [MinSpend], [PointRate], [Description], [Icon], [CreatedAt]) VALUES (3, N'Vàng', 5000000.00, 0.0200, N'Tích 2%, 3 Freeship/tháng, quà sinh nhật', N'🥇', '2026-09-10 21:48:07.422');
INSERT INTO [dbo].[MembershipTiers] ([TierId], [TierName], [MinSpend], [PointRate], [Description], [Icon], [CreatedAt]) VALUES (4, N'Kim Cương', 10000000.00, 0.0300, N'Tích 3%, Freeship trọn đời, tài trợ cây giống', N'💎', '2026-09-10 21:48:07.422');
SET IDENTITY_INSERT [dbo].[MembershipTiers] OFF;
GO

-- -------------------------------------------------------------
-- Data for: [dbo].[Notifications] (10 rows)
-- -------------------------------------------------------------
SET IDENTITY_INSERT [dbo].[Notifications] ON;
INSERT INTO [dbo].[Notifications] ([NotificationId], [UserId], [Type], [Title], [Message], [ReferenceId], [IsRead], [CreatedAt]) VALUES (1, 5, N'ORDER_STATUS', N'Đơn hàng đã hoàn tất', N'Đơn ORD-260815-0001 đã hoàn tất. Bạn có thể đánh giá sản phẩm.', N'1', 1, '2026-08-17 16:05:00.000');
INSERT INTO [dbo].[Notifications] ([NotificationId], [UserId], [Type], [Title], [Message], [ReferenceId], [IsRead], [CreatedAt]) VALUES (2, 6, N'ORDER_STATUS', N'Đơn hàng đang được giao', N'Đơn ORD-260817-0002 đã chuyển sang trạng thái hoàn tất.', N'2', 1, '2026-08-19 15:05:00.000');
INSERT INTO [dbo].[Notifications] ([NotificationId], [UserId], [Type], [Title], [Message], [ReferenceId], [IsRead], [CreatedAt]) VALUES (3, 7, N'ORDER_STATUS', N'Đơn hàng đã hoàn tất', N'Đơn ORD-260819-0003 đã hoàn tất.', N'3', 1, '2026-08-21 18:05:00.000');
INSERT INTO [dbo].[Notifications] ([NotificationId], [UserId], [Type], [Title], [Message], [ReferenceId], [IsRead], [CreatedAt]) VALUES (4, 8, N'PROMOTION', N'Khuyến mãi rau sạch', N'Rau sạch cuối tuần đang giảm 10% cho đơn từ 100.000đ.', N'1', 0, '2026-08-23 08:00:00.000');
INSERT INTO [dbo].[Notifications] ([NotificationId], [UserId], [Type], [Title], [Message], [ReferenceId], [IsRead], [CreatedAt]) VALUES (5, 9, N'EXPIRY_WARNING', N'Lô hàng sắp hết hạn', N'Dưa leo hữu cơ của một lô sẽ hết hạn trong 1 ngày.', N'14', 0, '2026-08-23 08:10:00.000');
INSERT INTO [dbo].[Notifications] ([NotificationId], [UserId], [Type], [Title], [Message], [ReferenceId], [IsRead], [CreatedAt]) VALUES (6, 2, N'EXPIRY_WARNING', N'Cảnh báo tồn kho', N'Cà chua bi lô CT-260817-001 sắp hết hàng và gần hết hạn.', N'2', 0, '2026-08-23 08:20:00.000');
INSERT INTO [dbo].[Notifications] ([NotificationId], [UserId], [Type], [Title], [Message], [ReferenceId], [IsRead], [CreatedAt]) VALUES (7, 3, N'EXPIRY_WARNING', N'Cảnh báo lô hàng', N'Dưa leo hữu cơ lô DLO-260819-001 chỉ còn ít ngày sử dụng.', N'9', 0, '2026-08-23 08:30:00.000');
INSERT INTO [dbo].[Notifications] ([NotificationId], [UserId], [Type], [Title], [Message], [ReferenceId], [IsRead], [CreatedAt]) VALUES (8, 4, N'ORDER_STATUS', N'Có đơn hàng mới', N'Đơn ORD-260823-0010 đang chờ xử lý.', N'10', 0, '2026-08-23 14:25:00.000');
INSERT INTO [dbo].[Notifications] ([NotificationId], [UserId], [Type], [Title], [Message], [ReferenceId], [IsRead], [CreatedAt]) VALUES (9, 5, N'RECOMMENDATION', N'Gợi ý mới dành cho bạn', N'Cà chua bi và dâu tây đang được gợi ý dựa trên hành vi mua gần đây.', N'1', 0, '2026-08-23 16:30:00.000');
INSERT INTO [dbo].[Notifications] ([NotificationId], [UserId], [Type], [Title], [Message], [ReferenceId], [IsRead], [CreatedAt]) VALUES (10, 6, N'RECOMMENDATION', N'Nông sản đang vào mùa', N'Xoài cát chu và thanh long đang được ưu tiên trong gợi ý.', N'11', 0, '2026-08-23 16:35:00.000');
SET IDENTITY_INSERT [dbo].[Notifications] OFF;
GO

-- -------------------------------------------------------------
-- Data for: [dbo].[OrderItems] (68 rows)
-- -------------------------------------------------------------
SET IDENTITY_INSERT [dbo].[OrderItems] ON;
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (1, 1, 1, 2, 2.00, 68000.00, 0.00, 136000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (2, 1, 2, 3, 1.00, 45000.00, 0.00, 45000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (3, 1, 10, 11, 1.00, 65000.00, 0.00, 65000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (4, 2, 5, 6, 2.00, 32000.00, 0.00, 64000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (5, 2, 9, 10, 2.00, 52000.00, 0.00, 104000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (6, 3, 4, 5, 1.00, 145000.00, 0.00, 145000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (7, 3, 11, 12, 1.00, 75000.00, 0.00, 75000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (8, 3, 7, 8, 1.00, 55000.00, 0.00, 55000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (9, 4, 6, 7, 2.00, 28000.00, 0.00, 56000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (10, 4, 8, 9, 2.00, 42000.00, 0.00, 84000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (11, 4, 12, 13, 1.00, 48000.00, 0.00, 48000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (12, 5, 3, 4, 1.00, 82000.00, 0.00, 82000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (13, 5, 9, 10, 2.00, 52000.00, 0.00, 104000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (14, 6, 1, 2, 1.00, 68000.00, 0.00, 68000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (15, 6, 8, 9, 2.00, 42000.00, 0.00, 84000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (16, 7, 1, 2, 2.00, 68000.00, 0.00, 136000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (17, 7, 2, 3, 2.00, 45000.00, 0.00, 90000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (18, 8, 5, 6, 2.00, 32000.00, 0.00, 64000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (19, 8, 9, 10, 1.00, 52000.00, 0.00, 52000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (20, 8, 4, 5, 1.00, 145000.00, 0.00, 145000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (21, 9, 10, 11, 2.00, 65000.00, 0.00, 130000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (22, 9, 12, 13, 1.00, 48000.00, 0.00, 48000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (23, 9, 7, 8, 1.00, 55000.00, 0.00, 55000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (24, 10, 4, 5, 1.00, 145000.00, 0.00, 145000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (25, 11, 6, 7, 1.00, 28000.00, 0.00, 28000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (26, 11, 8, 9, 1.00, 42000.00, 0.00, 42000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (27, 12, 4, 5, 1.00, 145000.00, 0.00, 145000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (28, 13, 8, 9, 7.00, 42000.00, 0.00, 294000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (29, 13, 12, 13, 12.00, 48000.00, 0.00, 576000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (30, 13, 11, 12, 3.00, 75000.00, 0.00, 225000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (31, 14, 11, 12, 3.00, 75000.00, 0.00, 225000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (32, 14, 10, 11, 3.00, 65000.00, 0.00, 195000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (33, 15, 11, 12, 3.00, 75000.00, 0.00, 225000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (34, 15, 10, 11, 3.00, 65000.00, 0.00, 195000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (35, 16, 11, 12, 3.00, 75000.00, 0.00, 225000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (36, 16, 10, 11, 3.00, 65000.00, 0.00, 195000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (37, 17, 11, 12, 3.00, 75000.00, 0.00, 225000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (38, 17, 10, 11, 3.00, 65000.00, 0.00, 195000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (39, 18, 11, 12, 3.00, 75000.00, 0.00, 225000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (40, 18, 10, 11, 3.00, 65000.00, 0.00, 195000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (41, 19, 11, 12, 6.00, 75000.00, 0.00, 450000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (42, 19, 10, 11, 6.00, 65000.00, 0.00, 390000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (43, 20, 11, 12, 6.00, 75000.00, 0.00, 450000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (44, 20, 10, 11, 6.00, 65000.00, 0.00, 390000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (45, 21, 1, 1, 1.00, 68000.00, 0.00, 68000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (46, 22, 11, 12, 6.00, 75000.00, 0.00, 450000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (47, 22, 10, 11, 6.00, 65000.00, 0.00, 390000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (48, 23, 11, 12, 6.00, 75000.00, 0.00, 450000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (49, 23, 10, 11, 6.00, 65000.00, 0.00, 390000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (50, 24, 11, 12, 6.00, 75000.00, 0.00, 450000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (51, 24, 10, 11, 6.00, 65000.00, 0.00, 390000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (52, 25, 11, 12, 6.00, 75000.00, 0.00, 450000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (53, 25, 10, 11, 6.00, 65000.00, 0.00, 390000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (54, 26, 11, 12, 6.00, 75000.00, 0.00, 450000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (55, 26, 10, 11, 6.00, 65000.00, 0.00, 390000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (56, 27, 11, 12, 6.00, 75000.00, 0.00, 450000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (57, 27, 10, 11, 6.00, 65000.00, 0.00, 390000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (58, 28, 11, 12, 6.00, 75000.00, 0.00, 450000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (59, 28, 10, 11, 6.00, 65000.00, 0.00, 390000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (60, 29, 11, 12, 7.00, 75000.00, 0.00, 525000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (61, 29, 10, 11, 6.00, 65000.00, 0.00, 390000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (62, 29, 12, 13, 8.00, 48000.00, 0.00, 384000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (63, 30, 11, 12, 8.00, 75000.00, 0.00, 600000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (64, 30, 10, 11, 6.00, 65000.00, 0.00, 390000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (65, 30, 12, 13, 8.00, 48000.00, 0.00, 384000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (66, 31, 11, 12, 8.00, 75000.00, 0.00, 600000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (67, 31, 10, 11, 6.00, 65000.00, 0.00, 390000.00);
INSERT INTO [dbo].[OrderItems] ([OrderItemId], [OrderId], [ProductId], [BatchId], [Quantity], [UnitPrice], [DiscountAmount], [TotalAmount]) VALUES (68, 31, 12, 13, 8.00, 48000.00, 0.00, 384000.00);
SET IDENTITY_INSERT [dbo].[OrderItems] OFF;
GO

-- -------------------------------------------------------------
-- Data for: [dbo].[Orders] (31 rows)
-- -------------------------------------------------------------
SET IDENTITY_INSERT [dbo].[Orders] ON;
INSERT INTO [dbo].[Orders] ([OrderId], [CustomerId], [OrderCode], [AddressId], [Subtotal], [DiscountAmount], [ShippingFee], [TotalAmount], [PaymentMethod], [PaymentStatus], [OrderStatus], [CreatedAt], [UpdatedAt]) VALUES (1, 5, N'ORD-260815-0001', 1, 246000.00, 20000.00, 20000.00, 246000.00, N'COD', N'Paid', N'Completed', '2026-08-15 09:00:00.000', '2026-08-17 16:00:00.000');
INSERT INTO [dbo].[Orders] ([OrderId], [CustomerId], [OrderCode], [AddressId], [Subtotal], [DiscountAmount], [ShippingFee], [TotalAmount], [PaymentMethod], [PaymentStatus], [OrderStatus], [CreatedAt], [UpdatedAt]) VALUES (2, 6, N'ORD-260817-0002', 3, 168000.00, 10000.00, 20000.00, 178000.00, N'COD', N'Paid', N'Completed', '2026-08-17 11:00:00.000', '2026-08-19 15:00:00.000');
INSERT INTO [dbo].[Orders] ([OrderId], [CustomerId], [OrderCode], [AddressId], [Subtotal], [DiscountAmount], [ShippingFee], [TotalAmount], [PaymentMethod], [PaymentStatus], [OrderStatus], [CreatedAt], [UpdatedAt]) VALUES (3, 7, N'ORD-260819-0003', 4, 275000.00, 0.00, 20000.00, 295000.00, N'COD', N'Paid', N'Completed', '2026-08-19 10:00:00.000', '2026-08-21 18:00:00.000');
INSERT INTO [dbo].[Orders] ([OrderId], [CustomerId], [OrderCode], [AddressId], [Subtotal], [DiscountAmount], [ShippingFee], [TotalAmount], [PaymentMethod], [PaymentStatus], [OrderStatus], [CreatedAt], [UpdatedAt]) VALUES (4, 8, N'ORD-260820-0004', 5, 188000.00, 20000.00, 20000.00, 188000.00, N'MOMO', N'Paid', N'Shipping', '2026-08-20 13:00:00.000', '2026-08-22 09:00:00.000');
INSERT INTO [dbo].[Orders] ([OrderId], [CustomerId], [OrderCode], [AddressId], [Subtotal], [DiscountAmount], [ShippingFee], [TotalAmount], [PaymentMethod], [PaymentStatus], [OrderStatus], [CreatedAt], [UpdatedAt]) VALUES (5, 9, N'ORD-260821-0005', 6, 186000.00, 0.00, 20000.00, 206000.00, N'COD', N'Unpaid', N'Processing', '2026-08-21 10:00:00.000', '2026-08-22 12:00:00.000');
INSERT INTO [dbo].[Orders] ([OrderId], [CustomerId], [OrderCode], [AddressId], [Subtotal], [DiscountAmount], [ShippingFee], [TotalAmount], [PaymentMethod], [PaymentStatus], [OrderStatus], [CreatedAt], [UpdatedAt]) VALUES (6, 10, N'ORD-260821-0006', 7, 152000.00, 15000.00, 20000.00, 157000.00, N'COD', N'Unpaid', N'Pending', '2026-08-21 15:00:00.000', '2026-08-21 15:00:00.000');
INSERT INTO [dbo].[Orders] ([OrderId], [CustomerId], [OrderCode], [AddressId], [Subtotal], [DiscountAmount], [ShippingFee], [TotalAmount], [PaymentMethod], [PaymentStatus], [OrderStatus], [CreatedAt], [UpdatedAt]) VALUES (7, 5, N'ORD-260822-0007', 1, 226000.00, 0.00, 20000.00, 246000.00, N'COD', N'Unpaid', N'Cancelled', '2026-08-22 09:30:00.000', '2026-08-22 10:00:00.000');
INSERT INTO [dbo].[Orders] ([OrderId], [CustomerId], [OrderCode], [AddressId], [Subtotal], [DiscountAmount], [ShippingFee], [TotalAmount], [PaymentMethod], [PaymentStatus], [OrderStatus], [CreatedAt], [UpdatedAt]) VALUES (8, 6, N'ORD-260823-0008', 3, 261000.00, 10000.00, 20000.00, 271000.00, N'COD', N'Unpaid', N'Pending', '2026-08-23 09:30:00.000', '2026-08-23 09:35:00.000');
INSERT INTO [dbo].[Orders] ([OrderId], [CustomerId], [OrderCode], [AddressId], [Subtotal], [DiscountAmount], [ShippingFee], [TotalAmount], [PaymentMethod], [PaymentStatus], [OrderStatus], [CreatedAt], [UpdatedAt]) VALUES (9, 7, N'ORD-260823-0009', 4, 233000.00, 0.00, 20000.00, 253000.00, N'COD', N'Unpaid', N'Pending', '2026-08-23 11:15:00.000', '2026-08-23 11:16:00.000');
INSERT INTO [dbo].[Orders] ([OrderId], [CustomerId], [OrderCode], [AddressId], [Subtotal], [DiscountAmount], [ShippingFee], [TotalAmount], [PaymentMethod], [PaymentStatus], [OrderStatus], [CreatedAt], [UpdatedAt]) VALUES (10, 8, N'ORD-260823-0010', 5, 145000.00, 10000.00, 20000.00, 155000.00, N'MOMO', N'Paid', N'Processing', '2026-08-23 14:20:00.000', '2026-08-23 14:25:00.000');
INSERT INTO [dbo].[Orders] ([OrderId], [CustomerId], [OrderCode], [AddressId], [Subtotal], [DiscountAmount], [ShippingFee], [TotalAmount], [PaymentMethod], [PaymentStatus], [OrderStatus], [CreatedAt], [UpdatedAt]) VALUES (11, 8, N'ORD-260822-0011', 5, 70000.00, 0.00, 20000.00, 90000.00, N'COD', N'Paid', N'Completed', '2026-08-22 16:00:00.000', '2026-08-23 10:00:00.000');
INSERT INTO [dbo].[Orders] ([OrderId], [CustomerId], [OrderCode], [AddressId], [Subtotal], [DiscountAmount], [ShippingFee], [TotalAmount], [PaymentMethod], [PaymentStatus], [OrderStatus], [CreatedAt], [UpdatedAt]) VALUES (12, 10, N'ORD-260823-0012', 7, 145000.00, 0.00, 20000.00, 165000.00, N'MOMO', N'Paid', N'Completed', '2026-08-23 15:00:00.000', '2026-08-23 18:00:00.000');
INSERT INTO [dbo].[Orders] ([OrderId], [CustomerId], [OrderCode], [AddressId], [Subtotal], [DiscountAmount], [ShippingFee], [TotalAmount], [PaymentMethod], [PaymentStatus], [OrderStatus], [CreatedAt], [UpdatedAt]) VALUES (13, 11, N'DH-20260911-8310', 8, 1095000.00, 0.00, 30000.00, 1125000.00, N'BANK', N'Pending', N'Cancelled', '2026-09-10 23:06:27.088', '2026-09-11 09:22:39.759');
INSERT INTO [dbo].[Orders] ([OrderId], [CustomerId], [OrderCode], [AddressId], [Subtotal], [DiscountAmount], [ShippingFee], [TotalAmount], [PaymentMethod], [PaymentStatus], [OrderStatus], [CreatedAt], [UpdatedAt]) VALUES (14, 11, N'DH-20260911-2093', 8, 420000.00, 20000.00, 30000.00, 430000.00, N'BANK', N'Pending', N'Cancelled', '2026-09-10 23:25:58.512', '2026-09-11 09:22:39.759');
INSERT INTO [dbo].[Orders] ([OrderId], [CustomerId], [OrderCode], [AddressId], [Subtotal], [DiscountAmount], [ShippingFee], [TotalAmount], [PaymentMethod], [PaymentStatus], [OrderStatus], [CreatedAt], [UpdatedAt]) VALUES (15, 11, N'DH-20260911-4365', 8, 420000.00, 50000.00, 30000.00, 400000.00, N'COD', N'Pending', N'Pending', '2026-09-10 23:28:08.652', '2026-09-10 23:28:08.652');
INSERT INTO [dbo].[Orders] ([OrderId], [CustomerId], [OrderCode], [AddressId], [Subtotal], [DiscountAmount], [ShippingFee], [TotalAmount], [PaymentMethod], [PaymentStatus], [OrderStatus], [CreatedAt], [UpdatedAt]) VALUES (16, 11, N'DH-20260911-2723', 8, 420000.00, 0.00, 30000.00, 450000.00, N'MOMO', N'Pending', N'Cancelled', '2026-09-10 23:29:54.621', '2026-09-11 09:22:39.759');
INSERT INTO [dbo].[Orders] ([OrderId], [CustomerId], [OrderCode], [AddressId], [Subtotal], [DiscountAmount], [ShippingFee], [TotalAmount], [PaymentMethod], [PaymentStatus], [OrderStatus], [CreatedAt], [UpdatedAt]) VALUES (17, 11, N'DH-20260911-6980', 8, 420000.00, 0.00, 30000.00, 450000.00, N'COD', N'Pending', N'Pending', '2026-09-10 23:30:43.717', '2026-09-10 23:30:43.717');
INSERT INTO [dbo].[Orders] ([OrderId], [CustomerId], [OrderCode], [AddressId], [Subtotal], [DiscountAmount], [ShippingFee], [TotalAmount], [PaymentMethod], [PaymentStatus], [OrderStatus], [CreatedAt], [UpdatedAt]) VALUES (18, 11, N'DH-20260911-6151', 8, 420000.00, 0.00, 30000.00, 450000.00, N'MOMO', N'Pending', N'Cancelled', '2026-09-10 23:30:52.272', '2026-09-11 09:22:39.759');
INSERT INTO [dbo].[Orders] ([OrderId], [CustomerId], [OrderCode], [AddressId], [Subtotal], [DiscountAmount], [ShippingFee], [TotalAmount], [PaymentMethod], [PaymentStatus], [OrderStatus], [CreatedAt], [UpdatedAt]) VALUES (19, 11, N'DH-20260911-1358', 8, 840000.00, 0.00, 30000.00, 870000.00, N'BANK', N'Pending', N'Cancelled', '2026-09-11 01:31:33.999', '2026-09-11 08:36:52.324');
INSERT INTO [dbo].[Orders] ([OrderId], [CustomerId], [OrderCode], [AddressId], [Subtotal], [DiscountAmount], [ShippingFee], [TotalAmount], [PaymentMethod], [PaymentStatus], [OrderStatus], [CreatedAt], [UpdatedAt]) VALUES (20, 11, N'DH-20260911-9727', 8, 840000.00, 0.00, 30000.00, 870000.00, N'COD', N'Pending', N'Cancelled', '2026-09-11 01:31:57.368', '2026-09-11 01:32:31.695');
INSERT INTO [dbo].[Orders] ([OrderId], [CustomerId], [OrderCode], [AddressId], [Subtotal], [DiscountAmount], [ShippingFee], [TotalAmount], [PaymentMethod], [PaymentStatus], [OrderStatus], [CreatedAt], [UpdatedAt]) VALUES (21, 5, N'DH-20260911-3241', 1, 68000.00, 0.00, 30000.00, 98000.00, N'COD', N'Pending', N'Cancelled', '2026-09-11 08:35:05.459', '2026-09-11 08:35:06.032');
INSERT INTO [dbo].[Orders] ([OrderId], [CustomerId], [OrderCode], [AddressId], [Subtotal], [DiscountAmount], [ShippingFee], [TotalAmount], [PaymentMethod], [PaymentStatus], [OrderStatus], [CreatedAt], [UpdatedAt]) VALUES (22, 11, N'DH-20260911-9404', 8, 840000.00, 0.00, 30000.00, 870000.00, N'COD', N'Pending', N'Cancelled', '2026-09-11 08:37:11.706', '2026-09-11 08:37:17.151');
INSERT INTO [dbo].[Orders] ([OrderId], [CustomerId], [OrderCode], [AddressId], [Subtotal], [DiscountAmount], [ShippingFee], [TotalAmount], [PaymentMethod], [PaymentStatus], [OrderStatus], [CreatedAt], [UpdatedAt]) VALUES (23, 11, N'DH-20260911-1629', 8, 840000.00, 0.00, 30000.00, 870000.00, N'BANK', N'Pending', N'Cancelled', '2026-09-11 08:37:26.718', '2026-09-11 08:46:09.565');
INSERT INTO [dbo].[Orders] ([OrderId], [CustomerId], [OrderCode], [AddressId], [Subtotal], [DiscountAmount], [ShippingFee], [TotalAmount], [PaymentMethod], [PaymentStatus], [OrderStatus], [CreatedAt], [UpdatedAt]) VALUES (24, 11, N'DH-20260911-9004', 8, 840000.00, 0.00, 30000.00, 870000.00, N'MOMO', N'Pending', N'Cancelled', '2026-09-11 08:46:14.060', '2026-09-11 08:49:30.070');
INSERT INTO [dbo].[Orders] ([OrderId], [CustomerId], [OrderCode], [AddressId], [Subtotal], [DiscountAmount], [ShippingFee], [TotalAmount], [PaymentMethod], [PaymentStatus], [OrderStatus], [CreatedAt], [UpdatedAt]) VALUES (25, 11, N'DH-20260911-6729', 8, 840000.00, 0.00, 30000.00, 870000.00, N'BANK', N'Pending', N'Cancelled', '2026-09-11 08:46:35.709', '2026-09-11 08:49:26.393');
INSERT INTO [dbo].[Orders] ([OrderId], [CustomerId], [OrderCode], [AddressId], [Subtotal], [DiscountAmount], [ShippingFee], [TotalAmount], [PaymentMethod], [PaymentStatus], [OrderStatus], [CreatedAt], [UpdatedAt]) VALUES (26, 11, N'DH-20260911-2971', 8, 840000.00, 0.00, 30000.00, 870000.00, N'MOMO', N'Pending', N'Cancelled', '2026-09-11 08:46:50.569', '2026-09-11 08:49:24.174');
INSERT INTO [dbo].[Orders] ([OrderId], [CustomerId], [OrderCode], [AddressId], [Subtotal], [DiscountAmount], [ShippingFee], [TotalAmount], [PaymentMethod], [PaymentStatus], [OrderStatus], [CreatedAt], [UpdatedAt]) VALUES (27, 11, N'DH-20260911-3917', 8, 840000.00, 0.00, 30000.00, 870000.00, N'BANK', N'Pending', N'Cancelled', '2026-09-11 08:47:18.788', '2026-09-11 08:49:21.199');
INSERT INTO [dbo].[Orders] ([OrderId], [CustomerId], [OrderCode], [AddressId], [Subtotal], [DiscountAmount], [ShippingFee], [TotalAmount], [PaymentMethod], [PaymentStatus], [OrderStatus], [CreatedAt], [UpdatedAt]) VALUES (28, 11, N'DH-20260911-4482', 8, 840000.00, 0.00, 30000.00, 870000.00, N'BANK', N'Pending', N'Cancelled', '2026-09-11 08:51:48.967', '2026-09-11 08:55:40.941');
INSERT INTO [dbo].[Orders] ([OrderId], [CustomerId], [OrderCode], [AddressId], [Subtotal], [DiscountAmount], [ShippingFee], [TotalAmount], [PaymentMethod], [PaymentStatus], [OrderStatus], [CreatedAt], [UpdatedAt]) VALUES (29, 11, N'DH-20260911-9367', 8, 1299000.00, 0.00, 30000.00, 1329000.00, N'BANK', N'Pending', N'Cancelled', '2026-09-11 09:02:07.685', '2026-09-11 09:03:15.887');
INSERT INTO [dbo].[Orders] ([OrderId], [CustomerId], [OrderCode], [AddressId], [Subtotal], [DiscountAmount], [ShippingFee], [TotalAmount], [PaymentMethod], [PaymentStatus], [OrderStatus], [CreatedAt], [UpdatedAt]) VALUES (30, 11, N'DH-20260911-6836', 8, 1374000.00, 0.00, 30000.00, 1404000.00, N'BANK', N'Pending', N'Cancelled', '2026-09-11 09:18:08.718', '2026-09-11 09:18:39.820');
INSERT INTO [dbo].[Orders] ([OrderId], [CustomerId], [OrderCode], [AddressId], [Subtotal], [DiscountAmount], [ShippingFee], [TotalAmount], [PaymentMethod], [PaymentStatus], [OrderStatus], [CreatedAt], [UpdatedAt]) VALUES (31, 11, N'DH-20260911-6654', 8, 1374000.00, 0.00, 30000.00, 1404000.00, N'BANK', N'Pending', N'Cancelled', '2026-09-11 10:01:18.177', '2026-09-11 10:01:43.633');
SET IDENTITY_INSERT [dbo].[Orders] OFF;
GO

-- -------------------------------------------------------------
-- Data for: [dbo].[Payments] (12 rows)
-- -------------------------------------------------------------
SET IDENTITY_INSERT [dbo].[Payments] ON;
INSERT INTO [dbo].[Payments] ([PaymentId], [OrderId], [PaymentMethod], [Amount], [TransactionCode], [Status], [PaidAt]) VALUES (1, 1, N'COD', 246000.00, N'COD-ORD1', N'Success', '2026-08-17 16:00:00.000');
INSERT INTO [dbo].[Payments] ([PaymentId], [OrderId], [PaymentMethod], [Amount], [TransactionCode], [Status], [PaidAt]) VALUES (2, 2, N'COD', 178000.00, N'COD-ORD2', N'Success', '2026-08-19 15:00:00.000');
INSERT INTO [dbo].[Payments] ([PaymentId], [OrderId], [PaymentMethod], [Amount], [TransactionCode], [Status], [PaidAt]) VALUES (3, 3, N'COD', 295000.00, N'COD-ORD3', N'Success', '2026-08-21 18:00:00.000');
INSERT INTO [dbo].[Payments] ([PaymentId], [OrderId], [PaymentMethod], [Amount], [TransactionCode], [Status], [PaidAt]) VALUES (4, 4, N'MOMO', 188000.00, N'MOMO-DEMO-004', N'Success', '2026-08-20 13:05:00.000');
INSERT INTO [dbo].[Payments] ([PaymentId], [OrderId], [PaymentMethod], [Amount], [TransactionCode], [Status], [PaidAt]) VALUES (5, 5, N'COD', 206000.00, NULL, N'Pending', NULL);
INSERT INTO [dbo].[Payments] ([PaymentId], [OrderId], [PaymentMethod], [Amount], [TransactionCode], [Status], [PaidAt]) VALUES (6, 6, N'COD', 157000.00, NULL, N'Pending', NULL);
INSERT INTO [dbo].[Payments] ([PaymentId], [OrderId], [PaymentMethod], [Amount], [TransactionCode], [Status], [PaidAt]) VALUES (7, 7, N'COD', 246000.00, NULL, N'Failed', NULL);
INSERT INTO [dbo].[Payments] ([PaymentId], [OrderId], [PaymentMethod], [Amount], [TransactionCode], [Status], [PaidAt]) VALUES (8, 8, N'COD', 271000.00, NULL, N'Pending', NULL);
INSERT INTO [dbo].[Payments] ([PaymentId], [OrderId], [PaymentMethod], [Amount], [TransactionCode], [Status], [PaidAt]) VALUES (9, 9, N'COD', 253000.00, NULL, N'Pending', NULL);
INSERT INTO [dbo].[Payments] ([PaymentId], [OrderId], [PaymentMethod], [Amount], [TransactionCode], [Status], [PaidAt]) VALUES (10, 10, N'MOMO', 155000.00, N'MOMO-DEMO-010', N'Success', '2026-08-23 14:25:00.000');
INSERT INTO [dbo].[Payments] ([PaymentId], [OrderId], [PaymentMethod], [Amount], [TransactionCode], [Status], [PaidAt]) VALUES (11, 11, N'COD', 90000.00, N'COD-ORD11', N'Success', '2026-08-23 10:00:00.000');
INSERT INTO [dbo].[Payments] ([PaymentId], [OrderId], [PaymentMethod], [Amount], [TransactionCode], [Status], [PaidAt]) VALUES (12, 12, N'MOMO', 165000.00, N'MOMO-DEMO-012', N'Success', '2026-08-23 18:00:00.000');
SET IDENTITY_INSERT [dbo].[Payments] OFF;
GO

-- -------------------------------------------------------------
-- Data for: [dbo].[PointTransactions] (8 rows)
-- -------------------------------------------------------------
SET IDENTITY_INSERT [dbo].[PointTransactions] ON;
INSERT INTO [dbo].[PointTransactions] ([TransactionId], [UserId], [OrderId], [PointsDelta], [TransactionType], [Description], [CreatedAt]) VALUES (1, 1, NULL, 1850, N'Earn', N'Mua đơn hàng #ORD-84920 (Dâu tây & Bơ sáp)', '2026-09-09 21:48:08.261');
INSERT INTO [dbo].[PointTransactions] ([TransactionId], [UserId], [OrderId], [PointsDelta], [TransactionType], [Description], [CreatedAt]) VALUES (2, 1, NULL, 100, N'Bonus', N'Check-in quét mã QR nguồn gốc dưa lưới IoT', '2026-09-07 21:48:08.261');
INSERT INTO [dbo].[PointTransactions] ([TransactionId], [UserId], [OrderId], [PointsDelta], [TransactionType], [Description], [CreatedAt]) VALUES (3, 1, NULL, -5000, N'Redeem', N'Đổi Mã giảm giá 50.000 đ', '2026-08-31 21:48:08.261');
INSERT INTO [dbo].[PointTransactions] ([TransactionId], [UserId], [OrderId], [PointsDelta], [TransactionType], [Description], [CreatedAt]) VALUES (4, 1, NULL, 500, N'Bonus', N'Thưởng đánh giá 5 sao kèm hình ảnh sản phẩm', '2026-08-26 21:48:08.261');
INSERT INTO [dbo].[PointTransactions] ([TransactionId], [UserId], [OrderId], [PointsDelta], [TransactionType], [Description], [CreatedAt]) VALUES (11, 5, NULL, 1850, N'Earn', N'Mua đơn hàng #ORD-84920 (Dâu tây & Bơ sáp)', '2026-09-09 21:58:49.861');
INSERT INTO [dbo].[PointTransactions] ([TransactionId], [UserId], [OrderId], [PointsDelta], [TransactionType], [Description], [CreatedAt]) VALUES (12, 5, NULL, 100, N'Bonus', N'Check-in quét mã QR nguồn gốc dưa lưới IoT', '2026-09-07 21:58:49.861');
INSERT INTO [dbo].[PointTransactions] ([TransactionId], [UserId], [OrderId], [PointsDelta], [TransactionType], [Description], [CreatedAt]) VALUES (13, 5, NULL, -5000, N'Redeem', N'Đổi Mã giảm giá 50.000 đ', '2026-08-31 21:58:49.861');
INSERT INTO [dbo].[PointTransactions] ([TransactionId], [UserId], [OrderId], [PointsDelta], [TransactionType], [Description], [CreatedAt]) VALUES (14, 5, NULL, 500, N'Bonus', N'Thưởng đánh giá 5 sao kèm hình ảnh sản phẩm', '2026-08-26 21:58:49.861');
SET IDENTITY_INSERT [dbo].[PointTransactions] OFF;
GO

-- -------------------------------------------------------------
-- Data for: [dbo].[ProductCertifications] (10 rows)
-- -------------------------------------------------------------
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (1, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (2, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (4, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (5, 2);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (6, 2);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (7, 2);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (8, 3);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (9, 4);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (10, 4);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (11, 4);
GO

-- -------------------------------------------------------------
-- Data for: [dbo].[ProductImages] (12 rows)
-- -------------------------------------------------------------
SET IDENTITY_INSERT [dbo].[ProductImages] ON;
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (1, 1, N'https://placehold.co/800x600?text=Ca+chua+bi', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (2, 2, N'https://placehold.co/800x600?text=Xa+lach+Lolo', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (3, 3, N'https://placehold.co/800x600?text=Nam+dùi+ga', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (4, 4, N'https://placehold.co/800x600?text=Dau+tay+Da+Lat', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (5, 5, N'https://placehold.co/800x600?text=Rau+cai+xanh', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (6, 6, N'https://placehold.co/800x600?text=Rau+muong', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (7, 7, N'https://placehold.co/800x600?text=Ngo+ri', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (8, 8, N'https://placehold.co/800x600?text=Dua+leo+organic', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (9, 9, N'https://placehold.co/800x600?text=Cam+sanh', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (10, 10, N'https://placehold.co/800x600?text=Thanh+long+ruot+do', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (11, 11, N'https://placehold.co/800x600?text=Xoai+cat+chu', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (12, 12, N'https://placehold.co/800x600?text=Oi+nu+hoang', 1, 1);
SET IDENTITY_INSERT [dbo].[ProductImages] OFF;
GO

-- -------------------------------------------------------------
-- Data for: [dbo].[Products] (12 rows)
-- -------------------------------------------------------------
SET IDENTITY_INSERT [dbo].[Products] ON;
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (1, 1, 5, N'Cà chua bi Đà Lạt', N'Cà chua bi đỏ, vị ngọt nhẹ, thích hợp salad và nấu ăn.', 68000.00, N'kg', N'Active', 1, '2026-08-01 12:00:00.000', NULL, '2026-08-01 10:00:00.000', '2026-08-20 10:00:00.000');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (2, 1, 4, N'Xà lách Lolo xanh', N'Xà lách giòn, tươi, trồng tại vùng cao Đà Lạt.', 45000.00, N'kg', N'Active', 1, '2026-08-01 12:00:00.000', NULL, '2026-08-01 10:10:00.000', '2026-08-20 10:10:00.000');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (3, 1, 3, N'Nấm đùi gà', N'Nấm đùi gà tươi, đóng khay tiện dụng.', 82000.00, N'hộp', N'Active', 1, '2026-08-01 12:00:00.000', NULL, '2026-08-01 10:20:00.000', '2026-08-20 10:20:00.000');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (4, 1, 7, N'Dâu tây Đà Lạt', N'Dâu tây loại 1, thu hoạch mới, phù hợp ăn trực tiếp.', 145000.00, N'hộp', N'Active', 1, '2026-08-01 12:00:00.000', NULL, '2026-08-01 10:30:00.000', '2026-08-20 10:30:00.000');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (5, 2, 4, N'Rau cải xanh', N'Rau cải xanh thu hoạch trong ngày, lá non, ít sâu bệnh.', 32000.00, N'kg', N'Active', 1, '2026-08-01 12:00:00.000', NULL, '2026-08-02 10:00:00.000', '2026-08-20 10:00:00.000');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (6, 2, 4, N'Rau muống sạch', N'Rau muống tươi, nguồn gốc rõ ràng.', 28000.00, N'kg', N'Active', 1, '2026-08-01 12:00:00.000', NULL, '2026-08-02 10:10:00.000', '2026-08-20 10:10:00.000');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (7, 2, 6, N'Ngò rí', N'Ngò rí thơm, phù hợp nấu ăn và trang trí món.', 55000.00, N'kg', N'Active', 1, '2026-08-01 12:00:00.000', NULL, '2026-08-02 10:20:00.000', '2026-08-20 10:20:00.000');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (8, 2, 1, N'Dưa leo hữu cơ', N'Dưa leo giòn, ít hạt, đạt tiêu chuẩn hữu cơ.', 42000.00, N'kg', N'Active', 1, '2026-08-01 12:00:00.000', NULL, '2026-08-02 10:30:00.000', '2026-08-20 10:30:00.000');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (9, 3, 8, N'Cam sành Đồng Nai', N'Cam sành mọng nước, vị ngọt thanh.', 52000.00, N'kg', N'Active', 1, '2026-08-01 12:00:00.000', NULL, '2026-08-03 10:00:00.000', '2026-08-20 10:00:00.000');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (10, 3, 9, N'Thanh long ruột đỏ', N'Thanh long ruột đỏ, ngọt, phù hợp ăn tươi.', 65000.00, N'kg', N'Active', 1, '2026-08-01 12:00:00.000', NULL, '2026-08-03 10:10:00.000', '2026-08-20 10:10:00.000');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (11, 3, 2, N'Xoài cát chu', N'Xoài cát chu thơm, ngọt, đang vào mùa.', 75000.00, N'kg', N'Active', 1, '2026-08-01 12:00:00.000', NULL, '2026-08-03 10:20:00.000', '2026-08-20 10:20:00.000');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (12, 3, 2, N'Ổi nữ hoàng', N'Ổi giòn, vị ngọt nhẹ, phù hợp ăn trực tiếp.', 48000.00, N'kg', N'Active', 1, '2026-08-01 12:00:00.000', NULL, '2026-08-03 10:30:00.000', '2026-08-20 10:30:00.000');
SET IDENTITY_INSERT [dbo].[Products] OFF;
GO

-- -------------------------------------------------------------
-- Data for: [dbo].[ProductSeasons] (12 rows)
-- -------------------------------------------------------------
SET IDENTITY_INSERT [dbo].[ProductSeasons] ON;
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (1, 1, N'Tây Nguyên', 6, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (2, 2, N'Tây Nguyên', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (3, 3, N'Tây Nguyên', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (4, 4, N'Tây Nguyên', 11, 4);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (5, 5, N'Miền Nam', 7, 11);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (6, 6, N'Miền Nam', 5, 10);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (7, 7, N'Miền Nam', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (8, 8, N'Miền Nam', 6, 11);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (9, 9, N'Miền Nam', 8, 1);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (10, 10, N'Miền Nam', 5, 10);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (11, 11, N'Miền Nam', 5, 9);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (12, 12, N'Miền Nam', 5, 12);
SET IDENTITY_INSERT [dbo].[ProductSeasons] OFF;
GO

-- -------------------------------------------------------------
-- Data for: [dbo].[PromotionProducts] (19 rows)
-- -------------------------------------------------------------
INSERT INTO [dbo].[PromotionProducts] ([PromotionId], [ProductId]) VALUES (1, 1);
INSERT INTO [dbo].[PromotionProducts] ([PromotionId], [ProductId]) VALUES (1, 2);
INSERT INTO [dbo].[PromotionProducts] ([PromotionId], [ProductId]) VALUES (1, 5);
INSERT INTO [dbo].[PromotionProducts] ([PromotionId], [ProductId]) VALUES (1, 6);
INSERT INTO [dbo].[PromotionProducts] ([PromotionId], [ProductId]) VALUES (1, 8);
INSERT INTO [dbo].[PromotionProducts] ([PromotionId], [ProductId]) VALUES (2, 4);
INSERT INTO [dbo].[PromotionProducts] ([PromotionId], [ProductId]) VALUES (2, 9);
INSERT INTO [dbo].[PromotionProducts] ([PromotionId], [ProductId]) VALUES (2, 10);
INSERT INTO [dbo].[PromotionProducts] ([PromotionId], [ProductId]) VALUES (2, 11);
INSERT INTO [dbo].[PromotionProducts] ([PromotionId], [ProductId]) VALUES (2, 12);
INSERT INTO [dbo].[PromotionProducts] ([PromotionId], [ProductId]) VALUES (3, 2);
INSERT INTO [dbo].[PromotionProducts] ([PromotionId], [ProductId]) VALUES (3, 6);
INSERT INTO [dbo].[PromotionProducts] ([PromotionId], [ProductId]) VALUES (3, 7);
INSERT INTO [dbo].[PromotionProducts] ([PromotionId], [ProductId]) VALUES (3, 8);
INSERT INTO [dbo].[PromotionProducts] ([PromotionId], [ProductId]) VALUES (4, 1);
INSERT INTO [dbo].[PromotionProducts] ([PromotionId], [ProductId]) VALUES (4, 2);
INSERT INTO [dbo].[PromotionProducts] ([PromotionId], [ProductId]) VALUES (4, 4);
INSERT INTO [dbo].[PromotionProducts] ([PromotionId], [ProductId]) VALUES (4, 9);
INSERT INTO [dbo].[PromotionProducts] ([PromotionId], [ProductId]) VALUES (4, 10);
GO

-- -------------------------------------------------------------
-- Data for: [dbo].[Promotions] (4 rows)
-- -------------------------------------------------------------
SET IDENTITY_INSERT [dbo].[Promotions] ON;
INSERT INTO [dbo].[Promotions] ([PromotionId], [PromotionName], [PromotionCode], [DiscountType], [DiscountValue], [StartDate], [EndDate], [MinOrderValue], [MaxDiscount], [UsageLimit], [Status]) VALUES (1, N'Rau sạch cuối tuần', N'RAUSACH10', N'Percent', 10.00, '2026-08-20 00:00:00.000', '2026-08-31 23:59:59.000', 100000.00, 30000.00, 500, N'Active');
INSERT INTO [dbo].[Promotions] ([PromotionId], [PromotionName], [PromotionCode], [DiscountType], [DiscountValue], [StartDate], [EndDate], [MinOrderValue], [MaxDiscount], [UsageLimit], [Status]) VALUES (2, N'Khuyến mãi trái cây mùa vụ', N'MUAVU15', N'Percent', 15.00, '2026-08-22 00:00:00.000', '2026-08-30 23:59:59.000', 150000.00, 40000.00, 300, N'Active');
INSERT INTO [dbo].[Promotions] ([PromotionId], [PromotionName], [PromotionCode], [DiscountType], [DiscountValue], [StartDate], [EndDate], [MinOrderValue], [MaxDiscount], [UsageLimit], [Status]) VALUES (3, N'Gần hết hạn - giảm giá', N'FRESH20', N'Percent', 20.00, '2026-08-23 00:00:00.000', '2026-08-25 23:59:59.000', 50000.00, 50000.00, 200, N'Active');
INSERT INTO [dbo].[Promotions] ([PromotionId], [PromotionName], [PromotionCode], [DiscountType], [DiscountValue], [StartDate], [EndDate], [MinOrderValue], [MaxDiscount], [UsageLimit], [Status]) VALUES (4, N'Đơn đầu tiên', N'WELCOME30', N'Fixed', 30000.00, '2026-08-01 00:00:00.000', '2026-09-30 23:59:59.000', 200000.00, 30000.00, 1000, N'Active');
SET IDENTITY_INSERT [dbo].[Promotions] OFF;
GO

-- -------------------------------------------------------------
-- Data for: [dbo].[RecommendationLogs] (18 rows)
-- -------------------------------------------------------------
SET IDENTITY_INSERT [dbo].[RecommendationLogs] ON;
INSERT INTO [dbo].[RecommendationLogs] ([RecommendationLogId], [UserId], [ProductId], [RecommendationType], [Score], [Position], [ShownAt], [Clicked], [AddedToCart], [Purchased]) VALUES (1, 5, 1, N'FOR_YOU', 0.95, 1, '2026-08-23 08:00:00.000', 1, 1, 1);
INSERT INTO [dbo].[RecommendationLogs] ([RecommendationLogId], [UserId], [ProductId], [RecommendationType], [Score], [Position], [ShownAt], [Clicked], [AddedToCart], [Purchased]) VALUES (2, 5, 2, N'SIMILAR', 0.88, 2, '2026-08-23 08:00:00.000', 1, 0, 0);
INSERT INTO [dbo].[RecommendationLogs] ([RecommendationLogId], [UserId], [ProductId], [RecommendationType], [Score], [Position], [ShownAt], [Clicked], [AddedToCart], [Purchased]) VALUES (3, 5, 10, N'NEARBY', 0.82, 3, '2026-08-23 08:00:00.000', 0, 0, 0);
INSERT INTO [dbo].[RecommendationLogs] ([RecommendationLogId], [UserId], [ProductId], [RecommendationType], [Score], [Position], [ShownAt], [Clicked], [AddedToCart], [Purchased]) VALUES (4, 6, 9, N'FOR_YOU', 0.94, 1, '2026-08-23 09:00:00.000', 1, 1, 1);
INSERT INTO [dbo].[RecommendationLogs] ([RecommendationLogId], [UserId], [ProductId], [RecommendationType], [Score], [Position], [ShownAt], [Clicked], [AddedToCart], [Purchased]) VALUES (5, 6, 5, N'SIMILAR', 0.86, 2, '2026-08-23 09:00:00.000', 1, 1, 0);
INSERT INTO [dbo].[RecommendationLogs] ([RecommendationLogId], [UserId], [ProductId], [RecommendationType], [Score], [Position], [ShownAt], [Clicked], [AddedToCart], [Purchased]) VALUES (6, 6, 10, N'SEASONAL', 0.79, 3, '2026-08-23 09:00:00.000', 0, 0, 0);
INSERT INTO [dbo].[RecommendationLogs] ([RecommendationLogId], [UserId], [ProductId], [RecommendationType], [Score], [Position], [ShownAt], [Clicked], [AddedToCart], [Purchased]) VALUES (7, 7, 4, N'FOR_YOU', 0.96, 1, '2026-08-23 10:00:00.000', 1, 1, 1);
INSERT INTO [dbo].[RecommendationLogs] ([RecommendationLogId], [UserId], [ProductId], [RecommendationType], [Score], [Position], [ShownAt], [Clicked], [AddedToCart], [Purchased]) VALUES (8, 7, 11, N'SIMILAR', 0.91, 2, '2026-08-23 10:00:00.000', 1, 1, 1);
INSERT INTO [dbo].[RecommendationLogs] ([RecommendationLogId], [UserId], [ProductId], [RecommendationType], [Score], [Position], [ShownAt], [Clicked], [AddedToCart], [Purchased]) VALUES (9, 7, 10, N'BOUGHT_TOGETHER', 0.84, 3, '2026-08-23 10:00:00.000', 1, 0, 0);
INSERT INTO [dbo].[RecommendationLogs] ([RecommendationLogId], [UserId], [ProductId], [RecommendationType], [Score], [Position], [ShownAt], [Clicked], [AddedToCart], [Purchased]) VALUES (10, 8, 6, N'FOR_YOU', 0.9, 1, '2026-08-23 11:00:00.000', 1, 1, 1);
INSERT INTO [dbo].[RecommendationLogs] ([RecommendationLogId], [UserId], [ProductId], [RecommendationType], [Score], [Position], [ShownAt], [Clicked], [AddedToCart], [Purchased]) VALUES (11, 8, 8, N'NEARBY', 0.85, 2, '2026-08-23 11:00:00.000', 1, 1, 0);
INSERT INTO [dbo].[RecommendationLogs] ([RecommendationLogId], [UserId], [ProductId], [RecommendationType], [Score], [Position], [ShownAt], [Clicked], [AddedToCart], [Purchased]) VALUES (12, 8, 5, N'SEASONAL', 0.77, 3, '2026-08-23 11:00:00.000', 0, 0, 0);
INSERT INTO [dbo].[RecommendationLogs] ([RecommendationLogId], [UserId], [ProductId], [RecommendationType], [Score], [Position], [ShownAt], [Clicked], [AddedToCart], [Purchased]) VALUES (13, 9, 3, N'FOR_YOU', 0.89, 1, '2026-08-23 12:00:00.000', 1, 0, 0);
INSERT INTO [dbo].[RecommendationLogs] ([RecommendationLogId], [UserId], [ProductId], [RecommendationType], [Score], [Position], [ShownAt], [Clicked], [AddedToCart], [Purchased]) VALUES (14, 9, 9, N'SIMILAR', 0.81, 2, '2026-08-23 12:00:00.000', 1, 1, 1);
INSERT INTO [dbo].[RecommendationLogs] ([RecommendationLogId], [UserId], [ProductId], [RecommendationType], [Score], [Position], [ShownAt], [Clicked], [AddedToCart], [Purchased]) VALUES (15, 9, 1, N'BOUGHT_TOGETHER', 0.76, 3, '2026-08-23 12:00:00.000', 0, 0, 0);
INSERT INTO [dbo].[RecommendationLogs] ([RecommendationLogId], [UserId], [ProductId], [RecommendationType], [Score], [Position], [ShownAt], [Clicked], [AddedToCart], [Purchased]) VALUES (16, 10, 4, N'FOR_YOU', 0.97, 1, '2026-08-23 16:00:00.000', 1, 1, 1);
INSERT INTO [dbo].[RecommendationLogs] ([RecommendationLogId], [UserId], [ProductId], [RecommendationType], [Score], [Position], [ShownAt], [Clicked], [AddedToCart], [Purchased]) VALUES (17, 10, 12, N'NEARBY', 0.8, 2, '2026-08-23 16:00:00.000', 0, 0, 0);
INSERT INTO [dbo].[RecommendationLogs] ([RecommendationLogId], [UserId], [ProductId], [RecommendationType], [Score], [Position], [ShownAt], [Clicked], [AddedToCart], [Purchased]) VALUES (18, 10, 11, N'SEASONAL', 0.83, 3, '2026-08-23 16:00:00.000', 1, 0, 0);
SET IDENTITY_INSERT [dbo].[RecommendationLogs] OFF;
GO

-- -------------------------------------------------------------
-- Data for: [dbo].[ReviewImages] (4 rows)
-- -------------------------------------------------------------
SET IDENTITY_INSERT [dbo].[ReviewImages] ON;
INSERT INTO [dbo].[ReviewImages] ([ReviewImageId], [ReviewId], [ImageUrl]) VALUES (1, 1, N'https://placehold.co/600x400?text=Review+Tomato');
INSERT INTO [dbo].[ReviewImages] ([ReviewImageId], [ReviewId], [ImageUrl]) VALUES (2, 5, N'https://placehold.co/600x400?text=Review+Strawberry');
INSERT INTO [dbo].[ReviewImages] ([ReviewImageId], [ReviewId], [ImageUrl]) VALUES (3, 8, N'https://placehold.co/600x400?text=Review+Morning+Veggies');
INSERT INTO [dbo].[ReviewImages] ([ReviewImageId], [ReviewId], [ImageUrl]) VALUES (4, 9, N'https://placehold.co/600x400?text=Review+Cucumber');
SET IDENTITY_INSERT [dbo].[ReviewImages] OFF;
GO

-- -------------------------------------------------------------
-- Data for: [dbo].[Reviews] (10 rows)
-- -------------------------------------------------------------
SET IDENTITY_INSERT [dbo].[Reviews] ON;
INSERT INTO [dbo].[Reviews] ([ReviewId], [CustomerId], [ProductId], [OrderId], [Rating], [Comment], [CreatedAt], [Status]) VALUES (1, 5, 1, 1, 5, N'Cà chua rất tươi, quả đều và giao nhanh.', '2026-08-18 19:00:00.000', N'Approved');
INSERT INTO [dbo].[Reviews] ([ReviewId], [CustomerId], [ProductId], [OrderId], [Rating], [Comment], [CreatedAt], [Status]) VALUES (2, 5, 2, 1, 4, N'Rau giòn, khá ngon, đóng gói tốt.', '2026-08-18 19:05:00.000', N'Approved');
INSERT INTO [dbo].[Reviews] ([ReviewId], [CustomerId], [ProductId], [OrderId], [Rating], [Comment], [CreatedAt], [Status]) VALUES (3, 6, 5, 2, 5, N'Rau cải tươi và sạch.', '2026-08-20 18:00:00.000', N'Approved');
INSERT INTO [dbo].[Reviews] ([ReviewId], [CustomerId], [ProductId], [OrderId], [Rating], [Comment], [CreatedAt], [Status]) VALUES (4, 6, 9, 2, 4, N'Cam ngọt vừa, còn rất tươi.', '2026-08-20 18:05:00.000', N'Approved');
INSERT INTO [dbo].[Reviews] ([ReviewId], [CustomerId], [ProductId], [OrderId], [Rating], [Comment], [CreatedAt], [Status]) VALUES (5, 7, 4, 3, 5, N'Dâu thơm, ngọt, hình thức đẹp.', '2026-08-22 09:00:00.000', N'Approved');
INSERT INTO [dbo].[Reviews] ([ReviewId], [CustomerId], [ProductId], [OrderId], [Rating], [Comment], [CreatedAt], [Status]) VALUES (6, 7, 11, 3, 5, N'Xoài chín thơm và ngọt.', '2026-08-22 09:05:00.000', N'Approved');
INSERT INTO [dbo].[Reviews] ([ReviewId], [CustomerId], [ProductId], [OrderId], [Rating], [Comment], [CreatedAt], [Status]) VALUES (7, 7, 7, 3, 4, N'Ngò rí tươi, mùi thơm tốt.', '2026-08-22 09:10:00.000', N'Approved');
INSERT INTO [dbo].[Reviews] ([ReviewId], [CustomerId], [ProductId], [OrderId], [Rating], [Comment], [CreatedAt], [Status]) VALUES (8, 8, 6, 11, 4, N'Rau muống ngon, giao đúng giờ.', '2026-08-23 10:00:00.000', N'Approved');
INSERT INTO [dbo].[Reviews] ([ReviewId], [CustomerId], [ProductId], [OrderId], [Rating], [Comment], [CreatedAt], [Status]) VALUES (9, 8, 8, 11, 5, N'Dưa leo giòn, đúng mô tả.', '2026-08-23 10:05:00.000', N'Approved');
INSERT INTO [dbo].[Reviews] ([ReviewId], [CustomerId], [ProductId], [OrderId], [Rating], [Comment], [CreatedAt], [Status]) VALUES (10, 10, 4, 12, 5, N'Dâu tây tươi, rất hợp làm quà.', '2026-08-23 18:10:00.000', N'Approved');
SET IDENTITY_INSERT [dbo].[Reviews] OFF;
GO

-- -------------------------------------------------------------
-- Data for: [dbo].[Roles] (3 rows)
-- -------------------------------------------------------------
SET IDENTITY_INSERT [dbo].[Roles] ON;
INSERT INTO [dbo].[Roles] ([RoleId], [RoleName]) VALUES (1, N'ADMIN');
INSERT INTO [dbo].[Roles] ([RoleId], [RoleName]) VALUES (3, N'CUSTOMER');
INSERT INTO [dbo].[Roles] ([RoleId], [RoleName]) VALUES (2, N'SUPPLIER');
SET IDENTITY_INSERT [dbo].[Roles] OFF;
GO

-- -------------------------------------------------------------
-- Data for: [dbo].[Suppliers] (3 rows)
-- -------------------------------------------------------------
SET IDENTITY_INSERT [dbo].[Suppliers] ON;
INSERT INTO [dbo].[Suppliers] ([SupplierId], [UserId], [SupplierName], [Representative], [BusinessLicense], [Address], [Province], [Description], [ApprovalStatus], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt]) VALUES (1, 2, N'Hợp tác xã Nông Sản Đà Lạt', N'Nguyễn Văn Lâm', N'DL-HTX-001', N'Đường Trại Mát, Phường 11', N'Lâm Đồng', N'Chuyên rau củ và nông sản Đà Lạt, định hướng VietGAP.', N'Approved', 1, '2026-08-01 12:00:00.000', NULL, '2026-08-01 08:10:00.000');
INSERT INTO [dbo].[Suppliers] ([SupplierId], [UserId], [SupplierName], [Representative], [BusinessLicense], [Address], [Province], [Description], [ApprovalStatus], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt]) VALUES (2, 3, N'Hợp tác xã Rau Sạch Miền Tây', N'Trần Quốc Hùng', N'MT-HTX-002', N'Huyện Châu Thành', N'Đồng Tháp', N'Chuyên rau ăn lá và rau gia vị, cung cấp cho khu vực TP.HCM.', N'Approved', 1, '2026-08-01 12:00:00.000', NULL, '2026-08-01 08:20:00.000');
INSERT INTO [dbo].[Suppliers] ([SupplierId], [UserId], [SupplierName], [Representative], [BusinessLicense], [Address], [Province], [Description], [ApprovalStatus], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt]) VALUES (3, 4, N'Hợp tác xã Trái Cây Việt', N'Phạm Thành Long', N'TC-HTX-003', N'Thành phố Long Khánh', N'Đồng Nai', N'Chuyên trái cây theo mùa, ưu tiên truy xuất nguồn gốc theo lô.', N'Approved', 1, '2026-08-01 12:00:00.000', NULL, '2026-08-01 08:30:00.000');
SET IDENTITY_INSERT [dbo].[Suppliers] OFF;
GO

-- -------------------------------------------------------------
-- Data for: [dbo].[UserBehaviors] (35 rows)
-- -------------------------------------------------------------
SET IDENTITY_INSERT [dbo].[UserBehaviors] ON;
INSERT INTO [dbo].[UserBehaviors] ([BehaviorId], [UserId], [ProductId], [ActionType], [SearchKeyword], [SessionId], [CreatedAt]) VALUES (1, 5, 1, N'VIEW', NULL, N'S001', '2026-08-20 08:00:00.000');
INSERT INTO [dbo].[UserBehaviors] ([BehaviorId], [UserId], [ProductId], [ActionType], [SearchKeyword], [SessionId], [CreatedAt]) VALUES (2, 5, 2, N'VIEW', NULL, N'S001', '2026-08-20 08:02:00.000');
INSERT INTO [dbo].[UserBehaviors] ([BehaviorId], [UserId], [ProductId], [ActionType], [SearchKeyword], [SessionId], [CreatedAt]) VALUES (3, 5, 1, N'CART', NULL, N'S001', '2026-08-20 08:05:00.000');
INSERT INTO [dbo].[UserBehaviors] ([BehaviorId], [UserId], [ProductId], [ActionType], [SearchKeyword], [SessionId], [CreatedAt]) VALUES (4, 5, 10, N'VIEW', NULL, N'S001', '2026-08-20 08:07:00.000');
INSERT INTO [dbo].[UserBehaviors] ([BehaviorId], [UserId], [ProductId], [ActionType], [SearchKeyword], [SessionId], [CreatedAt]) VALUES (5, 5, 1, N'PURCHASE', NULL, N'S001', '2026-08-20 08:15:00.000');
INSERT INTO [dbo].[UserBehaviors] ([BehaviorId], [UserId], [ProductId], [ActionType], [SearchKeyword], [SessionId], [CreatedAt]) VALUES (6, 5, NULL, N'SEARCH', N'rau củ sạch', N'S002', '2026-08-22 09:00:00.000');
INSERT INTO [dbo].[UserBehaviors] ([BehaviorId], [UserId], [ProductId], [ActionType], [SearchKeyword], [SessionId], [CreatedAt]) VALUES (7, 5, 5, N'VIEW', NULL, N'S002', '2026-08-22 09:02:00.000');
INSERT INTO [dbo].[UserBehaviors] ([BehaviorId], [UserId], [ProductId], [ActionType], [SearchKeyword], [SessionId], [CreatedAt]) VALUES (8, 6, 5, N'VIEW', NULL, N'S010', '2026-08-18 10:00:00.000');
INSERT INTO [dbo].[UserBehaviors] ([BehaviorId], [UserId], [ProductId], [ActionType], [SearchKeyword], [SessionId], [CreatedAt]) VALUES (9, 6, 9, N'VIEW', NULL, N'S010', '2026-08-18 10:03:00.000');
INSERT INTO [dbo].[UserBehaviors] ([BehaviorId], [UserId], [ProductId], [ActionType], [SearchKeyword], [SessionId], [CreatedAt]) VALUES (10, 6, 5, N'CART', NULL, N'S010', '2026-08-18 10:05:00.000');
INSERT INTO [dbo].[UserBehaviors] ([BehaviorId], [UserId], [ProductId], [ActionType], [SearchKeyword], [SessionId], [CreatedAt]) VALUES (11, 6, 9, N'PURCHASE', NULL, N'S010', '2026-08-18 10:10:00.000');
INSERT INTO [dbo].[UserBehaviors] ([BehaviorId], [UserId], [ProductId], [ActionType], [SearchKeyword], [SessionId], [CreatedAt]) VALUES (12, 6, NULL, N'SEARCH', N'cam sành', N'S011', '2026-08-21 14:00:00.000');
INSERT INTO [dbo].[UserBehaviors] ([BehaviorId], [UserId], [ProductId], [ActionType], [SearchKeyword], [SessionId], [CreatedAt]) VALUES (13, 6, 4, N'VIEW', NULL, N'S011', '2026-08-21 14:03:00.000');
INSERT INTO [dbo].[UserBehaviors] ([BehaviorId], [UserId], [ProductId], [ActionType], [SearchKeyword], [SessionId], [CreatedAt]) VALUES (14, 7, 4, N'VIEW', NULL, N'S020', '2026-08-19 08:30:00.000');
INSERT INTO [dbo].[UserBehaviors] ([BehaviorId], [UserId], [ProductId], [ActionType], [SearchKeyword], [SessionId], [CreatedAt]) VALUES (15, 7, 11, N'VIEW', NULL, N'S020', '2026-08-19 08:32:00.000');
INSERT INTO [dbo].[UserBehaviors] ([BehaviorId], [UserId], [ProductId], [ActionType], [SearchKeyword], [SessionId], [CreatedAt]) VALUES (16, 7, 4, N'CART', NULL, N'S020', '2026-08-19 08:35:00.000');
INSERT INTO [dbo].[UserBehaviors] ([BehaviorId], [UserId], [ProductId], [ActionType], [SearchKeyword], [SessionId], [CreatedAt]) VALUES (17, 7, 11, N'PURCHASE', NULL, N'S020', '2026-08-19 08:40:00.000');
INSERT INTO [dbo].[UserBehaviors] ([BehaviorId], [UserId], [ProductId], [ActionType], [SearchKeyword], [SessionId], [CreatedAt]) VALUES (18, 7, NULL, N'SEARCH', N'thanh long', N'S021', '2026-08-22 11:00:00.000');
INSERT INTO [dbo].[UserBehaviors] ([BehaviorId], [UserId], [ProductId], [ActionType], [SearchKeyword], [SessionId], [CreatedAt]) VALUES (19, 7, 10, N'VIEW', NULL, N'S021', '2026-08-22 11:02:00.000');
INSERT INTO [dbo].[UserBehaviors] ([BehaviorId], [UserId], [ProductId], [ActionType], [SearchKeyword], [SessionId], [CreatedAt]) VALUES (20, 8, 6, N'VIEW', NULL, N'S030', '2026-08-20 15:00:00.000');
INSERT INTO [dbo].[UserBehaviors] ([BehaviorId], [UserId], [ProductId], [ActionType], [SearchKeyword], [SessionId], [CreatedAt]) VALUES (21, 8, 8, N'VIEW', NULL, N'S030', '2026-08-20 15:02:00.000');
INSERT INTO [dbo].[UserBehaviors] ([BehaviorId], [UserId], [ProductId], [ActionType], [SearchKeyword], [SessionId], [CreatedAt]) VALUES (22, 8, 6, N'CART', NULL, N'S030', '2026-08-20 15:04:00.000');
INSERT INTO [dbo].[UserBehaviors] ([BehaviorId], [UserId], [ProductId], [ActionType], [SearchKeyword], [SessionId], [CreatedAt]) VALUES (23, 8, 8, N'PURCHASE', NULL, N'S030', '2026-08-20 15:10:00.000');
INSERT INTO [dbo].[UserBehaviors] ([BehaviorId], [UserId], [ProductId], [ActionType], [SearchKeyword], [SessionId], [CreatedAt]) VALUES (24, 8, NULL, N'SEARCH', N'rau sạch', N'S031', '2026-08-22 10:30:00.000');
INSERT INTO [dbo].[UserBehaviors] ([BehaviorId], [UserId], [ProductId], [ActionType], [SearchKeyword], [SessionId], [CreatedAt]) VALUES (25, 9, 3, N'VIEW', NULL, N'S040', '2026-08-21 09:00:00.000');
INSERT INTO [dbo].[UserBehaviors] ([BehaviorId], [UserId], [ProductId], [ActionType], [SearchKeyword], [SessionId], [CreatedAt]) VALUES (26, 9, 9, N'VIEW', NULL, N'S040', '2026-08-21 09:02:00.000');
INSERT INTO [dbo].[UserBehaviors] ([BehaviorId], [UserId], [ProductId], [ActionType], [SearchKeyword], [SessionId], [CreatedAt]) VALUES (27, 9, 3, N'CART', NULL, N'S040', '2026-08-21 09:03:00.000');
INSERT INTO [dbo].[UserBehaviors] ([BehaviorId], [UserId], [ProductId], [ActionType], [SearchKeyword], [SessionId], [CreatedAt]) VALUES (28, 9, 9, N'PURCHASE', NULL, N'S040', '2026-08-21 09:10:00.000');
INSERT INTO [dbo].[UserBehaviors] ([BehaviorId], [UserId], [ProductId], [ActionType], [SearchKeyword], [SessionId], [CreatedAt]) VALUES (29, 10, 4, N'VIEW', NULL, N'S050', '2026-08-22 14:00:00.000');
INSERT INTO [dbo].[UserBehaviors] ([BehaviorId], [UserId], [ProductId], [ActionType], [SearchKeyword], [SessionId], [CreatedAt]) VALUES (30, 10, 12, N'VIEW', NULL, N'S050', '2026-08-22 14:03:00.000');
INSERT INTO [dbo].[UserBehaviors] ([BehaviorId], [UserId], [ProductId], [ActionType], [SearchKeyword], [SessionId], [CreatedAt]) VALUES (31, 10, 4, N'PURCHASE', NULL, N'S050', '2026-08-23 14:20:00.000');
INSERT INTO [dbo].[UserBehaviors] ([BehaviorId], [UserId], [ProductId], [ActionType], [SearchKeyword], [SessionId], [CreatedAt]) VALUES (32, 10, NULL, N'SEARCH', N'dâu tây', N'S051', '2026-08-23 14:25:00.000');
INSERT INTO [dbo].[UserBehaviors] ([BehaviorId], [UserId], [ProductId], [ActionType], [SearchKeyword], [SessionId], [CreatedAt]) VALUES (33, 8, 6, N'PURCHASE', NULL, N'S032', '2026-08-23 09:55:00.000');
INSERT INTO [dbo].[UserBehaviors] ([BehaviorId], [UserId], [ProductId], [ActionType], [SearchKeyword], [SessionId], [CreatedAt]) VALUES (34, 8, 8, N'PURCHASE', NULL, N'S032', '2026-08-23 09:56:00.000');
INSERT INTO [dbo].[UserBehaviors] ([BehaviorId], [UserId], [ProductId], [ActionType], [SearchKeyword], [SessionId], [CreatedAt]) VALUES (35, 10, 4, N'PURCHASE', NULL, N'S052', '2026-08-23 18:05:00.000');
SET IDENTITY_INSERT [dbo].[UserBehaviors] OFF;
GO

-- -------------------------------------------------------------
-- Data for: [dbo].[UserLoyalties] (3 rows)
-- -------------------------------------------------------------
SET IDENTITY_INSERT [dbo].[UserLoyalties] ON;
INSERT INTO [dbo].[UserLoyalties] ([LoyaltyId], [UserId], [CurrentPoints], [TotalSpentYear], [TierId], [UpdatedAt]) VALUES (1, 1, 12450, 8450000.00, 3, '2026-09-10 21:48:08.157');
INSERT INTO [dbo].[UserLoyalties] ([LoyaltyId], [UserId], [CurrentPoints], [TotalSpentYear], [TierId], [UpdatedAt]) VALUES (3, 11, 0, 0.00, 1, '2026-09-10 21:58:40.343');
INSERT INTO [dbo].[UserLoyalties] ([LoyaltyId], [UserId], [CurrentPoints], [TotalSpentYear], [TierId], [UpdatedAt]) VALUES (4, 5, 12450, 8450000.00, 3, '2026-09-10 21:58:49.853');
SET IDENTITY_INSERT [dbo].[UserLoyalties] OFF;
GO

-- -------------------------------------------------------------
-- Data for: [dbo].[Users] (11 rows)
-- -------------------------------------------------------------
SET IDENTITY_INSERT [dbo].[Users] ON;
INSERT INTO [dbo].[Users] ([UserId], [FullName], [Email], [Phone], [PasswordHash], [RoleId], [Status], [CreatedAt], [UpdatedAt]) VALUES (1, N'Quản trị hệ thống', N'admin@gmail.com', N'0909000001', N'$2a$11$3RLZhjfCgDhkb9ouccAUZuTXiVW7MQ9mXsq9c/r/WRUH2LWeX5rpm', 1, N'Active', '2026-08-01 08:00:00.000', '2026-08-20 08:00:00.000');
INSERT INTO [dbo].[Users] ([UserId], [FullName], [Email], [Phone], [PasswordHash], [RoleId], [Status], [CreatedAt], [UpdatedAt]) VALUES (2, N'HTX Nông Sản Đà Lạt', N'dalat@gmail.com', N'0909000002', N'$2a$11$3RLZhjfCgDhkb9ouccAUZuTXiVW7MQ9mXsq9c/r/WRUH2LWeX5rpm', 2, N'Active', '2026-08-01 08:10:00.000', '2026-08-20 08:10:00.000');
INSERT INTO [dbo].[Users] ([UserId], [FullName], [Email], [Phone], [PasswordHash], [RoleId], [Status], [CreatedAt], [UpdatedAt]) VALUES (3, N'HTX Rau Sạch Miền Tây', N'mientay@gmail.com', N'0909000003', N'$2a$11$3RLZhjfCgDhkb9ouccAUZuTXiVW7MQ9mXsq9c/r/WRUH2LWeX5rpm', 2, N'Active', '2026-08-01 08:20:00.000', '2026-08-20 08:20:00.000');
INSERT INTO [dbo].[Users] ([UserId], [FullName], [Email], [Phone], [PasswordHash], [RoleId], [Status], [CreatedAt], [UpdatedAt]) VALUES (4, N'HTX Trái Cây Việt', N'traicay@gmail.com', N'0909000004', N'$2a$11$3RLZhjfCgDhkb9ouccAUZuTXiVW7MQ9mXsq9c/r/WRUH2LWeX5rpm', 2, N'Active', '2026-08-01 08:30:00.000', '2026-08-20 08:30:00.000');
INSERT INTO [dbo].[Users] ([UserId], [FullName], [Email], [Phone], [PasswordHash], [RoleId], [Status], [CreatedAt], [UpdatedAt]) VALUES (5, N'Nguyễn Minh Anh', N'minhanh@gmail.com', N'0911000001', N'$2a$11$pr/pmVmbMWZNNtCBzhavF.D5VOErWP71MRuRfEL33OLBpyD7a7deu', 3, N'Active', '2026-08-02 09:00:00.000', '2026-08-22 08:00:00.000');
INSERT INTO [dbo].[Users] ([UserId], [FullName], [Email], [Phone], [PasswordHash], [RoleId], [Status], [CreatedAt], [UpdatedAt]) VALUES (6, N'Trần Gia Hân', N'giahan@gmail.com', N'0911000002', N'$2a$11$3RLZhjfCgDhkb9ouccAUZuTXiVW7MQ9mXsq9c/r/WRUH2LWeX5rpm', 3, N'Active', '2026-08-02 09:10:00.000', '2026-08-22 08:10:00.000');
INSERT INTO [dbo].[Users] ([UserId], [FullName], [Email], [Phone], [PasswordHash], [RoleId], [Status], [CreatedAt], [UpdatedAt]) VALUES (7, N'Lê Hoàng Nam', N'hoangnam@gmail.com', N'0911000003', N'$2a$11$3RLZhjfCgDhkb9ouccAUZuTXiVW7MQ9mXsq9c/r/WRUH2LWeX5rpm', 3, N'Active', '2026-08-03 09:20:00.000', '2026-08-21 08:20:00.000');
INSERT INTO [dbo].[Users] ([UserId], [FullName], [Email], [Phone], [PasswordHash], [RoleId], [Status], [CreatedAt], [UpdatedAt]) VALUES (8, N'Phạm Ngọc Mai', N'ngocmai@gmail.com', N'0911000004', N'$2a$11$3RLZhjfCgDhkb9ouccAUZuTXiVW7MQ9mXsq9c/r/WRUH2LWeX5rpm', 3, N'Active', '2026-08-03 09:30:00.000', '2026-08-21 08:30:00.000');
INSERT INTO [dbo].[Users] ([UserId], [FullName], [Email], [Phone], [PasswordHash], [RoleId], [Status], [CreatedAt], [UpdatedAt]) VALUES (9, N'Võ Đức Minh', N'ducminh@gmail.com', N'0911000005', N'$2a$11$3RLZhjfCgDhkb9ouccAUZuTXiVW7MQ9mXsq9c/r/WRUH2LWeX5rpm', 3, N'Active', '2026-08-04 09:40:00.000', '2026-08-22 08:40:00.000');
INSERT INTO [dbo].[Users] ([UserId], [FullName], [Email], [Phone], [PasswordHash], [RoleId], [Status], [CreatedAt], [UpdatedAt]) VALUES (10, N'Nguyễn Thảo Vy', N'thaovy@gmail.com', N'0911000006', N'$2a$11$3RLZhjfCgDhkb9ouccAUZuTXiVW7MQ9mXsq9c/r/WRUH2LWeX5rpm', 3, N'Active', '2026-08-04 09:50:00.000', '2026-08-22 08:50:00.000');
INSERT INTO [dbo].[Users] ([UserId], [FullName], [Email], [Phone], [PasswordHash], [RoleId], [Status], [CreatedAt], [UpdatedAt]) VALUES (11, N'Hung Quoc', N'buiquochung0942@gmail.com', N'0942367010', N'$2a$11$UDT/cbXe/9lXx0VPgb63debjm7vELJYncgn4mjow0W8GWdITJMXoG', 3, N'Active', '2026-09-10 20:42:09.575', '2026-09-10 20:42:09.575');
SET IDENTITY_INSERT [dbo].[Users] OFF;
GO

-- -------------------------------------------------------------
-- Data for: [dbo].[UserVouchers] (9 rows)
-- -------------------------------------------------------------
SET IDENTITY_INSERT [dbo].[UserVouchers] ON;
INSERT INTO [dbo].[UserVouchers] ([VoucherId], [UserId], [Code], [Title], [VoucherType], [DiscountValue], [MinOrderAmount], [ExpiryDate], [IsUsed], [UsedAt], [CreatedAt]) VALUES (1, 1, N'LANHFRESH20', N'Giảm 20.000đ Đơn Nông Sản', N'cash', 20000.00, 150000.00, '2026-12-10 21:48:08.316', 0, NULL, '2026-09-10 21:48:08.316');
INSERT INTO [dbo].[UserVouchers] ([VoucherId], [UserId], [Code], [Title], [VoucherType], [DiscountValue], [MinOrderAmount], [ExpiryDate], [IsUsed], [UsedAt], [CreatedAt]) VALUES (2, 1, N'FREESHIP50', N'Miễn Phí Vận Chuyển Hạng Vàng', N'ship', 30000.00, 200000.00, '2026-10-10 21:48:08.317', 0, NULL, '2026-09-10 21:48:08.317');
INSERT INTO [dbo].[UserVouchers] ([VoucherId], [UserId], [Code], [Title], [VoucherType], [DiscountValue], [MinOrderAmount], [ExpiryDate], [IsUsed], [UsedAt], [CreatedAt]) VALUES (3, 1, N'VIETGAP10', N'Giảm 10% Rau Hữu Cơ VietGAP', N'discount', 15000.00, 100000.00, '2026-11-10 21:48:08.317', 0, NULL, '2026-09-10 21:48:08.317');
INSERT INTO [dbo].[UserVouchers] ([VoucherId], [UserId], [Code], [Title], [VoucherType], [DiscountValue], [MinOrderAmount], [ExpiryDate], [IsUsed], [UsedAt], [CreatedAt]) VALUES (4, 1, N'WELCOME50', N'Voucher Chào Mừng Thành Viên Mới', N'cash', 50000.00, 250000.00, '2026-08-10 21:48:08.317', 1, NULL, '2026-09-10 21:48:08.317');
INSERT INTO [dbo].[UserVouchers] ([VoucherId], [UserId], [Code], [Title], [VoucherType], [DiscountValue], [MinOrderAmount], [ExpiryDate], [IsUsed], [UsedAt], [CreatedAt]) VALUES (11, 11, N'WELCOME50', N'Voucher Chào Mừng Thành Viên Mới', N'cash', 50000.00, 200000.00, '2026-10-10 21:58:40.524', 0, NULL, '2026-09-10 21:58:40.524');
INSERT INTO [dbo].[UserVouchers] ([VoucherId], [UserId], [Code], [Title], [VoucherType], [DiscountValue], [MinOrderAmount], [ExpiryDate], [IsUsed], [UsedAt], [CreatedAt]) VALUES (12, 5, N'LANHFRESH20', N'Giảm 20.000đ Đơn Nông Sản', N'cash', 20000.00, 150000.00, '2026-12-10 21:58:49.882', 0, NULL, '2026-09-10 21:58:49.882');
INSERT INTO [dbo].[UserVouchers] ([VoucherId], [UserId], [Code], [Title], [VoucherType], [DiscountValue], [MinOrderAmount], [ExpiryDate], [IsUsed], [UsedAt], [CreatedAt]) VALUES (13, 5, N'FREESHIP50', N'Miễn Phí Vận Chuyển Hạng Vàng', N'ship', 30000.00, 200000.00, '2026-10-10 21:58:49.882', 0, NULL, '2026-09-10 21:58:49.882');
INSERT INTO [dbo].[UserVouchers] ([VoucherId], [UserId], [Code], [Title], [VoucherType], [DiscountValue], [MinOrderAmount], [ExpiryDate], [IsUsed], [UsedAt], [CreatedAt]) VALUES (14, 5, N'VIETGAP10', N'Giảm 10% Rau Hữu Cơ VietGAP', N'discount', 15000.00, 100000.00, '2026-11-10 21:58:49.882', 0, NULL, '2026-09-10 21:58:49.882');
INSERT INTO [dbo].[UserVouchers] ([VoucherId], [UserId], [Code], [Title], [VoucherType], [DiscountValue], [MinOrderAmount], [ExpiryDate], [IsUsed], [UsedAt], [CreatedAt]) VALUES (15, 5, N'WELCOME50', N'Voucher Chào Mừng Thành Viên Mới', N'cash', 50000.00, 250000.00, '2026-08-10 21:58:49.882', 1, NULL, '2026-09-10 21:58:49.882');
SET IDENTITY_INSERT [dbo].[UserVouchers] OFF;
GO

-- Bat lai toan bo Foreign Key constraints
EXEC sp_MSforeachtable 'ALTER TABLE ? WITH CHECK CHECK CONSTRAINT all';
GO
PRINT N'Hoan tat phuc hoi co so du lieu QL_WebMuaBanNongSan day du Schema & Data!';
GO
