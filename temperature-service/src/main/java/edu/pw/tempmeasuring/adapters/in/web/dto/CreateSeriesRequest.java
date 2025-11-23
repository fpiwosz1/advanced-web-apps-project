package edu.pw.tempmeasuring.adapters.in.web.dto;

import java.math.BigDecimal;

import io.micronaut.serde.annotation.Serdeable;

@Serdeable
public record CreateSeriesRequest(
        String name,
        String description,
        BigDecimal minValue,
        BigDecimal maxValue,
        String color,
        String unit
) {}
