namespace DeliverYves.Services;

public interface IPredictionService
{
    Prediction AddPrediction(InputData inputData);
    string ReloadModel();
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
        Prediction newPrediction = new Prediction() { RackId = inputData.RackId, Row = inputData.Row };
        newPrediction.Position = 0; //Call naar fastAPI
        return _predictionRepository.AddPrediction(newPrediction);
    }

    public string ReloadModel()
    {
        //Call naar fastAPI
        return "0";
    }
}