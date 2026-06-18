/*
  Warnings:

  - A unique constraint covering the columns `[cpf]` on the table `tb_usuario` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cnpj]` on the table `tb_usuario` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[matricula]` on the table `tb_usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "tb_tarefa" ADD COLUMN     "foto_comprovante" TEXT,
ADD COLUMN     "motivo_pausa" TEXT;

-- AlterTable
ALTER TABLE "tb_usuario" ADD COLUMN     "cargo_base" TEXT,
ADD COLUMN     "cnpj" TEXT,
ADD COLUMN     "cnpj_empreiteira" TEXT,
ADD COLUMN     "cpf" TEXT,
ADD COLUMN     "data_admissao" DATE,
ADD COLUMN     "inscricao_estadual" TEXT,
ADD COLUMN     "is_terceirizado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lgpd_consentimento" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "matricula" TEXT,
ADD COLUMN     "porte_empresa" TEXT,
ADD COLUMN     "razao_social" TEXT,
ADD COLUMN     "razao_social_empreiteira" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ATIVO',
ADD COLUMN     "tipo_vinculo" TEXT,
ADD COLUMN     "uso_plataforma" TEXT;

-- CreateTable
CREATE TABLE "tb_certificacao" (
    "id_certificacao" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "data_emissao" DATE,
    "data_validade" DATE,
    "arquivo_url" TEXT,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_certificacao_pkey" PRIMARY KEY ("id_certificacao")
);

-- CreateTable
CREATE TABLE "tb_rh_salario" (
    "id_salario" SERIAL NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "salario_base" DECIMAL(12,2) NOT NULL,
    "bonus" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "desconto" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "vale_refeicao" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "vale_transporte" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "data_inicio" DATE NOT NULL,
    "data_fim" DATE,
    "observacoes" TEXT,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_rh_salario_pkey" PRIMARY KEY ("id_salario")
);

-- CreateTable
CREATE TABLE "tb_rh_residencial" (
    "id_residencial" SERIAL NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "logradouro" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "complemento" TEXT,
    "bairro" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" CHAR(2) NOT NULL,
    "cep" TEXT NOT NULL,
    "ponto_referencia" TEXT,
    "telefone" TEXT,
    "email_pessoal" TEXT,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_rh_residencial_pkey" PRIMARY KEY ("id_residencial")
);

-- CreateTable
CREATE TABLE "tb_rh_conta_banco" (
    "id_conta_banco" SERIAL NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "banco" TEXT NOT NULL,
    "tipo_conta" TEXT NOT NULL,
    "agencia" TEXT NOT NULL,
    "numero_conta" TEXT NOT NULL,
    "digito_conta" TEXT,
    "chave_pix" TEXT,
    "titular_conta" TEXT NOT NULL,
    "cpf_titular" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_rh_conta_banco_pkey" PRIMARY KEY ("id_conta_banco")
);

-- CreateTable
CREATE TABLE "tb_rh_ponto_diaria" (
    "id_ponto_diaria" SERIAL NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_obra" INTEGER,
    "data_ponto" DATE NOT NULL,
    "hora_entrada" TIMESTAMP(6),
    "hora_saida" TIMESTAMP(6),
    "horas_trabalhadas" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "horas_extras" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "valor_diaria" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "observacoes" TEXT,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_rh_ponto_diaria_pkey" PRIMARY KEY ("id_ponto_diaria")
);

-- CreateIndex
CREATE INDEX "idx_certificacao_usuario" ON "tb_certificacao"("id_usuario");

-- CreateIndex
CREATE INDEX "idx_certificacao_validade" ON "tb_certificacao"("data_validade");

-- CreateIndex
CREATE INDEX "idx_rh_salario_cliente" ON "tb_rh_salario"("id_cliente");

-- CreateIndex
CREATE INDEX "idx_rh_salario_usuario" ON "tb_rh_salario"("id_usuario");

-- CreateIndex
CREATE INDEX "idx_rh_salario_cliente_usuario" ON "tb_rh_salario"("id_cliente", "id_usuario");

-- CreateIndex
CREATE INDEX "idx_rh_residencial_cliente" ON "tb_rh_residencial"("id_cliente");

-- CreateIndex
CREATE INDEX "idx_rh_residencial_usuario" ON "tb_rh_residencial"("id_usuario");

-- CreateIndex
CREATE INDEX "idx_rh_residencial_cliente_usuario" ON "tb_rh_residencial"("id_cliente", "id_usuario");

-- CreateIndex
CREATE INDEX "idx_rh_conta_banco_cliente" ON "tb_rh_conta_banco"("id_cliente");

-- CreateIndex
CREATE INDEX "idx_rh_conta_banco_usuario" ON "tb_rh_conta_banco"("id_usuario");

-- CreateIndex
CREATE INDEX "idx_rh_conta_banco_cliente_usuario" ON "tb_rh_conta_banco"("id_cliente", "id_usuario");

-- CreateIndex
CREATE INDEX "idx_rh_ponto_cliente" ON "tb_rh_ponto_diaria"("id_cliente");

-- CreateIndex
CREATE INDEX "idx_rh_ponto_usuario" ON "tb_rh_ponto_diaria"("id_usuario");

-- CreateIndex
CREATE INDEX "idx_rh_ponto_cliente_usuario" ON "tb_rh_ponto_diaria"("id_cliente", "id_usuario");

-- CreateIndex
CREATE INDEX "idx_rh_ponto_obra" ON "tb_rh_ponto_diaria"("id_obra");

-- CreateIndex
CREATE INDEX "idx_rh_ponto_data" ON "tb_rh_ponto_diaria"("data_ponto");

-- CreateIndex
CREATE UNIQUE INDEX "tb_usuario_cpf_key" ON "tb_usuario"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "tb_usuario_cnpj_key" ON "tb_usuario"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "tb_usuario_matricula_key" ON "tb_usuario"("matricula");

-- AddForeignKey
ALTER TABLE "tb_certificacao" ADD CONSTRAINT "tb_certificacao_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "tb_usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_rh_salario" ADD CONSTRAINT "fk_rh_salario_cliente" FOREIGN KEY ("id_cliente") REFERENCES "tb_cliente"("id_cliente") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_rh_salario" ADD CONSTRAINT "fk_rh_salario_usuario" FOREIGN KEY ("id_usuario") REFERENCES "tb_usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_rh_residencial" ADD CONSTRAINT "fk_rh_residencial_cliente" FOREIGN KEY ("id_cliente") REFERENCES "tb_cliente"("id_cliente") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_rh_residencial" ADD CONSTRAINT "fk_rh_residencial_usuario" FOREIGN KEY ("id_usuario") REFERENCES "tb_usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_rh_conta_banco" ADD CONSTRAINT "fk_rh_conta_banco_cliente" FOREIGN KEY ("id_cliente") REFERENCES "tb_cliente"("id_cliente") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_rh_conta_banco" ADD CONSTRAINT "fk_rh_conta_banco_usuario" FOREIGN KEY ("id_usuario") REFERENCES "tb_usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_rh_ponto_diaria" ADD CONSTRAINT "fk_rh_ponto_cliente" FOREIGN KEY ("id_cliente") REFERENCES "tb_cliente"("id_cliente") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_rh_ponto_diaria" ADD CONSTRAINT "fk_rh_ponto_usuario" FOREIGN KEY ("id_usuario") REFERENCES "tb_usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_rh_ponto_diaria" ADD CONSTRAINT "fk_rh_ponto_obra" FOREIGN KEY ("id_obra") REFERENCES "tb_obra"("id_obra") ON DELETE SET NULL ON UPDATE CASCADE;
