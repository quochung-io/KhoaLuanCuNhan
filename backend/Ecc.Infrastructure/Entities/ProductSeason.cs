using System.Text.Json.Serialization;

namespace Ecc.Infrastructure.Entities;

public class ProductSeason
{
    public long ProductSeasonId { get; set; }
    public long ProductId { get; set; }
    public string? Region { get; set; }
    public int StartMonth { get; set; }
    public int EndMonth { get; set; }

    [JsonIgnore]
    public Product? Product { get; set; }
}
