-- ==============================================================================
-- BẢN SAO LƯU TOÀN DIỆN CƠ SỞ DỮ LIỆU: QL_WebMuaBanNongSan (HOÀN CHỈNH NHẤT)
-- Hệ thống Mua Bán Nông Sản Sạch & Truy Xuất Nguồn Gốc (Web Store + Admin + Mobile App)
-- Ngày biên soạn & chuẩn hóa: 2026-09-11
--
-- NỘI DUNG BAO GỒM:
--   1. Schema DDL đầy đủ 31 bảng chuẩn (Bao gồm 6 bảng mới: Loyalty, Tiers, Points, Vouchers, AuditLogs, RefreshTokens)
--   2. Đầy đủ các cột nghiệp vụ mới: AddressType, ApprovedBy, ApprovedAt, RejectReason
--   3. Đầy đủ Seed Data thực tế (370 records: Users chuẩn BCrypt mật khẩu 'Demo@123', 31 Đơn hàng, 68 Chi tiết đơn, 14 Lô hàng, Vouchers...)
--   4. Ràng buộc toàn vẹn khóa chính, khóa ngoại, chỉ mục Index và Trigger kiểm tra nhà cung cấp lô hàng
--   5. Mã hóa: UTF-8 with BOM (utf-8-sig) - Tương thích 100% SSMS & Azure Data Studio
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

-- Vô hiệu hóa toàn bộ ràng buộc để tạo cấu trúc và nạp dữ liệu sạch sẽ
EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT all';
GO

