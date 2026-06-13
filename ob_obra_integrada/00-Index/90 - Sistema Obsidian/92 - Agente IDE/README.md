# 🤖 Guia de Regras e Instruções para o Agente IDE
## Padrões de Desenvolvimento, Melhores Práticas e Instruções para IAs

Este diretório contém as diretrizes operacionais e as "skills" (instruções procedimentais) destinadas ao Agente de Inteligência Artificial (IDE Agent) que atua na manutenção e evolução da plataforma **Obra Integrada**.

---

## 1. Visão Geral da Stack e Regras de Ouro do Código

Sempre que realizar alterações no código ou planejar novas funcionalidades, siga as seguintes diretrizes estritas:

### 1.1 Back-end (`backend/`)
- **Arquitetura:** Monolito modular baseado em Express.js, estruturado em 3 camadas: `routes` -> `controllers` -> `services` -> `Prisma Client`.
- **Validação:** Toda rota que receba input do cliente (`req.body`, `req.query`, `req.params`) **deve** usar Zod para validação declarativa (conforme o [ADR-003](file:///d:/Repositorios/antigravity/obra-integrada/ob_obra_integrada/00-Index/40 - Back-end, APIs e Seguranca/ADRs/ADR-003-validacao-schema.md)).
- **Tratamento de Erros:** Não utilize múltiplos blocos `try/catch` vazando erros internos nos controllers. Use o middleware global de erros e dispare instâncias da classe de erro customizada (`AppError`).
- **Segurança e Segredos:** Nunca utilize fallbacks de texto plano para chaves de criptografia ou JWT (ex: remover fallbacks como `"SUPER_SECRET"`). O sistema deve falhar na inicialização caso variáveis obrigatórias estejam ausentes no `.env`.

### 1.2 Front-end (`frontend/vite-project/`)
- **Framework:** React 19 com compilador Vite 7.
- **Estilização:** Tailwind CSS v4 para layouts responsivos.
- **Componentes:** Adote os componentes do *shadcn/ui* copiados para a pasta local de UI, mantendo a acessibilidade baseada em Radix Primitives.
- **Gerenciamento de Estado:** Separe *server state* (gerenciado via **TanStack Query** para cache e sincronização) de *client state* local (React Context apenas para sessão de login, tema e sidebar).

---

## 2. Índice de Skills do Agente

As diretrizes operacionais de tarefas específicas estão documentadas nos seguintes arquivos:

| Skill / Guia de Procedimento | Arquivo de Instruções | Objetivo |
|-----------------------------|-----------------------|----------|
| **1. Standard Docs Builder** | [skill-docs-builder.md](file:///d:/Repositorios/antigravity/obra-integrada/ob_obra_integrada/00-Index/90 - Sistema Obsidian/92 - Agente IDE/skill-docs-builder.md) | Padronização de novos documentos Markdown e relatórios de engenharia/banca. |
| **2. Obsidian Vault Manager** | [skill-obsidian-manager.md](file:///d:/Repositorios/antigravity/obra-integrada/ob_obra_integrada/00-Index/90 - Sistema Obsidian/92 - Agente IDE/skill-obsidian-manager.md) | Regras para criação e manutenção de notas no cofre Obsidian (`ob_obra_integrada`), frontmatter, links e navegação MOC. |
| **3. Security & Multi-Tenant Guardian** | [skill-security-guardian.md](file:///d:/Repositorios/antigravity/obra-integrada/ob_obra_integrada/00-Index/90 - Sistema Obsidian/92 - Agente IDE/skill-security-guardian.md) | Diretrizes estritas para evitar vazamento de dados entre construtoras e tratamento de dados sensíveis (LGPD). |
| **4. Database & Cost Tables Migration** | [skill-db-migration.md](file:///d:/Repositorios/antigravity/obra-integrada/ob_obra_integrada/00-Index/90 - Sistema Obsidian/92 - Agente IDE/skill-db-migration.md) | Procedimento de alteração de tabelas no Prisma e ingestão de planilhas de custos (SINAPI, EMOP, INCC). |
| **5. Prompt Inicial de IA** | [PROMPT-INICIAL.md](file:///d:/Repositorios/antigravity/obra-integrada/ob_obra_integrada/00-Index/90 - Sistema Obsidian/92 - Agente IDE/PROMPT-INICIAL.md) | Prompt de sistema para alinhar e configurar novas sessões com assistentes de IA. |
| **6. Resumo do Projeto (IA)** | [RESUMO-PROJETO.md](file:///d:/Repositorios/antigravity/obra-integrada/ob_obra_integrada/00-Index/90 - Sistema Obsidian/92 - Agente IDE/RESUMO-PROJETO.md) | Mapa consolidado com arquitetura, banco, diretórios e segurança da plataforma para leitura rápida de IAs. |

---

## 3. Comportamento do Agente IDE (Antigravity/Cursor/Cline)

1. **Sem placeholders:** Nunca escreva comentários como `// todo: implementar depois` ou crie layouts web inacabados. Toda entrega de código ou documentação deve ser completa e funcional.
2. **Priorize a Estética:** O frontend deve ser visualmente impactante, limpo e dinâmico, utilizando paletas de cores modernas, tipografia estruturada e transições fluidas.
3. **Validação do Schema:** Antes de propor alterações na base de dados, execute localmente `npx prisma validate` para certificar-se de que o schema Prisma permanece íntegro.
4. **Respeito às Normas e Leis:** Qualquer nova tela ou endpoint que manipule dados pessoais ou informações sobre obras civis deve ser confrontado com os requisitos de conformidade da LGPD e as normas do setor de construção (INCC, eSocial, NRs).
