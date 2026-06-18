<div align="center">
<h1>Obra Integrada</h1> 

**Plataforma SaaS para gestão integrada de obras na construção civil.**

[![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)]()
[![Stack](https://img.shields.io/badge/stack-React%20%2B%20Node%20%2B%20PostgreSQL-blue)]()
[![Curso](https://img.shields.io/badge/UNIFOA-Sistemas%20de%20Informa%C3%A7%C3%A3o-orange)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()

[Sobre](#sobre-o-projeto) ·
[Funcionalidades](#funcionalidades) ·
[Stack](#stack-tecnológica) ·
[Como rodar](#como-rodar-localmente) ·
[Equipe](#equipe)

</div>

---

## Sobre o projeto

O **Obra Integrada** é uma plataforma SaaS multi-tenant que centraliza a gestão de obras de construção civil — do canteiro ao financeiro. Foi desenhada para construtoras pequenas e médias que ainda dependem de planilhas, papel e grupos de WhatsApp para coordenar equipes, materiais e cronograma.

O projeto é desenvolvido como Trabalho de Conclusão de Curso (TCC) na disciplina **Gerenciamento Ágil de Sistemas** do curso de **Sistemas de Informação** da **UNIFOA**, sob metodologia Scrum.

### Problema que resolve

| Antes | Com Obra Integrada |
|---|---|
| Diário de obra em caderno físico, sem comprovação | Diário digital com foto, GPS e auditoria geográfica |
| Gastos rastreados em planilhas espalhadas | Financeiro centralizado por obra com upload de comprovantes |
| Comunicação dispersa em vários grupos de WhatsApp | Tarefas atribuídas e acompanhadas por status |
| Permissões iguais para todos os usuários | RBAC com 7 perfis (Engenheiro, Mestre, Trabalhador, Cliente...) |

---

## Funcionalidades

### ✅ Implementadas
- Autenticação JWT com cadastro em duas etapas (validação + formulário completo)
- Gestão de obras (CRUD completo, equipe, estoque, documentos)
- Diário de obra com foto, GPS e status de auditoria
- Tarefas com atribuição múltipla, prioridade e percentual de conclusão
- Lançamentos financeiros por obra (receitas, despesas, comprovantes)
- Gestão de RH (cadastro de funcionários, matrícula automática `MAT-AAAA-NNN`)
- Painel administrativo com métricas globais e impersonação
- Dashboard dinâmico adaptado por perfil de usuário
- Multi-tenancy nativo (várias construtoras no mesmo banco)
- Sistema RBAC com 7 perfis ([ver matriz](ob_obra_integrada/00-Index/10%20-%20Produto%20e%20Negocios/13%20-%20Perfis%20de%20Usuario%20%28RBAC%29/Matriz%20de%20Acessos%20e%20Permissoes%20%28RBAC%29%20Tecnico.md))

### 🚧 Em desenvolvimento
- Perfil **Estagiário** com acesso intermediário
- Tabela de log de auditoria persistido
- Rate-limit em endpoints de autenticação
- Migração de uploads para storage externo (Vercel-ready)

### 📋 No backlog
- Relatório Diário de Obra (RDO) exportável em PDF
- Integração SINAPI (tabela nacional de insumos)
- App mobile / PWA offline para canteiro
- Cronograma físico-financeiro

---

## Stack tecnológica

### Frontend
- **React 19** + **Vite 7** + **TypeScript/JSX**
- **Tailwind CSS 4** para estilização
- **React Router 7** para navegação
- **ApexCharts** + **FullCalendar** + **Leaflet** para visualizações
- **react-hook-form** para formulários
- **react-hot-toast** para notificações

### Backend
- **Node.js** + **Express 5** (API REST)
- **Prisma 5** como ORM
- **PostgreSQL** (NeonDB em produção)
- **JWT** para autenticação (`jsonwebtoken`)
- **bcrypt** para hash de senhas
- **multer** para upload de arquivos

### Infra
- **Vercel** para deploy (frontend + backend serverless)
- **NeonDB** para Postgres com branching por ambiente
- **GitHub Actions** para CI (em configuração)

---

## Perfis de usuário (RBAC)

A plataforma suporta 7 perfis com permissões granulares:

| Perfil | Categoria | Resumo |
|---|---|---|
| `ADMIN_MASTER` | Plataforma | Administrador do SaaS — acesso total |
| `ADMIN` | Plataforma | Equipe de suporte — leitura ampla |
| `PROPRIETARIO` | Construtora | Dono da empresa — gestão completa da própria empresa |
| `RESPONSAVEL` | Obra | Engenheiro responsável — gestão da obra |
| `TRABALHADOR` | Obra | Operacional — atualiza tarefas e vê diário |
| `CLIENTE` | Cliente | Dono da obra — visualização total (read-only) |
| `USER` | Fallback | Permissão mínima |

Ver matriz detalhada em [`Matriz de Acessos e Permissões (RBAC Técnico)`](ob_obra_integrada/00-Index/10%20-%20Produto%20e%20Negocios/13%20-%20Perfis%20de%20Usuario%20%28RBAC%29/Matriz%20de%20Acessos%20e%20Permissoes%20%28RBAC%29%20Tecnico.md).

---

## Como rodar localmente

### Pré-requisitos

- **Node.js 20+** ([nodejs.org](https://nodejs.org))
- **PostgreSQL** local OU conta no [NeonDB](https://neon.tech) (free tier)
- **Git** ([git-scm.com](https://git-scm.com))

### Passo a passo

**1. Clone o repositório**
```bash
git clone https://github.com/lucasfvr/obra-integrada.git
cd obra-integrada
```

**2. Instale todas as dependências (raiz, backend e frontend)**
```bash
npm run install:all
```

**3. Configure as variáveis de ambiente do backend**

Crie `backend/.env` com:
```env
DATABASE_URL="postgresql://user:senha@host:5432/obra_integrada"
JWT_SECRET="gere-com-openssl-rand-hex-32"
PORT=5000
NODE_ENV=development
```

> Para gerar um JWT_SECRET seguro: `openssl rand -hex 32`

**4. Configure as variáveis de ambiente do frontend**

Crie `frontend/vite-project/.env` com:
```env
VITE_API_URL=http://localhost:5000
```

**5. Sincronize o schema do Prisma com o banco**
```bash
npm run db:push
```

**6. (Opcional) Popule o banco com dados de teste**
```bash
cd backend
npm run seed
cd ..
```

Isso cria 1 construtora, 1 proprietário, 100 funcionários e 15 obras realistas.

**7. Suba backend e frontend juntos**
```bash
npm run dev
```

- Backend: http://localhost:5000
- Frontend: http://localhost:5173

### Usuários de teste (após rodar o seed)

| Email | Senha | Perfil |
|---|---|---|
| `diretoria@vanguarda.com.br` | `Senha123!` | PROPRIETARIO |
| `funcionario1@vanguarda.com.br` | `Senha123!` | RESPONSAVEL ou TRABALHADOR |

---

## Estrutura do projeto

```
obra-integrada/
├── backend/                  # API Node.js + Express + Prisma
│   ├── src/
│   │   ├── config/           # Conexões e fonte única de RBAC
│   │   ├── controllers/      # Lógica de negócio por módulo
│   │   ├── middlewares/      # Auth, autorização, upload
│   │   ├── models/           # Wrappers fininhos do Prisma
│   │   ├── prisma/           # Schema, migrations, seed
│   │   ├── routes/           # Definição de endpoints
│   │   └── server.js         # Entry point
│   └── tests/
├── frontend/vite-project/    # SPA React + Vite
│   └── src/
│       ├── components/       # Componentes reutilizáveis
│       ├── context/          # AuthContext, ThemeContext
│       ├── hooks/            # useAuth, useModal, etc.
│       ├── layout/           # AppLayout, AppSidebar
│       ├── pages/            # Telas por módulo
│       ├── utils/            # permissions.js (espelho do backend)
│       └── view/             # Páginas legadas (em migração)
├── ob_obra_integrada/         # Documentação e especificações (Obsidian Vault)
└── package.json              # Orquestrador (concurrently)
```

---

## Metodologia Ágil e Workflow da Equipe

A gestão e desenvolvimento do **Obra Integrada** são conduzidos sob uma metodologia ágil adaptada (Scrum + Kanban), integrada ao GitHub Projects e com regras estritas de fluxo de trabalho para garantir a qualidade contínua.

### 📊 Quadro Kanban (GitHub Projects)
O progresso das tarefas é acompanhado no quadro oficial do repositório, estruturado com as seguintes colunas:
1. **📋 Backlog**: Registro geral de ideias, requisitos e melhorias.
2. **🎯 A Fazer (Sprint)**: Tarefas prioritárias selecionadas para a Sprint ativa (sprint backlog).
3. **⚙️ Em Andamento**: Tarefas ativas sendo desenvolvidas (limite WIP: 6 tarefas simultâneas).
4. **🔍 Em Revisão**: Pull Requests abertos aguardando revisão de código (meta de resolução: <24h).
5. **🚫 Bloqueado**: Itens com impedimentos externos (ex: APIs de terceiros, validações).
6. **✅ Concluído**: Código testado, aprovado e mesclado na branch `main`.

### 🔄 Cerimônias Ágeis
- **Daily Async**: Alinhamento diário assíncrono via GitHub Discussions e WhatsApp para status rápido.
- **Weekly Sync (Mondays 18h00)**: Reunião semanal de planejamento, acompanhamento de progresso e remoção de impedimentos.
- **Retrospectiva & Planejamento**: A cada 4 semanas, para melhoria contínua de processos e estimativas de próximas sprints.

### 🌿 Padrão de Branches e Versionamento
Adotamos um modelo Trunk-Based Development leve (de vida curta):
- **main**: Sempre funcional e release-ready.
- **Feature Branches**:
  - `feat/<modulo>-<descricao>` ou `feature/`: Novas funcionalidades (ex: `feat/diario-gps`).
  - `fix/<modulo>-<descricao>`: Correção de bugs (ex: `fix/auth-jwt`).
  - `chore/<descricao>`: Manutenção, dependências ou setup (ex: `chore/prisma-update`).
  - `docs/<descricao>`: Apenas documentação (ex: `docs/setup-agil`).
  - `refactor/<descricao>`: Alterações de arquitetura sem novas features.

### 🛡️ Regras de Pull Request (PR) e Proteção
- **Bloqueio de Push Direto**: Alterações na branch `main` só são permitidas via Pull Request.
- **Revisão por Pares**: Exigência de pelo menos 1 aprovação de revisor antes de realizar o merge.
- **Histórico Linear**: Apenas **Squash & Merge** é habilitado no GitHub para evitar merge commits redundantes.
- **Conventional Commits**: Todos os commits e títulos de PR devem seguir o padrão (ex: `feat(auth): add rate limiter`).

Detalhes adicionais podem ser consultados nos guias de apoio:
- 📖 [`CONTRIBUTING.md`](CONTRIBUTING.md) — Guia de onboarding e contribuição do desenvolvedor.
- ⚙️ [`Regras de Desenvolvimento Equipe.md`](ob_obra_integrada/00-Index/80%20-%20Customer%20Success%20%28CS%29%20e%20Suporte/82%20-%20Testes%20e%20Garantia%20de%20Qualidade%20%28QA%29/Regras%20de%20Desenvolvimento%20Equipe.md) — Diretrizes de qualidade de código, versionamento de documentos e isolamento multi-tenant.
- 📂 [`70 - Setup Agil e Workflow da Equipe.md`](ob_obra_integrada/00-Index/70%20-%20Gestao%20Agil%20%28Scrum%29/70%20-%20Setup%20Agil%20e%20Workflow%20da%20Equipe.md) — Documentação interna completa da gestão do projeto.

---

## Documentação técnica

- 📊 [Auditoria técnica](ob_obra_integrada/00-Index/20%20-%20Documentacao%20e%20Tecnologias/Auditoria%20Inicial/01-auditoria-tecnica.md) — diagnóstico do código, schema e segurança
- 🚀 [Evolução do produto](ob_obra_integrada/00-Index/20%20-%20Documentacao%20e%20Tecnologias/Auditoria%20Inicial/02-evolucao-produto.md) — benchmark e features propostas
- 🔧 [Plano de refatoração](ob_obra_integrada/00-Index/20%20-%20Documentacao%20e%20Tecnologias/Auditoria%20Inicial/03-plano-refatoracao.md) — ADRs e roadmap de 6 meses
- 👥 [Workflow de equipe](ob_obra_integrada/00-Index/20%20-%20Documentacao%20e%20Tecnologias/Auditoria%20Inicial/04-workflow-equipe.md) — divisão de responsabilidades

---

## Equipe

| Nome | Papel | GitHub |
|---|---|---|
| Lucas | Gerente de Projeto | [@lucasfvr](https://github.com/lucasfvr) |
| Pedro Miguel | Analista de Requisitos | [@p-dromiguel](https://github.com/p-dromiguel) |
| Jéssica | Desenvolvedora | [@jssica08](https://github.com/jssica08) |
| Victor | Desenvolvedor | [@Victor220205](https://github.com/Victor220205) |
| Kauã | Desenvolvedor | [@KauaRBexe](https://github.com/KauaRBexe) |
| Rhuan Gabriel | Desenvolvedor | [@Rhuan-Gabriel05](https://github.com/Rhuan-Gabriel05) |

**Curso:** Sistemas de Informação · 4º Período · UNIFOA
**Disciplina:** Gerenciamento Ágil de Sistemas

---

## Licença

Distribuído sob a licença MIT. Veja [`LICENSE.md`](LICENSE.md) para mais informações.

---

<div align="center">
  <sub>Construído por estudantes da UNIFOA · 2026</sub>
</div>
