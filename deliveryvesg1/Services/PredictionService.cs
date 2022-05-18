namespace DeliverYves.Services;

public interface IPredictionService
{
    Prediction AddPrediction(Prediction newPrediction);
}

public class PredictionService : IPredictionService
{
    private readonly IPredictionRespository _predictionRepository;

    public PredictionService(IPredictionRespository predictionRepository)
    {
        _predictionRepository = predictionRepository;
    }

    public Prediction AddPrediction(Prediction newPrediction)
    {
        return _predictionRepository.AddPrediction(newPrediction);
    }
}