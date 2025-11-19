package edu.pw.tempmeasuring.adapters.out.persistence;

import edu.pw.tempmeasuring.domain.model.SeriesEntity;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.repository.CrudRepository;

@Repository
public interface SeriesRepository extends CrudRepository<SeriesEntity, Long> {
}
