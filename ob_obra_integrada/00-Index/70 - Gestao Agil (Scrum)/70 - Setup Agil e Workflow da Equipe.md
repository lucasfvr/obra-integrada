# Setup Ágil, GitHub Projects e Workflow da Equipe

Este documento formaliza as práticas ágeis, a organização do quadro de tarefas (Kanban) e as regras de desenvolvimento colaborativo da equipe do **Obra Integrada**.

---

## 1. Visão Geral e Governança
A equipe opera sob uma metodologia ágil adaptada, combinando conceitos do **Scrum** (sprints de 2 semanas, papéis e cerimônias) com o dinamismo do **Kanban** (visualização do fluxo de valor e limites de trabalho em progresso).

O objetivo é garantir a previsibilidade das entregas acadêmicas (TCC) e a qualidade e estabilidade técnica do código e banco de dados.

---

## 2. Quadro Kanban (GitHub Projects v2)
O fluxo de trabalho é acompanhado através de um único quadro centralizado no GitHub Projects (`Obra Integrada — Roadmap`).

### 2.1 Estrutura de Colunas e Políticas de Entrada
As tarefas transitam de forma linear pelas seguintes colunas:

| Coluna | Descrição | Limite WIP (Trabalho em Progresso) | Critério de Entrada |
| :--- | :--- | :---: | :--- |
| **📋 Backlog** | Ideias, histórias de usuário e bugs registrados pendentes de triagem. | Sem limite | Triagem inicial com definição de tags de tipo, módulo e estimativa de tamanho. |
| **🎯 A Fazer (Sprint)** | Tarefas priorizadas para a Sprint ativa de 2 semanas. | Sem limite | Selecionado durante o planejamento semanal da equipe. |
| **⚙️ Em Andamento** | Itens em desenvolvimento ativo por um ou mais integrantes. | **6 tarefas** | Desenvolvedor atribui o card a si próprio e move para esta coluna. |
| **🔍 Em Revisão** | Pull Requests abertos e aguardando Code Review. | **4 tarefas** | O desenvolvedor abre o PR e linka com a Issue correspondente. |
| **🚫 Bloqueado** | Tarefas ativas que não podem progredir por fatores externos. | Sem limite | Identificado e movido caso dependa de terceiros ou decisões do orientador. |
| **✅ Concluído** | Alterações integradas e homologadas na branch estável. | Sem limite | O Pull Request foi mesclado (Squash & Merge) na branch `main`. |

### 2.2 Automações do Board
Configuradas nativamente através do *Projects Workflows*:
- **Abertura de Issue**: Adiciona automaticamente o card à coluna **Backlog**.
- **Abertura de PR (Draft)**: Mantém o card correspondente em **Em Andamento**.
- **Abertura de PR (Ready for Review)**: Move o card para **Em Revisão**.
- **Aprovação e Merge do PR**: Move automaticamente o card e a Issue relacionada para **Concluído**.
- **Fechamento de Issue manual**: Move para **Concluído**.

---

## 3. Cerimônias Ágeis da Equipe
Para otimizar o tempo e manter o foco nas entregas, a equipe realiza reuniões curtas e alinhamentos assíncronas:

| Cerimônia | Frequência | Duração | Formato / Canal | Objetivo |
| :--- | :--- | :---: | :--- | :--- |
| **Daily Standup Async** | Diária | — | GitHub Discussions ou WhatsApp | Responder de forma curta às 3 perguntas: O que fiz ontem? O que farei hoje? Algum impedimento? |
| **Weekly Sync** | Semanal (Segundas-feiras, 18h00) | 30 min | Reunião Online | Revisão rápida do progresso da Sprint, planejamento da semana e remoção de impedimentos críticos. |
| **Retrospectiva** | A cada 4 semanas (fim da 2ª Sprint) | 1 hora | Reunião Online | Discussão sobre melhorias de processo, análise de velocidade do time e planos de ação. |
| **ADR Review** | Sob demanda / Quinzenal | 45 min | Reunião Online | Alinhamento sobre decisões arquiteturais e de negócio de grande impacto (Architecture Decision Records). |

---

## 4. Workflow de Versionamento (Git)
Adotamos uma abordagem de **Trunk-Based Development leve** para evitar conflitos severos de código e garantir deploys contínuos na Vercel a partir da branch principal.

