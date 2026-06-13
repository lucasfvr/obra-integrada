---
tags: [obra-integrada, regra-negocio, gestao-obras, rbac, tenant]
aliases: [Regras de Obra, Cadastro de Obra, Status da Obra]
---
# 🏗️ RN-001: Ciclo de Vida e Isolamento da Obra

## 1. Definição da Entidade (O que é uma Obra?)
No ecossistema do Obra Integrada, a "Obra" é o contêiner principal de dados. Todo o fluxo financeiro, cronogramas, diários de obra e apontamentos de horas pertencem a uma Obra específica. 

## 2. Regra de Isolamento (Multi-Tenant)
- **Princípio de Blindagem:** Uma Obra pertence a uma única Construtora/Cliente.
- **Isolamento de Acesso:** Um profissional só enxerga a Obra se for formalmente convidado/alocado nela. O "Engenheiro A" da "Obra X" não pode visualizar o dashboard da "Obra Y", a menos que possua permissão administrativa global.

## 3. Máquina de Estados (Status da Obra)
A Obra deve transitar por um ciclo de vida rígido, que destrava funcionalidades no sistema:

1. **Rascunho (Draft):** Apenas dados básicos (Nome, Endereço, Cliente). *Bloqueia compras e alocação de equipe.*
2. **Em Planejamento:** Fase de inserção do orçamento base, cronograma e requisição de profissionais. *Permite acesso apenas ao Orçamentista e Planejador.*
3. **Em Execução:** Obra ativa. *Destrava o Diário de Obra, o Quadro Kanban de tarefas e o Apontamento de Horas no aplicativo mobile.*
4. **Pausada (Stand-by):** Obra embargada ou sem fundos. *Congela apontamento de horas e novos pedidos de materiais, mas mantém o histórico financeiro legível.*
5. **Concluída / Entregue:** *Status irreversível.* Gera o balanço final (Dashboard Consolidado) e libera o portfólio para os trabalhadores no Super App.

## 4. Dependências Obrigatórias para Criação
Para que uma obra passe de *Rascunho* para *Em Planejamento*, o sistema deve exigir, no mínimo:
- Um Responsável Técnico (Engenheiro ou Arquiteto) vinculado.
- Endereço validado (para habilitar cálculos de logística e geolocalização no Marketplace de Fornecedores).