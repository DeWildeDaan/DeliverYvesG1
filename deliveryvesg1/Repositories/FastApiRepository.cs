namespace DeliverYves.Repositories;

public interface IFastApiRespository
{
    Task<string> DoPrediction(InputData inputData);
    Task<string> ReloadModel();
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
        string url = $"{_uri}/predict";
        string json = JsonConvert.SerializeObject(inputData);
        HttpContent content = new StringContent(json, Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync(url, content);
        if(response.IsSuccessStatusCode){
            return "Inputdata sent";
        } else{
            return "Something went wrong";
        }
    }

    public async Task<string> ReloadModel()
    {
        string url = $"{_uri}/reload";
        var response = await _httpClient.GetAsync(url);
        if(response.IsSuccessStatusCode){
            return "Reloaded";
        } else{
            return "Something went wrong";
        }
    }
}