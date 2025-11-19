package edu.pw.tempmeasuring.adapters.in.web.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record MeasurementDto(
        Long id,
        Long seriesId,
        BigDecimal value,
        OffsetDateTime timestamp,
        String label
) {}
