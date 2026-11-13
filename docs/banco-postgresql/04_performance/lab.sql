\\set ON_ERROR_STOP on
-- Rodar EXCLUSIVAMENTE na branch Neon obra-integrada, nunca em production.
-- Tabela exclusiva do experimento; preserva obra_integrada.carga existente.
CREATE SCHEMA IF NOT EXISTS obra_integrada;
CREATE TABLE IF NOT EXISTS obra_integrada.carga_experimento
  (id bigint PRIMARY KEY, payload text NOT NULL);
SELECT pg_total_relation_size('obra_integrada.carga_experimento') AS bytes_antes;
INSERT INTO obra_integrada.carga_experimento(id,payload)
SELECT n, repeat(md5(n::text),16)
FROM generate_series(1,10000) AS n
ON CONFLICT (id) DO NOTHING;
ANALYZE obra_integrada.carga_experimento;
SELECT count(*) AS registros,
       pg_total_relation_size('obra_integrada.carga_experimento') AS bytes_crescimento
FROM obra_integrada.carga_experimento;
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM obra_integrada.carga_experimento WHERE id=5000;
DELETE FROM obra_integrada.carga_experimento WHERE id > 1000;
SELECT pg_total_relation_size('obra_integrada.carga_experimento') AS bytes_apos_delete;
-- IMPORTANTE: VACUUM FULL exige bloqueio exclusivo; executar apenas na branch isolada.
VACUUM (FULL, ANALYZE) obra_integrada.carga_experimento;
SELECT count(*) AS registros,
       pg_total_relation_size('obra_integrada.carga_experimento') AS bytes_apos_compactacao
FROM obra_integrada.carga_experimento;
