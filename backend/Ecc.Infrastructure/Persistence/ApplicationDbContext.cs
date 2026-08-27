using Microsoft.EntityFrameworkCore;
using Ecc.Domain.Entities;

namespace Ecc.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Cấu hình bảng Roles
        modelBuilder.Entity<Role>(entity =>
        {
            entity.ToTable("Roles");
            entity.HasKey(e => e.RoleId);
            entity.Property(e => e.RoleName).HasMaxLength(50).IsRequired();
        });

        // Cấu hình bảng Users
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users");
            entity.HasKey(e => e.UserId);
            entity.Property(e => e.FullName).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Email).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Phone).HasMaxLength(20);
            entity.Property(e => e.PasswordHash).HasMaxLength(255).IsRequired();
            entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("Active");

            entity.HasOne(d => d.Role)
                .WithMany()
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        // Cấu hình bảng Products
        modelBuilder.Entity<Product>(entity =>
        {
            entity.ToTable("Products");
            entity.HasKey(e => e.ProductId);
            entity.Property(e => e.ProductName).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Unit).HasMaxLength(20).IsRequired();
            entity.Property(e => e.Status).HasMaxLength(20).HasDefaultValue("Pending");
            entity.Property(e => e.Price).HasColumnType("decimal(18,2)");
        });
    }
}
