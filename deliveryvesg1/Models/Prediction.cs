namespace DeliverYves.Models;
public class Prediction
{
    public string? Id { get; set; }
    public string? RackId { get; set; }
    public int? Row { get; set; }
    public int? Position { get; set; }
    public DateTime? DateAndTime { get; set; }
}