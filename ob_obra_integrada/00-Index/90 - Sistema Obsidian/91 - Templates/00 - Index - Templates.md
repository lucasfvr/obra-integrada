---
tags: [template, obsidian, sistema, padrao]
aliases: [Markdown Templates]
---
# 🎨 Índice - Templates

Coleção de templates para padronização de documentação no Obsidian.

## Templates Disponíveis

### 1. Template - Feature Documentation
**Uso:** Documentar novas features
**Arquivo:** `template-feature.md`

```markdown
---
tags: [feature, nova]
aliases: []
---
# Feature: [Nome]

## 📝 Descrição
[Descrição breve e clara]

## 🎯 Objetivo
[Qual problema resolve?]

## 🔍 Detalhes

### User Story
As a [persona]
I want to [ação]
So that [benefício]

### Funcionalidades
- [ ] Sub-feature 1
- [ ] Sub-feature 2

## 🔗 Relacionadas
- [[Documento relacionado 1]]
- [[Documento relacionado 2]]
```

### 2. Template - Decision Log
**Uso:** Registrar decisões importantes
**Arquivo:** `template-decision.md`

```markdown
---
tags: [decisao, arquitetura]
status: [Proposto, Aceito, Rejeitado, Deprecado]
---
# ADR: [Título da Decisão]

## Contexto
[Qual é o problema?]

## Opções Consideradas
- Opção 1: [Descrição]
- Opção 2: [Descrição]

## Decisão
[Qual decisão foi tomada e por quê?]

## Consequências
### Positivas
- [Pro]
- [Pro]

### Negativas
- [Con]
- [Con]

## Alternativas Rejeitadas
- [Por que não foi escolhida]

## Data
[Data da decisão]
```

### 3. Template - Meeting Notes
**Uso:** Atas de reunião
**Arquivo:** `template-meeting.md`

```markdown
---
tags: [reuniao, data]
participantes: []
---
# Reunião: [Título]

**Data:** [Data]
**Hora:** [Hora]
**Duração:** [Minutos]
**Participantes:** [Lista]

## Agenda
1. [ ] Tópico 1
2. [ ] Tópico 2

## Discussão
### Tópico 1
- Ponto 1
- Ponto 2

## Decisões Tomadas
- [ ] Decisão 1 - Responsável: [@pessoa]
- [ ] Decisão 2 - Responsável: [@pessoa]

## Ações
| Ação | Responsável | Prazo |
|------|-------------|-------|
| [Ação 1] | [@pessoa] | [Data] |
| [Ação 2] | [@pessoa] | [Data] |

## Próxima Reunião
**Data:** [Data]
**Tópicos:** [Lista]

## 🔗 Relacionadas
- [[Reunião anterior]]
```

### 4. Template - Bug Report
**Uso:** Registrar bugs encontrados
**Arquivo:** `template-bug.md`

```markdown
---
tags: [bug, issue]
severity: [Critical, High, Medium, Low]
status: [Novo, Confirmado, Em Desenvolvimento, Testando, Fechado]
---
# Bug: [Título Descritivo]

## Descrição
[Descrição clara do problema]

## Passos para Reproduzir
1. Passo 1
2. Passo 2
3. Passo 3

## Resultado Esperado
[O que deveria acontecer?]

## Resultado Atual
[O que realmente aconteceu?]

## Screenshots / Logs
[Anexar prints ou logs se relevante]

## Ambiente
- OS: [Windows/Mac/Linux]
- Navegador: [Chrome, Firefox, etc]
- Versão: [v1.2.3]
- Tenant: [Construtora X]

## Severidade
[Critical/High/Medium/Low]

## Responsável
[@desenvolvedor]

## Referências
- [[Feature relacionada]]
- [Link para issue no GitHub]
```

### 5. Template - User Story
**Uso:** User stories para sprints
**Arquivo:** `template-userstory.md`

```markdown
---
tags: [story, sprint]
epic: [EPIC-XXX]
points: [1-13]
status: [To Do, In Progress, Review, Done]
---
# US: [ID] - [Título]

## User Story
As a **[persona]**
I want to **[ação]**
So that **[benefício]**

## Acceptance Criteria
- [ ] AC1: [Critério 1]
- [ ] AC2: [Critério 2]
- [ ] AC3: [Critério 3]

## Definition of Done
- [ ] Código implementado e revisado
- [ ] Testes unitários 80%+ coverage
- [ ] Testes integração passando
- [ ] Documentação atualizada
- [ ] QA aprovado

## Notas Técnicas
[Detalhes de implementação, trade-offs, etc]

## Relacionadas
- [[Épico: EPIC-XXX]]
- [[Histórias relacionadas]]
```

### 6. Template - MOC (Map of Content)
**Uso:** Mapas de conteúdo para índices
**Arquivo:** `template-moc.md`

```markdown
---
tags: [moc, indice]
aliases: [Index, Map]
---
# 🗺️ MOC: [Nome do Mapa]

## Visão Geral
[Uma frase descrevendo este mapa]

## Estrutura

### Seção 1
- [[Documento 1]]
- [[Documento 2]]
- [[Documento 3]]

### Seção 2
- [[Documento A]]
- [[Documento B]]

## Fluxo Sugerido
1. Comece por [[Introdução]]
2. Explore [[Seção principal]]
3. Aprofunde em [[Tópico avançado]]

## Relacionadas
- [[MOC relacionado 1]]
- [[MOC relacionado 2]]

---
**Mantido por:** [@responsavel]
**Última atualização:** [Data]
```

## 🎯 Convenções de Nomenclatura

### Documentos
- Usar PascalCase com espaços: `Feature - Novo Dashboard`
- IDs: `US-001`, `BUG-042`, `EPIC-003`
- Templates: `template-*`

### Tags
- Lowercase com hífen: `#feature-new`, `#bug-critical`
- Categorias: `#producto`, `#tecnologia`, `#negocio`

### Aliases
- Use para nomes alternativos
- Siglas: `MOC = Map of Content`

## 📌 Como Usar Templates

### Via Obsidian UI
1. Abrir comando: `Insert template`
2. Selecionar template
3. Preencher campos

### Via Frontmatter
1. Copiar frontmatter do template
2. Adaptar valores
3. Completar conteúdo

## 🔗 Referências Relacionadas
- [[00 - Mapa de Perfis (MOC)]]
- [[10 - Mapa de Regras de Negocio (MOC)]]

---
**Status:** 🔄 Em desenvolvimento
**Última atualização:** 11 de junho de 2026
