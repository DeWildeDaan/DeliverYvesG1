namespace DeliverYves.Services;

public interface IPredictionService
{
    Task<Prediction> AddPrediction(InputData inputData);
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

    public async Task<Prediction> AddPrediction(InputData inputData)
    {
        Prediction newPrediction = new Prediction() {RackId = inputData.RackId, Row = inputData.Row};
        int response = await _fastApiRespository.DoPrediction(inputData);
        newPrediction.Position = response;
        return newPrediction;
    }

    public string ReloadModel()
    {
        //Call naar fastAPI
        return "0";
    }
}