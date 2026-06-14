---
tags: [obra-integrada, kpi, growth, saas, metricas-produto]
aliases: [Métricas da Plataforma, Indicadores de Crescimento]
---
# 📈 KPI-002: Métricas de Sucesso do Produto (SaaS)

Este documento define os indicadores internos que a equipe de tecnologia e negócios do Obra Integrada monitora para garantir a viabilidade financeira e a adesão da plataforma pelas construtoras.

## 1. Métricas de Crescimento e Receita (Financeiro)
* **MRR (Monthly Recurring Revenue):** Receita Mensal Recorrente. O valor total garantido pelas assinaturas ativas das construtoras no mês.
* **CAC (Customer Acquisition Cost):** Custo de Aquisição de Clientes. Quanto custa em marketing e vendas para trazer uma nova construtora para o sistema.
* **LTV (Lifetime Value):** O valor total que uma construtora gasta com a plataforma ao longo de todo o tempo em que permanece como cliente.

## 2. Métricas de Adoção e Engajamento (Produto)
* **DAU/MAU (Daily/Monthly Active Users):** Relação entre usuários ativos diários e mensais. Mede se o sistema virou rotina. Foco principal: garantir que o perfil `Mestre de Obras` tenha um DAU alto, acessando o app todos os dias úteis.
* **TTV (Time to Value):** Tempo até o primeiro valor. Quantos dias demora desde a assinatura do contrato até a construtora gerar a sua primeira Ordem de Serviço ou primeiro apontamento de horas. Quanto menor o TTV, menor o risco de cancelamento.
* **Taxa de Adoção de Funcionalidades (Feature Adoption):** Mede módulos específicos. Exemplo: Quantos % das construtoras ativas estão utilizando o módulo de "Apontamento de Horas" versus construtoras que só usam o "Cronograma"?

## 3. Métricas de Retenção e Saúde do Cliente
* **Churn Rate (%):** Taxa de cancelamento. Quantas construtoras abandonaram a plataforma no mês divididas pelo total de clientes ativos no início do período.
    * *Meta:* < 1,5% ao mês.
* **Net Revenue Retention (NRR):** Retenção de Receita Líquida. Percentual de receita recorrente retida das construtoras existentes após upgrades, downgrades e cancelamentos.
    * *Fórmula:* (MRR Inicial + Expansão - Downgrade - Churn) / MRR Inicial.
    * *Meta:* > 110% ao ano (indicando que a base de clientes cresce sozinha).
* **LTV / CAC Ratio:** Relação entre o valor total do cliente ao longo do tempo (LTV) e o custo para adquiri-lo (CAC).
    * *Fórmula:* LTV / CAC (onde LTV = Ticket Médio × Margem Bruta / Churn).
    * *Meta:* > 3x (para cada R$ 1 investido em CAC, obter R$ 3 de retorno em LTV).
* **Payback Period (Meses):** Tempo de retorno do CAC. Quantos meses de assinatura são necessários para cobrir o custo de aquisição do cliente.
    * *Meta:* < 12 meses.

## 4. Métricas de Operação SaaS e Qualidade (Engenharia & CS)
* **SLA de Disponibilidade (Uptime %):** Percentual do tempo em que os serviços da API e Frontend web/mobile estão operacionais na nuvem (Vercel e banco NeonDB).
    * *Meta:* > 99,5% de disponibilidade mensal.
* **Apdex Score / Tempo de Carregamento (Performance):** Índice que mede a satisfação do usuário com o tempo de resposta do sistema. 
    * *Meta:* Tempo médio de resposta da API < 200ms e carregamento inicial de telas do Super App < 1.5s.
* **NPS (Net Promoter Score) do Administrador:** Avaliação de satisfação feita com os administradores das construtoras.
    * *Meta:* > 65 (Zona de Qualidade/Excelência).
* **Volume de Chamados por Cliente:** Média de tickets de suporte abertos no mês por construtora. Um aumento pode indicar problemas de usabilidade ou bugs após novos deploys.

---
**Status:** ✅ Concluído (Referência do MVP)
**Última atualização:** 13 de junho de 2026
**Próxima revisão:** 30 de junho de 2026