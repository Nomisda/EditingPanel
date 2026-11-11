using Microsoft.EntityFrameworkCore;
using VideoManager.Infrastructure.Models;

namespace VideoManager.Infrastructure.Editing
{
    public class VideoManagerDbContext : DbContext
    {
        public VideoManagerDbContext(DbContextOptions<VideoManagerDbContext> options)
            : base(options)
        {
        }

        public DbSet<Video> video => Set<Video>();
        public DbSet<Creator> creator => Set<Creator>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Creator>(entity =>
            {
                entity.ToTable("creator");
                entity.HasKey(c => c.Id);
                entity.Property(c => c.Id).HasColumnName("id");
                entity.Property(c => c.Name).HasColumnName("name").IsRequired().HasMaxLength(200);
            });

            modelBuilder.Entity<Video>(entity =>
            {
                entity.ToTable("video");
                entity.HasKey(v => v.Id);
                entity.Property(v => v.Id).HasColumnName("id");
                entity.Property(v => v.Title).HasColumnName("title").IsRequired().HasMaxLength(200);
                entity.Property(v => v.Description).HasColumnName("description").HasMaxLength(4000);
                entity.Property(v => v.CreatorId).HasColumnName("creatorid");
                entity.Property(v => v.Status).HasColumnName("status").IsRequired();
                entity.Property(v => v.Price).HasColumnName("price").IsRequired();
                entity.Property(v => v.Due).HasColumnName("due").HasColumnType("date");

                entity.HasOne<Creator>()
                    .WithMany()
                    .HasForeignKey(v => v.CreatorId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
