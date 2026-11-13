-- Executar no Neon na branch obra-integrada durante a simulacao de carga.
SELECT now() AS instante, state, count(*) AS sessoes,
       max(now() - query_start) AS consulta_mais_longa
FROM pg_stat_activity
WHERE datname = current_database()
GROUP BY state ORDER BY state;
SELECT pg_database_size(current_database()) AS bytes_banco,
       pg_total_relation_size('obra_integrada.carga_experimento') AS bytes_tabela;
