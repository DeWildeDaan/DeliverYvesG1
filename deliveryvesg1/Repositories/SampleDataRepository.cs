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

/// > This function returns a list of all the entities in the table, except for the one with the RowKey
/// of 'null'
/// 
/// Returns:
///   A Pageable<TableEntity> object.
    public Pageable<TableEntity> GetSampleData()
    {
        Pageable<TableEntity> queryResultsFilter = _tableClient.Query<TableEntity>(filter: $"RowKey ne 'null'");
        return queryResultsFilter;
    }

/// > This function takes a sample data object, creates a new table entity, and adds it to the table
/// 
/// Args:
///   SampleData: This is the class that contains the data that I want to add to the table.
/// 
/// Returns:
///   The SampleData object is being returned.
    public SampleData AddSampleData(SampleData sampleData)
    {
        string registrationid = Guid.NewGuid().ToString();
        var entity = new TableEntity(sampleData.RackId, registrationid)
        {
            { "RackRow", sampleData.RackRow },
            { "Label", sampleData.Label },
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