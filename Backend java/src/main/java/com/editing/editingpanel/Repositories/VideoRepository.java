package com.editing.editingpanel.Repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.editing.editingpanel.Model.Video;

public interface VideoRepository extends JpaRepository<Video, Integer> {

    List<Video> findByCreatorId(int creatorId);

    boolean existsByCreatorId(int creatorId);
}
