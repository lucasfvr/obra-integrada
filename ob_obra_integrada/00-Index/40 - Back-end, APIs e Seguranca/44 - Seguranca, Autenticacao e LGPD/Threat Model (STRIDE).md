# Threat Model — Obra Integrada
## Modelagem de Ameaças (STRIDE)

**Versão:** 1.0 | **Data:** 13/06/2026  
**Metodologia:** STRIDE (Microsoft) + OWASP Threat Dragon  
**Referência:** NIST SP 800-218 (SSDF) — PW.1.1

---

## 1. Escopo

**Sistema em escopo:** Plataforma Obra Integrada (backend Express + frontend React + PostgreSQL/NeonDB)  
**Fora de escopo:** Dispositivos dos usuários, redes de canteiro, infraestrutura da Vercel/NeonDB

---

## 2. Diagrama de Fluxo de Dados (DFD)

```
[Usuário / Browser]
     │  HTTPS/TLS
     ▼
[Vercel Edge (CDN)]
     │
     ▼
[Frontend React SPA]
     │  JWT no Authorization Header
     ▼
[Vercel Serverless Function — backend/src/server.js]
     │  authMiddleware → authorizationMiddleware
     │
     ├──────────────────────────────────────────┐
     │                                          │
     ▼                                          ▼
[Controllers]                           [uploadMiddleware]
     │                                          │
     ▼                                          ▼
[Prisma ORM]                          [Storage (local/S3)]
     │
     ▼
[NeonDB — PostgreSQL]
```

---

## 3. Ativos a Proteger

| Ativo | Classificação | Impacto se comprometido |
|-------|--------------|------------------------|
| Credenciais de usuários (senha hash) | Crítico | Comprometimento de contas |
| JWT_SECRET | Crítico | Forja de tokens — acesso total |
| DATABASE_URL | Crítico | Acesso direto ao banco |
| CPF / dados pessoais | Alto (LGPD sensível) | Multa ANPD + dano reputacional |
| Dados financeiros das obras | Alto | Vazamento comercial |
| Fotos de diário de obra | Médio | Violação de privacidade |
| Certificações NR | Médio | Violação de privacidade |
| Código-fonte | Médio | Exposição de vulnerabilidades |

---

## 4. Análise STRIDE

### S — Spoofing (Falsidade de Identidade)

| Ameaça | Vetor | Probabilidade | Impacto | Controle Atual | Controle Necessário |
|--------|-------|-------------|---------|---------------|---------------------|
| **S1** — Forja de JWT | JWT_SECRET vazado ou fraco | Alta (fallback SUPER_SECRET) | Crítico | ❌ Nenhum | 🔴 **P0:** Remover fallback, gerar secret forte |
| **S2** — Força bruta no login | POST /api/users/login | Alta | Alto | ❌ Nenhum | 🔴 **P0:** Rate limiting (5 tentativas/min) |
| **S3** — Session fixation | Token em localStorage | Média | Alto | Parcial (JWT) | 🟠 P1: HttpOnly cookie ou token rotation |
| **S4** — Impersonação admin | Explorar endpoint de impersonação | Baixa | Crítico | RBAC | Auditoria de impersonação |

### T — Tampering (Adulteração)

| Ameaça | Vetor | Probabilidade | Impacto | Controle Atual | Controle Necessário |
|--------|-------|-------------|---------|---------------|---------------------|
| **T1** — SQL Injection | Inputs não sanitizados | Baixa | Crítico | ✅ Prisma parametriza | Manter Prisma, validar com Zod |
| **T2** — Adulteração de arquivo | Upload de arquivo malicioso | Média | Alto | Multer (MIME parcial) | 🟠 P1: Validação de conteúdo real + extensão |
| **T3** — IDOR (acesso a dados de outro tenant) | id_obra sem filtro de tenant | Baixa | Crítico | ✅ requireObraAccess | Testar em todos os endpoints |
| **T4** — Alteração de role | Payload JWT adulterado | Baixa | Crítico | Assinatura JWT | 🔴 P0: Remover fallback JWT_SECRET |

### R — Repudiation (Repúdio)

| Ameaça | Vetor | Probabilidade | Impacto | Controle Atual | Controle Necessário |
|--------|-------|-------------|---------|---------------|---------------------|
| **R1** — Ação sem log | Ação financeira sem registro | Alta | Alto | ❌ tb_log_auditoria não existe | 🔴 **P1:** Criar tabela e persistir logs |
| **R2** — Login não rastreado | Tentativas de login não logadas | Alta | Médio | console.log | 🟠 P1: Log estruturado com user-id, IP |

### I — Information Disclosure (Divulgação de Informação)

