namespace DeliverYves.Services;

public interface IPredictionService
{
    Prediction AddPrediction(InputData inputData);
    string ReloadModel();
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

    public Prediction AddPrediction(InputData inputData)
    {
        Prediction newPrediction = new Prediction() { RackId = inputData.RackId, Row = inputData.Row };
        var response = _fastApiRespository.DoPrediction(inputData); //Call naar fastAPI
        Console.WriteLine(response);
        //return _predictionRepository.AddPrediction(newPrediction);
        return newPrediction;
    }

    public string ReloadModel()
    {
        //Call naar fastAPI
        return "0";
    }
}