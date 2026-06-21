package com.sentineliq.dto;

import java.time.LocalDate;
import java.util.List;

public record ProjectRequest(
    String name,
    String description,
    String status,
    LocalDate startDate,
    LocalDate endDate,
    Long managerId,
    List<Long> teamIds
) {}
