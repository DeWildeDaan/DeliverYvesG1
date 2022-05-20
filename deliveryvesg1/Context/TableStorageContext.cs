namespace DeliverYves.Context;

public interface ITableStorageContext
{
    TableClient RacksTableClient { get; }
    TableClient PredictionsTableClient { get; }
    TableClient SampleDataTableClient { get; }
}

public class TableStorageContext : ITableStorageContext
{
    private readonly DatabaseSettings _settings;
    public TableStorageContext(IOptions<DatabaseSettings> dbOptions)
    {
        _settings = dbOptions.Value;
    }

    public TableClient RacksTableClient
    {
        get
        {
            var tableClient = new TableClient(new Uri(_settings.Uri), _settings.TableR, new TableSharedKeyCredential(_settings.Account, _settings.Key));
            tableClient.CreateIfNotExistsAsync();
            return tableClient;
        }
    }

    public TableClient PredictionsTableClient
    {
        get
        {
            var tableClient = new TableClient(new Uri(_settings.Uri), _settings.TableP, new TableSharedKeyCredential(_settings.Account, _settings.Key));
            tableClient.CreateIfNotExistsAsync();
            return tableClient;
        }
    }

    public TableClient SampleDataTableClient
    {
        get
        {
            var tableClient = new TableClient(new Uri(_settings.Uri), _settings.TableS, new TableSharedKeyCredential(_settings.Account, _settings.Key));
            tableClient.CreateIfNotExistsAsync();
            return tableClient;
        }
    }

}