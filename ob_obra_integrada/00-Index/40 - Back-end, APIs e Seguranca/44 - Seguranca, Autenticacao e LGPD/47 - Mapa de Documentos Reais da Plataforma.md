---
tags: [mapa-documentos, lgpd, seguranca, juridico, saas, conformidade, obra-integrada]
aliases: [Mapa Documental, Document Map, Required Documents]
atualizado: 2026-06-13
---

# 📋 Mapa Completo: Documentos Reais que a Plataforma Deve Conter

> **Referências usadas:** Auditoria técnica de abril/2026, LGPD Lei 13.709/2018, Resolução CD/ANPD nº 15/2024 (RCIS), Resolução CD/ANPD nº 2/2022 (pequeno porte), OWASP API Security Top 10, normas da construção civil (NR-1, NR-35, NR-10).

---

## 1. Verificação da Estrutura Documental Existente

### 1.1 O que existe hoje (mapeado)

```
obra-integrada/
├── README.md                          ✅ Existe — desatualizado (menciona JSON mock)
├── LICENSE.md                         ✅ MIT
├── CHANGELOG.md                       ✅ Existe (v1.0)
├── CONTRIBUTING.md                    ✅ Existe
├── SECURITY.md                        ✅ Existe
└── ob_obra_integrada/                 ✅ Vault Obsidian completo
    ├── AUDITORIA-CONFORMIDADE-PROJETO.md ✅ Auditoria de jun/2026
    └── 00-Index/
        ├── 10 - Produto e Negocios/   ✅ MOC, ciclo OS, governança, Empresa
        ├── 20 - Documentacao e Tecnologias/ ✅ Requisitos, Telas, Banca, Auditoria Inicial
        ├── 30 - Banco de Dados e Modelagem/ ✅ Schema, DER, Master Data
        ├── 40 - Back-end, APIs e Seguranca/
        │   ├── 00 - Requisitos Tecnicos.md     ✅
        │   ├── 01 - Visao Geral Tecnica.md     ✅
        │   ├── 02 - Checklist de Conformidade.md ✅ (corrigido jun/2026)
        │   ├── ADRs/ (ADR-001, ADR-002, ADR-003) ✅
        │   └── 44 - Seguranca, Autenticacao e LGPD/
        │       ├── 00 - Index - Seguranca.md   ✅
        │       ├── 44 - LGPD e Protecao de Dados.md ✅
        │       ├── 45 - Politica de Seguranca e Ciberseguranca.md ✅
        │       ├── 46 - Plano de Resposta a Incidentes.md ✅
        │       └── Documentos Legais/ (Privacidade, Termos, Cookies, DPA, SLA, Contrato) ✅
        ├── 40 - Execucao e Implementacao/ ✅ Checklists, sprints, cronograma
        ├── 50 - Front-end e Interfaces/ ✅ Telas desktop, mobile, UI/UX
        ├── 60 - Infraestrutura, Cloud e DevOps/ ✅ Cloud, CI/CD, Logs, BCP, DRP, Riscos
        ├── 70 - Gestao Agil (Scrum)/   ✅ Backlog, Sprints
        ├── 80 - Customer Success (CS) e Suporte/ ✅ Onboarding, QA, Regras de Desenvolvimento Equipe
        └── 90 - Sistema Obsidian/      │   └── 92 - Agente IDE/ (prompts/skills)
            └── 95 - Propostas de Atualizacao/ (templates, historico)
```

### 1.2 Documentos que FALTAM no repositório (lacunas críticas)

| Documento | Categoria | Obrigatoriedade | Onde deve ir |
|-----------|-----------|----------------|--------------|
| `CONTRIBUTING.md` | Open-source / equipe | Mencionado no README mas não existe | Raiz do repo |
| `SECURITY.md` | Segurança | Padrão GitHub | Raiz do repo |
| `CHANGELOG.md` | Engenharia | Boas práticas | Raiz do repo |
| `.github/PULL_REQUEST_TEMPLATE.md` | DevOps | Processo de PR | `.github/` |
| `.github/ISSUE_TEMPLATE/` | DevOps | Processo de issue | `.github/` |
| `ob_obra_integrada/fluxo-git.md` | Dev workflow | Mencionado no README mas não existe | `ob_obra_integrada/` |
| `backend/.env.example` | Deploy | **P0 — crítico** | `backend/` |
| `.vercelignore` | Deploy | **P0** | Raiz |
| `docker-compose.yml` | DevOps | P2 | Raiz |
| `.github/workflows/ci.yml` | CI/CD | P2 | `.github/workflows/` |
| `openapi.yaml` / Swagger | API | P1 | `ob_obra_integrada/` ou `backend/` |
| `STATUS.md` / Status Page | Operação | P2 (SaaS) | Raiz ou URL pública |

