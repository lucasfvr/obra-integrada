-- CreateTable
CREATE TABLE "tb_log_auditoria" (
    "id_log" SERIAL NOT NULL,
    "id_usuario" INTEGER,
    "acao" TEXT NOT NULL,
    "target_id" INTEGER,
    "detalhes" TEXT,
    "ip_address" TEXT,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_log_auditoria_pkey" PRIMARY KEY ("id_log")
);

-- CreateIndex
CREATE INDEX "idx_log_usuario" ON "tb_log_auditoria"("id_usuario");

-- AddForeignKey
ALTER TABLE "tb_log_auditoria" ADD CONSTRAINT "fk_log_usuario" FOREIGN KEY ("id_usuario") REFERENCES "tb_usuario"("id_usuario") ON DELETE SET NULL ON UPDATE NO ACTION;
