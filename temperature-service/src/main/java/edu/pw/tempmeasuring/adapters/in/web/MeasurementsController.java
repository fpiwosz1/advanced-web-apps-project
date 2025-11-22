package edu.pw.tempmeasuring.adapters.in.web;

import java.time.OffsetDateTime;
import java.util.List;

import edu.pw.tempmeasuring.adapters.in.web.api.MeasurementsApi;
import edu.pw.tempmeasuring.adapters.in.web.dto.CreateMeasurementRequest;
import edu.pw.tempmeasuring.adapters.in.web.dto.MeasurementDto;
import edu.pw.tempmeasuring.adapters.in.web.dto.UpdateMeasurementRequest;
import edu.pw.tempmeasuring.adapters.in.web.mapper.ModelMapper;
import edu.pw.tempmeasuring.adapters.out.security.JwtService;
import edu.pw.tempmeasuring.application.MeasurementUseCase;
import edu.pw.tempmeasuring.application.SeriesUseCase;
import edu.pw.tempmeasuring.domain.model.MeasurementEntity;
import edu.pw.tempmeasuring.domain.model.SeriesEntity;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.Controller;
import org.slf4j.Logger;

import static org.slf4j.LoggerFactory.getLogger;

@Controller("/api/v1/measurements")
public class MeasurementsController implements MeasurementsApi {

    private final MeasurementUseCase measurementUseCase;
    private final SeriesUseCase seriesUseCase;
    private final JwtService jwtService;
    private final ModelMapper mapper;

    private static final Logger log = getLogger(MeasurementsController.class);

    public MeasurementsController(MeasurementUseCase measurementUseCase,
            SeriesUseCase seriesUseCase,
            JwtService jwtService,
            ModelMapper mapper) {
        this.measurementUseCase = measurementUseCase;
        this.seriesUseCase = seriesUseCase;
        this.jwtService = jwtService;
        this.mapper = mapper;
    }

    @Override
    public HttpResponse<List<MeasurementDto>> list(List<Long> seriesIds, OffsetDateTime from, OffsetDateTime to) {
        log.info("Listing measurements for seriesIds: {}, from: {}, to: {}", seriesIds, from, to);
        List<MeasurementDto> items = measurementUseCase.list(seriesIds, from, to)
                .stream()
                .map(mapper::toMeasurementDto)
                .toList();
        return HttpResponse.ok(items);
    }

    @Override
    public HttpResponse<MeasurementDto> get(Long id) {
        log.info("Getting measurement with id: {}", id);
        return measurementUseCase.get(id)
                .map(m -> HttpResponse.ok(mapper.toMeasurementDto(m)))
                .orElse(HttpResponse.notFound());
    }

    @Override
    public HttpResponse<MeasurementDto> create(CreateMeasurementRequest req, String authorization) {
        if (!isAuthorized(authorization))
            return HttpResponse.unauthorized();
        log.info("Creating measurement for seriesId: {}", req.seriesId());
        try {
            SeriesEntity series = seriesUseCase.get(req.seriesId())
                    .orElseThrow(() -> new IllegalArgumentException("Series not found"));
            var entity = new MeasurementEntity(series, req.value(), req.timestamp(), req.label());
            var saved = measurementUseCase.create(entity);
            return HttpResponse.created(mapper.toMeasurementDto(saved));
        } catch (IllegalArgumentException e) {
            return HttpResponse.badRequest();
        }
    }

    @Override
    public HttpResponse<MeasurementDto> update(Long id, UpdateMeasurementRequest req, String authorization) {
        if (!isAuthorized(authorization))
            return HttpResponse.unauthorized();
        log.info("Updating measurement with id: {}", id);
        try {
            var current = measurementUseCase.get(id)
                    .orElseThrow(() -> new IllegalArgumentException("Measurement not found"));
            var updated = new MeasurementEntity(current.getSeries(), req.value(), req.timestamp(), req.label());
            var saved = measurementUseCase.update(id, updated);
            return HttpResponse.ok(mapper.toMeasurementDto(saved));
        } catch (IllegalArgumentException e) {
            return HttpResponse.badRequest();
        }
    }

    @Override
    public HttpResponse<String> delete(Long id, String authorization) {
        if (!isAuthorized(authorization))
            return HttpResponse.unauthorized();
        log.info("Deleting measurement with id: {}", id);
        measurementUseCase.delete(id);
        return HttpResponse.noContent();
    }

    private boolean isAuthorized(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer "))
            return false;
        return jwtService.parseClaims(authorization.substring(7))
                .isPresent();
    }
}
