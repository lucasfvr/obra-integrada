---
tags: [politica-privacidade, lgpd, dados-pessoais, titular, privacidade]
aliases: [Privacy Policy, Política de Privacidade]
atualizado: 2026-06-13
versao: 1.0-draft
status: rascunho — pendente revisão jurídica
---

# 🔒 Política de Privacidade — Obra Integrada

**Última atualização:** 13 de junho de 2026  
**Versão:** 1.0 (rascunho — pendente validação jurídica antes da publicação)  
**Vigência:** A partir da publicação em `/privacidade`

> ⚠️ **AVISO:** Este documento é um rascunho técnico elaborado com base na LGPD (Lei nº 13.709/2018) e nas boas práticas da ANPD. **Deve ser revisado e aprovado por advogado especializado em Direito Digital antes de ser publicado.**

---

## 1. Quem Somos

**Obra Integrada** é uma plataforma SaaS para gestão integrada de obras de construção civil, desenvolvida para construtoras e profissionais do setor.

**Controladora dos dados:**
- Nome: [Razão Social da Empresa — a preencher]
- CNPJ: [a preencher]
- Endereço: [a preencher]
- E-mail: privacidade@obraintegrada.com.br
- DPO (Encarregado de Dados): [nome a designar] — privacidade@obraintegrada.com.br

Para fins da LGPD (Lei nº 13.709/2018), a Obra Integrada atua como:
- **Controladora** dos dados dos usuários que se cadastram diretamente na plataforma
- **Operadora** dos dados pessoais de funcionários inseridos pelos clientes (tenants/construtoras)

---

## 2. Quais Dados Coletamos e Por Quê

### 2.1 Dados de Usuários da Plataforma (Gestores, Engenheiros, Admins)

| Dado | Finalidade | Base Legal (LGPD) |
|------|-----------|-------------------|
| Nome completo | Identificação na plataforma | Execução de contrato (art. 7º, V) |
| E-mail | Login, comunicações, recuperação de senha | Execução de contrato (art. 7º, V) |
| Senha (armazenada em hash bcrypt — nunca em texto) | Autenticação segura | Execução de contrato (art. 7º, V) |
| CPF | Identificação única do usuário | Execução de contrato + Obrigação legal (art. 7º, II, V) |
| Telefone | Comunicação e suporte | Legítimo interesse (art. 7º, IX) |
| Foto de perfil | Personalização da conta | Consentimento (art. 7º, I) |

### 2.2 Dados de Funcionários de Obras (inseridos pelos tenants)

| Dado | Finalidade | Base Legal (LGPD) | Observação |
|------|-----------|-------------------|------------|
| Nome, CPF, matrícula | Identificação e vínculo | Obrigação legal — art. 7º, II | Legislação trabalhista |
| Cargo / função | Controle de RBAC e relatórios | Execução de contrato (art. 7º, V) | |
| Salário / valor/dia | Gestão de RH e apontamentos | Execução de contrato (art. 7º, V) | |
| Localização GPS | Registro de diário de obra | Execução de contrato (art. 7º, V) | Informado no aviso de privacidade |
| Fotos (diário de obra) | Documentação de progresso | Execução de contrato (art. 7º, V) | Não usamos para reconhecimento facial |
| Certificações NR | Controle de segurança do trabalho | Obrigação legal — NR-1 (art. 7º, II) | |
| Dados de saúde (NR-7/PCMSO) | Controle de saúde ocupacional | **Dado sensível** — consentimento específico ou obrigação legal (art. 11) | Tratamento reforçado |

### 2.3 Dados de Navegação (coletados automaticamente)

| Dado | Finalidade | Base Legal |
|------|-----------|------------|
| Endereço IP | Segurança e auditoria de acesso | Legítimo interesse (art. 7º, IX) |
| User agent (browser/app) | Compatibilidade e segurança | Legítimo interesse (art. 7º, IX) |
| Logs de ações na plataforma | Auditoria e rastreabilidade | Legítimo interesse (art. 7º, IX) |
| Cookies de sessão | Manter o usuário autenticado | Execução de contrato (art. 7º, V) |

---

## 3. Como Usamos os Dados

Usamos os dados coletados exclusivamente para:

1. **Prestar o serviço contratado** — gestão de obras, equipes, financeiro e relatórios
2. **Autenticar e autorizar** o acesso às funcionalidades
3. **Garantir a segurança** da plataforma e prevenir fraudes
4. **Cumprir obrigações legais** — trabalhistas, fiscais e de saúde/segurança do trabalho
5. **Melhorar a plataforma** — análise de uso e performance
6. **Comunicar sobre atualizações** e novidades do serviço (com opção de descadastro)

**Não fazemos:** venda de dados, perfilamento para publicidade de terceiros ou decisões automáticas com efeitos jurídicos.

---

## 4. Com Quem Compartilhamos os Dados

| Destinatário | Dados Compartilhados | Motivo |
|-------------|---------------------|--------|
| **NeonDB** (banco de dados) | Todos os dados armazenados | Infraestrutura — operador de dados |
| **Vercel** (hosting) | Metadados de requisições, logs | Infraestrutura — operador de dados |
| **Storage externo (a definir: AWS S3 / Cloudflare R2)** | Arquivos e fotos | Armazenamento — operador de dados |
| **Autoridades públicas** | Conforme exigido por lei | Cumprimento de ordem judicial ou administrativa |

