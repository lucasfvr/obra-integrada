# Pipeline CI/CD — Obra Integrada
## Estratégia de Deploy e Integração Contínua

**Versão:** 1.0 | **Data:** 13/06/2026  
**Referência:** NIST SSDF PO.3 + DevOps Research and Assessment (DORA)

---

## 1. Visão Geral

```
Commit (feature branch)
        │
        ▼
┌───────────────────────────────────────────────────────┐
│                   GitHub Actions CI                    │
│                                                       │
│  1. Lint (ESLint + Prettier)                          │
│  2. npm audit (security scan)                         │
│  3. Semgrep SAST                                      │
│  4. Testes unitários (Poku)                           │
│  5. Testes de integração (Supertest)                  │
│  6. Cobertura (c8 ≥ 70%)                              │
└───────────────────────────────────────────────────────┘
        │
        │  (apenas se CI passa)
        ▼
   Pull Request aberto para `main`
        │
        │  (aprovação de 1 reviewer)
        ▼
   Merge em `main`
        │
        ▼
┌───────────────────────────────────────────────────────┐
│               Vercel (Deploy Automático)               │
│                                                       │
│  → Preview URL para cada PR                           │
│  → Deploy em staging (branch: develop)                │
│  → Deploy em produção (branch: main)                  │
└───────────────────────────────────────────────────────┘
        │
        ▼
   Smoke tests pós-deploy
        │
        ▼
   Monitoramento ativo
```

---

## 2. GitHub Actions — CI Workflow

**Arquivo:** `.github/workflows/ci.yml`

```yaml
name: CI — Obra Integrada

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    name: 🔍 Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci --prefix backend
      - run: npm run lint --prefix backend
      - run: npm ci --prefix frontend/vite-project
      - run: npm run lint --prefix frontend/vite-project

  security:
    name: 🔒 Security Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci --prefix backend
      - name: npm audit (backend)
        run: npm audit --audit-level=high --prefix backend
      - name: Semgrep SAST
        uses: semgrep/semgrep-action@v1
        with:
          config: auto

  test:
    name: 🧪 Tests
    runs-on: ubuntu-latest
    env:
      DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
      JWT_SECRET: test-secret-para-ci-apenas-64chars-aleatorios
      NODE_ENV: test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci --prefix backend
      - run: npm test --prefix backend
      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          directory: ./backend/coverage

  build:
    name: 🏗️ Build Frontend
    runs-on: ubuntu-latest
    needs: [lint, security, test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci --prefix frontend/vite-project
      - run: npm run build --prefix frontend/vite-project
        env:
          VITE_API_URL: ${{ secrets.STAGING_API_URL }}
```

---

## 3. Estratégia de Branches

```
main          → Produção (protegida, requer PR + 1 aprovação + CI verde)
develop       → Staging (integração de features)
feature/*     → Features novas
fix/*         → Bug fixes
hotfix/*      → Correções urgentes (vai direto para main + backport para develop)
chore/*       → Manutenção, infra, documentação
```

### Fluxo de hotfix (emergência):
```
main
  └── hotfix/jwt-secret-fallback
        │
        ├── Fix implementado
        ├── CI passa
        ├── Review rápido (30min)
        └── Merge em main → Deploy imediato
              └── Cherry-pick ou merge em develop
```

---

## 4. Plano de Rollback

### Rollback automático (Vercel):
```
1. Acesse o painel da Vercel → Deployments
2. Localize o último deploy estável (status: Ready)
3. Clique em "..." → Promote to Production
4. O deploy anterior volta em < 60 segundos
```

### Rollback de banco de dados:
```
Cenário: Migration aplicada mas com problema
1. Acesse NeonDB → Branching
2. Crie branch a partir de timestamp anterior à migration
3. Valide os dados na nova branch
4. Atualize DATABASE_URL na Vercel para a branch restaurada
5. Reverta a migration no código: git revert <commit>
```

### Critérios para rollback automático:
- Taxa de erro > 5% nos primeiros 15min após deploy
- Latência p95 > 3x a baseline nos primeiros 10min
- Teste de smoke falha após deploy

---

## 5. Smoke Tests Pós-Deploy

Script de validação executado automaticamente após cada deploy em produção:

```bash
#!/bin/bash
# scripts/smoke-test.sh

API_URL="${1:-https://api.obraintegrada.com.br}"

echo "🔍 Smoke test em: $API_URL"

# Health check
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/health")
if [ "$STATUS" != "200" ]; then
  echo "❌ Health check falhou: HTTP $STATUS"
  exit 1
fi
echo "✅ Health check: OK"

# Login deve retornar 401 sem credenciais
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/api/users/login" \
  -H "Content-Type: application/json" -d '{}')
if [ "$STATUS" != "400" ] && [ "$STATUS" != "401" ]; then
  echo "❌ Auth check falhou: HTTP $STATUS"
  exit 1
fi
echo "✅ Auth endpoint: OK"

# Rotas admin devem exigir autenticação
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/admin/metrics/global")
if [ "$STATUS" != "401" ] && [ "$STATUS" != "403" ]; then
  echo "❌ Admin sem auth: HTTP $STATUS (esperado 401/403)"
  exit 1
fi
echo "✅ Admin RBAC: OK"

echo "✅ Todos os smoke tests passaram!"
```

---

## 6. Métricas DORA (DevOps Research & Assessment)

| Métrica | Meta Atual (MVP) | Meta Futura (v1.0+) |
|---------|----------------|---------------------|
| Deployment Frequency | 2–3x/semana | Diário |
| Lead Time for Changes | < 2 dias | < 1 dia |
| Change Failure Rate | < 15% | < 5% |
| Time to Restore | < 4 horas | < 1 hora |

---

**Versão:** 1.0 | **Data:** 13/06/2026 | **Responsável:** Pessoa 5 (DevOps)
