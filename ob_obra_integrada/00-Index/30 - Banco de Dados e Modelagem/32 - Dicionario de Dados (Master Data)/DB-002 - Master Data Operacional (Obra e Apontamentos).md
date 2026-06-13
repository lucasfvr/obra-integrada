---
tags: [obra-integrada, dicionario-de-dados, sql-server, canteiro, os]
aliases: [Tabelas de Canteiro, Tabelas de Execução, Schema Operacional]
---
# 🗄️ DB-002: Master Data Operacional (Obra, Equipe e OS)

Este dicionário mapeia o coração da operação no canteiro. Toda transação financeira ou de esforço físico é gravada aqui.

## 1. Tabela: `OBRA` (O Canteiro)
Contêiner principal de execução.

| Coluna | Tipo (SQL Server) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `Id_Obra` | INT IDENTITY(1,1) | PK | Identificador único da obra. |
| `Id_Tenant` | INT | FK, NOT NULL | Refere-se à tabela `TENANT`. Regra Multi-Tenant. |
| `Nome_Obra` | VARCHAR(100) | NOT NULL | Apelido comercial (Ex: Residencial Flores). |
| `Status_Obra` | VARCHAR(30) | NOT NULL | Enum: 'RASCUNHO', 'PLANEJAMENTO', 'EXECUCAO', 'CONCLUIDA'. |
| `CEP` | VARCHAR(9) | NULL | Utilizado futuramente para logística e Marketplace. |

## 2. Tabela: `OBRA_USUARIO` (Equipe do Canteiro / RBAC Local)
Define quem é o trabalhador dentro daquela obra específica e seu salário atual.

| Coluna | Tipo (SQL Server) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `Id_Alocacao` | INT IDENTITY(1,1) | PK | Identificador único da alocação. |
| `Id_Obra` | INT | FK, NOT NULL | Refere-se à tabela `OBRA`. |
| `Id_Usuario` | INT | FK, NOT NULL | Refere-se à tabela `USUARIO`. |
| `Papel_Canteiro`| VARCHAR(30) | NOT NULL | Enum: 'ENG_RESIDENTE', 'MESTRE', 'ENCARREGADO', 'OPERARIO'. |
| `Custo_Hora` | DECIMAL(10,2) | NULL | Salário-hora negociado (usado para gerar custo na OS). |
| `Data_Entrada` | DATE | DEFAULT GETDATE()| Início do trabalho no canteiro. |

## 3. Tabela: `ORDEM_SERVICO` (A Tarefa)
Unidade mínima de trabalho e agregação de custos.

| Coluna | Tipo (SQL Server) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `Id_OS` | INT IDENTITY(1,1) | PK | Identificador único da OS. |
| `Id_Obra` | INT | FK, NOT NULL | Refere-se à tabela `OBRA`. |
| `Descricao` | VARCHAR(255) | NOT NULL | O que deve ser feito (Ex: Concretagem da Laje 1). |
| `Status_OS` | VARCHAR(30) | NOT NULL | Enum: 'PLANEJADA', 'LIBERADA', 'EM_EXECUCAO', 'IMPEDIDA', 'CONCLUIDA'. |
| `Data_Inicio_Real`| DATETIME | NULL | Timestamp de quando o Encarregado deu o "Play". |
| `Data_Fim_Real` | DATETIME | NULL | Timestamp de quando o QA aprovou a OS. |

## 4. Tabela: `APONTAMENTO_HORA` (Diário de Obra)
Onde a produtividade se transforma em custo.

| Coluna | Tipo (SQL Server) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `Id_Apontamento`| BIGINT IDENTITY | PK | BIGINT pois o volume de registros será massivo. |
| `Id_OS` | INT | FK, NOT NULL | Refere-se à tabela `ORDEM_SERVICO`. |
| `Id_Usuario` | INT | FK, NOT NULL | Quem executou o trabalho. |
| `Horas_Trabalhadas`| DECIMAL(4,2) | NOT NULL | Ex: 8.50 (Oito horas e meia). |
| `Data_Trabalho` | DATE | NOT NULL | Qual dia as horas foram gastas. |
| `Custo_Gerado` | DECIMAL(10,2) | NOT NULL | Calculado no backend: (`Horas_Trabalhadas` * `Custo_Hora`). |