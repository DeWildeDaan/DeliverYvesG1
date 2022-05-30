var  MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
var builder = WebApplication.CreateBuilder(args);
//CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
                      policy  =>
                      {
                          policy.WithOrigins("https://deliveryvesg1frontend.livelygrass-d3385627.northeurope.azurecontainerapps.io",
                                                "https://deliveryvesg1frontend.livelygrass-d3385627.northeurope.azurecontainerapps.io/",
                                                "https://deliveryvesg1frontend.livelygrass-d3385627.northeurope.azurecontainerapps.io/index.html",
                                                "https://deliveryvesg1frontend.livelygrass-d3385627.northeurope.azurecontainerapps.io/manage.html",
                                                "http://127.0.0.0",
                                                "http://127.0.0.0/",
                                                "http://127.0.0.0/index.html",
                                                "http://127.0.0.0/manage.html")
                                                .AllowAnyHeader()
                                                .AllowAnyMethod();
                      });
});
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
//Swagger
builder.Services.AddSwaggerGen();
builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();
//CORS
app.UseCors(MyAllowSpecificOrigins);
//Swagger documentation
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "v1");
        options.RoutePrefix = string.Empty;
    });
}


//ROOT ENDPOINT
app.MapGet("/", () => $"Status alive {DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Utc)}");


//SAMPLEDATA ENDPOINTS
/* This is a route that is mapped to the `/sampledata` endpoint. The `sampleDataService` is injected
into the route and the `GetSampleData` method is called. */
app.MapGet("/sampledata", (ISampleDataService sampleDataService) => sampleDataService.GetSampleData());

/* This is a route that is mapped to the `/sampledata` endpoint. The `sampleDataService` is injected
into the route and the `AddSampleData` method is called. */
app.MapPost("/sampledata", (ISampleDataService sampleDataService, SampleData sampleData) =>
{
    var results = sampleDataService.AddSampleData(sampleData);
    return Results.Created($"/sampledata", results);
});

//RACKS ENDPOINTS
/* This is a route that is mapped to the `/racks` endpoint. The `rackService` is injected
into the route and the `GetRacks` method is called. */
app.MapGet("/racks", (IRackService rackService) => rackService.GetRacks());

/* This is a route that is mapped to the `/nocustomer` endpoint. The `rackService` is injected
into the route and the `GetRacksNoCustomerId` method is called. */
app.MapGet("/nocustomer", (IRackService rackService) => rackService.GetRacksNoCustomerId());

/* This is a route that is mapped to the `/racksbyrackid/{id}` endpoint. The `rackService` is injected
into the route and the `GetRacksByRackId` method is called. */
app.MapGet("/racksbyrackid/{id}", (IRackService rackService, string id) =>
{
    var results = rackService.GetRacksByRackId(id);
    return Results.Ok(results);
});

/* This is a route that is mapped to the `/racksbycustomerid/{id}` endpoint. The `rackService` is
injected
into the route and the `GetRacksByCustomerId` method is called. */
app.MapGet("/racksbycustomerid/{id}", (IRackService rackService, string id) =>
{
    var results = rackService.GetRacksByCustomerId(id);
    return Results.Ok(results);
});

/* This is a route that is mapped to the `/restock/{rackid}` endpoint. The `rackService` is injected
into the route and the `RestockRack` method is called. */
app.MapGet("/restock/{rackid}", (IRackService rackService, string rackid) =>
{
    var results = rackService.RestockRack(rackid);
    return Results.Ok(results);
});

/* This is a route that is mapped to the `/racks` endpoint. The `rackService` is injected
into the route and the `AddRack` method is called. */
app.MapPost("/racks", (IRackService rackService, Rack rack) =>
{
    var results = rackService.AddRack(rack);
    return Results.Created($"/racks", results);
});

/* This is a route that is mapped to the `/racks` endpoint. The `rackService` is injected
into the route and the `UpdateRack` method is called. */
app.MapPut("/racks", (IRackService rackService, Rack rack) =>
{
    var results = rackService.UpdateRack(rack);
    return Results.Accepted($"/racksbyrackid/{rack.RackId}", results);
});

/* This is a route that is mapped to the `/racks/{rackid}` endpoint. The `rackService` is injected
into the route and the `DeleteRack` method is called. */
app.MapDelete("/racks/{rackid}", (IRackService rackService, string rackid) =>
{
    var results = rackService.DeleteRack(rackid);
    return Results.Ok(results);
});


//PREDICTIONS ENDPOINTS
/* This is a route that is mapped to the `/reloadmodel` endpoint. The `predictionService` is injected
into the route and the `ReloadModel` method is called. */
app.MapGet("/reloadmodel", async (IPredictionService predictionService) =>
{
    var results = await predictionService.ReloadModel();
    return Results.Ok(results);
});

/* This is a route that is mapped to the `/predictions/{customerid}` endpoint. The `predictionService`
is injected
into the route and the `PredictionsByCustomer` method is called. */
app.MapGet("/predictions/{customerid}", (IPredictionService predictionService, string customerid) =>
{
    return Results.Ok(predictionService.PredictionsByCustomer(customerid));
});

/* This is a route that is mapped to the `/predict` endpoint. The `predictionService` is injected
into the route and the `Predict` method is called. */
app.MapPost("/predict", async (IPredictionService predictionService, InputData inputData) =>
{
    var results = await predictionService.Predict(inputData);
    return Results.Accepted($"/predictions/{inputData.RackId}", results);
});

/* This is a route that is mapped to the `/prediction` endpoint. The `predictionService` is injected
into the route and the `AddPrediction` method is called. */
app.MapPost("/prediction", (IPredictionService predictionService, Prediction prediction) =>
{
    var results = predictionService.AddPrediction(prediction);
    return Results.Created($"/predictions/{prediction.RackId}", results);
});


//Local development:
//app.Run("http://localhost:3000");
//Docker image:
app.Run();
