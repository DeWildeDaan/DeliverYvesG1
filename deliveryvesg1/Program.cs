var builder = WebApplication.CreateBuilder(args);
//Database settings
var dbSettings = builder.Configuration.GetSection("TSConnection");
builder.Services.Configure<DatabaseSettings>(dbSettings);
//FastAPI settings
var apiSettings = builder.Configuration.GetSection("FastAPI");
builder.Services.Configure<FastAPISettings>(apiSettings);
//Database context
builder.Services.AddTransient<ITableStorageContext, TableStorageContext>();
//Repositories
builder.Services.AddTransient<IRackRespository, RackRespository>();
builder.Services.AddTransient<IPredictionRespository, PredictionRespository>();
builder.Services.AddTransient<ISampleDataRespository, SampleDataRespository>();
builder.Services.AddTransient<IFastApiRespository, FastApiRespository>();
//Services
builder.Services.AddTransient<IRackService, RackService>();
builder.Services.AddTransient<IPredictionService, PredictionService>();
builder.Services.AddTransient<ISampleDataService, SampleDataService>();

var app = builder.Build();


//ROOT ENDPOINT
app.MapGet("/", () => $"Status alive {DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Utc)}");


//SAMPLEDATA ENDPOINTS
app.MapGet("/sampledata", (ISampleDataService sampleDataService) => sampleDataService.GetSampleData());

app.MapPost("/sampledata", (ISampleDataService sampleDataService, SampleData sampleData) =>
{
    var results = sampleDataService.AddSampleData(sampleData);
    return Results.Created($"/sampledata", results);
});

//RACKS ENDPOINTS
app.MapGet("/racks", (IRackService rackService) => rackService.GetRacks());

app.MapGet("/nocustomer", (IRackService rackService) => rackService.GetRacksNoCustomerId());

app.MapGet("/racksbyrackid/{id}", (IRackService rackService, string id) =>
{
    var results = rackService.GetRacksByRackId(id);
    return Results.Ok(results);
});

app.MapGet("/racksbycustomerid/{id}", (IRackService rackService, string id) =>
{
    var results = rackService.GetRacksByCustomerId(id);
    return Results.Ok(results);
});

app.MapGet("/restock/{rackid}", (IRackService rackService, string rackid) =>
{
    var results = rackService.RestockRack(rackid);
    return Results.Ok(results);
});

app.MapPost("/racks", (IRackService rackService) =>
{
    var results = rackService.AddRack();
    return Results.Created($"/racks", results);
});

app.MapPut("/racks", (IRackService rackService, Rack rack) =>
{
    var results = rackService.UpdateRack(rack);
    return Results.Accepted($"/racksbyrackid/{rack.RackId}", results);
});

app.MapDelete("/racks/{rackid}", (IRackService rackService, string rackid) =>
{
    var results = rackService.DeleteRack(rackid);
    return Results.Ok(results);
});


//PREDICTIONS ENDPOINTS
app.MapGet("/reloadmodel", (IPredictionService predictionService) =>
{
    var results = predictionService.ReloadModel();
    return Results.Ok(results);
});

app.MapGet("/predictions/", (IPredictionService predictionService) =>
{
    var results = 0;
    return Results.Ok(results);
});

app.MapPost("/prediction", (IPredictionService predictionService, InputData inputData) =>
{
    var results = predictionService.AddPrediction(inputData);
    return Results.Created($"/predictions/{inputData.RackId}", results);
});


//app.Run("http://localhost:3000");
app.Run();
