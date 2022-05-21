namespace DeliverYves.Services;

public interface IPredictionService
{
    Task<string> Predict(InputData inputData);
    Prediction AddPrediction(Prediction newPrediction);
    Task<string> ReloadModel();
}

public class PredictionService : IPredictionService
{
    private readonly IPredictionRespository _predictionRepository;
    private readonly IFastApiRespository _fastApiRespository;

    public PredictionService(IPredictionRespository predictionRepository, IFastApiRespository fastApiRespository)
    {
        _predictionRepository = predictionRepository;
        _fastApiRespository = fastApiRespository;
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

    
}