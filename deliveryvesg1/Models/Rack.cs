namespace DeliverYves.Models;
public class Rack
{
    public string RackId { get; set; }
    public string? CustomerId { get; set; }
    public List<string>? Row1 { get; set; }
    public List<string>? Row2 { get; set; }
    public List<string>? Row3 { get; set; }
    public List<string>? Row4 { get; set; }
    public DateTime? FilledOn { get; set; }
}