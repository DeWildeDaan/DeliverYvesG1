namespace DeliverYves.Repositories;

public interface IFastApiRespository
{
    Task<string> DoPrediction(InputData inputData);
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

    public async Task<string> DoPrediction(InputData inputData)
    {
        HttpResponseMessage response = await _httpClient.PostAsJsonAsync($"{_uri}/predict", inputData);
        response.EnsureSuccessStatusCode();
        string responseBody = await response.Content.ReadAsStringAsync();
        Console.WriteLine(responseBody);
        return responseBody;
    }
}