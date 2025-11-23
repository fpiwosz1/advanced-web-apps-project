package edu.pw.tempmeasuring.adapters.in.web;

import static org.slf4j.LoggerFactory.getLogger;

import java.util.List;

import org.slf4j.Logger;

import edu.pw.tempmeasuring.adapters.in.web.api.SeriesApi;
import edu.pw.tempmeasuring.adapters.in.web.dto.CreateSeriesRequest;
import edu.pw.tempmeasuring.adapters.in.web.dto.SeriesDto;
import edu.pw.tempmeasuring.adapters.in.web.dto.UpdateSeriesRequest;
import edu.pw.tempmeasuring.adapters.in.web.mapper.ModelMapper;
import edu.pw.tempmeasuring.adapters.out.security.JwtService;
import edu.pw.tempmeasuring.application.SeriesUseCase;
import edu.pw.tempmeasuring.domain.model.SeriesEntity;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.Controller;

@Controller("/api/v1/series")
public class SeriesController implements SeriesApi {

    private final SeriesUseCase seriesUseCase;
    private final JwtService jwtService;
    private final ModelMapper mapper;

    private static final Logger log = getLogger(SeriesController.class);

    public SeriesController(SeriesUseCase seriesUseCase, JwtService jwtService, ModelMapper mapper) {
        this.seriesUseCase = seriesUseCase;
        this.jwtService = jwtService;
        this.mapper = mapper;
    }

    @Override
    public HttpResponse<List<SeriesDto>> list() {
        log.info("Listing all series");
        List<SeriesDto> all = seriesUseCase.list()
                .stream()
                .map(mapper::toSeriesDto)
                .toList();
        return HttpResponse.ok(all);
    }

    @Override
    public HttpResponse<SeriesDto> get(Long id) {
        log.info("Getting series with id: {}", id);
        return seriesUseCase.get(id)
                .map(s -> HttpResponse.ok(mapper.toSeriesDto(s)))
                .orElse(HttpResponse.notFound());
    }

    @Override
    public HttpResponse<SeriesDto> create(CreateSeriesRequest req, String authorization) {
        if (!isAuthorized(authorization))
            return HttpResponse.unauthorized();
        log.info("Creating new series: {}", req.name());
        try {
            SeriesEntity entity = new SeriesEntity(req.name(), req.description(), req.minValue(), req.maxValue(),
                    req.color(), req.unit());
            SeriesEntity saved = seriesUseCase.create(entity);
            return HttpResponse.created(mapper.toSeriesDto(saved));
        } catch (IllegalArgumentException e) {
            return HttpResponse.badRequest();
        }
    }

    @Override
    public HttpResponse<SeriesDto> update(Long id, UpdateSeriesRequest req, String authorization) {
        if (!isAuthorized(authorization))
            return HttpResponse.unauthorized();
        log.info("Updating series with id: {}", id);
        try {
            SeriesEntity update = new SeriesEntity(req.name(), req.description(), req.minValue(), req.maxValue(),
                    req.color(), req.unit());
            SeriesEntity saved = seriesUseCase.update(id, update);
            return HttpResponse.ok(mapper.toSeriesDto(saved));
        } catch (IllegalArgumentException e) {
            return HttpResponse.badRequest();
        }
    }

    @Override
    public HttpResponse<String> delete(Long id, String authorization) {
        if (!isAuthorized(authorization))
            return HttpResponse.unauthorized();
        log.info("Deleting series with id: {}", id);
        seriesUseCase.delete(id);
        return HttpResponse.noContent();
    }

    private boolean isAuthorized(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer "))
            return false;
        return jwtService.parseClaims(authorization.substring(7))
                .isPresent();
    }
}
