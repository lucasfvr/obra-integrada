-- Executar com Prisma Migrate em homologacao; testar antes de producao.
-- Nenhum registro legado AUTOMATICO e convertido automaticamente.
ALTER TABLE "tb_diario_obra"
  ADD COLUMN IF NOT EXISTS "motivo_reprovacao" TEXT,
  ADD COLUMN IF NOT EXISTS "id_usuario_auditor" INTEGER,
  ADD COLUMN IF NOT EXISTS "auditado_em" TIMESTAMP(6);
ALTER TABLE "tb_diario_obra"
  ALTER COLUMN "status_auditoria" SET DEFAULT 'PENDENTE';

-- Importante: o trigger GPS legado precisa ser substituido ANTES
-- do primeiro registro feito pela nova API. O deploy deve aplicar
-- backend/src/sql/triggers/classificar_diario_gps.sql e
-- backend/src/sql/procedures/sp_auditar_diarios_obra.sql.
