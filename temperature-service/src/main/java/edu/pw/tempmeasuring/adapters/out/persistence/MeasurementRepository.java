package edu.pw.tempmeasuring.adapters.out.persistence;

import java.util.List;

import edu.pw.tempmeasuring.domain.model.MeasurementEntity;
import edu.pw.tempmeasuring.domain.model.SeriesEntity;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.repository.CrudRepository;

@Repository
public interface MeasurementRepository extends CrudRepository<MeasurementEntity, Long> {
    List<MeasurementEntity> findBySeries(SeriesEntity series);

    List<MeasurementEntity> findBySeriesIdInOrderByTimestampAsc(List<Long> seriesIds);
}
