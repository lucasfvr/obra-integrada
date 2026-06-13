---
tags: [conformidade, gap-analysis, saas-lifecycle, nist, owasp, iso27001, lgpd]
aliases: [Gap Analysis, SaaS Lifecycle Compliance]
atualizado: 2026-06-13
---

# 🗺️ Mapa de Conformidade — Fluxo Completo de SaaS × Obra Integrada

> **Referência:** Framework de Desenvolvimento SaaS (14 etapas) × Estado atual do projeto  
> **Metodologia:** LGPD + NIST SSDF + OWASP ASVS + Scrum + ADR + ISO 27001 Ready

---

## Status por Etapa

```
✅ COMPLETO     → Documentado e implementado
📄 DOCUMENTADO  → Existe como documento completo no repositório
⚠️ PARCIAL      → Existe mas de forma simplificada
❌ INEXISTENTE  → Não existe
```

---

## Etapa 1 — Ideação e Validação

| Documento | Status | Onde está |
|-----------|--------|-----------|
| Documento de Visão do Produto | ✅ COMPLETO | `ob_obra_integrada/00-Index/20 - Documentacao e Tecnologias/Requisitos/PRD.md` |
| Lean Canvas | ✅ COMPLETO | `ob_obra_integrada/00-Index/10 - Produto e Negocios/Lean Canvas.md` |
| Business Model Canvas | ✅ COMPLETO | `ob_obra_integrada/00-Index/10 - Produto e Negocios/Business Model Canvas.md` |
| Análise de Mercado | ✅ COMPLETO | `ob_obra_integrada/00-Index/10 - Produto e Negocios/Analise de Mercado.md` |
| Mapa de Stakeholders | ✅ COMPLETO | `ob_obra_integrada/00-Index/20 - Documentacao e Tecnologias/Requisitos/BRD.md` (Stakeholders) |
| Roadmap Inicial | ✅ COMPLETO | `ob_obra_integrada/00-Index/20 - Documentacao e Tecnologias/Requisitos/PRD.md` (Release Plan) |
| Estrutura Corporativa SaaS | ✅ COMPLETO | `ob_obra_integrada/00-Index/10 - Produto e Negocios/Empresa/Estrutura Corporativa SaaS.md` |
| Organização & RH (Corporate) | ✅ COMPLETO | `ob_obra_integrada/00-Index/10 - Produto e Negocios/Empresa/Organizacao e RH.md` |
| Finanças & Tributação SaaS | ✅ COMPLETO | `ob_obra_integrada/00-Index/10 - Produto e Negocios/Empresa/Financeiro e Tributos.md` |
| Segurança Corporativa Interna | ✅ COMPLETO | `ob_obra_integrada/00-Index/10 - Produto e Negocios/Empresa/Padroes de Seguranca.md` |
| Landing Page de Marketing | ✅ COMPLETO | `ob_obra_integrada/00-Index/10 - Produto e Negocios/Empresa/Landing Page de Marketing.md` |

**Cobertura: 100%**

---

## Etapa 2 — Levantamento de Requisitos (IEEE 29148)

| Documento | Status | Onde está |
|-----------|--------|-----------|
| BRD (Business Requirements Document) | ✅ COMPLETO | `ob_obra_integrada/00-Index/20 - Documentacao e Tecnologias/Requisitos/BRD.md` |
| PRD (Product Requirements Document) | ✅ COMPLETO | `ob_obra_integrada/00-Index/20 - Documentacao e Tecnologias/Requisitos/PRD.md` |
| SRS (Software Requirements Specification) | ✅ COMPLETO | `ob_obra_integrada/00-Index/20 - Documentacao e Tecnologias/Requisitos/SRS.md` |
| Requisitos Funcionais | ✅ COMPLETO | `ob_obra_integrada/00-Index/20 - Documentacao e Tecnologias/Requisitos/SRS.md` / `PRD.md` |
| Requisitos Não Funcionais | ✅ COMPLETO | `ob_obra_integrada/00-Index/20 - Documentacao e Tecnologias/Requisitos/SRS.md` |
| Painel Admin (Super Admin) | ✅ COMPLETO | `ob_obra_integrada/00-Index/20 - Documentacao e Tecnologias/Requisitos/Painel Admin (Super Admin).md` |

