using Microsoft.EntityFrameworkCore;
using VideoManager.Infrastructure;
using VideoManager.Infrastructure.Editing;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();
//builder.Services.AddSwaggerGen();

//builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddDbContext<VideoManagerDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Postgres"))
    );

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    //app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapControllers();

app.MapGet("/api/health", () => Results.Ok(new
{
    Status = "Running",
    Application = "VideoManager API"
}));

app.MapGet("/api/health/database",
    async (VideoManagerDbContext db) =>
    {
        var connected = await db.Database.CanConnectAsync();

        return connected
            ? Results.Ok(new { Status = "Database connected" })
            : Results.Problem("Database connection failed.");
    });

app.Run();