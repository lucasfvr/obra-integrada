# AVD2 — Administração do banco de dados | Obra Integrada

## Escopo e segurança
Aplicação Node.js/Express + Prisma + PostgreSQL (Neon). Os testes desta pasta são **exclusivamente para banco de homologação descartável**. Não executar carga, limpeza, VACUUM FULL nem restauração no banco de produção. Nenhum teste foi executado contra o Neon; resultados e capturas precisam ser coletados pela equipe.

## Matriz de entregáveis
| Entregável | Implementação | Evidência exigida |
|---|---|---|
| Backup | `01_backup/backup.sh`, `restore.sh` | log, arquivo, teste de restauração e consulta |
| Transações | `02_transacoes/transacoes.sql`; transações Prisma em `backend/src/controllers/obraController.js` | saída do teste rollback/commit e trecho do código |
| Usuários e permissões | `03_permissoes/roles.sql` | saída de `\du`, teste de autorização com contas distintas |
| Performance e crescimento | `04_performance/lab.sql`, `monitor.sql`, `load.sh` | resultados pgbench, pg_stat_activity, tamanhos antes/depois |

## Política de backup
Responsável: administrador do banco designado pela equipe. Backup lógico diário às 02:00 (horário de Brasília), retenção de 7 backups diários e 4 semanais, criptografia em repouso no destino e em trânsito (TLS), acesso restrito, cópia em local independente do provedor. Meta proposta: RPO 24 horas; RTO 4 horas, **a validar com teste cronometrado**. Verificar código de saída, integridade com `pg_restore --list` e testar restauração mensal em instância isolada. Registrar data, duração, tamanho, checksum SHA-256, operador, resultado e incidente. Backups de uploads/arquivos do Multer exigem rotina separada: o dump SQL **não** os inclui. Verificar também política nativa de recuperação do Neon sem tratá-la como substituto da cópia independente.

## Roteiro de evidências
1. Provisionar PostgreSQL local/isolado e definir URLs exclusivas de laboratório.
2. Executar backup de uma base de homologação e restaurar em outra base vazia; anexar logs sanitizados e contagens de tabelas.
3. Rodar `psql -v ON_ERROR_STOP=1 -f docs/AVD2/02_transacoes/transacoes.sql` e guardar saída; localizar `prisma.$transaction` no controller de obras.
4. Executar `03_permissoes/roles.sql` como administrador autorizado em instância local; testar `SET ROLE avd2_leitor` e operações permitidas/negadas.
5. Rodar laboratório de crescimento, medir tamanhos, simular carga moderada e monitorar sessões; executar compactação somente no banco descartável.
6. Anexar capturas reais em `docs/AVD2/evidencias/`, sem credenciais, tokens, URLs privadas nem dados pessoais.

## Limitações
A configuração SQL de roles pode exigir privilégios não concedidos pelo Neon; executar no PostgreSQL local de laboratório. `VACUUM FULL` requer bloqueio exclusivo e não é rotina automática. O comportamento de RBAC na aplicação é distinto dos privilégios SQL. Os scripts são entregáveis preparados, **não evidências de execução**.
