package com.editing.editingpanel.Controller;

import java.net.URI;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.editing.editingpanel.Dto.CreatorRequest;
import com.editing.editingpanel.Model.Creator;
import com.editing.editingpanel.Model.Video;
import com.editing.editingpanel.Repositories.CreatorRepository;
import com.editing.editingpanel.Repositories.VideoRepository;

@RestController
@RequestMapping("/api/creators")
public class CreatorController {

    private final CreatorRepository creatorRepository;
    private final VideoRepository videoRepository;

    public CreatorController(CreatorRepository creatorRepository, VideoRepository videoRepository) {
        this.creatorRepository = creatorRepository;
        this.videoRepository = videoRepository;
    }

    @GetMapping
    public List<Creator> getAll() {
        return creatorRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Creator> getById(@PathVariable int id) {
        return creatorRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/videos")
    public ResponseEntity<List<Video>> getVideos(@PathVariable int id) {
        if (!creatorRepository.existsById(id))
            return ResponseEntity.notFound().build();

        return ResponseEntity.ok(videoRepository.findByCreatorId(id));
    }

    @PostMapping
    public ResponseEntity<Creator> create(@RequestBody CreatorRequest request) {
        Creator creator = new Creator();
        creator.setName(request.name());
        Creator saved = creatorRepository.save(creator);

        return ResponseEntity.created(URI.create("/api/creators/" + saved.getId())).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Creator> update(@PathVariable int id, @RequestBody CreatorRequest request) {
        Creator creator = creatorRepository.findById(id).orElse(null);
        if (creator == null)
            return ResponseEntity.notFound().build();

        creator.setName(request.name());
        return ResponseEntity.ok(creatorRepository.save(creator));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable int id) {
        if (!creatorRepository.existsById(id))
            return ResponseEntity.notFound().build();

        if (videoRepository.existsByCreatorId(id))
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Creator still has videos and cannot be deleted."));

        creatorRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
