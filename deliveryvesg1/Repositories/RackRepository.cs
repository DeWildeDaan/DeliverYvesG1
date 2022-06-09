namespace DeliverYves.Repositories;

public interface IRackRespository
{
    Boolean AddRack(Rack newRack);
    string DeleteRack(string rackId);
    TableEntity RestockRack(string rackId);
    TableEntity UpdateRack(Rack newRack);
    List<Rack> GetRacks();
    Pageable<TableEntity> GetRacksNoCustomerId();
    List<Rack> GetRacksByCustomerId(string customerId);
    TableEntity GetRacksByRackId(string rackId);
}

public class RackRespository : IRackRespository
{
    private readonly TableClient _tableClient;
    public RackRespository(ITableStorageContext context)
    {
        _tableClient = context.RacksTableClient;
    }

/// > Get all the rows from the table where the CustomerId is not empty
/// 
/// Returns:
///   A list of racks.
    public List<Rack> GetRacks()
    {
        Pageable<TableEntity> queryResultsFilter = _tableClient.Query<TableEntity>(filter: $"CustomerId ne ''");
        List<Rack> results = new List<Rack>();
        foreach (TableEntity r in queryResultsFilter)
        {
            Rack rack = new Rack() { };
            rack.RackId = r.GetString("RackId");
            rack.CustomerId = r.GetString("CustomerId");
            rack.Row1 = JsonConvert.DeserializeObject<List<string>>(r.GetString("Row1"));
            rack.Row2 = JsonConvert.DeserializeObject<List<string>>(r.GetString("Row2"));
            rack.Row3 = JsonConvert.DeserializeObject<List<string>>(r.GetString("Row3"));
            rack.Row4 = JsonConvert.DeserializeObject<List<string>>(r.GetString("Row4"));
            rack.FilledOn = r.GetDateTime("FilledOn");
            results.Add(rack);
        }
        return results;
    }

/// > Get all the rows in the table where the CustomerId is an empty string
/// 
/// Returns:
///   A Pageable<TableEntity> object.
    public Pageable<TableEntity> GetRacksNoCustomerId()
    {
        Pageable<TableEntity> queryResultsFilter = _tableClient.Query<TableEntity>(filter: $"CustomerId eq ''");
        return queryResultsFilter;
    }

/// > This function will return the last record in the table that matches the partition key
/// 
/// Args:
///   rackId (string): The rackId is the PartitionKey in the table.
/// 
/// Returns:
///   A TableEntity object.
    public TableEntity GetRacksByRackId(string rackId)
    {
        TableEntity queryResultsFilter = _tableClient.Query<TableEntity>(filter: $"PartitionKey eq '{rackId}'").LastOrDefault();
        return queryResultsFilter;
    }

/// > Get all the rows from the table where the CustomerId is equal to the customerId passed in
/// 
/// Args:
///   customerId (string): The customerId is a string that is used to filter the results.
/// 
/// Returns:
///   A list of racks that belong to the customer.
    public List<Rack> GetRacksByCustomerId(string customerId)
    {
        Pageable<TableEntity> queryResultsFilter = _tableClient.Query<TableEntity>(filter: $"CustomerId eq '{customerId}'");
        List<Rack> results = new List<Rack>();
        foreach (TableEntity r in queryResultsFilter)
        {
            Rack rack = new Rack() { };
            rack.RackId = r.GetString("RackId");
            rack.CustomerId = r.GetString("CustomerId");
            rack.Row1 = JsonConvert.DeserializeObject<List<string>>(r.GetString("Row1"));
            rack.Row2 = JsonConvert.DeserializeObject<List<string>>(r.GetString("Row2"));
            rack.Row3 = JsonConvert.DeserializeObject<List<string>>(r.GetString("Row3"));
            rack.Row4 = JsonConvert.DeserializeObject<List<string>>(r.GetString("Row4"));
            rack.FilledOn = r.GetDateTime("FilledOn");
            results.Add(rack);
        }
        return results;
    }

/// > Add a new rack to the table if it doesn't already exist
/// 
/// Args:
///   Rack: This is the object that I'm trying to add to the table.
/// 
/// Returns:
///   A new Rack object is being returned.
    public Boolean AddRack(Rack newRack)
    {
        TableEntity rack = GetRacksByRackId(newRack.RackId);
        if (rack == null)
        {
            string registrationid = Guid.NewGuid().ToString();
            newRack.CustomerId = "";
            var entity = new TableEntity(newRack.RackId, registrationid)
            {
                { "RackId", newRack.RackId },
                { "CustomerId", newRack.CustomerId },
                { "Row1", JsonConvert.SerializeObject(new List<string>()) },
                { "Row2", JsonConvert.SerializeObject(new List<string>()) },
                { "Row3", JsonConvert.SerializeObject(new List<string>()) },
                { "Row4", JsonConvert.SerializeObject(new List<string>()) },
                { "FilledOn", DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Utc) }
            };
            _tableClient.AddEntity(entity);
            return true;
        } else {
            return false;
        }
        
    }

