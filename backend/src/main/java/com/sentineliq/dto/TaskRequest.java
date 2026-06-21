package com.sentineliq.dto;

import java.time.LocalDate;

public record TaskRequest(
    Long projectId,
    Long sprintId,
    String title,
    String description,
    String priority,
    String status,
    LocalDate dueDate,
    Long assigneeId
) {}
