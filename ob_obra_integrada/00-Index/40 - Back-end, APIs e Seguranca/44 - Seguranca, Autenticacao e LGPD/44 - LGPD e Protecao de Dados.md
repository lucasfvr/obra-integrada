---
tags: [lgpd, privacidade, protecao-dados, compliance, titular, anpd]
aliases: [LGPD, Data Protection, Privacy Policy]
atualizado: 2026-06-13
status: vigente
---

# ⚖️ LGPD — Lei Geral de Proteção de Dados (Lei nº 13.709/2018)

> **Contexto:** Este documento define como a plataforma **Obra Integrada** trata os dados pessoais de funcionários, gestores, clientes (tenants) e visitantes, em conformidade com a LGPD. Serve como referência para desenvolvedores, gestor de privacidade (DPO) e auditorias.

---

## 1. Visão Geral

A Lei nº 13.709/2018 (LGPD) exige que qualquer empresa que processe dados pessoais de pessoas físicas no Brasil adote medidas técnicas e organizacionais para proteger esses dados. A Obra Integrada atua como:

| Papel | Descrição |
|-------|-----------|
| **Controladora** | Quando define finalidade e meios do tratamento (ex: dados dos funcionários dos tenants cadastrados) |
| **Operadora** | Quando processa dados por conta de terceiros (ex: construtoras que usam a plataforma como SaaS) |

A plataforma processa dados pessoais de duas categorias principais:

- **Colaboradores de Obras** (funcionários das construtoras/tenants): CPF, nome, matrícula, salário/valor_dia, cargo, certificações NR, localização GPS, fotos de diário
- **Usuários Administrativos** (admins, gerentes, responsáveis): email, nome, senha (hash), perfil de acesso

---

## 2. Base Legal para Tratamento de Dados (Art. 7º LGPD)

Cada finalidade de tratamento deve ter uma base legal explícita:

| Dado | Finalidade | Base Legal |
|------|-----------|------------|
| Nome, CPF, matrícula | Identificação e vínculo empregatício | Cumprimento de obrigação legal (art. 7º, II) |
| E-mail, senha (hash) | Autenticação na plataforma | Execução de contrato (art. 7º, V) |
| Localização GPS | Registro de ponto / diário de obra | Execução de contrato + Legítimo interesse (art. 7º, IX) |
| Fotos (diário de obra) | Documentação de progresso da obra | Execução de contrato (art. 7º, V) |
| Certificações NR | Controle de segurança do trabalho (NR-1) | Cumprimento de obrigação legal (art. 7º, II) |
| Dados financeiros (salário, valor_dia) | Gestão de RH e apontamentos | Execução de contrato (art. 7º, V) |
| Logs de acesso / auditoria | Segurança e rastreabilidade | Legítimo interesse (art. 7º, IX) |
| IP de origem | Auditoria de segurança | Legítimo interesse (art. 7º, IX) |

> ⚠️ **Atenção Dev:** Qualquer novo dado coletado deve ser registrado aqui antes de ser implementado. Nunca colete dados sem base legal definida.

---

## 3. Inventário de Dados Pessoais (ROPA — Records of Processing Activities)

### 3.1 Tabelas com Dados Pessoais no Banco de Dados

```
tb_usuario
├── nome           → dado pessoal comum
├── email          → dado pessoal comum
├── senha_hash     → pseudonimizado (bcrypt)
├── cpf            → dado pessoal sensível → DEVE ser criptografado (AES-256) [PENDENTE]
├── telefone       → dado pessoal comum
├── foto_url       → dado pessoal (biométrico potencial)
└── funcao         → dado pessoal comum

tb_diario_obra
├── fotos[]        → dados pessoais (imagens de pessoas)
├── latitude/lon   → dado de localização (sensível contextualmente)
└── id_usuario     → referência a titular

tb_log_auditoria (a ser criada)
├── ip_origem      → dado pessoal (identificador)
└── id_usuario     → referência a titular

tb_certificacao (a ser criada)
├── nome_nr        → dado profissional
├── data_validade  → dado profissional
└── arquivo_url    → potencial dado de saúde (NR-15, NR-7)
```

