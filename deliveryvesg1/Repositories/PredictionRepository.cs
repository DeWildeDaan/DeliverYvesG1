namespace DeliverYves.Repositories;

public interface IPredictionRespository
{
    Prediction AddPrediction(Prediction newPrediction);
    List<Prediction> GetPredictions(string rackId, DateTime? filledOn);
}

public class PredictionRespository : IPredictionRespository
{
    private readonly TableClient _tableClient;
    public PredictionRespository(ITableStorageContext context)
    {
        _tableClient = context.PredictionsTableClient;
    }

    public Prediction AddPrediction(Prediction newPrediction)
    {
        newPrediction.Id = Guid.NewGuid().ToString();
        newPrediction.DateAndTime = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Utc);
        var entity = new TableEntity(newPrediction.RackId, newPrediction.Id)
        {
            { "RackId", newPrediction.RackId },
            { "Row", newPrediction.Row },
            { "Position", newPrediction.Position },
            { "DateAndTime", newPrediction.DateAndTime }
        };
        _tableClient.AddEntity(entity);
        return newPrediction;
    }

    public List<Prediction> GetPredictions(string rackId, DateTime? filledOn)
    {
        List<Prediction> results = new List<Prediction>();
        Pageable<TableEntity> queryResultsFilter = _tableClient.Query<TableEntity>(filter: $"RackId eq '{rackId}'");
        foreach (TableEntity e in queryResultsFilter)
        {
            Prediction prediction = new Prediction() { Id = e.GetString("RowKey"), RackId = e.GetString("PartitionKey"), Row = e.GetInt32("Row"), Position = e.GetInt32("Position"), DateAndTime = e.GetDateTime("DateAndTime") };
            if(prediction.DateAndTime > filledOn){
                results.Add(prediction);
            }
        }
        return results;
    }
}