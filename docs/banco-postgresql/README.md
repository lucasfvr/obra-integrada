# Obra Integrada — PostgreSQL: plano e evidências

## Escopo e segurança
- Neon: projeto `Lucas`, banco `neondb`, branch `obra-integrada`, schema `obra_integrada`.
- Branch principal `production` não recebeu alterações.
- O backend real usa Prisma em `backend/src/prisma/schema.prisma`: **33 modelos**. Esta branch Neon possui apenas duas tabelas em `obra_integrada` e duas em `public`; **não é o banco atualmente pronto para executar a aplicação**. Nenhuma migration foi aplicada.

## Evidências executadas em 13/11/2026
| Controle | Resultado |
| --- | --- |
| Rollback por falha | Uma transação com duas inserções na mesma PK gerou SQLSTATE 23505; registro id=987654: 0 antes e 0 depois |
| Privilégios | Roles NOLOGIN `obra_leitura` e `obra_escrita`; SELECT(leitura)=true, INSERT(leitura)=false, INSERT(escrita)=true |
| Crescimento | `obra_integrada.carga` recebeu 10.000 linhas e ocupou aproximadamente 6.000 kB |
| Remoção | 9.000 linhas excluídas; tamanho inicialmente continuou em 6.000 kB |
| Compactação | `VACUUM (FULL, ANALYZE)` reduziu o tamanho para 624 kB, 1.000 linhas remanescentes (redução ~89,6%) |
| Consulta indexada | `EXPLAIN (ANALYZE, BUFFERS)` retornou Index Scan em `carga_pkey` e 0,028 ms em uma execução pontual |
| Recuperação Neon | Branch `obra-integrada-recuperacao` criada a partir de `obra-integrada`; ambas apresentaram 2 tabelas, 1.000 linhas de carga, 1 linha de transações |
| Simulação limitada | Quatro solicitações de SELECT disparadas pela integração; todas completaram, duração agregada observada ~22,2 s; monitor retornou 1 sessão ativa. **Não comprova concorrência**, nem TPS ou latência individual |
| Snapshot | Serviço rejeitou snapshot de branch não raiz; não há snapshot nativo desta branch |

## Pendências reais
1. Executar `pg_dump --format=custom` contra branch isolada, verificar checksum, restaurar com `pg_restore` em banco vazio e conferir a integridade/contagens. **Não executado**.
2. Executar `pgbench` com clientes concorrentes e coletar `pg_stat_activity`, TPS e latência. **Não executado**.
3. Identificar o banco real da aplicação e revisar migrations Prisma antes de decidir aplicar os 33 modelos à branch Neon. **Não executado**.
4. Anexar registros de execução, revisão de código e fechar PR após validação.

## Política proposta
Backup diário às 02h (horário de Brasília), 7 cópias diárias + 4 semanais, armazenamento independente e teste mensal de restauração. RPO de 24h e RTO de 4h são **metas propostas**, não resultados verificados. O diretório de uploads Multer exige cópias independentes do PostgreSQL.

## Scripts
- `01_backup/backup.sh`: backup lógico com `pg_dump`, lista do arquivo e SHA256.
- `01_backup/restore.sh`: verifica arquivo/checksum e restaura **somente em destino descartável vazio**.
- `02_transacoes/transacoes.sql`: COMMIT, SAVEPOINT e ROLLBACK em tabela temporária.
- `03_permissoes/roles.sql`: perfis de acesso para o schema `obra_integrada`.
- `04_performance/lab.sql`: dados sintéticos em tabela própria `carga_experimento`, EXPLAIN, DELETE e VACUUM FULL.
- `04_performance/load.sh`: `pgbench` moderado (4 clientes, 2 threads, 30 s) para leitura da tabela `obra_integrada.carga`.
- `04_performance/monitor.sql`: contagem de sessões e tamanhos.

**Nunca executar testes de carga, compactação ou restauração na branch `production`. Credenciais e dumps não devem ser versionados no GitHub.**
