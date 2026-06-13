# Plano de Monitoramento e Observabilidade — Obra Integrada
## Guia de Monitoria de Aplicação, Infraestrutura e Logs

**Versão:** 1.0 | **Data:** 13 de junho de 2026 | **Referência:** Site Reliability Engineering (SRE) / ADR-008

---

## 1. Visão Geral

Este documento define a estratégia de observabilidade e monitoramento da plataforma Obra Integrada. O objetivo é garantir visibilidade completa do comportamento do sistema em produção, permitindo identificar proativamente lentidões no banco de dados, falhas de chamadas de API, erros de interface no frontend e tentativas de violação de segurança.

A estratégia baseia-se em três pilares principais (Logs, Métricas e Traces), estruturada com base no **ADR-008 (Observabilidade)**.

---

## 2. Ferramentas da Stack de Observabilidade

- **Sentry (Rastreamento de Exceções):** Captura em tempo real erros não tratados no frontend (React) e backend (Express/Node.js). Fornece o *stack trace*, variáveis de contexto e histórico de navegação do usuário (breadcrumbs).
- **Axiom + Pino (Agregação de Logs):** O backend Express utiliza a biblioteca `pino` para gerar logs em formato JSON estruturado, que são enviados de forma assíncrona para o Axiom.
- **Neon Console (Métricas de Banco de Dados):** Monitoramento nativo da CPU, conexões ativas, volume de IOPS e latência de escrita/leitura do PostgreSQL.

---

## 3. Estruturação dos Logs Backend (Pino JSON)

Os logs em produção devem seguir um padrão JSON estrito para facilitar filtros e alertas no Axiom:

```json
{
  "level": 30,
  "time": 1781358900000,
  "pid": 12,
  "hostname": "vercel-serverless-worker-2a",
  "id_tenant": "tenant_uuid_1234",
  "id_usuario": "user_uuid_5678",
  "req": {
    "method": "POST",
    "url": "/api/obras/1/diarios",
    "remoteAddress": "200.100.50.25"
  },
  "msg": "Diário de obra criado com sucesso"
}
```

---

## 4. Regras de Alerta e Escalonamento

Os alertas automáticos são disparados via Sentry e Axiom com integração ao canal de suporte da equipe de engenharia:

| Métrica Monitorada | Condição de Alerta | Gravidade | Canal / Ação de Resposta |
|--------------------|--------------------|-----------|--------------------------|
| **Erros 500 na API** | Ocorrência única de erro crítico | **Alta** | Alerta imediato no canal do Slack/Teams da engenharia. |
| **Taxa de Erro 4xx** | > 15 erros em 5 minutos | **Média** | Investigação de comportamento estranho ou tentativa de ataque (brute force). |
| **Latência de API** | Média de resposta > 1.5s em 10 minutos | **Média** | Tech Lead investiga queries lentas no Prisma ou limites do banco de dados. |
| **Conexões Neon DB** | Ocupação de conexões > 85% do pool | **Alta** | Alerta de exaustão de conexões. DevOps avalia escalar o pooler do Neon. |

---

## 5. Auditoria de Acesso e LGPD

Conforme exigido pelo RNF-003, logs de auditoria específicos para proteção de dados são gravados na tabela `tb_log_auditoria` do banco de dados em ações críticas de manipulação de dados pessoais sensíveis:

- Visualização de exames de saúde PCMSO.
- Download de relatórios de mão de obra contendo CPF.
- Exclusão definitiva de usuários ou dados de obras.
- Alteração de papéis e permissões administrativas (RBAC).
