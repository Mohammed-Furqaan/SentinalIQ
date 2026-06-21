package com.sentineliq.dto;

import com.sentineliq.model.Role;

public record AuthResponse(
    String token,
    Long id,
    String username,
    String email,
    Role role
) {}
