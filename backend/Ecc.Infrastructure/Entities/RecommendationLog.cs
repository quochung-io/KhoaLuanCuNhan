using System.Text.Json.Serialization;

namespace Ecc.Infrastructure.Entities;

public class RecommendationLog
{
    public long RecommendationLogId { get; set; }
    public long? UserId { get; set; }
    public long ProductId { get; set; }
    public string RecommendationType { get; set; } = null!; // FOR_YOU, FREQUENTLY_BOUGHT_TOGETHER, SIMILAR, IN_SEASON, NEAR_DELIVERY
    public double Score { get; set; }
    public int Position { get; set; }
    public DateTime ShownAt { get; set; } = DateTime.UtcNow;
    public bool? Clicked { get; set; }
    public bool? AddedToCart { get; set; }
    public bool? Purchased { get; set; }

    [JsonIgnore]
    public User? User { get; set; }

    public Product? Product { get; set; }
}
