---
tags: [seguranca, autenticacao, lgpd, privacidade, encriptacao, ciberseguranca, incidentes]
aliases: [Security, Authentication, Data Privacy, LGPD]
atualizado: 2026-06-13
---

# 🔐 Índice — Segurança, Autenticação e LGPD

> **Status geral:** ⚠️ MVP parcial — itens P0 críticos pendentes. Ver [[02 - Checklist de Conformidade]] para o status real.

## 📂 Documentos desta Seção

| Documento | Descrição | Status |
|-----------|-----------|--------|
| [[44 - LGPD e Protecao de Dados]] | Conformidade LGPD, inventário de dados, direitos dos titulares, retenção | ⚠️ Parcial |
| [[45 - Politica de Seguranca e Ciberseguranca]] | OWASP, hardening, DevSecOps, gestão de vulnerabilidades | ⚠️ Parcial |
| [[46 - Plano de Resposta a Incidentes]] | PARI, playbooks, notificação ANPD, RCA | ✅ Pronto |

---

## 🔑 Autenticação e Identidade

### Implementado ✅
- JWT com bcrypt (cost=10)
- RBAC multi-tenant (roles: ADMIN_MASTER, ADMIN, PROPRIETARIO, RESPONSAVEL, TRABALHADOR, CLIENTE)
- Middleware de autenticação e autorização

### Vulnerabilidades Críticas Pendentes 🔴 (P0 — Sprint 0)
- **`SUPER_SECRET` fallback** em `authMiddleware.js` → risco de tokens com segredo padrão
- **CORS aberto** (`cors()` sem allowlist) → qualquer origem acessa a API
- **Sem Helmet/CSP** → XSS e clickjacking possíveis
- **Sem rate limiting no login** → brute force possível
- **Sem tabela de auditoria persistida** → `tb_log_auditoria` não existe no schema

### Planejado
- 2FA TOTP (Sprint 3)
- Bloqueio por tentativas (Sprint 1)
- Refresh token + blacklist Redis (Sprint 2)

---

## 🔒 Proteção de Dados

### Implementado ✅
- Hash de senhas com bcrypt
- TLS em trânsito (via Vercel)
- Soft delete de usuários

### Pendente 🟠 (P1 — Sprint 1)
- **AES-256 para CPF/CNPJ** — dados em texto plano no banco
- Masking de dados sensíveis em logs
- Cron job de limpeza de dados expirados (LGPD art. 15)

---

## ⚖️ Conformidade LGPD

> Ver documento completo: [[44 - LGPD e Protecao de Dados]]

### Situação Atual
| Direito do Titular | Status |
|-------------------|--------|
| Acesso aos dados | ❌ Não implementado |
| Correção | ✅ (PATCH /api/usuarios/:id) |
| Exclusão (right to be forgotten) | ❌ Não implementado |
| Portabilidade | ❌ Não implementado |

### Documentos Legais Necessários
- ❌ Política de Privacidade (não publicada)
- ❌ Termos de Uso (não publicados)
- ❌ DPO designado
- ❌ DPA com tenants

---

## 🛡️ OWASP Top 10 — Status

| Vulnerabilidade | Status |
|----------------|--------|
| SQL Injection | ✅ (Prisma prepared statements) |
| Broken Authentication | 🔴 P0 (SUPER_SECRET fallback) |
| Sensitive Data Exposure | 🔴 P0 (CPF em texto, sem AES) |
| XXE | ❓ Não avaliado |
| Broken Access Control | ⚠️ Parcial (sem tenant audit completo) |
| Security Misconfiguration | 🔴 P0 (CORS aberto, sem CSP/Helmet) |
| XSS | 🔴 P0 (sem CSP) |
| Insecure Deserialization | ❓ Não avaliado |
| Using Components with Known Vulnerabilities | ⚠️ npm audit não no CI |
| Insufficient Logging & Monitoring | 🔴 P0 (sem tabela de auditoria) |

---

## 🚨 Resposta a Incidentes

> Ver documento completo: [[46 - Plano de Resposta a Incidentes]]

- **Notificação ANPD:** até 72h após ciência (art. 48 LGPD)
- **Canal de reporte:** security@obraintegrada.com.br (a criar)
- **DPO:** a designar

---

## 🔗 Referências Relacionadas
- [[02 - Checklist de Conformidade]] — status real de implementação
- [[AUDITORIA-CONFORMIDADE-PROJETO]] — auditoria de junho/2026
- [[08 - Divisao de Tarefas por Pessoa (Jun 2026)]] — sprints de segurança
- [[41 - Arquitetura de Endpoints (REST - GraphQL)]]
- [[14 - Arquitetura SaaS e Isolamento Multi-Tenant]]

---

**Status:** ⚠️ Em conformidade parcial — itens P0 pendentes
**Última atualização:** 13 de junho de 2026
**Próxima revisão:** 30 de junho de 2026 (pós Sprint 0)
