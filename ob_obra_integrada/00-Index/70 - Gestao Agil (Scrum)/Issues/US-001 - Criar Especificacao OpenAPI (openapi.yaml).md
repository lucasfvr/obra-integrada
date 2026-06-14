---
tags: [story, sprint, api, openapi, swagger]
epic: [EPIC-001]
points: 5
status: Done
---
# US-001 - Criar Especificação OpenAPI (openapi.yaml)

## User Story
As a **membro da equipe de engenharia**
I want to **ter uma especificação OpenAPI/Swagger completa das rotas do backend**
So that **eu possa integrar o frontend de forma consistente e validar os contratos de dados da API**

## Acceptance Criteria
- [x] Criar o arquivo `backend/openapi.yaml` contendo a especificação válida do OpenAPI 3.0.0+.
- [x] Mapear as rotas de usuários (`/api/users`), obras (`/api/obras`), diários (`/api/diarios`), tarefas (`/api/tarefas`), financeiro (`/api/financeiro`), RH (`/api/rh`) e administração (`/api/admin`).
- [x] Detalhar parâmetros de entrada (path, query, body) e formatos de resposta (200, 201, 400, 401, 403, 500), incluindo cabeçalhos de autorização JWT.
- [x] Documentar o payload de erros globais padronizado (`{ erro: string }`).

## Definition of Done
- [x] Código implementado e revisado
- [x] Testes unitários/integração passando (se aplicável)
- [x] Documentação integrada na branch principal (merge realizado)
- [x] QA/Stakeholder aprovou a entrega

## Notas Técnicas
- O arquivo deve ser salvo como `backend/openapi.yaml` para servir de referência ao backend.

## Relacionadas
- **GitHub Issue:** [#86](https://github.com/lucasfvr/obra-integrada/issues/86)
- [[47 - Mapa de Documentos Reais da Plataforma]]
- [[OWASP ASVS]]
