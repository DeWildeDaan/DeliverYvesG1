namespace DeliverYves.Repositories;

public interface IPredictionRespository
{
    Prediction AddPrediction(Prediction newPrediction);
    List<Prediction> GetPredictionsLeftRow(string rackId, DateTime? filledOn, int row);
    List<Prediction> GetPredictionsRightRow(string rackId, DateTime? filledOn, int row);
    List<Prediction> GetPredictions(string rackId, DateTime? filledOn);
}

public class PredictionRespository : IPredictionRespository
{
    private readonly TableClient _tableClient;
    public PredictionRespository(ITableStorageContext context)
    {
        _tableClient = context.PredictionsTableClient;
    }

/// > This function adds a new prediction to the table storage
/// 
/// Args:
///   Prediction: 
/// 
/// Returns:
///   The new prediction object.
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

/// > Get all the predictions for a given rack, row, and position, and return only the ones that are
/// newer than the given filledOn date
/// 
/// Args:
///   rackId (string): The rack id
///   filledOn: The date and time that the rack was filled.
///   row (int): The row of the rack that you want to get predictions for.
/// 
/// Returns:
///   A list of predictions for the left row of the rack.
    public List<Prediction> GetPredictionsLeftRow(string rackId, DateTime? filledOn, int row)
    {
        List<Prediction> results = new List<Prediction>();
        Pageable<TableEntity> queryResultsFilter = _tableClient.Query<TableEntity>(filter: $"RackId eq '{rackId}' and Position eq 0 and Row eq {row}");
        foreach (TableEntity e in queryResultsFilter)
        {
            Prediction prediction = new Prediction() { Id = e.GetString("RowKey"), RackId = e.GetString("PartitionKey"), Row = e.GetInt32("Row"), Position = e.GetInt32("Position"), DateAndTime = e.GetDateTime("DateAndTime") };
            if(prediction.DateAndTime > filledOn){
                results.Add(prediction);
            }
        }
        return results;
    }

/// > Get all the predictions for a given rack, row, and position, and return only the ones that are
/// newer than the given filledOn date
/// 
/// Args:
///   rackId (string): The rack id
///   filledOn: The date and time that the rack was filled.
///   row (int): The row of the rack that you want to get predictions for.
/// 
/// Returns:
///   A list of predictions for the right row of the rack.
    public List<Prediction> GetPredictionsRightRow(string rackId, DateTime? filledOn, int row)
    {
        List<Prediction> results = new List<Prediction>();
        Pageable<TableEntity> queryResultsFilter = _tableClient.Query<TableEntity>(filter: $"RackId eq '{rackId}' and Position eq 1 and Row eq {row}");
        foreach (TableEntity e in queryResultsFilter)
        {
            Prediction prediction = new Prediction() { Id = e.GetString("RowKey"), RackId = e.GetString("PartitionKey"), Row = e.GetInt32("Row"), Position = e.GetInt32("Position"), DateAndTime = e.GetDateTime("DateAndTime") };
            if(prediction.DateAndTime > filledOn){
                results.Add(prediction);
            }
        }
        return results;
    }

/// > Get all the predictions for a given rack, and return only the ones that are newer than the given
/// date
/// 
/// Args:
///   rackId (string): The rack ID of the rack you want to get predictions for.
///   filledOn: The date and time of the last time the rack was filled.
/// 
/// Returns:
///   A list of predictions.
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