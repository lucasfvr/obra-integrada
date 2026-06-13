---
tags: [obra-integrada, regra-negocio, usuarios, rbac, super-app, nr]
aliases: [Cadastro de Trabalhador, Super App, Regras de Funcionário]
---
# 👷‍♂️ RN-002: Gestão de Perfis e o Super App do Trabalhador

## 1. Visão Arquitetural: O Duplo Papel do Usuário
Diferente de sistemas fechados, o trabalhador no Obra Integrada (Pedreiro, Eletricista, Mestre de Obras) possui uma entidade global e um vínculo local:
- **Entidade Global (O Super App):** O perfil do trabalhador é dele. Ele possui seu currículo digital, foto, histórico de obras e carteira de NRs. 
- **Vínculo Local (A Obra):** O trabalhador "empresta" seu perfil para uma Obra específica durante um período.

## 2. Regras de Entrada (Onboarding) e Validação
- **Identificador Único:** O CPF é a chave primária do trabalhador no ecossistema. Não podem existir duas contas com o mesmo CPF.
- **Validação de NRs (Normas Regulamentadoras):** 
  - As certificações (NR10, NR18, NR35) inseridas no currículo digital possuem data de validade.
  - **Bloqueio Operacional:** O sistema impede que o Mestre de Obras delegue uma tarefa categorizada como "Trabalho em Altura" para um trabalhador cuja NR35 conste como vencida no Super App.

## 3. Matriz de Permissões de Leitura (Trabalhador vs. Gestor)
O que acontece quando o trabalhador entra no sistema através do celular:

### Visão do Trabalhador (Celular/Super App)
- **O que PODE ver:** Suas tarefas do dia (Kanban/Lista), seu próprio apontamento de horas, suas certificações, opções de cursos e fórum da comunidade.
- **O que NÃO PODE ver:** Custos totais da obra, salário de outros trabalhadores, cronograma financeiro e diário de obra restrito.

### Visão do Gestor de Equipes (Escritório/Tablet)
- **O que PODE ver:** Produtividade de cada membro da equipe, taxa de atraso de tarefas, histórico de faltas e alertas de certificações a vencer.
- **O que NÃO PODE fazer:** Alterar o currículo ou as informações privadas da conta global do trabalhador (apenas o próprio trabalhador edita seu perfil no Super App).

## 4. O Fluxo de Avaliação (Marketplace e Reputação)
Quando a Obra transita para o status `Concluída` (conforme RN-001):
- O sistema dispara automaticamente um formulário de avaliação.
- O Responsável Técnico avalia os trabalhadores (alimentando a nota pública deles no Marketplace).
- A experiência de ter participado daquela obra é adicionada automaticamente como "Portfólio Validado" no Super App do profissional.