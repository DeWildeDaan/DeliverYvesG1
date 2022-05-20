namespace DeliverYves.Services;

public interface ISampleDataService
{
    SampleData AddSampleData(SampleData sampleData);
    Pageable<TableEntity> GetSampleData();
}

public class SampleDataService : ISampleDataService
{
    private readonly ISampleDataRespository _sampleDataRepository;

    public SampleDataService(ISampleDataRespository sampleDataRepository)
    {
        _sampleDataRepository = sampleDataRepository;
    }

    public Pageable<TableEntity> GetSampleData()
    {
        return _sampleDataRepository.GetSampleData();
    }

    public SampleData AddSampleData(SampleData sampleData)
    {
        return _sampleDataRepository.AddSampleData(sampleData);
    }
}