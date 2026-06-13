---
tags: [obra-integrada, dicionario-de-dados, sql-server, tarefas, rh, kanban]
aliases: [Tabelas de Tarefas, Tabelas de RH, Sprints e NRs]
---
# 🗄️ DB-003: Master Data (Gestão de Pessoas e Tarefas)

Este documento detalha as tabelas complementares que dão suporte à metodologia Ágil (Sprints), à rastreabilidade do Kanban (Histórico) e à segurança do trabalho (NRs).

## 1. Tabela: `SPRINT` (Agrupador de Tarefas)
Gerencia os ciclos de trabalho curtos (geralmente semanais ou quinzenais).

| Coluna | Tipo (SQL Server) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `Id_Sprint` | INT IDENTITY(1,1) | PK | Identificador do ciclo. |
| `Id_Obra` | INT | FK, NOT NULL | Refere-se à tabela `OBRA`. |
| `Nome_Sprint` | VARCHAR(50) | NOT NULL | Ex: 'Sprint 04 - Fundação Blocos'. |
| `Data_Inicio` | DATE | NOT NULL | Data programada para começar. |
| `Data_Fim` | DATE | NOT NULL | Data programada para terminar. |
| `Status` | VARCHAR(20) | NOT NULL | Enum: 'PLANEJADA', 'ATIVA', 'CONCLUIDA'. |

*(Nota de Relacionamento: A tabela `ORDEM_SERVICO` do DB-002 deve receber uma coluna `Id_Sprint` (FK, NULL) para amarrar a tarefa à Sprint atual).*

## 2. Tabela: `HISTORICO_STATUS_OS` (Auditoria do Kanban)
Rastreia cada vez que uma tarefa muda de coluna no Kanban (ex: de 'Em Execução' para 'Impedida'). Vital para medir gargalos.

| Coluna | Tipo (SQL Server) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `Id_Historico` | BIGINT IDENTITY | PK | BIGINT para suportar alto volume. |
| `Id_OS` | INT | FK, NOT NULL | Refere-se à tabela `ORDEM_SERVICO`. |
| `Id_Usuario` | INT | FK, NOT NULL | Quem arrastou o card no sistema. |
| `Status_Anterior`| VARCHAR(30) | NOT NULL | Ex: 'EM_EXECUCAO'. |
| `Status_Novo` | VARCHAR(30) | NOT NULL | Ex: 'IMPEDIDA'. |
| `Motivo_Impedimento`| VARCHAR(255) | NULL | Justificativa se o status novo for 'IMPEDIDA'. |
| `Data_Hora` | DATETIME | DEFAULT GETDATE()| Timestamp exato da mudança. |

## 3. Tabela: `CHECKLIST_OS` (Controle de Etapas / Micro-tarefas)
Permite que o Mestre ou o QA deem "checks" em passos específicos antes de fechar a OS inteira.

| Coluna | Tipo (SQL Server) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `Id_Checklist` | BIGINT IDENTITY | PK | Identificador do item. |
| `Id_OS` | INT | FK, NOT NULL | Refere-se à tabela `ORDEM_SERVICO`. |
| `Descricao_Item` | VARCHAR(150) | NOT NULL | Ex: 'Verificar prumo da parede'. |
| `Concluido` | BIT | DEFAULT 0 | 1 = OK; 0 = Pendente. |
| `Id_Usuario_Aprovador`| INT | FK, NULL | Quem deu o check na etapa. |

## 4. Tabela: `CERTIFICACAO_USUARIO` (Segurança e NRs)
O coração da gestão de pessoas para o canteiro. O sistema usa isso para bloquear alocações indevidas.

| Coluna | Tipo (SQL Server) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `Id_Certificacao`| INT IDENTITY(1,1) | PK | Identificador do documento. |
| `Id_Usuario` | INT | FK, NOT NULL | Refere-se à tabela `USUARIO`. |
| `Tipo_Certificacao`| VARCHAR(50) | NOT NULL | Ex: 'NR-35', 'NR-10', 'NR-18'. |
| `Data_Emissao` | DATE | NOT NULL | Quando o curso foi feito. |
| `Data_Validade` | DATE | NOT NULL | Se GETDATE() > Data_Validade, bloqueia a OS. |
| `Arquivo_Url` | VARCHAR(500) | NULL | Link para o PDF/Foto do certificado salvo na nuvem. |