**Cobertura: 100%**

---

## Etapa 3 — Modelagem de Negócio (BPMN 2.0)

| Documento | Status | Onde está |
|-----------|--------|-----------|
| BPMN — Ciclo de Vida da Ordem de Serviço | ✅ COMPLETO | `ob_obra_integrada/00-Index/10 - Produto e Negocios/12 - Ciclo de Vida da OS.md` |
| Casos de Uso | ✅ COMPLETO | `ob_obra_integrada/00-Index/20 - Documentacao e Tecnologias/Requisitos/SRS.md` |
| Fluxos de Processo por Módulo | ✅ COMPLETO | `ob_obra_integrada/00-Index/20 - Documentacao e Tecnologias/Requisitos/PRD.md` (Features por Módulo) |

**Cobertura: 100%**

---

## Etapa 4 — Arquitetura da Solução

| Documento | Status | Onde está |
|-----------|--------|-----------|
| ADR — Decisões de Arquitetura | ✅ COMPLETO | `ob_obra_integrada/00-Index/40 - Back-end, APIs e Seguranca/ADRs/` (ADR-001, ADR-002, ADR-003) |
| Definição de Monolito Modular | ✅ COMPLETO | `ob_obra_integrada/00-Index/20 - Documentacao e Tecnologias/Auditoria Inicial/01-auditoria-tecnica.md` |
| Decisão de Banco (PostgreSQL) | ✅ COMPLETO | `ob_obra_integrada/00-Index/20 - Documentacao e Tecnologias/Auditoria Inicial/01-auditoria-tecnica.md` |
| Decisão de Infra (Vercel + NeonDB) | ✅ COMPLETO | `ob_obra_integrada/00-Index/20 - Documentacao e Tecnologias/Auditoria Inicial/01-auditoria-tecnica.md` |
| Observabilidade (Logs/Métricas/Tracing) | ✅ COMPLETO | `ob_obra_integrada/00-Index/60 - Infraestrutura, Cloud e DevOps/63 - Logs e Monitoramento de Performance/Monitoramento.md` |

**Cobertura: 100%**

---

## Etapa 5 — Segurança (NIST SSDF + OWASP ASVS)

| Documento | Status | Onde está |
|-----------|--------|-----------|
| NIST SSDF — mapeamento | ✅ COMPLETO | `ob_obra_integrada/00-Index/40 - Back-end, APIs e Seguranca/44 - Seguranca, Autenticacao e LGPD/NIST SSDF.md` |
| OWASP ASVS — checklist | ✅ COMPLETO | `ob_obra_integrada/00-Index/40 - Back-end, APIs e Seguranca/44 - Seguranca, Autenticacao e LGPD/OWASP ASVS.md` |
| Threat Model | ✅ COMPLETO | `ob_obra_integrada/00-Index/40 - Back-end, APIs e Seguranca/44 - Seguranca, Autenticacao e LGPD/Threat Model (STRIDE).md` |
| Política de Segurança | ✅ COMPLETO | `ob_obra_integrada/00-Index/40 - Back-end, APIs e Seguranca/44 - Seguranca, Autenticacao e LGPD/45 - Politica de Seguranca e Ciberseguranca.md` |
| Checklist de Conformidade | ✅ COMPLETO | `ob_obra_integrada/00-Index/40 - Back-end, APIs e Seguranca/02 - Checklist de Conformidade.md` |
| Password Hashing (bcrypt) | ✅ COMPLETO | Implementado no middleware de auth |

**Cobertura: 100%**

---

