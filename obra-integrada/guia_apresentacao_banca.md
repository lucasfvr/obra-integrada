# Guia de Apresentação — Banca Acadêmica 🎓
**Projeto: Obra Integrada**

Este documento serve como seu roteiro técnico para a apresentação. Ele conecta os requisitos exigidos pela banca com a implementação real no seu código.

---

## 1. Consultas Complexas com Tabelas Relacionadas (JOINs)
**Onde está no código:** `backend/src/models/obra.js` (Função: `findById`) e `backend/src/controllers/adminController.js` (Função: `getPendingDiaries`).

**O que mostrar na hora:** 
- Abra o arquivo `models/obra.js` e destaque o bloco `include` (linhas 12-44). 
- Explique: *"Aqui o Prisma realiza JOINS implícitos para trazer em uma única consulta os dados da obra, a equipe (tb_usuario_obra), o status, as tarefas e o estoque."*

**Argumento para a banca:** *"Utilizamos o recurso de Eager Loading do Prisma para reduzir o número de requisições ao banco, garantindo integridade referencial nas consultas complexas com múltiplos relacionamentos."*

---

## 2. API RESTful com Paginação de Resultados
**Onde está no código:** `backend/src/controllers/obraController.js` (Função: `listarObras`).

**O que mostrar na hora:** 
- Mostre as linhas que extraem `req.query.page` e `limit`.
- Destaque o uso de `skip` e `take` dentro da chamada do Prisma.

**Argumento para a banca:** *"Implementamos paginação via Query Parameters no padrão REST, permitindo que o sistema escale sem perda de performance ao carregar grandes volumes de dados de obras e diários."*

---

## 3. Conexão com Banco de Dados via Prisma (Multi-Provedor)
**Onde está no código:** `backend/src/prisma/schema.prisma`.

**O que mostrar na hora:** 
- O bloco `datasource db` no topo do arquivo. 
- *Nota Técnica:* Atualmente usamos PostgreSQL (Neon.tech) para maior performance em nuvem, mas o Prisma permite trocar para SQL Server apenas alterando o `provider` e a `URL` no .env.

**Argumento para a banca:** *"Utilizamos o Prisma ORM como camada de abstração. Isso nos dá independência de banco de dados e garante que o esquema (Schema) esteja sempre sincronizado com a lógica da aplicação através das migrations."*

---

## 4. Operações de CRUD Completas
**Onde está no código:** `backend/src/routes/obraRoutes.js`.

**O que mostrar na hora:** 
- O arquivo de rotas com os verbos `POST`, `GET`, `PUT` e `DELETE` mapeados.
- Destaque as novas rotas de exclusão granular de Equipe e Estoque.

**Argumento para a banca:** *"O sistema implementa o ciclo completo de gerenciamento (CRUD) não apenas para as entidades principais, mas também para os sub-recursos de equipe e logística de estoque."*

---

## 5. Testes de Backend com Poku e Cobertura (c8)
**Onde está no código:** `backend/tests/api.test.js` e `backend/package.json`.

**O que mostrar na hora:** 
- Abra o terminal e execute: `npm run test:coverage`.
- Mostre o reporte de cobertura gerado no console.

**Argumento para a banca:** *"Adotamos a biblioteca Poku pela sua leveza e integração nativa com ESM, garantindo a confiabilidade da API. O uso do c8 nos permite auditar exatamente qual percentual das nossas rotas está coberto por testes automatizados."*

---

### Dicas de Ouro para a Apresentação:
1. **Destaque o RBAC:** Mostre que diferentes usuários (Proprietário vs Pedreiro) veem telas e dados diferentes com base nas permissões.
2. **Prova de Trabalho:** Fale sobre como o Diário de Obra usa GPS e Foto para auditar o trabalho real no campo.
3. **UX/UI:** Mencione que o design foi pensado para ser "Mobile First", facilitando o uso pelo trabalhador no canteiro de obras.

**Boa sorte na sua apresentação!** 🚀
