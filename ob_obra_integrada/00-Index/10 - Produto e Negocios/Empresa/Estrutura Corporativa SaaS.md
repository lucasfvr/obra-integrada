# Estrutura Corporativa, Operacional e Modelo de Negócios SaaS
## Obra Integrada — Organização e Operação da Empresa Provedora

**Versão:** 1.0 | **Data:** 13 de junho de 2026 | **Referência:** ITIL v4 + SaaS Matrix (FinOps)

---

## 1. Introdução e Visão Geral

Este documento detalha a estrutura corporativa, operacional e o ciclo de vida comercial por trás da empresa proprietária do software **Obra Integrada**. Ele descreve como a empresa se organiza em termos de departamentos, como é gerenciado o ciclo de vida operacional de cada cliente (tenant), como funciona o modelo de cobrança recorrente e a governança de suporte técnico.

---

## 2. Organograma Corporativo e Departamentos

A empresa provedora do Obra Integrada está organizada nos seguintes setores funcionais:

```
                  ┌─────────────────────────────────┐
                  │      Diretoria Executiva        │
                  │             (CEO)               │
                  └────────────────┬────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  Engenharia &   │       │   Marketing,    │       │   Sucesso do    │
│  Produto (CTO)  │       │  Vendas & Fin.  │       │  Cliente & Sup. │
└────────┬────────┘       └────────┬────────┘       └────────┬────────┘
         │                         │                         │
         ├─ Dev Backend            ├─ Inbound Leads          ├─ Suporte L1/L2
         ├─ Dev Frontend           ├─ Comercial B2B          └─ Treinamentos
         ├─ DevOps & Infra         └─ Faturamento            
         └─ Legal & DPO                                      
```

### 2.1 Engenharia e Produto
Responsável pelo roadmap tecnológico, codificação, cibersegurança, DevOps e conformidade de privacidade (DPO). Garante a escalabilidade serverless e a integridade do banco de dados (Neon DB).

### 2.2 Marketing, Vendas e Finanças
Focado na captação de leads qualificados do setor de engenharia civil, vendas consultivas corporativas, parcerias com Sinduscons e gerenciamento do fluxo financeiro de faturamento dos clientes.

### 2.3 Customer Success (CS) e Suporte Técnico
Responsável pelo onboarding guiado das construtoras, treinamento das equipes de canteiro de obras e atendimento aos chamados de suporte L1 e L2.

---

## 3. Ciclo de Vida do Tenant (Cliente) na Plataforma

O ciclo de vida operacional de uma construtora dentro do ecossistema SaaS segue as seguintes fases:

```
 ┌──────────┐      ┌──────────────┐      ┌──────────────┐      ┌─────────────┐
 │ Cadastro ├─────►│ Provisionam. ├─────►│ Uso Ativo &  ├─────►│ Cancelam. & │
 │ & Trial  │      │ Automatizado │      │ Faturamento  │      │ Purge (LGPD)│
 └──────────┘      └──────────────┘      └──────────────┘      └─────────────┘
```

### 3.1 Provisionamento (Onboarding Técnico)
Ao assinar um plano ou ativar a avaliação gratuita (*trial*):
1. **Configuração do Isolamento:** O sistema gera um `UUID` único (`tenant_id`) para o novo cliente e cria o registro na tabela `tb_cliente`.
2. **Setup de Feature Flags:** Inicializa os registros na tabela `feature_flag` com os valores padrão recomendados para o perfil do cliente.
3. **Criação do Admin Master:** Cria a conta do primeiro usuário administrador (`ADMIN_MASTER`) vinculado ao `tenant_id`.
4. **Isolamento de Banco (Neon Branching):** Se contratado o plano Enterprise, o sistema cria uma branch física separada do banco de dados no Neon DB para isolamento físico do cliente.

### 3.2 Cobrança e Monetização
- **Recorrência (SaaS B2B):** Faturamento automatizado mensal ou anual integrado ao gateway de pagamentos (Stripe / Iugu).
- **Cobrança Baseada em Uso:** O valor do faturamento pode ser ajustado com base no número de obras ativas gerenciadas e na quantidade total de usuários convidados.
- **Inadimplência (Fluxo de Cobrança):**
  - **Atraso de 3 dias:** Notificação automática via e-mail e aviso de cobrança pendente na tela do painel do cliente.
  - **Atraso de 15 dias:** Suspensão temporária do acesso à plataforma. Os dados do canteiro permanecem salvos, mas os usuários são bloqueados para leitura/escrita.
  - **Atraso de 60 dias:** Início do processo de rescisão contratual e início da contagem do prazo de descarte.

### 3.3 Desprovisionamento (Offboarding e Descarte)
Em caso de cancelamento do contrato:
1. **Desativação (Soft Delete):** A conta é inativada no banco de dados (`tb_cliente.status = 'INATIVO'`), impedindo qualquer acesso à API.
2. **Período de Carência:** Os dados são mantidos em backup por 30 dias para caso de arrependimento do cliente.
3. **Descarte Definitivo (Hard Purge):** Após o período de carência, um job em background executa a exclusão de todas as linhas associadas ao `tenant_id` e apaga permanentemente todos os arquivos e fotos vinculados ao cliente no storage S3/R2, atendendo ao artigo 16 da LGPD.

---

## 4. Governança de Suporte e SLAs de Atendimento

O atendimento técnico segue uma escala ITIL de 3 níveis de suporte com Acordos de Nível de Serviço (SLA) rígidos:

### 4.1 Níveis de Suporte
- **Nível 1 (Triagem e Autoatendimento):** Central de ajuda com artigos, tutoriais de uso e assistente virtual inteligente via chatbot.
- **Nível 2 (Equipe de Suporte CS):** Atendimento humano por chat e e-mail para problemas comuns de configuração, convites de usuários ou importação de SINAPI.
- **Nível 3 (Engenharia):** Engenheiros de software de plantão tratam bugs reais do sistema, problemas de banco de dados ou instabilidade de infraestrutura.

### 4.2 Matriz de SLA de Resposta e Resolução

| Nível de Impacto do Chamado | Prazo Máximo de Resposta | Prazo Máximo de Resolução |
|-----------------------------|--------------------------|---------------------------|
| **Crítico (P1):** Indisponibilidade de login ou API fora do ar. | 30 minutos | 2 horas |
| **Alto (P2):** Falhas em fechar diários ou gerar relatórios. | 2 horas | 8 horas |
| **Normal (P3):** Dúvidas de uso, melhorias estéticas. | 8 horas | 48 horas |