| Ameaça | Vetor | Probabilidade | Impacto | Controle Atual | Controle Necessário |
|--------|-------|-------------|---------|---------------|---------------------|
| **I1** — Stack trace em produção | Erro não tratado → 500 com detalhes | Alta | Médio | ❌ catch genérico expõe stack | 🔴 **P0:** Middleware global de erro sem stack trace |
| **I2** — CORS aberto | Qualquer origem acessa a API | Alta | Alto | ❌ cors() aberto | 🔴 **P0:** CORS com allowlist via FRONTEND_URL |
| **I3** — Headers HTTP expostos | Sem Helmet | Alta | Médio | ❌ | 🔴 **P0:** Instalar helmet |
| **I4** — CPF em texto plano no banco | Dado sensível sem criptografia | Alta | Alto (LGPD) | ❌ | 🟠 **P1:** AES-256 |
| **I5** — dev.db no Git | SQLite commitado | Feito | Médio | ⚠️ Pendente remoção | 🔴 P0: git rm --cached |
| **I6** — Métricas admin sem auth | GET /admin/metrics/global público | Alta | Alto | ❌ | 🔴 **P0:** Adicionar requireRole |

### D — Denial of Service (Negação de Serviço)

| Ameaça | Vetor | Probabilidade | Impacto | Controle Atual | Controle Necessário |
|--------|-------|-------------|---------|---------------|---------------------|
| **D1** — Flood no login | Sem rate limit | Alta | Alto | ❌ | 🔴 **P0:** express-rate-limit |
| **D2** — Upload de arquivo gigante | Sem limite de tamanho | Média | Médio | multer (limite não definido) | 🟠 P1: `limits: { fileSize: 10MB }` |
| **D3** — Query N+1 | requireObraAccess: 2-3 queries/request | Alta | Médio | ❌ | 🟡 P2: Cache ou join único |

### E — Elevation of Privilege (Elevação de Privilégio)

| Ameaça | Vetor | Probabilidade | Impacto | Controle Atual | Controle Necessário |
|--------|-------|-------------|---------|---------------|---------------------|
| **E1** — RBAC bypass | Role não verificado em endpoint | Alta | Crítico | Parcial (inconsistente) | 🔴 **P0:** Auditar todas as rotas |
| **E2** — Conta sem senha | tb_usuario.senha nullable | Média | Alto | Nullable no schema | 🟠 P1: Tornar NOT NULL |
| **E3** — Escalada via impersonação | Admin sem log de impersonação | Baixa | Alto | RBAC | Auditoria obrigatória |

---

## 5. Priorização de Riscos (Risk Matrix)

| Ameaça | Probabilidade | Impacto | Score | Prioridade |
|--------|-------------|---------|-------|-----------|
| S1 — Forja de JWT | Alta | Crítico | 🔴 25 | P0 |
| I6 — Admin sem auth | Alta | Alto | 🔴 20 | P0 |
| I2 — CORS aberto | Alta | Alto | 🔴 20 | P0 |
| D1 — Flood login | Alta | Alto | 🔴 20 | P0 |
| I3 — Sem Helmet | Alta | Médio | 🟠 15 | P0 |
| I1 — Stack trace | Alta | Médio | 🟠 15 | P0 |
| S2 — Força bruta | Alta | Alto | 🔴 20 | P0 |
| I4 — CPF plaintext | Alta | Alto (LGPD) | 🟠 18 | P1 |
| R1 — Sem auditoria | Alta | Alto | 🟠 18 | P1 |
| T2 — Upload malicioso | Média | Alto | 🟠 12 | P1 |

---

## 6. Plano de Remediação

| ID | Ação | Responsável | Sprint | Custo estimado |
|----|------|-------------|--------|----------------|
| P0-1 | Remover fallback SUPER_SECRET | Pessoa 1 | Sprint 0 | 30min |
| P0-2 | CORS com allowlist FRONTEND_URL | Pessoa 1 | Sprint 0 | 30min |
| P0-3 | Instalar e configurar Helmet | Pessoa 1 | Sprint 0 | 1h |
| P0-4 | Rate limiting no login (5/min) | Pessoa 1 | Sprint 0 | 1h |
| P0-5 | Proteger GET /admin/metrics/global | Pessoa 2 | Sprint 0 | 30min |
| P0-6 | Middleware global de erro (sem stack) | Pessoa 1 | Sprint 0 | 2h |
| P1-1 | AES-256 para CPF/CNPJ | Pessoa 1 | Sprint 1 | 1 dia |
| P1-2 | Criar tb_log_auditoria e persistir logs | Pessoa 2 | Sprint 1 | 2 dias |
| P1-3 | Validação Zod em todas as rotas | Todos | Sprint 1-2 | 1 semana |
| P1-4 | Limite de upload fileSize | Pessoa 2 | Sprint 1 | 30min |

---

## 7. Próximas Revisões

| Evento | Ação |
|--------|------|
| Cada deploy em produção | Re-checar lista de P0 |
| Cada nova feature de autenticação | Atualizar seção STRIDE-S |
| A cada 6 meses | Revisão completa do Threat Model |
| Após incidente de segurança | Revisão e nova análise STRIDE |

---

**Versão:** 1.0 | **Data:** 13/06/2026 | **Responsável:** Tech Lead (Pessoa 1)  
**Próxima revisão:** Dezembro/2026
