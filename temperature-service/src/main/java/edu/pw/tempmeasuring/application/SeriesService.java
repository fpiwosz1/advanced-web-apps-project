package edu.pw.tempmeasuring.application;

import java.util.List;
import java.util.Optional;

import edu.pw.tempmeasuring.adapters.out.persistence.SeriesRepository;
import edu.pw.tempmeasuring.domain.model.SeriesEntity;
import jakarta.inject.Singleton;

@Singleton
public class SeriesService implements SeriesUseCase {

    private final SeriesRepository repo;

    public SeriesService(SeriesRepository repo) {
        this.repo = repo;
    }

    @Override
    public List<SeriesEntity> list() {
        return repo.findAll();
    }

    @Override
    public Optional<SeriesEntity> get(Long id) {
        return repo.findById(id);
    }

    @Override
    public SeriesEntity create(SeriesEntity series) {
        if (series.getMinValue()
                .compareTo(series.getMaxValue()) >= 0) {
            throw new IllegalArgumentException("minValue must be < maxValue");
        }
        return repo.save(series);
    }

    @Override
    public SeriesEntity update(Long id, SeriesEntity update) {
        SeriesEntity current = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Series not found"));
        if (update.getMinValue()
                .compareTo(update.getMaxValue()) >= 0) {
            throw new IllegalArgumentException("minValue must be < maxValue");
        }
        current.setName(update.getName());
        current.setDescription(update.getDescription());
        current.setMinValue(update.getMinValue());
        current.setMaxValue(update.getMaxValue());
        current.setColor(update.getColor());
        current.setIcon(update.getIcon());
        current.setUnit(update.getUnit());
        return repo.update(current);
    }

    @Override
    public void delete(Long id) {
        repo.deleteById(id);
    }
}
