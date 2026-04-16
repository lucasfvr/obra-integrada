-- CreateTable
CREATE TABLE "tb_etapa" (
    "id_etapa" SERIAL NOT NULL,
    "id_obra" INTEGER,
    "nome" TEXT,
    "previsao_inicio" DATE,
    "previsao_fim" DATE,
    "id_status" INTEGER,

    CONSTRAINT "tb_etapa_pkey" PRIMARY KEY ("id_etapa")
);

-- CreateTable
CREATE TABLE "tb_etapa_material" (
    "id_etapa" INTEGER NOT NULL,
    "id_material" INTEGER NOT NULL,
    "quantidade" DECIMAL(10,2),

    CONSTRAINT "tb_etapa_material_pkey" PRIMARY KEY ("id_etapa","id_material")
);

-- CreateTable
CREATE TABLE "tb_fabricante" (
    "id_fabricante" SERIAL NOT NULL,
    "nome_fabricante" TEXT NOT NULL,

    CONSTRAINT "tb_fabricante_pkey" PRIMARY KEY ("id_fabricante")
);

-- CreateTable
CREATE TABLE "tb_material" (
    "id_material" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "unidade_medida" TEXT,
    "preco_unitario" DECIMAL(10,2),
    "criado_em" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "densidade" DECIMAL(10,3),
    "resistencia" DECIMAL(10,2),
    "volume_unitario" DECIMAL(10,3),
    "peso_unitario" DECIMAL(10,3),
    "quantidade_atual" DECIMAL(10,3),
    "observacoes" TEXT,

    CONSTRAINT "tb_material_pkey" PRIMARY KEY ("id_material")
);

-- CreateTable
CREATE TABLE "tb_material_fabricante" (
    "id_material" INTEGER NOT NULL,
    "id_fabricante" INTEGER NOT NULL,

    CONSTRAINT "tb_material_fabricante_pkey" PRIMARY KEY ("id_material","id_fabricante")
);

-- CreateTable
CREATE TABLE "tb_material_requisitado" (
    "id_requisicao" INTEGER NOT NULL,
    "id_material" INTEGER NOT NULL,
    "quantidade" DECIMAL(10,2),

    CONSTRAINT "tb_material_requisitado_pkey" PRIMARY KEY ("id_requisicao","id_material")
);

-- CreateTable
CREATE TABLE "tb_obra" (
    "id_obra" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo_obra" TEXT,
    "logradouro" TEXT,
    "numero" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "estado" CHAR(2),
    "cep" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "data_inicio" DATE,
    "previsao_termino" DATE,
    "data_termino_real" DATE,
    "valor_orcado" DECIMAL(12,2),
    "custo_atual" DECIMAL(12,2),
    "observacoes" TEXT,
    "id_usuario_responsavel" INTEGER,
    "id_status" INTEGER,
    "contato_emergencia_nome" TEXT,
    "contato_emergencia_fone" TEXT,
    "area_terreno" DOUBLE PRECISION,
    "area_construida" DOUBLE PRECISION,
    "objetivo" TEXT,
    "nome_proprietario_obra" TEXT,
    "numero_alvara" TEXT,
    "art_rrt" TEXT,
    "orcamento_material" DECIMAL(12,2),
    "orcamento_mao_obra" DECIMAL(12,2),
    "orcamento_taxas" DECIMAL(12,2),

    CONSTRAINT "tb_obra_pkey" PRIMARY KEY ("id_obra")
);

-- CreateTable
CREATE TABLE "tb_estoque_obra" (
    "id_estoque" SERIAL NOT NULL,
    "id_obra" INTEGER NOT NULL,
    "nome_material" TEXT NOT NULL,
    "unidade_medida" TEXT NOT NULL DEFAULT 'Unidade',
    "quantidade" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_estoque_obra_pkey" PRIMARY KEY ("id_estoque")
);

-- CreateTable
CREATE TABLE "tb_papel" (
    "id_papel" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "tb_papel_pkey" PRIMARY KEY ("id_papel")
);

-- CreateTable
CREATE TABLE "tb_requisicao" (
    "id_requisicao" SERIAL NOT NULL,
    "id_obra" INTEGER,
    "quantidade_planejada" DECIMAL(10,2),
    "quantidade_usada" DECIMAL(10,2),
    "data_registro" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "id_usuario" INTEGER,

    CONSTRAINT "tb_requisicao_pkey" PRIMARY KEY ("id_requisicao")
);

-- CreateTable
CREATE TABLE "tb_status" (
    "id_status" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "tb_status_pkey" PRIMARY KEY ("id_status")
);