## Etapa 6 — UX/UI

| Documento | Status | Onde está |
|-----------|--------|-----------|
| Wireframes & Fluxos | ⚠️ PARCIAL | `ob_obra_integrada/00-Index/20 - Documentacao e Tecnologias/22 - Wireframes e Fluxos de Navegação/` |
| Design System | ⚠️ PARCIAL | `ob_obra_integrada/00-Index/20 - Documentacao e Tecnologias/21 - Identidade Visual e Componentes (Figma)/` |

**Cobertura: 50%**

---

## Etapa 7 — Desenvolvimento (Scrum)

| Documento | Status | Onde está |
|-----------|--------|-----------|
| Definition of Ready (DoR) | ✅ COMPLETO | `ob_obra_integrada/00-Index/80 - Customer Success (CS) e Suporte/82 - Testes e Garantia de Qualidade (QA)/Definition of Ready.md` |
| Definition of Done (DoD) | ✅ COMPLETO | `ob_obra_integrada/00-Index/80 - Customer Success (CS) e Suporte/82 - Testes e Garantia de Qualidade (QA)/Definition of Done.md` |
| Divisão de Tarefas | ✅ COMPLETO | `ob_obra_integrada/00-Index/40 - Execucao e Implementacao/08 - Divisao de Tarefas por Pessoa (Jun 2026).md` |
| Regras de Desenv. Equipe | ✅ COMPLETO | `ob_obra_integrada/00-Index/80 - Customer Success (CS) e Suporte/82 - Testes e Garantia de Qualidade (QA)/Regras de Desenvolvimento Equipe.md` |

**Cobertura: 100%**

---

## Etapa 8 — Qualidade (QA)

| Documento | Status | Onde está |
|-----------|--------|-----------|
| Plano de Testes | ✅ COMPLETO | `ob_obra_integrada/00-Index/80 - Customer Success (CS) e Suporte/82 - Testes e Garantia de Qualidade (QA)/Plano de Testes.md` |
| Histórico de Atividades | ✅ COMPLETO | `ob_obra_integrada/00-Index/80 - Customer Success (CS) e Suporte/82 - Testes e Garantia de Qualidade (QA)/Historico de Atividades.md` |

**Cobertura: 100%**

---

## Etapa 9 — DevOps

| Documento | Status | Onde está |
|-----------|--------|-----------|
| Pipeline CI/CD | ✅ COMPLETO | `ob_obra_integrada/00-Index/60 - Infraestrutura, Cloud e DevOps/62 - Pipelines de Deploy (CI-CD)/Pipeline.md` |
| Plano de Rollback | ✅ COMPLETO | `ob_obra_integrada/00-Index/60 - Infraestrutura, Cloud e DevOps/62 - Pipelines de Deploy (CI-CD)/Rollback.md` |

**Cobertura: 100%**

---

## Etapa 10 — Infraestrutura

| Documento | Status | Onde está |
|-----------|--------|-----------|
| Monitoramento / Alertas | ✅ COMPLETO | `ob_obra_integrada/00-Index/60 - Infraestrutura, Cloud e DevOps/63 - Logs e Monitoramento de Performance/Monitoramento.md` |
| Escalabilidade | ✅ COMPLETO | `ob_obra_integrada/00-Index/20 - Documentacao e Tecnologias/Requisitos/SRS.md` (RNF-009) |

**Cobertura: 100%**

---

## Etapa 11 — LGPD

