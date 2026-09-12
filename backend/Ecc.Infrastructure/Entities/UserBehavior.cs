using System.Text.Json.Serialization;

namespace Ecc.Infrastructure.Entities;

public class UserBehavior
{
    public long BehaviorId { get; set; }
    public long? UserId { get; set; }
    public long ProductId { get; set; }
    public string ActionType { get; set; } = null!; // VIEW, QUICK_VIEW, SEARCH, CART, PURCHASE, RECOMMENDATION_CLICK
    public string? SearchKeyword { get; set; }
    public string? SessionId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [JsonIgnore]
    public User? User { get; set; }

    public Product? Product { get; set; }
}
