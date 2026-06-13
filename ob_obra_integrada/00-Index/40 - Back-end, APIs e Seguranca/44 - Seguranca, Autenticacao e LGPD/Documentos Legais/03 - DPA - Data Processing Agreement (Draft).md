---
tags: [dpa, lgpd, operador, controlador, dados-pessoais, saas, contrato]
aliases: [DPA, Data Processing Agreement, Adendo de Proteção de Dados]
atualizado: 2026-06-13
versao: 1.0-draft
status: rascunho — pendente revisão jurídica
---

# 📋 DPA — Data Processing Agreement (Adendo de Processamento de Dados)

**Documento:** Adendo ao Contrato de Licença SaaS  
**Versão:** 1.0 (rascunho)  
**Data:** 13 de junho de 2026

> ⚠️ **AVISO:** Documento rascunho técnico. Deve ser revisado por advogado antes de uso em contratos reais.

---

## Contexto e Propósito

Este Adendo de Processamento de Dados ("DPA") é celebrado entre:

- **Operador:** [Razão Social] — Obra Integrada (fornecedora da plataforma SaaS)
- **Controlador:** [Nome da Construtora/Tenant] — cliente que utiliza a plataforma

Este DPA está incorporado ao Contrato de Licença SaaS e tem por objetivo estabelecer as obrigações e responsabilidades de cada parte quanto ao tratamento de dados pessoais, em conformidade com a **Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD)**.

---

## 1. Definições

Para fins deste DPA:

| Termo | Definição |
|-------|-----------|
| **Controlador** | O Tenant — empresa que determina as finalidades e meios do tratamento de dados pessoais de seus funcionários |
| **Operador** | A Obra Integrada — que realiza o tratamento em nome do Controlador |
| **Titular** | A pessoa natural a quem os dados pessoais se referem (funcionários, colaboradores) |
| **Dados Pessoais** | Informações sobre pessoa natural identificada ou identificável (art. 5º, I, LGPD) |
| **Dados Sensíveis** | Dados sobre saúde, biometria, origem racial, religião, etc. (art. 5º, II, LGPD) |
| **Incidente de Segurança** | Acesso não autorizado, destruição, perda, alteração ou vazamento de dados pessoais |
| **Suboperador** | Terceiro que processa dados em nome do Operador (ex: NeonDB, Vercel, storage) |

---

## 2. Papéis e Responsabilidades

### 2.1 O Controlador (Tenant) é responsável por:
- Determinar as finalidades do tratamento de dados pessoais inseridos na plataforma
- Obter as bases legais adequadas para o tratamento (consentimento, obrigação legal, etc.)
- Informar os titulares (funcionários) sobre o uso dos dados
- Garantir a exatidão dos dados inseridos
- Solicitar ao Operador a exclusão ou correção de dados quando necessário
- Cumprir a LGPD quanto aos dados sob seu controle

### 2.2 O Operador (Obra Integrada) é responsável por:
- Tratar os dados **exclusivamente** nas finalidades contratadas
- Implementar medidas técnicas e organizacionais de segurança adequadas
- Não compartilhar dados com terceiros além dos Suboperadores necessários
- Auxiliar o Controlador no cumprimento dos direitos dos titulares
- Notificar o Controlador sobre incidentes de segurança dentro dos prazos legais
- Excluir ou devolver os dados ao final do contrato

---

## 3. Dados Tratados pelo Operador

### 3.1 Categorias de Dados

| Categoria | Exemplos | Finalidade | Base Legal |
|-----------|---------|-----------|------------|
| Identificação de funcionários | Nome, CPF, matrícula, e-mail | Gestão de equipes, RBAC | Execução de contrato |
| Dados profissionais | Cargo, função, salário, data admissão | RH e apontamentos | Execução de contrato |
| Geolocalização | GPS no diário de obra | Registro de atividades | Execução de contrato |
| Fotos/mídia | Fotos do diário de obra | Documentação de progresso | Execução de contrato |
| Certificações | NR-10, NR-35, etc. | Segurança do trabalho | Obrigação legal |
| **Dados de saúde (sensíveis)** | PCMSO, NR-7 | Saúde ocupacional | Obrigação legal / Consentimento |

> ⚠️ **Dados sensíveis de saúde** exigem base legal específica. O Controlador declara ter obtido a base legal adequada antes de inserir tais dados.

