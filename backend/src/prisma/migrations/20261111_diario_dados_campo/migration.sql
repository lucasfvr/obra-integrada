-- Colunas estruturadas para consultas gerenciais do Diario de Obra.
-- Aplicar somente em homologacao antes do deploy simultaneo da API mobile.
ALTER TABLE "tb_diario_obra"
  ADD COLUMN IF NOT EXISTS "clima" TEXT,
  ADD COLUMN IF NOT EXISTS "efetivo" INTEGER,
  ADD COLUMN IF NOT EXISTS "ocorrencias" TEXT;

-- Integridade simples para consultas por obra e efetivo.
ALTER TABLE "tb_diario_obra"
  ADD CONSTRAINT "tb_diario_obra_efetivo_nonnegative"
  CHECK ("efetivo" IS NULL OR ("efetivo" >= 0 AND "efetivo" <= 9999999));
