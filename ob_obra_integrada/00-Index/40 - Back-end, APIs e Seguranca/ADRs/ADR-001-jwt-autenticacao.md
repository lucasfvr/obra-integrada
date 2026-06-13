# ADR-001 — Uso de JWT para Autenticação Stateless
## Architecture Decision Record

**Status:** Aceito  
**Data:** Outubro de 2024  
**Revisado em:** Junho de 2026  
**Decisores:** Time Obra Integrada

---

## Contexto

A plataforma Obra Integrada é uma SaaS multi-tenant com deploy serverless na Vercel. Precisamos de um mecanismo de autenticação compatível com:
- Ambiente **stateless** (sem sessões no servidor — Vercel serverless)
- **Multi-tenancy** (identificar qual construtora é o usuário)
- **RBAC** com 7 perfis diferentes por papel e por obra
- Acesso simultâneo via web e futuro mobile

## Decisão

Usar **JSON Web Tokens (JWT)** assinados com HS256, contendo no payload:
```json
{
  "userId": 1,
  "id_cliente": 5,
  "perfil": "ADMIN",
  "email": "user@construtora.com.br"
}
```
- Expiração: **8 horas**
- Secret: `JWT_SECRET` via variável de ambiente (mínimo 64 chars)
- Armazenamento no cliente: `localStorage` (revisão futura → HttpOnly cookie)

## Alternativas Consideradas

| Alternativa | Vantagem | Desvantagem |
|-------------|---------|-------------|
| Session/Cookie (stateful) | Revogação imediata | ❌ Incompatível com serverless |
| JWT (escolhido) | Stateless, funciona com Vercel | Revogação complexa (logout precisa blacklist) |
| OAuth 2.0 / SSO | Padrão enterprise | Complexidade alta para MVP |

## Consequências

**Positivas:**
- Compatível com Vercel serverless (sem Redis para sessão)
- Sem roundtrip ao banco para verificar sessão a cada request
- Payload contém `id_cliente` → filtro de tenant sem query extra

**Negativas:**
- Logout é apenas client-side (token permanece válido até expirar)
- Se JWT_SECRET vazar, todos os tokens são comprometidos (ver Threat Model S1)
- localStorage vulnerável a XSS (future: migrar para HttpOnly cookie)

## Mitigações

- JWT_SECRET deve ter ≥ 64 caracteres aleatórios (`openssl rand -hex 64`)
- **Remover fallback `SUPER_SECRET`** — P0 crítico
- Expiração curta (8h) limita janela de comprometimento
- Implementar refresh token + logout server-side no Sprint 3

---

**Relacionado a:** Threat Model S1, S3 | OWASP ASVS V3