---

## 2. Documentos Legais Reais Obrigatórios

> **Base legal:** LGPD art. 18, 41, 46, 48 + Resolução ANPD nº 15/2024 + Resolução ANPD nº 2/2022

### 2.1 Documentos Públicos (para usuários/titulares)

#### 🔴 CRÍTICO — Deve existir antes de qualquer acesso público

| # | Documento | Base Legal | Status | Onde publicar |
|---|-----------|-----------|--------|---------------|
| 1 | **Política de Privacidade** | LGPD art. 9º, 18 | ❌ Não existe | `/privacidade` (frontend) |
| 2 | **Termos de Uso** | Código Civil + LGPD | ❌ Não existe | `/termos` (frontend) |
| 3 | **Aviso de Cookies** | LGPD art. 7º + Marco Civil | ❌ Não existe | Banner no acesso inicial |
| 4 | **Canal do Titular de Dados** | LGPD art. 18, 41 §1º | ❌ Não existe | `/privacidade#contato` |

#### 🟠 IMPORTANTE — Para clientes B2B (tenants)

| # | Documento | Base Legal | Status | Quem assina |
|---|-----------|-----------|--------|-------------|
| 5 | **Contrato de Licença SaaS** | Código Civil + Lei do Software | ❌ Não existe | Obra Integrada + Tenant |
| 6 | **DPA — Data Processing Agreement** | LGPD art. 39 (operador/controlador) | ❌ Não existe | Obra Integrada + Tenant |
| 7 | **SLA — Service Level Agreement** | Código Civil | ❌ Não existe | Obra Integrada + Tenant |

### 2.2 Documentos Internos (gestão e conformidade)

| # | Documento | Base Legal | Status | Responsável |
|---|-----------|-----------|--------|-------------|
| 8 | **ROPA — Registro de Atividades de Tratamento** | LGPD art. 37 | ⚠️ Parcial (no doc 44) | DPO |
| 9 | **Política de Segurança da Informação (PSI)** | LGPD art. 46 | ✅ Criado (doc 45) | Tech Lead |
| 10 | **Plano de Resposta a Incidentes (PARI)** | ANPD Resolução nº 15/2024 | ✅ Criado (doc 46) | Tech Lead + DPO |
| 11 | **Designação formal do DPO** | LGPD art. 41 | ❌ Não existe | Direção |
| 12 | **Relatório de Impacto à Proteção de Dados (RIPD)** | LGPD art. 38 | ❌ Não existe | DPO |
| 13 | **Política de Retenção e Descarte de Dados** | LGPD art. 15, 16 | ⚠️ Parcial (no doc 44) | DPO + TI |
| 14 | **Registro de Incidentes** | ANPD Resolução nº 15/2024 art. 12 | ❌ Não existe | DPO |

---

## 3. Documentos Específicos do Setor de Construção Civil

> A plataforma lida com dados específicos de construção que têm exigências regulatórias próprias.

### 3.1 Documentos que a Plataforma Deve GERENCIAR (funcionalidade de produto)

| Documento | Norma | Relevância para a plataforma |
|-----------|-------|------------------------------|
| **ART/RRT** — Anotação de Responsabilidade Técnica | CREA/CAU | O sistema deve registrar e validar quem é o responsável técnico de cada obra |
| **Alvará de Construção** | Municípios | Campo obrigatório no cadastro da obra |
| **CNO** — Cadastro Nacional de Obras | Receita Federal | Vinculado ao eSocial; obrigatório para obras com mão de obra |
| **PGR** — Programa de Gerenciamento de Riscos | NR-1 (2021) | Obrigatório para todas as obras; o sistema de certificações NR suporta isso |
| **PCMSO** — Programa de Controle Médico | NR-7 | Dados de saúde — **dado sensível LGPD** — exige criptografia e controle especial |
| **Certificações NR** dos funcionários | NRs 1, 10, 12, 33, 35, etc. | Já planejado no roadmap (tb_certificacao) |
| **RDO** — Relatório Diário de Obra | Boa prática / contratos | O diário de obra é a implementação digital do RDO |
| **As Built** | NBR 13531 | Documentação final das obras — módulo de documentos suporta |

