namespace DeliverYves.Repositories;

public interface IFastApiRespository
{
    Task<int> DoPrediction(InputData inputData);
}

public class FastApiRespository : IFastApiRespository
{
    private readonly HttpClient _httpClient;
    private readonly string _uri;
    public FastApiRespository(IOptions<FastAPISettings> apiOptions)
    {
        _httpClient = new HttpClient();
        _uri = apiOptions.Value.Uri;
    }

    public async Task<int> DoPrediction(InputData inputData)
    {
        string url = $"{_uri}/predict";
        string json = JsonConvert.SerializeObject(inputData);
        HttpContent content = new StringContent(json, Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync(url, content);
        // var contents = await response.Content.ReadAsStringAsync();
        // OutputData outputData = JsonConvert.DeserializeObject<OutputData>(contents);

        OutputData outputData = JsonConvert.DeserializeObject<OutputData>(response.Content.ReadAsStringAsync().Result);
        Console.WriteLine(outputData.Position);
        return 0;
    }
}