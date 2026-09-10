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
            e.Property(u => u.AvatarUrl).HasColumnName("AvatarUrl").HasMaxLength(255);
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
    }
}
