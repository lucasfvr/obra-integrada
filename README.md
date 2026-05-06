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
- Sistema RBAC com 7 perfis ([ver matriz](docs/rbac-matriz.md))

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

Ver matriz detalhada em [`docs/rbac-matriz.md`](docs/rbac-matriz.md) (em construção).

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
├── docs/                     # Documentação técnica
│   └── auditoria-inicial/    # Auditoria de abril/2026
└── package.json              # Orquestrador (concurrently)
```

---

## Workflow de desenvolvimento

O projeto adota **GitHub Flow** com feature branches curtas:

```
main ────●────●──────────●──────●────
         │                       ↑
         └──── feature/xxxx ────┘
```

- Toda alteração nasce em uma branch (`feature/`, `fix/`, `chore/`, `docs/`)
- Squash & merge para histórico linear e legível
- 1 aprovação obrigatória antes do merge
- Conventional Commits (`feat`, `fix`, `chore`, `refactor`, `docs`)

Detalhes completos em [`docs/fluxo-git.md`](docs/fluxo-git.md) e [`CONTRIBUTING.md`](CONTRIBUTING.md) (em construção).

---

## Documentação técnica

- 📊 [Auditoria técnica](docs/docs/auditoria-inicial/01-auditoria-tecnica.md) — diagnóstico do código, schema e segurança
- 🚀 [Evolução do produto](docs/docs/auditoria-inicial/02-evolucao-produto.md) — benchmark e features propostas
- 🔧 [Plano de refatoração](docs/docs/auditoria-inicial/03-plano-refatoracao.md) — ADRs e roadmap de 6 meses
- 👥 [Workflow de equipe](docs/docs/auditoria-inicial/04-workflow-equipe.md) — divisão de responsabilidades

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
