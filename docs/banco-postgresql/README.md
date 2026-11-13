# Obra Integrada — Operação PostgreSQL

## Evidências executadas em 13/11/2026
Ambiente Neon: projeto Lucas, banco neondb, branch obra-integrada, schema obra_integrada. Branch production preservada.

- Transação com chave duplicada: erro SQLSTATE 23505; contagem do registro 987654 foi 0 antes e 0 depois, comprovando rollback integral.
- Roles NOLOGIN obra_leitura e obra_escrita: leitura SELECT=true, leitura INSERT=false, escrita INSERT=true.
- Crescimento: 10.000 registros, tabela 6.000 kB. Após excluir 9.000, 6.000 kB. Após VACUUM FULL: 1.000 registros, 624 kB (redução de 89,6%).
- Consulta EXPLAIN ANALYZE por id=5000: Index Scan em carga_pkey, tempo 0,028 ms (medição pontual).
- Monitor pg_stat_activity: 1 sessão ativa no momento da amostra, não é teste de concorrência.
- Branch obra-integrada-recuperacao criada a partir de obra-integrada; comparação confirmou 2 tabelas, 1.000 registros de carga e 1 registro de transações em ambas.
- Snapshot nativo recusado pelo Neon em branch não raiz. Clonagem de branch não substitui backup externo.

## Pendências
- Executar pg_dump externo, validar checksum e restaurar em banco vazio independente.
- Executar teste concorrente pgbench e registrar métricas em intervalos durante a carga.
- Aplicar migrations Prisma somente após identificar e validar o banco da aplicação real.
- Capturar logs e prints sem segredos e anexar ao relatório.

## Política proposta
Backup diário às 02h de Brasília, retenção de 7 diários e 4 semanais, armazenamento externo seguro e teste de restauração mensal. RPO 24h e RTO 4h são metas a validar. Os uploads Multer exigem backup independente.

## Scripts
- `01_backup/backup.sh` e `restore.sh`: backup e restauração isolada.
- `02_transacoes/transacoes.sql`: COMMIT, SAVEPOINT e ROLLBACK.
- `03_permissoes/roles.sql`: perfis de leitura e escrita.
- `04_performance/lab.sql`, `monitor.sql` e `load.sh`: crescimento, compactação, observabilidade e carga.

**Segurança:** scripts de carga e compactação somente em banco descartável; nunca na branch production.
