using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ecc.Infrastructure.Data;
using Ecc.Infrastructure.Entities;
using System.Text;
using System.Globalization;
using System.Text.RegularExpressions;

namespace Ecc.WebApi.Controllers;

[ApiController]
[Route("api/reports/products")]
public class ProductReportsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<ProductReportsController> _logger;

    public ProductReportsController(AppDbContext context, ILogger<ProductReportsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // Helper: Tính toán khoảng thời gian hiện tại và kỳ trước để so sánh tăng trưởng
    private (DateTime currentStart, DateTime currentEnd, DateTime prevStart, DateTime prevEnd, string label) ResolveDateRanges(
        string? timeRange, DateTime? startDate, DateTime? endDate)
    {
        var now = DateTime.Now;
        var today = now.Date;
        DateTime cStart, cEnd, pStart, pEnd;
        string rangeLabel = "Khoảng thời gian tùy chọn";

        switch (timeRange?.ToLower())
        {
            case "today":
                cStart = today;
                cEnd = today.AddDays(1).AddTicks(-1);
                pStart = today.AddDays(-1);
                pEnd = today.AddTicks(-1);
                rangeLabel = $"Hôm nay ({today:dd/MM/yyyy})";
                break;

            case "yesterday":
                cStart = today.AddDays(-1);
                cEnd = today.AddTicks(-1);
                pStart = today.AddDays(-2);
                pEnd = today.AddDays(-1).AddTicks(-1);
                rangeLabel = $"Hôm qua ({cStart:dd/MM/yyyy})";
                break;

            case "last7days":
                cStart = today.AddDays(-6);
                cEnd = today.AddDays(1).AddTicks(-1);
                pStart = cStart.AddDays(-7);
                pEnd = cStart.AddTicks(-1);
                rangeLabel = $"7 ngày qua ({cStart:dd/MM} - {cEnd:dd/MM/yyyy})";
                break;

            case "last30days":
                cStart = today.AddDays(-29);
                cEnd = today.AddDays(1).AddTicks(-1);
                pStart = cStart.AddDays(-30);
                pEnd = cStart.AddTicks(-1);
                rangeLabel = $"30 ngày qua ({cStart:dd/MM} - {cEnd:dd/MM/yyyy})";
                break;

            case "thismonth":
                cStart = new DateTime(today.Year, today.Month, 1);
                cEnd = cStart.AddMonths(1).AddTicks(-1);
                pStart = cStart.AddMonths(-1);
                pEnd = cStart.AddTicks(-1);
                rangeLabel = $"Tháng này (Tháng {today.Month}/{today.Year})";
                break;

            case "lastmonth":
                var lastMonthDate = today.AddMonths(-1);
                cStart = new DateTime(lastMonthDate.Year, lastMonthDate.Month, 1);
                cEnd = cStart.AddMonths(1).AddTicks(-1);
                pStart = cStart.AddMonths(-1);
                pEnd = cStart.AddTicks(-1);
                rangeLabel = $"Tháng trước (Tháng {cStart.Month}/{cStart.Year})";
                break;

            case "thisyear":
                cStart = new DateTime(today.Year, 1, 1);
                cEnd = new DateTime(today.Year + 1, 1, 1).AddTicks(-1);
                pStart = new DateTime(today.Year - 1, 1, 1);
                pEnd = cStart.AddTicks(-1);
                rangeLabel = $"Năm nay (Năm {today.Year})";
                break;

            default:
                if (startDate.HasValue && endDate.HasValue)
                {
                    cStart = startDate.Value.Date;
                    cEnd = endDate.Value.Date.AddDays(1).AddTicks(-1);
                    var duration = cEnd - cStart;
                    pEnd = cStart.AddTicks(-1);
                    pStart = pEnd - duration;
                    rangeLabel = $"{cStart:dd/MM/yyyy} - {cEnd:dd/MM/yyyy}";
                }
                else if (startDate.HasValue)
                {
                    cStart = startDate.Value.Date;
                    cEnd = today.AddDays(1).AddTicks(-1);
                    var duration = cEnd - cStart;
                    pEnd = cStart.AddTicks(-1);
                    pStart = pEnd - duration;
                    rangeLabel = $"Từ {cStart:dd/MM/yyyy}";
                }
                else
                {
                    // Mặc định: Tháng này
                    cStart = new DateTime(today.Year, today.Month, 1);
                    cEnd = cStart.AddMonths(1).AddTicks(-1);
                    pStart = cStart.AddMonths(-1);
                    pEnd = cStart.AddTicks(-1);
                    rangeLabel = $"Tháng này (Tháng {today.Month}/{today.Year})";
                }
                break;
        }

        return (cStart, cEnd, pStart, pEnd, rangeLabel);
    }

    // GET: api/reports/products
    [HttpGet]
    public async Task<IActionResult> GetProductReport(
        [FromQuery] string? timeRange = "thisMonth",
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] int? categoryId = null,
        [FromQuery] long? supplierId = null,
        [FromQuery] string? status = null,
        [FromQuery] string? stockStatus = null,
        [FromQuery] string? performance = null,
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? sortBy = "revenue",
        [FromQuery] string? sortOrder = "desc")
    {
        try
        {
            var (cStart, cEnd, pStart, pEnd, rangeLabel) = ResolveDateRanges(timeRange, startDate, endDate);

            // 1. Lấy danh sách tồn kho hiện tại theo từng sản phẩm từ các lô hàng (Batches)
            var today = DateTime.Today;
            var batches = await _context.ProductBatches
                .Where(b => b.ExpiryDate >= today && (b.Status == "Active" || string.IsNullOrEmpty(b.Status)))
                .GroupBy(b => b.ProductId)
                .Select(g => new
                {
                    ProductId = g.Key,
                    Stock = g.Sum(b => b.InitialQuantity),
                    BatchesCount = g.Count()
                })
                .ToDictionaryAsync(b => b.ProductId);

            // 2. Lấy dữ liệu bán hàng trong KỲ HIỆN TẠI (loại trừ đơn hàng Cancelled và Returned)
            var currentOrderItems = await _context.OrderItems
                .Include(oi => oi.Order)
                .Where(oi => oi.Order != null 
                          && oi.Order.CreatedAt >= cStart 
                          && oi.Order.CreatedAt <= cEnd
                          && oi.Order.OrderStatus != "Cancelled" 
                          && oi.Order.OrderStatus != "Returned")
                .GroupBy(oi => oi.ProductId)
                .Select(g => new
                {
                    ProductId = g.Key,
                    SoldQuantity = g.Sum(oi => oi.Quantity),
                    TotalRevenue = g.Sum(oi => oi.TotalAmount),
                    OrdersCount = g.Select(oi => oi.OrderId).Distinct().Count()
                })
                .ToDictionaryAsync(x => x.ProductId);

            // 3. Lấy dữ liệu bán hàng KỲ TRƯỚC (để tính tăng trưởng)
            var prevOrderItems = await _context.OrderItems
                .Include(oi => oi.Order)
                .Where(oi => oi.Order != null 
                          && oi.Order.CreatedAt >= pStart 
                          && oi.Order.CreatedAt <= pEnd
                          && oi.Order.OrderStatus != "Cancelled" 
                          && oi.Order.OrderStatus != "Returned")
                .GroupBy(oi => oi.ProductId)
                .Select(g => new
                {
                    ProductId = g.Key,
                    SoldQuantity = g.Sum(oi => oi.Quantity),
                    TotalRevenue = g.Sum(oi => oi.TotalAmount)
                })
                .ToDictionaryAsync(x => x.ProductId);

            // 4. Lấy thống kê đơn hàng Hoàn trả / Hủy trong kỳ hiện tại (Quản lý Hoàn kho)
            var returnedOrders = await _context.Orders
                .Include(o => o.OrderItems)
                .Where(o => o.CreatedAt >= cStart && o.CreatedAt <= cEnd && (o.OrderStatus == "Cancelled" || o.OrderStatus == "Returned"))
                .ToListAsync();

            int returnedOrdersCount = returnedOrders.Count;
            decimal returnedRevenue = returnedOrders.Sum(o => o.TotalAmount);
            decimal returnedQuantity = returnedOrders.SelectMany(o => o.OrderItems).Sum(oi => oi.Quantity);

            // 5. Query sản phẩm và áp dụng bộ lọc (Category, Supplier, Status)
            var productsQuery = _context.Products
                .Include(p => p.Category)
                .AsQueryable();

            if (categoryId.HasValue && categoryId.Value > 0)
            {
                productsQuery = productsQuery.Where(p => p.CategoryId == categoryId.Value);
            }

            if (supplierId.HasValue && supplierId.Value > 0)
            {
                productsQuery = productsQuery.Where(p => p.SupplierId == supplierId.Value);
            }

            if (!string.IsNullOrWhiteSpace(status) && status.ToLower() != "all")
            {
                productsQuery = productsQuery.Where(p => p.Status == status);
            }

            var allProductsList = await productsQuery.ToListAsync();

            // Lấy từ điển Nhà cung cấp để hiển thị tên chuẩn
            var suppliers = await _context.Suppliers.ToDictionaryAsync(s => s.SupplierId, s => s.SupplierName);
            var users = await _context.Users.ToDictionaryAsync(u => u.UserId, u => u.FullName);

            // 6. Map dữ liệu hoàn chỉnh cho từng sản phẩm
            var productReports = allProductsList.Select(p =>
            {
                string sku = $"SKU-PRD-{p.ProductId:D5}";
                decimal stock = batches.TryGetValue(p.ProductId, out var bInfo) ? bInfo.Stock : 0;
                int bCount = bInfo != null ? bInfo.BatchesCount : 0;

                decimal soldQty = currentOrderItems.TryGetValue(p.ProductId, out var curr) ? curr.SoldQuantity : 0;
                decimal revenue = curr != null ? curr.TotalRevenue : 0;
                int ordCount = curr != null ? curr.OrdersCount : 0;

                decimal prevSold = prevOrderItems.TryGetValue(p.ProductId, out var prev) ? prev.SoldQuantity : 0;
                decimal prevRev = prev != null ? prev.TotalRevenue : 0;

                decimal growthRev = prevRev > 0 ? Math.Round(((revenue - prevRev) / prevRev) * 100, 1) : (revenue > 0 ? 100 : 0);
                decimal growthQty = prevSold > 0 ? Math.Round(((soldQty - prevSold) / prevSold) * 100, 1) : (soldQty > 0 ? 100 : 0);

                string stockStatus = stock <= 0 ? "OutOfStock" : (stock <= 20 ? "LowStock" : "InStock");

                // Tìm tên nhà cung cấp từ bảng Suppliers hoặc Users
                string supplierName = "Hợp tác xã Nông sản Việt";
                if (suppliers.TryGetValue(p.SupplierId, out var sName) && !string.IsNullOrWhiteSpace(sName))
                {
                    supplierName = sName;
                }
                else if (users.TryGetValue(p.SupplierId, out var uName) && !string.IsNullOrWhiteSpace(uName))
                {
                    supplierName = uName;
                }

                return new ProductReportItemDto
                {
                    ProductId = p.ProductId,
                    Sku = sku,
                    ProductName = p.ProductName,
                    CategoryId = p.CategoryId,
                    CategoryName = p.Category?.CategoryName ?? "Chưa phân loại",
                    SupplierId = p.SupplierId,
                    SupplierName = supplierName,
                    Unit = p.Unit,
                    Price = p.Price,
                    Status = p.Status ?? "Active",
                    CurrentStock = stock,
                    BatchesCount = bCount,
                    StockStatus = stockStatus,
                    SoldQuantity = soldQty,
                    TotalRevenue = revenue,
                    OrdersCount = ordCount,
                    RevenueGrowthRate = growthRev,
                    SoldQuantityGrowthRate = growthQty
                };
            }).ToList();

            // 7. Lọc tìm kiếm theo TẤT CẢ các thành phần: ID (hỗ trợ #, ID:, ID), SKU, Tên, Danh mục, Nhà cung cấp (Không phân biệt HOA/thường, hỗ trợ tiếng Việt có/không dấu)
            if (!string.IsNullOrWhiteSpace(search))
            {
                var rawSearch = search.Trim();
                var sLower = rawSearch.ToLower();
                var sNorm = NormalizeSearchText(rawSearch);
                var cleanIdStr = Regex.Replace(sLower, @"^(#|id\s*:?\s*|sp\s*:?\s*|mã\s*:?\s*)", "").Trim();
                long.TryParse(cleanIdStr, out var parsedId);

                productReports = productReports.Where(p => 
                {
                    // 1. Khớp chính xác ID (Ví dụ: "10", "#10", "id: 10", "id 10", "sp 10")
                    if (parsedId > 0 && p.ProductId == parsedId) return true;

                    // 2. Khớp ID chuỗi và có tiền tố '#'
                    var pIdStr = p.ProductId.ToString();
                    if ($"#{pIdStr}".Contains(sLower)) return true;
                    if (pIdStr == sLower) return true;
                    if (!string.IsNullOrEmpty(cleanIdStr) && pIdStr.Contains(cleanIdStr)) return true;

                    // 3. Khớp SKU
                    if (p.Sku.ToLower().Contains(sLower)) return true;

                    // 4. Khớp Tên sản phẩm, Danh mục, Nhà cung cấp (Không phân biệt HOA/thường, hỗ trợ cả tiếng Việt không dấu)
                    if (p.ProductName.ToLower().Contains(sLower)) return true;
                    if (NormalizeSearchText(p.ProductName).Contains(sNorm)) return true;

                    if (p.CategoryName.ToLower().Contains(sLower)) return true;
                    if (NormalizeSearchText(p.CategoryName).Contains(sNorm)) return true;

                    if (p.SupplierName.ToLower().Contains(sLower)) return true;
                    if (NormalizeSearchText(p.SupplierName).Contains(sNorm)) return true;

                    if (p.Unit.ToLower().Contains(sLower)) return true;
                    if (p.Price.ToString().Contains(sLower)) return true;
                    if (p.Status.ToLower().Contains(sLower)) return true;

                    return false;
                }).ToList();
            }

            // 7.1 Lọc theo Trạng thái tồn kho (InStock, LowStock, OutOfStock)
            if (!string.IsNullOrWhiteSpace(stockStatus) && stockStatus.ToUpper() != "ALL")
            {
                productReports = productReports.Where(p => p.StockStatus.Equals(stockStatus, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            // 7.2 Lọc theo Hiệu suất bán hàng trong kỳ (hasSales: Đã bán > 0, noSales: Chưa bán = 0, positiveGrowth, negativeGrowth)
            if (!string.IsNullOrWhiteSpace(performance) && performance.ToLower() != "all")
            {
                switch (performance.ToLower())
                {
                    case "hassales":
                        productReports = productReports.Where(p => p.SoldQuantity > 0).ToList();
                        break;
                    case "nosales":
                        productReports = productReports.Where(p => p.SoldQuantity == 0).ToList();
                        break;
                    case "positivegrowth":
                        productReports = productReports.Where(p => p.RevenueGrowthRate > 0).ToList();
                        break;
                    case "negativegrowth":
                        productReports = productReports.Where(p => p.RevenueGrowthRate < 0).ToList();
                        break;
                }
            }

            // 8. Thống kê tổng hợp (KPI Cards)
            decimal totalRevenue = productReports.Sum(p => p.TotalRevenue);
            decimal prevTotalRevenue = prevOrderItems.Values.Sum(x => x.TotalRevenue);
            decimal totalSoldQuantity = productReports.Sum(p => p.SoldQuantity);
            decimal prevTotalSoldQuantity = prevOrderItems.Values.Sum(x => x.SoldQuantity);
            decimal totalStock = productReports.Sum(p => p.CurrentStock);

            decimal totalRevenueGrowth = prevTotalRevenue > 0 
                ? Math.Round(((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100, 1) 

                : (totalRevenue > 0 ? 100 : 0);

            decimal totalSoldGrowth = prevTotalSoldQuantity > 0 
                ? Math.Round(((totalSoldQuantity - prevTotalSoldQuantity) / prevTotalSoldQuantity) * 100, 1) 
                : (totalSoldQuantity > 0 ? 100 : 0);

            // 9. Top 5 sản phẩm bán chạy nhất & Top 5 doanh thu cao nhất
            var topSelling = productReports
                .Where(p => p.SoldQuantity > 0)
                .OrderByDescending(p => p.SoldQuantity)
                .Take(5)
                .Select(p => new { p.ProductId, p.Sku, p.ProductName, p.CategoryName, p.SoldQuantity, p.TotalRevenue, p.Unit })
                .ToList();

            var topRevenue = productReports
                .Where(p => p.TotalRevenue > 0)
                .OrderByDescending(p => p.TotalRevenue)
                .Take(5)
                .Select(p => new { p.ProductId, p.Sku, p.ProductName, p.CategoryName, p.TotalRevenue, p.SoldQuantity, p.Unit })
                .ToList();

            // 10. Phân bổ theo Danh mục & Trạng thái tồn kho cho biểu đồ Donut/Pie/Radar
            var categoryDistribution = productReports
                .GroupBy(p => p.CategoryName)
                .Select(g => new
                {
                    name = g.Key,
                    revenue = g.Sum(p => p.TotalRevenue),
                    soldQuantity = g.Sum(p => p.SoldQuantity),
                    stock = g.Sum(p => p.CurrentStock),
                    productsCount = g.Count()
                })
                .OrderByDescending(c => c.revenue)
                .ToList();

            var stockStatusDistribution = new[]
            {
                new { status = "Còn hàng", code = "InStock", count = productReports.Count(p => p.StockStatus == "InStock"), color = "#52C41A" },
                new { status = "Sắp hết hàng", code = "LowStock", count = productReports.Count(p => p.StockStatus == "LowStock"), color = "#FA8C16" },
                new { status = "Hết hàng", code = "OutOfStock", count = productReports.Count(p => p.StockStatus == "OutOfStock"), color = "#FF4D4F" },
            };

            // 11. Dữ liệu xu hướng theo thời gian (Trend Timeline)
            var currentOrdersForTrend = await _context.Orders
                .Include(o => o.OrderItems)
                .Where(o => o.CreatedAt >= cStart 
                         && o.CreatedAt <= cEnd 
                         && o.OrderStatus != "Cancelled" 
                         && o.OrderStatus != "Returned")
                .ToListAsync();

            var trendData = new List<object>();
            int totalDays = (int)Math.Max(1, Math.Ceiling((cEnd - cStart).TotalDays));

            if (totalDays <= 31)
            {
                // Nhóm theo từng ngày
                for (var d = cStart.Date; d <= cEnd.Date; d = d.AddDays(1))
                {
                    var dayOrders = currentOrdersForTrend.Where(o => o.CreatedAt.HasValue && o.CreatedAt.Value.Date == d).ToList();
                    trendData.Add(new
                    {
                        date = d.ToString("dd/MM"),
                        fullDate = d.ToString("yyyy-MM-dd"),
                        revenue = dayOrders.Sum(o => o.TotalAmount),
                        quantity = dayOrders.SelectMany(o => o.OrderItems).Sum(oi => oi.Quantity),
                        orders = dayOrders.Count
                    });
                }
            }
            else
            {
                // Nhóm theo tuần/tháng nếu khoảng thời gian dài hơn
                var grouped = currentOrdersForTrend
                    .Where(o => o.CreatedAt.HasValue)
                    .GroupBy(o => new { o.CreatedAt!.Value.Year, o.CreatedAt!.Value.Month })
                    .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
                    .Select(g => new
                    {
                        date = $"T{g.Key.Month}/{g.Key.Year}",
                        fullDate = $"{g.Key.Year}-{g.Key.Month:D2}",
                        revenue = g.Sum(o => o.TotalAmount),
                        quantity = g.SelectMany(o => o.OrderItems).Sum(oi => oi.Quantity),
                        orders = g.Count()
                    })
                    .ToList();
                trendData.AddRange(grouped);
            }

            // 11. Sắp xếp danh sách
            var isAsc = string.Equals(sortOrder, "asc", StringComparison.OrdinalIgnoreCase);
            var sortedList = sortBy?.ToLower() switch
            {
                "productid" or "id" => isAsc ? productReports.OrderBy(p => p.ProductId) : productReports.OrderByDescending(p => p.ProductId),
                "productname" or "name" => isAsc ? productReports.OrderBy(p => p.ProductName) : productReports.OrderByDescending(p => p.ProductName),
                "sku" => isAsc ? productReports.OrderBy(p => p.Sku) : productReports.OrderByDescending(p => p.Sku),
                "suppliername" or "supplier" => isAsc ? productReports.OrderBy(p => p.SupplierName) : productReports.OrderByDescending(p => p.SupplierName),
                "categoryname" or "category" => isAsc ? productReports.OrderBy(p => p.CategoryName) : productReports.OrderByDescending(p => p.CategoryName),
                "soldquantity" or "sold" => isAsc ? productReports.OrderBy(p => p.SoldQuantity) : productReports.OrderByDescending(p => p.SoldQuantity),
                "currentstock" or "stock" => isAsc ? productReports.OrderBy(p => p.CurrentStock) : productReports.OrderByDescending(p => p.CurrentStock),
                "price" => isAsc ? productReports.OrderBy(p => p.Price) : productReports.OrderByDescending(p => p.Price),
                "status" => isAsc ? productReports.OrderBy(p => p.Status) : productReports.OrderByDescending(p => p.Status),
                _ => isAsc ? productReports.OrderBy(p => p.TotalRevenue) : productReports.OrderByDescending(p => p.TotalRevenue)
            };

            // 12. Phân trang dữ liệu
            int totalItems = productReports.Count;
            int validPageSize = pageSize > 0 ? pageSize : 10;
            int totalPages = (int)Math.Ceiling((double)totalItems / validPageSize);
            int validPage = Math.Max(1, Math.Min(page, totalPages > 0 ? totalPages : 1));

            var pagedItems = sortedList.Skip((validPage - 1) * validPageSize).Take(validPageSize).ToList();

            return Ok(new
            {
                period = new
                {
                    timeRange,
                    label = rangeLabel,
                    startDate = cStart,
                    endDate = cEnd,
                    prevStartDate = pStart,
                    prevEndDate = pEnd
                },
                summary = new
                {
                    totalRevenue,
                    prevTotalRevenue,
                    revenueGrowthRate = totalRevenueGrowth,
                    totalSoldQuantity,
                    prevTotalSoldQuantity,
                    soldQuantityGrowthRate = totalSoldGrowth,
                    totalStock,
                    returnedOrdersCount,
                    returnedRevenue,
                    returnedQuantity,
                    totalProductsCount = allProductsList.Count
                },
                topSelling,
                topRevenue,
                trend = trendData,
                categoryDistribution,
                stockStatusDistribution,
                pagination = new
                {
                    page = validPage,
                    pageSize = validPageSize,
                    totalItems,
                    totalPages
                },
                items = pagedItems
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi tạo báo cáo thống kê sản phẩm.");
            return StatusCode(500, new { message = $"Lỗi khi tải báo cáo: {ex.Message}" });
        }
    }

    // GET: api/reports/products/export - Xuất toàn bộ báo cáo CSV UTF-8 có BOM
    [HttpGet("export")]
    public async Task<IActionResult> ExportProductReport(
        [FromQuery] string? timeRange = "thisMonth",
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] int? categoryId = null,
        [FromQuery] long? supplierId = null,
        [FromQuery] string? status = null,
        [FromQuery] string? stockStatus = null,
        [FromQuery] string? performance = null,
        [FromQuery] string? search = null)
    {
        try
        {
            var (cStart, cEnd, _, _, rangeLabel) = ResolveDateRanges(timeRange, startDate, endDate);

            var today = DateTime.Today;
            var batches = await _context.ProductBatches
                .Where(b => b.ExpiryDate >= today && (b.Status == "Active" || string.IsNullOrEmpty(b.Status)))
                .GroupBy(b => b.ProductId)
                .Select(g => new { ProductId = g.Key, Stock = g.Sum(b => b.InitialQuantity) })
                .ToDictionaryAsync(b => b.ProductId, b => b.Stock);

            var currentOrderItems = await _context.OrderItems
                .Include(oi => oi.Order)
                .Where(oi => oi.Order != null 
                          && oi.Order.CreatedAt >= cStart 
                          && oi.Order.CreatedAt <= cEnd
                          && oi.Order.OrderStatus != "Cancelled" 
                          && oi.Order.OrderStatus != "Returned")
                .GroupBy(oi => oi.ProductId)
                .Select(g => new
                {
                    ProductId = g.Key,
                    SoldQuantity = g.Sum(oi => oi.Quantity),
                    TotalRevenue = g.Sum(oi => oi.TotalAmount)
                })
                .ToDictionaryAsync(x => x.ProductId);

            var query = _context.Products.Include(p => p.Category).AsQueryable();

            if (categoryId.HasValue && categoryId.Value > 0)
                query = query.Where(p => p.CategoryId == categoryId.Value);

            if (supplierId.HasValue && supplierId.Value > 0)
                query = query.Where(p => p.SupplierId == supplierId.Value);

            if (!string.IsNullOrWhiteSpace(status) && status.ToLower() != "all")
                query = query.Where(p => p.Status == status);

            var products = await query.ToListAsync();
            var suppliers = await _context.Suppliers.ToDictionaryAsync(s => s.SupplierId, s => s.SupplierName);
            var users = await _context.Users.ToDictionaryAsync(u => u.UserId, u => u.FullName);

            var reports = products.Select(p =>
            {
                string supplierName = "Hợp tác xã Nông sản Việt";
                if (suppliers.TryGetValue(p.SupplierId, out var sName) && !string.IsNullOrWhiteSpace(sName))
                {
                    supplierName = sName;
                }
                else if (users.TryGetValue(p.SupplierId, out var uName) && !string.IsNullOrWhiteSpace(uName))
                {
                    supplierName = uName;
                }

                return new
                {
                    p.ProductId,
                    Sku = $"SKU-PRD-{p.ProductId:D5}",
                    p.ProductName,
                    Category = p.Category?.CategoryName ?? "N/A",
                    Supplier = supplierName,
                    p.Price,
                    p.Unit,
                    CurrentStock = batches.TryGetValue(p.ProductId, out var stock) ? stock : 0,
                    SoldQuantity = currentOrderItems.TryGetValue(p.ProductId, out var oi) ? oi.SoldQuantity : 0,
                    TotalRevenue = oi != null ? oi.TotalRevenue : 0,
                    Status = p.Status ?? "Active"
                };
            });

            if (!string.IsNullOrWhiteSpace(search))
            {
                var rawSearch = search.Trim();
                var sLower = rawSearch.ToLower();
                var sNorm = NormalizeSearchText(rawSearch);
                var cleanIdStr = Regex.Replace(sLower, @"^(#|id\s*:?\s*|sp\s*:?\s*|mã\s*:?\s*)", "").Trim();
                long.TryParse(cleanIdStr, out var parsedId);

                reports = reports.Where(p => 
                {
                    if (parsedId > 0 && p.ProductId == parsedId) return true;
                    var pIdStr = p.ProductId.ToString();
                    if ($"#{pIdStr}".Contains(sLower)) return true;
                    if (pIdStr == sLower) return true;
                    if (!string.IsNullOrEmpty(cleanIdStr) && pIdStr.Contains(cleanIdStr)) return true;

                    if (p.Sku.ToLower().Contains(sLower)) return true;
                    if (p.ProductName.ToLower().Contains(sLower)) return true;
                    if (NormalizeSearchText(p.ProductName).Contains(sNorm)) return true;

                    if (p.Category.ToLower().Contains(sLower)) return true;
                    if (NormalizeSearchText(p.Category).Contains(sNorm)) return true;

                    if (p.Supplier.ToLower().Contains(sLower)) return true;
                    if (NormalizeSearchText(p.Supplier).Contains(sNorm)) return true;

                    if (p.Unit.ToLower().Contains(sLower)) return true;
                    if (p.Price.ToString().Contains(sLower)) return true;
                    if (p.Status.ToLower().Contains(sLower)) return true;

                    return false;
                });
            }

            if (!string.IsNullOrWhiteSpace(stockStatus) && stockStatus.ToUpper() != "ALL")
            {
                if (stockStatus.Equals("InStock", StringComparison.OrdinalIgnoreCase))
                    reports = reports.Where(p => p.CurrentStock > 20);
                else if (stockStatus.Equals("LowStock", StringComparison.OrdinalIgnoreCase))
                    reports = reports.Where(p => p.CurrentStock > 0 && p.CurrentStock <= 20);
                else if (stockStatus.Equals("OutOfStock", StringComparison.OrdinalIgnoreCase))
                    reports = reports.Where(p => p.CurrentStock <= 0);
            }

            if (!string.IsNullOrWhiteSpace(performance) && performance.ToLower() != "all")
            {
                if (performance.Equals("hasSales", StringComparison.OrdinalIgnoreCase))
                    reports = reports.Where(p => p.SoldQuantity > 0);
                else if (performance.Equals("noSales", StringComparison.OrdinalIgnoreCase))
                    reports = reports.Where(p => p.SoldQuantity == 0);
            }

            var csvBuilder = new StringBuilder();
            // Thêm Header CSV
            csvBuilder.AppendLine("Mã ID,Mã SKU,Tên Sản Phẩm,Danh Mục,Nhà Cung Cấp,Đơn Giá (VNĐ),Đơn Vị,Tồn Kho Hiện Tại,Số Lượng Đã Bán,Doanh Thu (VNĐ),Trạng Thái");

            foreach (var item in reports)
            {
                string safeName = $"\"{item.ProductName.Replace("\"", "\"\"")}\"";
                string safeCat = $"\"{item.Category.Replace("\"", "\"\"")}\"";
                string safeSup = $"\"{item.Supplier.Replace("\"", "\"\"")}\"";
                csvBuilder.AppendLine($"{item.ProductId},{item.Sku},{safeName},{safeCat},{safeSup},{item.Price},{item.Unit},{item.CurrentStock},{item.SoldQuantity},{item.TotalRevenue},{item.Status}");
            }

            // UTF-8 with BOM to open properly in Excel
            var preamble = Encoding.UTF8.GetPreamble();
            var csvBytes = Encoding.UTF8.GetBytes(csvBuilder.ToString());
            var finalBytes = new byte[preamble.Length + csvBytes.Length];
            Buffer.BlockCopy(preamble, 0, finalBytes, 0, preamble.Length);
            Buffer.BlockCopy(csvBytes, 0, finalBytes, preamble.Length, csvBytes.Length);

            var fileName = $"BaoCao_SanPhan_TonKho_{DateTime.Now:yyyyMMdd_HHmmss}.csv";
            return File(finalBytes, "text/csv; charset=utf-8", fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi xuất file báo cáo.");
            return StatusCode(500, new { message = $"Lỗi khi xuất file: {ex.Message}" });
        }
    }

    // ── DRILLDOWN 1: CHI TIẾT DOANH THU ──
    [HttpGet("drilldown/revenue")]
    public async Task<IActionResult> GetRevenueDrilldown(
        [FromQuery] string? timeRange = "thisMonth",
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var (cStart, cEnd, _, _, label) = ResolveDateRanges(timeRange, startDate, endDate);

            var orders = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .Where(o => o.CreatedAt >= cStart 
                         && o.CreatedAt <= cEnd 
                         && o.OrderStatus != "Cancelled" 
                         && o.OrderStatus != "Returned")
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            var list = orders.Select(o => new
            {
                orderId = o.OrderId,
                orderCode = o.OrderCode,
                customerName = o.Customer?.FullName ?? "Khách lẻ",
                customerPhone = o.Customer?.Phone ?? "",
                paymentMethod = o.PaymentMethod,
                paymentStatus = o.PaymentStatus,
                orderStatus = o.OrderStatus,
                totalAmount = o.TotalAmount,
                subtotal = o.Subtotal,
                shippingFee = o.ShippingFee,
                discountAmount = o.DiscountAmount,
                createdAt = o.CreatedAt,
                itemsCount = o.OrderItems.Count,
                items = o.OrderItems.Select(i => new
                {
                    productId = i.ProductId,
                    sku = $"SKU-PRD-{i.ProductId:D5}",
                    productName = i.Product?.ProductName ?? "Sản phẩm",
                    quantity = i.Quantity,
                    unitPrice = i.UnitPrice,
                    totalAmount = i.TotalAmount,
                    unit = i.Product?.Unit ?? "kg"
                }).ToList()
            }).ToList();

            decimal totalRevenue = list.Sum(o => o.totalAmount);
            int totalOrders = list.Count;
            decimal aov = totalOrders > 0 ? Math.Round(totalRevenue / totalOrders, 0) : 0;

            return Ok(new
            {
                periodLabel = label,
                totalRevenue,
                totalOrders,
                averageOrderValue = aov,
                orders = list
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy chi tiết doanh thu.");
            return StatusCode(500, new { message = $"Lỗi: {ex.Message}" });
        }
    }

    // ── DRILLDOWN 2: CHI TIẾT SẢN LƯỢNG BÁN ──
    [HttpGet("drilldown/sold")]
    public async Task<IActionResult> GetSoldProductsDrilldown(
        [FromQuery] string? timeRange = "thisMonth",
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var (cStart, cEnd, _, _, label) = ResolveDateRanges(timeRange, startDate, endDate);

            var today = DateTime.Today;
            var batches = await _context.ProductBatches
                .Where(b => b.ExpiryDate >= today && (b.Status == "Active" || string.IsNullOrEmpty(b.Status)))
                .GroupBy(b => b.ProductId)
                .Select(g => new { ProductId = g.Key, Stock = g.Sum(b => b.InitialQuantity) })
                .ToDictionaryAsync(b => b.ProductId, b => b.Stock);

            var soldItems = await _context.OrderItems
                .Include(oi => oi.Order)
                .Include(oi => oi.Product)
                    .ThenInclude(p => p.Category)
                .Where(oi => oi.Order != null 
                          && oi.Order.CreatedAt >= cStart 
                          && oi.Order.CreatedAt <= cEnd 
                          && oi.Order.OrderStatus != "Cancelled" 
                          && oi.Order.OrderStatus != "Returned")
                .GroupBy(oi => new { oi.ProductId, oi.Product!.ProductName, oi.Product.Unit, oi.Product.Price, CategoryName = oi.Product.Category != null ? oi.Product.Category.CategoryName : "Chưa phân loại" })
                .Select(g => new
                {
                    productId = g.Key.ProductId,
                    sku = $"SKU-PRD-{g.Key.ProductId:D5}",
                    productName = g.Key.ProductName,
                    categoryName = g.Key.CategoryName,
                    unit = g.Key.Unit,
                    price = g.Key.Price,
                    soldQuantity = g.Sum(i => i.Quantity),
                    totalRevenue = g.Sum(i => i.TotalAmount),
                    ordersCount = g.Select(i => i.OrderId).Distinct().Count(),
                    currentStock = batches.ContainsKey(g.Key.ProductId) ? batches[g.Key.ProductId] : 0
                })
                .OrderByDescending(x => x.soldQuantity)
                .ToListAsync();

            decimal totalSold = soldItems.Sum(x => x.soldQuantity);
            decimal totalRev = soldItems.Sum(x => x.totalRevenue);

            return Ok(new
            {
                periodLabel = label,
                totalSoldQuantity = totalSold,
                totalRevenue = totalRev,
                productsCount = soldItems.Count,
                products = soldItems
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy chi tiết sản phẩm bán.");
            return StatusCode(500, new { message = $"Lỗi: {ex.Message}" });
        }
    }

    // ── DRILLDOWN 3: CHI TIẾT TỒN KHO HỆ THỐNG (FEFO) ──
    [HttpGet("drilldown/inventory")]
    public async Task<IActionResult> GetInventoryDrilldown()
    {
        try
        {
            var today = DateTime.Today;
            var batches = await _context.ProductBatches
                .Include(b => b.Product)
                    .ThenInclude(p => p.Category)
                .OrderBy(b => b.ExpiryDate)
                .ToListAsync();

            var farms = await _context.Farms.ToDictionaryAsync(f => f.FarmId, f => f.FarmName);

            var list = batches.Select(b =>
            {
                int daysRemaining = (b.ExpiryDate.Date - today).Days;
                string status = b.Status ?? "Active";
                if (daysRemaining < 0) status = "Expired";
                else if (b.InitialQuantity <= 0) status = "OutOfStock";

                return new
                {
                    batchId = b.BatchId,
                    batchCode = b.BatchCode,
                    productId = b.ProductId,
                    sku = $"SKU-PRD-{b.ProductId:D5}",
                    productName = b.Product?.ProductName ?? "Sản phẩm",
                    categoryName = b.Product?.Category?.CategoryName ?? "Chưa phân loại",
                    unit = b.Unit,
                    harvestDate = b.HarvestDate,
                    expiryDate = b.ExpiryDate,
                    daysRemaining,
                    stock = b.InitialQuantity,
                    status,
                    farmName = farms.TryGetValue(b.FarmId, out var fName) ? fName : "Trang trại Đà Lạt",
                    isNearExpiry = daysRemaining >= 0 && daysRemaining <= 30
                };
            }).ToList();

            decimal totalStock = list.Where(x => x.daysRemaining >= 0).Sum(x => x.stock);
            int totalBatches = list.Count;
            int nearExpiryCount = list.Count(x => x.isNearExpiry);
            int outOfStockBatches = list.Count(x => x.stock <= 0);

            return Ok(new
            {
                totalStock,
                totalBatches,
                nearExpiryCount,
                outOfStockBatches,
                batches = list
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy chi tiết tồn kho.");
            return StatusCode(500, new { message = $"Lỗi: {ex.Message}" });
        }
    }

    // ── DRILLDOWN 4: CHI TIẾT HOÀN KHO & TRẢ HÀNG (ROLLBACK ACID) ──
    [HttpGet("drilldown/returns")]
    public async Task<IActionResult> GetReturnsDrilldown(
        [FromQuery] string? timeRange = "thisMonth",
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var (cStart, cEnd, _, _, label) = ResolveDateRanges(timeRange, startDate, endDate);

            var returnedOrders = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .Where(o => o.CreatedAt >= cStart 
                         && o.CreatedAt <= cEnd 
                         && (o.OrderStatus == "Cancelled" || o.OrderStatus == "Returned"))
                .OrderByDescending(o => o.UpdatedAt ?? o.CreatedAt)
                .ToListAsync();

            var batchCodes = await _context.ProductBatches.ToDictionaryAsync(b => b.BatchId, b => b.BatchCode);

            var list = returnedOrders.Select(o => new
            {
                orderId = o.OrderId,
                orderCode = o.OrderCode,
                orderStatus = o.OrderStatus,
                paymentStatus = o.PaymentStatus,
                customerName = o.Customer?.FullName ?? "Khách hàng",
                customerPhone = o.Customer?.Phone ?? "",
                totalAmount = o.TotalAmount,
                createdAt = o.CreatedAt,
                processedAt = o.UpdatedAt ?? o.CreatedAt,
                items = o.OrderItems.Select(oi => new
                {
                    productId = oi.ProductId,
                    sku = $"SKU-PRD-{oi.ProductId:D5}",
                    productName = oi.Product?.ProductName ?? "Sản phẩm",
                    quantity = oi.Quantity,
                    unit = oi.Product?.Unit ?? "kg",
                    batchId = oi.BatchId,
                    batchCode = batchCodes.TryGetValue(oi.BatchId, out var bCode) ? bCode : $"LÔ-{oi.BatchId}",
                    rollbackStatus = "Đã hoàn kho thành công (ACID)"
                }).ToList()
            }).ToList();

            decimal totalRefunded = list.Sum(o => o.totalAmount);
            int totalOrders = list.Count;
            decimal totalItemsRolledBack = list.SelectMany(o => o.items).Sum(i => i.quantity);

            return Ok(new
            {
                periodLabel = label,
                totalOrders,
                totalRefunded,
                totalItemsRolledBack,
                orders = list
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy chi tiết hoàn kho.");
            return StatusCode(500, new { message = $"Lỗi: {ex.Message}" });
        }
    }

    // Helper: Chuẩn hóa tiếng Việt bỏ dấu và chuyển chữ thường để tìm kiếm không phân biệt HOA/thường và dấu
    public static string NormalizeSearchText(string? text)
    {
        if (string.IsNullOrWhiteSpace(text)) return string.Empty;
        var normalized = text.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder();
        foreach (var ch in normalized)
        {
            var uc = CharUnicodeInfo.GetUnicodeCategory(ch);
            if (uc != UnicodeCategory.NonSpacingMark)
            {
                sb.Append(ch);
            }
        }
        return sb.ToString().Normalize(NormalizationForm.FormC).ToLower().Replace("đ", "d");
    }

    // GET: api/reports/products/suggestions?q=c
    [HttpGet("suggestions")]
    public async Task<IActionResult> GetSearchSuggestions([FromQuery] string? q = null)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(q))
            {
                return Ok(new List<object>());
            }

            var rawQ = q.Trim();
            var qLower = rawQ.ToLower();
            var qNorm = NormalizeSearchText(rawQ);
            var cleanIdStr = Regex.Replace(qLower, @"^(#|id\s*:?\s*|sp\s*:?\s*|mã\s*:?\s*)", "").Trim();
            long.TryParse(cleanIdStr, out var parsedId);

            var today = DateTime.Today;
            var batches = await _context.ProductBatches
                .Where(b => b.ExpiryDate >= today && (b.Status == "Active" || string.IsNullOrEmpty(b.Status)))
                .GroupBy(b => b.ProductId)
                .Select(g => new { ProductId = g.Key, Stock = g.Sum(b => b.InitialQuantity) })
                .ToDictionaryAsync(b => b.ProductId, b => b.Stock);

            var query = _context.Products.Include(p => p.Category).AsQueryable();
            var products = await query.ToListAsync();
            var suppliers = await _context.Suppliers.ToDictionaryAsync(s => s.SupplierId, s => s.SupplierName);
            var users = await _context.Users.ToDictionaryAsync(u => u.UserId, u => u.FullName);

            var matched = products.Where(p =>
            {
                // Khớp ID chính xác hoặc tương đối
                if (parsedId > 0 && p.ProductId == parsedId) return true;
                var pIdStr = p.ProductId.ToString();
                if ($"#{pIdStr}".Contains(qLower)) return true;
                if (!string.IsNullOrEmpty(cleanIdStr) && pIdStr.Contains(cleanIdStr)) return true;

                // Khớp SKU
                var sku = $"SKU-PRD-{p.ProductId:D5}";
                if (sku.ToLower().Contains(qLower)) return true;

                // Khớp Tên sản phẩm không phân biệt HOA/thường và có/không dấu
                if (p.ProductName.ToLower().Contains(qLower)) return true;
                if (NormalizeSearchText(p.ProductName).Contains(qNorm)) return true;

                // Khớp Danh mục
                var cat = p.Category?.CategoryName ?? "";
                if (cat.ToLower().Contains(qLower) || NormalizeSearchText(cat).Contains(qNorm)) return true;

                // Khớp Nhà cung cấp
                string sName = "";
                if (suppliers.TryGetValue(p.SupplierId, out var sn)) sName = sn;
                else if (users.TryGetValue(p.SupplierId, out var un)) sName = un;
                if (!string.IsNullOrEmpty(sName) && (sName.ToLower().Contains(qLower) || NormalizeSearchText(sName).Contains(qNorm))) return true;

                return false;
            })
            .Take(15)
            .Select(p =>
            {
                var sku = $"SKU-PRD-{p.ProductId:D5}";
                string sName = "Hợp tác xã Nông sản Việt";
                if (suppliers.TryGetValue(p.SupplierId, out var sn)) sName = sn;
                else if (users.TryGetValue(p.SupplierId, out var un)) sName = un;

                batches.TryGetValue(p.ProductId, out var stock);

                return new
                {
                    productId = p.ProductId,
                    sku,
                    productName = p.ProductName,
                    categoryName = p.Category?.CategoryName ?? "Chưa phân loại",
                    supplierName = sName,
                    unit = p.Unit,
                    price = p.Price,
                    currentStock = stock
                };
            })
            .ToList();

            return Ok(matched);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi gợi ý tìm kiếm sản phẩm.");
            return StatusCode(500, new { message = ex.Message });
        }
    }
}

public class ProductReportItemDto
{
    public long ProductId { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public long SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Status { get; set; } = "Active";
    public decimal CurrentStock { get; set; }
    public int BatchesCount { get; set; }
    public string StockStatus { get; set; } = "InStock";
    public decimal SoldQuantity { get; set; }
    public decimal TotalRevenue { get; set; }
    public int OrdersCount { get; set; }
    public decimal RevenueGrowthRate { get; set; }
    public decimal SoldQuantityGrowthRate { get; set; }
}