-- CreateTable
CREATE TABLE "tb_usuario" (
    "id_usuario" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "funcao" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "username" TEXT,
    "senha" TEXT,
    "tipo_registro_profissional" TEXT,
    "numero_registro_profissional" TEXT,
    "tipo_usuario" TEXT,
    "role" TEXT DEFAULT 'USER',
    "id_cliente" INTEGER,
    "status_profissional" TEXT DEFAULT 'PENDENTE',
    "certificacoes" JSONB,
    "experiencias" TEXT,
    "endereco" TEXT,

    CONSTRAINT "tb_usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "tb_usuario_obra" (
    "id_usuario" INTEGER NOT NULL,
    "id_obra" INTEGER NOT NULL,
    "id_papel" INTEGER,
    "valor_dia" DECIMAL(10,2) DEFAULT 0,

    CONSTRAINT "tb_usuario_obra_pkey" PRIMARY KEY ("id_usuario","id_obra")
);

-- CreateTable
CREATE TABLE "tb_cliente" (
    "id_cliente" SERIAL NOT NULL,
    "nome_razao" TEXT NOT NULL,
    "cpf_cnpj" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "criado_em" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "status_assinatura" TEXT DEFAULT 'ATIVO',
    "validade_plano" DATE,

    CONSTRAINT "tb_cliente_pkey" PRIMARY KEY ("id_cliente")
);

-- CreateTable
CREATE TABLE "tb_obra_cliente" (
    "id_obra" INTEGER NOT NULL,
    "id_cliente" INTEGER NOT NULL,

    CONSTRAINT "tb_obra_cliente_pkey" PRIMARY KEY ("id_obra","id_cliente")
);

-- CreateTable
CREATE TABLE "tb_documento" (
    "id_documento" SERIAL NOT NULL,
    "id_obra" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT,
    "url" TEXT NOT NULL,
    "data_upload" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_documento_pkey" PRIMARY KEY ("id_documento")
);

-- CreateTable
CREATE TABLE "tb_diario_obra" (
    "id_diario" SERIAL NOT NULL,
    "id_obra" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "foto_url" TEXT,
    "descricao" TEXT NOT NULL,
    "data_registro" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "status_auditoria" TEXT NOT NULL DEFAULT 'AUTOMATICO',
    "justificativa_gps" TEXT,

    CONSTRAINT "tb_diario_obra_pkey" PRIMARY KEY ("id_diario")
);

-- CreateTable
CREATE TABLE "tb_tarefa" (
    "id_tarefa" SERIAL NOT NULL,
    "id_obra" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "prioridade" TEXT NOT NULL DEFAULT 'NORMAL',
    "prazo" DATE,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "percentual_concluido" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tb_tarefa_pkey" PRIMARY KEY ("id_tarefa")
);

-- CreateTable
CREATE TABLE "tb_tarefa_usuario" (
    "id_tarefa" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,

    CONSTRAINT "tb_tarefa_usuario_pkey" PRIMARY KEY ("id_tarefa","id_usuario")
);

-- CreateTable
CREATE TABLE "tb_movimentacao_estoque" (
    "id_movimentacao" SERIAL NOT NULL,
    "id_estoque" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "quantidade" DECIMAL(10,3) NOT NULL,
    "origem_fornecedor" TEXT,
    "data_registro" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_financeiro" INTEGER,

    CONSTRAINT "tb_movimentacao_estoque_pkey" PRIMARY KEY ("id_movimentacao")
);

-- CreateTable
CREATE TABLE "tb_financeiro_obra" (
    "id_financeiro" SERIAL NOT NULL,
    "id_obra" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "descricao" TEXT,
    "data_vencimento" DATE,
    "data_pagamento" DATE,
    "numero_nota_fiscal" TEXT,
    "url_comprovante" TEXT,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_financeiro_obra_pkey" PRIMARY KEY ("id_financeiro")
);

-- CreateIndex
CREATE INDEX "idx_etapa_obra" ON "tb_etapa"("id_obra");

-- CreateIndex
CREATE INDEX "idx_obra_usuario" ON "tb_obra"("id_usuario_responsavel");

-- CreateIndex
CREATE INDEX "idx_estoque_obra" ON "tb_estoque_obra"("id_obra");

-- CreateIndex
CREATE INDEX "idx_req_obra" ON "tb_requisicao"("id_obra");

-- CreateIndex
CREATE UNIQUE INDEX "tb_usuario_email_key" ON "tb_usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tb_usuario_username_key" ON "tb_usuario"("username");

-- CreateIndex
CREATE UNIQUE INDEX "tb_cliente_cpf_cnpj_key" ON "tb_cliente"("cpf_cnpj");

-- CreateIndex
CREATE INDEX "idx_diario_obra" ON "tb_diario_obra"("id_obra");

-- CreateIndex
CREATE INDEX "idx_diario_usuario" ON "tb_diario_obra"("id_usuario");

-- CreateIndex
CREATE INDEX "idx_tarefa_obra" ON "tb_tarefa"("id_obra");

