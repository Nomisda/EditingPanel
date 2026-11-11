using System.ComponentModel.DataAnnotations;

namespace VideoManager.Api.Contracts
{
    // Status: 1 = To-Do, 2 = In-Progress, 3 = Done
    public record VideoRequest(
        [Required, MaxLength(200)] string Title,
        [MaxLength(4000)] string? Description,
        [Range(1, int.MaxValue)] int CreatorId,
        [Range(1, 3)] int Status,
        [Range(0, int.MaxValue)] int Price,
        DateTime? Due);

    public record VideoResponse(
        int Id,
        string Title,
        string? Description,
        int CreatorId,
        int Status,
        int Price,
        DateTime Due);
}
