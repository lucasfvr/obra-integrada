-- CreateTable
CREATE TABLE "tb_vaga" (
    "id_vaga" SERIAL NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "requisitos" TEXT,
    "salario" DECIMAL(12,2),
    "tipo_contrato" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ABERTA',
    "id_obra" INTEGER,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_vaga_pkey" PRIMARY KEY ("id_vaga")
);

-- CreateIndex
CREATE INDEX "idx_vaga_cliente" ON "tb_vaga"("id_cliente");

-- CreateIndex
CREATE INDEX "idx_vaga_obra" ON "tb_vaga"("id_obra");

-- AddForeignKey
ALTER TABLE "tb_vaga" ADD CONSTRAINT "fk_vaga_cliente" FOREIGN KEY ("id_cliente") REFERENCES "tb_cliente"("id_cliente") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_vaga" ADD CONSTRAINT "fk_vaga_obra" FOREIGN KEY ("id_obra") REFERENCES "tb_obra"("id_obra") ON DELETE SET NULL ON UPDATE CASCADE;
