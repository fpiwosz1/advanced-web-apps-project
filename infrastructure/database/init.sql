-- tables
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE series (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    min_value DECIMAL(10, 2) NOT NULL,
    max_value DECIMAL(10, 2) NOT NULL,
    color VARCHAR(7) NOT NULL,
    icon VARCHAR(50),
    unit VARCHAR(10) DEFAULT '°C',

    CONSTRAINT check_min_max CHECK (min_value < max_value),
    CONSTRAINT check_color_format CHECK (color ~ '^#[0-9A-Fa-f]{6}$')
);

CREATE TABLE measurements (
    id SERIAL PRIMARY KEY,
    series_id INTEGER NOT NULL REFERENCES series(id) ON DELETE CASCADE,
    value DECIMAL(10, 2) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    label VARCHAR(100)
);

-- validations
CREATE OR REPLACE FUNCTION validate_measurement_value()
RETURNS TRIGGER AS $$
DECLARE
    v_min_value DECIMAL(10, 2);
    v_max_value DECIMAL(10, 2);
    v_series_name VARCHAR(100);
BEGIN
    SELECT min_value, max_value, name
    INTO v_min_value, v_max_value, v_series_name
    FROM series
    WHERE id = NEW.series_id;

    IF NEW.value < v_min_value OR NEW.value > v_max_value THEN
        RAISE EXCEPTION 'Value % is outside the allowed range [%, %] for series "%"',
            NEW.value, v_min_value, v_max_value, v_series_name;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_measurement_value
    BEFORE INSERT OR UPDATE ON measurements
    FOR EACH ROW
    EXECUTE FUNCTION validate_measurement_value();

-- db users
CREATE USER authuser WITH PASSWORD 'auth_password';
CREATE USER tempuser WITH PASSWORD 'temp_password';

GRANT CONNECT ON DATABASE temperature_monitoring TO authuser;
GRANT CONNECT ON DATABASE temperature_monitoring TO tempuser;

GRANT USAGE ON SCHEMA public TO authuser;
GRANT USAGE ON SCHEMA public TO tempuser;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE users TO authuser;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE series TO tempuser;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE measurements TO tempuser;

GRANT USAGE, SELECT ON SEQUENCE users_id_seq TO authuser;
GRANT USAGE, SELECT ON SEQUENCE series_id_seq TO tempuser;
GRANT USAGE, SELECT ON SEQUENCE measurements_id_seq TO tempuser;
