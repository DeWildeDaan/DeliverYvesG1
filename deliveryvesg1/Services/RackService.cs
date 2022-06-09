namespace DeliverYves.Services;

public interface IRackService
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

public class RackService : IRackService
{
    private readonly IRackRespository _rackRepository;

    public RackService(IRackRespository rackRepository)
    {
        _rackRepository = rackRepository;
    }

    public List<Rack> GetRacks()
    {
        return _rackRepository.GetRacks();
    }

    public Pageable<TableEntity> GetRacksNoCustomerId()
    {
        return _rackRepository.GetRacksNoCustomerId();
    }

    public TableEntity GetRacksByRackId(string rackId)
    {
        return _rackRepository.GetRacksByRackId(rackId);
    }

    public List<Rack> GetRacksByCustomerId(string customerId)
    {
        return _rackRepository.GetRacksByCustomerId(customerId);
    }

    public Boolean AddRack(Rack newRack)
    {
        return _rackRepository.AddRack(newRack);
    }

    public string DeleteRack(string rackId)
    {
        return _rackRepository.DeleteRack(rackId);
    }

    public TableEntity UpdateRack(Rack newRack)
    {

        return _rackRepository.UpdateRack(newRack);
    }

    public TableEntity RestockRack(string rackId)
    {

        return _rackRepository.RestockRack(rackId);
    }
}