-- AddForeignKey
ALTER TABLE "tb_etapa" ADD CONSTRAINT "fk_etapa_status" FOREIGN KEY ("id_status") REFERENCES "tb_status"("id_status") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_etapa" ADD CONSTRAINT "tb_etapa_id_obra_fkey" FOREIGN KEY ("id_obra") REFERENCES "tb_obra"("id_obra") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_etapa_material" ADD CONSTRAINT "tb_etapa_material_id_etapa_fkey" FOREIGN KEY ("id_etapa") REFERENCES "tb_etapa"("id_etapa") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_etapa_material" ADD CONSTRAINT "tb_etapa_material_id_material_fkey" FOREIGN KEY ("id_material") REFERENCES "tb_material"("id_material") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_material_fabricante" ADD CONSTRAINT "tb_material_fabricante_id_fabricante_fkey" FOREIGN KEY ("id_fabricante") REFERENCES "tb_fabricante"("id_fabricante") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_material_fabricante" ADD CONSTRAINT "tb_material_fabricante_id_material_fkey" FOREIGN KEY ("id_material") REFERENCES "tb_material"("id_material") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_material_requisitado" ADD CONSTRAINT "tb_material_requisitado_id_material_fkey" FOREIGN KEY ("id_material") REFERENCES "tb_material"("id_material") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_material_requisitado" ADD CONSTRAINT "tb_material_requisitado_id_requisicao_fkey" FOREIGN KEY ("id_requisicao") REFERENCES "tb_requisicao"("id_requisicao") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_obra" ADD CONSTRAINT "fk_obra_status" FOREIGN KEY ("id_status") REFERENCES "tb_status"("id_status") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_obra" ADD CONSTRAINT "fk_obra_usuario" FOREIGN KEY ("id_usuario_responsavel") REFERENCES "tb_usuario"("id_usuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_estoque_obra" ADD CONSTRAINT "tb_estoque_obra_id_obra_fkey" FOREIGN KEY ("id_obra") REFERENCES "tb_obra"("id_obra") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_requisicao" ADD CONSTRAINT "fk_req_usuario" FOREIGN KEY ("id_usuario") REFERENCES "tb_usuario"("id_usuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_requisicao" ADD CONSTRAINT "tb_requisicao_id_obra_fkey" FOREIGN KEY ("id_obra") REFERENCES "tb_obra"("id_obra") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_usuario" ADD CONSTRAINT "fk_usuario_cliente" FOREIGN KEY ("id_cliente") REFERENCES "tb_cliente"("id_cliente") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_usuario_obra" ADD CONSTRAINT "fk_usuario_obra_papel" FOREIGN KEY ("id_papel") REFERENCES "tb_papel"("id_papel") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_usuario_obra" ADD CONSTRAINT "tb_usuario_obra_id_obra_fkey" FOREIGN KEY ("id_obra") REFERENCES "tb_obra"("id_obra") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_usuario_obra" ADD CONSTRAINT "tb_usuario_obra_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "tb_usuario"("id_usuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_obra_cliente" ADD CONSTRAINT "tb_obra_cliente_id_obra_fkey" FOREIGN KEY ("id_obra") REFERENCES "tb_obra"("id_obra") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_obra_cliente" ADD CONSTRAINT "tb_obra_cliente_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "tb_cliente"("id_cliente") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_documento" ADD CONSTRAINT "tb_documento_id_obra_fkey" FOREIGN KEY ("id_obra") REFERENCES "tb_obra"("id_obra") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_diario_obra" ADD CONSTRAINT "tb_diario_obra_id_obra_fkey" FOREIGN KEY ("id_obra") REFERENCES "tb_obra"("id_obra") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_diario_obra" ADD CONSTRAINT "tb_diario_obra_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "tb_usuario"("id_usuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_tarefa" ADD CONSTRAINT "tb_tarefa_id_obra_fkey" FOREIGN KEY ("id_obra") REFERENCES "tb_obra"("id_obra") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tb_tarefa_usuario" ADD CONSTRAINT "tb_tarefa_usuario_id_tarefa_fkey" FOREIGN KEY ("id_tarefa") REFERENCES "tb_tarefa"("id_tarefa") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_tarefa_usuario" ADD CONSTRAINT "tb_tarefa_usuario_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "tb_usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_movimentacao_estoque" ADD CONSTRAINT "tb_movimentacao_estoque_id_estoque_fkey" FOREIGN KEY ("id_estoque") REFERENCES "tb_estoque_obra"("id_estoque") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_movimentacao_estoque" ADD CONSTRAINT "tb_movimentacao_estoque_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "tb_usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_movimentacao_estoque" ADD CONSTRAINT "tb_movimentacao_estoque_id_financeiro_fkey" FOREIGN KEY ("id_financeiro") REFERENCES "tb_financeiro_obra"("id_financeiro") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_financeiro_obra" ADD CONSTRAINT "tb_financeiro_obra_id_obra_fkey" FOREIGN KEY ("id_obra") REFERENCES "tb_obra"("id_obra") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_financeiro_obra" ADD CONSTRAINT "tb_financeiro_obra_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "tb_usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;
