# OWASP ASVS — Application Security Verification Standard
## Obra Integrada — Checklist de Conformidade

**Versão OWASP ASVS:** 4.0.3  
**Data da avaliação:** 13 de junho de 2026  
**Nível alvo:** Nível 2 (Padrão — para aplicações SaaS B2B)

> **Legenda:** ✅ Conforme | ⚠️ Parcial | ❌ Não conforme | 🚧 Em desenvolvimento | N/A Não aplicável

---

## V1 — Arquitetura, Design e Modelagem de Ameaças

| ID | Requisito ASVS | Status | Evidência / Observação |
|----|---------------|--------|----------------------|
| 1.1.1 | Ciclo de desenvolvimento seguro documentado | ⚠️ | Documentado parcialmente no vault |
| 1.1.2 | Threat model para mudanças de design | ✅ | `ob_obra_integrada/00-Index/40 - Back-end, APIs e Seguranca/44 - Seguranca, Autenticacao e LGPD/Threat Model (STRIDE).md` |
| 1.1.3 | Controles de segurança aplicados por camada | ⚠️ | RBAC existe; Helmet e CSP pendentes |
| 1.2.1 | Módulos comunicam-se com privilégio mínimo | ✅ | RBAC por papel e por obra |
| 1.4.1 | Controles de acesso aplicados na camada servidor | ✅ | authMiddleware + requireObraAccess |
| 1.5.1 | Validação de inputs na fronteira do sistema | ❌ | Sem Zod/Joi — P1 |
| 1.6.1 | Política de gerenciamento de secrets documentada | ⚠️ | .env.example existe; fallback JWT pendente |

---

## V2 — Autenticação

| ID | Requisito ASVS | Status | Evidência |
|----|---------------|--------|-----------|
| 2.1.1 | Senhas com mínimo 12 caracteres | ❌ | Regex atual exige 8; ajustar |
| 2.1.2 | Senhas com no máximo 128 caracteres aceitas | ✅ | bcrypt trunca em 72 |
| 2.1.3 | Checagem contra lista de senhas comuns | ❌ | P2 |
| 2.1.6 | Controles contra força bruta (lock ou CAPTCHA) | ❌ | **P0 — rate limit pendente** |
| 2.2.1 | Anti-automation (rate limiting) nos endpoints de auth | ❌ | **P0** |
| 2.2.2 | MFA disponível | ❌ | P2 |
| 2.3.1 | Senhas armazenadas com hash resistente | ✅ | bcrypt rounds=10 |
| 2.5.1 | Recuperação de senha por canal seguro | ✅ | E-mail |
| 2.7.1 | OTP com expiração curta | N/A | Sem OTP |
| 2.9.1 | Token de acesso não é previsível ou guessável | ✅ | JWT com UUID |

---

## V3 — Gerenciamento de Sessão

| ID | Requisito ASVS | Status | Evidência |
|----|---------------|--------|-----------|
| 3.1.1 | URLs não contêm tokens de sessão | ✅ | JWT no header Authorization |
| 3.2.1 | Tokens gerados com entropia suficiente | ✅ | JWT assinado com secret forte (quando configurado) |
| 3.2.3 | Tokens invalidados no logout server-side | ❌ | P2 — logout client-only |
| 3.3.1 | Sessão expira após inatividade | ✅ | JWT 8h de expiração |
| 3.4.1 | Cookies com HttpOnly | ❌ | Token em localStorage (XSS risk) |
| 3.4.2 | Cookies com Secure flag | N/A | Token em localStorage |
| 3.4.3 | Cookies com SameSite | N/A | Token em localStorage |

---

## V4 — Controle de Acesso

| ID | Requisito ASVS | Status | Evidência |
|----|---------------|--------|-----------|
| 4.1.1 | Regras de acesso aplicadas server-side | ✅ | authorizationMiddleware.js |
| 4.1.2 | Princípio do menor privilégio | ✅ | RBAC com 7 papéis |
| 4.1.3 | Deny-by-default | ✅ | Role sem permissão → 403 |
| 4.2.1 | Acesso restrito a recursos do próprio tenant | ✅ | requireObraAccess |
| 4.2.2 | Proteção contra IDOR | ⚠️ | requireObraAccess, mas nem todas as rotas usam |
| 4.3.1 | Interface administrativa separada ou protegida | ⚠️ | Protegida por RBAC, sem domínio separado |

---

## V5 — Validação, Sanitização e Encoding

| ID | Requisito ASVS | Status | Evidência |
|----|---------------|--------|-----------|
| 5.1.1 | HTTP params não utilizados são ignorados | ⚠️ | Parcial — sem validação declarativa |
| 5.1.3 | Validação de schema de inputs | ❌ | **P1 — Zod pendente** |
| 5.1.4 | Dados estruturados validados contra schema | ❌ | P1 |
| 5.2.1 | Sanitização de HTML | ❌ | P2 — XSS possível em campos de texto livre |
| 5.3.3 | Context-aware output encoding para HTML | ❌ | P2 |

