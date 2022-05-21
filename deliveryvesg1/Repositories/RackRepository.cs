namespace DeliverYves.Repositories;

public interface IRackRespository
{
    Rack AddRack(Rack newRack);
    string DeleteRack(string rackId);
    TableEntity RestockRack(string rackId);
    TableEntity UpdateRack(Rack newRack);
    Pageable<TableEntity> GetRacks();
    Pageable<TableEntity> GetRacksNoCustomerId();
    Pageable<TableEntity> GetRacksByCustomerId(string customerId);
    TableEntity GetRacksByRackId(string rackId);
}

public class RackRespository : IRackRespository
{
    private readonly TableClient _tableClient;
    public RackRespository(ITableStorageContext context)
    {
        _tableClient = context.RacksTableClient;
    }

    public Pageable<TableEntity> GetRacks()
    {
        Pageable<TableEntity> queryResultsFilter = _tableClient.Query<TableEntity>(filter: $"RowKey ne 'null'");
        return queryResultsFilter;
    }

    public Pageable<TableEntity> GetRacksNoCustomerId()
    {
        Pageable<TableEntity> queryResultsFilter = _tableClient.Query<TableEntity>(filter: $"CustomerId le ''");
        return queryResultsFilter;
    }

    public TableEntity GetRacksByRackId(string rackId)
    {
        TableEntity queryResultsFilter = _tableClient.Query<TableEntity>(filter: $"PartitionKey eq '{rackId}'").LastOrDefault();
        return queryResultsFilter;
    }

    public Pageable<TableEntity> GetRacksByCustomerId(string customerId)
    {
        Pageable<TableEntity> queryResultsFilter = _tableClient.Query<TableEntity>(filter: $"RowKey eq '{customerId}'");
        return queryResultsFilter;
    }

    public Rack AddRack(Rack newRack)
    {
        TableEntity rack = GetRacksByRackId(newRack.RackId);
        if(rack == null){
            string registrationid = Guid.NewGuid().ToString();
            newRack.CustomerId = "";
            var entity = new TableEntity(newRack.RackId, registrationid)
            {
                { "RackId", newRack.RackId },
                { "CustomerId", newRack.CustomerId },
                { "FilledOn", newRack.FilledOn }
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
        var rack = new TableEntity(newRack.RackId, entity.GetString("RowKey"))
        {
            { "RackId", newRack.RackId },
            { "CustomerId", newRack.CustomerId },
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
            { "FilledOn", DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Utc)}
        };
        _tableClient.UpdateEntity(newRack, ETag.All, TableUpdateMode.Replace);
        return newRack;
    }

}