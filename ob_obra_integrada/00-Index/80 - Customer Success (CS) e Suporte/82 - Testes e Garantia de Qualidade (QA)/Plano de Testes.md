# Plano de Testes — Obra Integrada
## QA Strategy & Test Plan

**Versão:** 1.0 | **Data:** 13/06/2026  
**Referência:** NIST SSDF PW.8 | OWASP Testing Guide v4

---

## 1. Objetivos

- Garantir que cada funcionalidade entregue funciona conforme especificado no PRD
- Prevenir regressões em funcionalidades existentes
- Validar requisitos de segurança (OWASP ASVS Nível 2)
- Verificar performance e disponibilidade antes de cada release

---

## 2. Tipos de Teste

### 2.1 Testes Unitários

**Ferramenta:** Poku + c8 (cobertura)  
**Meta de cobertura:** ≥ 70%  
**Localização:** `backend/tests/`  
**Responsável:** Desenvolvedor que criou a função  

**O que testar unitariamente:**
- Funções utilitárias (`validarCPF`, `validarEmail`, `paginate`)
- Helpers do controller (sem dependência de banco)
- Lógica de validação Zod (quando implementado)
- Middleware de autorização (mock do req)

**Exemplo de teste unitário real (não mock):**
```javascript
import { describe, it } from 'poku';
import assert from 'node:assert';
import { validarCPF } from '../src/utils/validation.js';

describe('validarCPF', () => {
  it('deve aceitar CPF válido', () => {
    assert.equal(validarCPF('052.619.770-40'), true);
  });
  it('deve rejeitar CPF com todos dígitos iguais', () => {
    assert.equal(validarCPF('111.111.111-11'), false);
  });
});
```

### 2.2 Testes de Integração (API)

**Ferramenta:** Supertest + Poku  
**Meta:** Cobrir todos os endpoints críticos  
**Banco:** PostgreSQL de teste isolado (NeonDB branch "test")  
**Localização:** `backend/tests/integration/`  

**Módulos prioritários:**
1. Autenticação: `/login`, `/register`, rate limit
2. RBAC: verificar que TRABALHADOR não acessa financeiro
3. Multi-tenancy: tenant A não acessa dados do tenant B
4. Obras: CRUD completo com usuário autenticado

**Template de teste de integração:**
```javascript
import supertest from 'supertest';
import app from '../../src/server.js';

const api = supertest(app);

describe('POST /api/users/login', () => {
  it('deve retornar token para credenciais válidas', async () => {
    const res = await api.post('/api/users/login')
      .send({ email: 'test@test.com', senha: 'Senha123!' });
    assert.equal(res.status, 200);
    assert.ok(res.body.token);
  });
  
  it('deve retornar 401 para senha errada', async () => {
    const res = await api.post('/api/users/login')
      .send({ email: 'test@test.com', senha: 'errada' });
    assert.equal(res.status, 401);
  });
});
```

### 2.3 Testes E2E (End-to-End)

**Ferramenta:** Playwright  
**Meta:** Cobrir fluxos críticos completos  
**Localização:** `e2e/`  
**Execução:** CI/CD + antes de cada release  

**Fluxos críticos:**
| Fluxo | Passos | Prioridade |
|-------|--------|-----------|
| Login e acesso ao dashboard | Login → Dashboard → Verificar widgets | P0 |
| Criar obra completa | Login → Nova Obra → Formulário → Salvar | P0 |
| Diário de obra com foto | Login → Obra → Diário → Upload foto | P0 |
| RBAC — TRABALHADOR sem financeiro | Login Trabalhador → Obra → Aba Financeiro → 403 | P0 |
| Criação de funcionário | Login Admin → RH → Criar → Verificar matrícula | P1 |

### 2.4 Testes de Performance

**Ferramenta:** k6  
**Localização:** `tests/performance/`  
**Metas:**

| Endpoint | p50 | p95 | p99 | Erro máx |
|---------|-----|-----|-----|---------|
| GET /api/obras | < 200ms | < 500ms | < 1s | < 1% |
| POST /api/users/login | < 100ms | < 300ms | < 500ms | < 1% |
| GET /api/obras/:id (com detalhes) | < 300ms | < 800ms | < 2s | < 1% |

**Cenário de stress test:**
```javascript
// k6 script — 100 usuários simultâneos por 5 minutos
export const options = {
  vus: 100,
  duration: '5m',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};
```

### 2.5 Testes de Segurança

#### SAST (Static Analysis)
**Ferramenta:** Semgrep (gratuito para open-source)  
**Quando:** A cada PR (CI/CD)  
**Regras:** `semgrep --config=auto`  
**Foco:** secrets hardcoded, SQL injection patterns, XSS vectors

#### DAST (Dynamic Analysis)
**Ferramenta:** OWASP ZAP (Zed Attack Proxy)  
**Quando:** Antes de cada release  
**Alvo:** API em ambiente de staging  
**Relatório:** Salvo em `ob_obra_integrada/00-Index/40 - Back-end, APIs e Seguranca/44 - Seguranca, Autenticacao e LGPD/Relatorios/`

#### Dependency Scan
**Ferramenta:** `npm audit`  
**Quando:** A cada build no CI  
**Bloqueante:** Vulnerabilidades Critical/High

---

## 3. Ambientes de Teste

| Ambiente | URL | Branch | Banco | Propósito |
|----------|-----|--------|-------|-----------|
| **Local** | localhost:5000 | feature/* | NeonDB dev branch | Desenvolvimento |
| **Staging** | staging.obraintegrada.com.br | develop | NeonDB staging branch | Validação pré-release |
| **Produção** | obraintegrada.com.br | main | NeonDB prod | Live |

---

## 4. Definition of Done — QA Gate

Uma feature só é considerada "done" quando:

- [ ] Testes unitários passam (cobertura ≥ 70% do código novo)
- [ ] Testes de integração para o endpoint passam
- [ ] `npm audit --audit-level=high` passa sem erros
- [ ] Semgrep passa sem findings de alta severidade
- [ ] Lint passa (`npm run lint`)
- [ ] Revisado por pelo menos 1 pessoa
- [ ] Documentado (endpoint no openapi.yaml, se aplicável)

---

## 5. Gestão de Bugs

| Severidade | Definição | SLA de Correção |
|-----------|-----------|----------------|
| **S1 — Blocker** | Sistema indisponível ou dado corrompido | 4h |
| **S2 — Critical** | Funcionalidade principal quebrada | 1 dia útil |
| **S3 — Major** | Funcionalidade secundária quebrada | 3 dias úteis |
| **S4 — Minor** | Bug cosmético ou de baixo impacto | 7 dias úteis |

---

## 6. Roadmap QA

| Sprint | Meta QA |
|--------|---------|
| Sprint 0 | Configurar CI com lint + npm audit |
| Sprint 1 | Primeiros testes de integração reais (login, RBAC) |
| Sprint 2 | Supertest cobrindo todos os módulos P0 |
| Sprint 3 | Playwright E2E para fluxos críticos |
| Sprint 4 | k6 performance baseline |
| Sprint 5 | OWASP ZAP no staging |

---

**Versão:** 1.0 | **Data:** 13/06/2026 | **Responsável:** QA / Tech Lead
