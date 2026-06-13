# Definition of Done (DoD) — Obra Integrada

> Uma tarefa só é considerada "Concluída" quando **TODOS** os critérios abaixo forem satisfeitos.

---

## Critérios de Done

### 💻 Código
- [ ] Código commitado em branch separada (`feat/`, `fix/`, `refactor/`)
- [ ] Commits seguem **Conventional Commits** (`feat(módulo): descrição`)
- [ ] **Sem `console.log` de debug** deixado no código
- [ ] **Sem secrets ou credenciais hardcoded**
- [ ] Código revisado por pelo menos **1 outro membro da equipe** (PR aprovado)
- [ ] Sem arquivos não relacionados alterados

### 🔒 Segurança (obrigatório)
- [ ] Toda rota nova tem middleware de **autenticação** (`authenticate`)
- [ ] Toda rota nova tem middleware de **autorização** (`requirePermissao` ou `requireRole`)
- [ ] Toda rota que acessa dados de obra aplica **filtro de tenant** (`id_cliente`)
- [ ] Inputs validados com **Zod** (quando implementado)
- [ ] `npm audit --audit-level=high` passa **sem vulnerabilidades**
- [ ] Dados sensíveis (CPF, saúde) **não aparecem em logs**

### ✅ Testes
- [ ] **Testes unitários** escritos para lógica de negócio nova
- [ ] **Testes de integração** escritos para o endpoint (se aplicável)
- [ ] Todos os testes existentes **continuam passando** (sem regressão)
- [ ] Cobertura de código do novo código: **≥ 70%**

### 🧹 Qualidade
- [ ] `npm run lint` passa **sem erros** no módulo alterado
- [ ] Sem comentários de código obsoletos ou TODO antigos deixados
- [ ] Sem duplicação de código identificada e não documentada

### 🗄️ Banco de Dados (se aplicável)
- [ ] Migration criada com `prisma migrate dev --name <nome-descritivo>`
- [ ] Schema **aprovado pela Pessoa 5** antes do merge
- [ ] Migration funciona em **banco limpo** (testada localmente)

### 📝 Documentação
- [ ] Se é endpoint novo: **adicionado ao `openapi.yaml`** (quando existir)
- [ ] Se é mudança de comportamento existente: **CHANGELOG.md atualizado**
- [ ] Se é nova variável de ambiente: **`.env.example` atualizado**

### 🚀 Deploy
- [ ] PR passou em todos os **checks de CI** (lint, testes, audit)
- [ ] Deploy em **staging** realizado e funcionando
- [ ] Testado manualmente em staging por pelo menos **1 pessoa**

### ✋ Aceite
- [ ] **Critérios de aceite** da User Story foram verificados manualmente
- [ ] **Dono do Produto** validou a funcionalidade (para histórias P0/P1)

---

## Exceções Documentadas

Algumas regras podem ser relaxadas com justificativa documentada no PR:
- **Cobertura < 70%:** Justificar no PR (ex: integração com serviço externo difícil de mockar)
- **Sem openapi.yaml:** Aceitável enquanto o arquivo não for criado (Sprint 1)
- **Sem teste de integração:** Apenas para hotfixes urgentes — débito técnico registrado

---

## DoD por Tipo de Tarefa

| Tipo | Critérios adicionais |
|------|---------------------|
| Feature nova | Todos acima |
| Bug fix | Adicionar teste que reproduz o bug (regression test) |
| Refatoração | Comportamento deve ser idêntico; testes existentes passam |
| Hotfix P0 | Relaxa documentação, mas exige teste e review |
| Documentação | Revisada por 1 pessoa, links funcionam |
