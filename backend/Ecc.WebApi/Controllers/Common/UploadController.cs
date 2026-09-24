using Microsoft.AspNetCore.Mvc;

namespace Ecc.WebApi.Controllers.Common;

[ApiController]
[Route("api/[controller]")]
public class UploadController : ControllerBase
{
    private readonly IWebHostEnvironment _env;

    public UploadController(IWebHostEnvironment env)
    {
        _env = env;
    }

    /// <summary>
    /// Upload nhiều tệp hình ảnh / tài liệu chứng nhận cùng lúc
    /// </summary>
    [HttpPost("images")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadMultipleImages([FromForm] List<IFormFile> files)
    {
        if (files == null || files.Count == 0)
        {
            return BadRequest(new { message = "Vui lòng chọn ít nhất một tệp để tải lên!" });
        }

        var allowedExtensions = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            ".jpg", ".jpeg", ".png", ".webp", ".gif", ".pdf"
        };

        const long maxFileSize = 15 * 1024 * 1024; // 15MB

        var uploadsFolder = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads");
        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        var uploadedResults = new List<object>();
        var urls = new List<string>();

        foreach (var file in files)
        {
            if (file.Length == 0) continue;

            if (file.Length > maxFileSize)
            {
                return BadRequest(new { message = $"Tệp '{file.FileName}' vượt quá dung lượng tối đa cho phép (15MB)!" });
            }

            var extension = Path.GetExtension(file.FileName);
            if (string.IsNullOrEmpty(extension) || !allowedExtensions.Contains(extension))
            {
                return BadRequest(new { message = $"Tệp '{file.FileName}' có định dạng không được hỗ trợ! Vui lòng chỉ tải ảnh (.jpg, .png, .webp) hoặc tài liệu PDF." });
            }

            // Tạo tên file duy nhất tránh trùng lặp
            var safeOriginalName = Path.GetFileNameWithoutExtension(file.FileName)
                .Replace(" ", "_")
                .Replace("-", "_");
            if (safeOriginalName.Length > 30) safeOriginalName = safeOriginalName.Substring(0, 30);

            var uniqueFileName = $"{DateTime.UtcNow:yyyyMMdd_HHmmss}_{Guid.NewGuid().ToString("N").Substring(0, 8)}_{safeOriginalName}{extension}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var relativeUrl = $"/uploads/{uniqueFileName}";
            var fullUrl = $"{Request.Scheme}://{Request.Host}{relativeUrl}";

            urls.Add(relativeUrl);
            uploadedResults.Add(new
            {
                originalName = file.FileName,
                fileName = uniqueFileName,
                url = relativeUrl,
                fullUrl = fullUrl,
                size = file.Length,
                contentType = file.ContentType
            });
        }

        return Ok(new
        {
            message = $"Tải lên thành công {uploadedResults.Count} tệp!",
            urls = urls,
            files = uploadedResults
        });
    }

    /// <summary>
    /// Upload 1 tệp hình ảnh đơn lẻ
    /// </summary>
    [HttpPost("single")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadSingleImage([FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "Vui lòng chọn tệp để tải lên!" });
        }

        return await UploadMultipleImages(new List<IFormFile> { file });
    }
}
