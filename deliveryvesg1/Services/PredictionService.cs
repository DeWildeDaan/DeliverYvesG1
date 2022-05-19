namespace DeliverYves.Services;

public interface IPredictionService
{
    Prediction AddPrediction(InputData inputData);
}

public class PredictionService : IPredictionService
{
    private readonly IPredictionRespository _predictionRepository;

    public PredictionService(IPredictionRespository predictionRepository)
    {
        _predictionRepository = predictionRepository;
    }

    public Prediction AddPrediction(InputData inputData)
    {
        Prediction prediction = new Prediction(){};
        return prediction;
    }
}