### 3.2 Classificação de Sensibilidade

| Nível | Dados | Tratamento Mínimo |
|-------|-------|-------------------|
| 🔴 Crítico | CPF, salário, dados de saúde (NR-7/NR-15) | Criptografia em repouso (AES-256) + acesso mínimo |
| 🟠 Alto | E-mail, telefone, localização GPS, fotos | TLS em trânsito + controle de acesso RBAC |
| 🟡 Médio | Nome, matrícula, cargo, certificações NR | RBAC + logs de acesso |
| 🟢 Baixo | Logs de sistema sem PII, metadados de obras | Retenção controlada |

---

## 4. Direitos dos Titulares (Arts. 17–22 LGPD)

A plataforma DEVE implementar endpoints/fluxos para garantir os seguintes direitos:

### 4.1 Mapa de Direitos e Implementação

| Direito | Prazo | Endpoint / Fluxo | Status |
|---------|-------|------------------|--------|
| **Confirmação de tratamento** (art. 18, I) | Imediato | `GET /api/usuarios/:id/dados` | ⚠️ Parcial |
| **Acesso aos dados** (art. 18, II) | 15 dias | `GET /api/usuarios/:id/meus-dados` → exporta JSON | ❌ Não implementado |
| **Correção** (art. 18, III) | 15 dias | `PATCH /api/usuarios/:id` | ✅ Implementado |
| **Anonimização / Bloqueio** (art. 18, IV) | 15 dias | `PATCH /api/usuarios/:id/status` (soft delete) | ⚠️ Parcial |
| **Portabilidade** (art. 18, V) | 15 dias | `GET /api/usuarios/:id/exportar` → CSV/JSON | ❌ Não implementado |
| **Eliminação** (art. 18, VI) | 15 dias | `DELETE /api/usuarios/:id` (hard delete c/ confirmação) | ❌ Não implementado |
| **Informação sobre compartilhamento** (art. 18, VII) | Imediato | Política de privacidade pública | ❌ Não publicada |
| **Revogação de consentimento** (art. 18, IX) | Imediato | Formulário de contato / e-mail DPO | ❌ Não disponível |

### 4.2 Canal de Atendimento ao Titular

```
DPO (Encarregado de Dados):
- E-mail: privacidade@obraintegrada.com.br [A CRIAR]
- Prazo de resposta: até 15 dias corridos (art. 18 LGPD)
- Formulário: /privacidade (rota a ser criada no frontend)
```

---

## 5. Retenção e Descarte de Dados (Art. 15 LGPD)

### 5.1 Tabela de Retenção

| Dado | Retenção | Fundamento | Ação após vencimento |
|------|----------|------------|----------------------|
| Dados de usuário ativo | Vigência do contrato + 5 anos | Obrigação legal trabalhista | Anonimização |
| Logs de auditoria | 5 anos | Segurança + obrigação fiscal | Exclusão segura |
| Fotos de diário de obra | Vigência da obra + 5 anos | Documentação técnica | Exclusão segura |
| Certificações NR | Vigência da NR + 2 anos | Obrigação legal (NR-1) | Exclusão segura |
| Logs de acesso (IP) | 6 meses | Segurança / Marco Civil da Internet | Exclusão automática |
| Dados de candidatos/ex-funcionários | 2 anos após desligamento | Legítimo interesse + trabalhista | Anonimização |

### 5.2 Implementação Técnica Necessária

```sql
-- Rotina de limpeza (a implementar como cron job):
-- 1. Anonimizar usuários inativos há mais de 5 anos
UPDATE tb_usuario
SET nome = 'Usuário Anonimizado',
    email = CONCAT('anon_', id_usuario, '@deleted.local'),
    cpf = NULL,
    telefone = NULL
WHERE status = 'INATIVO'
  AND atualizado_em < NOW() - INTERVAL '5 years';

-- 2. Excluir logs de IP mais antigos que 6 meses
DELETE FROM tb_log_auditoria
WHERE ip_origem IS NOT NULL
  AND criado_em < NOW() - INTERVAL '6 months';
```

