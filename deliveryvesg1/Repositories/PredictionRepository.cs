namespace DeliverYves.Repositories;

public interface IPredictionRespository
{
    Prediction AddPrediction(Prediction newPrediction);
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
}