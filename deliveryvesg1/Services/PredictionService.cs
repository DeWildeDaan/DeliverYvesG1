namespace DeliverYves.Services;

public interface IPredictionService
{
    Task<string> Predict(InputData inputData);
    Prediction AddPrediction(Prediction newPrediction);
    Task<string> ReloadModel();
    List<OutputData> PredictionsByCustomer(string customerId);
    TotalPredictions TotalPredictionsByCustomer(TotalPredictions totalInput);
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

    
/// > Get all the racks for a customer, then for each rack, get the total number of predictions, and the
/// number of predictions for each row, and the number of predictions for each side of each row
/// 
/// Args:
///   customerId (string): The customer's id
/// 
/// Returns:
///   A list of OutputData objects.
    public List<OutputData> PredictionsByCustomer(string customerId)
    {
        List<OutputData> results = new List<OutputData>();
        List<Rack> racks = _rackRespository.GetRacksByCustomerId(customerId);
        foreach (Rack r in racks)
        {
            var predictions = _predictionRepository.GetPredictions(r.RackId, r.FilledOn).Count;
            results.Add(new OutputData() { 
                RackId = r.RackId, 
                CustomerId = customerId, 
                Total = predictions, 
                Row1 = new Row(){Drinks = r.Row1, 
                                TakenLeft = _predictionRepository.GetPredictionsLeftRow(r.RackId, r.FilledOn, 1).Count, 
                                TakenRight = _predictionRepository.GetPredictionsRightRow(r.RackId, r.FilledOn, 1).Count},
                Row2 = new Row(){Drinks = r.Row2, 
                                TakenLeft = _predictionRepository.GetPredictionsLeftRow(r.RackId, r.FilledOn, 2).Count, 
                                TakenRight = _predictionRepository.GetPredictionsRightRow(r.RackId, r.FilledOn, 2).Count},
                Row3 = new Row(){Drinks = r.Row3, 
                                TakenLeft = _predictionRepository.GetPredictionsLeftRow(r.RackId, r.FilledOn, 3).Count, 
                                TakenRight = _predictionRepository.GetPredictionsRightRow(r.RackId, r.FilledOn, 3).Count},
                Row4 = new Row(){Drinks = r.Row4, 
                                TakenLeft = _predictionRepository.GetPredictionsLeftRow(r.RackId, r.FilledOn, 4).Count, 
                                TakenRight = _predictionRepository.GetPredictionsRightRow(r.RackId, r.FilledOn, 4).Count}, 
                });
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
    public TotalPredictions TotalPredictionsByCustomer(TotalPredictions input)
    {
        int totalPredictions = 0;
        List<Rack> racks = _rackRespository.GetRacksByCustomerId(input.CustomerId);
        foreach (Rack r in racks)
        {
            var predictionsLeft = _predictionRepository.GetPredictions(r.RackId, r.FilledOn).Count;
            totalPredictions += predictionsLeft;
        }
        input.Total = totalPredictions;
        return input;
    }

}