### 3.2 Implicações de LGPD para dados de construção civil

| Dado | Classificação LGPD | Medida Exigida |
|------|-------------------|----|
| CPF de funcionários | Dado pessoal comum | Criptografia em repouso (AES-256) |
| Dados de saúde do PCMSO/NR-7 | **Dado pessoal sensível** (art. 5º, II) | Base legal específica + controles reforçados |
| Localização GPS no diário | Dado pessoal de localização | Informar no aviso de privacidade; base legal: execução de contrato |
| Fotos com pessoas identificáveis | Dado pessoal (biométrico potencial) | Aviso; não usar para reconhecimento facial |
| Biometria (futuro: ponto biométrico) | **Dado pessoal sensível** | Consentimento específico obrigatório |

---

## 4. Estrutura de Documentos a Criar (Priorização)

### 4.1 Roadmap Documental — Por Sprint

```
SPRINT 0 (Semana 1) — P0 CRÍTICO
├── backend/.env.example                    → Pessoa 5
├── .vercelignore                           → Pessoa 5
├── SECURITY.md                             → Pessoa 1 (Tech Lead)
└── Política de Privacidade (rascunho)      → Qualquer pessoa (jurídico valida depois)

SPRINT 1 (Semanas 2-4) — P1 IMPORTANTE
├── Política de Privacidade (final)         → Jurídico + DPO
├── Termos de Uso (final)                   → Jurídico
├── Rota /privacidade no frontend           → Pessoa 3
├── Canal de contato DPO (email)            → Direção
├── CONTRIBUTING.md                         → Pessoa 5
└── openapi.yaml (Swagger das rotas)        → Pessoa 1

SPRINT 2 (Semanas 5-8) — P2 PLANEJADO
├── DPA para tenants                        → Jurídico
├── Contrato de Licença SaaS                → Jurídico
├── SLA formal                              → Tech Lead + Jurídico
├── CHANGELOG.md                            → Automação (conventional commits)
├── docker-compose.yml                      → Pessoa 5
├── .github/workflows/ci.yml               → Pessoa 5
└── Designação formal de DPO               → Direção

SPRINT 3+ (Semanas 9+) — P3 MATURIDADE
├── RIPD — Relatório de Impacto             → DPO
├── Registro formal de Incidentes           → DPO
├── Status Page pública                     → DevOps
└── Política de Cookies (banner)           → Frontend + Jurídico
```

### 4.2 Conteúdo Mínimo de Cada Documento Obrigatório

#### 📄 Política de Privacidade (Seções Obrigatórias — LGPD art. 9º)

```markdown
1. Quem somos (controlador e dados de contato)
2. Dados que coletamos e por quê (com base legal de cada dado)
3. Como usamos os dados (finalidade)
4. Com quem compartilhamos (terceiros, suboperadores)
5. Por quanto tempo guardamos (retenção)
6. Seus direitos como titular (acesso, correção, exclusão, portabilidade)
7. Como exercer seus direitos (canal de atendimento)
8. Segurança dos dados (medidas técnicas)
9. Cookies e rastreadores
10. Transferência internacional (se houver)
11. Atualizações desta política
12. Contato do DPO/Encarregado
```

#### 📄 Termos de Uso (Seções Mínimas para SaaS B2B)

```markdown
1. Objeto e Escopo do Serviço
2. Cadastro e Conta de Acesso
3. Planos e Pagamento (quando houver)
4. Obrigações do Usuário/Tenant
5. Obrigações da Plataforma
6. Propriedade Intelectual
7. Propriedade dos Dados do Tenant (dados inseridos pertencem ao tenant)
8. Limitação de Responsabilidade
9. SLA e Disponibilidade
10. Rescisão e Exportação de Dados
11. Foro e Lei Aplicável
```

#### 📄 DPA — Data Processing Agreement (Seções LGPD art. 39)

