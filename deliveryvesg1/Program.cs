var builder = WebApplication.CreateBuilder(args);
//Database settings
var dbSettings = builder.Configuration.GetSection("TSConnection");
builder.Services.Configure<DatabaseSettings>(dbSettings);
//Database context
builder.Services.AddTransient<ITableStorageContext, TableStorageContext>();
//Repositories
builder.Services.AddTransient<IRackRespository, RackRespository>();
builder.Services.AddTransient<IPredictionRespository, PredictionRespository>();
//Services
builder.Services.AddTransient<IRackService, RackService>();
builder.Services.AddTransient<IPredictionService, PredictionService>();

var app = builder.Build();


//RACKS ENDPOINTS
app.MapGet("/", () => "Hello World!");

app.MapGet("/racks", (IRackService rackService) => rackService.GetRacks());

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

app.MapPost("/racks", (IRackService rackService, Rack rack) =>
{
    var results = rackService.AddRack(rack);
    return Results.Created($"/racksbyrackid/{rack.RackId}", results);
});

app.MapDelete("/racks/{rackid}/{customerid}", (IRackService rackService, string rackid, string customerid) =>
{
    Rack rack = new Rack() { RackId = rackid, CustomerId = customerid };
    var results = rackService.DeleteRack(rack);
    return Results.Ok(results);
});

app.MapPost("/restock", (IRackService rackService, Rack rack) =>
{
    var results = rackService.RestockRack(rack);
    return Results.Created($"/racksbyrackid/{rack.RackId}", results);
});


//PREDICTIONS ENDPOINTS
app.MapPost("/prediction", (IPredictionService predictionService, Prediction prediction) =>
{
    var results = predictionService.AddPrediction(prediction);
    return Results.Created($"/predictions/{prediction.RackId}", results);
});

app.Run("http://localhost:3000");
