// ============================================================================
// TỆP MÃ NGUỒN: backend/Ecc.Infrastructure/Entities/Review.cs
// MÔ TẢ: Thực thể dữ liệu (Entity) Review - Biểu diễn cấu trúc bảng và mối quan hệ của Review trong cơ sở dữ liệu.
// ============================================================================
using System.Text.Json.Serialization;

namespace Ecc.Infrastructure.Entities;

public class Review
{
    public long ReviewId { get; set; }
    public long CustomerId { get; set; }
    public long ProductId { get; set; }
    public long? OrderId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public int HelpfulCount { get; set; } = 0;
    public int ReportCount { get; set; } = 0;
    public bool IsPurchased { get; set; } = false;
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? Status { get; set; } = "Approved";
    public long? ParentReviewId { get; set; }

    public User? Customer { get; set; }
    
    [JsonIgnore]
    public Product? Product { get; set; }
    
    [JsonIgnore]
    public Order? Order { get; set; }

    [JsonIgnore]
    public Review? ParentReview { get; set; }
    public ICollection<Review> Replies { get; set; } = new List<Review>();

    public ICollection<ReviewImage> ReviewImages { get; set; } = new List<ReviewImage>();
    public ICollection<ReviewHelpfulVote> HelpfulVotes { get; set; } = new List<ReviewHelpfulVote>();
}
