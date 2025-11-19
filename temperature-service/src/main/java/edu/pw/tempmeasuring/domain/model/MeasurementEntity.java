package edu.pw.tempmeasuring.domain.model;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "measurements")
public class MeasurementEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "series_id", nullable = false)
    private SeriesEntity series;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal value;

    @Column(name = "timestamp", nullable = false)
    private OffsetDateTime timestamp;

    @Column(length = 100)
    private String label;

    protected MeasurementEntity() {}

    public MeasurementEntity(SeriesEntity series, BigDecimal value, OffsetDateTime timestamp, String label) {
        this.series = series;
        this.value = value;
        this.timestamp = timestamp;
        this.label = label;
    }

    public Long getId() {
        return id;
    }

    public SeriesEntity getSeries() {
        return series;
    }

    public BigDecimal getValue() {
        return value;
    }

    public OffsetDateTime getTimestamp() {
        return timestamp;
    }

    public String getLabel() {
        return label;
    }

    public void setSeries(SeriesEntity series) {
        this.series = series;
    }

    public void setValue(BigDecimal value) {
        this.value = value;
    }

    public void setTimestamp(OffsetDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public void setLabel(String label) {
        this.label = label;
    }
}
