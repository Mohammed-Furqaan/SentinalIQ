package com.sentineliq.dto;

import java.util.List;

public record TeamRequest(
    String name,
    List<Long> memberIds
) {}
