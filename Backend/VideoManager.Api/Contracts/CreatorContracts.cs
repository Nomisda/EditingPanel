using System.ComponentModel.DataAnnotations;

namespace VideoManager.Api.Contracts
{
    public record CreatorRequest(
        [Required, MaxLength(200)] string Name);

    public record CreatorResponse(
        int Id,
        string Name);
}
