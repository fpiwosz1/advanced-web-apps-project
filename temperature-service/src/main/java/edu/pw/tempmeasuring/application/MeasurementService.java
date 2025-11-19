package edu.pw.tempmeasuring.application;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import edu.pw.tempmeasuring.adapters.out.persistence.MeasurementRepository;
import edu.pw.tempmeasuring.adapters.out.persistence.SeriesRepository;
import edu.pw.tempmeasuring.domain.model.MeasurementEntity;
import edu.pw.tempmeasuring.domain.model.SeriesEntity;
import jakarta.inject.Singleton;

@Singleton
public class MeasurementService implements MeasurementUseCase {

    private final MeasurementRepository measurementRepo;
    private final SeriesRepository seriesRepo;

    public MeasurementService(MeasurementRepository measurementRepo, SeriesRepository seriesRepo) {
        this.measurementRepo = measurementRepo;
        this.seriesRepo = seriesRepo;
    }

    @Override
    public List<MeasurementEntity> list(List<Long> seriesIds, OffsetDateTime from, OffsetDateTime to) {
        List<MeasurementEntity> base;
        if (seriesIds != null && !seriesIds.isEmpty()) {
            base = measurementRepo.findBySeriesIdInOrderByTimestampAsc(seriesIds);
        } else {
            base = measurementRepo.findAll();
            base.sort(Comparator.comparing(MeasurementEntity::getTimestamp));
        }
        return base.stream()
                .filter(m -> from == null || !m.getTimestamp()
                        .isBefore(from))
                .filter(m -> to == null || !m.getTimestamp()
                        .isAfter(to))
                .toList();
    }

    @Override
    public Optional<MeasurementEntity> get(Long id) {
        return measurementRepo.findById(id);
    }

    @Override
    public MeasurementEntity create(MeasurementEntity measurement) {
        validateAgainstSeriesRange(measurement.getSeries(), measurement.getValue());
        return measurementRepo.save(measurement);
    }

    @Override
    public MeasurementEntity update(Long id, MeasurementEntity update) {
        MeasurementEntity current = measurementRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Measurement not found"));
        validateAgainstSeriesRange(update.getSeries(), update.getValue());
        current.setSeries(update.getSeries());
        current.setValue(update.getValue());
        current.setTimestamp(update.getTimestamp());
        current.setLabel(update.getLabel());
        return measurementRepo.update(current);
    }

    @Override
    public void delete(Long id) {
        measurementRepo.deleteById(id);
    }

    private void validateAgainstSeriesRange(SeriesEntity series, BigDecimal value) {
        SeriesEntity s = seriesRepo.findById(series.getId())
                .orElseThrow(() -> new IllegalArgumentException("Series not found"));
        if (value.compareTo(s.getMinValue()) < 0 || value.compareTo(s.getMaxValue()) > 0) {
            throw new IllegalArgumentException("Value is outside allowed range for series '" + s.getName() + "'");
        }
    }
}
