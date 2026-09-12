using System.Text.Json.Serialization;

namespace Ecc.Infrastructure.Entities;

public class ReviewImage
{
    public long ReviewImageId { get; set; }
    public long ReviewId { get; set; }
    public string ImageUrl { get; set; } = null!;

    [JsonIgnore]
    public Review? Review { get; set; }
}