> Todos os nossos fornecedores de infraestrutura são contratados com cláusulas de proteção de dados (DPA) e comprometem-se a tratar os dados exclusivamente para as finalidades contratadas.

**Não compartilhamos** dados com terceiros para fins comerciais sem consentimento explícito.

---

## 5. Por Quanto Tempo Guardamos os Dados

| Dado | Período de Retenção | Fundamento |
|------|---------------------|------------|
| Dados de conta (usuário ativo) | Vigência do contrato + 5 anos | Obrigação legal trabalhista/fiscal |
| Dados de funcionários | Vigência + 5 anos após desligamento | Legislação trabalhista |
| Logs de auditoria | 5 anos | Segurança e obrigação legal |
| Fotos de diário de obra | Vigência da obra + 5 anos | Documentação técnica |
| Certificações NR | Validade da NR + 2 anos | NR-1 |
| Logs de acesso (IP) | 6 meses | Marco Civil da Internet (art. 15) |
| Dados após exclusão de conta | Imediato (anonimização) ou até vencimento do prazo legal | LGPD art. 16 |

---

## 6. Seus Direitos como Titular de Dados

Nos termos do **art. 18 da LGPD**, você tem o direito de:

| Direito | Como exercer |
|---------|-------------|
| **Confirmação** de que tratamos seus dados | E-mail para privacidade@obraintegrada.com.br |
| **Acesso** aos seus dados | Solicitar via e-mail — respondemos em até 15 dias |
| **Correção** de dados incorretos | Via perfil na plataforma ou e-mail |
| **Anonimização ou bloqueio** de dados desnecessários | Solicitar via e-mail |
| **Portabilidade** dos seus dados | Solicitar exportação em formato JSON/CSV |
| **Eliminação** dos dados | Solicitar exclusão da conta — dados anonimizados em até 30 dias, exceto os com prazo legal |
| **Revogação de consentimento** | A qualquer momento, sem penalidade |
| **Oposição** ao tratamento | Solicitar via e-mail justificando a oposição |

**Prazo de resposta:** Até **15 (quinze) dias corridos** após a solicitação.

**Canal de atendimento:**
- E-mail: privacidade@obraintegrada.com.br
- Formulário: [URL da plataforma]/privacidade (a implementar)

---

## 7. Segurança dos Dados

Adotamos medidas técnicas e organizacionais para proteger seus dados:

- **Criptografia em trânsito:** TLS/HTTPS em todas as comunicações
- **Hash de senhas:** bcrypt com custo 10 — senhas nunca armazenadas em texto
- **Criptografia em repouso:** AES-256 para dados sensíveis (CPF, CNPJ) — *em implementação*
- **Controle de acesso:** RBAC com 7 perfis e permissões granulares
- **Logs de auditoria:** Registro de todas as ações sensíveis
- **Rate limiting:** Proteção contra tentativas de acesso em massa — *em implementação*
- **Autenticação:** JWT com expiração de 8 horas

Em caso de incidente de segurança, notificaremos a **ANPD** e os titulares afetados dentro dos prazos estabelecidos pela Resolução CD/ANPD nº 15/2024 (**6 dias úteis** para agentes de pequeno porte).

---

## 8. Cookies

A plataforma Obra Integrada utiliza os seguintes tipos de cookies:

| Tipo | Nome | Finalidade | Duração |
|------|------|-----------|---------|
| Essencial | `obraToken` | Sessão autenticada (JWT) | 8 horas |
| Essencial | `obraUser` | Dados do usuário logado | 8 horas |
| Preferência | `obraTheme` | Tema claro/escuro | 1 ano |

> Não utilizamos cookies de rastreamento, publicidade ou analytics de terceiros.

---

## 9. Transferência Internacional de Dados

A plataforma utiliza infraestrutura em nuvem, e alguns dados podem ser processados fora do Brasil:

| Serviço | País | Mecanismo de Adequação |
|---------|------|----------------------|
| Vercel | EUA | Cláusulas contratuais padrão (SCCs) |
| NeonDB | EUA | Cláusulas contratuais padrão (SCCs) |
| Storage (a definir) | Preferência: Brasil (AWS sa-east-1) | A definir |

---

## 10. Menores de Idade

A plataforma Obra Integrada é destinada exclusivamente a profissionais e empresas. **Não coletamos conscientemente dados de menores de 18 anos.** Se identificarmos inadvertidamente tais dados, os excluiremos imediatamente.

---

## 11. Alterações nesta Política

Esta política pode ser atualizada para refletir mudanças na lei ou em nossas práticas. Quando houver alterações relevantes:
- Publicaremos a nova versão com a data de atualização
- Notificaremos os usuários por e-mail com antecedência de 15 dias para mudanças materiais
- O histórico de versões estará disponível mediante solicitação

---

## 12. Contato e DPO

**Encarregado de Proteção de Dados (DPO):**
- Nome: [a designar]
- E-mail: privacidade@obraintegrada.com.br
- Formulário: [URL]/privacidade

**Autoridade Nacional de Proteção de Dados (ANPD):**
- Portal: https://www.gov.br/anpd/

---

**Versão:** 1.0-draft
**Data:** 13 de junho de 2026
**Próxima revisão:** Após validação jurídica
**Status:** ⚠️ Rascunho — validar com advogado antes de publicar