```markdown
1. Definição dos Papéis (Controlador = Tenant / Operador = Obra Integrada)
2. Dados Tratados e Finalidade
3. Medidas Técnicas de Segurança (o que a plataforma garante)
4. Suboperadores (ex: NeonDB, Vercel, storage)
5. Direitos dos Titulares (como a plataforma apoia o controlador)
6. Notificação de Incidentes (prazo: 3 dias úteis conforme ANPD Res. 15/2024)
7. Duração e Rescisão
8. Exclusão de Dados após término
```

#### 📄 SLA — Service Level Agreement

```markdown
1. Disponibilidade Garantida (ex: 99,5% mensal = ~3,6h de downtime/mês)
2. Janelas de Manutenção
3. Tempo de Resposta ao Suporte (P1/P2/P3/P4)
4. Exclusões (força maior, manutenção programada, falha do tenant)
5. Penalidades por descumprimento (créditos no plano)
6. Métricas e Monitoramento
7. Processo de Reporte de Incidentes
```

#### 📄 SECURITY.md (Padrão GitHub)

```markdown
# Política de Segurança

## Versões Suportadas
[tabela com versões]

## Reportando Vulnerabilidades
- Email: security@obraintegrada.com.br
- Resposta em até 48 horas
- Prazo de correção: 90 dias para críticos

## Processo de Divulgação Responsável
[detalhes]
```

---

## 5. Resolução CD/ANPD nº 15/2024 — Pontos Críticos para a Plataforma

> Aprovada em 24 de abril de 2024. Esta resolução define o Regulamento de Comunicação de Incidentes de Segurança (RCIS).

### 5.1 Prazos de Notificação Obrigatória (atualizados)

| Situação | Prazo | Como contar |
|----------|-------|-------------|
| Notificação à ANPD (agente normal) | **3 dias úteis** | A partir da ciência do incidente |
| Notificação à ANPD (pequeno porte) | **6 dias úteis** | Prazo dobrado conforme ANPD Res. 2/2022 |
| Informações complementares | **20 dias úteis** | Após a notificação inicial |
| Registro interno de todos os incidentes | **5 anos** | Mesmo os não notificados à ANPD |

> ⚠️ **IMPORTANTE:** O [[46 - Plano de Resposta a Incidentes]] deve ser ATUALIZADO — usava prazo de 72h (art. 48 LGPD), mas a Resolução nº 15/2024 estabelece **3 dias úteis** (mais restritivo). Para a Obra Integrada, como startup/pequeno porte, são **6 dias úteis**.

### 5.2 Quando a Notificação é Obrigatória

A notificação é obrigatória quando o incidente envolver **risco ou dano relevante** E ao menos um de:
- ✅ Dados pessoais sensíveis (saúde, biometria — relevante para PCMSO)
- ✅ Dados de autenticação (login, senha, tokens JWT)
- ✅ Dados financeiros (lançamentos financeiros das obras)
- ✅ Dados em larga escala

> Na prática, **qualquer vazamento de dados de usuários da plataforma** se enquadra nessa regra.

---

## 6. Mapa de Lacunas Críticas × Documentação Existente

```
VERDE (✅) = Existe e está adequado
AMARELO (⚠️) = Existe mas incompleto ou desatualizado
VERMELHO (❌) = Não existe — FALTA
```

| Área | Documento | Status |
|------|-----------|--------|
| **LGPD — Transparência** | Política de Privacidade | ❌ |
| **LGPD — Transparência** | Termos de Uso | ❌ |
| **LGPD — Transparência** | Aviso de Cookies | ❌ |
| **LGPD — Operador** | DPA com tenants | ❌ |
| **LGPD — Governança** | Designação do DPO | ❌ |
| **LGPD — Governança** | RIPD | ❌ |
| **LGPD — Dados** | ROPA (inventário de dados) | ⚠️ Parcial |
| **LGPD — Incidentes** | Plano de Resposta | ✅ (doc 46) |
| **LGPD — Segurança** | Política de Segurança | ✅ (doc 45) |
| **LGPD — Dados** | Política de Retenção | ⚠️ Parcial |
| **Técnico** | Auditoria Técnica | ✅ (abril/2026) |
| **Técnico** | Checklist Conformidade | ✅ (corrigido jun/2026) |
| **Técnico** | backend/.env.example | ❌ |
| **Técnico** | openapi.yaml | ❌ |
| **Técnico** | SECURITY.md | ❌ |
| **Técnico** | CONTRIBUTING.md | ❌ |
| **Técnico** | docker-compose.yml | ❌ |
| **Técnico** | .github/workflows/ci.yml | ❌ |
| **Jurídico** | Contrato SaaS | ❌ |
| **Jurídico** | SLA | ❌ |
| **Construção Civil** | Gestão de ART/RRT | ⚠️ Campo previsto, não implementado |
| **Construção Civil** | Certificações NR | ⚠️ Planejado (tb_certificacao) |
| **Construção Civil** | PCMSO / NR-7 | ⚠️ Não categorizado como dado sensível |

