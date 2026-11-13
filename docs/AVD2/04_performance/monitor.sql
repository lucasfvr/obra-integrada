-- Executar em outra sessao durante o teste de carga.
SELECT now() AS instante, state, wait_event_type, count(*) AS sessoes
FROM pg_stat_activity WHERE datname=current_database()
GROUP BY state, wait_event_type ORDER BY sessoes DESC;
SELECT pg_size_pretty(pg_database_size(current_database())) AS tamanho_banco;