```
main (Produção/Staging) ────────●───────────────●───────────────────────●────────
                         \             /                       /
                          └─── feat/ ─┘                       └─── fix/ ──┘
```

### 4.1 Nomenclatura Padrão de Branches
As branches criadas no repositório local devem obrigatoriamente seguir a convenção abaixo:

- **Novas Funcionalidades**: `feat/<modulo>-<descricao-curta>` ou `feature/` (ex: `feat/rh-cadastro-matricula`).
- **Correção de Bugs**: `fix/<modulo>-<descricao-curta>` (ex: `fix/auth-jwt-expiration`).
- **Manutenção / Ferramentas**: `chore/<descricao-curta>` (ex: `chore/prisma-schema-lint`).
- **Documentação**: `docs/<descricao-curta>` (ex: `docs/ajuste-readme`).
- **Refatoração**: `refactor/<area>-<descricao-curta>` (ex: `refactor/api-controllers`).
- **Correções Críticas em Produção**: `hotfix/<descricao-curta>` (ex: `hotfix/cors-origins-prod`).

### 4.2 Padrão de Commits (Conventional Commits)
As mensagens de commit do Git e os títulos dos Pull Requests devem seguir a especificação [Conventional Commits v1.0.0](https://www.conventionalcommits.org/):

```
<tipo>(<escopo opcional>): <descrição curta no imperativo>
```

**Tipos aceitos**:
- `feat`: Adiciona uma nova funcionalidade (ex: `feat(api): add endpoint log-auditoria`).
- `fix`: Resolve um bug (ex: `fix(web): correct route link in App.jsx`).
- `chore`: Modificações de configuração, build ou dependências (ex: `chore(deps): update npm packages`).
- `refactor`: Refatora o código sem alterar o comportamento externo (ex: `refactor(db): isolate tenant query logic`).
- `docs`: Apenas atualizações de arquivos de documentação (ex: `docs(readme): add board structure`).
- `test`: Criação ou ajuste de testes automatizados (ex: `test(backend): add test for requireObraAccess`).

---

## 5. Ciclo de Pull Request e Integração Contínua (CI)
Para que qualquer alteração de código ou documentação seja integrada na branch `main`, as regras abaixo são impostas:

1. **Bloqueio de Push Direto**: Commits diretos na branch `main` são desabilitados.
2. **Histórico Linear**: Apenas a estratégia de **Squash & Merge** é permitida na interface do GitHub, mantendo a árvore de commits da `main` limpa e legível.
3. **Revisão Obrigatória (Peer Review)**: Todo Pull Request deve ser revisado e aprovado por pelo menos **1 outro desenvolvedor** da equipe.
4. **Resolução de Conversas**: Todas as discussões e comentários abertos na revisão do PR devem ser resolvidos antes de habilitar o merge.
5. **Aprovação nos Checks de CI**: O PR deve obrigatoriamente passar por todos os testes de integração do GitHub Actions:
   - Linting do código frontend e backend.
   - Testes unitários e de integração (`Vitest`).
   - Verificação de schemas e migrations do banco de dados (`Prisma Check`).

---

## 6. Referências Relacionadas
- 🛠️ [CONTRIBUTING.md](../../../CONTRIBUTING.md) — Instruções detalhadas de setup local, testes e boas práticas de engenharia.
- 📜 [Regras de Desenvolvimento Equipe.md](../80%20-%20Customer%20Success%20(CS)%20e%20Suporte/82%20-%20Testes%20e%20Garantia%20de%20Qualidade%20(QA)/Regras%20de%20Desenvolvimento%20Equipe.md) — Normas de controle de qualidade, versionamento de arquivos e privacidade da informação.
- 📊 [Workflow de Equipe (Auditoria Inicial)](../20%20-%20Documentacao%20e%20Tecnologias/Auditoria%20Inicial/04-workflow-equipe.md) — Detalhes da auditoria original e cronograma macro de 24 meses do projeto.

---
**Status:** ✅ Aprovado pela equipe  
**Última atualização:** 13 de junho de 2026  
**Responsável por Gestão:** Lucas (Gerente de Projeto)  
