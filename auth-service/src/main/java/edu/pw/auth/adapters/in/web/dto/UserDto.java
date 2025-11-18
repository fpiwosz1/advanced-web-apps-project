package edu.pw.auth.adapters.in.web.dto;

import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UserDto(
        Long id,
        String username
) {}
