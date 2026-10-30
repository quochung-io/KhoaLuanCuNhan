using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;

namespace Ecc.WebApi.Controllers.Web;

public class ArticleDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Desc { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Tag { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string Image { get; set; } = string.Empty;
    public string CategoryType { get; set; } = "all"; // kitchen, nutrition, vietgap
    public int ReadTimeMinutes { get; set; } = 3;
}

[ApiController]
[Route("api/[controller]")]
[Route("api/news")]
public class ArticlesController : ControllerBase
{
    private static readonly List<ArticleDto> Articles = new()
    {
        new ArticleDto
        {
            Id = 1,
            Title = "5 Bí Quyết Bảo Quản Rau Lá Xanh Tươi Giòn Đến 7 Ngày",
            Desc = "Kỹ thuật sơ chế giữ lạnh và kiểm soát ẩm độ giúp rau ăn lá VietGAP giữ nguyên diệp lục tố và hàm lượng Vitamin C tối đa.",
            Content = "Rau xanh sau khi thu hoạch tại vườn hữu cơ vẫn tiếp tục quá trình hô hấp. Để giữ rau tươi giòn: 1. Tuyệt đối không rửa nước trước khi cất tủ lạnh vì độ ẩm thừa làm vi khuẩn sinh sôi. 2. Loại bỏ lá dập úa ngay khi nhận hàng. 3. Bọc nhẹ bằng giấy hút ẩm hoặc khăn sạch rồi cho vào hộp đựng chuyên dụng hoặc túi zip đục lỗ thông khí. 4. Đặt ở ngăn rau củ tủ lạnh (duy trì 4-7°C). Với cách này, xà lách mỡ, cải bó xôi và cải kale giữ trọn độ giòn đến 7 ngày.",
            Tag = "Mẹo Nhà Bếp",
            Date = "28/10/2026",
            Author = "Kỹ sư Thực phẩm LÀNH Farm",
            Image = "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80",
            CategoryType = "kitchen",
            ReadTimeMinutes = 4
        },
        new ArticleDto
        {
            Id = 2,
            Title = "Dinh Dưỡng Theo Mùa: Vì Sao Nên Chọn Rau Củ Quả Đúng Vụ?",
            Desc = "Nông sản thuận tự nhiên đúng vụ mùa có hàm lượng khoáng chất cao gấp 2 lần, giảm thiểu sâu bệnh và bảo vệ hệ sinh thái đất.",
            Content = "Khi cây trồng được phát triển đúng nhịp sinh học tự nhiên, cây tự tổng hợp các hợp chất thứ sinh (phytonutrients) để kháng sâu bệnh mà không cần can thiệp hóa học. Ví dụ: Cà rốt và bắp cải mùa lạnh tại Đà Lạt tích lũy lượng đường tự nhiên và vitamin A cao hơn hẳn mùa hè; cà chua mùa nắng có nồng độ Lycopene chống oxy hóa vượt trội. Ăn theo mùa còn giúp giảm chi phí bảo quản đông lạnh và hỗ trợ nông dân địa phương tiêu thụ nông sản ổn định.",
            Tag = "Dinh Dưỡng Xanh",
            Date = "25/10/2026",
            Author = "BS. Lê Minh Thảo (Viện Dinh Dưỡng)",
            Image = "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&auto=format&fit=crop&q=80",
            CategoryType = "nutrition",
            ReadTimeMinutes = 5
        },
        new ArticleDto
        {
            Id = 3,
            Title = "Đọc Hiểu Chứng Nhận Nông Sản: VietGAP, GlobalGAP và USDA Khác Gì Nhau?",
            Desc = "Cẩm nang so sánh chi tiết các bộ chỉ tiêu an toàn thực phẩm, kim loại nặng, dư lượng thuốc BVTV và truy xuất nguồn gốc.",
            Content = "VietGAP (Thực hành sản xuất nông nghiệp tốt Việt Nam) đặt trọng tâm vào an toàn thực phẩm, quản lý đất và nước tưới theo TCVN. GlobalGAP bổ sung các tiêu chuẩn khắt khe về phúc lợi người lao động và bảo tồn đa dạng sinh học toàn cầu. USDA Organic (Mỹ) cấm hoàn toàn 100% phân bón vô cơ, hóa chất diệt cỏ, và sinh vật biến đổi gen (Non-GMO) với thời gian cải tạo đất tối thiểu 3 năm. LÀNH Farm liên kết và kiểm định định kỳ từng lô hàng với chứng nhận số hiệu minh bạch.",
            Tag = "Kiến Thức Hữu Cơ",
            Date = "20/10/2026",
            Author = "Ban Đảm Bảo Chất Lượng (QA/QC)",
            Image = "https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=600&auto=format&fit=crop&q=80",
            CategoryType = "vietgap",
            ReadTimeMinutes = 6
        },
        new ArticleDto
        {
            Id = 4,
            Title = "Nhật Ký Canh Tác Hợp Tác Xã Rau Sạch Đơn Dương: Từ Đất Đến Bàn Ăn",
            Desc = "Trải nghiệm mô hình nhà kính tự động hóa cảm biến IoT đo độ ẩm, nhiệt độ và hệ thống tưới nhỏ giọt tiết kiệm nước Isarel.",
            Content = "Tại Đơn Dương (Lâm Đồng), các hộ nông dân thành viên hợp tác xã áp dụng quy trình ghi chép nhật ký điện tử hàng ngày: ngày xuống giống, nguồn gốc phân ủ vi sinh trichoderma, nhật ký tỉa cành và ngày cách ly trước thu hoạch. Mọi thông tin được đồng bộ lên hệ thống Blockchain để người tiêu dùng quét mã QR trên bao bì là thấy trọn vẹn hành trình của mớ rau muống, luống xà lách sạch.",
            Tag = "Kỹ Thuật Canh Tác",
            Date = "15/10/2026",
            Author = "HTX Nông Sản Xanh Đơn Dương",
            Image = "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop&q=80",
            CategoryType = "vietgap",
            ReadTimeMinutes = 5
        }
    };

    [HttpGet]
    public IActionResult GetAll([FromQuery] string? category, [FromQuery] string? search)
    {
        var query = Articles.AsEnumerable();

        if (!string.IsNullOrWhiteSpace(category) && category != "all")
        {
            query = query.Where(a => a.CategoryType.Equals(category, StringComparison.OrdinalIgnoreCase) || a.Tag.Contains(category, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(a => a.Title.ToLower().Contains(s) || a.Desc.ToLower().Contains(s));
        }

        return Ok(query.ToList());
    }

    [HttpGet("{id}")]
    public IActionResult GetById(int id)
    {
        var item = Articles.FirstOrDefault(a => a.Id == id);
        if (item == null) return NotFound(new { message = "Không tìm thấy bài viết!" });
        return Ok(item);
    }
}
