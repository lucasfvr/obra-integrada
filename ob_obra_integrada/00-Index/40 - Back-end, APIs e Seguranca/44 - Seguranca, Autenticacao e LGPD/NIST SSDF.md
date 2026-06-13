# NIST SSDF — Mapeamento de Práticas
## Secure Software Development Framework — Obra Integrada

**Versão:** 1.0 | **Data:** 13/06/2026  
**Referência:** NIST SP 800-218 (SSDF v1.1)

> O SSDF organiza práticas de segurança em 4 grupos: **PO** (Prepare), **PS** (Protect), **PW** (Produce), **RV** (Respond & Verify)

---

## Grupo PO — Prepare the Organization

| Prática SSDF | Descrição | Status Obra Integrada | Evidência |
|-------------|-----------|----------------------|-----------|
| PO.1.1 | Definir requisitos de segurança | ⚠️ Parcial | PRD NFRs + OWASP ASVS checklist |
| PO.1.2 | Documentar e manter requisitos de segurança | ⚠️ Parcial | `ob_obra_integrada/00-Index/40 - Back-end, APIs e Seguranca/44 - Seguranca, Autenticacao e LGPD/` |
| PO.2.1 | Implementar papéis e responsabilidades de segurança | ✅ | `CONTRIBUTING.md` + divisão de tarefas |
| PO.2.2 | Garantir que equipe tem conhecimento de segurança | ❌ | Treinamento pendente (P2) |
| PO.3.1 | Definir e usar pipeline de CI/CD seguro | 📄 Documentado | `ob_obra_integrada/00-Index/60 - Infraestrutura, Cloud e DevOps/62 - Pipelines de Deploy (CI-CD)/Pipeline.md` — implementar CI |
| PO.3.2 | Incluir testes de segurança no pipeline | ❌ | Semgrep + npm audit planejados |
| PO.5.1 | Implementar controles de acesso ao código-fonte | ✅ | Proteção de branch main no GitHub |

---

## Grupo PS — Protect the Software

| Prática SSDF | Descrição | Status | Evidência |
|-------------|-----------|--------|-----------|
| PS.1.1 | Proteger código-fonte contra acesso não autorizado | ✅ | Repositório privado GitHub |
| PS.2.1 | Verificar integridade de terceiros (dependências) | ❌ | npm audit não no CI ainda |
| PS.3.1 | Arquivar e proteger cada release | ⚠️ | GitHub tags — sem artefato assinado |

---

## Grupo PW — Produce Well-Secured Software

| Prática SSDF | Descrição | Status | Evidência |
|-------------|-----------|--------|-----------|
| PW.1.1 | Aplicar modelagem de ameaças ao design | ✅ | `ob_obra_integrada/00-Index/40 - Back-end, APIs e Seguranca/44 - Seguranca, Autenticacao e LGPD/Threat Model (STRIDE).md` |
| PW.2.1 | Verificar se o design atende requisitos de segurança | ⚠️ | OWASP ASVS checklist parcial |
| PW.4.1 | Seguir práticas de codificação segura | ⚠️ | CONTRIBUTING.md define padrões parciais |
| PW.4.4 | Validar todos os inputs | ❌ | **P1 — Zod pendente** |
| PW.5.1 | Realizar análise estática de código (SAST) | ❌ | Semgrep pendente no CI |
| PW.6.1 | Realizar análise dinâmica de código (DAST) | ❌ | OWASP ZAP pendente |
| PW.6.2 | Testar a aplicação contra ameaças comuns | ⚠️ | Testes manuais; Pentest pendente |
| PW.7.1 | Revisar e/ou testar releases | ⚠️ | Code review no PR; sem staging formal |
| PW.8.1 | Criar e manter plano de testes | ✅ | `ob_obra_integrada/00-Index/80 - Customer Success (CS) e Suporte/82 - Testes e Garantia de Qualidade (QA)/Plano de Testes.md` |

---

## Grupo RV — Respond to Vulnerabilities

| Prática SSDF | Descrição | Status | Evidência |
|-------------|-----------|--------|-----------|
| RV.1.1 | Monitorar e identificar vulnerabilidades | ❌ | npm audit manual; sem Dependabot |
| RV.1.2 | Investigar relatórios de vulnerabilidade | ✅ | `SECURITY.md` com processo |
| RV.2.1 | Planejar e priorizar remediações | ✅ | Priorização P0-P3 no checklist |
| RV.2.2 | Remediar vulnerabilidades de acordo com o risco | ⚠️ | P0 identificados; implementação pendente |
| RV.3.1 | Analisar vulnerabilidades para identificar causas | ✅ | Threat model + PARI |
| RV.3.2 | Desenvolver e compartilhar informações sobre vulnerabilidades | ❌ | CVE/disclosure process pendente |

---

## Resumo de Conformidade SSDF

| Grupo | Total de práticas | Conforme | Parcial | Não conforme |
|-------|-----------------|---------|---------|-------------|
| PO — Prepare | 7 | 2 | 3 | 2 |
| PS — Protect | 3 | 1 | 1 | 1 |
| PW — Produce | 9 | 2 | 4 | 3 |
| RV — Respond | 6 | 3 | 1 | 2 |
| **Total** | **25** | **8 (32%)** | **9 (36%)** | **8 (32%)** |

---

## Roadmap de Conformidade SSDF

| Sprint | Práticas alvo |
|--------|--------------|
| Sprint 0–1 | PW.4.4 (Zod), PW.5.1 (Semgrep no CI), RV.1.1 (Dependabot) |
| Sprint 2–3 | PO.3.1 (CI implementado), PW.6.1 (OWASP ZAP) |
| Sprint 4+ | PO.2.2 (treinamento), PW.6.2 (pentest), PS.2.1 (verificação deps) |

---

**Versão:** 1.0 | **Data:** 13/06/2026 | **Responsável:** Tech Lead (Pessoa 1)
