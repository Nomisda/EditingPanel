package com.editing.editingpanel.Dto;

import java.time.LocalDate;

// Status: 1 = To-Do, 2 = In-Progress, 3 = Done
public record VideoRequest(
        String title,
        String description,
        int creatorId,
        int status,
        int price,
        LocalDate due) {
}
