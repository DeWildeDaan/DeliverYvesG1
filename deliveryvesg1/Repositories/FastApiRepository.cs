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

/// We're sending a POST request to the endpoint we created in the previous step, and we're sending the
/// input data as a JSON object
/// 
/// Args:
///   InputData: This is the data that will be sent to the model.
/// 
/// Returns:
///   The response from the API.
    public async Task<string> DoPrediction(InputData inputData)
    {
        string url = $"{_uri}/predict";
        string json = JsonConvert.SerializeObject(inputData);
        HttpContent content = new StringContent(json, Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync(url, content);
        if(response.IsSuccessStatusCode){
            return $"Inputdata sent {DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Utc)}";
        } else{
            return $"Something went wrong {DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Utc)}";
        }
    }

/// We're calling the `/reload` endpoint on the model server, and if the response is successful, we
/// return a string saying that the model was reloaded. If the response is not successful, we return a
/// string saying that something went wrong
/// 
/// Returns:
///   The response from the server.
    public async Task<string> ReloadModel()
    {
        string url = $"{_uri}/reload";
        var response = await _httpClient.GetAsync(url);
        if(response.IsSuccessStatusCode){
            return $"Reloaded {DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Utc)}";
        } else{
            return $"Something went wrong {DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Utc)}";
        }
    }
}