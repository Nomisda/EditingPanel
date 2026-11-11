using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VideoManager.Api.Contracts;
using VideoManager.Infrastructure.Editing;
using VideoManager.Infrastructure.Models;

namespace VideoManager.Api.Controllers
{
    [ApiController]
    [Route("api/creators")]
    public class CreatorsController : ControllerBase
    {
        private readonly VideoManagerDbContext _db;

        public CreatorsController(VideoManagerDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CreatorResponse>>> GetAll()
        {
            var creators = await _db.creator
                .AsNoTracking()
                .Select(c => new CreatorResponse(c.Id, c.Name))
                .ToListAsync();

            return Ok(creators);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<CreatorResponse>> GetById(int id)
        {
            var creator = await _db.creator.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id);
            if (creator is null)
                return NotFound();

            return Ok(ToResponse(creator));
        }

        [HttpGet("{id:int}/videos")]
        public async Task<ActionResult<IEnumerable<VideoResponse>>> GetVideos(int id)
        {
            if (!await _db.creator.AnyAsync(c => c.Id == id))
                return NotFound();

            var videos = await _db.video
                .AsNoTracking()
                .Where(v => v.CreatorId == id)
                .Select(v => new VideoResponse(v.Id, v.Title, v.Description, v.CreatorId, v.Status, v.Price, v.Due))
                .ToListAsync();

            return Ok(videos);
        }

        [HttpPost]
        public async Task<ActionResult<CreatorResponse>> Create(CreatorRequest request)
        {
            var creator = new Creator
            {
                Name = request.Name
            };

            _db.creator.Add(creator);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = creator.Id }, ToResponse(creator));
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<CreatorResponse>> Update(int id, CreatorRequest request)
        {
            var creator = await _db.creator.FindAsync(id);
            if (creator is null)
                return NotFound();

            creator.Name = request.Name;
            await _db.SaveChangesAsync();

            return Ok(ToResponse(creator));
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var creator = await _db.creator.FindAsync(id);
            if (creator is null)
                return NotFound();

            if (await _db.video.AnyAsync(v => v.CreatorId == id))
                return Conflict(new { Message = "Creator still has videos and cannot be deleted." });
                
            _db.creator.Remove(creator);
            await _db.SaveChangesAsync();

            return NoContent();
        }

        private static CreatorResponse ToResponse(Creator c) => new(c.Id, c.Name);
    }
}
