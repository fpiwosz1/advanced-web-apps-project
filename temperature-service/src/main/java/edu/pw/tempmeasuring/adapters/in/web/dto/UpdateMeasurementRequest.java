package edu.pw.tempmeasuring.adapters.in.web.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record UpdateMeasurementRequest(
        BigDecimal value,
        OffsetDateTime timestamp,
        String label
) {}
