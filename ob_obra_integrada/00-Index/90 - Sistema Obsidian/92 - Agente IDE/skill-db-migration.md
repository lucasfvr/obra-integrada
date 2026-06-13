# 🗄️ Agent Skill: Database Schema and Cost Table Updates
## Diretrizes de Migrações de Banco de Dados e Ingestão de Referências (SINAPI/INCC)

Esta skill orienta o Agente IDE sobre os procedimentos corretos para alterar o esquema do banco de dados relacional via Prisma ORM e atualizar as tabelas de referência de custos e índices da construção civil.

---

## 1. Procedimento de Migração de Banco de Dados (Prisma)

Sempre que houver alteração de models em `apps/api/src/prisma/schema.prisma`:

1. **Validação do Esquema:** Antes de gerar a migration, valide o arquivo prisma localmente:
   ```bash
   npx prisma validate
   ```
2. **Geração da Migration:** Crie a migration localmente utilizando um nome em inglês curto e descritivo separado por *underscores* (padrão camel_case ou snake_case):
   ```bash
   npx prisma migrate dev --name adicione_campos_obra_e_cno
   ```
3. **Regra de Ouro (Roll-Forward):** Nunca modifique arquivos de migrações anteriores que já foram comitados. Se houver erro ou mudança de decisão arquitetural, crie uma nova migration corrigindo o problema.
4. **Atualização do Seed:** Se novos campos obrigatórios foram adicionados ao schema, atualize imediatamente o script `apps/api/src/prisma/seed.js` para garantir que o comando `npm run seed` continue gerando a base de testes estável sem quebras.
5. **Aplicação em Produção:** O deploy em produção (Vercel CI) executa automaticamente `prisma migrate deploy` antes do build. Garanta que a migration não seja destrutiva para dados de produção ativos (ex: adicionar campos `NOT NULL` sem valor padrão).

---

## 2. Ingestão e Atualização de Índices Econômicos (INCC)

- **Natureza dos Dados:** O INCC não possui API aberta. As atualizações ocorrem via upload administrativo mensal de arquivos CSV.
- **Formato dos Dados:** Os arquivos contêm: `mês_referência`, `índice_tipo` (INCC-M, INCC-DI), `variação_mês` (decimal).
- **Lógica de Gravação no Banco:**
  1. Utilizar transações atômicas (`prisma.$transaction`) para garantir que uma falha no meio do arquivo CSV de centenas de linhas faça o rollback total, impedindo dados duplicados ou parciais.
  2. Executar validação de tipo e consistência de datas usando Zod antes de gravar.
  3. Registrar a auditoria da importação (usuário administrador, data/hora, número de registros inseridos) na tabela de auditoria (`tb_log_auditoria`).

---

## 3. Ingestão de Tabelas de Preços de Insumos (SINAPI / EMOP)

A tabela SINAPI (Caixa Econômica) e a EMOP-RJ (SCO-Rio) possuem milhares de registros.
- **Risco de Performance:** Gravar dezenas de milhares de registros um a um causa gargalos severos de rede e timeout em funções serverless da Vercel.
- **Procedimento Obrigatório:**
  1. Utilizar **Bulk Inserts** (`prisma.tb_sinapi_insumo.createMany`) em pacotes de no máximo **1.000 registros** por chamada.
  2. Implementar descompressão temporária e leitura de stream de arquivo (usando `csv-parser` ou `exceljs`) para economizar memória RAM do servidor.
  3. Realizar indexação adequada nas colunas `codigo` e `estado` para assegurar buscas em menos de 50ms na hora de montar orçamentos de obras.
