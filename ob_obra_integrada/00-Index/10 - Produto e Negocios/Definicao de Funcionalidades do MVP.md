---
tags: [produto, mvp, requisitos, escopo]
aliases: [Funcionalidades do MVP, MVP Scope]
---

# 📦 Definição de Funcionalidades do MVP (Produto Mínimo Viável)

Este documento descreve o escopo oficial do **MVP v0.9 (Banca)** da plataforma **Obra Integrada**, alinhando o estado real do código às metas do negócio SaaS.

---

## 🎯 1. Objetivo do MVP
O objetivo do MVP é fornecer uma plataforma SaaS intuitiva e acessível para construtoras de pequeno e médio porte gerenciarem as suas obras diretamente do canteiro. O foco principal é a transição de processos físicos (papel/planilhas) para um ecossistema digital seguro e centralizado.

---

## 👥 2. Personas Prioritárias no MVP
1. **Engenheiro Responsável (Paulo):** Gerencia múltiplas obras, aprova diários, delega tarefas e acompanha despesas.
2. **Mestre de Obras (Carlos):** Registra o diário de canteiro via celular e executa/atualiza tarefas simples.
3. **Proprietário da Construtora (Renata):** Acompanha despesas globais da empresa e receita das assinaturas.

---

## 📋 3. Escopo Detalhado (Funcionalidades)

### Módulo A — Autenticação e Multi-Tenancy
* **Cadastro Multietapas:** Fluxo inicial de validação simplificada seguido de preenchimento de perfil detalhado (construtora/responsável).
* **Autenticação JWT:** Login seguro com expiração de token.
* **Isolamento de Tenants (Clientes):** Dados de obras, equipe, finanças e estoque isolados por empresa (`tb_cliente`).

### Módulo B — Gestão de Obras e Equipe
* **CRUD de Obras:** Criação e manutenção de canteiros, contendo dados técnicos (área do terreno/construída), legais (alvará, ART/RRT) e financeiro orçado.
* **Equipe Alocada:** Alocação de colaboradores a obras específicas com papéis e registro de custo diário (`valor_dia`).
* **Organograma (Org-Chart):** Geração visual da hierarquia operacional do canteiro de obras.

### Módulo C — Diário de Obra (RDO)
* **Apontamento com Mídia/Localização:** Registro de entradas diárias de texto acompanhadas por upload de fotos e captura automática de coordenadas GPS.
* **Auditoria de Localização:** Status automático baseado na proximidade geográfica do registro em relação às coordenadas da obra.

### Módulo D — Controle de Insumos (Estoque)
* **Inventário Local:** Registro de quantidade atual em canteiro por material.
* **Histórico de Movimentações:** Rastreabilidade completa de entradas e saídas de insumos (com indicação de fornecedor, valor total e motivo da saída).

### Módulo E — Gestão Financeira
* **Lançamentos Simples:** Fluxo de receitas e despesas associado a cada obra.
* **Central de Comprovantes:** Upload de notas fiscais ou comprovantes de pagamento integrados ao serviço de armazenamento local de arquivos (com suporte a PDFs).

### Módulo F — Recursos Humanos (RH)
* **Gestão de Funcionários:** CRUD central de pessoal do tenant com geração de matrícula automática padronizada (`MAT-YYYY-XXX`).
* **Soft Delete:** Atualização de status para `INATIVO` em vez de deleção física.

---

## 🚫 4. Fora de Escopo do MVP (Roadmap Futuro)
* Autenticação via Single Sign-On (SSO Google/Microsoft).
* Autenticação Multifator (MFA/2FA TOTP).
* Emissão de RDO consolidado em PDF.
* Integração com tabela de orçamentos SINAPI/EMOP.
* Apontamentos automáticos integrados a ponto eletrônico.

---

## 🛠️ 5. Arquitetura e Segurança (Sprint 0 Concluída)
* **Backend:** Node.js, Express, Prisma ORM e PostgreSQL.
* **Frontend:** React, Vite, Tailwind CSS.
* **Proteções Ativas:**
  * Cabeçalhos HTTP seguros via `helmet`.
  * Restrição de CORS baseada em allowlist de domínios via `CORS_ORIGINS`.
  * Limitação de requisições (`express-rate-limit`) nas rotas de login e registro para prevenção de ataques de força bruta.
  * Middleware central de tratamento de erros para mitigação de vazamento de informações.
  * Tabela de auditoria persistida no banco (`tb_log_auditoria`) para logs de ações sensíveis dos usuários.
