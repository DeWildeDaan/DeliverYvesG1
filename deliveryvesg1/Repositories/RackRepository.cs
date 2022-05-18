namespace DeliverYves.Repositories;

public interface IRackRespository
{
    Rack AddRack(Rack newRack);
    Rack DeleteRack(Rack rack);
    Rack RestockRack(Rack rack);
    Pageable<TableEntity> GetRacks();
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

    public Rack AddRack(Rack newRack)
    {
        var entity = new TableEntity(newRack.RackId, newRack.CustomerId)
        {
            { "RackId", newRack.RackId },
            { "CustomerId", newRack.CustomerId },
            { "FilledOn", newRack.FilledOn }
        };
        _tableClient.AddEntity(entity);
        return newRack;
    }

    public Rack DeleteRack(Rack rack)
    {
        _tableClient.DeleteEntity(rack.RackId, rack.CustomerId);
        return rack;
    }

    public Rack RestockRack(Rack rack)
    {
        rack.FilledOn = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Utc);
        var entity = new TableEntity(rack.RackId, rack.CustomerId)
        {
            { "RackId", rack.RackId },
            { "CustomerId", rack.CustomerId },
            { "FilledOn", rack.FilledOn}
        };
        _tableClient.UpdateEntity(entity, ETag.All, TableUpdateMode.Replace);
        return rack;
    }

}