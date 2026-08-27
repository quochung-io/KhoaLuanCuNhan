using Microsoft.EntityFrameworkCore;
using Ecc.Infrastructure.Entities;

namespace Ecc.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductBatch> ProductBatches => Set<ProductBatch>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── User ──────────────────────────────────────
        modelBuilder.Entity<User>(e =>
        {
            e.ToTable("users");
            e.HasKey(u => u.Id);
            e.Property(u => u.Id).HasColumnName("id");
            e.Property(u => u.Username).HasColumnName("username").HasMaxLength(50).IsRequired();
            e.Property(u => u.PasswordHash).HasColumnName("password_hash").HasMaxLength(255).IsRequired();
            e.Property(u => u.Email).HasColumnName("email").HasMaxLength(100).IsRequired();
            e.Property(u => u.Role).HasColumnName("role").HasMaxLength(20).IsRequired();
            e.Property(u => u.Phone).HasColumnName("phone").HasMaxLength(20);
            e.Property(u => u.Address).HasColumnName("address");
            e.Property(u => u.Latitude).HasColumnName("latitude");
            e.Property(u => u.Longitude).HasColumnName("longitude");
            e.Property(u => u.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("GETDATE()");
            e.Property(u => u.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("GETDATE()");
            e.HasIndex(u => u.Username).IsUnique();
            e.HasIndex(u => u.Email).IsUnique();
        });

        // ── Category ──────────────────────────────────
        modelBuilder.Entity<Category>(e =>
        {
            e.ToTable("categories");
            e.HasKey(c => c.Id);
            e.Property(c => c.Id).HasColumnName("id");
            e.Property(c => c.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
            e.Property(c => c.Description).HasColumnName("description");
        });

        // ── Product ───────────────────────────────────
        modelBuilder.Entity<Product>(e =>
        {
            e.ToTable("products");
            e.HasKey(p => p.Id);
            e.Property(p => p.Id).HasColumnName("id");
            e.Property(p => p.CategoryId).HasColumnName("category_id");
            e.Property(p => p.Name).HasColumnName("name").HasMaxLength(150).IsRequired();
            e.Property(p => p.Description).HasColumnName("description");
            e.Property(p => p.ImageUrl).HasColumnName("image_url");
            e.Property(p => p.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("GETDATE()");
            e.HasOne(p => p.Category)
             .WithMany(c => c.Products)
             .HasForeignKey(p => p.CategoryId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // ── ProductBatch ──────────────────────────────
        modelBuilder.Entity<ProductBatch>(e =>
        {
            e.ToTable("product_batches");
            e.HasKey(b => b.Id);
            e.Property(b => b.Id).HasColumnName("id");
            e.Property(b => b.ProductId).HasColumnName("product_id");
            e.Property(b => b.SupplierId).HasColumnName("supplier_id");
            e.Property(b => b.BatchCode).HasColumnName("batch_code").HasMaxLength(50).IsRequired();
            e.Property(b => b.Quantity).HasColumnName("quantity").IsRequired();
            e.Property(b => b.OriginalQuantity).HasColumnName("original_quantity").IsRequired();
            e.Property(b => b.Price).HasColumnName("price").HasColumnType("decimal(18,2)").IsRequired();
            e.Property(b => b.ManufacturedDate).HasColumnName("manufactured_date").IsRequired();
            e.Property(b => b.ExpiryDate).HasColumnName("expiry_date").IsRequired();
            e.Property(b => b.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("GETDATE()");
            e.HasIndex(b => b.BatchCode).IsUnique();
            e.HasOne(b => b.Product)
             .WithMany(p => p.ProductBatches)
             .HasForeignKey(b => b.ProductId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(b => b.Supplier)
             .WithMany(u => u.ProductBatches)
             .HasForeignKey(b => b.SupplierId)
             .OnDelete(DeleteBehavior.NoAction);
        });

        // ── Order ─────────────────────────────────────
        modelBuilder.Entity<Order>(e =>
        {
            e.ToTable("orders");
            e.HasKey(o => o.Id);
            e.Property(o => o.Id).HasColumnName("id");
            e.Property(o => o.CustomerId).HasColumnName("customer_id");
            e.Property(o => o.OrderDate).HasColumnName("order_date").HasDefaultValueSql("GETDATE()");
            e.Property(o => o.Status).HasColumnName("status").HasMaxLength(20).IsRequired();
            e.Property(o => o.TotalAmount).HasColumnName("total_amount").HasColumnType("decimal(18,2)").IsRequired();
            e.Property(o => o.ShippingAddress).HasColumnName("shipping_address");
            e.Property(o => o.Latitude).HasColumnName("latitude");
            e.Property(o => o.Longitude).HasColumnName("longitude");
            e.HasOne(o => o.Customer)
             .WithMany(u => u.Orders)
             .HasForeignKey(o => o.CustomerId)
             .OnDelete(DeleteBehavior.NoAction);
        });

        // ── OrderItem ─────────────────────────────────
        modelBuilder.Entity<OrderItem>(e =>
        {
            e.ToTable("order_items");
            e.HasKey(i => i.Id);
            e.Property(i => i.Id).HasColumnName("id");
            e.Property(i => i.OrderId).HasColumnName("order_id");
            e.Property(i => i.ProductId).HasColumnName("product_id");
            e.Property(i => i.Quantity).HasColumnName("quantity").IsRequired();
            e.Property(i => i.UnitPrice).HasColumnName("unit_price").HasColumnType("decimal(18,2)").IsRequired();
            e.HasOne(i => i.Order)
             .WithMany(o => o.OrderItems)
             .HasForeignKey(i => i.OrderId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(i => i.Product)
             .WithMany(p => p.OrderItems)
             .HasForeignKey(i => i.ProductId)
             .OnDelete(DeleteBehavior.NoAction);
        });
    }
}
