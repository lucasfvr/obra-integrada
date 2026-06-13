---
tags: [obra-integrada, kpi, analytics, dashboards, power-bi, curva-s]
aliases: [Métricas da Construtora, Indicadores de Engenharia]
---
# 📊 KPI-001: Dashboards Executivos e Indicadores de Obra

Este documento mapeia os Indicadores-Chave de Desempenho (KPIs) que estarão disponíveis nos painéis de Business Intelligence para os Diretores, Engenheiros e Clientes das construtoras. O objetivo é fornecer uma visão rápida da saúde da obra.

## 1. Visão de Prazo e Produtividade (Tempo)
* **Avanço Físico Previsto vs. Realizado (%):** A espinha dorsal da **Curva S**. Compara o que o cronograma base exigia para a data atual contra o que o campo realmente apontou como concluído.
* **SPI (Schedule Performance Index):** Índice de Desempenho de Prazo. 
    * *Regra:* SPI > 1 (Adiantado), SPI = 1 (No prazo), SPI < 1 (Atrasado).
* **Taxa de Impedimento Diário:** Quantidade de Ordens de Serviço que entraram no status `Impedido` por falta de material ou problemas climáticos, dividida pelo total de OS ativas.

## 2. Visão Financeira e de Suprimentos (Custo)
* **Custo Previsto vs. Realizado (R$):** Compara o Orçamento da Linha de Base contra os Pedidos de Compra faturados e as Horas-Homem apontadas.
* **CPI (Cost Performance Index):** Índice de Desempenho de Custo. 
    * *Regra:* CPI > 1 (Abaixo do orçamento), CPI = 1 (No orçamento), CPI < 1 (Estourou o orçamento).
* **Aderência de Estoque (BOM):** Mede o desperdício. Se a OS previa 100 sacos de cimento, mas o almoxarifado deu baixa em 120 para a mesma OS, o painel acende um alerta de 20% de desvio de consumo.

## 3. Visão de Segurança e Conformidade (QHS)
* **Taxa de Conformidade de NRs:** Percentual de trabalhadores alocados na obra com todas as certificações em dia vs. total da equipe.
* **Tempo Médio de Liberação de Qualidade:** Quanto tempo uma tarefa fica parada no status `Executado` aguardando a assinatura do Inspetor de Qualidade para ir para `Concluído`.