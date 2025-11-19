package edu.pw.tempmeasuring.adapters.in.web.api;

import java.time.OffsetDateTime;
import java.util.List;

import edu.pw.tempmeasuring.adapters.in.web.dto.CreateMeasurementRequest;
import edu.pw.tempmeasuring.adapters.in.web.dto.MeasurementDto;
import edu.pw.tempmeasuring.adapters.in.web.dto.UpdateMeasurementRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Measurements API")
public interface MeasurementsApi {

    @Get(produces = MediaType.APPLICATION_JSON)
    @Operation(summary = "List measurements with optional filters")
    HttpResponse<List<MeasurementDto>> list(@QueryValue(value = "seriesIds", defaultValue = "") List<Long> seriesIds,
            @QueryValue(value = "from", defaultValue = "") OffsetDateTime from,
            @QueryValue(value = "to", defaultValue = "") OffsetDateTime to);

    @Get(uri = "/{id}", produces = MediaType.APPLICATION_JSON)
    @Operation(summary = "Get measurement by id")
    HttpResponse<MeasurementDto> get(@PathVariable Long id);

    @Post(consumes = MediaType.APPLICATION_JSON, produces = MediaType.APPLICATION_JSON)
    @Operation(summary = "Create measurement")
    HttpResponse<MeasurementDto> create(@Body CreateMeasurementRequest req, @Header("Authorization") String authorization);

    @Put(uri = "/{id}", consumes = MediaType.APPLICATION_JSON, produces = MediaType.APPLICATION_JSON)
    @Operation(summary = "Update measurement")
    HttpResponse<MeasurementDto> update(@PathVariable Long id, @Body UpdateMeasurementRequest req,
            @Header("Authorization") String authorization);

    @Delete(uri = "/{id}")
    @Operation(summary = "Delete measurement")
    HttpResponse<String> delete(@PathVariable Long id, @Header("Authorization") String authorization);
}
