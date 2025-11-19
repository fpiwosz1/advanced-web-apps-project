package edu.pw.tempmeasuring.adapters.in.web.api;

import java.util.List;

import edu.pw.tempmeasuring.adapters.in.web.dto.CreateSeriesRequest;
import edu.pw.tempmeasuring.adapters.in.web.dto.SeriesDto;
import edu.pw.tempmeasuring.adapters.in.web.dto.UpdateSeriesRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Series API")
public interface SeriesApi {

    @Get(produces = MediaType.APPLICATION_JSON)
    @Operation(summary = "List series")
    HttpResponse<List<SeriesDto>> list();

    @Get(uri = "/{id}", produces = MediaType.APPLICATION_JSON)
    @Operation(summary = "Get series by id")
    HttpResponse<SeriesDto> get(@PathVariable Long id);

    @Post(consumes = MediaType.APPLICATION_JSON, produces = MediaType.APPLICATION_JSON)
    @Operation(summary = "Create series")
    HttpResponse<SeriesDto> create(@Body CreateSeriesRequest req, @Header("Authorization") String authorization);

    @Put(uri = "/{id}", consumes = MediaType.APPLICATION_JSON, produces = MediaType.APPLICATION_JSON)
    @Operation(summary = "Update series")
    HttpResponse<SeriesDto> update(@PathVariable Long id, @Body UpdateSeriesRequest req, @Header("Authorization") String authorization);

    @Delete(uri = "/{id}")
    @Operation(summary = "Delete series")
    HttpResponse<String> delete(@PathVariable Long id, @Header("Authorization") String authorization);
}