-- ==============================================================================
-- 1. CẤU TRÚC 31 BẢNG (TABLES, PRIMARY KEYS, DEFAULTS)
-- ==============================================================================
-- ==============================================================================
-- FULL DATABASE BACKUP SCRIPT: QL_WebMuaBanNongSan
-- Generated at: 2026-09-11 11:59:38
-- Bao gom: Schema (DDL) day du 31 bang va Du lieu thuc te (Data) toan bo he thong
-- ==============================================================================



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
	[UserId] [bigint] NOT NULL,
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
	[OrderId] [bigint] NOT NULL,
	[Rating] [int] NOT NULL,
	[Comment] [nvarchar](max) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	[CreatedAt] [datetime2](7) NULL,
	[Status] [nvarchar](20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
PRIMARY KEY CLUSTERED 
(
	[ReviewId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

ALTER TABLE [dbo].[Reviews] ADD  DEFAULT (getdate()) FOR [CreatedAt]
ALTER TABLE [dbo].[Reviews] ADD  DEFAULT ('Approved') FOR [Status]
ALTER TABLE [dbo].[Reviews]  WITH CHECK ADD CHECK  (([Rating]>=(1) AND [Rating]<=(5)))
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
	[UserId] [bigint] NOT NULL,
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
END;
GO

-- -------------------------------------------------------------



-- ==============================================================================
-- KHÓA NGOẠI (FOREIGN KEYS) - TẠO SAU KHI TẤT CẢ 31 BẢNG ĐÃ TỒN TẠI
-- ==============================================================================
ALTER TABLE [dbo].[Addresses]  WITH CHECK ADD  CONSTRAINT [FK_Addresses_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
ON DELETE CASCADE
ALTER TABLE [dbo].[Addresses] CHECK CONSTRAINT [FK_Addresses_Users]
GO
ALTER TABLE [dbo].[AuditLogs]  WITH CHECK ADD  CONSTRAINT [FK_AuditLogs_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
ON DELETE CASCADE
ALTER TABLE [dbo].[AuditLogs] CHECK CONSTRAINT [FK_AuditLogs_Users]
GO
ALTER TABLE [dbo].[Batches]  WITH CHECK ADD  CONSTRAINT [FK_Batches_Farms] FOREIGN KEY([FarmId])
REFERENCES [dbo].[Farms] ([FarmId])
ALTER TABLE [dbo].[Batches] CHECK CONSTRAINT [FK_Batches_Farms]
GO
ALTER TABLE [dbo].[Batches]  WITH CHECK ADD  CONSTRAINT [FK_Batches_Products] FOREIGN KEY([ProductId])
REFERENCES [dbo].[Products] ([ProductId])
ALTER TABLE [dbo].[Batches] CHECK CONSTRAINT [FK_Batches_Products]
GO
ALTER TABLE [dbo].[CartItems]  WITH CHECK ADD  CONSTRAINT [FK_CartItems_Carts] FOREIGN KEY([CartId])
REFERENCES [dbo].[Carts] ([CartId])
ON DELETE CASCADE
ALTER TABLE [dbo].[CartItems] CHECK CONSTRAINT [FK_CartItems_Carts]
GO
ALTER TABLE [dbo].[CartItems]  WITH CHECK ADD  CONSTRAINT [FK_CartItems_Products] FOREIGN KEY([ProductId])
REFERENCES [dbo].[Products] ([ProductId])
ALTER TABLE [dbo].[CartItems] CHECK CONSTRAINT [FK_CartItems_Products]
GO
ALTER TABLE [dbo].[Carts]  WITH CHECK ADD  CONSTRAINT [FK_Carts_Users] FOREIGN KEY([CustomerId])
REFERENCES [dbo].[Users] ([UserId])
ON DELETE CASCADE
ALTER TABLE [dbo].[Carts] CHECK CONSTRAINT [FK_Carts_Users]
GO
ALTER TABLE [dbo].[Categories]  WITH CHECK ADD  CONSTRAINT [FK_Categories_Parent] FOREIGN KEY([ParentCategoryId])
REFERENCES [dbo].[Categories] ([CategoryId])
ALTER TABLE [dbo].[Categories] CHECK CONSTRAINT [FK_Categories_Parent]
GO
ALTER TABLE [dbo].[Farms]  WITH CHECK ADD  CONSTRAINT [FK_Farms_Suppliers] FOREIGN KEY([SupplierId])
REFERENCES [dbo].[Suppliers] ([SupplierId])
ON DELETE CASCADE
ALTER TABLE [dbo].[Farms] CHECK CONSTRAINT [FK_Farms_Suppliers]
GO
ALTER TABLE [dbo].[Inventories]  WITH CHECK ADD  CONSTRAINT [FK_Inventories_Batches] FOREIGN KEY([BatchId])
REFERENCES [dbo].[Batches] ([BatchId])
ON DELETE CASCADE
ALTER TABLE [dbo].[Inventories] CHECK CONSTRAINT [FK_Inventories_Batches]
GO
ALTER TABLE [dbo].[Notifications]  WITH CHECK ADD  CONSTRAINT [FK_Notifications_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
ON DELETE CASCADE
ALTER TABLE [dbo].[Notifications] CHECK CONSTRAINT [FK_Notifications_Users]
GO
ALTER TABLE [dbo].[OrderItems]  WITH CHECK ADD  CONSTRAINT [FK_OrderItems_Batches] FOREIGN KEY([BatchId])
REFERENCES [dbo].[Batches] ([BatchId])
ALTER TABLE [dbo].[OrderItems] CHECK CONSTRAINT [FK_OrderItems_Batches]
GO
ALTER TABLE [dbo].[OrderItems]  WITH CHECK ADD  CONSTRAINT [FK_OrderItems_Orders] FOREIGN KEY([OrderId])
REFERENCES [dbo].[Orders] ([OrderId])
ON DELETE CASCADE
ALTER TABLE [dbo].[OrderItems] CHECK CONSTRAINT [FK_OrderItems_Orders]
GO
ALTER TABLE [dbo].[OrderItems]  WITH CHECK ADD  CONSTRAINT [FK_OrderItems_Products] FOREIGN KEY([ProductId])
REFERENCES [dbo].[Products] ([ProductId])
ALTER TABLE [dbo].[OrderItems] CHECK CONSTRAINT [FK_OrderItems_Products]
GO
ALTER TABLE [dbo].[Orders]  WITH CHECK ADD  CONSTRAINT [FK_Orders_Addresses] FOREIGN KEY([AddressId])
REFERENCES [dbo].[Addresses] ([AddressId])
ALTER TABLE [dbo].[Orders] CHECK CONSTRAINT [FK_Orders_Addresses]
GO
ALTER TABLE [dbo].[Orders]  WITH CHECK ADD  CONSTRAINT [FK_Orders_Users] FOREIGN KEY([CustomerId])
REFERENCES [dbo].[Users] ([UserId])
ALTER TABLE [dbo].[Orders] CHECK CONSTRAINT [FK_Orders_Users]
GO
ALTER TABLE [dbo].[Payments]  WITH CHECK ADD  CONSTRAINT [FK_Payments_Orders] FOREIGN KEY([OrderId])
REFERENCES [dbo].[Orders] ([OrderId])
ON DELETE CASCADE
ALTER TABLE [dbo].[Payments] CHECK CONSTRAINT [FK_Payments_Orders]
GO
ALTER TABLE [dbo].[PointTransactions]  WITH CHECK ADD  CONSTRAINT [FK_PointTransactions_Orders] FOREIGN KEY([OrderId])
REFERENCES [dbo].[Orders] ([OrderId])
ON DELETE SET NULL
ALTER TABLE [dbo].[PointTransactions] CHECK CONSTRAINT [FK_PointTransactions_Orders]
GO
ALTER TABLE [dbo].[PointTransactions]  WITH CHECK ADD  CONSTRAINT [FK_PointTransactions_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
ON DELETE CASCADE
ALTER TABLE [dbo].[PointTransactions] CHECK CONSTRAINT [FK_PointTransactions_Users]
GO
ALTER TABLE [dbo].[ProductCertifications]  WITH CHECK ADD  CONSTRAINT [FK_ProdCert_Certifications] FOREIGN KEY([CertificationId])
REFERENCES [dbo].[Certifications] ([CertificationId])
ON DELETE CASCADE
ALTER TABLE [dbo].[ProductCertifications] CHECK CONSTRAINT [FK_ProdCert_Certifications]
GO
ALTER TABLE [dbo].[ProductCertifications]  WITH CHECK ADD  CONSTRAINT [FK_ProdCert_Products] FOREIGN KEY([ProductId])
REFERENCES [dbo].[Products] ([ProductId])
ON DELETE CASCADE
ALTER TABLE [dbo].[ProductCertifications] CHECK CONSTRAINT [FK_ProdCert_Products]
GO
ALTER TABLE [dbo].[ProductImages]  WITH CHECK ADD  CONSTRAINT [FK_ProductImages_Products] FOREIGN KEY([ProductId])
REFERENCES [dbo].[Products] ([ProductId])
ON DELETE CASCADE
ALTER TABLE [dbo].[ProductImages] CHECK CONSTRAINT [FK_ProductImages_Products]
GO
ALTER TABLE [dbo].[Products]  WITH CHECK ADD  CONSTRAINT [FK_Products_ApprovedBy] FOREIGN KEY([ApprovedBy])
REFERENCES [dbo].[Users] ([UserId])
ALTER TABLE [dbo].[Products] CHECK CONSTRAINT [FK_Products_ApprovedBy]
GO
ALTER TABLE [dbo].[Products]  WITH CHECK ADD  CONSTRAINT [FK_Products_Categories] FOREIGN KEY([CategoryId])
REFERENCES [dbo].[Categories] ([CategoryId])
ALTER TABLE [dbo].[Products] CHECK CONSTRAINT [FK_Products_Categories]
GO
ALTER TABLE [dbo].[Products]  WITH CHECK ADD  CONSTRAINT [FK_Products_Suppliers] FOREIGN KEY([SupplierId])
REFERENCES [dbo].[Suppliers] ([SupplierId])
ALTER TABLE [dbo].[Products] CHECK CONSTRAINT [FK_Products_Suppliers]
GO
ALTER TABLE [dbo].[ProductSeasons]  WITH CHECK ADD  CONSTRAINT [FK_ProductSeasons_Products] FOREIGN KEY([ProductId])
REFERENCES [dbo].[Products] ([ProductId])
ON DELETE CASCADE
ALTER TABLE [dbo].[ProductSeasons] CHECK CONSTRAINT [FK_ProductSeasons_Products]
GO
ALTER TABLE [dbo].[PromotionProducts]  WITH CHECK ADD  CONSTRAINT [FK_PromoProd_Products] FOREIGN KEY([ProductId])
REFERENCES [dbo].[Products] ([ProductId])
ON DELETE CASCADE
ALTER TABLE [dbo].[PromotionProducts] CHECK CONSTRAINT [FK_PromoProd_Products]
GO
ALTER TABLE [dbo].[PromotionProducts]  WITH CHECK ADD  CONSTRAINT [FK_PromoProd_Promotions] FOREIGN KEY([PromotionId])
REFERENCES [dbo].[Promotions] ([PromotionId])
ON DELETE CASCADE
ALTER TABLE [dbo].[PromotionProducts] CHECK CONSTRAINT [FK_PromoProd_Promotions]
GO
ALTER TABLE [dbo].[RecommendationLogs]  WITH CHECK ADD  CONSTRAINT [FK_RecLogs_Products] FOREIGN KEY([ProductId])
REFERENCES [dbo].[Products] ([ProductId])
ON DELETE CASCADE
ALTER TABLE [dbo].[RecommendationLogs] CHECK CONSTRAINT [FK_RecLogs_Products]
GO
ALTER TABLE [dbo].[RecommendationLogs]  WITH CHECK ADD  CONSTRAINT [FK_RecLogs_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
ON DELETE CASCADE
ALTER TABLE [dbo].[RecommendationLogs] CHECK CONSTRAINT [FK_RecLogs_Users]
GO
ALTER TABLE [dbo].[RefreshTokens]  WITH CHECK ADD  CONSTRAINT [FK_RefreshTokens_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
ON DELETE CASCADE
ALTER TABLE [dbo].[RefreshTokens] CHECK CONSTRAINT [FK_RefreshTokens_Users]
GO
ALTER TABLE [dbo].[ReviewImages]  WITH CHECK ADD  CONSTRAINT [FK_ReviewImages_Reviews] FOREIGN KEY([ReviewId])
REFERENCES [dbo].[Reviews] ([ReviewId])
ON DELETE CASCADE
ALTER TABLE [dbo].[ReviewImages] CHECK CONSTRAINT [FK_ReviewImages_Reviews]
GO
ALTER TABLE [dbo].[Reviews]  WITH CHECK ADD  CONSTRAINT [FK_Reviews_Orders] FOREIGN KEY([OrderId])
REFERENCES [dbo].[Orders] ([OrderId])
ALTER TABLE [dbo].[Reviews] CHECK CONSTRAINT [FK_Reviews_Orders]
GO
ALTER TABLE [dbo].[Reviews]  WITH CHECK ADD  CONSTRAINT [FK_Reviews_Products] FOREIGN KEY([ProductId])
REFERENCES [dbo].[Products] ([ProductId])
ALTER TABLE [dbo].[Reviews] CHECK CONSTRAINT [FK_Reviews_Products]
GO
ALTER TABLE [dbo].[Reviews]  WITH CHECK ADD  CONSTRAINT [FK_Reviews_Users] FOREIGN KEY([CustomerId])
REFERENCES [dbo].[Users] ([UserId])
ALTER TABLE [dbo].[Reviews] CHECK CONSTRAINT [FK_Reviews_Users]
GO
ALTER TABLE [dbo].[Suppliers]  WITH CHECK ADD  CONSTRAINT [FK_Suppliers_ApprovedBy] FOREIGN KEY([ApprovedBy])
REFERENCES [dbo].[Users] ([UserId])
ALTER TABLE [dbo].[Suppliers] CHECK CONSTRAINT [FK_Suppliers_ApprovedBy]
GO
ALTER TABLE [dbo].[Suppliers]  WITH CHECK ADD  CONSTRAINT [FK_Suppliers_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
ON DELETE CASCADE
ALTER TABLE [dbo].[Suppliers] CHECK CONSTRAINT [FK_Suppliers_Users]
GO
ALTER TABLE [dbo].[UserBehaviors]  WITH CHECK ADD  CONSTRAINT [FK_UserBehaviors_Products] FOREIGN KEY([ProductId])
REFERENCES [dbo].[Products] ([ProductId])
ON DELETE SET NULL
ALTER TABLE [dbo].[UserBehaviors] CHECK CONSTRAINT [FK_UserBehaviors_Products]
GO
ALTER TABLE [dbo].[UserBehaviors]  WITH CHECK ADD  CONSTRAINT [FK_UserBehaviors_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
ON DELETE CASCADE
ALTER TABLE [dbo].[UserBehaviors] CHECK CONSTRAINT [FK_UserBehaviors_Users]
GO
ALTER TABLE [dbo].[UserLoyalties]  WITH CHECK ADD  CONSTRAINT [FK_UserLoyalties_Tiers] FOREIGN KEY([TierId])
REFERENCES [dbo].[MembershipTiers] ([TierId])
ALTER TABLE [dbo].[UserLoyalties] CHECK CONSTRAINT [FK_UserLoyalties_Tiers]
GO
ALTER TABLE [dbo].[UserLoyalties]  WITH CHECK ADD  CONSTRAINT [FK_UserLoyalties_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
ON DELETE CASCADE
ALTER TABLE [dbo].[UserLoyalties] CHECK CONSTRAINT [FK_UserLoyalties_Users]
GO
ALTER TABLE [dbo].[Users]  WITH CHECK ADD  CONSTRAINT [FK_Users_Roles] FOREIGN KEY([RoleId])
REFERENCES [dbo].[Roles] ([RoleId])
ALTER TABLE [dbo].[Users] CHECK CONSTRAINT [FK_Users_Roles]
GO
ALTER TABLE [dbo].[UserVouchers]  WITH CHECK ADD  CONSTRAINT [FK_UserVouchers_Users] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([UserId])
ON DELETE CASCADE
ALTER TABLE [dbo].[UserVouchers] CHECK CONSTRAINT [FK_UserVouchers_Users]
GO


-- ==============================================================================
-- 2. NẠP TOÀN BỘ DỮ LIỆU MẪU THỰC TẾ (SEED DATA - 370 RECORDS)
-- ==============================================================================
EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT all';
GO

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
-- Data for: [dbo].[Batches] (142 rows)
-- -------------------------------------------------------------
SET IDENTITY_INSERT [dbo].[Batches] ON;
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (1, 1, 2, N'CT-260820-001', '2026-08-20 06:00:00.000', '2026-08-20 12:00:00.000', '2026-08-28 23:59:59.000', 120.00, N'kg', N'Active', '2026-08-20 12:00:00.000');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (2, 1, 1, N'CT-260817-001', '2026-08-17 06:00:00.000', '2026-08-17 12:00:00.000', '2026-08-24 23:59:59.000', 80.00, N'kg', N'Active', '2026-08-17 12:00:00.000');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (3, 2, 1, N'XL-260821-001', '2026-08-21 06:00:00.000', '2026-08-21 11:00:00.000', '2026-08-27 23:59:59.000', 100.00, N'kg', N'Active', '2026-08-21 11:00:00.000');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (4, 3, 1, N'NĐG-260819-001', '2026-08-19 06:00:00.000', '2026-08-19 11:00:00.000', '2026-08-29 23:59:59.000', 60.00, N'hộp', N'Active', '2026-08-19 11:00:00.000');
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
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (15, 13, 1, N'LOT-260910-013', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.560', '2026-09-17 00:00:00.000', 120.00, N'kg', N'Active', '2026-09-10 15:49:13.560');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (16, 14, 2, N'LOT-260910-014', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.563', '2026-09-24 00:00:00.000', 85.00, N'bắp', N'Active', '2026-09-10 15:49:13.563');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (17, 15, 3, N'LOT-260910-015', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.563', '2026-09-17 00:00:00.000', 150.00, N'kg', N'Active', '2026-09-10 15:49:13.563');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (18, 16, 1, N'LOT-260910-016', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.563', '2026-09-18 00:00:00.000', 90.00, N'kg', N'Active', '2026-09-10 15:49:13.563');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (19, 17, 3, N'LOT-260910-017', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.563', '2026-09-16 00:00:00.000', 110.00, N'kg', N'Active', '2026-09-10 15:49:13.563');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (20, 18, 4, N'LOT-260910-018', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.563', '2026-09-16 00:00:00.000', 130.00, N'kg', N'Active', '2026-09-10 15:49:13.563');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (21, 19, 1, N'LOT-260910-019', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.563', '2026-09-20 00:00:00.000', 75.00, N'kg', N'Active', '2026-09-10 15:49:13.563');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (22, 20, 3, N'LOT-260910-020', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.566', '2026-09-15 00:00:00.000', 60.00, N'kg', N'Active', '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (23, 21, 2, N'LOT-260910-021', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.566', '2026-09-17 00:00:00.000', 80.00, N'kg', N'Active', '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (24, 22, 1, N'LOT-260910-022', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.566', '2026-09-16 00:00:00.000', 70.00, N'kg', N'Active', '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (25, 23, 1, N'LOT-260910-023', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.566', '2026-09-22 00:00:00.000', 95.00, N'kg', N'Active', '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (26, 24, 2, N'LOT-260910-024', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.566', '2026-09-30 00:00:00.000', 140.00, N'kg', N'Active', '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (27, 25, 4, N'LOT-260910-025', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.566', '2026-10-25 00:00:00.000', 180.00, N'kg', N'Active', '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (28, 26, 3, N'LOT-260910-026', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.566', '2026-09-22 00:00:00.000', 160.00, N'kg', N'Active', '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (29, 27, 3, N'LOT-260910-027', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.566', '2026-09-20 00:00:00.000', 130.00, N'kg', N'Active', '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (30, 28, 2, N'LOT-260910-028', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.566', '2026-09-22 00:00:00.000', 70.00, N'kg', N'Active', '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (31, 29, 4, N'LOT-260910-029', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.566', '2026-09-18 00:00:00.000', 110.00, N'kg', N'Active', '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (32, 30, 1, N'LOT-260910-030', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.566', '2026-09-30 00:00:00.000', 150.00, N'kg', N'Active', '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (33, 31, 2, N'LOT-260910-031', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.566', '2026-09-28 00:00:00.000', 170.00, N'kg', N'Active', '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (34, 32, 2, N'LOT-260910-032', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.566', '2026-10-15 00:00:00.000', 200.00, N'kg', N'Active', '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (35, 33, 5, N'LOT-260910-033', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.566', '2026-09-17 00:00:00.000', 250.00, N'kg', N'Active', '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (36, 34, 5, N'LOT-260910-034', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.566', '2026-10-10 00:00:00.000', 180.00, N'quả', N'Active', '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (37, 35, 5, N'LOT-260910-035', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.566', '2026-09-20 00:00:00.000', 120.00, N'kg', N'Active', '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (38, 36, 5, N'LOT-260910-036', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.566', '2026-09-18 00:00:00.000', 160.00, N'kg', N'Active', '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (39, 37, 1, N'LOT-260910-037', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.566', '2026-09-24 00:00:00.000', 140.00, N'kg', N'Active', '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (40, 38, 5, N'LOT-260910-038', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.570', '2026-09-20 00:00:00.000', 130.00, N'kg', N'Active', '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (41, 39, 4, N'LOT-260910-039', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.570', '2026-09-22 00:00:00.000', 150.00, N'kg', N'Active', '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (42, 40, 1, N'LOT-260910-040', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.570', '2026-09-30 00:00:00.000', 110.00, N'kg', N'Active', '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (43, 41, 3, N'LOT-260910-041', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.570', '2026-09-20 00:00:00.000', 90.00, N'nải', N'Active', '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (44, 42, 1, N'LOT-260910-042', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.570', '2026-09-18 00:00:00.000', 140.00, N'kg', N'Active', '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (45, 43, 1, N'LOT-260910-043', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.570', '2026-09-17 00:00:00.000', 100.00, N'kg', N'Active', '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (46, 44, 5, N'LOT-260910-044', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.570', '2026-09-20 00:00:00.000', 120.00, N'kg', N'Active', '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (47, 45, 5, N'LOT-260910-045', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.570', '2026-09-25 00:00:00.000', 140.00, N'kg', N'Active', '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (48, 46, 3, N'LOT-260910-046', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.570', '2026-10-05 00:00:00.000', 160.00, N'kg', N'Active', '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (49, 47, 5, N'LOT-260910-047', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.570', '2026-09-30 00:00:00.000', 100.00, N'kg', N'Active', '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (50, 48, 1, N'LOT-260910-048', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.570', '2026-09-28 00:00:00.000', 170.00, N'kg', N'Active', '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (51, 49, 1, N'LOT-260910-049', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.570', '2026-09-22 00:00:00.000', 80.00, N'hộp', N'Active', '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (52, 50, 2, N'LOT-260910-050', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.570', '2026-09-24 00:00:00.000', 110.00, N'kg', N'Active', '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (53, 51, 1, N'LOT-260910-051', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.570', '2026-09-20 00:00:00.000', 50.00, N'hộp', N'Active', '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (54, 52, 2, N'LOT-260910-052', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.570', '2026-09-18 00:00:00.000', 45.00, N'hộp', N'Active', '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (55, 53, 1, N'LOT-260910-053', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.570', '2026-09-17 00:00:00.000', 65.00, N'kg', N'Active', '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (56, 54, 6, N'LOT-260910-054', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.570', '2026-09-25 00:00:00.000', 120.00, N'kg', N'Active', '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (57, 55, 2, N'LOT-260910-055', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.570', '2026-09-20 00:00:00.000', 60.00, N'hộp', N'Active', '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (58, 56, 1, N'LOT-260910-056', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.570', '2026-09-17 00:00:00.000', 70.00, N'hộp', N'Active', '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (59, 57, 2, N'LOT-260910-057', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.573', '2026-09-22 00:00:00.000', 150.00, N'gói', N'Active', '2026-09-10 15:49:13.573');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (60, 58, 1, N'LOT-260910-058', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.573', '2026-09-20 00:00:00.000', 85.00, N'hộp', N'Active', '2026-09-10 15:49:13.573');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (61, 59, 3, N'LOT-260910-059', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.573', '2026-09-20 00:00:00.000', 100.00, N'kg', N'Active', '2026-09-10 15:49:13.573');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (62, 60, 4, N'LOT-260910-060', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.573', '2026-09-17 00:00:00.000', 80.00, N'kg', N'Active', '2026-09-10 15:49:13.573');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (63, 61, 1, N'LOT-260910-061', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.573', '2026-11-09 00:00:00.000', 120.00, N'kg', N'Active', '2026-09-10 15:49:13.573');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (64, 62, 3, N'LOT-260910-062', '2026-09-09 00:00:00.000', '2026-09-10 15:49:13.573', '2026-10-05 00:00:00.000', 140.00, N'kg', N'Active', '2026-09-10 15:49:13.573');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (65, 63, 5, N'LOT-HAT-260910-063', '2026-09-05 00:00:00.000', '2026-09-10 15:52:42.756', '2027-03-09 00:00:00.000', 150.00, N'hộp', N'Active', '2026-09-10 15:52:42.756');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (66, 64, 4, N'LOT-HAT-260910-064', '2026-09-05 00:00:00.000', '2026-09-10 15:52:42.760', '2027-01-08 00:00:00.000', 120.00, N'hộp', N'Active', '2026-09-10 15:52:42.760');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (67, 65, 1, N'LOT-HAT-260910-065', '2026-09-05 00:00:00.000', '2026-09-10 15:52:42.760', '2027-03-09 00:00:00.000', 100.00, N'hộp', N'Active', '2026-09-10 15:52:42.760');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (68, 66, 3, N'LOT-HAT-260910-066', '2026-09-05 00:00:00.000', '2026-09-10 15:52:42.760', '2026-12-09 00:00:00.000', 200.00, N'kg', N'Active', '2026-09-10 15:52:42.760');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (69, 67, 1, N'LOT-HAT-260910-067', '2026-09-05 00:00:00.000', '2026-09-10 15:52:42.760', '2027-03-09 00:00:00.000', 220.00, N'kg', N'Active', '2026-09-10 15:52:42.760');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (70, 68, 1, N'LOT-HAT-260910-068', '2026-09-05 00:00:00.000', '2026-09-10 15:52:42.760', '2027-03-09 00:00:00.000', 180.00, N'kg', N'Active', '2026-09-10 15:52:42.760');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (71, 69, 4, N'LOT-HAT-260910-069', '2026-09-05 00:00:00.000', '2026-09-10 15:52:42.760', '2027-03-09 00:00:00.000', 160.00, N'kg', N'Active', '2026-09-10 15:52:42.760');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (72, 70, 2, N'LOT-HAT-260910-070', '2026-09-05 00:00:00.000', '2026-09-10 15:52:42.760', '2027-09-10 00:00:00.000', 140.00, N'gói', N'Active', '2026-09-10 15:52:42.760');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (73, 71, 3, N'LOT-260910-071', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.706', '2026-09-16 00:00:00.000', 120.00, N'kg', N'Active', '2026-09-10 16:05:55.706');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (74, 72, 1, N'LOT-260910-072', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.710', '2026-09-17 00:00:00.000', 90.00, N'kg', N'Active', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (75, 73, 1, N'LOT-260910-073', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.710', '2026-09-18 00:00:00.000', 100.00, N'kg', N'Active', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (76, 74, 2, N'LOT-260910-074', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.710', '2026-09-18 00:00:00.000', 85.00, N'kg', N'Active', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (77, 75, 1, N'LOT-260910-075', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.710', '2026-09-30 00:00:00.000', 160.00, N'bắp', N'Active', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (78, 76, 2, N'LOT-260910-076', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.710', '2026-09-25 00:00:00.000', 140.00, N'bắp', N'Active', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (79, 77, 3, N'LOT-260910-077', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.710', '2026-09-22 00:00:00.000', 180.00, N'kg', N'Active', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (80, 78, 4, N'LOT-260910-078', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.710', '2026-10-10 00:00:00.000', 200.00, N'kg', N'Active', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (81, 79, 3, N'LOT-260910-079', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.710', '2026-09-20 00:00:00.000', 130.00, N'kg', N'Active', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (82, 80, 1, N'LOT-260910-080', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.710', '2026-09-22 00:00:00.000', 110.00, N'kg', N'Active', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (83, 81, 1, N'LOT-260910-081', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.710', '2026-09-24 00:00:00.000', 100.00, N'kg', N'Active', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (84, 82, 2, N'LOT-260910-082', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.710', '2026-10-10 00:00:00.000', 220.00, N'kg', N'Active', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (85, 83, 1, N'LOT-260910-083', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.710', '2026-10-05 00:00:00.000', 250.00, N'kg', N'Active', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (86, 84, 2, N'LOT-260910-084', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.710', '2026-10-10 00:00:00.000', 150.00, N'kg', N'Active', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (87, 85, 4, N'LOT-260910-085', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.710', '2026-09-30 00:00:00.000', 170.00, N'kg', N'Active', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (88, 86, 3, N'LOT-260910-086', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.710', '2026-10-15 00:00:00.000', 140.00, N'kg', N'Active', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (89, 87, 1, N'LOT-260910-087', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.710', '2026-10-10 00:00:00.000', 130.00, N'kg', N'Active', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (90, 88, 2, N'LOT-260910-088', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.710', '2026-10-10 00:00:00.000', 190.00, N'kg', N'Active', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (91, 89, 3, N'LOT-260910-089', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.710', '2026-09-15 00:00:00.000', 80.00, N'kg', N'Active', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (92, 90, 2, N'LOT-260910-090', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.710', '2026-09-18 00:00:00.000', 95.00, N'hộp', N'Active', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (93, 91, 1, N'LOT-260910-091', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.710', '2026-09-22 00:00:00.000', 100.00, N'kg', N'Active', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (94, 92, 3, N'LOT-260910-092', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.710', '2026-09-18 00:00:00.000', 85.00, N'kg', N'Active', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (95, 93, 3, N'LOT-260910-093', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.710', '2026-09-17 00:00:00.000', 70.00, N'kg', N'Active', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (96, 94, 4, N'LOT-260910-094', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.710', '2026-09-17 00:00:00.000', 65.00, N'kg', N'Active', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (97, 95, 1, N'LOT-260910-095', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.710', '2026-09-16 00:00:00.000', 60.00, N'kg', N'Active', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (98, 96, 1, N'LOT-260910-096', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.710', '2026-09-17 00:00:00.000', 75.00, N'kg', N'Active', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (99, 97, 3, N'LOT-260910-097', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.713', '2026-09-16 00:00:00.000', 80.00, N'kg', N'Active', '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (100, 98, 1, N'LOT-260910-098', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.713', '2026-09-16 00:00:00.000', 50.00, N'kg', N'Active', '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (101, 99, 4, N'LOT-260910-099', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.713', '2026-09-30 00:00:00.000', 90.00, N'kg', N'Active', '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (102, 100, 3, N'LOT-260910-100', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.713', '2026-09-30 00:00:00.000', 100.00, N'kg', N'Active', '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (103, 101, 1, N'LOT-260910-101', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.713', '2026-12-09 00:00:00.000', 80.00, N'kg', N'Active', '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (104, 102, 3, N'LOT-260910-102', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.713', '2026-10-25 00:00:00.000', 110.00, N'kg', N'Active', '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (105, 103, 3, N'LOT-260910-103', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.713', '2026-09-20 00:00:00.000', 120.00, N'nải', N'Active', '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (106, 104, 3, N'LOT-260910-104', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.713', '2026-09-20 00:00:00.000', 110.00, N'nải', N'Active', '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (107, 105, 4, N'LOT-260910-105', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.713', '2026-09-25 00:00:00.000', 200.00, N'kg', N'Active', '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (108, 106, 3, N'LOT-260910-106', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.713', '2026-09-22 00:00:00.000', 140.00, N'kg', N'Active', '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (109, 107, 6, N'LOT-260910-107', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.713', '2026-09-25 00:00:00.000', 170.00, N'kg', N'Active', '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (110, 108, 4, N'LOT-260910-108', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.713', '2026-10-10 00:00:00.000', 150.00, N'quả', N'Active', '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (111, 109, 1, N'LOT-260910-109', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.713', '2026-10-05 00:00:00.000', 100.00, N'kg', N'Active', '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (112, 110, 5, N'LOT-260910-110', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.713', '2026-09-20 00:00:00.000', 120.00, N'kg', N'Active', '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (113, 111, 5, N'LOT-260910-111', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.713', '2026-09-22 00:00:00.000', 160.00, N'kg', N'Active', '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (114, 112, 4, N'LOT-260910-112', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.716', '2026-09-24 00:00:00.000', 110.00, N'kg', N'Active', '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (115, 113, 4, N'LOT-260910-113', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.716', '2026-09-25 00:00:00.000', 130.00, N'quả', N'Active', '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (116, 114, 5, N'LOT-260910-114', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.716', '2026-09-18 00:00:00.000', 180.00, N'kg', N'Active', '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (117, 115, 5, N'LOT-260910-115', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.716', '2026-09-18 00:00:00.000', 140.00, N'kg', N'Active', '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (118, 116, 1, N'LOT-260910-116', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.716', '2026-09-20 00:00:00.000', 110.00, N'kg', N'Active', '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (119, 117, 5, N'LOT-260910-117', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.716', '2026-09-18 00:00:00.000', 100.00, N'kg', N'Active', '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (120, 118, 5, N'LOT-260910-118', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.716', '2026-09-22 00:00:00.000', 150.00, N'kg', N'Active', '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (121, 119, 2, N'LOT-260910-119', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.716', '2026-09-20 00:00:00.000', 130.00, N'kg', N'Active', '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (122, 120, 2, N'LOT-260910-120', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.716', '2026-09-22 00:00:00.000', 140.00, N'kg', N'Active', '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (123, 121, 1, N'LOT-260910-121', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.716', '2026-09-25 00:00:00.000', 120.00, N'kg', N'Active', '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (124, 122, 1, N'LOT-260910-122', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.716', '2027-03-09 00:00:00.000', 150.00, N'kg', N'Active', '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (125, 123, 2, N'LOT-260910-123', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.716', '2027-03-09 00:00:00.000', 130.00, N'kg', N'Active', '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (126, 124, 1, N'LOT-260910-124', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.716', '2027-03-09 00:00:00.000', 160.00, N'kg', N'Active', '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (127, 125, 2, N'LOT-260910-125', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.716', '2027-03-09 00:00:00.000', 110.00, N'kg', N'Active', '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (128, 126, 5, N'LOT-260910-126', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.716', '2027-03-09 00:00:00.000', 120.00, N'hộp', N'Active', '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (129, 127, 4, N'LOT-260910-127', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.716', '2027-03-09 00:00:00.000', 100.00, N'gói', N'Active', '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (130, 128, 1, N'LOT-260910-128', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.716', '2026-11-09 00:00:00.000', 140.00, N'kg', N'Active', '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (131, 129, 4, N'LOT-260910-129', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.716', '2027-03-09 00:00:00.000', 130.00, N'kg', N'Active', '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (132, 130, 4, N'LOT-260910-130', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.716', '2027-03-09 00:00:00.000', 500.00, N'kg', N'Active', '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (133, 131, 1, N'LOT-260910-131', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.720', '2027-03-09 00:00:00.000', 300.00, N'kg', N'Active', '2026-09-10 16:05:55.720');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (134, 132, 1, N'LOT-260910-132', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.720', '2026-09-20 00:00:00.000', 160.00, N'bắp', N'Active', '2026-09-10 16:05:55.720');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (135, 133, 3, N'LOT-260910-133', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.720', '2026-09-20 00:00:00.000', 180.00, N'bắp', N'Active', '2026-09-10 16:05:55.720');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (136, 134, 2, N'LOT-260910-134', '2026-09-08 00:00:00.000', '2026-09-10 16:05:55.720', '2027-09-10 00:00:00.000', 140.00, N'gói', N'Active', '2026-09-10 16:05:55.720');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (137, 135, 3, N'LOT-GAO-260910-135', '2026-08-31 00:00:00.000', '2026-09-10 16:10:39.693', '2027-03-09 00:00:00.000', 400.00, N'kg', N'Active', '2026-09-10 16:10:39.693');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (138, 136, 1, N'LOT-GAO-260910-136', '2026-08-31 00:00:00.000', '2026-09-10 16:10:39.700', '2027-03-09 00:00:00.000', 350.00, N'kg', N'Active', '2026-09-10 16:10:39.700');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (139, 137, 4, N'LOT-GAO-260910-137', '2026-08-31 00:00:00.000', '2026-09-10 16:10:39.700', '2027-03-09 00:00:00.000', 250.00, N'kg', N'Active', '2026-09-10 16:10:39.700');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (140, 138, 1, N'LOT-GAO-260910-138', '2026-08-31 00:00:00.000', '2026-09-10 16:10:39.703', '2027-03-09 00:00:00.000', 300.00, N'kg', N'Active', '2026-09-10 16:10:39.703');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (141, 139, 1, N'LOT-GAO-260910-139', '2026-08-31 00:00:00.000', '2026-09-10 16:10:39.703', '2027-03-09 00:00:00.000', 280.00, N'kg', N'Active', '2026-09-10 16:10:39.703');
INSERT INTO [dbo].[Batches] ([BatchId], [ProductId], [FarmId], [BatchCode], [HarvestDate], [ReceivedDate], [ExpiryDate], [InitialQuantity], [Unit], [Status], [CreatedAt]) VALUES (142, 140, 3, N'LOT-GAO-260910-140', '2026-08-31 00:00:00.000', '2026-09-10 16:10:39.703', '2027-03-09 00:00:00.000', 350.00, N'kg', N'Active', '2026-09-10 16:10:39.703');
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
-- Data for: [dbo].[Categories] (5 rows)
-- -------------------------------------------------------------
SET IDENTITY_INSERT [dbo].[Categories] ON;
INSERT INTO [dbo].[Categories] ([CategoryId], [CategoryName], [ParentCategoryId], [Status]) VALUES (1, N'Rau củ', NULL, N'Active');
INSERT INTO [dbo].[Categories] ([CategoryId], [CategoryName], [ParentCategoryId], [Status]) VALUES (2, N'Trái cây', NULL, N'Active');
INSERT INTO [dbo].[Categories] ([CategoryId], [CategoryName], [ParentCategoryId], [Status]) VALUES (3, N'Rau thơm', NULL, N'Active');
INSERT INTO [dbo].[Categories] ([CategoryId], [CategoryName], [ParentCategoryId], [Status]) VALUES (4, N'Hạt', NULL, N'Active');
INSERT INTO [dbo].[Categories] ([CategoryId], [CategoryName], [ParentCategoryId], [Status]) VALUES (10, N'Gạo', NULL, N'Active');
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
-- Data for: [dbo].[Inventories] (142 rows)
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
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (15, 15, 120.00, 0.00, 10.00, '2026-09-10 15:49:13.563');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (16, 16, 85.00, 0.00, 10.00, '2026-09-10 15:49:13.563');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (17, 17, 150.00, 0.00, 10.00, '2026-09-10 15:49:13.563');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (18, 18, 90.00, 0.00, 10.00, '2026-09-10 15:49:13.563');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (19, 19, 110.00, 0.00, 10.00, '2026-09-10 15:49:13.563');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (20, 20, 130.00, 0.00, 10.00, '2026-09-10 15:49:13.563');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (21, 21, 75.00, 0.00, 10.00, '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (22, 22, 60.00, 0.00, 10.00, '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (23, 23, 80.00, 0.00, 10.00, '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (24, 24, 70.00, 0.00, 10.00, '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (25, 25, 95.00, 0.00, 10.00, '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (26, 26, 140.00, 0.00, 10.00, '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (27, 27, 180.00, 0.00, 10.00, '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (28, 28, 160.00, 0.00, 10.00, '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (29, 29, 130.00, 0.00, 10.00, '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (30, 30, 70.00, 0.00, 10.00, '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (31, 31, 110.00, 0.00, 10.00, '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (32, 32, 150.00, 0.00, 10.00, '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (33, 33, 170.00, 0.00, 10.00, '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (34, 34, 200.00, 0.00, 10.00, '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (35, 35, 250.00, 0.00, 10.00, '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (36, 36, 180.00, 0.00, 10.00, '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (37, 37, 120.00, 0.00, 10.00, '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (38, 38, 160.00, 0.00, 10.00, '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (39, 39, 140.00, 0.00, 10.00, '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (40, 40, 130.00, 0.00, 10.00, '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (41, 41, 150.00, 0.00, 10.00, '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (42, 42, 110.00, 0.00, 10.00, '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (43, 43, 90.00, 0.00, 10.00, '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (44, 44, 140.00, 0.00, 10.00, '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (45, 45, 100.00, 0.00, 10.00, '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (46, 46, 120.00, 0.00, 10.00, '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (47, 47, 140.00, 0.00, 10.00, '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (48, 48, 160.00, 0.00, 10.00, '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (49, 49, 100.00, 0.00, 10.00, '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (50, 50, 170.00, 0.00, 10.00, '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (51, 51, 80.00, 0.00, 10.00, '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (52, 52, 110.00, 0.00, 10.00, '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (53, 53, 50.00, 0.00, 10.00, '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (54, 54, 45.00, 0.00, 10.00, '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (55, 55, 65.00, 0.00, 10.00, '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (56, 56, 120.00, 0.00, 10.00, '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (57, 57, 60.00, 0.00, 10.00, '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (58, 58, 70.00, 0.00, 10.00, '2026-09-10 15:49:13.573');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (59, 59, 150.00, 0.00, 10.00, '2026-09-10 15:49:13.573');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (60, 60, 85.00, 0.00, 10.00, '2026-09-10 15:49:13.573');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (61, 61, 100.00, 0.00, 10.00, '2026-09-10 15:49:13.573');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (62, 62, 80.00, 0.00, 10.00, '2026-09-10 15:49:13.573');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (63, 63, 120.00, 0.00, 10.00, '2026-09-10 15:49:13.573');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (64, 64, 140.00, 0.00, 10.00, '2026-09-10 15:49:13.573');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (65, 65, 150.00, 0.00, 10.00, '2026-09-10 15:52:42.760');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (66, 66, 120.00, 0.00, 10.00, '2026-09-10 15:52:42.760');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (67, 67, 100.00, 0.00, 10.00, '2026-09-10 15:52:42.760');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (68, 68, 200.00, 0.00, 10.00, '2026-09-10 15:52:42.760');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (69, 69, 220.00, 0.00, 10.00, '2026-09-10 15:52:42.760');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (70, 70, 180.00, 0.00, 10.00, '2026-09-10 15:52:42.760');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (71, 71, 160.00, 0.00, 10.00, '2026-09-10 15:52:42.760');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (72, 72, 140.00, 0.00, 10.00, '2026-09-10 15:52:42.760');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (73, 73, 120.00, 0.00, 10.00, '2026-09-10 16:05:55.706');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (74, 74, 90.00, 0.00, 10.00, '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (75, 75, 100.00, 0.00, 10.00, '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (76, 76, 85.00, 0.00, 10.00, '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (77, 77, 160.00, 0.00, 10.00, '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (78, 78, 140.00, 0.00, 10.00, '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (79, 79, 180.00, 0.00, 10.00, '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (80, 80, 200.00, 0.00, 10.00, '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (81, 81, 130.00, 0.00, 10.00, '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (82, 82, 110.00, 0.00, 10.00, '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (83, 83, 100.00, 0.00, 10.00, '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (84, 84, 220.00, 0.00, 10.00, '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (85, 85, 250.00, 0.00, 10.00, '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (86, 86, 150.00, 0.00, 10.00, '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (87, 87, 170.00, 0.00, 10.00, '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (88, 88, 140.00, 0.00, 10.00, '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (89, 89, 130.00, 0.00, 10.00, '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (90, 90, 190.00, 0.00, 10.00, '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (91, 91, 80.00, 0.00, 10.00, '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (92, 92, 95.00, 0.00, 10.00, '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (93, 93, 100.00, 0.00, 10.00, '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (94, 94, 85.00, 0.00, 10.00, '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (95, 95, 70.00, 0.00, 10.00, '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (96, 96, 65.00, 0.00, 10.00, '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (97, 97, 60.00, 0.00, 10.00, '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (98, 98, 75.00, 0.00, 10.00, '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (99, 99, 80.00, 0.00, 10.00, '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (100, 100, 50.00, 0.00, 10.00, '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (101, 101, 90.00, 0.00, 10.00, '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (102, 102, 100.00, 0.00, 10.00, '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (103, 103, 80.00, 0.00, 10.00, '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (104, 104, 110.00, 0.00, 10.00, '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (105, 105, 120.00, 0.00, 10.00, '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (106, 106, 110.00, 0.00, 10.00, '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (107, 107, 200.00, 0.00, 10.00, '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (108, 108, 140.00, 0.00, 10.00, '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (109, 109, 170.00, 0.00, 10.00, '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (110, 110, 150.00, 0.00, 10.00, '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (111, 111, 100.00, 0.00, 10.00, '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (112, 112, 120.00, 0.00, 10.00, '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (113, 113, 160.00, 0.00, 10.00, '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (114, 114, 110.00, 0.00, 10.00, '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (115, 115, 130.00, 0.00, 10.00, '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (116, 116, 180.00, 0.00, 10.00, '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (117, 117, 140.00, 0.00, 10.00, '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (118, 118, 110.00, 0.00, 10.00, '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (119, 119, 100.00, 0.00, 10.00, '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (120, 120, 150.00, 0.00, 10.00, '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (121, 121, 130.00, 0.00, 10.00, '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (122, 122, 140.00, 0.00, 10.00, '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (123, 123, 120.00, 0.00, 10.00, '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (124, 124, 150.00, 0.00, 10.00, '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (125, 125, 130.00, 0.00, 10.00, '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (126, 126, 160.00, 0.00, 10.00, '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (127, 127, 110.00, 0.00, 10.00, '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (128, 128, 120.00, 0.00, 10.00, '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (129, 129, 100.00, 0.00, 10.00, '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (130, 130, 140.00, 0.00, 10.00, '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (131, 131, 130.00, 0.00, 10.00, '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (132, 132, 500.00, 0.00, 10.00, '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (133, 133, 300.00, 0.00, 10.00, '2026-09-10 16:05:55.720');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (134, 134, 160.00, 0.00, 10.00, '2026-09-10 16:05:55.720');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (135, 135, 180.00, 0.00, 10.00, '2026-09-10 16:05:55.720');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (136, 136, 140.00, 0.00, 10.00, '2026-09-10 16:05:55.720');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (137, 137, 400.00, 0.00, 20.00, '2026-09-10 16:10:39.700');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (138, 138, 350.00, 0.00, 20.00, '2026-09-10 16:10:39.700');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (139, 139, 250.00, 0.00, 20.00, '2026-09-10 16:10:39.703');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (140, 140, 300.00, 0.00, 20.00, '2026-09-10 16:10:39.703');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (141, 141, 280.00, 0.00, 20.00, '2026-09-10 16:10:39.703');
INSERT INTO [dbo].[Inventories] ([InventoryId], [BatchId], [QuantityOnHand], [ReservedQuantity], [ReorderLevel], [UpdatedAt]) VALUES (142, 142, 350.00, 0.00, 20.00, '2026-09-10 16:10:39.703');
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
-- Data for: [dbo].[ProductCertifications] (138 rows)
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
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (13, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (14, 3);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (15, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (16, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (17, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (18, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (19, 3);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (20, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (21, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (22, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (23, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (24, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (25, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (26, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (27, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (28, 3);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (29, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (30, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (31, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (32, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (33, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (34, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (35, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (36, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (37, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (38, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (39, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (40, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (41, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (42, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (43, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (44, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (45, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (46, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (47, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (48, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (49, 3);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (50, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (51, 3);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (52, 3);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (53, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (54, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (55, 3);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (56, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (57, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (58, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (59, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (60, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (61, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (62, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (63, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (64, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (65, 3);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (66, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (67, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (68, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (69, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (70, 3);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (71, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (72, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (73, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (74, 3);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (75, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (76, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (77, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (78, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (79, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (80, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (81, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (82, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (83, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (84, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (85, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (86, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (87, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (88, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (89, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (90, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (91, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (92, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (93, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (94, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (95, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (96, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (97, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (98, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (99, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (100, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (101, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (102, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (103, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (104, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (105, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (106, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (107, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (108, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (109, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (110, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (111, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (112, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (113, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (114, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (115, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (116, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (117, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (118, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (119, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (120, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (121, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (122, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (123, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (124, 3);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (125, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (126, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (127, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (128, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (129, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (130, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (131, 3);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (132, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (133, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (134, 3);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (135, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (136, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (137, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (138, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (139, 1);
INSERT INTO [dbo].[ProductCertifications] ([ProductId], [CertificationId]) VALUES (140, 1);
GO

-- -------------------------------------------------------------
-- Data for: [dbo].[ProductImages] (145 rows)
-- -------------------------------------------------------------
SET IDENTITY_INSERT [dbo].[ProductImages] ON;
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (14, 2, N'https://i.pinimg.com/1200x/46/8b/ce/468bce104aa40c47671da2c066a85741.jpg', 1, 2);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (15, 3, N'https://i.pinimg.com/736x/65/9f/d9/659fd94b2a3da412e3096f7c596281ce.jpg', 1, 2);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (16, 4, N'https://i.pinimg.com/736x/37/89/c5/3789c541f8eb004c7956f6f3b96225ce.jpg', 1, 2);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (17, 5, N'https://i.pinimg.com/1200x/68/ce/f0/68cef0c6a41741104b1f6e2064ac4241.jpg', 0, 2);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (18, 6, N'https://i.pinimg.com/1200x/b3/61/d9/b361d936a3f1ab04387bfcdfcd4850a6.jpg', 1, 2);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (19, 7, N'https://i.pinimg.com/736x/40/66/b9/4066b96e47f512217dbf18205a94e443.jpg', 1, 2);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (20, 8, N'https://i.pinimg.com/1200x/26/61/17/266117aa15f4bc9a01c13b1288407a17.jpg', 1, 2);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (21, 9, N'https://i.pinimg.com/736x/bd/47/d3/bd47d35bdadccae6f278ff4f3403c77d.jpg', 0, 2);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (22, 10, N'https://i.pinimg.com/736x/b1/d1/eb/b1d1eb1d00e9059fd9bca863bd3265e0.jpg', 1, 2);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (23, 11, N'https://i.pinimg.com/1200x/4d/b3/b0/4db3b0d3b8bd3297daa12d9c7ddeed6a.jpg', 1, 2);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (24, 12, N'https://i.pinimg.com/736x/45/a4/22/45a422fc37eac58903830d0193367f0e.jpg', 1, 2);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (27, 13, N'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (28, 14, N'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (29, 15, N'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (30, 16, N'https://images.unsplash.com/photo-1524179091875-bf99a9a6af57?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (31, 17, N'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (32, 18, N'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (33, 19, N'https://images.unsplash.com/photo-1556801712-76c8eb07bbc9?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (34, 20, N'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (35, 21, N'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (36, 22, N'https://images.unsplash.com/photo-1592417817098-8f3d69109853?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (37, 23, N'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (38, 24, N'https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (39, 25, N'https://images.unsplash.com/photo-1570586437263-ab629fccc818?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (40, 26, N'https://images.unsplash.com/photo-1582515073490-39981397c445?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (41, 27, N'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (42, 28, N'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (43, 29, N'https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (44, 30, N'https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (45, 31, N'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (46, 32, N'https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (47, 33, N'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (48, 34, N'https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (49, 35, N'https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (50, 36, N'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (51, 37, N'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (52, 38, N'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (53, 39, N'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (54, 40, N'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (55, 41, N'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (56, 42, N'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (57, 43, N'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (58, 44, N'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (59, 45, N'https://images.unsplash.com/photo-1557800636-894a64c1696f?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (60, 46, N'https://images.unsplash.com/photo-1533082608670-3157a55fb120?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (61, 47, N'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (62, 48, N'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (63, 49, N'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (64, 50, N'https://images.unsplash.com/photo-1561136594-7f68413baa99?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (65, 51, N'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (66, 52, N'https://images.unsplash.com/photo-1577069808021-72944b7d5268?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (67, 53, N'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (68, 54, N'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (69, 55, N'https://images.unsplash.com/photo-1504472478235-9bc48ba4d60f?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (70, 56, N'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (71, 57, N'https://images.unsplash.com/photo-1518736114810-3f3bf3666688?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (72, 58, N'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (73, 59, N'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (74, 60, N'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (75, 61, N'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (76, 62, N'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (77, 63, N'https://images.unsplash.com/photo-1509912760195-451e04c05877?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (78, 64, N'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (79, 65, N'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (80, 66, N'https://images.unsplash.com/photo-1567892323021-4d33458bfb7f?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (81, 67, N'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (82, 68, N'https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (83, 69, N'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (84, 70, N'https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (85, 71, N'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (86, 72, N'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (87, 73, N'https://images.unsplash.com/photo-1556801712-76c8eb07bbc9?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (88, 74, N'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (89, 75, N'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (90, 76, N'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (91, 77, N'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (92, 78, N'https://images.unsplash.com/photo-1582515073490-39981397c445?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (93, 79, N'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (94, 80, N'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (95, 81, N'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (96, 82, N'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (97, 83, N'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (98, 84, N'https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (99, 85, N'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (100, 86, N'https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (101, 87, N'https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (102, 88, N'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (103, 89, N'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (104, 90, N'https://images.unsplash.com/photo-1504472478235-9bc48ba4d60f?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (105, 91, N'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (106, 92, N'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (107, 93, N'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (108, 94, N'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (109, 95, N'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (110, 96, N'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (111, 97, N'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (112, 98, N'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (113, 99, N'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (114, 100, N'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (115, 101, N'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (116, 102, N'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (117, 103, N'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (118, 104, N'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (119, 105, N'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (120, 106, N'https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (121, 107, N'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (122, 108, N'https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (123, 109, N'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (124, 110, N'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (125, 111, N'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (126, 112, N'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (127, 113, N'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (128, 114, N'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (129, 115, N'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (130, 116, N'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (131, 117, N'https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (132, 118, N'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (133, 119, N'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (134, 120, N'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (135, 121, N'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (136, 122, N'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (137, 123, N'https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (138, 124, N'https://images.unsplash.com/photo-1509912760195-451e04c05877?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (139, 125, N'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (140, 126, N'https://images.unsplash.com/photo-1509912760195-451e04c05877?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (141, 127, N'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (142, 128, N'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (143, 129, N'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (144, 130, N'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (145, 131, N'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (146, 132, N'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (147, 133, N'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (148, 134, N'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (149, 135, N'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (150, 136, N'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (151, 137, N'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (152, 138, N'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (153, 139, N'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (154, 140, N'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (155, 1, N'https://i.pinimg.com/1200x/99/07/06/99070652cdf58770782e409111155158.jpg', 1, 1);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (156, 1, N'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80', 0, 2);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (157, 1, N'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=800&auto=format&fit=crop&q=80', 0, 3);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (158, 1, N'https://images.unsplash.com/photo-1595855759920-86582396756a?w=800&auto=format&fit=crop&q=80', 0, 4);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (159, 1, N'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=800&auto=format&fit=crop&q=80', 0, 5);
INSERT INTO [dbo].[ProductImages] ([ProductImageId], [ProductId], [ImageUrl], [IsPrimary], [SortOrder]) VALUES (160, 1, N'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80', 0, 6);
SET IDENTITY_INSERT [dbo].[ProductImages] OFF;
GO

-- -------------------------------------------------------------
-- Data for: [dbo].[Products] (140 rows)
-- -------------------------------------------------------------
SET IDENTITY_INSERT [dbo].[Products] ON;
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (1, 1, 1, N'Cà chua bi Đà Lạt', N'Cà chua bi đỏ, vị ngọt nhẹ, thích hợp salad và nấu ăn.', 68000.00, N'kg', N'Active', 1, '2026-08-01 12:00:00.000', NULL, '2026-08-01 10:00:00.000', '2026-08-20 10:00:00.000');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (2, 1, 1, N'Xà lách Lolo xanh', N'Xà lách giòn, tươi, trồng tại vùng cao Đà Lạt.', 45000.00, N'kg', N'Active', 1, '2026-08-01 12:00:00.000', NULL, '2026-08-01 10:10:00.000', '2026-08-20 10:10:00.000');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (3, 1, 1, N'Nấm đùi gà', N'Nấm đùi gà tươi, đóng khay tiện dụng.', 82000.00, N'hộp', N'Active', 1, '2026-08-01 12:00:00.000', NULL, '2026-08-01 10:20:00.000', '2026-08-20 10:20:00.000');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (4, 1, 2, N'Dâu tây Đà Lạt', N'Dâu tây loại 1, thu hoạch mới, phù hợp ăn trực tiếp.', 145000.00, N'hộp', N'Active', 1, '2026-08-01 12:00:00.000', NULL, '2026-08-01 10:30:00.000', '2026-08-20 10:30:00.000');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (5, 2, 1, N'Rau cải xanh', N'Rau cải xanh thu hoạch trong ngày, lá non, ít sâu bệnh.', 32000.00, N'kg', N'Active', 1, '2026-08-01 12:00:00.000', NULL, '2026-08-02 10:00:00.000', '2026-08-20 10:00:00.000');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (6, 2, 1, N'Rau muống sạch', N'Rau muống tươi, nguồn gốc rõ ràng.', 28000.00, N'kg', N'Active', 1, '2026-08-01 12:00:00.000', NULL, '2026-08-02 10:10:00.000', '2026-08-20 10:10:00.000');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (7, 2, 3, N'Ngò rí', N'Ngò rí thơm, phù hợp nấu ăn và trang trí món.', 55000.00, N'kg', N'Active', 1, '2026-08-01 12:00:00.000', NULL, '2026-08-02 10:20:00.000', '2026-08-20 10:20:00.000');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (8, 2, 1, N'Dưa leo hữu cơ', N'Dưa leo giòn, ít hạt, đạt tiêu chuẩn hữu cơ.', 42000.00, N'kg', N'Active', 1, '2026-08-01 12:00:00.000', NULL, '2026-08-02 10:30:00.000', '2026-08-20 10:30:00.000');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (9, 3, 2, N'Cam sành Đồng Nai', N'Cam sành mọng nước, vị ngọt thanh.', 52000.00, N'kg', N'Active', 1, '2026-08-01 12:00:00.000', NULL, '2026-08-03 10:00:00.000', '2026-08-20 10:00:00.000');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (10, 3, 2, N'Thanh long ruột đỏ', N'Thanh long ruột đỏ, ngọt, phù hợp ăn tươi.', 65000.00, N'kg', N'Active', 1, '2026-08-01 12:00:00.000', NULL, '2026-08-03 10:10:00.000', '2026-08-20 10:10:00.000');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (11, 3, 2, N'Xoài cát chu', N'Xoài cát chu thơm, ngọt, đang vào mùa.', 75000.00, N'kg', N'Active', 1, '2026-08-01 12:00:00.000', NULL, '2026-08-03 10:20:00.000', '2026-08-20 10:20:00.000');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (12, 3, 2, N'Ổi nữ hoàng', N'Ổi giòn, vị ngọt nhẹ, phù hợp ăn trực tiếp.', 48000.00, N'kg', N'Active', 1, '2026-08-01 12:00:00.000', NULL, '2026-08-03 10:30:00.000', '2026-08-20 10:30:00.000');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (13, 1, 1, N'Cải thìa hữu cơ Đà Lạt', N'Cải thìa bẹ trắng xanh tươi mát, giòn ngọt, giàu vitamin C và chất xơ, trồng theo tiêu chuẩn hữu cơ.', 35000.00, N'kg', N'VietGAP', 1, '2026-09-10 15:49:13.560', NULL, '2026-09-10 15:49:13.560', '2026-09-10 15:49:13.560');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (14, 1, 1, N'Bắp cải tím Đà Lạt', N'Bắp cải tím giòn ngọt, búp chắc nịch, giàu anthocyanin chống oxy hóa, thích hợp làm salad.', 42000.00, N'bắp', N'USDA', 1, '2026-09-10 15:49:13.563', NULL, '2026-09-10 15:49:13.563', '2026-09-10 15:49:13.563');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (15, 2, 1, N'Cải ngọt VietGAP', N'Cải ngọt thân mập, lá xanh mướt, vị ngọt tự nhiên, rất thích hợp nấu canh thịt bằm hoặc xào tỏi.', 28000.00, N'kg', N'VietGAP', 1, '2026-09-10 15:49:13.563', NULL, '2026-09-10 15:49:13.563', '2026-09-10 15:49:13.563');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (16, 1, 1, N'Cải ngồng Mộc Châu', N'Cải ngồng tươi non hái từ cao nguyên Mộc Châu, ngọn mập mạp xào giòn ngọt đậm đà.', 38000.00, N'kg', N'VietGAP', 1, '2026-09-10 15:49:13.563', NULL, '2026-09-10 15:49:13.563', '2026-09-10 15:49:13.563');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (17, 2, 1, N'Rau dền đỏ Miền Tây', N'Rau dền đỏ lá tía mọng nước, vị ngọt thanh, tính mát, thanh nhiệt giải độc ngày hè.', 25000.00, N'kg', N'VietGAP', 1, '2026-09-10 15:49:13.563', NULL, '2026-09-10 15:49:13.563', '2026-09-10 15:49:13.563');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (18, 2, 1, N'Rau mồng tơi vườn', N'Rau mồng tơi sạch tự nhiên, ngọn mập búp xanh, nấu canh cua đồng thơm ngon nức tiếng.', 24000.00, N'kg', N'VietGAP', 1, '2026-09-10 15:49:13.563', NULL, '2026-09-10 15:49:13.563', '2026-09-10 15:49:13.563');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (19, 1, 1, N'Xà lách Romaine hữu cơ', N'Xà lách Romaine lá dài giòn ngọt, chuyên dùng cho món salad Caesar chuẩn vị Âu.', 52000.00, N'kg', N'USDA', 1, '2026-09-10 15:49:13.563', NULL, '2026-09-10 15:49:13.563', '2026-09-10 15:49:13.563');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (20, 2, 3, N'Rau càng cua tự nhiên', N'Rau càng cua giòn rụm, vị hơi chua thanh dịu, trộn gỏi thịt bò chua ngọt tuyệt hảo.', 48000.00, N'kg', N'VietGAP', 1, '2026-09-10 15:49:13.566', NULL, '2026-09-10 15:49:13.566', '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (21, 1, 1, N'Rau ngót Nhật sạch', N'Rau ngót Nhật mềm mát, giàu đạm thực vật và khoáng chất, an toàn cho bé ăn dặm.', 35000.00, N'kg', N'VietGAP', 1, '2026-09-10 15:49:13.566', NULL, '2026-09-10 15:49:13.566', '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (22, 1, 1, N'Đọt bí non Mộc Châu', N'Đọt bí ngô non tơ, cọng giòn bùi, hoa bí ngọt dịu, xào tỏi hay luộc chấm kho quẹt đều ngon.', 45000.00, N'kg', N'VietGAP', 1, '2026-09-10 15:49:13.566', NULL, '2026-09-10 15:49:13.566', '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (23, 1, 1, N'Bông cải xanh Đà Lạt', N'Bông cải súp lơ xanh búp khít chắc nịch, giàu sulforaphane phòng ngừa ung thư và tim mạch.', 62000.00, N'kg', N'VietGAP', 1, '2026-09-10 15:49:13.566', NULL, '2026-09-10 15:49:13.566', '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (24, 1, 1, N'Củ dền đỏ Đà Lạt', N'Củ dền đỏ mọng nước ruột thẫm, dùng ép nước detox hoặc hầm súp bổ máu.', 42000.00, N'kg', N'VietGAP', 1, '2026-09-10 15:49:13.566', NULL, '2026-09-10 15:49:13.566', '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (25, 2, 1, N'Bí đỏ hồ lô Hưng Yên', N'Bí hồ lô thịt vàng cam sánh mịn, vị bùi dẻo béo ngậy, nấu chè hay hầm canh sườn đều tuyệt.', 32000.00, N'kg', N'VietGAP', 1, '2026-09-10 15:49:13.566', NULL, '2026-09-10 15:49:13.566', '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (26, 2, 1, N'Bầu sao Miền Tây', N'Trái bầu sao thon dài vỏ xanh lốm đốm, ruột non ngọt mát, nấu canh hến hoặc luộc ăn nóng.', 22000.00, N'kg', N'VietGAP', 1, '2026-09-10 15:49:13.566', NULL, '2026-09-10 15:49:13.566', '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (27, 2, 1, N'Mướp hương đồng quê', N'Mướp hương thơm ngát đặc trưng khi nấu chín, vỏ mỏng ruột mềm ngọt, ăn rất thanh.', 28000.00, N'kg', N'VietGAP', 1, '2026-09-10 15:49:13.566', NULL, '2026-09-10 15:49:13.566', '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (28, 1, 1, N'Khổ qua rừng Đắk Lắk', N'Khổ qua rừng trái nhỏ gai nhọn, đắng dịu hậu ngọt sâu, dược tính cao giúp hạ đường huyết.', 58000.00, N'kg', N'USDA', 1, '2026-09-10 15:49:13.566', NULL, '2026-09-10 15:49:13.566', '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (29, 2, 1, N'Đậu bắp baby xanh', N'Đậu bắp trái non không xơ, luộc chấm chao hay nướng mỡ hành giòn sần sật bổ khớp.', 35000.00, N'kg', N'VietGAP', 1, '2026-09-10 15:49:13.566', NULL, '2026-09-10 15:49:13.566', '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (30, 1, 1, N'Su hào Mộc Châu', N'Su hào Mộc Châu củ căng tròn, vị ngọt đậm không xơ, luộc hay xào mực đều giòn ngon.', 32000.00, N'kg', N'VietGAP', 1, '2026-09-10 15:49:13.566', NULL, '2026-09-10 15:49:13.566', '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (31, 1, 1, N'Củ cải trắng hữu cơ', N'Củ cải trắng Đà Lạt củ thon dài mọng nước, vị ngọt thanh mát được ví như nhân sâm mùa đông.', 26000.00, N'kg', N'VietGAP', 1, '2026-09-10 15:49:13.566', NULL, '2026-09-10 15:49:13.566', '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (32, 1, 1, N'Khoai lang mật Đà Lạt', N'Khoai lang mật trồng vùng đất đỏ bazan, khi nướng chảy mật vàng ươm, ngọt lịm thơm phức.', 48000.00, N'kg', N'VietGAP', 1, '2026-09-10 15:49:13.566', NULL, '2026-09-10 15:49:13.566', '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (33, 3, 2, N'Sầu riêng Ri6 Bến Tre', N'Sầu riêng Ri6 cơm vàng hạt lép, múi khô ráo dày cùi, vị béo ngậy đậm đà thơm nức.', 135000.00, N'kg', N'VietGAP', 1, '2026-09-10 15:49:13.566', NULL, '2026-09-10 15:49:13.566', '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (34, 3, 2, N'Bưởi da xanh Ruột Hồng Bến Tre', N'Bưởi da xanh vỏ mỏng mọng nước, múi hồng tép giòn tan không hạt, vị ngọt thanh tao.', 85000.00, N'quả', N'VietGAP', 1, '2026-09-10 15:49:13.566', NULL, '2026-09-10 15:49:13.566', '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (35, 3, 2, N'Măng cụt Lái Thiêu', N'Nữ hoàng trái cây vỏ tím thẫm mỏng, múi trắng muốt ngọt thanh dịu dàng, ăn giải nhiệt cực tốt.', 95000.00, N'kg', N'VietGAP', 1, '2026-09-10 15:49:13.566', NULL, '2026-09-10 15:49:13.566', '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (36, 3, 2, N'Chôm chôm nhãn Tiền Giang', N'Chôm chôm nhãn râu ngắn trái tròn, cơm khô róc hạt, vị ngọt đậm giòn tan cuốn hút.', 48000.00, N'kg', N'VietGAP', 1, '2026-09-10 15:49:13.566', NULL, '2026-09-10 15:49:13.566', '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (37, 1, 2, N'Mận hậu Bắc Hà', N'Mận hậu quả to phủ phấn trắng, vỏ xanh đỏ giòn tan rôm rốp, chấm muối ớt Tây Bắc ngon khó cưỡng.', 75000.00, N'kg', N'VietGAP', 1, '2026-09-10 15:49:13.566', NULL, '2026-09-10 15:49:13.566', '2026-09-10 15:49:13.566');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (38, 3, 2, N'Nhãn xuồng cơm vàng Vũng Tàu', N'Nhãn xuồng vỏ vàng sáng, cùi dày giòn sần sật mọng nước, hương thơm thanh khiết đặc trưng.', 68000.00, N'kg', N'VietGAP', 1, '2026-09-10 15:49:13.570', NULL, '2026-09-10 15:49:13.570', '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (39, 2, 2, N'Đu đủ ruột đỏ tự nhiên', N'Đu đủ giống ruột đỏ tự nhiên, thịt dẻo ngọt lịm không hạt, giàu vitamin A và enzyme tiêu hóa papain.', 28000.00, N'kg', N'VietGAP', 1, '2026-09-10 15:49:13.570', NULL, '2026-09-10 15:49:13.570', '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (40, 1, 2, N'Dưa lưới Taki Nhật Bản', N'Dưa lưới vân nổi sắc nét trồng nhà màng công nghệ cao, ruột cam giòn rụm thơm mùi sữa.', 65000.00, N'kg', N'VietGAP', 1, '2026-09-10 15:49:13.570', NULL, '2026-09-10 15:49:13.570', '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (41, 2, 2, N'Chuối ngự Đại Hoàng', N'Chuối ngự tiến vua quả nhỏ vỏ mỏng vàng ruộm, ruột vàng cam thơm ngát vị ngọt thanh tao.', 45000.00, N'nải', N'VietGAP', 1, '2026-09-10 15:49:13.570', NULL, '2026-09-10 15:49:13.570', '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (42, 1, 2, N'Vải thiều Lục Ngạn', N'Vải thiều chín đỏ cành, gai nhẵn cùi dày hạt nhỏ như hạt đậu, nước ngọt lịm thơm mát.', 78000.00, N'kg', N'VietGAP', 1, '2026-09-10 15:49:13.570', NULL, '2026-09-10 15:49:13.570', '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (43, 1, 2, N'Na dai Đồng Mỏ Chi Lăng', N'Na dai núi đá mắt to phẳng, thịt dai trắng ngần, ít hạt vị ngọt sắc thơm ngát hương rừng.', 85000.00, N'kg', N'VietGAP', 1, '2026-09-10 15:49:13.570', NULL, '2026-09-10 15:49:13.570', '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (44, 3, 2, N'Mít tố nữ Miền Tây', N'Mít tố nữ trái nhỏ múi vàng óng bám dính cùi lõi, hương thơm nồng nàn vị ngọt lịm béo ngậy.', 55000.00, N'kg', N'VietGAP', 1, '2026-09-10 15:49:13.570', NULL, '2026-09-10 15:49:13.570', '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (45, 3, 2, N'Quýt hồng Lai Vung', N'Quýt hồng vỏ màu cam đỏ óng ả, mọng nước tép ngọt thanh ít hạt, đặc sản nức tiếng xứ Đồng Tháp.', 68000.00, N'kg', N'VietGAP', 1, '2026-09-10 15:49:13.570', NULL, '2026-09-10 15:49:13.570', '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (46, 2, 2, N'Chanh không hạt Long An', N'Chanh không hạt vỏ mỏng xanh bóng, siêu nhiều nước thơm gắt, không bị đắng khi vắt.', 35000.00, N'kg', N'VietGAP', 1, '2026-09-10 15:49:13.570', NULL, '2026-09-10 15:49:13.570', '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (47, 3, 2, N'Tắc sành Bến Tre (Quất tươi)', N'Trái tắc sành vỏ tinh dầu thơm lừng, dùng pha nước giải khát thanh nhiệt hoặc ngâm mật ong trị ho.', 32000.00, N'kg', N'VietGAP', 1, '2026-09-10 15:49:13.570', NULL, '2026-09-10 15:49:13.570', '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (48, 1, 2, N'Cam sành Hàm Yên', N'Cam sành Hàm Yên vỏ sần sùi cùi dày tép vàng cam, nước ngọt thanh đậm đà bổ sung năng lượng.', 45000.00, N'kg', N'VietGAP', 1, '2026-09-10 15:49:13.570', NULL, '2026-09-10 15:49:13.570', '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (49, 1, 1, N'Cà chua socola Đà Lạt', N'Cà chua socola màu nâu tím độc đáo, độ ngọt brix cao vượt trội, giòn ngọt như trái cây ăn vặt.', 75000.00, N'hộp', N'USDA', 1, '2026-09-10 15:49:13.570', NULL, '2026-09-10 15:49:13.570', '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (50, 1, 1, N'Cà chua beef hữu cơ', N'Cà chua beef trái to chắc thịt, cùi dày ít hạt, chuyên dùng làm sốt mì Ý hoặc kẹp burger chuẩn vị.', 48000.00, N'kg', N'VietGAP', 1, '2026-09-10 15:49:13.570', NULL, '2026-09-10 15:49:13.570', '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (51, 1, 2, N'Việt quất tươi Đà Lạt', N'Việt quất trái căng mọng phủ lớp phấn tự nhiên, vị chua ngọt hài hòa giàu chất chống oxy hóa bảo vệ mắt.', 160000.00, N'hộp', N'USDA', 1, '2026-09-10 15:49:13.570', NULL, '2026-09-10 15:49:13.570', '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (52, 1, 2, N'Phúc bồn tử đen (Mâm xôi)', N'Phúc bồn tử mâm xôi đen thu hoạch từ nhà kính hữu cơ Đà Lạt, vị thơm quyến rũ bổ dưỡng cho tim mạch.', 155000.00, N'hộp', N'USDA', 1, '2026-09-10 15:49:13.570', NULL, '2026-09-10 15:49:13.570', '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (53, 1, 2, N'Dâu tằm tươi Đà Lạt', N'Dâu tằm chín mọng tím sẫm, vị chua ngọt dịu, dùng ngâm siro nước mát hoặc làm rượu dâu tuyệt ngon.', 62000.00, N'kg', N'VietGAP', 1, '2026-09-10 15:49:13.570', NULL, '2026-09-10 15:49:13.570', '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (54, 3, 2, N'Nho xanh Ninh Thuận', N'Nho xanh NH01-48 chùm khít trái bầu dục, thịt giòn rụm vị ngọt thanh pha chua nhẹ tự nhiên.', 85000.00, N'kg', N'VietGAP', 1, '2026-09-10 15:49:13.570', NULL, '2026-09-10 15:49:13.570', '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (55, 1, 1, N'Nấm mối đen hữu cơ', N'Nấm mối đen thân chắc giòn sần sật, vị ngọt đậm như thịt gà, giàu hoạt chất sinh học bồi bổ sức khỏe.', 125000.00, N'hộp', N'USDA', 1, '2026-09-10 15:49:13.570', NULL, '2026-09-10 15:49:13.570', '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (56, 1, 1, N'Nấm hoàng kim tươi', N'Nấm hoàng kim màu vàng tươi rực rỡ, thịt nấm mềm dai thơm mùi hạt điều bùi bùi.', 55000.00, N'hộp', N'VietGAP', 1, '2026-09-10 15:49:13.570', NULL, '2026-09-10 15:49:13.570', '2026-09-10 15:49:13.570');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (57, 1, 1, N'Nấm kim châm sạch', N'Nấm kim châm sợi dài trắng muốt, giòn ngọt thanh tao, chuyên dùng cho các món lẩu và nướng cuộn thịt bò.', 28000.00, N'gói', N'VietGAP', 1, '2026-09-10 15:49:13.573', NULL, '2026-09-10 15:49:13.573', '2026-09-10 15:49:13.573');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (58, 1, 1, N'Nấm hương tươi Sapa', N'Nấm hương tươi nuôi trồng trên thân gỗ tự nhiên xứ lạnh, mũ dày thơm nức mũi khi nấu canh xào.', 92000.00, N'hộp', N'VietGAP', 1, '2026-09-10 15:49:13.573', NULL, '2026-09-10 15:49:13.573', '2026-09-10 15:49:13.573');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (59, 2, 3, N'Hành lá tươi gốc to', N'Hành lá gốc trắng nõn nà, thân xanh mỡ màng thơm cay nồng ấm, gia vị không thể thiếu trong mọi gian bếp.', 35000.00, N'kg', N'VietGAP', 1, '2026-09-10 15:49:13.573', NULL, '2026-09-10 15:49:13.573', '2026-09-10 15:49:13.573');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (60, 2, 3, N'Húng quế thơm hữu cơ', N'Húng quế lá xanh rì tinh dầu thơm nồng đậm đà, ăn kèm phở, bún bò hay các món nướng cực kỳ dậy vị.', 38000.00, N'kg', N'VietGAP', 1, '2026-09-10 15:49:13.573', NULL, '2026-09-10 15:49:13.573', '2026-09-10 15:49:13.573');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (61, 1, 3, N'Gừng sẻ đồi Tây Bắc', N'Gừng sẻ củ nhỏ cay nồng thơm ấm, thịt vàng ươm nhiều tinh dầu, giải cảm ấm tỳ vị rất tốt.', 65000.00, N'kg', N'VietGAP', 1, '2026-09-10 15:49:13.573', NULL, '2026-09-10 15:49:13.573', '2026-09-10 15:49:13.573');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (62, 2, 3, N'Sả chanh củ tươi', N'Sả chanh củ mập mạp gốc tím nhạt, hương thơm tinh dầu the mát sảng khoái, gia vị ướp kho xào tuyệt đỉnh.', 26000.00, N'kg', N'VietGAP', 1, '2026-09-10 15:49:13.573', NULL, '2026-09-10 15:49:13.573', '2026-09-10 15:49:13.573');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (63, 3, 4, N'Hạt điều rang muối Bình Phước', N'Hạt điều loại 1 hạt mẩy căng tròn, rang củi thủ công giữ trọn vị giòn rụm béo ngậy đậm đà.', 240000.00, N'hộp', N'VietGAP', 1, '2026-09-10 15:52:42.753', NULL, '2026-09-10 15:52:42.753', '2026-09-10 15:52:42.753');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (64, 2, 4, N'Hạt sen tươi sấy giòn Đồng Tháp', N'Hạt sen tươi hồ Tháp Mười sấy thăng hoa giòn tan, vị bùi béo tự nhiên, bổ tâm an thần ngủ ngon.', 180000.00, N'hộp', N'VietGAP', 1, '2026-09-10 15:52:42.760', NULL, '2026-09-10 15:52:42.760', '2026-09-10 15:52:42.760');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (65, 1, 4, N'Hạt macca nứt vỏ Lâm Đồng', N'Nữ hoàng hạt dinh dưỡng vỏ nứt tự nhiên dễ bóc, nhân trắng ngần ngọt thanh béo bùi giàu Omega-3.', 195000.00, N'hộp', N'USDA', 1, '2026-09-10 15:52:42.760', NULL, '2026-09-10 15:52:42.760', '2026-09-10 15:52:42.760');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (66, 2, 4, N'Đậu phộng sẻ Củ Chi', N'Đậu phộng giống sẻ hạt nhỏ chắc mẩy nhiều dầu, vị thơm bùi đặc trưng, dùng nấu chè hay rang muối.', 45000.00, N'kg', N'VietGAP', 1, '2026-09-10 15:52:42.760', NULL, '2026-09-10 15:52:42.760', '2026-09-10 15:52:42.760');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (67, 1, 4, N'Đậu xanh hạt tiêu sẻ Tây Bắc', N'Đậu xanh hạt tiêu lòng xanh đậm hạt nhỏ thơm, nấu chè giải nhiệt hoặc làm giá đỗ ngọt giòn.', 55000.00, N'kg', N'VietGAP', 1, '2026-09-10 15:52:42.760', NULL, '2026-09-10 15:52:42.760', '2026-09-10 15:52:42.760');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (68, 1, 4, N'Đậu đen xanh lòng Tây Bắc', N'Đậu đen xanh lòng hạt đều tăm tắp mẩy chắc, giàu anthocyanin giúp thanh lọc cơ thể và bổ thận.', 60000.00, N'kg', N'VietGAP', 1, '2026-09-10 15:52:42.760', NULL, '2026-09-10 15:52:42.760', '2026-09-10 15:52:42.760');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (69, 2, 4, N'Hạt mè vàng tự nhiên (Vừng)', N'Mè vàng giống bản địa thơm nức mũi khi rang chín, cung cấp canxi và chất béo thực vật quý giá.', 70000.00, N'kg', N'VietGAP', 1, '2026-09-10 15:52:42.760', NULL, '2026-09-10 15:52:42.760', '2026-09-10 15:52:42.760');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (70, 1, 4, N'Hạt chia hữu cơ tự nhiên', N'Hạt chia giàu chất xơ hòa tan và Omega-3, hỗ trợ giảm cân kiểm soát đường huyết và làm đẹp da.', 120000.00, N'gói', N'USDA', 1, '2026-09-10 15:52:42.760', NULL, '2026-09-10 15:52:42.760', '2026-09-10 15:52:42.760');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (71, 2, 1, N'Rau dền xanh non', N'Rau dền xanh ngọt thanh mát, giàu canxi và sắt, nấu canh tôm hoặc xào tỏi thơm bùi.', 22000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.703', NULL, '2026-09-10 16:05:55.703', '2026-09-10 16:05:55.703');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (72, 1, 1, N'Cải cúc (Tần ô) Đà Lạt', N'Cải cúc thân mềm lá mỡ, hương thơm nồng nàn đặc trưng, nhúng lẩu hoặc nấu canh thịt bò tuyệt đỉnh.', 35000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.710', NULL, '2026-09-10 16:05:55.710', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (73, 1, 1, N'Xà lách Carol Đà Lạt', N'Xà lách Carol lá xoăn giòn ngọt, vị đắng nhẹ tinh tế, chuyên dùng cho các món salad dầu giấm.', 45000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.710', NULL, '2026-09-10 16:05:55.710', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (74, 1, 1, N'Xà lách mỡ (Butterhead)', N'Xà lách búp mỡ lá mềm mịn như bơ, vị ngọt dịu thanh mát, thích hợp cuốn thịt nướng.', 48000.00, N'kg', N'USDA', 1, '2026-09-10 16:05:55.710', NULL, '2026-09-10 16:05:55.710', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (75, 1, 1, N'Bắp cải trắng Đà Lạt', N'Bắp cải trắng cuộn chặt tròn đều, lá dày giòn ngọt đậm, luộc chấm trứng dầm nước mắm cực ngon.', 26000.00, N'bắp', N'VietGAP', 1, '2026-09-10 16:05:55.710', NULL, '2026-09-10 16:05:55.710', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (76, 1, 1, N'Cải thảo Đà Lạt', N'Cải thảo bẹ trắng lá vàng nhạt, ngọt mát giòn bọng nước, nguyên liệu số một để làm kim chi và nấu canh sườn.', 32000.00, N'bắp', N'VietGAP', 1, '2026-09-10 16:05:55.710', NULL, '2026-09-10 16:05:55.710', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (77, 2, 1, N'Cà chua thường quê', N'Cà chua chín mọng đỏ tự nhiên trên cành, nhiều bột chua ngọt hài hòa, nấu canh xào rất dậy vị.', 28000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.710', NULL, '2026-09-10 16:05:55.710', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (78, 2, 1, N'Bí xanh (Bí đao chanh)', N'Bí đao chanh vỏ xanh đậm phấn trắng, ruột đặc ít hạt, nấu canh sườn hoặc ép nước giảm cân thanh nhiệt.', 22000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.710', NULL, '2026-09-10 16:05:55.710', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (79, 2, 1, N'Khổ qua (Mướp đắng) trái to', N'Khổ qua xanh trái to gai thoai thoải, thịt dày vị đắng thanh dịu, thích hợp dồn thịt hầm canh.', 32000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.710', NULL, '2026-09-10 16:05:55.710', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (80, 1, 1, N'Cà tím dài Đà Lạt', N'Cà tím vỏ tím bóng mượt ruột mềm ngọt, nướng mỡ hành hay kho tiêu đậm đà đưa cơm.', 28000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.710', NULL, '2026-09-10 16:05:55.710', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (81, 1, 1, N'Ớt chuông Đà Lạt (Đỏ/Vàng)', N'Ớt chuông nhà màng giòn tan ngọt bọng nước, không hăng cay, giàu vitamin A và C số 1.', 65000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.710', NULL, '2026-09-10 16:05:55.710', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (82, 1, 1, N'Khoai tây hồng Đà Lạt', N'Khoai tây giống hồng vỏ mỏng thịt vàng ươm, dẻo bùi thơm nức, nấu súp hay chiên đều tuyệt.', 42000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.710', NULL, '2026-09-10 16:05:55.710', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (83, 1, 1, N'Cà rốt tươi Đà Lạt', N'Cà rốt tươi còn cuống lá xanh, củ thon đỏ cam au mọng nước, vị ngọt tự nhiên xào luộc đều giòn.', 32000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.710', NULL, '2026-09-10 16:05:55.710', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (84, 1, 1, N'Khoai lang tím Nhật', N'Khoai lang ruột tím thẫm đậm đà, thơm dẻo bùi ngậy, chứa hàm lượng anthocyanin chống lão hóa cao.', 38000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.710', NULL, '2026-09-10 16:05:55.710', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (85, 2, 1, N'Củ sắn (Củ đậu) ngọt mát', N'Củ đậu vỏ mỏng mọng nước ngọt thanh, ăn sống giải nhiệt mùa hè hoặc xào mực giòn rụm.', 18000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.710', NULL, '2026-09-10 16:05:55.710', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (86, 2, 1, N'Khoai môn sáp ruột tím', N'Khoai môn sáp dẻo quánh bùi béo, thơm ngậy khi hầm canh xương hoặc nấu chè tráng miệng.', 52000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.710', NULL, '2026-09-10 16:05:55.710', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (87, 1, 1, N'Khoai sọ nếp Tây Bắc', N'Khoai sọ nếp củ tròn nhỏ, nấu chín dẻo dính thơm bùi, món ngon truyền thống nấu canh cua rau rút.', 45000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.710', NULL, '2026-09-10 16:05:55.710', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (88, 1, 1, N'Hành tây Đà Lạt', N'Hành tây củ tròn vỏ vàng nhạt, cay nhẹ ngọt hậu, xào thịt bò giòn rụm hoặc trộn gỏi không hăng.', 30000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.710', NULL, '2026-09-10 16:05:55.710', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (89, 2, 1, N'Nấm rơm tươi quê', N'Nấm rơm búp tròn đen xám hái từ rơm lúa mới, vị ngọt giòn thanh đượm hương đồng gió nội.', 95000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.710', NULL, '2026-09-10 16:05:55.710', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (90, 1, 1, N'Nấm bào ngư xám (Nấm sò)', N'Nấm bào ngư xám tai to dai ngọt, giàu dinh dưỡng, nhúng lẩu hoặc xào sả ớt cực kỳ thơm.', 45000.00, N'hộp', N'VietGAP', 1, '2026-09-10 16:05:55.710', NULL, '2026-09-10 16:05:55.710', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (91, 1, 1, N'Súp lơ trắng (Bông cải trắng)', N'Súp lơ trắng búp khít trắng tinh, vị ngọt dịu giòn ngọt, giàu khoáng chất tốt cho hệ tiêu hóa.', 55000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.710', NULL, '2026-09-10 16:05:55.710', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (92, 2, 1, N'Bắp non (Ngô bao tử)', N'Bắp non búp tơ giòn sần sật ngọt lành, thích hợp xào thập cẩm hoặc nấu súp khai vị.', 42000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.710', NULL, '2026-09-10 16:05:55.710', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (93, 2, 3, N'Ngò gai (Mùi tàu) tươi', N'Ngò gai lá xanh răng cưa thơm nồng đậm đà, gia vị chuẩn không thể thiếu cho món canh chua và phở.', 30000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.710', NULL, '2026-09-10 16:05:55.710', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (94, 2, 3, N'Húng lủi (Húng nhủi) sạch', N'Húng lủi lá nhỏ tinh dầu the mát sảng khoái, ăn kèm thịt luộc, gỏi cuốn hoặc pha cocktail giải nhiệt.', 35000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.710', NULL, '2026-09-10 16:05:55.710', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (95, 1, 3, N'Rau kinh giới thơm', N'Kinh giới lá xanh thơm cay nồng ấm, tính ấm giải cảm, ăn kèm bún đậu mắm tôm ngon đúng điệu.', 32000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.710', NULL, '2026-09-10 16:05:55.710', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (96, 1, 3, N'Tía tô xanh đỏ hữu cơ', N'Tía tô hai mặt tía xanh thơm ngát nhiều tinh dầu, dược liệu quý giải độc thanh lọc cơ thể.', 35000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.710', NULL, '2026-09-10 16:05:55.710', '2026-09-10 16:05:55.710');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (97, 2, 3, N'Rau diếp cá mát lành', N'Diếp cá lá hình tim mọng nước, tính mát thanh nhiệt tiêu đờm, ăn kèm bánh xèo chả cá trứ danh.', 28000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.713', NULL, '2026-09-10 16:05:55.713', '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (98, 1, 3, N'Thì là thơm Tây Bắc', N'Thì là lá kim nhỏ thơm dịu thảo mộc, linh hồn của món chả cá Lã Vọng và canh riêu cá nấu chua.', 40000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.713', NULL, '2026-09-10 16:05:55.713', '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (99, 2, 3, N'Ớt hiểm chỉ thiên cay nồng', N'Ớt chỉ thiên trái nhỏ đỏ au cay xé lưỡi thơm gắt, gia vị kích thích vị giác trong từng bữa ăn.', 60000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.713', NULL, '2026-09-10 16:05:55.713', '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (100, 2, 3, N'Ớt sừng đỏ tươi', N'Ớt sừng trái to đỏ bóng vỏ dày, cay dịu thoang thoảng, dùng tỉa hoa trang trí hoặc kho cá bắt mắt.', 45000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.713', NULL, '2026-09-10 16:05:55.713', '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (101, 1, 3, N'Tỏi cô đơn Lý Sơn', N'Tỏi một tép đảo Lý Sơn thơm nồng dịu, không hăng cay gắt, dược tính cao ngâm mật ong bồi bổ.', 180000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.713', NULL, '2026-09-10 16:05:55.713', '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (102, 2, 3, N'Nghệ vàng tươi Hưng Yên', N'Nghệ vàng củ chắc thịt vàng sẫm đậm curcumin, kháng viêm làm lành vết thương và tạo màu tự nhiên.', 42000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.713', NULL, '2026-09-10 16:05:55.713', '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (103, 2, 2, N'Chuối già Nam Mỹ (Chuối tiêu)', N'Chuối già quả thon dài vỏ vàng ươm, ruột thơm ngậy dẻo bùi, cung cấp năng lượng và kali dồi dào.', 28000.00, N'nải', N'VietGAP', 1, '2026-09-10 16:05:55.713', NULL, '2026-09-10 16:05:55.713', '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (104, 2, 2, N'Chuối sứ (Chuối xiêm) Bến Tre', N'Chuối sứ quả mập tròn ngọt sắc thơm đậm, dùng ăn tươi, nướng mỡ hành hoặc nấu chè chuối.', 30000.00, N'nải', N'VietGAP', 1, '2026-09-10 16:05:55.713', NULL, '2026-09-10 16:05:55.713', '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (105, 2, 2, N'Dưa hấu không hạt Mặt Trời Đỏ', N'Dưa hấu ruột đỏ au giòn ngọt mọng nước, không hạt tiện lợi, giải khát tức thì ngày hè nắng nóng.', 25000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.713', NULL, '2026-09-10 16:05:55.713', '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (106, 2, 2, N'Ổi lê ruột trắng giòn ngọt', N'Ổi lê trái thuôn dài vỏ xanh mướt, ruột trắng xốp giòn ngọt thanh tao, chấm muối ớt tuyệt ngon.', 32000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.713', NULL, '2026-09-10 16:05:55.713', '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (107, 3, 2, N'Thanh long ruột trắng Bình Thuận', N'Thanh long ruột trắng tai xanh giòn ngọt thanh mát, vị chua nhẹ tự nhiên hỗ trợ tiêu hóa.', 38000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.713', NULL, '2026-09-10 16:05:55.713', '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (108, 2, 2, N'Bưởi Năm Roi Vĩnh Long', N'Bưởi Năm Roi tép vàng róc vỏ mọng nước, vị chua ngọt thanh dịu đặc trưng không hạt.', 65000.00, N'quả', N'VietGAP', 1, '2026-09-10 16:05:55.713', NULL, '2026-09-10 16:05:55.713', '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (109, 1, 2, N'Táo mèo Tây Bắc (Sơn tra)', N'Táo mèo rừng thơm phức vị chua chát ngọt hậu, dùng ngâm rượu quý hoặc ngâm mật ong thanh lọc.', 55000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.713', NULL, '2026-09-10 16:05:55.713', '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (110, 3, 2, N'Xoài cát Hòa Lộc Tiền Giang', N'Đệ nhất xoài Nam Bộ quả thuôn mình đầy, thịt vàng ươm dẻo quánh, vị ngọt lịm thơm ngát.', 110000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.713', NULL, '2026-09-10 16:05:55.713', '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (111, 3, 2, N'Xoài keo vàng giòn', N'Xoài keo Campuchia trồng tại Miền Tây, thịt vàng giòn sần sật chua ngọt vừa vặn ăn sống chấm mắm ruốc.', 35000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.713', NULL, '2026-09-10 16:05:55.713', '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (112, 2, 2, N'Cóc non bao tử', N'Cóc bao tử quả nhỏ không hạt, giòn rụm chua thanh rôm rốp, món ăn vặt khoái khẩu chấm muối tôm.', 35000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.713', NULL, '2026-09-10 16:05:55.713', '2026-09-10 16:05:55.713');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (113, 2, 2, N'Thơm (Dứa) mật Cầu Đúc', N'Thơm mật Cầu Đúc quả to mắt phẳng, thịt vàng đậm mật ứa ngọt lịm không rát lưỡi.', 32000.00, N'quả', N'VietGAP', 1, '2026-09-10 16:05:55.716', NULL, '2026-09-10 16:05:55.716', '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (114, 3, 2, N'Sầu riêng Monthong (Dona)', N'Sầu riêng Monthong quả to gai thưa, cơm vàng nhạt hạt dẹt, vị ngọt béo thanh nhẹ dễ ăn.', 145000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.716', NULL, '2026-09-10 16:05:55.716', '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (115, 3, 2, N'Chôm chôm Thái Chợ Lách', N'Chôm chôm Thái trái bầu dục râu dài xanh, cùi dày giòn tróc hạt vị ngọt thanh mát rượi.', 58000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.716', NULL, '2026-09-10 16:05:55.716', '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (116, 1, 2, N'Nhãn lồng Hưng Yên tiến vua', N'Nhãn lồng cùi dày ráo nước trắng ngần như ngọc bích, thơm ngát mùi hoa cúc vị ngọt thanh khiết.', 85000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.716', NULL, '2026-09-10 16:05:55.716', '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (117, 3, 2, N'Vú sữa Lò Rèn Vĩnh Kim', N'Vú sữa Lò Rèn vỏ mỏng bóng sáng, dòng sữa trắng ngọt lịm ngát hương thơm dịu mát.', 75000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.716', NULL, '2026-09-10 16:05:55.716', '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (118, 3, 2, N'Mít Thái siêu sớm múi giòn', N'Mít Thái múi vàng óng dày cùi, giòn sần sật ngọt đậm thơm nức mũi, xơ mít cũng ngọt lịm.', 45000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.716', NULL, '2026-09-10 16:05:55.716', '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (119, 1, 2, N'Bơ sáp Đắk Lắk', N'Bơ sáp tròn đầy thịt vàng dẻo quánh béo ngậy như phô mai, xay sinh tố bổ dưỡng ngày hè.', 55000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.716', NULL, '2026-09-10 16:05:55.716', '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (120, 1, 2, N'Bơ 034 Lâm Đồng', N'Bơ 034 quả thon dài hạt lép kẹp, cơm dày dẻo thơm béo đậm đà, đặc sản số một xứ ngàn hoa.', 68000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.716', NULL, '2026-09-10 16:05:55.716', '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (121, 1, 2, N'Hồng giòn Fuyu Đà Lạt', N'Hồng giòn Fuyu giống Nhật Bản hái chín cây không cần giấm, thịt vàng giòn rụm ngọt lịm không chát.', 65000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.716', NULL, '2026-09-10 16:05:55.716', '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (122, 1, 4, N'Đậu xanh cà bóc vỏ', N'Đậu xanh bóc sạch vỏ hạt vàng tươi mẩy đều, nấu chè bà ba hoặc xôi vò mềm thơm bùi béo.', 65000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.716', NULL, '2026-09-10 16:05:55.716', '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (123, 1, 4, N'Đậu đỏ hạt nhỏ Đà Lạt', N'Đậu đỏ hạt nhỏ vùng cao giàu sắt và chất xơ, món ngon truyền thống nấu chè đậu đỏ cầu duyên.', 68000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.716', NULL, '2026-09-10 16:05:55.716', '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (124, 1, 4, N'Đậu nành thuần chủng không GMO', N'Đậu nành giống bản địa Tây Bắc hạt mẩy tròn nhiều đạm, làm sữa đậu nành hoặc đậu hũ béo ngậy.', 45000.00, N'kg', N'USDA', 1, '2026-09-10 16:05:55.716', NULL, '2026-09-10 16:05:55.716', '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (125, 1, 4, N'Đậu trắng hạt to vùng cao', N'Đậu trắng hạt to mẩy căng mọng, nấu chè đậu trắng nước cốt dừa dẻo thơm nức tiếng.', 58000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.716', NULL, '2026-09-10 16:05:55.716', '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (126, 3, 4, N'Hạt điều nhân trắng sấy khô', N'Hạt điều nhân trắng nguyên hạt loại W240 xuất khẩu, vị béo ngọt thanh thuần khiết không gia vị.', 260000.00, N'hộp', N'VietGAP', 1, '2026-09-10 16:05:55.716', NULL, '2026-09-10 16:05:55.716', '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (127, 2, 4, N'Hạt sen khô Huế tiến vua', N'Hạt sen khô giống sen ngự hồ Tịnh Tâm hạt nhỏ trắng ngà, ninh nhanh nhừ thơm bùi béo ngậy.', 220000.00, N'gói', N'VietGAP', 1, '2026-09-10 16:05:55.716', NULL, '2026-09-10 16:05:55.716', '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (128, 1, 4, N'Hạt dẻ Trùng Khánh Cao Bằng', N'Hạt dẻ rừng Trùng Khánh vỏ nâu bóng, nướng thơm nức mũi ruột vàng ươm ngọt bùi béo bở.', 120000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.716', NULL, '2026-09-10 16:05:55.716', '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (129, 2, 4, N'Mè đen (Vừng đen) nguyên vỏ', N'Mè đen hạt chắc mẩy giàu canxi và vitamin E, bồi bổ sức khỏe dưỡng tóc đen mượt.', 85000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.716', NULL, '2026-09-10 16:05:55.716', '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (130, 2, 10, N'Gạo ST25 Sóc Trăng', N'Gạo ST25 chuẩn thương hiệu ông Cua, hạt thon dài trắng trong, cơm dẻo mềm thơm mùi lá dứa tự nhiên.', 38000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:05:55.716', NULL, '2026-09-10 16:05:55.716', '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (131, 1, 10, N'Gạo lứt đỏ Điện Biên hữu cơ', N'Gạo lứt đỏ nương Điện Biên giàu chất xơ và vitamin nhóm B, hỗ trợ ăn kiêng tiểu đường dưỡng sinh.', 45000.00, N'kg', N'USDA', 1, '2026-09-10 16:05:55.716', NULL, '2026-09-10 16:05:55.716', '2026-09-10 16:05:55.716');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (132, 1, 4, N'Ngô nếp (Bắp nếp) dẻo ngọt', N'Ngô nếp bản địa bắp chắc nịch hạt căng bóng, luộc dẻo quánh ngọt lịm thơm mùi ngô đồng quê.', 25000.00, N'bắp', N'VietGAP', 1, '2026-09-10 16:05:55.720', NULL, '2026-09-10 16:05:55.720', '2026-09-10 16:05:55.720');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (133, 2, 4, N'Ngô ngọt (Bắp Mỹ) giòn thơm', N'Bắp ngọt hạt vàng tươi giòn bọng nước ngọt lịm, dùng luộc ăn vặt nấu canh sườn hay làm sữa bắp.', 28000.00, N'bắp', N'VietGAP', 1, '2026-09-10 16:05:55.720', NULL, '2026-09-10 16:05:55.720', '2026-09-10 16:05:55.720');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (134, 1, 4, N'Yến mạch nguyên hạt cán dẹt', N'Yến mạch nguyên cám giàu beta-glucan tốt cho tim mạch và tiêu hóa, bữa sáng lành mạnh hoàn hảo.', 85000.00, N'gói', N'USDA', 1, '2026-09-10 16:05:55.720', NULL, '2026-09-10 16:05:55.720', '2026-09-10 16:05:55.720');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (135, 2, 10, N'Gạo Nàng Thơm Chợ Đào', N'Gạo Nàng Thơm Chợ Đào nức tiếng Long An, hạt thon dài bóng bẩy, khi nấu tỏa hương thơm ngát tự nhiên, cơm dẻo mềm ngọt vị.', 42000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:10:39.693', NULL, '2026-09-10 16:10:39.693', '2026-09-10 16:10:39.693');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (136, 1, 10, N'Gạo Séng Cù Mường Khương', N'Gạo Séng Cù vùng cao Tây Bắc hạt mẩy đều trắng trong, cơm dẻo đậm đà thơm bùi đặc trưng của thổ nhưỡng núi rừng.', 48000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:10:39.700', NULL, '2026-09-10 16:10:39.700', '2026-09-10 16:10:39.700');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (137, 2, 10, N'Gạo lứt tím than Sóc Trăng', N'Gạo lứt tím than giàu anthocyanin và chất xơ hòa tan, vị bùi dẻo dễ ăn, thực phẩm vàng cho người ăn thực dưỡng.', 46000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:10:39.700', NULL, '2026-09-10 16:10:39.700', '2026-09-10 16:10:39.700');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (138, 1, 10, N'Gạo nếp cái hoa vàng Kinh Môn', N'Gạo nếp cái hoa vàng hạt tròn mẩy bóng bẩy, đồ xôi thơm lừng cả gian bếp, xôi dẻo quánh bùi béo để lâu không bị cứng.', 52000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:10:39.703', NULL, '2026-09-10 16:10:39.703', '2026-09-10 16:10:39.703');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (139, 1, 10, N'Gạo nếp nương Điện Biên', N'Nếp nương Điện Biên hạt to tròn mẩy bóng như hạt ngọc, xôi nếp nương dẻo ngọt thơm lừng hương vị núi rừng Tây Bắc.', 55000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:10:39.703', NULL, '2026-09-10 16:10:39.703', '2026-09-10 16:10:39.703');
INSERT INTO [dbo].[Products] ([ProductId], [SupplierId], [CategoryId], [ProductName], [Description], [Price], [Unit], [Status], [ApprovedBy], [ApprovedAt], [RejectReason], [CreatedAt], [UpdatedAt]) VALUES (140, 2, 10, N'Gạo tấm thơm Sa Giang', N'Gạo tấm thơm từ hạt gạo gãy tự nhiên giàu phôi mầm, dẻo mềm đậm vị, chuyên dùng nấu món cơm tấm sườn bì chả.', 30000.00, N'kg', N'VietGAP', 1, '2026-09-10 16:10:39.703', NULL, '2026-09-10 16:10:39.703', '2026-09-10 16:10:39.703');
SET IDENTITY_INSERT [dbo].[Products] OFF;
GO

-- -------------------------------------------------------------
-- Data for: [dbo].[ProductSeasons] (140 rows)
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
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (63, 13, N'Đà Lạt', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (64, 14, N'Đà Lạt', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (65, 15, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (66, 16, N'Mộc Châu', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (67, 17, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (68, 18, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (69, 19, N'Đà Lạt', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (70, 20, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (71, 21, N'Đà Lạt', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (72, 22, N'Mộc Châu', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (73, 23, N'Đà Lạt', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (74, 24, N'Đà Lạt', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (75, 25, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (76, 26, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (77, 27, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (78, 28, N'Đà Lạt', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (79, 29, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (80, 30, N'Mộc Châu', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (81, 31, N'Đà Lạt', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (82, 32, N'Đà Lạt', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (83, 33, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (84, 34, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (85, 35, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (86, 36, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (87, 37, N'Mộc Châu', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (88, 38, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (89, 39, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (90, 40, N'Đà Lạt', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (91, 41, N'Mộc Châu', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (92, 42, N'Mộc Châu', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (93, 43, N'Mộc Châu', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (94, 44, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (95, 45, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (96, 46, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (97, 47, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (98, 48, N'Mộc Châu', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (99, 49, N'Đà Lạt', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (100, 50, N'Đà Lạt', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (101, 51, N'Đà Lạt', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (102, 52, N'Đà Lạt', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (103, 53, N'Đà Lạt', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (104, 54, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (105, 55, N'Đà Lạt', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (106, 56, N'Đà Lạt', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (107, 57, N'Đà Lạt', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (108, 58, N'Mộc Châu', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (109, 59, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (110, 60, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (111, 61, N'Mộc Châu', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (112, 62, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (113, 63, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (114, 64, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (115, 65, N'Đà Lạt', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (116, 66, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (117, 67, N'Mộc Châu', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (118, 68, N'Mộc Châu', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (119, 69, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (120, 70, N'Đà Lạt', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (121, 71, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (122, 72, N'Đà Lạt', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (123, 73, N'Đà Lạt', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (124, 74, N'Đà Lạt', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (125, 75, N'Đà Lạt', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (126, 76, N'Đà Lạt', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (127, 77, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (128, 78, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (129, 79, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (130, 80, N'Đà Lạt', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (131, 81, N'Đà Lạt', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (132, 82, N'Đà Lạt', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (133, 83, N'Đà Lạt', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (134, 84, N'Đà Lạt', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (135, 85, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (136, 86, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (137, 87, N'Mộc Châu', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (138, 88, N'Đà Lạt', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (139, 89, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (140, 90, N'Đà Lạt', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (141, 91, N'Đà Lạt', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (142, 92, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (143, 93, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (144, 94, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (145, 95, N'Mộc Châu', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (146, 96, N'Mộc Châu', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (147, 97, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (148, 98, N'Mộc Châu', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (149, 99, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (150, 100, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (151, 101, N'Đà Lạt', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (152, 102, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (153, 103, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (154, 104, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (155, 105, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (156, 106, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (157, 107, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (158, 108, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (159, 109, N'Mộc Châu', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (160, 110, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (161, 111, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (162, 112, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (163, 113, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (164, 114, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (165, 115, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (166, 116, N'Mộc Châu', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (167, 117, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (168, 118, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (169, 119, N'Đà Lạt', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (170, 120, N'Đà Lạt', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (171, 121, N'Đà Lạt', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (172, 122, N'Mộc Châu', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (173, 123, N'Đà Lạt', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (174, 124, N'Mộc Châu', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (175, 125, N'Đà Lạt', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (176, 126, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (177, 127, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (178, 128, N'Mộc Châu', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (179, 129, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (180, 130, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (181, 131, N'Mộc Châu', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (182, 132, N'Mộc Châu', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (183, 133, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (184, 134, N'Đà Lạt', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (185, 135, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (186, 136, N'Mộc Châu', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (187, 137, N'Đồng Tháp', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (188, 138, N'Mộc Châu', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (189, 139, N'Mộc Châu', 1, 12);
INSERT INTO [dbo].[ProductSeasons] ([ProductSeasonId], [ProductId], [Region], [StartMonth], [EndMonth]) VALUES (190, 140, N'Đồng Tháp', 1, 12);
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

-- ==============================================================================
-- 3. KÍCH HOẠT LẠI RÀNG BUỘC KHÓA NGOẠI & TẠO TRIGGER NGHIỆP VỤ
-- ==============================================================================
EXEC sp_MSforeachtable 'ALTER TABLE ? WITH CHECK CHECK CONSTRAINT all';
GO


-- =============================================================================
-- DATABASE TRIGGERS (RÀNG BUỘC LOGIC NGHIỆP VỤ)
-- =============================================================================
IF OBJECT_ID('[dbo].[trg_CheckBatchSupplier]', 'TR') IS NOT NULL
    DROP TRIGGER [dbo].[trg_CheckBatchSupplier];
GO

CREATE TRIGGER [dbo].[trg_CheckBatchSupplier]
ON [dbo].[Batches]
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
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
GO