### 3.2 Dados NÃO tratados pelo Operador
- Dados de biometria para controle de ponto (não implementado)
- Dados bancários dos funcionários (não implementado)
- Dados que não sejam necessários à prestação do serviço contratado

---

## 4. Medidas Técnicas de Segurança

O Operador implementa (ou implementará conforme roadmap) as seguintes medidas:

| Medida | Status |
|--------|--------|
| Criptografia TLS/HTTPS em trânsito | ✅ Implementado |
| Hash bcrypt para senhas | ✅ Implementado |
| RBAC com controle granular de acesso | ✅ Implementado |
| Isolamento de dados por tenant (multi-tenancy) | ✅ Implementado |
| Criptografia AES-256 para dados sensíveis em repouso | ⚠️ Em implementação (P1) |
| Logs de auditoria persistidos | ⚠️ Em implementação (P1) |
| Rate limiting nos endpoints de autenticação | ⚠️ Em implementação (P0) |
| Headers de segurança (Helmet/CSP) | ⚠️ Em implementação (P0) |
| Backups regulares do banco de dados | ✅ NeonDB (automático) |
| Política de Resposta a Incidentes (PARI) | ✅ Documentada |

---

## 5. Suboperadores

O Operador utiliza os seguintes suboperadores de confiança para prestação do serviço:

| Suboperador | Localização | Finalidade | DPA com suboperador |
|-------------|-------------|-----------|---------------------|
| **NeonDB** | EUA (AWS us-east-1) | Banco de dados PostgreSQL | ✅ Termos de serviço NeonDB |
| **Vercel** | EUA | Hospedagem serverless | ✅ DPA Vercel |
| **Storage (a definir: Supabase / AWS S3 / Cloudflare R2)** | A definir | Armazenamento de arquivos | A definir |

O Operador notificará o Controlador sobre mudanças relevantes nos suboperadores com **10 dias de antecedência**.

---

## 6. Direitos dos Titulares

O Operador apoiará o Controlador no cumprimento dos direitos dos titulares (art. 18 LGPD):

| Direito | Prazo de atendimento pelo Operador |
|---------|-----------------------------------|
| Confirmação de tratamento | 5 dias úteis após solicitação do Controlador |
| Acesso aos dados | 10 dias úteis |
| Correção | 5 dias úteis |
| Exclusão | 15 dias úteis (exceto dados com prazo legal) |
| Portabilidade (exportação) | 5 dias úteis em formato JSON/CSV |

---

## 7. Notificação de Incidentes de Segurança

Em caso de incidente de segurança que possa envolver dados pessoais:

| Etapa | Prazo |
|-------|-------|
| Notificação inicial ao Controlador | **2 dias úteis** após ciência |
| Notificação à ANPD (pelo Controlador ou pelo Operador conforme decisão conjunta) | **6 dias úteis** (Obra Integrada como pequeno porte — Res. ANPD 15/2024) |
| Relatório detalhado do incidente | **20 dias úteis** após notificação inicial |
| Registro interno | **5 anos** |

A notificação ao Controlador incluirá:
- Natureza do incidente e dados afetados
- Quantidade estimada de titulares afetados
- Medidas de contenção adotadas
- Impacto provável

---

## 8. Transferência Internacional de Dados

O Operador poderá transferir dados para países ou organizações internacionais que proporcionem grau de proteção adequado, ou mediante mecanismos como:
- Cláusulas contratuais padrão (SCCs)
- Consentimento específico do titular
- Necessidade para execução do contrato

Os suboperadores atuais (NeonDB, Vercel) possuem cláusulas contratuais padrão.

---

## 9. Duração e Exclusão de Dados

- Este DPA vigora pelo mesmo período do Contrato de Licença SaaS
- Ao término, o Operador:
  1. Disponibiliza exportação dos dados por **30 dias**
  2. Após os 30 dias, **exclui ou anonimiza** os dados, exceto os com prazo legal de retenção
  3. Emite declaração de exclusão em até 30 dias após a solicitação

---

## 10. Auditoria

O Controlador poderá solicitar, com **30 dias de antecedência**, evidências documentais de que o Operador cumpre este DPA. O Operador disponibilizará relatórios resumidos ou permitirá auditoria mediante NDA e aviso prévio.

---

**Versão:** 1.0-draft | **Data:** 13/06/2026 | **Status:** ⚠️ Rascunho — pendente validação jurídica
