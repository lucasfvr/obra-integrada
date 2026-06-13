---
tags: [obra-integrada, interacao, jornada, usabilidade, ux]
aliases: [Como Usa o Sistema, Interação do Usuário, Rotina Diária]
---
# 📱 RN-003C: Jornada e Interação com o Sistema (A Prática)

Este documento mapeia o fluxo diário (User Journey) de cada perfil utilizando a interface do Obra Integrada, ditando como o Front-end deve ser desenhado para facilitar a rotina de trabalho.

## A Rotina do Mestre de Obras (Web Mobile / Tablet)
* **07:00 (Planejamento do Dia):** Abre o app, acessa o painel "Sprints da Semana" e visualiza as frentes de serviço atrasadas.
* **07:30 (Despacho):** Seleciona as Ordens de Serviço do dia e arrasta (Drag-and-Drop) para o nome de cada Encarregado.
* **14:00 (Gestão de Crise):** Recebe um alerta *push* de que a frente de concretagem parou. Aprova uma requisição urgente de vibrador de concreto para o Almoxarifado via sistema.
* **17:00 (Fechamento):** Revisa o dashboard de apontamentos da equipe, valida as horas e fecha o Diário de Obra Digital, disparando-o para o Engenheiro.

## A Rotina do Encarregado (App Mobile no Celular Pessoal)
* **07:30 (Check-in):** Recebe a lista de tarefas do Mestre. Confirma a equipe presente através de uma lista de seleção rápida (checkboxes).
* **08:00 (Execução):** Dá o "Play" na tarefa X.
* **11:00 (Impedimento):** Falta material. Ele aperta o botão "Pausar Tarefa" e seleciona o motivo "Falta de Insumo" no menu suspenso. O relógio de produtividade daquela OS para.
* **16:30 (Apontamento Final):** Insere a porcentagem física concluída (ex: "Fizemos 40m² de alvenaria hoje") e tira uma foto obrigatória do serviço com a câmera do app para comprovação técnica.

## A Rotina do Engenheiro Residente (Web Desktop / Escritório)
* **08:00 (Análise de Desvios):** Abre o sistema em um monitor amplo. A tela inicial exibe um dashboard com a Curva S atualizada com os dados do dia anterior. Verifica se o avanço físico está coerente com o custo incorrido.
* **10:00 (Medição e Pagamento):** Analisa as fotos e as porcentagens apontadas pelos Encarregados. Com dois cliques, converte o avanço físico em "Medição Aprovada", liberando a informação para o Contas a Pagar processar a nota fiscal do empreiteiro.
* **16:00 (Reunião de Alinhamento):** Compartilha o visualizador do Gantt Dinâmico com o Cliente para demonstrar que a etapa de fundação foi entregue 2 dias antes do prazo.