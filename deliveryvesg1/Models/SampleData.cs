namespace DeliverYves.Models;
public class SampleData
{
    public String RackId { get; set; }
    public int RackRow { get; set; }
    public int Label { get; set; }
    public float WeightPre { get; set; }
    public float WeightPost { get; set; }
    public float WeightDiff { get; set; }
    public float DistMinH { get; set; }
    public float DistMaxH { get; set; }
    public float DistAvgH { get; set; }
    public float DistMinL { get; set; }
    public float DistMaxL { get; set; }
    public float DistAvgL { get; set; }
    public float DistTime { get; set; }
}