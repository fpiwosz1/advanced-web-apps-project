package edu.pw.tempmeasuring.application;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import edu.pw.tempmeasuring.domain.model.MeasurementEntity;

public interface MeasurementUseCase {
    List<MeasurementEntity> list(List<Long> seriesIds, OffsetDateTime from, OffsetDateTime to);

    Optional<MeasurementEntity> get(Long id);

    MeasurementEntity create(MeasurementEntity measurement);

    MeasurementEntity update(Long id, MeasurementEntity update);

    void delete(Long id);
}