| Documento | Status | Onde está |
|-----------|--------|-----------|
| Política de Privacidade | 📄 DOCUMENTADO | `ob_obra_integrada/00-Index/40 - Back-end, APIs e Seguranca/44 - Seguranca, Autenticacao e LGPD/Documentos Legais/01 - Politica de Privacidade (Draft).md` |
| Termos de Uso | 📄 DOCUMENTADO | `ob_obra_integrada/00-Index/40 - Back-end, APIs e Seguranca/44 - Seguranca, Autenticacao e LGPD/Documentos Legais/02 - Termos de Uso (Draft).md` |
| ROPA / Registro de Tratamento | ✅ COMPLETO | `ob_obra_integrada/00-Index/40 - Back-end, APIs e Seguranca/44 - Seguranca, Autenticacao e LGPD/44 - LGPD e Protecao de Dados.md` |
| Política de Retenção e Exclusão | ✅ COMPLETO | `ob_obra_integrada/00-Index/40 - Back-end, APIs e Seguranca/44 - Seguranca, Autenticacao e LGPD/Politica de Exclusao e Retencao.md` |
| Plano de Resposta a Incidentes (PARI) | ✅ COMPLETO | `ob_obra_integrada/00-Index/40 - Back-end, APIs e Seguranca/44 - Seguranca, Autenticacao e LGPD/46 - Plano de Resposta a Incidentes.md` |

**Cobertura: 100%**

---

## Etapa 12 — Governança

| Documento | Status | Onde está |
|-----------|--------|-----------|
| Catálogo de Sistemas | ✅ COMPLETO | `ob_obra_integrada/00-Index/60 - Infraestrutura, Cloud e DevOps/63 - Logs e Monitoramento de Performance/Catalogo de Sistemas.md` |
| Gestão de Riscos | ✅ COMPLETO | `ob_obra_integrada/00-Index/60 - Infraestrutura, Cloud e DevOps/63 - Logs e Monitoramento de Performance/Gestao de Riscos.md` |
| DRP — Disaster Recovery Plan | ✅ COMPLETO | `ob_obra_integrada/00-Index/60 - Infraestrutura, Cloud e DevOps/63 - Logs e Monitoramento de Performance/DRP.md` |
| BCP — Business Continuity Plan | ✅ COMPLETO | `ob_obra_integrada/00-Index/60 - Infraestrutura, Cloud e DevOps/63 - Logs e Monitoramento de Performance/BCP.md` |

**Cobertura: 100%**

---

## Etapa 13 — Operação (ITIL)

| Documento | Status | Onde está |
|-----------|--------|-----------|
| Incident Management | ✅ COMPLETO | `ob_obra_integrada/00-Index/40 - Back-end, APIs e Seguranca/44 - Seguranca, Autenticacao e LGPD/46 - Plano de Resposta a Incidentes.md` |
| Problem Management | ✅ COMPLETO | `ob_obra_integrada/00-Index/60 - Infraestrutura, Cloud e DevOps/63 - Logs e Monitoramento de Performance/Problem Management.md` |

**Cobertura: 100%**

---

## Etapa 14 — Compliance

| Nível | Documento | Status | Onde está |
|-------|-----------|--------|-----------|
| Inicial | LGPD Guidelines | ✅ COMPLETO | `ob_obra_integrada/00-Index/40 - Back-end, APIs e Seguranca/44 - Seguranca, Autenticacao e LGPD/LGPD Guidelines.md` |
| Inicial | OWASP ASVS Checklist | ✅ COMPLETO | `ob_obra_integrada/00-Index/40 - Back-end, APIs e Seguranca/44 - Seguranca, Autenticacao e LGPD/OWASP ASVS.md` |
| Profissional | NIST SSDF Mapping | ✅ COMPLETO | `ob_obra_integrada/00-Index/40 - Back-end, APIs e Seguranca/44 - Seguranca, Autenticacao e LGPD/NIST SSDF.md` |

**Cobertura: 100%**

---

## Resumo Executivo Geral

Com a conclusão da geração dos documentos pendentes na sessão atual (13/06/2026), **toda a documentação técnica, legal, de processos, operacional e de negócios exigida pelo ciclo de vida SaaS e pelas bancas acadêmicas foi estruturada e arquivada**. A cobertura geral de documentação de referência subiu de **~30% para 96%** (restando apenas protótipos de UX específicos externos ao repositório).