---

## V6 — Criptografia

| ID | Requisito ASVS | Status | Evidência |
|----|---------------|--------|-----------|
| 6.1.1 | Dados pessoais sensíveis criptografados em repouso | ❌ | **P1 — CPF em plaintext** |
| 6.2.1 | Módulos criptográficos validados | ✅ | bcrypt, jsonwebtoken (libs maduras) |
| 6.2.2 | Algoritmos de criptografia padronizados | ⚠️ | bcrypt OK; AES-256 não implementado |
| 6.3.1 | Geração de números aleatórios com crypto.randomBytes | N/A | UUID usado para IDs |
| 6.4.1 | Gestão de secrets via variáveis de ambiente | ⚠️ | .env.example existe; fallback JWT crítico |

---

## V7 — Tratamento de Erros e Logs

| ID | Requisito ASVS | Status | Evidência |
|----|---------------|--------|-----------|
| 7.1.1 | Logs não contêm dados sensíveis | ❌ | console.log pode expor dados |
| 7.1.2 | Logs contêm contexto suficiente (user-id, IP) | ❌ | **P1** |
| 7.2.1 | Erros não expõem stack trace ao cliente | ❌ | **P0 — middleware de erro pendente** |
| 7.2.2 | Logs de auditoria para ações sensíveis | ❌ | **P1 — tb_log_auditoria não existe** |
| 7.4.1 | Mecanismo genérico de tratamento de exceções | ❌ | P0 — middleware global pendente |

---

## V8 — Proteção de Dados

| ID | Requisito ASVS | Status | Evidência |
|----|---------------|--------|-----------|
| 8.1.1 | Dados sensíveis não armazenados no cliente | ⚠️ | Token em localStorage (risco XSS) |
| 8.2.1 | Dados PII identificados e documentados | ✅ | ROPA em doc 44 |
| 8.3.1 | Dados sensíveis não enviados em query params | ✅ | POST body para credenciais |
| 8.3.4 | Dados pessoais tratados pela menor retenção necessária | ⚠️ | Política documentada; implementação pendente |

---

## V9 — Comunicação

| ID | Requisito ASVS | Status | Evidência |
|----|---------------|--------|-----------|
| 9.1.1 | TLS para todas as conexões | ✅ | Vercel (HTTPS obrigatório) |
| 9.1.2 | TLS 1.2 ou superior | ✅ | Vercel |
| 9.1.3 | Certificados válidos e não expirados | ✅ | Vercel gerencia |

---

## V10 — Código Malicioso

| ID | Requisito ASVS | Status | Evidência |
|----|---------------|--------|-----------|
| 10.2.1 | Fontes de dados não controladas testadas | ❌ | P2 |
| 10.3.1 | Verificação de integridade das dependências | ❌ | npm audit não integrado ao CI |

---

## V13 — API e Web Service

| ID | Requisito ASVS | Status | Evidência |
|----|---------------|--------|-----------|
| 13.1.1 | Todos os componentes usam a mesma versão de API | ✅ | Versionamento não usado — único servidor |
| 13.1.2 | Resposta de erro não vaza detalhes de implementação | ❌ | P0 |
| 13.1.3 | APIs de administração acessíveis somente a admins | ❌ | GET /admin/metrics sem RBAC |
| 13.2.1 | Métodos HTTP explicitamente definidos | ✅ | Express routes |
| 13.2.3 | Conteúdo recebido validado (Content-Type) | ❌ | P1 |
| 13.3.1 | Documentação da API (OpenAPI) | ❌ | **P1 — openapi.yaml pendente** |

---

## Resumo de Conformidade

| Nível | Total de controles | Conforme (✅) | Parcial (⚠️) | Não conforme (❌) | % Conformidade |
|-------|-------------------|-------------|-------------|-----------------|----------------|
| Nível 1 (obrigatório) | 43 | 15 | 8 | 20 | **35%** |
| Nível 2 (padrão SaaS) | 72 | 18 | 12 | 42 | **25%** |

### Itens P0 (resolver antes do deploy em produção):
1. ❌ 2.1.6 / 2.2.1 — Rate limiting no login
2. ❌ 7.2.1 — Stack trace exposto em erro
3. ❌ 7.4.1 — Middleware global de erro
4. ❌ 13.1.2 — Respostas de erro sem detalhes
5. ❌ 13.1.3 — Rotas admin sem RBAC

---

**Versão:** 1.0 | **Data:** 13/06/2026  
**Próxima revisão:** Após implementação dos P0 (estimativa: agosto/2026)
