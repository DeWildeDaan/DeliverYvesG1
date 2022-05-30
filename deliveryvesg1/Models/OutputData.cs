namespace DeliverYves.Models;
public class OutputData
{
    public string? RackId { get; set; }
    public string? CustomerId { get; set; }
    public int Total { get; set;}
    public List<Prediction>? Predictions { get; set; }
}