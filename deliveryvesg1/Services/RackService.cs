namespace DeliverYves.Services;

public interface IRackService
{
    Rack AddRack(Rack newRack);
    Rack DeleteRack(Rack rack);
    TableEntity RestockRack(string rackId);
    Pageable<TableEntity> GetRacks();
    Pageable<TableEntity> GetRacksByCustomerId(string customerId);
    Pageable<TableEntity> GetRacksByRackId(string rackId);
}

public class RackService : IRackService
{
    private readonly IRackRespository _rackRepository;

    public RackService(IRackRespository rackRepository)
    {
        _rackRepository = rackRepository;
    }

    public Pageable<TableEntity> GetRacks()
    {
        return _rackRepository.GetRacks();
    }

    public Pageable<TableEntity> GetRacksByRackId(string rackId)
    {
        return _rackRepository.GetRacksByRackId(rackId);
    }

    public Pageable<TableEntity> GetRacksByCustomerId(string customerId)
    {
        return _rackRepository.GetRacksByCustomerId(customerId);
    }

    public Rack AddRack(Rack newRack)
    {
        return _rackRepository.AddRack(newRack);
    }

    public Rack DeleteRack(Rack rack)
    {
        return _rackRepository.DeleteRack(rack);
    }

    public TableEntity RestockRack(string rackId)
    {

        return _rackRepository.RestockRack(rackId);
    }
}