---

## 7. Ações Prioritárias por Responsável

### Pessoa 1 — Tech Lead
- [ ] Criar `SECURITY.md` (1h)
- [ ] Rascunho da Política de Segurança interna (✅ doc 45 existe — revisar)
- [ ] Atualizar [[46 - Plano de Resposta a Incidentes]] com prazo de 6 dias úteis (Res. 15/2024)

### Pessoa 5 — DevOps
- [ ] Criar `backend/.env.example` (30min — **P0**)
- [ ] Criar `.vercelignore` (30min — **P0**)
- [ ] Criar `CONTRIBUTING.md` (2h)
- [ ] Criar `docker-compose.yml` (3h — Sprint 2)
- [ ] Criar `.github/workflows/ci.yml` (2h — Sprint 2)

### Direção / Responsável Legal
- [ ] Designar formalmente o DPO (urgente)
- [ ] Criar email `privacidade@obraintegrada.com.br`
- [ ] Criar email `security@obraintegrada.com.br`
- [ ] Contratar advogado especializado em Direito Digital para:
  - Política de Privacidade
  - Termos de Uso
  - DPA
  - Contrato SaaS

### Pessoa 3 — Frontend
- [ ] Criar rota `/privacidade` (placeholder até o documento jurídico ficar pronto)
- [ ] Criar rota `/termos` (placeholder)
- [ ] Adicionar link para Política de Privacidade no formulário de cadastro

---

## 8. Referências Legais e Normativas

| Norma | Tema | Link |
|-------|------|------|
| **Lei nº 13.709/2018 (LGPD)** | Lei Geral de Proteção de Dados | [planalto.gov.br](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm) |
| **Resolução CD/ANPD nº 2/2022** | Agentes de pequeno porte | [gov.br/anpd](https://www.gov.br/anpd/) |
| **Resolução CD/ANPD nº 15/2024** | Comunicação de incidentes (RCIS) | [gov.br/anpd](https://www.gov.br/anpd/) |
| **Lei nº 12.965/2014 (Marco Civil)** | Privacidade na Internet | [planalto.gov.br](https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12965.htm) |
| **Lei nº 9.609/1998 (Lei do Software)** | Proteção de software | [planalto.gov.br](https://www.planalto.gov.br/ccivil_03/leis/l9609.htm) |
| **NR-1 (2021)** | Gerenciamento de Riscos (PGR) | [gov.br/trabalho](https://www.gov.br/trabalho-e-emprego/pt-br) |
| **NR-7** | PCMSO — Saúde Ocupacional | [gov.br/trabalho](https://www.gov.br/trabalho-e-emprego/pt-br) |
| **OWASP API Security Top 10** | Segurança de APIs | [owasp.org](https://owasp.org/www-project-api-security/) |
| **ISO 27001** | Gestão de Segurança (futuro) | [iso.org](https://www.iso.org/isoiec-27001-information-security.html) |

---

## 9. Documentos Relacionados no Vault

- [[44 - LGPD e Protecao de Dados]] — inventário ROPA, direitos titulares
- [[45 - Politica de Seguranca e Ciberseguranca]] — OWASP, hardening, DevSecOps
- [[46 - Plano de Resposta a Incidentes]] — PARI com playbooks ⚠️ ATUALIZAR PRAZO
- [[02 - Checklist de Conformidade]] — status real da implementação
- [[AUDITORIA-CONFORMIDADE-PROJETO]] — auditoria completa jun/2026
- [[08 - Divisao de Tarefas por Pessoa (Jun 2026)]] — plano de execução

---

**Versão:** 1.0
**Data:** 13 de junho de 2026
**Referências:** LGPD Lei 13.709/2018 + ANPD Res. 15/2024 + Auditoria Técnica abril/2026
**Próxima revisão:** 30 de junho de 2026
**Status:** 📋 Documento de referência — em uso ativo
