# Plano de Gestão de Problemas — Obra Integrada
## Diretrizes de Resolução de Causa Raiz e Prevenção de Incidentes

**Versão:** 1.0 | **Data:** 13 de junho de 2026 | **Referência:** ITIL v4 — Problem Management

---

## 1. Introdução e Diferenciação Conceitual

Este documento detalha o processo de **Gestão de Problemas** da plataforma Obra Integrada. Com base nas melhores práticas do framework ITIL:

- **Incidente:** É uma interrupção não planejada ou redução na qualidade de um serviço. O objetivo da gestão de incidentes é reestabelecer o serviço estável o mais rápido possível (restauração rápida via rollback ou reinicialização).
- **Problema:** É a causa raiz subjacente a um ou mais incidentes. O objetivo da gestão de problemas é encontrar a causa do erro, documentar soluções de contorno temporárias e propor correções permanentes para evitar que o incidente volte a ocorrer.

---

## 2. Fluxo de Investigação de Problemas

O ciclo de vida de um problema na engenharia da plataforma segue o seguinte fluxo estruturado:

```
┌────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│ Identificação  ├─────►│ Análise de Causa├─────►│ Implementação   │
│ de Padrões     │      │ Raiz (RCA)      │      │ de Solução Perm.│
└────────────────┘      └────────┬────────┘      └────────┬────────┘
                                 │                        │
                                 ▼                        ▼
                        ┌─────────────────┐      ┌─────────────────┐
                        │ Registrar Erro  │      │ Monitoramento e │
                        │ Conhecido       │      │ Encerramento    │
                        └─────────────────┘      └─────────────────┘
```

1. **Identificação de Tendências:** Análise semanal dos incidentes no Sentry ou alertas do Axiom. Se um mesmo erro HTTP 500 ocorre repetidamente, ele é promovido de Incidente para **Problema**.
2. **Análise de Causa Raiz (RCA - Root Cause Analysis):** O Tech Lead ou engenheiro encarregado utiliza técnicas como os "5 Porquês" para descobrir a causa estrutural da falha (Ex: vazamento de conexão no Prisma, concorrência no banco de dados).
3. **Registro de Erro Conhecido:** Caso a correção demande tempo de desenvolvimento (Ex: refatoração de modelagem), o problema é registrado na base de erros conhecidos com uma **solução de contorno** documentada para a equipe de suporte.
4. **Implementação da Solução Definitiva:** Criação de uma tarefa no backlog (Jira/Scrum) para implementar a correção estrutural definitiva.

---

## 3. Modelo de Post-Mortem / RCA (Root Cause Analysis)

Todo problema grave que gerar indisponibilidade superior a 15 minutos em produção exige a elaboração de um relatório de Post-Mortem contendo:

- **Resumo Executivo:** O que aconteceu e qual foi o impacto para os clientes.
- **Linha do Tempo:** Cronologia exata desde o início do comportamento anormal, detecção pelo monitoramento, tomada de ação (Ex: rollback) e estabilização do sistema.
- **Os 5 Porquês:** Técnica estruturada para rastrear o erro de código/infra até o processo organizador.
- **Ações Corretivas e Preventivas:** Lista de tarefas com donos e prazos curtos para garantir que a causa raiz seja eliminada permanentemente.

---

## 4. Base de Erros Conhecidos e Soluções de Contorno (Workarounds)

### ⚠️ Erro Conhecido: E-001 — Limite de Conexões no Neon DB
- **Causa Raiz:** O pooling de conexões do Prisma ORM em chamadas serverless Vercel esgota as conexões simultâneas do Neon DB se houver pico de acessos.
- **Solução de Contorno Temporária:** O time de DevOps reinicia o serviço ou altera a variável de ambiente do Prisma para apontar para a porta do Neon Connection Pooler (`PgBouncer` porta 5432) com limite configurado.
- **Solução Definitiva:** Implementar cache do Prisma e reduzir a expiração máxima de conexões nas configurações da Vercel.
