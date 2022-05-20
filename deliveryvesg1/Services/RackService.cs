namespace DeliverYves.Services;

public interface IRackService
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

    public Pageable<TableEntity> GetRacksNoCustomerId()
    {
        return _rackRepository.GetRacksNoCustomerId();
    }

    public Pageable<TableEntity> GetRacksByRackId(string rackId)
    {
        return _rackRepository.GetRacksByRackId(rackId);
    }

    public Pageable<TableEntity> GetRacksByCustomerId(string customerId)
    {
        return _rackRepository.GetRacksByCustomerId(customerId);
    }

    public Rack AddRack()
    {
        return _rackRepository.AddRack();
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