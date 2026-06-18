# Contributing to Obra Integrada

Obrigado pelo interesse em contribuir! Este guia explica como a equipe trabalha e como propor mudanças ao projeto.

---

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como reportar bugs](#como-reportar-bugs)
- [Como propor features](#como-propor-features)
- [Workflow de desenvolvimento](#workflow-de-desenvolvimento)
- [Padrões de código](#padrões-de-código)
- [Processo de Pull Request](#processo-de-pull-request)
- [Regras de proteção de branches](#regras-de-proteção-de-branches)

---

## Código de Conduta

Este projeto adota um ambiente colaborativo e respeitoso. Esperamos de todos os contribuidores:

- Usar linguagem inclusiva e acolhedora
- Respeitar pontos de vista diferentes
- Aceitar críticas construtivas com profissionalismo
- Focar no que é melhor para o projeto e os usuários

---

## Como reportar bugs

1. **Verifique** se o bug já foi reportado nas [Issues](../../issues)
2. **Abra uma nova issue** usando o template `Bug Report`
3. Inclua:
   - Descrição clara do comportamento esperado vs. atual
   - Passos para reproduzir
   - Screenshots ou logs relevantes
   - Ambiente (OS, browser, versão do Node)

> Para vulnerabilidades de segurança, **não abra issue pública**. Veja [SECURITY.md](SECURITY.md).

---

## Como propor features

1. **Abra uma issue** usando o template `Feature Request` antes de começar a implementar
2. Descreva o problema que a feature resolve e a solução proposta
3. Aguarde a aprovação da equipe antes de iniciar o desenvolvimento

---

## Workflow de desenvolvimento

O projeto usa **GitHub Flow** com feature branches curtas:

```
main ────●────●──────────●──────●────
         │                       ↑
         └──── feature/xxxx ────┘
```

### Passo a passo

```bash
# 1. Sincronize com main
git checkout main
git pull origin main

# 2. Crie uma branch descritiva
git checkout -b feat/adicionar-endpoint-certificacoes

# 3. Faça suas alterações com commits atômicos
git add .
git commit -m "feat(rh): adicionar endpoint GET /api/usuarios/:id/certificacoes"

# 4. Suba a branch
git push origin feat/adicionar-endpoint-certificacoes

# 5. Abra um Pull Request para main
```

### Nomenclatura de branches

| Tipo | Prefixo | Exemplo |
|------|---------|---------|
| Feature nova | `feat/` | `feat/tela-financeiro` |
| Correção de bug | `fix/` | `fix/cors-aberto` |
| Refatoração | `refactor/` | `refactor/auth-middleware` |
| Documentação | `docs/` | `docs/openapi-rotas` |
| Infraestrutura | `chore/` | `chore/docker-compose` |
| Hotfix crítico | `hotfix/` | `hotfix/jwt-secret-fallback` |

---

## Padrões de código

### Conventional Commits

Todos os commits devem seguir o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<escopo>): <descrição curta>

[corpo opcional]

[rodapé opcional]
```

**Tipos permitidos:**

| Tipo | Uso |
|------|-----|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `refactor` | Refatoração sem mudança de comportamento |
| `docs` | Documentação |
| `chore` | Manutenção, dependências, configuração |
| `test` | Adição ou correção de testes |
| `perf` | Melhoria de performance |
| `security` | Correção de vulnerabilidade |

**Exemplos:**
```bash
feat(auth): adicionar rate limiting no endpoint de login
fix(cors): configurar allowlist via variável CORS_ORIGINS
security(jwt): remover fallback SUPER_SECRET do authMiddleware
docs(api): adicionar openapi.yaml com todas as rotas
```

### Backend (Node.js + Express)

- **Sem `console.log` em produção** — usar logger estruturado
- **Todo controller tem `try/catch`** com retorno via middleware global de erro
- **Toda rota nova** tem middleware de autenticação + autorização
- **Todo endpoint que acessa obras/usuários** filtra por `id_cliente` do token JWT
- **Zod/Joi** para validação de inputs em todas as rotas
- **Nunca retornar `senha_hash`** em nenhuma resposta
- **npm audit** deve passar sem vulnerabilidades críticas/altas

### Frontend (React + Vite)

- **Sem rotas sem proteção** — todo `<Route>` privado usa `PermissaoGuard`
- **`VITE_API_URL`** para todas as chamadas de API — nunca hardcodar URLs
- **Lint deve passar** antes de abrir PR: `npm run lint --prefix frontend/vite-project`
- **Componentes novos** vão em `pages/` (não em `view/` — pasta legada)

### Banco de dados (Prisma)

- **Toda nova tabela** passa por aprovação da Pessoa 5 (guardião do schema)
- **Sempre usar migration** para alterações: `npx prisma migrate dev --name <nome>`
- **Nunca usar `db push`** fora do ambiente de desenvolvimento

---

## Processo de Pull Request

### Checklist obrigatório antes de abrir PR

```markdown
## Checklist do PR

### Geral
- [ ] A branch está atualizada com `main`
- [ ] O PR tem um título descritivo seguindo Conventional Commits
- [ ] Inclui descrição do problema e da solução

### Backend
- [ ] Nenhum `console.log` de debug deixado no código
- [ ] Todas as rotas novas têm autenticação e autorização
- [ ] Filtro por `id_cliente` em todos os acessos a dados de tenant
- [ ] Inputs validados com Zod/Joi
- [ ] `npm audit --audit-level=high` passa sem erros

### Frontend
- [ ] `npm run lint` passa sem erros
- [ ] Sem rotas novas sem `PermissaoGuard`
- [ ] Sem variáveis hardcodadas (URLs, secrets)

### Banco de dados (se aplicável)
- [ ] Migration criada com `prisma migrate dev`
- [ ] Pessoa 5 revisou as mudanças de schema

### Segurança
- [ ] Nenhum secret ou credencial hardcodada
- [ ] Dados sensíveis não aparecem em logs
- [ ] Erros não expõem stack trace

### Testes
- [ ] Testes existentes passam
- [ ] Novos testes adicionados para o comportamento novo

### Visual (se mudança de UI)
- [ ] Screenshot ou vídeo da mudança
- [ ] Testado em mobile (responsividade)
```

### Revisão de código

- **Backend:** Pessoa 1 (Tech Lead) aprova todos os PRs de backend
- **Frontend:** Pessoa 3 (Frontend Sênior) aprova todos os PRs de frontend
- **Schema/DB:** Pessoa 5 aprova qualquer mudança no `schema.prisma`
- **Mínimo:** 1 aprovação antes do merge
- **Merge style:** Squash & Merge para histórico linear

### Regras de proteção de branches

A branch `main` é protegida:
- ❌ Push direto proibido
- ✅ PRs exigem pelo menos 1 aprovação
- ✅ CI deve passar (lint + testes)
- ✅ Branches devem estar atualizadas com `main`

---

## 📄 Atualização de Documentação (Doc Branching)

Para propor atualizações em documentos oficiais (como especificações de requisitos, planos de teste, etc.) sem alterar diretamente os arquivos da `main`, a equipe adota o fluxo de **propostas**:

1. **Crie um arquivo** na pasta `ob_obra_integrada/00-Index/90 - Sistema Obsidian/95 - Propostas de Atualizacao/` com o nome no padrão:
   `YYYYMMDD-prop-[seu_nome]-[documento_alvo].md`
2. **Copie e preencha** o template oficial contido em `ob_obra_integrada/00-Index/90 - Sistema Obsidian/95 - Propostas de Atualizacao/README.md`.
3. **Submeta no Git** na sua branch de trabalho e abra o PR.
4. **Revisão e Merge:** O Líder do projeto analisará a proposta. Se aprovada, ele aplicará no documento principal, atualizará sua versão e moverá sua proposta para `ob_obra_integrada/00-Index/90 - Sistema Obsidian/95 - Propostas de Atualizacao/historico/`.

Para detalhes completos das regras de documentação e engenharia da equipe, consulte o [Regras de Desenvolvimento da Equipe](file:///d:/Repositorios/antigravity/obra-integrada/ob_obra_integrada/00-Index/80%20-%20Customer%20Success%20%28CS%29%20e%20Suporte/82%20-%20Testes%20e%20Garantia%20de%20Qualidade%20%28QA%29/Regras%20de%20Desenvolvimento%20Equipe.md).

---

## Setup do ambiente de desenvolvimento

```bash
# Clone o repositório
git clone https://github.com/lucasfvr/obra-integrada.git
cd obra-integrada

# Instale as dependências
npm run install:all

# Configure o backend
cp backend/.env.example backend/.env
# Edite backend/.env com suas credenciais locais

# Configure o frontend
cp frontend/vite-project/.env.example frontend/vite-project/.env

# Sincronize o schema Prisma
npm run db:push

# (Opcional) Popule com dados de teste
cd backend && npm run seed && cd ..

# Suba o ambiente completo
npm run dev
```

---

## Dúvidas?

Abra uma [Discussion](../../discussions) ou entre em contato com a equipe via repositório.

---

*Mantido pela equipe Obra Integrada — UNIFOA 2026*
