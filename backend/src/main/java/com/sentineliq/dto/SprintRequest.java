package com.sentineliq.dto;

import java.time.LocalDate;

public record SprintRequest(
    Long projectId,
    String name,
    String goal,
    LocalDate startDate,
    LocalDate endDate,
    String status,
    Double completionPercentage
) {}
