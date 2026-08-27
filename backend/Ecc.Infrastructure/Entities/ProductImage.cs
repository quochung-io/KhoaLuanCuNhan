using System.Text.Json.Serialization;

namespace Ecc.Infrastructure.Entities;

public class ProductImage
{
    public long ProductImageId { get; set; }
    public long ProductId { get; set; }
    public string ImageUrl { get; set; } = null!;
    public bool IsPrimary { get; set; }
    public int SortOrder { get; set; }

    [JsonIgnore]
    public Product? Product { get; set; }
}
