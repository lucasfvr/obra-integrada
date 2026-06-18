-- CreateTable
CREATE TABLE "tb_candidato" (
    "id_candidato" SERIAL NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "id_vaga" INTEGER,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "telefone" TEXT,
    "cpf" TEXT,
    "linkedin_url" TEXT,
    "curriculo_url" TEXT,
    "fonte" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NOVO',
    "observacoes" TEXT,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_candidato_pkey" PRIMARY KEY ("id_candidato")
);

-- CreateTable
CREATE TABLE "tb_talento" (
    "id_talento" SERIAL NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "telefone" TEXT,
    "cpf" TEXT,
    "linkedin_url" TEXT,
    "curriculo_url" TEXT,
    "cargo_desejado" TEXT,
    "tipo_contrato" TEXT,
    "pretensao_salarial" DECIMAL(12,2),
    "disponibilidade" TEXT,
    "habilidades" TEXT,
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_talento_pkey" PRIMARY KEY ("id_talento")
);

-- CreateTable
CREATE TABLE "tb_entrevista" (
    "id_entrevista" SERIAL NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "id_candidato" INTEGER NOT NULL,
    "id_vaga" INTEGER,
    "entrevistador" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'ONLINE',
    "status" TEXT NOT NULL DEFAULT 'AGENDADA',
    "data_hora" TIMESTAMP(6) NOT NULL,
    "duracao_minutos" INTEGER DEFAULT 60,
    "local_ou_link" TEXT,
    "feedback" TEXT,
    "nota" INTEGER,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_entrevista_pkey" PRIMARY KEY ("id_entrevista")
);

-- CreateIndex
CREATE INDEX "idx_candidato_cliente" ON "tb_candidato"("id_cliente");

-- CreateIndex
CREATE INDEX "idx_candidato_vaga" ON "tb_candidato"("id_vaga");

-- CreateIndex
CREATE INDEX "idx_candidato_cliente_status" ON "tb_candidato"("id_cliente", "status");

-- CreateIndex
CREATE INDEX "idx_talento_cliente" ON "tb_talento"("id_cliente");

-- CreateIndex
CREATE INDEX "idx_talento_cliente_ativo" ON "tb_talento"("id_cliente", "ativo");

-- CreateIndex
CREATE INDEX "idx_entrevista_cliente" ON "tb_entrevista"("id_cliente");

-- CreateIndex
CREATE INDEX "idx_entrevista_candidato" ON "tb_entrevista"("id_candidato");

-- CreateIndex
CREATE INDEX "idx_entrevista_vaga" ON "tb_entrevista"("id_vaga");

-- CreateIndex
CREATE INDEX "idx_entrevista_cliente_data" ON "tb_entrevista"("id_cliente", "data_hora");

-- AddForeignKey
ALTER TABLE "tb_candidato" ADD CONSTRAINT "fk_candidato_cliente" FOREIGN KEY ("id_cliente") REFERENCES "tb_cliente"("id_cliente") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_candidato" ADD CONSTRAINT "fk_candidato_vaga" FOREIGN KEY ("id_vaga") REFERENCES "tb_vaga"("id_vaga") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_talento" ADD CONSTRAINT "fk_talento_cliente" FOREIGN KEY ("id_cliente") REFERENCES "tb_cliente"("id_cliente") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_entrevista" ADD CONSTRAINT "fk_entrevista_cliente" FOREIGN KEY ("id_cliente") REFERENCES "tb_cliente"("id_cliente") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_entrevista" ADD CONSTRAINT "fk_entrevista_candidato" FOREIGN KEY ("id_candidato") REFERENCES "tb_candidato"("id_candidato") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_entrevista" ADD CONSTRAINT "fk_entrevista_vaga" FOREIGN KEY ("id_vaga") REFERENCES "tb_vaga"("id_vaga") ON DELETE SET NULL ON UPDATE CASCADE;
