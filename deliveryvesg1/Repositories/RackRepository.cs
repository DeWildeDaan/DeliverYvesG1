namespace DeliverYves.Repositories;

public interface IRackRespository
{
    Rack AddRack(Rack newRack);
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

    public List<Rack> GetRacks()
    {
        Pageable<TableEntity> queryResultsFilter = _tableClient.Query<TableEntity>(filter: $"CustomerId ne 'null'");
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

    public Pageable<TableEntity> GetRacksNoCustomerId()
    {
        Pageable<TableEntity> queryResultsFilter = _tableClient.Query<TableEntity>(filter: $"CustomerId eq ''");
        return queryResultsFilter;
    }

    public TableEntity GetRacksByRackId(string rackId)
    {
        TableEntity queryResultsFilter = _tableClient.Query<TableEntity>(filter: $"PartitionKey eq '{rackId}'").LastOrDefault();
        return queryResultsFilter;
    }

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

    public Rack AddRack(Rack newRack)
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
        }
        return newRack;
    }

    public string DeleteRack(string rackId)
    {
        TableEntity entity = GetRacksByRackId(rackId);
        _tableClient.DeleteEntity(rackId, entity.GetString("RowKey"));
        return $"Rack {rackId} Deleted";
    }

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