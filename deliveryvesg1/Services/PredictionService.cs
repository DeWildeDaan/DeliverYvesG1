namespace DeliverYves.Services;

public interface IPredictionService
{
    Task<string> Predict(InputData inputData);
    Prediction AddPrediction(Prediction newPrediction);
    Task<string> ReloadModel();
    List<OutputData> PredictionsByCustomer(string customerId);
    int TotalPredictionsByCustomer(string customerId);
}

public class PredictionService : IPredictionService
{
    private readonly IPredictionRespository _predictionRepository;
    private readonly IFastApiRespository _fastApiRespository;
    private readonly IRackRespository _rackRespository;

    public PredictionService(IPredictionRespository predictionRepository, IFastApiRespository fastApiRespository, IRackRespository rackRespository)
    {
        _predictionRepository = predictionRepository;
        _fastApiRespository = fastApiRespository;
        _rackRespository = rackRespository;
    }

    public async Task<string> Predict(InputData inputData)
    {
        return await _fastApiRespository.DoPrediction(inputData);
    }

    public async Task<string> ReloadModel()
    {
        return await _fastApiRespository.ReloadModel();
    }

    public Prediction AddPrediction(Prediction newPrediction)
    {
        return _predictionRepository.AddPrediction(newPrediction);
    }

    /// > Get all the racks for a customer, then get all the predictions for each rack
    /// 
    /// Args:
    ///   customerId (string): The customer id of the customer whose racks we want to get predictions for.
    /// 
    /// Returns:
    ///   A list of OutputData objects.
    public List<OutputData> PredictionsByCustomer(string customerId)
    {
        List<OutputData> results = new List<OutputData>();
        List<Rack> racks = _rackRespository.GetRacksByCustomerId(customerId);
        foreach (Rack r in racks)
        {
            var predictions = _predictionRepository.GetPredictions(r.RackId, r.FilledOn);
            results.Add(new OutputData() { RackId = r.RackId, CustomerId = customerId, Total = predictions.Count, Predictions = predictions });
        }
        return results;
    }

    /// It gets all the racks for a customer, then gets all the predictions for each rack, then sums the
    /// number of predictions
    /// 
    /// Args:
    ///   customerId (string): The customer's id
    /// 
    /// Returns:
    ///   The total number of predictions for a customer.
    public int TotalPredictionsByCustomer(string customerId)
    {
        int total = 0;
        List<Rack> racks = _rackRespository.GetRacksByCustomerId(customerId);
        foreach (Rack r in racks)
        {
            var predictions = _predictionRepository.GetPredictions(r.RackId, r.FilledOn);
            total += predictions.Count;
        }
        return total;
    }

}