---
tags: [obra-integrada, suprimentos, orcamento, compras, backoffice, financeiro]
aliases: [Fluxo de Suprimentos, Compras e Orçamento, Caminho do Dinheiro]
---
# 📊 RN-005: Fluxo de Suprimentos e Orçamento (Escritório ➔ Obra)

Este documento mapeia o caminho do dinheiro e dos materiais dentro do ecossistema corporativo. Define como a intenção de gasto (Escritório) se transforma em material físico (Canteiro).

## 1. A Origem: Linha de Base Financeira
* **Ator:** Orçamentista.
* **Ação:** Importa ou digita o orçamento executivo da obra no sistema.
* **Regra de Negócio:** O orçamento cria o **Teto de Gastos (Baseline)**. Uma vez aprovada pelo Diretor de Engenharia, a Linha de Base é congelada. Qualquer custo real que ultrapassar essa linha de base acenderá um alerta vermelho (Desvio de Custo) nos Dashboards Executivos.

## 2. A Geração da Demanda (Explosão de Insumos)
* **Ator:** Planejador / Programador.
* **Ação:** Ao montar as Sprints da próxima quinzena, ele "quebra" as tarefas e o sistema calcula automaticamente o material necessário.
* **Regra de Negócio:** O sistema gera uma **Requisição de Compra Interna** bloqueando o material virtualmente. Se o material já estiver no Almoxarifado, ele é reservado. Se não estiver, a requisição cai na fila de Suprimentos.

## 3. A Compra e o Matching
* **Ator:** Comprador.
* **Ação:** Transforma a Requisição em um **Pedido de Compra (PC)** oficial, registrando o fornecedor escolhido e o preço negociado (que pode ser maior ou menor que a Linha de Base).
* **Regra de Negócio de Segurança (3-Way Match):** O sistema só autoriza o Departamento Financeiro a pagar o fornecedor se três documentos baterem 100%:
    1. O **Pedido de Compra** (emitido pelo Comprador no sistema).
    2. A **Nota Fiscal** (emitida pelo Fornecedor).
    3. O **Recebimento Físico** (confirmado pelo Almoxarife com o tablet lá no canteiro de obras). Se faltar cimento no caminhão, o pagamento é bloqueado proporcionalmente.