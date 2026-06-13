---
tags: [obra-integrada, tenant, setup, backoffice, configuracao, master-data]
aliases: [Parametrização do Sistema, Setup Inicial da Construtora]
---
# ⚙️ RN-004: Parametrização do Tenant (Setup da Construtora)

Este documento define as regras de inicialização do sistema. Antes que qualquer Ordem de Serviço seja criada ou que qualquer Mestre de Obras faça login, a construtora (Tenant) precisa configurar a fundação lógica do seu ambiente isolado.

## 1. O Guardião do Master Data
* **Responsável:** Admin da Construtora (Key User / TI).
* **Regra de Negócio:** Somente este perfil possui permissão de `Escrita` no Módulo de Configurações. Engenheiros, Planejadores ou Diretores não podem criar ou alterar dados estruturais básicos da plataforma para evitar redundâncias (ex: criar duas vezes a mesma função "Ajudante Geral").

## 2. Estruturas Obrigatórias de Setup
Para que o sistema libere a criação da primeira Obra, o Tenant precisa parametrizar:

* **Calendário e Feriados:** O sistema exige o cadastro de feriados nacionais, estaduais e municipais específicos onde as obras ocorrem. **Motivo:** O algoritmo do Gráfico de Gantt e das Sprints precisa saber quais dias não contabilizar como "Dias Úteis" para evitar o cálculo falso de atrasos.
* **Turnos de Trabalho:** Definição da carga horária padrão (ex: 07h às 17h, com 1h de almoço). **Motivo:** O aplicativo mobile do canteiro usa essa regra para calcular automaticamente se o apontamento do operário gerou Hora Extra.
* **Dicionário de Ofícios:** Cadastro das profissões aceitas pela empreiteira (Pedreiro, Armador, Carpinteiro) e o Custo Padrão da Hora-Homem. **Motivo:** Facilita a precificação base no momento do orçamento.
* **Centros de Custo:** A árvore financeira da empresa. Toda Obra nova precisará ser atrelada a um centro de custo válido.

## 3. Gestão de Licenças e Usuários
* O Admin da Construtora é responsável por enviar os convites de acesso ao sistema (via e-mail ou link) para os funcionários de escritório.
* É ele quem concede o Nível de Acesso (RBAC), definindo quem será Planejador e quem será Financeiro dentro daquele Tenant, seguindo a matriz aprovada no `RN-003B`.