-- CreateTable
CREATE TABLE "tb_pagina" (
    "id_pagina" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "rota" TEXT NOT NULL,

    CONSTRAINT "tb_pagina_pkey" PRIMARY KEY ("id_pagina")
);

-- CreateTable
CREATE TABLE "tb_permissao_pagina" (
    "id_permissao" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_pagina" INTEGER NOT NULL,
    "permitido" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tb_permissao_pagina_pkey" PRIMARY KEY ("id_permissao")
);

-- CreateIndex
CREATE UNIQUE INDEX "tb_pagina_rota_key" ON "tb_pagina"("rota");

-- CreateIndex
CREATE UNIQUE INDEX "idx_unique_user_page" ON "tb_permissao_pagina"("id_usuario", "id_pagina");

-- AddForeignKey
ALTER TABLE "tb_permissao_pagina" ADD CONSTRAINT "tb_permissao_pagina_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "tb_usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_permissao_pagina" ADD CONSTRAINT "tb_permissao_pagina_id_pagina_fkey" FOREIGN KEY ("id_pagina") REFERENCES "tb_pagina"("id_pagina") ON DELETE CASCADE ON UPDATE CASCADE;
