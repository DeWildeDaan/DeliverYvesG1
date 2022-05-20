namespace DeliverYves.Repositories;

public interface IRackRespository
{
    Rack AddRack();
    string DeleteRack(string rackId);
    TableEntity RestockRack(string rackId);
    TableEntity UpdateRack(Rack newRack);
    Pageable<TableEntity> GetRacks();
    Pageable<TableEntity> GetRacksNoCustomerId();
    Pageable<TableEntity> GetRacksByCustomerId(string customerId);
    Pageable<TableEntity> GetRacksByRackId(string rackId);
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

    public Pageable<TableEntity> GetRacksByRackId(string rackId)
    {
        Pageable<TableEntity> queryResultsFilter = _tableClient.Query<TableEntity>(filter: $"PartitionKey eq '{rackId}'");
        return queryResultsFilter;
    }

    public Pageable<TableEntity> GetRacksByCustomerId(string customerId)
    {
        Pageable<TableEntity> queryResultsFilter = _tableClient.Query<TableEntity>(filter: $"RowKey eq '{customerId}'");
        return queryResultsFilter;
    }

    public Rack AddRack()
    {
        Rack newRack = new Rack(){};
        string lastId = "";
        Pageable<TableEntity> entities = GetRacks();
        foreach (TableEntity e in entities)
        {
            lastId = e.GetString("RackId");
        }
        if(String.IsNullOrEmpty(lastId)){
            newRack.RackId = "1";
        } else {
            int rackId = Int32.Parse(lastId);
            rackId++;
            newRack.RackId = rackId.ToString();
        }
        

        if (String.IsNullOrEmpty(newRack.CustomerId))
        {
            newRack.CustomerId = "";
        }
        string registrationid = Guid.NewGuid().ToString();
        var entity = new TableEntity(newRack.RackId, registrationid)
        {
            { "RackId", newRack.RackId },
            { "CustomerId", newRack.CustomerId },
            { "FilledOn", newRack.FilledOn }
        };
        _tableClient.AddEntity(entity);
        return newRack;
    }

    public string DeleteRack(string rackId)
    {
        string registrationId = "";
        Pageable<TableEntity> entities = GetRacksByRackId(rackId);
        foreach (TableEntity entity in entities)
        {
            registrationId = entity.GetString("RowKey");
        }
        _tableClient.DeleteEntity(rackId, registrationId);
        return $"Rack {rackId} Deleted";
    }

    public TableEntity UpdateRack(Rack newRack)
    {
        DateTime? filledOn = DateTime.Now;
        string registrationId = "";
        Pageable<TableEntity> entities = GetRacksByRackId(newRack.RackId);
        foreach (TableEntity entity in entities)
        {
            registrationId = entity.GetString("RowKey");
            filledOn = entity.GetDateTime("FilledOn");
        }

        var rack = new TableEntity(newRack.RackId, registrationId)
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
        string customerId = "";
        string registrationId = "";
        Pageable<TableEntity> entities = GetRacksByRackId(rackId);
        foreach (TableEntity entity in entities)
        {
            registrationId = entity.GetString("RowKey");
            customerId = entity.GetString("CustomerId");
        }

        var newRack = new TableEntity(rackId, registrationId)
        {
            { "RackId", rackId },
            { "CustomerId", customerId },
            { "FilledOn", DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Utc)}
        };
        _tableClient.UpdateEntity(newRack, ETag.All, TableUpdateMode.Replace);
        return newRack;
    }

}