---

## 6. Consentimento e Transparência (Arts. 8º e 9º LGPD)

### 6.1 Aviso de Privacidade no Cadastro

O formulário de cadastro (usuário / tenant) DEVE exibir:

```
☐ Li e concordo com a Política de Privacidade e os Termos de Uso.
  [Link: /privacidade] [Link: /termos]

Seus dados serão utilizados para: acesso à plataforma, gestão de obras
e cumprimento de obrigações legais trabalhistas. Para mais informações,
contate privacidade@obraintegrada.com.br
```

### 6.2 Documentos Legais Necessários

| Documento | Status | Responsável |
|-----------|--------|-------------|
| Política de Privacidade | ❌ Não publicada | Jurídico + DPO |
| Termos de Uso | ❌ Não publicados | Jurídico |
| Aviso de Cookies | ❌ Não implementado | Frontend |
| DPA (Data Processing Agreement) com tenants | ❌ Não elaborado | Jurídico |
| Contrato de Encarregado (DPO) | ❌ Não designado | Direção |

---

## 7. Segurança Técnica dos Dados (Arts. 46–51 LGPD)

### 7.1 Medidas Implementadas

| Medida | Status | Arquivo |
|--------|--------|---------|
| Hash de senhas (bcrypt cost=10) | ✅ | `authMiddleware.js` |
| JWT para sessões | ✅ | `authMiddleware.js` |
| RBAC multi-tenant | ✅ | `permissaoMiddleware.js` |
| HTTPS/TLS (via Vercel/infra) | ✅ | `vercel.json` |
| Soft delete (não expõe dados excluídos) | ✅ | Controllers RH |

### 7.2 Medidas Críticas Pendentes (P0)

| Medida | Risco | Responsável | Sprint |
|--------|-------|-------------|--------|
| **Remover fallback JWT_SECRET** (`SUPER_SECRET`) | 🔴 CRÍTICO — tokens aceitos sem segredo real | Pessoa 1 | Sprint 0 |
| **CORS por allowlist** | 🔴 ALTO — qualquer origem acessa a API | Pessoa 1 | Sprint 0 |
| **Helmet + CSP** | 🟠 ALTO — sem proteção contra XSS/clickjacking | Pessoa 1 | Sprint 0 |
| **Rate limiting no login** | 🟠 ALTO — brute force possível | Pessoa 1 | Sprint 0 |
| **Tabela de auditoria persistida** | 🟠 ALTO — sem rastreabilidade real | Pessoa 5 | Sprint 0 |
| **Criptografia CPF/CNPJ (AES-256)** | 🟠 ALTO — dado sensível em texto plano | Pessoa 1 | Sprint 1 |
| **2FA TOTP** | 🟡 MÉDIO — requisito documentado | Pessoa 1 | Sprint 3 |
| **Bloqueio após N tentativas de login** | 🟡 MÉDIO — proteção contra força bruta | Pessoa 1 | Sprint 1 |

---

## 8. Transferência Internacional de Dados (Art. 33 LGPD)

Caso a plataforma utilize serviços de nuvem internacionais, verificar:

| Serviço | País dos Servidores | Mecanismo de Adequação |
|---------|--------------------|-----------------------|
| Vercel (hosting frontend) | EUA | Cláusulas contratuais padrão (SCCs) |
| PostgreSQL hosting (a definir) | A verificar | Verificar adequação ou usar br-southeast |
| Storage de arquivos (a definir) | A verificar | Preferir região Brasil (sa-east-1 AWS / southamerica-east1 GCP) |

> **Recomendação:** Priorizar provedores com data centers no Brasil (AWS sa-east-1, GCP southamerica-east1) para evitar complexidade de transferência internacional.

---

