using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ecc.Infrastructure.Data;
using Ecc.Infrastructure.Entities;

namespace Ecc.WebApi.Controllers.Web;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReviewsController(AppDbContext context)
    {
        _context = context;
    }

    // DTO cho yêu cầu tạo đánh giá mới
    public class CreateReviewRequest
    {
        public long ProductId { get; set; }
        public long? CustomerId { get; set; }
        public string? CustomerName { get; set; }
        public string? Email { get; set; }
        public long? OrderId { get; set; }
        public int Rating { get; set; } = 5;
        public string? Comment { get; set; }
        public List<string>? ImageUrls { get; set; }
    }

    // DTO cho yêu cầu chỉnh sửa đánh giá
    public class UpdateReviewRequest
    {
        public int Rating { get; set; } = 5;
        public string? Comment { get; set; }
        public List<string>? ImageUrls { get; set; }
    }

    // DTO cho thao tác bấm Hữu ích
    public class HelpfulVoteRequest
    {
        public long? UserId { get; set; }
    }

    // GET: api/reviews/product/{productId}?star=...&hasImages=...&sort=...&page=...&pageSize=...&currentUserId=...
    [HttpGet("product/{productId}")]
    public async Task<IActionResult> GetByProduct(
        long productId,
        [FromQuery] int? star,
        [FromQuery] bool? hasImages,
        [FromQuery] string? sort = "newest",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] long? currentUserId = null)
    {
        try
        {
            var productExists = await _context.Products.AnyAsync(p => p.ProductId == productId);
            if (!productExists)
            {
                return NotFound(new { message = $"Không tìm thấy sản phẩm có ID = {productId}" });
            }

            // Lấy tất cả đánh giá đã duyệt của sản phẩm này để tính toán tổng quan
            var allReviewsQuery = _context.Reviews
                .Include(r => r.Customer)
                .Include(r => r.ReviewImages)
                .Where(r => r.ProductId == productId && (r.Status == "Approved" || string.IsNullOrEmpty(r.Status)));

            var allReviews = await allReviewsQuery.ToListAsync();

            int total = allReviews.Count;
            double avg = total > 0 ? Math.Round(allReviews.Average(r => r.Rating), 1) : 0.0;

            var ratingCounts = new Dictionary<int, int>
            {
                { 5, allReviews.Count(r => r.Rating == 5) },
                { 4, allReviews.Count(r => r.Rating == 4) },
                { 3, allReviews.Count(r => r.Rating == 3) },
                { 2, allReviews.Count(r => r.Rating == 2) },
                { 1, allReviews.Count(r => r.Rating == 1) }
            };

            var ratingPercentages = new Dictionary<int, double>
            {
                { 5, total > 0 ? Math.Round((double)ratingCounts[5] / total * 100, 1) : 0 },
                { 4, total > 0 ? Math.Round((double)ratingCounts[4] / total * 100, 1) : 0 },
                { 3, total > 0 ? Math.Round((double)ratingCounts[3] / total * 100, 1) : 0 },
                { 2, total > 0 ? Math.Round((double)ratingCounts[2] / total * 100, 1) : 0 },
                { 1, total > 0 ? Math.Round((double)ratingCounts[1] / total * 100, 1) : 0 }
            };

            int hasImagesCount = allReviews.Count(r => r.ReviewImages.Any());

            // Áp dụng bộ lọc cho danh sách hiển thị
            var filtered = allReviews.AsEnumerable();

            if (star.HasValue && star.Value >= 1 && star.Value <= 5)
            {
                filtered = filtered.Where(r => r.Rating == star.Value);
            }

            if (hasImages.HasValue && hasImages.Value)
            {
                filtered = filtered.Where(r => r.ReviewImages.Any());
            }

            // Sắp xếp
            filtered = sort switch
            {
                "oldest" => filtered.OrderBy(r => r.CreatedAt),
                "rating-desc" => filtered.OrderByDescending(r => r.Rating).ThenByDescending(r => r.CreatedAt),
                "rating-asc" => filtered.OrderBy(r => r.Rating).ThenByDescending(r => r.CreatedAt),
                "helpful" => filtered.OrderByDescending(r => r.HelpfulCount).ThenByDescending(r => r.CreatedAt),
                _ => filtered.OrderByDescending(r => r.CreatedAt) // newest
            };

            int filteredCount = filtered.Count();
            int validPage = Math.Max(1, page);
            int validPageSize = Math.Max(1, Math.Min(50, pageSize));

            HashSet<long> userLikedIds = new();
            if (currentUserId.HasValue && currentUserId.Value > 0)
            {
                var likedList = await _context.ReviewHelpfulVotes
                    .Where(v => v.UserId == currentUserId.Value)
                    .Select(v => v.ReviewId)
                    .ToListAsync();
                userLikedIds = likedList.ToHashSet();
            }

            var pagedReviews = filtered
                .Skip((validPage - 1) * validPageSize)
                .Take(validPageSize)
                .Select(r => new
                {
                    reviewId = r.ReviewId,
                    customerId = r.CustomerId,
                    customerName = r.Customer != null ? r.Customer.FullName : "Khách hàng LÀNH Farm",
                    rating = r.Rating,
                    comment = r.Comment ?? "",
                    createdAt = r.CreatedAt.HasValue ? r.CreatedAt.Value.ToString("dd/MM/yyyy HH:mm") : "Vừa xong",
                    updatedAt = r.UpdatedAt.HasValue ? r.UpdatedAt.Value.ToString("dd/MM/yyyy HH:mm") : null,
                    helpfulCount = r.HelpfulCount,
                    isHelpfulByMe = userLikedIds.Contains(r.ReviewId),
                    reportCount = r.ReportCount,
                    isPurchased = r.IsPurchased,
                    status = r.Status,
                    images = r.ReviewImages.Select(img => img.ImageUrl).ToList()
                })
                .ToList();

            return Ok(new
            {
                productId,
                averageRating = avg,
                totalReviews = total,
                hasImagesCount,
                ratingCounts,
                ratingPercentages,
                pagination = new
                {
                    page = validPage,
                    pageSize = validPageSize,
                    totalItems = filteredCount,
                    totalPages = (int)Math.Ceiling((double)filteredCount / validPageSize)
                },
                reviews = pagedReviews
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Lỗi khi tải đánh giá: {ex.Message}" });
        }
    }

    // GET: api/reviews/featured (Các đánh giá thực tế cho trang chủ, hỗ trợ limit hoặc lấy full)
    [HttpGet("featured")]
    public async Task<IActionResult> GetFeaturedReviews([FromQuery] int limit = 0, [FromQuery] long? currentUserId = null)
    {
        try
        {
            HashSet<long> userLikedIds = new();
            if (currentUserId.HasValue && currentUserId.Value > 0)
            {
                var likedList = await _context.ReviewHelpfulVotes
                    .Where(v => v.UserId == currentUserId.Value)
                    .Select(v => v.ReviewId)
                    .ToListAsync();
                userLikedIds = likedList.ToHashSet();
            }

            var query = _context.Reviews
                .Include(r => r.Customer)
                .Include(r => r.Product)
                .Include(r => r.ReviewImages)
                .Where(r => r.Status == "Approved" || string.IsNullOrEmpty(r.Status))
                .OrderByDescending(r => r.CreatedAt);

            var listQuery = limit > 0 ? query.Take(limit) : query;

            var reviews = await listQuery
                .Select(r => new
                {
                    id = r.ReviewId,
                    name = r.Customer != null ? r.Customer.FullName : "Khách hàng LÀNH Farm",
                    role = r.Product != null ? $"Đã mua {r.Product.ProductName}" : "Khách mua hàng đã xác thực",
                    text = r.Comment ?? "",
                    rating = r.Rating,
                    date = r.CreatedAt.HasValue ? r.CreatedAt.Value.ToString("dd/MM/yyyy") : "Gần đây",
                    verified = r.IsPurchased,
                    productName = r.Product != null ? r.Product.ProductName : null,
                    productId = r.ProductId,
                    helpfulCount = r.HelpfulCount,
                    isHelpfulByMe = userLikedIds.Contains(r.ReviewId),
                    images = r.ReviewImages.Select(img => img.ImageUrl).ToList()
                })
                .ToListAsync();

            return Ok(reviews);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Lỗi khi tải đánh giá nổi bật: {ex.Message}" });
        }
    }

    // POST: api/reviews
    [HttpPost]
    public async Task<IActionResult> CreateReview([FromBody] CreateReviewRequest req)
    {
        try
        {
            if (req.Rating < 1 || req.Rating > 5)
            {
                return BadRequest(new { message = "Số sao đánh giá phải từ 1 đến 5!" });
            }

            if (string.IsNullOrWhiteSpace(req.Comment))
            {
                return BadRequest(new { message = "Nội dung đánh giá không được để trống!" });
            }

            if (req.Comment.Length > 1000)
            {
                return BadRequest(new { message = "Nội dung đánh giá không được vượt quá 1000 ký tự!" });
            }

            var product = await _context.Products.FindAsync(req.ProductId);
            if (product == null)
            {
                return NotFound(new { message = $"Không tìm thấy sản phẩm có ID = {req.ProductId}" });
            }

            // Đảm bảo đánh giá luôn thuộc về 1 User có thật trong bảng Users
            long customerId = 0;
            if (req.CustomerId.HasValue && req.CustomerId.Value > 0)
            {
                var userExists = await _context.Users.AnyAsync(u => u.UserId == req.CustomerId.Value);
                if (userExists)
                {
                    customerId = req.CustomerId.Value;
                }
            }

            if (customerId == 0)
            {
                var inputName = !string.IsNullOrWhiteSpace(req.CustomerName) ? req.CustomerName.Trim() : "Khách hàng LÀNH Farm";
                var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.FullName.ToLower() == inputName.ToLower());
                if (existingUser != null)
                {
                    customerId = existingUser.UserId;
                }
                else
                {
                    // Tự động tạo tài khoản User mới để luôn khớp dữ liệu 100% trong bảng Users
                    string userEmail = !string.IsNullOrWhiteSpace(req.Email) 
                        ? req.Email.Trim().ToLower() 
                        : $"khach_{DateTime.UtcNow.Ticks.ToString().Substring(10)}@gmail.com";

                    if (await _context.Users.AnyAsync(u => u.Email.ToLower() == userEmail))
                    {
                        userEmail = $"khach_{Guid.NewGuid().ToString().Substring(0, 8)}@gmail.com";
                    }

                    var newUser = new User
                    {
                        FullName = inputName,
                        Email = userEmail,
                        Phone = "09" + new Random().Next(10000000, 99999999).ToString(),
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"),
                        RoleId = 3,
                        Status = "Active",
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.Users.Add(newUser);
                    await _context.SaveChangesAsync();
                    customerId = newUser.UserId;
                }
            }

            // Kiểm tra xem khách hàng đã từng mua sản phẩm này chưa
            long? orderId = req.OrderId;
            bool isPurchased = false;

            if (orderId.HasValue && await _context.Orders.AnyAsync(o => o.OrderId == orderId.Value))
            {
                isPurchased = true;
            }
            else
            {
                var pastOrder = await _context.OrderItems
                    .Where(oi => oi.ProductId == req.ProductId && oi.Order != null && oi.Order.CustomerId == customerId)
                    .Select(oi => (long?)oi.OrderId)
                    .FirstOrDefaultAsync();

                if (pastOrder.HasValue)
                {
                    orderId = pastOrder;
                    isPurchased = true;
                }
            }

            var newReview = new Review
            {
                ProductId = req.ProductId,
                CustomerId = customerId,
                OrderId = orderId,
                Rating = req.Rating,
                Comment = req.Comment.Trim(),
                HelpfulCount = 0,
                ReportCount = 0,
                IsPurchased = isPurchased,
                Status = "Approved",
                CreatedAt = DateTime.UtcNow
            };

            _context.Reviews.Add(newReview);
            await _context.SaveChangesAsync();

            // Lưu tối đa 5 ảnh đính kèm nếu có
            if (req.ImageUrls != null && req.ImageUrls.Count > 0)
            {
                foreach (var url in req.ImageUrls.Where(u => !string.IsNullOrWhiteSpace(u)).Take(5))
                {
                    _context.ReviewImages.Add(new ReviewImage
                    {
                        ReviewId = newReview.ReviewId,
                        ImageUrl = url.Trim()
                    });
                }
                await _context.SaveChangesAsync();
            }

            var customer = await _context.Users.FindAsync(customerId);
            return Ok(new
            {
                message = "Đánh giá thành công!",
                review = new
                {
                    reviewId = newReview.ReviewId,
                    customerId = newReview.CustomerId,
                    customerName = customer != null ? customer.FullName : (req.CustomerName ?? "Khách hàng"),
                    rating = newReview.Rating,
                    comment = newReview.Comment,
                    createdAt = DateTime.UtcNow.ToString("dd/MM/yyyy HH:mm"),
                    isPurchased = newReview.IsPurchased,
                    helpfulCount = newReview.HelpfulCount,
                    status = newReview.Status,
                    images = req.ImageUrls ?? new List<string>()
                }
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Lỗi khi lưu đánh giá: {ex.Message}" });
        }
    }

    // PUT: api/reviews/{id} (Sửa đánh giá của chính mình)
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateReview(long id, [FromBody] UpdateReviewRequest req)
    {
        try
        {
            var review = await _context.Reviews
                .Include(r => r.ReviewImages)
                .FirstOrDefaultAsync(r => r.ReviewId == id);

            if (review == null)
            {
                return NotFound(new { message = $"Không tìm thấy đánh giá có ID = {id}" });
            }

            if (req.Rating < 1 || req.Rating > 5)
            {
                return BadRequest(new { message = "Số sao phải từ 1 đến 5!" });
            }

            if (string.IsNullOrWhiteSpace(req.Comment))
            {
                return BadRequest(new { message = "Nội dung nhận xét không được để trống!" });
            }

            review.Rating = req.Rating;
            review.Comment = req.Comment.Trim();
            review.UpdatedAt = DateTime.UtcNow;

            // Cập nhật lại ảnh
            if (req.ImageUrls != null)
            {
                _context.ReviewImages.RemoveRange(review.ReviewImages);
                foreach (var url in req.ImageUrls.Where(u => !string.IsNullOrWhiteSpace(u)).Take(5))
                {
                    _context.ReviewImages.Add(new ReviewImage
                    {
                        ReviewId = review.ReviewId,
                        ImageUrl = url.Trim()
                    });
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Cập nhật đánh giá thành công!",
                review = new
                {
                    reviewId = review.ReviewId,
                    rating = review.Rating,
                    comment = review.Comment,
                    updatedAt = review.UpdatedAt.Value.ToString("dd/MM/yyyy HH:mm")
                }
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Lỗi khi cập nhật đánh giá: {ex.Message}" });
        }
    }

    // DELETE: api/reviews/{id} (Xóa đánh giá của chính mình)
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteReview(long id)
    {
        try
        {
            var review = await _context.Reviews
                .Include(r => r.ReviewImages)
                .FirstOrDefaultAsync(r => r.ReviewId == id);

            if (review == null)
            {
                return NotFound(new { message = $"Không tìm thấy đánh giá có ID = {id}" });
            }

            _context.ReviewImages.RemoveRange(review.ReviewImages);
            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa đánh giá thành công!" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Lỗi khi xóa đánh giá: {ex.Message}" });
        }
    }

    // POST: api/reviews/{id}/helpful (Bấm Hữu ích / Toggle Like & Unlike gắn với 1 tài khoản)
    [HttpPost("{id}/helpful")]
    public async Task<IActionResult> MarkHelpful(long id, [FromQuery] long? userId, [FromBody] HelpfulVoteRequest? req = null)
    {
        try
        {
            long targetUserId = userId ?? req?.UserId ?? 0;
            if (targetUserId <= 0)
            {
                return BadRequest(new { message = "Vui lòng đăng nhập tài khoản để đánh giá hoặc bỏ thích hữu ích!" });
            }

            var user = await _context.Users.FindAsync(targetUserId);
            if (user == null)
            {
                return NotFound(new { message = "Tài khoản người dùng không tồn tại trong hệ thống!" });
            }

            var review = await _context.Reviews.FindAsync(id);
            if (review == null)
            {
                return NotFound(new { message = $"Không tìm thấy đánh giá có ID = {id}" });
            }

            // Kiểm tra xem tài khoản này đã like review này chưa
            var existingVote = await _context.ReviewHelpfulVotes
                .FirstOrDefaultAsync(v => v.ReviewId == id && v.UserId == targetUserId);

            bool liked = false;
            if (existingVote != null)
            {
                // Đã like -> Thực hiện Unlike (Hủy like)
                _context.ReviewHelpfulVotes.Remove(existingVote);
                liked = false;
            }
            else
            {
                // Chưa like -> Thực hiện Like (Thêm vote)
                var newVote = new ReviewHelpfulVote
                {
                    ReviewId = id,
                    UserId = targetUserId,
                    CreatedAt = DateTime.UtcNow
                };
                _context.ReviewHelpfulVotes.Add(newVote);
                liked = true;
            }

            await _context.SaveChangesAsync();

            // Tính toán lại chính xác số lượt hữu ích từ cơ sở dữ liệu
            int actualHelpfulCount = await _context.ReviewHelpfulVotes.CountAsync(v => v.ReviewId == id);
            review.HelpfulCount = actualHelpfulCount;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = liked ? "Cảm ơn bạn đã ghi nhận đánh giá hữu ích!" : "Đã hủy bỏ thích hữu ích.",
                liked,
                helpfulCount = actualHelpfulCount
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Lỗi khi xử lý hữu ích: {ex.Message}" });
        }
    }

    // POST: api/reviews/{id}/report (Báo cáo đánh giá xấu/spam)
    [HttpPost("{id}/report")]
    public async Task<IActionResult> ReportReview(long id)
    {
        try
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null)
            {
                return NotFound(new { message = $"Không tìm thấy đánh giá có ID = {id}" });
            }

            review.ReportCount += 1;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã gửi báo cáo đánh giá vi phạm đến quản trị viên.", reportCount = review.ReportCount });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Lỗi: {ex.Message}" });
        }
    }
}
