# Auditoria do Diario de Obra - roteiro de implantacao (branch mobile)

Esta revisao NAO foi aplicada a banco de homologacao ou producao.

1. Fazer backup e conferir objetos SQL existentes, especialmente trigger
   trg_classificar_diario_gps, procedure sp_auditar_diarios_obra e funcoes.
2. Executar migrations Prisma em HOMOLOGACAO com as credenciais adequadas.
   Revisar se existem outros triggers de auditoria/geolocalizacao no banco.
3. Reinstalar a definicao do trigger e procedure:
   psql ... -f backend/src/sql/triggers/classificar_diario_gps.sql
   psql ... -f backend/src/sql/procedures/sp_auditar_diarios_obra.sql
4. Gerar Prisma Client da branch mobile e publicar API revisada
   somente depois que as novas colunas existirem.
5. Testar:
   - POST com status_auditoria=AUTORIZADO deve criar PENDENTE.
   - GPS dentro dos 150m deve permanecer PENDENTE.
   - Autor tentando auditar proprio diario recebe HTTP 403.
   - REPROVADO sem motivo recebe HTTP 400.
   - Auditor autorizado gera motivo, data e id_usuario_auditor.
   - Dois auditores ao mesmo tempo: apenas um recebe sucesso.
   - Login, GET diario e foto seguem funcionando.
6. Fazer rollout/rollback documentado para evitar API nova com schema antigo.
   Registros antigos AUTOMATICO sao legados: revisar caso a caso.

A API permanece na branch mobile. Nenhum deploy automatico e feito aqui.
