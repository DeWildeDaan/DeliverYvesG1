namespace DeliverYves.Services;

public interface IPredictionService
{
    Task<string> Predict(InputData inputData);
    Prediction AddPrediction(Prediction newPrediction);
    Task<string> ReloadModel();
    List<OutputData> PredictionsByCustomer(string customerId);
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

    public List<OutputData> PredictionsByCustomer(string customerId)
    {
        List<OutputData> results = new List<OutputData>(); 
        List<Rack> racks = _rackRespository.GetRacksByCustomerId(customerId);
        foreach(Rack r in racks){
            results.Add(new OutputData(){RackId = r.RackId, Predictions = _predictionRepository.GetPredictions(r.RackId, r.FilledOn)});
        }
        return results;
    }
    
}