BEGIN;

DELETE FROM measurements
WHERE series_id IN (
  SELECT id FROM series
  WHERE name IN ('Warsaw','Cracow','Wrocław','Poznań','Suwałki')
);

DELETE FROM series
WHERE name IN ('Warsaw','Cracow','Wrocław','Poznań','Suwałki');

INSERT INTO series (name, description, min_value, max_value, color, unit)
VALUES
  ('Warsaw',  'Urban station; moderate daily swings and occasional afternoon warm-up.',      -10.00, 35.00, '#1E90FF', '°C'),
  ('Cracow',  'Valley microclimate; larger daily amplitude, frequent morning dips.',         -15.00, 33.00, '#FF6347', '°C'),
  ('Wrocław', 'Lower Silesia; mild continental pattern with urban influence.',               -12.00, 34.00, '#8A2BE2', '°C'),
  ('Poznań',  'Central-west; continental pattern, pronounced midday peaks.',                 -13.00, 36.00, '#32CD32', '°C'),
  ('Suwałki', 'North-east; colder baseline, sharp nocturnal cooling episodes.',              -30.00, 25.00, '#20B2AA', '°C');

WITH s AS (
  SELECT id, name, min_value, max_value
  FROM series
  WHERE name IN ('Warsaw','Cracow','Wrocław','Poznań','Suwałki')
),
ts AS (
  SELECT generate_series(now() - interval '10 days', now(), interval '3 hours') AS ts
)
INSERT INTO measurements (series_id, value, timestamp, label)
SELECT
  s.id,
  LEAST(s.max_value, GREATEST(s.min_value, base + noise + spike)),
  ts.ts,
  ''
FROM s
CROSS JOIN ts
CROSS JOIN LATERAL (
  SELECT
    CASE s.name
      WHEN 'Warsaw'  THEN 17 + 7 * sin(extract(epoch FROM ts.ts)/86400 * 1.30) + 2  * cos(extract(epoch FROM ts.ts)/86400 * 0.70)
      WHEN 'Cracow'  THEN 15 + 9 * sin(extract(epoch FROM ts.ts)/86400 * 1.10 + 0.80) + 1.5* cos(extract(epoch FROM ts.ts)/86400 * 0.60)
      WHEN 'Wrocław' THEN 16 + 8 * sin(extract(epoch FROM ts.ts)/86400 * 0.95 + 0.40) + 1.2* cos(extract(epoch FROM ts.ts)/86400 * 0.75)
      WHEN 'Poznań'  THEN 18 + 10* sin(extract(epoch FROM ts.ts)/86400 * 1.20 + 0.30) + 1.0* cos(extract(epoch FROM ts.ts)/86400 * 0.65)
      WHEN 'Suwałki' THEN 5  + 12* sin(extract(epoch FROM ts.ts)/86400 * 1.00 + 1.10) - 3.0* cos(extract(epoch FROM ts.ts)/86400 * 0.85)
      ELSE 0
    END AS base,
    (random()*2 - 1) * 1.6 AS noise,
    CASE
      WHEN s.name = 'Warsaw'  AND ts.ts::date = current_date - 6 AND date_part('hour', ts.ts) = 15 THEN 11
      WHEN s.name = 'Cracow'  AND ts.ts::date = current_date - 4 AND date_part('hour', ts.ts) = 5  THEN -10
      WHEN s.name = 'Wrocław' AND ts.ts::date = current_date - 3 AND date_part('hour', ts.ts) = 14 THEN 9
      WHEN s.name = 'Poznań'  AND ts.ts::date = current_date - 2 AND date_part('hour', ts.ts) = 12 THEN 10
      WHEN s.name = 'Suwałki' AND ts.ts::date = current_date - 1 AND date_part('hour', ts.ts) = 3  THEN -12
      ELSE 0
    END AS spike
) calc;

INSERT INTO measurements (series_id, value, timestamp, label)
SELECT id, min_value + (max_value - min_value) * 0.92, now() - interval '52 hours', 'Afternoon peak'
FROM series WHERE name = 'Warsaw';

INSERT INTO measurements (series_id, value, timestamp, label)
SELECT id, min_value + (max_value - min_value) * 0.15, now() - interval '70 hours', 'Morning dip'
FROM series WHERE name = 'Cracow';

INSERT INTO measurements (series_id, value, timestamp, label)
SELECT id, min_value + (max_value - min_value) * 0.95, now() - interval '40 hours', 'Urban spike'
FROM series WHERE name = 'Wrocław';

INSERT INTO measurements (series_id, value, timestamp, label)
SELECT id, min_value + (max_value - min_value) * 0.98, now() - interval '28 hours', 'Midday peak'
FROM series WHERE name = 'Poznań';

INSERT INTO measurements (series_id, value, timestamp, label)
SELECT id, min_value + (max_value - min_value) * 0.07, now() - interval '24 hours', 'Polar chill'
FROM series WHERE name = 'Suwałki';

COMMIT;