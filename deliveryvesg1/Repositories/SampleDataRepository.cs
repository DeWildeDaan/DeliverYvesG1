namespace DeliverYves.Repositories;

public interface ISampleDataRespository
{
    SampleData AddSampleData(SampleData sampleData);
    Pageable<TableEntity> GetSampleData();
}

public class SampleDataRespository : ISampleDataRespository
{
    private readonly TableClient _tableClient;
    public SampleDataRespository(ITableStorageContext context)
    {
        _tableClient = context.SampleDataTableClient;
    }

    public Pageable<TableEntity> GetSampleData()
    {
        Pageable<TableEntity> queryResultsFilter = _tableClient.Query<TableEntity>(filter: $"RowKey ne 'null'");
        return queryResultsFilter;
    }

    public SampleData AddSampleData(SampleData sampleData)
    {
        string registrationid = Guid.NewGuid().ToString();
        var entity = new TableEntity(sampleData.RackId, registrationid)
        {
            { "RackRow", sampleData.RackRow },
            { "WeightPre", sampleData.WeightPre },
            { "WeightPost", sampleData.WeightPost },
            { "WeightDiff", sampleData.WeightDiff },
            { "DistMinH", sampleData.DistMinH },
            { "DistMaxH", sampleData.DistMaxH },
            { "DistAvgH", sampleData.DistAvgH },
            { "DistMinL", sampleData.DistMinL },
            { "DistMaxL", sampleData.DistMaxL },
            { "DistAvgL", sampleData.DistAvgL },
            { "DistTime", sampleData.DistTime }
        };
        _tableClient.AddEntity(entity);
        return sampleData;
    }

}