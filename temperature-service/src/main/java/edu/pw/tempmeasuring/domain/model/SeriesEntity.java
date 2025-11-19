package edu.pw.tempmeasuring.domain.model;

import java.math.BigDecimal;

import jakarta.persistence.*;

@Entity
@Table(name = "series")
public class SeriesEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "min_value", nullable = false, precision = 10, scale = 2)
    private BigDecimal minValue;

    @Column(name = "max_value", nullable = false, precision = 10, scale = 2)
    private BigDecimal maxValue;

    @Column(nullable = false, length = 7)
    private String color;

    @Column(length = 50)
    private String icon;

    @Column(length = 10)
    private String unit = "°C";

    protected SeriesEntity() {}

    public SeriesEntity(String name, String description, BigDecimal minValue, BigDecimal maxValue,
            String color, String icon, String unit) {
        this.name = name;
        this.description = description;
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.color = color;
        this.icon = icon;
        this.unit = unit;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public BigDecimal getMinValue() {
        return minValue;
    }

    public BigDecimal getMaxValue() {
        return maxValue;
    }

    public String getColor() {
        return color;
    }

    public String getIcon() {
        return icon;
    }

    public String getUnit() {
        return unit;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setMinValue(BigDecimal minValue) {
        this.minValue = minValue;
    }

    public void setMaxValue(BigDecimal maxValue) {
        this.maxValue = maxValue;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }
}
