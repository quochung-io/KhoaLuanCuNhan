namespace Ecc.Infrastructure.Entities;

public class Farm
{
    public long FarmId { get; set; }
    public long SupplierId { get; set; }
    public string FarmName { get; set; } = null!;
    public string? Address { get; set; }
    public string? Province { get; set; }
    public string? District { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public decimal? Area { get; set; }
    public string? CropType { get; set; }
    public string? ProductionStandard { get; set; }
    public string? Status { get; set; }
}
