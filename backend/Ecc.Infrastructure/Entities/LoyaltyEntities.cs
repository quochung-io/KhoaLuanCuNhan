using System;
using System.Collections.Generic;

namespace Ecc.Infrastructure.Entities;

public class MembershipTier
{
    public int TierId { get; set; }
    public string TierName { get; set; } = string.Empty;
    public decimal MinSpend { get; set; }
    public decimal PointRate { get; set; }
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class UserLoyalty
{
    public int LoyaltyId { get; set; }
    public long UserId { get; set; }
    public int CurrentPoints { get; set; }
    public decimal TotalSpentYear { get; set; }
    public int TierId { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
    public MembershipTier? Tier { get; set; }
}

public class PointTransaction
{
    public int TransactionId { get; set; }
    public long UserId { get; set; }
    public long? OrderId { get; set; }
    public int PointsDelta { get; set; }
    public string TransactionType { get; set; } = "Earn";
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
    public Order? Order { get; set; }
}

public class UserVoucher
{
    public int VoucherId { get; set; }
    public long UserId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string VoucherType { get; set; } = "cash";
    public decimal DiscountValue { get; set; }
    public decimal MinOrderAmount { get; set; }
    public DateTime ExpiryDate { get; set; }
    public bool IsUsed { get; set; }
    public DateTime? UsedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
}
