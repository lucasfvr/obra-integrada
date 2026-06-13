# Catálogo de Sistemas — Obra Integrada
## Inventário de Componentes e Arquitetura de Produção

**Versão:** 1.0 | **Data:** 13 de junho de 2026 | **Status:** Atualizado

---

## 1. Visão Geral do Ecossistema

Este documento cataloga os sistemas, aplicações, APIs e bancos de dados que compõem a infraestrutura produtiva da plataforma Obra Integrada. Serve como guia de referência para engenharia e onboarding de novos desenvolvedores.

```
                  ┌──────────────────────┐
                  │ Frontend Web App     │
                  │ React 18 / Vite      │
                  │ Hospedagem: Vercel   │
                  └──────────┬───────────┘
                             │
                             ▼ (HTTPS / JWT)
                  ┌──────────────────────┐
                  │ API Backend          │
                  │ Node.js / Express    │
                  │ Hospedagem: Vercel   │
                  └─────┬──────────┬─────┘
                        │          │
                        ▼ (SQL)    ▼ (S3 SDK)
          ┌────────────────┐    ┌────────────────────────┐
          │ Neon Database  │    │ Storage de Arquivos    │
          │ PostgreSQL 15  │    │ Supabase / CF R2       │
          └────────────────┘    └────────────────────────┘
```

---

## 2. Inventário de Componentes Técnicos

### 2.1 Componente: frontend-web-app
- **Nome:** Web App Obra Integrada
- **Função:** Interface web responsiva e PWA utilizada pelos clientes administradores, engenheiros e encarregados no canteiro.
- **Tecnologias:** React 18, Vite, Tailwind CSS 4, TanStack Query, shadcn/ui.
- **Hospedagem:** Vercel (Production branch: `main`).
- **Repositório:** `/apps/web` (dentro do monorepo).
- **URLs de Produção:** `obra-integrada.vercel.app` ou `app.obraintegrada.com.br`.

### 2.2 Componente: backend-api
- **Nome:** API REST Obra Integrada
- **Função:** API central que expõe endpoints HTTP seguros para autenticação, controle financeiro, apontamento de diários e gestão de equipes.
- **Tecnologias:** Node.js, Express, Prisma ORM, Zod, JWT.
- **Hospedagem:** Vercel Serverless Functions.
- **Repositório:** `/apps/api` (dentro do monorepo).
- **URLs de Produção:** `api.obraintegrada.com.br` ou endpoints serverless da Vercel.

### 2.3 Componente: database-postgres
- **Nome:** Neon DB Production Database
- **Função:** Banco de dados relacional para persistência de dados cadastrais, financeiros, diários, logs e registros estruturados.
- **Tecnologias:** PostgreSQL 15, Neon Database (Serverless Postgres).
- **Recursos Chave:** Auto-scaling de computação e banco de dados isolados por filial (Neon branching).

### 2.4 Componente: object-storage
- **Nome:** Supabase File Storage / Cloudflare R2
- **Função:** Armazenamento seguro de anexos de obras, fotos de RDO, exames médicos PCMSO e comprovantes financeiros.
- **Tecnologias:** Object Storage compatível com AWS S3 API.
- **Segurança:** Acesso privado com URLs temporárias assinadas (*Signed URLs*).

---

## 3. Matriz de Contatos e Responsáveis

| Componente | Responsável Técnico | Backup | Fornecedor / Provedor |
|------------|---------------------|--------|-----------------------|
| Frontend Web | Pessoa 3 (Frontend Dev) | Pessoa 1 (Tech Lead) | Vercel |
| Backend API | Pessoa 1 (Tech Lead) | Pessoa 5 (DevOps) | Vercel |
| Banco de Dados | Pessoa 5 (DevOps) | Pessoa 1 (Tech Lead) | Neon DB |
| Storage | Pessoa 5 (DevOps) | Pessoa 3 (Frontend) | Supabase / Cloudflare |
