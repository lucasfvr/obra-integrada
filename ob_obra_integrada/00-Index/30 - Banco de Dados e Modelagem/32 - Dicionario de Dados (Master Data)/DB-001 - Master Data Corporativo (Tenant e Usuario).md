---
tags: [obra-integrada, dicionario-de-dados, sql-server, tenant, usuario]
aliases: [Tabelas de Cliente, Tabelas Globais, Schema Cliente]
---
# 🗄️ DB-001: Master Data Corporativo (Tenant e Usuário)

Este dicionário mapeia as tabelas estruturais de identidade e isolamento do sistema. Estas tabelas são a fundação para que o Multi-Tenant funcione no SQL Server.

## 1. Tabela: `TENANT` (A Construtora)
Armazena os dados da empresa cliente. 

| Coluna | Tipo (SQL Server) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `Id_Tenant` | INT IDENTITY(1,1) | PK | Identificador único da construtora. |
| `Razao_Social` | VARCHAR(150) | NOT NULL | Nome oficial da empresa. |
| `Documento_CNPJ_CPF`| VARCHAR(18) | UNIQUE, NOT NULL | Documento com pontuação ou limpo. |
| `Data_Cadastro` | DATETIME | DEFAULT GETDATE()| Data de entrada no SaaS. |
| `Flag_Ativo` | BIT | DEFAULT 1 | 1 = Acesso liberado; 0 = Inadimplente/Bloqueado. |

## 2. Tabela: `USUARIO` (O Super App / Identidade Global)
Armazena a identidade física do trabalhador ou gestor. Independe de vínculo com obras.

| Coluna | Tipo (SQL Server) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `Id_Usuario` | INT IDENTITY(1,1) | PK | Identificador único do profissional. |
| `CPF` | VARCHAR(14) | UNIQUE, NOT NULL | Login do sistema (Ex: 123.456.789-00). |
| `Nome_Completo` | VARCHAR(150) | NOT NULL | Nome de exibição na plataforma. |
| `Email` | VARCHAR(100) | UNIQUE, NULL | Opcional para o Canteiro, obrigatório para Escritório. |
| `Hash_Senha` | VARCHAR(256) | NOT NULL | Senha criptografada (Argon2 / BCrypt). |
| `Is_Terceirizado` | BIT | DEFAULT 0 | 1 = É um CNPJ/Empreiteiro terceirizado. |

## 3. Tabela: `TENANT_USUARIO` (Vínculo de Backoffice)
Associa executivos e RH à construtora inteira (acesso transversal).

| Coluna | Tipo (SQL Server) | Restrição | Descrição |
| :--- | :--- | :--- | :--- |
| `Id_Vinculo_Corp` | INT IDENTITY(1,1) | PK | Identificador do vínculo corporativo. |
| `Id_Tenant` | INT | FK, NOT NULL | Refere-se à tabela `TENANT`. |
| `Id_Usuario` | INT | FK, NOT NULL | Refere-se à tabela `USUARIO`. |
| `Papel_Corp` | VARCHAR(30) | NOT NULL | Enum: 'ADMIN', 'CEO', 'RH', 'PLANEJADOR'. |