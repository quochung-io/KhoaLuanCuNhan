using System.Text.Json.Serialization;

namespace Ecc.Infrastructure.Entities;

public class ReviewHelpfulVote
{
    public long VoteId { get; set; }
    public long ReviewId { get; set; }
    public long UserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [JsonIgnore]
    public Review? Review { get; set; }

    [JsonIgnore]
    public User? User { get; set; }
}
