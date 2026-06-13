# 📁 Agent Skill: Obsidian Vault Manager
## Diretrizes de Estruturação e Organização do Vault Obsidian (`ob_obra_integrada`)

Esta skill orienta o Agente IDE sobre como criar, modificar e organizar os arquivos de documentação localizados na pasta `ob_obra_integrada/` do projeto, que funciona como um cofre (vault) do **Obsidian** com mapeamento de MOC (Map of Content).

---

## 1. Regras do Obsidian Frontmatter

Toda nota criada no cofre **deve** conter um bloco de metadados YAML (frontmatter) no topo do arquivo. Esse bloco deve conter pelo menos as tags, apelidos de busca (aliases) e a data da última atualização:

```yaml
---
tags: [modulo, modulo-financeiro, rbac, rdo, lgpd, conformidade]
aliases: [Dicionário Financeiro, Fluxo Financeiro, Tabela Financeira]
atualizado: 2026-06-13
---
```

---

## 2. Sintaxe de Links Internos (WikiLinks)

- Para referenciar outras notas do cofre Obsidian, o agente **deve** utilizar a sintaxe de colchetes duplos: `[[Nome da Nota]]`.
- Caso queira exibir um texto alternativo na renderização, utilize a sintaxe de pipe: `[[Nome Original da Nota|Texto que Aparecerá]]`.
- **Exemplo de parágrafo:**
  > O módulo de diário de obras é responsável por consolidar o [[46 - Plano de Resposta a Incidentes|RDO Digital]]. As informações coletadas são enviadas para a tabela [[Esquema Completo do Banco de Dados|tb_diario_obra]] do PostgreSQL.

---

## 3. Estrutura de Pastas e Mapeamento

Sempre grave novas notas na subpasta correspondente do cofre. Nunca crie arquivos soltos na raiz da pasta `ob_obra_integrada/`, exceto as notas de índice globais.

| Pasta Temática | O que deve ser salvo nela |
|----------------|---------------------------|
| `10 - Produto e Negocios/` | Regras de negócio, dicionários de conceitos, fluxos BPMN, definições de papéis de usuários (RBAC). |
| `20 - Documentacao e Tecnologias/` | Identidades visuais, especificações de wireframes em ASCII art e feedbacks de pesquisa. |
| `30 - Banco de Dados e Modelagem/` | Diagrama ER, schemas do Prisma, scripts SQL, triggers, procedures e referências de custos (SINAPI/INCC). |
| `40 - Back-end, APIs e Seguranca/` | Endpoints REST, lógicas dos controllers, fluxos de integração e diretrizes LGPD/segurança da API. |
| `40 - Execucao e Implementacao/` | Checklists de sprints, cronogramas de tarefas e logs de divisão ágil da equipe. |

---

## 4. Atualização do MOC (Map of Content) e Índices

Ao criar uma nova nota em qualquer subpasta:
1. Abra o arquivo de índice da subpasta correspondente (geralmente nomeado como `00 - Index - [Nome].md`).
2. Adicione a nova nota na listagem com um link `[[Minha Nova Nota]]` e uma breve descrição da finalidade do arquivo.
3. Abra o arquivo de índice global [INDICE-COMPLETO.md](file:///d:/Repositorios/antigravity/obra-integrada/ob_obra_integrada/00-Index/INDICE-COMPLETO.md) e verifique se a contagem e as listagens de seções continuam alinhadas e atualizadas.
4. Garanta que não existam notas órfãs (notas sem nenhuma referência em links de outras notas do cofre).
