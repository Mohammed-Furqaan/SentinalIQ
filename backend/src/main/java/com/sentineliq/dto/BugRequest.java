package com.sentineliq.dto;

public record BugRequest(
    Long projectId,
    String title,
    String description,
    String severity,
    String status,
    Long assigneeId,
    Long reporterId,
    String resolution
) {}
