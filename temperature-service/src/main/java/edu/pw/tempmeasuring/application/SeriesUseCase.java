package edu.pw.tempmeasuring.application;

import java.util.List;
import java.util.Optional;

import edu.pw.tempmeasuring.domain.model.SeriesEntity;

public interface SeriesUseCase {
    List<SeriesEntity> list();

    Optional<SeriesEntity> get(Long id);

    SeriesEntity create(SeriesEntity series);

    SeriesEntity update(Long id, SeriesEntity update);

    void delete(Long id);
}
