package edu.pw.tempmeasuring.adapters.in.web.mapper;

import edu.pw.tempmeasuring.adapters.in.web.dto.MeasurementDto;
import edu.pw.tempmeasuring.adapters.in.web.dto.SeriesDto;
import edu.pw.tempmeasuring.domain.model.MeasurementEntity;
import edu.pw.tempmeasuring.domain.model.SeriesEntity;
import jakarta.inject.Singleton;

@Singleton
public class ModelMapper {

    public SeriesDto toSeriesDto(SeriesEntity e) {
        return new SeriesDto(
                e.getId(), e.getName(), e.getDescription(),
                e.getMinValue(), e.getMaxValue(),
                e.getColor(), e.getIcon(), e.getUnit());
    }

    public MeasurementDto toMeasurementDto(MeasurementEntity e) {
        return new MeasurementDto(
                e.getId(),
                e.getSeries()
                        .getId(),
                e.getValue(),
                e.getTimestamp(),
                e.getLabel());
    }
}
