# Obra Integrada — administração PostgreSQL e evidências

## Visão geral
- **Neon conectado:** projeto `Lucas`, banco `neondb`, branch `obra-integrada`, schema `obra_integrada`. Branch `production` preservada.
- **Validação automatizada independente:** GitHub Actions, serviço Docker PostgreSQL **17**, bancos descartáveis `obra_integrada_ci`, `obra_integrada_restore` e `obra_integrada_prisma`.
- **Execução completa aprovada:** [GitHub Actions #43472797446](https://github.com/lucasfvr/obra-integrada/actions/runs/43472797446), job `postgres-validation`. Logs e artefato de evidências disponíveis na execução, sem publicar o dump.
- **Repositório:** PR [#128](https://github.com/lucasfvr/obra-integrada/pull/128) em revisão, sem merge na `main`.

## Resultados diretos na branch Neon `obra-integrada`
| Controle | Resultado verificado |
| --- | --- |
| Rollback integral | Duas inserções com mesma PK produziram SQLSTATE 23505; `id=987654` não persistiu (0 antes, 0 depois) |
| Política de acesso | `obra_leitura` e `obra_escrita` (NOLOGIN); `SELECT` leitura=true, `INSERT` leitura=false, `INSERT` escrita=true |
| Crescimento | Tabela sintética `carga` atingiu 10.000 linhas e aproximadamente 6.000 kB |
| Após exclusão | 1.000 linhas, tabela permaneceu em aproximadamente 6.000 kB até compactação |
| Compactação | `VACUUM FULL`: 624 kB, aproximadamente 89,6% menos que o tamanho anterior |
| Plano de consulta | `EXPLAIN (ANALYZE, BUFFERS)`: Index Scan em `carga_pkey`, 0,028 ms em amostra pontual |
| Recuperação Neon | Branch `obra-integrada-recuperacao` criada e validada, com 2 tabelas, 1.000 linhas de carga e 1 de transações |

## Resultados GitHub Actions — 13/11/2026
| Teste | Resultado |
| --- | --- |
| Scripts de COMMIT, SAVEPOINT e ROLLBACK | **Aprovado** |
| Criação das roles e conferência dos privilégios | **Aprovado** |
| Crescimento artificial, exclusão e compactação | **Aprovado** |
| `pg_dump` custom e verificação do arquivo | **Aprovado** |
| Checksum SHA-256 `sha256sum -c` | **Aprovado** |
| `pg_restore` em banco vazio e verificação | **Aprovado**; 1.000 registros e tabela verificados |
| Benchmark `pgbench` 30 s, 4 clientes, 2 threads | **Aprovado**; 342.208 transações, 0 falhas, 0,350 ms de latência média, 11.415,04 TPS |
| Coleta `pg_stat_activity` durante benchmark | **Executada**; arquivo `conexoes.csv` gerado |
| `prisma validate` e `prisma db push` em banco isolado | **Aprovado**; 33 tabelas físicas criadas |

**Limites dos resultados:** os números de TPS são do runner GitHub, não da infraestrutura Neon/Oracle. O `pg_dump` e `pg_restore` foram validados em PostgreSQL 17 descartável, não diretamente na branch Neon. `prisma db push` valida o modelo em banco limpo, **não executa o histórico de migrations nem altera a produção**. O dump foi descartado com o runner e não é um backup durável de dados reais.

## Política de backup proposta para operação
- `pg_dump` diário às 02h (Brasília), retenção de 7 diários e 4 semanais.
- Armazenamento externo criptografado; checksum por arquivo; restauração mensal.
- RPO de 24h e RTO de 4h são metas, **não SLA comprovado**.
- Os arquivos enviados via Multer/`uploads` requerem backup independente.
- Para backups de dados reais Neon é preciso disponibilizar uma conexão protegida ao job/agente executor; **nenhuma credencial deve ser inserida no Git ou impressa em logs**.

## Scripts e automação
- `01_backup/backup.sh` e `01_backup/restore.sh`: cópia custom, checksum e restauração isolada.
- `02_transacoes/transacoes.sql`: COMMIT, SAVEPOINT e ROLLBACK.
- `03_permissoes/roles.sql`: roles e GRANT/REVOKE.
- `04_performance/lab.sql`: tabela `obra_integrada.carga_experimento` de dados sintéticos.
- `04_performance/load.sh`: benchmark em `carga_experimento` com carga moderada.
- `04_performance/monitor.sql`: sessões e tamanhos.
- `.github/workflows/postgresql-validation.yml`: pipeline automatizado de ponta a ponta.

## Escopo ainda não aplicado ao Neon conectado
O Prisma em `backend/src/prisma/schema.prisma` possui **33 modelos**; o Neon conectado tinha apenas 2 tabelas em `obra_integrada` e 2 em `public`. O banco real atualmente usado pela aplicação não foi identificado. Para não substituir a conexão existente nem criar estruturas enganosas, nenhuma migration foi aplicada na branch Neon e nenhuma configuração de deploy foi alterada. O GitHub Actions já comprova a criação das 33 tabelas em PostgreSQL 17 isolado.

**Não executar scripts destrutivos, testes de carga nem restauração na branch `production`.**