/// > Delete the rack with the specified rackId
/// 
/// Args:
///   rackId (string): The unique identifier for the rack.
/// 
/// Returns:
///   The return value is a string that says "Rack {rackId} Deleted"
    public string DeleteRack(string rackId)
    {
        TableEntity entity = GetRacksByRackId(rackId);
        _tableClient.DeleteEntity(rackId, entity.GetString("RowKey"));
        return $"Rack {rackId} Deleted";
    }

/// It takes a new rack object, gets the old rack object from the database, and then replaces the old
/// rack object with the new rack object
/// 
/// Args:
///   Rack: The new rack object that contains the updated values.
/// 
/// Returns:
///   A TableEntity object.
    public TableEntity UpdateRack(Rack newRack)
    {
        TableEntity entity = GetRacksByRackId(newRack.RackId);
        DateTime? filledOn = entity.GetDateTime("FilledOn");
        newRack.Row1 = newRack.Row1 != null ? newRack.Row1 : JsonConvert.DeserializeObject<List<string>>(entity.GetString("Row1"));
        newRack.Row2 = newRack.Row2 != null ? newRack.Row2 : JsonConvert.DeserializeObject<List<string>>(entity.GetString("Row2"));
        newRack.Row3 = newRack.Row3 != null ? newRack.Row3 : JsonConvert.DeserializeObject<List<string>>(entity.GetString("Row3"));
        newRack.Row4 = newRack.Row4 != null ? newRack.Row4 : JsonConvert.DeserializeObject<List<string>>(entity.GetString("Row4"));

        var rack = new TableEntity(newRack.RackId, entity.GetString("RowKey"))
        {
            { "RackId", newRack.RackId },
            { "CustomerId", newRack.CustomerId },
            { "Row1", JsonConvert.SerializeObject(newRack.Row1) },
            { "Row2", JsonConvert.SerializeObject(newRack.Row2) },
            { "Row3", JsonConvert.SerializeObject(newRack.Row3) },
            { "Row4", JsonConvert.SerializeObject(newRack.Row4) },
            { "FilledOn", filledOn }
        };
        _tableClient.UpdateEntity(rack, ETag.All, TableUpdateMode.Replace);
        return rack;
    }

/// > RestockRack() takes a rackId, gets the rack from the database, and then updates the database with
/// the same rack, but with a new FilledOn date
/// 
/// Args:
///   rackId (string): The rackId is the PartitionKey of the table.
/// 
/// Returns:
///   A TableEntity object.
    public TableEntity RestockRack(string rackId)
    {
        TableEntity entity = GetRacksByRackId(rackId);
        string customerId = entity.GetString("CustomerId");
        var newRack = new TableEntity(rackId, entity.GetString("RowKey"))
        {
            { "RackId", rackId },
            { "CustomerId", customerId },
            { "Row1", entity.GetString("Row1") },
            { "Row2", entity.GetString("Row2") },
            { "Row3", entity.GetString("Row3") },
            { "Row4", entity.GetString("Row4")},
            { "FilledOn", DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Utc)}
        };
        _tableClient.UpdateEntity(newRack, ETag.All, TableUpdateMode.Replace);
        return newRack;
    }

}