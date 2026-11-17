package com.editing.editingpanel.Controller;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.editing.editingpanel.Dto.VideoRequest;
import com.editing.editingpanel.Model.Video;
import com.editing.editingpanel.Repositories.CreatorRepository;
import com.editing.editingpanel.Repositories.VideoRepository;

@RestController
@RequestMapping("/api/videos")
public class VideoController {

    private static final int DEFAULT_DUE_IN_DAYS = 3;

    private final VideoRepository videoRepository;
    private final CreatorRepository creatorRepository;

    public VideoController(VideoRepository videoRepository, CreatorRepository creatorRepository) {
        this.videoRepository = videoRepository;
        this.creatorRepository = creatorRepository;
    }

    @GetMapping
    public List<Video> getAll() {
        return videoRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Video> getById(@PathVariable int id) {
        return videoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody VideoRequest request) {
        if (!creatorRepository.existsById(request.creatorId()))
            return creatorMissing(request.creatorId());

        Video video = new Video();
        apply(video, request);
        Video saved = videoRepository.save(video);

        return ResponseEntity.created(URI.create("/api/videos/" + saved.getId())).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable int id, @RequestBody VideoRequest request) {
        Video video = videoRepository.findById(id).orElse(null);
        if (video == null)
            return ResponseEntity.notFound().build();

        if (!creatorRepository.existsById(request.creatorId()))
            return creatorMissing(request.creatorId());

        apply(video, request);
        return ResponseEntity.ok(videoRepository.save(video));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        if (!videoRepository.existsById(id))
            return ResponseEntity.notFound().build();

        videoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private static void apply(Video video, VideoRequest r) {
        video.setTitle(r.title());
        video.setDescription(r.description());
        video.setCreatorId(r.creatorId());
        video.setStatus(r.status());
        video.setPrice(r.price());
        video.setDue(r.due() != null ? r.due() : LocalDate.now().plusDays(DEFAULT_DUE_IN_DAYS));
    }

    private static ResponseEntity<Map<String, String>> creatorMissing(int creatorId) {
        return ResponseEntity.badRequest()
                .body(Map.of("message", "Creator '" + creatorId + "' does not exist."));
    }
}
