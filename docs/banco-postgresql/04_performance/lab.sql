\set ON_ERROR_STOP on
-- Executar SOMENTE em banco descartavel local.
CREATE SCHEMA IF NOT EXISTS obra_perf;
DROP TABLE IF EXISTS obra_perf.carga;
CREATE TABLE obra_perf.carga (id bigint PRIMARY KEY, payload text NOT NULL);
SELECT pg_size_pretty(pg_total_relation_size('obra_perf.carga')) AS antes;
INSERT INTO obra_perf.carga SELECT n, repeat(md5(n::text), 16) FROM generate_series(1, 20000) n;
ANALYZE obra_perf.carga;
SELECT count(*) AS linhas, pg_size_pretty(pg_total_relation_size('obra_perf.carga')) AS apos_crescimento FROM obra_perf.carga;
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM obra_perf.carga WHERE id=10000;
DELETE FROM obra_perf.carga;
SELECT pg_size_pretty(pg_total_relation_size('obra_perf.carga')) AS apos_delete_sem_compactar;
VACUUM (FULL, ANALYZE) obra_perf.carga;
SELECT pg_size_pretty(pg_total_relation_size('obra_perf.carga')) AS apos_compactacao;