## 9. Notificação de Incidentes (Art. 48 LGPD)

Em caso de vazamento ou acesso não autorizado a dados pessoais:

### 9.1 Prazos Legais

- **72 horas**: Notificar a ANPD (Autoridade Nacional de Proteção de Dados) se houver risco relevante aos titulares
- **Prazo razoável**: Comunicar os titulares afetados com descrição dos dados e medidas tomadas

### 9.2 Processo (Ver detalhes em [[46 - Plano de Resposta a Incidentes]])

```
1. Detecção → alerta no sistema de monitoramento
2. Contenção → isolar sistema afetado
3. Avaliação → quantificar dados expostos e titulares afetados
4. Notificação → ANPD em até 72h + titulares
5. Remediação → corrigir vulnerabilidade
6. Relatório → documentar lições aprendidas
```

### 9.3 Contato ANPD

- Portal: https://www.gov.br/anpd/
- Formulário de notificação de incidente: https://www.gov.br/anpd/comunicacao-de-incidente-de-seguranca

---

## 10. DPO — Encarregado de Proteção de Dados (Art. 41 LGPD)

| Item | Status |
|------|--------|
| Designação formal do DPO | ❌ Pendente |
| Publicação do contato do DPO | ❌ Pendente |
| Treinamento da equipe | ❌ Pendente |
| Canal de comunicação com ANPD | ❌ Pendente |

> A LGPD exige que o encarregado seja designado publicamente. Enquanto a empresa não designa um DPO, o responsável legal assume essas obrigações.

---

## 11. Checklist de Conformidade LGPD por Sprint

### Sprint 0 (P0 — Antes de qualquer produção)
- [ ] Remover `SUPER_SECRET` do authMiddleware
- [ ] Criar tabela `tb_log_auditoria` com campos LGPD (`ip_origem`, `id_usuario`, `dados_antes`, `dados_apos`)
- [ ] Configurar CORS restrito por domínio
- [ ] Aplicar Helmet/CSP

### Sprint 1 (P1 — Antes de beta)
- [ ] Criptografar CPF com AES-256 antes de armazenar
- [ ] Implementar `GET /api/usuarios/:id/meus-dados` (direito de acesso)
- [ ] Implementar rate limiting no login (bloqueio após 5 tentativas)
- [ ] Publicar Política de Privacidade e Termos de Uso
- [ ] Designar DPO e publicar contato

### Sprint 2 (P2 — Antes de lançamento)
- [ ] Implementar `GET /api/usuarios/:id/exportar` (portabilidade)
- [ ] Implementar fluxo de exclusão de conta (right to be forgotten)
- [ ] Adicionar aviso de privacidade no formulário de cadastro
- [ ] Criar cron job de limpeza de dados expirados
- [ ] Assinar DPA com tenants (Data Processing Agreement)

### Sprint 3 (P3 — Maturidade)
- [ ] 2FA para acessos administrativos
- [ ] Masking/redact de CPF nos logs
- [ ] Relatório de conformidade LGPD automatizado
- [ ] Auditoria externa anual
- [ ] Treinamento LGPD para toda a equipe

---

## 12. Referências

- [Lei nº 13.709/2018 (LGPD)](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [ANPD — Autoridade Nacional de Proteção de Dados](https://www.gov.br/anpd/)
- [Guia Orientativo ANPD — Segurança da Informação](https://www.gov.br/anpd/pt-br/documentos-e-publicacoes/guias-e-recomendacoes)
- [[45 - Politica de Seguranca e Ciberseguranca]]
- [[46 - Plano de Resposta a Incidentes]]
- [[00 - Index - Seguranca]]
- [[08 - Divisao de Tarefas por Pessoa (Jun 2026)]]

---

**Versão:** 1.0
**Data:** 13 de junho de 2026
**Responsável:** DPO / Tech Lead
**Próxima revisão:** 13 de setembro de 2026
**Status:** ⚠️ Em conformidade parcial — itens P0 e P1 pendentes
