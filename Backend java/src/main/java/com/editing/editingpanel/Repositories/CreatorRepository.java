package com.editing.editingpanel.Repositories;
import org.springframework.data.jpa.repository.JpaRepository;
import com.editing.editingpanel.Model.Creator;

public interface CreatorRepository extends JpaRepository<Creator, Integer> {
    
}
