using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VideoManager.Api.Contracts;
using VideoManager.Infrastructure.Editing;
using VideoManager.Infrastructure.Models;

namespace VideoManager.Api.Controllers
{
    [ApiController]
    [Route("api/videos")]
    public class VideosController : ControllerBase
    {
        private const int DefaultDueInDays = 3;

        private readonly VideoManagerDbContext _db;

        public VideosController(VideoManagerDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<VideoResponse>>> GetAll()
        {
            var videos = await _db.video
                .AsNoTracking()
                .Select(v => new VideoResponse(v.Id, v.Title, v.Description, v.CreatorId, v.Status, v.Price, v.Due))
                .ToListAsync();

            return Ok(videos);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<VideoResponse>> GetById(int id)
        {
            var video = await _db.video.AsNoTracking().FirstOrDefaultAsync(v => v.Id == id);
            if (video is null)
                return NotFound();

            return Ok(ToResponse(video));
        }

        [HttpPost]
        public async Task<ActionResult<VideoResponse>> Create(VideoRequest request)
        {
            if (!await _db.creator.AnyAsync(c => c.Id == request.CreatorId))
                return BadRequest(new { Message = $"Creator '{request.CreatorId}' does not exist." });

            var video = new Video();
            Apply(video, request);

            _db.video.Add(video);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = video.Id }, ToResponse(video));
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<VideoResponse>> Update(int id, VideoRequest request)
        {
            var video = await _db.video.FindAsync(id);
            if (video is null)
                return NotFound();

            if (!await _db.creator.AnyAsync(c => c.Id == request.CreatorId))
                return BadRequest(new { Message = $"Creator '{request.CreatorId}' does not exist." });

            Apply(video, request);
            await _db.SaveChangesAsync();

            return Ok(ToResponse(video));
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var video = await _db.video.FindAsync(id);
            if (video is null)
                return NotFound();

            _db.video.Remove(video);
            await _db.SaveChangesAsync();

            return NoContent();
        }

        private static void Apply(Video video, VideoRequest request)
        {
            video.Title = request.Title;
            video.Description = request.Description;
            video.CreatorId = request.CreatorId;
            video.Status = request.Status;
            video.Price = request.Price;
            video.Due = request.Due is DateTime due
                ? ToUtc(due)
                : DateTime.UtcNow.AddDays(DefaultDueInDays);
        }

        // Npgsql only accepts UTC values for timestamp with time zone; values without offset are treated as UTC.
        private static DateTime ToUtc(DateTime value) => value.Kind switch
        {
            DateTimeKind.Utc => value,
            DateTimeKind.Local => value.ToUniversalTime(),
            _ => DateTime.SpecifyKind(value, DateTimeKind.Utc)
        };

        private static VideoResponse ToResponse(Video v) =>
            new(v.Id, v.Title, v.Description, v.CreatorId, v.Status, v.Price, v.Due);
    }
}
