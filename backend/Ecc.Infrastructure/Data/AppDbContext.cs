using Microsoft.EntityFrameworkCore;
using Ecc.Infrastructure.Entities;

namespace Ecc.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<ProductBatch> ProductBatches => Set<ProductBatch>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Address> Addresses => Set<Address>();
    public DbSet<MembershipTier> MembershipTiers => Set<MembershipTier>();
    public DbSet<UserLoyalty> UserLoyalties => Set<UserLoyalty>();
    public DbSet<PointTransaction> PointTransactions => Set<PointTransaction>();
    public DbSet<UserVoucher> UserVouchers => Set<UserVoucher>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<ReviewImage> ReviewImages => Set<ReviewImage>();
    public DbSet<ReviewHelpfulVote> ReviewHelpfulVotes => Set<ReviewHelpfulVote>();
    public DbSet<UserBehavior> UserBehaviors => Set<UserBehavior>();
    public DbSet<RecommendationLog> RecommendationLogs => Set<RecommendationLog>();
    public DbSet<ProductSeason> ProductSeasons => Set<ProductSeason>();
    public DbSet<Farm> Farms => Set<Farm>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── User ──────────────────────────────────────
        modelBuilder.Entity<User>(e =>
        {
            e.ToTable("Users");
            e.HasKey(u => u.UserId);
            e.Property(u => u.UserId).HasColumnName("UserId");
            e.Property(u => u.FullName).HasColumnName("FullName").HasMaxLength(100).IsRequired();
            e.Property(u => u.Email).HasColumnName("Email").HasMaxLength(100).IsRequired();
            e.Property(u => u.Phone).HasColumnName("Phone").HasMaxLength(20);
            e.Property(u => u.PasswordHash).HasColumnName("PasswordHash").HasMaxLength(255).IsRequired();
            e.Property(u => u.RoleId).HasColumnName("RoleId").IsRequired();
            e.Property(u => u.Status).HasColumnName("Status").HasMaxLength(50);
            e.Ignore(u => u.AvatarUrl);
            e.Property(u => u.CreatedAt).HasColumnName("CreatedAt");
            e.Property(u => u.UpdatedAt).HasColumnName("UpdatedAt");
        });

        // ── Address ──────────────────────────────────
        modelBuilder.Entity<Address>(e =>
        {
            e.ToTable("Addresses");
            e.HasKey(a => a.AddressId);
            e.Property(a => a.AddressId).HasColumnName("AddressId");
            e.Property(a => a.UserId).HasColumnName("UserId").IsRequired();
            e.Property(a => a.ReceiverName).HasColumnName("ReceiverName").HasMaxLength(100).IsRequired();
            e.Property(a => a.Phone).HasColumnName("Phone").HasMaxLength(20).IsRequired();
            e.Property(a => a.Province).HasColumnName("Province").HasMaxLength(100).IsRequired();
            e.Property(a => a.District).HasColumnName("District").HasMaxLength(100).IsRequired();
            e.Property(a => a.Ward).HasColumnName("Ward").HasMaxLength(100).IsRequired();
            e.Property(a => a.AddressDetail).HasColumnName("AddressDetail").HasMaxLength(255).IsRequired();
            e.Property(a => a.Latitude).HasColumnName("Latitude").HasColumnType("decimal(18,8)");
            e.Property(a => a.Longitude).HasColumnName("Longitude").HasColumnType("decimal(18,8)");
            e.Property(a => a.IsDefault).HasColumnName("IsDefault").IsRequired();
            e.Property(a => a.AddressType).HasColumnName("AddressType").HasMaxLength(50);
        });

        // ── Category ──────────────────────────────────
        modelBuilder.Entity<Category>(e =>
        {
            e.ToTable("Categories");
            e.HasKey(c => c.CategoryId);
            e.Property(c => c.CategoryId).HasColumnName("CategoryId");
            e.Property(c => c.CategoryName).HasColumnName("CategoryName").HasMaxLength(100).IsRequired();
            e.Property(c => c.ParentCategoryId).HasColumnName("ParentCategoryId");
            e.Property(c => c.Status).HasColumnName("Status").HasMaxLength(50);
        });

        // ── Product ───────────────────────────────────
        modelBuilder.Entity<Product>(e =>
        {
            e.ToTable("Products");
            e.HasKey(p => p.ProductId);
            e.Property(p => p.ProductId).HasColumnName("ProductId");
            e.Property(p => p.SupplierId).HasColumnName("SupplierId").IsRequired();
            e.Property(p => p.CategoryId).HasColumnName("CategoryId").IsRequired();
            e.Property(p => p.ProductName).HasColumnName("ProductName").HasMaxLength(150).IsRequired();
            e.Property(p => p.Description).HasColumnName("Description");
            e.Property(p => p.Price).HasColumnName("Price").HasColumnType("decimal(18,2)").IsRequired();
            e.Property(p => p.Unit).HasColumnName("Unit").HasMaxLength(50).IsRequired();
            e.Property(p => p.Status).HasColumnName("Status").HasMaxLength(50);
            e.Property(p => p.ApprovedBy).HasColumnName("ApprovedBy");
            e.Property(p => p.ApprovedAt).HasColumnName("ApprovedAt");
            e.Property(p => p.RejectReason).HasColumnName("RejectReason");
            e.Property(p => p.CreatedAt).HasColumnName("CreatedAt");
            e.Property(p => p.UpdatedAt).HasColumnName("UpdatedAt");

            e.Ignore(p => p.AverageRating);
            e.Ignore(p => p.ReviewsCount);

            e.HasOne(p => p.Category)
             .WithMany(c => c.Products)
             .HasForeignKey(p => p.CategoryId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── ProductImage ──────────────────────────────
        modelBuilder.Entity<ProductImage>(e =>
        {
            e.ToTable("ProductImages");
            e.HasKey(i => i.ProductImageId);
            e.Property(i => i.ProductImageId).HasColumnName("ProductImageId");
            e.Property(i => i.ProductId).HasColumnName("ProductId").IsRequired();
            e.Property(i => i.ImageUrl).HasColumnName("ImageUrl").HasMaxLength(255).IsRequired();
            e.Property(i => i.IsPrimary).HasColumnName("IsPrimary").IsRequired();
            e.Property(i => i.SortOrder).HasColumnName("SortOrder").IsRequired();

            e.HasOne(i => i.Product)
             .WithMany(p => p.ProductImages)
             .HasForeignKey(i => i.ProductId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── ProductBatch (Table: Batches) ─────────────
        modelBuilder.Entity<ProductBatch>(e =>
        {
            e.ToTable("Batches");
            e.HasKey(b => b.BatchId);
            e.Property(b => b.BatchId).HasColumnName("BatchId");
            e.Property(b => b.ProductId).HasColumnName("ProductId").IsRequired();
            e.Property(b => b.FarmId).HasColumnName("FarmId").IsRequired();
            e.Property(b => b.BatchCode).HasColumnName("BatchCode").HasMaxLength(50).IsRequired();
            e.Property(b => b.HarvestDate).HasColumnName("HarvestDate").IsRequired();
            e.Property(b => b.ReceivedDate).HasColumnName("ReceivedDate");
            e.Property(b => b.ExpiryDate).HasColumnName("ExpiryDate").IsRequired();
            e.Property(b => b.InitialQuantity).HasColumnName("InitialQuantity").HasColumnType("decimal(18,2)").IsRequired();
            e.Property(b => b.Unit).HasColumnName("Unit").HasMaxLength(50).IsRequired();
            e.Property(b => b.Status).HasColumnName("Status").HasMaxLength(50);
            e.Property(b => b.CreatedAt).HasColumnName("CreatedAt");

            e.HasOne(b => b.Product)
             .WithMany(p => p.ProductBatches)
             .HasForeignKey(b => b.ProductId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Order ─────────────────────────────────────
        modelBuilder.Entity<Order>(e =>
        {
            e.ToTable("Orders");
            e.HasKey(o => o.OrderId);
            e.Property(o => o.OrderId).HasColumnName("OrderId");
            e.Property(o => o.CustomerId).HasColumnName("CustomerId").IsRequired();
            e.Property(o => o.OrderCode).HasColumnName("OrderCode").HasMaxLength(50).IsRequired();
            e.Property(o => o.AddressId).HasColumnName("AddressId").IsRequired();
            e.Property(o => o.Subtotal).HasColumnName("Subtotal").HasColumnType("decimal(18,2)").IsRequired();
            e.Property(o => o.DiscountAmount).HasColumnName("DiscountAmount").HasColumnType("decimal(18,2)");
            e.Property(o => o.ShippingFee).HasColumnName("ShippingFee").HasColumnType("decimal(18,2)");
            e.Property(o => o.TotalAmount).HasColumnName("TotalAmount").HasColumnType("decimal(18,2)").IsRequired();
            e.Property(o => o.PaymentMethod).HasColumnName("PaymentMethod").HasMaxLength(100).IsRequired();
            e.Property(o => o.PaymentStatus).HasColumnName("PaymentStatus").HasMaxLength(50);
            e.Property(o => o.OrderStatus).HasColumnName("OrderStatus").HasMaxLength(50);
            e.Property(o => o.CreatedAt).HasColumnName("CreatedAt");
            e.Property(o => o.UpdatedAt).HasColumnName("UpdatedAt");

            // Mối quan hệ với User (Customer)
            e.HasOne(o => o.Customer)
             .WithMany(u => u.Orders)
             .HasForeignKey(o => o.CustomerId)
             .OnDelete(DeleteBehavior.NoAction);

            // Mối quan hệ với Address
            e.HasOne(o => o.Address)
             .WithMany()
             .HasForeignKey(o => o.AddressId)
             .OnDelete(DeleteBehavior.NoAction);
        });

        // ── OrderItem ─────────────────────────────────
        modelBuilder.Entity<OrderItem>(e =>
        {
            e.ToTable("OrderItems");
            e.HasKey(i => i.OrderItemId);
            e.Property(i => i.OrderItemId).HasColumnName("OrderItemId");
            e.Property(i => i.OrderId).HasColumnName("OrderId").IsRequired();
            e.Property(i => i.ProductId).HasColumnName("ProductId").IsRequired();
            e.Property(i => i.BatchId).HasColumnName("BatchId").IsRequired();
            e.Property(i => i.Quantity).HasColumnName("Quantity").HasColumnType("decimal(18,2)").IsRequired();
            e.Property(i => i.UnitPrice).HasColumnName("UnitPrice").HasColumnType("decimal(18,2)").IsRequired();
            e.Property(i => i.DiscountAmount).HasColumnName("DiscountAmount").HasColumnType("decimal(18,2)");
            e.Property(i => i.TotalAmount).HasColumnName("TotalAmount").HasColumnType("decimal(18,2)").IsRequired();

            e.HasOne(i => i.Order)
             .WithMany(o => o.OrderItems)
             .HasForeignKey(i => i.OrderId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(i => i.Product)
             .WithMany(p => p.OrderItems)
             .HasForeignKey(i => i.ProductId)
             .OnDelete(DeleteBehavior.NoAction);

            e.HasOne(i => i.Batch)
             .WithMany()
             .HasForeignKey(i => i.BatchId)
             .OnDelete(DeleteBehavior.NoAction);
        });

        // ── MembershipTier ────────────────────────────
        modelBuilder.Entity<MembershipTier>(e =>
        {
            e.ToTable("MembershipTiers");
            e.HasKey(t => t.TierId);
            e.Property(t => t.TierId).HasColumnName("TierId");
            e.Property(t => t.TierName).HasMaxLength(50).IsRequired();
            e.Property(t => t.MinSpend).HasColumnType("decimal(18,2)").IsRequired();
            e.Property(t => t.PointRate).HasColumnType("decimal(18,4)").IsRequired();
        });

        // ── UserLoyalty ───────────────────────────────
        modelBuilder.Entity<UserLoyalty>(e =>
        {
            e.ToTable("UserLoyalties");
            e.HasKey(l => l.LoyaltyId);
            e.Property(l => l.LoyaltyId).HasColumnName("LoyaltyId");
            e.Property(l => l.UserId).IsRequired();
            e.Property(l => l.CurrentPoints).IsRequired();
            e.Property(l => l.TotalSpentYear).HasColumnType("decimal(18,2)").IsRequired();
            e.Property(l => l.TierId).IsRequired();

            e.HasOne(l => l.User)
             .WithMany()
             .HasForeignKey(l => l.UserId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(l => l.Tier)
             .WithMany()
             .HasForeignKey(l => l.TierId)
             .OnDelete(DeleteBehavior.NoAction);
        });

        // ── PointTransaction ──────────────────────────
        modelBuilder.Entity<PointTransaction>(e =>
        {
            e.ToTable("PointTransactions");
            e.HasKey(t => t.TransactionId);
            e.Property(t => t.TransactionId).HasColumnName("TransactionId");
            e.Property(t => t.UserId).IsRequired();
            e.Property(t => t.PointsDelta).IsRequired();
            e.Property(t => t.TransactionType).HasMaxLength(50).IsRequired();
            e.Property(t => t.Description).HasMaxLength(255).IsRequired();

            e.HasOne(t => t.User)
             .WithMany()
             .HasForeignKey(t => t.UserId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(t => t.Order)
             .WithMany()
             .HasForeignKey(t => t.OrderId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // ── UserVoucher ───────────────────────────────
        modelBuilder.Entity<UserVoucher>(e =>
        {
            e.ToTable("UserVouchers");
            e.HasKey(v => v.VoucherId);
            e.Property(v => v.VoucherId).HasColumnName("VoucherId");
            e.Property(v => v.UserId).IsRequired();
            e.Property(v => v.Code).HasMaxLength(50).IsRequired();
            e.Property(v => v.Title).HasMaxLength(150).IsRequired();
            e.Property(v => v.VoucherType).HasMaxLength(50).IsRequired();
            e.Property(v => v.DiscountValue).HasColumnType("decimal(18,2)").IsRequired();
            e.Property(v => v.MinOrderAmount).HasColumnType("decimal(18,2)").IsRequired();

            e.HasOne(v => v.User)
             .WithMany()
             .HasForeignKey(v => v.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Review ───────────────────────────────────
        modelBuilder.Entity<Review>(e =>
        {
            e.ToTable("Reviews");
            e.HasKey(r => r.ReviewId);
            e.Property(r => r.ReviewId).HasColumnName("ReviewId");
            e.Property(r => r.CustomerId).HasColumnName("CustomerId").IsRequired();
            e.Property(r => r.ProductId).HasColumnName("ProductId").IsRequired();
            e.Property(r => r.OrderId).HasColumnName("OrderId");
            e.Property(r => r.Rating).HasColumnName("Rating").IsRequired();
            e.Property(r => r.Comment).HasColumnName("Comment");
            e.Property(r => r.HelpfulCount).HasColumnName("HelpfulCount").HasDefaultValue(0);
            e.Property(r => r.ReportCount).HasColumnName("ReportCount").HasDefaultValue(0);
            e.Property(r => r.IsPurchased).HasColumnName("IsPurchased").HasDefaultValue(false);
            e.Property(r => r.CreatedAt).HasColumnName("CreatedAt");
            e.Property(r => r.UpdatedAt).HasColumnName("UpdatedAt");
            e.Property(r => r.Status).HasColumnName("Status").HasMaxLength(20);

            e.HasOne(r => r.Customer)
             .WithMany()
             .HasForeignKey(r => r.CustomerId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(r => r.Product)
             .WithMany(p => p.Reviews)
             .HasForeignKey(r => r.ProductId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(r => r.Order)
             .WithMany()
             .HasForeignKey(r => r.OrderId)
             .IsRequired(false)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // ── ReviewImage ───────────────────────────────
        modelBuilder.Entity<ReviewImage>(e =>
        {
            e.ToTable("ReviewImages");
            e.HasKey(ri => ri.ReviewImageId);
            e.Property(ri => ri.ReviewImageId).HasColumnName("ReviewImageId");
            e.Property(ri => ri.ReviewId).HasColumnName("ReviewId").IsRequired();
            e.Property(ri => ri.ImageUrl).HasColumnName("ImageUrl").HasMaxLength(500).IsRequired();

            e.HasOne(ri => ri.Review)
             .WithMany(r => r.ReviewImages)
             .HasForeignKey(ri => ri.ReviewId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── ReviewHelpfulVote ─────────────────────────
        modelBuilder.Entity<ReviewHelpfulVote>(e =>
        {
            e.ToTable("ReviewHelpfulVotes");
            e.HasKey(v => v.VoteId);
            e.Property(v => v.VoteId).HasColumnName("VoteId");
            e.Property(v => v.ReviewId).HasColumnName("ReviewId").IsRequired();
            e.Property(v => v.UserId).HasColumnName("UserId").IsRequired();
            e.Property(v => v.CreatedAt).HasColumnName("CreatedAt");

            e.HasIndex(v => new { v.ReviewId, v.UserId }).IsUnique();

            e.HasOne(v => v.Review)
             .WithMany(r => r.HelpfulVotes)
             .HasForeignKey(v => v.ReviewId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(v => v.User)
             .WithMany()
             .HasForeignKey(v => v.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── UserBehavior ──────────────────────────────
        modelBuilder.Entity<UserBehavior>(e =>
        {
            e.ToTable("UserBehaviors");
            e.HasKey(b => b.BehaviorId);
            e.Property(b => b.BehaviorId).HasColumnName("BehaviorId");
            e.Property(b => b.UserId).HasColumnName("UserId");
            e.Property(b => b.ProductId).HasColumnName("ProductId").IsRequired();
            e.Property(b => b.ActionType).HasColumnName("ActionType").HasMaxLength(50).IsRequired();
            e.Property(b => b.SearchKeyword).HasColumnName("SearchKeyword").HasMaxLength(255);
            e.Property(b => b.SessionId).HasColumnName("SessionId").HasMaxLength(100);
            e.Property(b => b.CreatedAt).HasColumnName("CreatedAt");

            e.HasOne(b => b.User)
             .WithMany()
             .HasForeignKey(b => b.UserId)
             .OnDelete(DeleteBehavior.SetNull);

            e.HasOne(b => b.Product)
             .WithMany()
             .HasForeignKey(b => b.ProductId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── RecommendationLog ─────────────────────────
        modelBuilder.Entity<RecommendationLog>(e =>
        {
            e.ToTable("RecommendationLogs");
            e.HasKey(l => l.RecommendationLogId);
            e.Property(l => l.RecommendationLogId).HasColumnName("RecommendationLogId");
            e.Property(l => l.UserId).HasColumnName("UserId");
            e.Property(l => l.ProductId).HasColumnName("ProductId").IsRequired();
            e.Property(l => l.RecommendationType).HasColumnName("RecommendationType").HasMaxLength(50).IsRequired();
            e.Property(l => l.Score).HasColumnName("Score");
            e.Property(l => l.Position).HasColumnName("Position");
            e.Property(l => l.ShownAt).HasColumnName("ShownAt");
            e.Property(l => l.Clicked).HasColumnName("Clicked");
            e.Property(l => l.AddedToCart).HasColumnName("AddedToCart");
            e.Property(l => l.Purchased).HasColumnName("Purchased");

            e.HasOne(l => l.User)
             .WithMany()
             .HasForeignKey(l => l.UserId)
             .OnDelete(DeleteBehavior.SetNull);

            e.HasOne(l => l.Product)
             .WithMany()
             .HasForeignKey(l => l.ProductId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── ProductSeason ─────────────────────────────
        modelBuilder.Entity<ProductSeason>(e =>
        {
            e.ToTable("ProductSeasons");
            e.HasKey(s => s.ProductSeasonId);
            e.Property(s => s.ProductSeasonId).HasColumnName("ProductSeasonId");
            e.Property(s => s.ProductId).HasColumnName("ProductId").IsRequired();
            e.Property(s => s.Region).HasColumnName("Region").HasMaxLength(100);
            e.Property(s => s.StartMonth).HasColumnName("StartMonth");
            e.Property(s => s.EndMonth).HasColumnName("EndMonth");

            e.HasOne(s => s.Product)
             .WithMany()
             .HasForeignKey(s => s.ProductId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Farm ──────────────────────────────────────
        modelBuilder.Entity<Farm>(e =>
        {
            e.ToTable("Farms");
            e.HasKey(f => f.FarmId);
            e.Property(f => f.FarmId).HasColumnName("FarmId");
            e.Property(f => f.SupplierId).HasColumnName("SupplierId");
            e.Property(f => f.FarmName).HasColumnName("FarmName").HasMaxLength(150).IsRequired();
            e.Property(f => f.Address).HasColumnName("Address").HasMaxLength(255);
            e.Property(f => f.Province).HasColumnName("Province").HasMaxLength(100);
            e.Property(f => f.District).HasColumnName("District").HasMaxLength(100);
            e.Property(f => f.Latitude).HasColumnName("Latitude").HasColumnType("decimal(18,8)");
            e.Property(f => f.Longitude).HasColumnName("Longitude").HasColumnType("decimal(18,8)");
            e.Property(f => f.Area).HasColumnName("Area").HasColumnType("decimal(18,2)");
            e.Property(f => f.CropType).HasColumnName("CropType").HasMaxLength(150);
            e.Property(f => f.ProductionStandard).HasColumnName("ProductionStandard").HasMaxLength(100);
            e.Property(f => f.Status).HasColumnName("Status").HasMaxLength(50);
        });
    }
}
