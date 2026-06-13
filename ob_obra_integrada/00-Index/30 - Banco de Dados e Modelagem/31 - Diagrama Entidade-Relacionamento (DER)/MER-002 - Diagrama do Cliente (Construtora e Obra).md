---
tags: [obra-integrada, mer, construtora, canteiro, rbac]
aliases: [Diagrama do Cliente, Operação da Obra]
---
# 🗺️ MER-002: Diagrama do Cliente (Construtora e Obra)

Este diagrama representa o ambiente isolado (Multi-Tenant) de uso da construtora. Tudo o que acontece aqui dentro está atrelado ao `Id_Tenant` da empresa que contratou o sistema.

## 1. Regras de Hierarquia do Cliente
* **Visão Corporativa (Backoffice):** O relacionamento entre o Usuário e a Construtora (`TENANT_USUARIO`). É aqui que ficam os perfis transversais: Diretores, RH e Orçamentistas que enxergam todas as obras da empresa.
* **Visão de Canteiro (Operação):** O relacionamento entre o Usuário e o Canteiro (`OBRA_USUARIO`). É aqui que ficam os perfis locais: Engenheiro Residente, Mestre de Obras e Pedreiros, cujo acesso é restrito apenas ao cercado daquela obra.

## 2. Diagrama Visual (MER Cliente)

```mermaid
erDiagram
    %% ==========================================
    %% NÍVEL CORPORATIVO (O ESCRITÓRIO)
    %% ==========================================
    TENANT ||--o{ TENANT_USUARIO : "emprega_no_backoffice"
    TENANT ||--o{ OBRA : "financia"
    TENANT {
        INT Id_Tenant PK
        STRING Razao_Social
    }

    TENANT_USUARIO {
        INT Id_Vinculo_Corp PK
        INT Id_Tenant FK
        INT Id_Usuario FK
        STRING Papel_Corp "Ex: CEO, RH, Planejador"
    }

    %% ==========================================
    %% IDENTIDADE DO TRABALHADOR (SUPER APP)
    %% ==========================================
    USUARIO ||--o{ TENANT_USUARIO : "possui_cargo_gerencial"
    USUARIO ||--o{ OBRA_USUARIO : "trabalha_no_canteiro"
    USUARIO {
        INT Id_Usuario PK
        STRING CPF "Chave Única Global"
        STRING Nome_Completo
        STRING Especialidade_Base
    }

    %% ==========================================
    %% NÍVEL OPERACIONAL (O CANTEIRO)
    %% ==========================================
    OBRA ||--o{ OBRA_USUARIO : "monta_equipe"
    OBRA ||--o{ ORDEM_SERVICO : "executa_tarefas"
    OBRA {
        INT Id_Obra PK
        INT Id_Tenant FK
        STRING Nome_Obra
        STRING Status_Obra
    }

    OBRA_USUARIO {
        INT Id_Alocacao PK
        INT Id_Obra FK
        INT Id_Usuario FK
        STRING Papel_Canteiro "Ex: Eng, Mestre, Ajudante"
        DECIMAL Custo_Hora_Homem
    }

    %% ==========================================
    %% APONTAMENTO DE PRODUÇÃO
    %% ==========================================
    ORDEM_SERVICO ||--o{ APONTAMENTO_HORA : "gera_custo"
    ORDEM_SERVICO {
        INT Id_OS PK
        INT Id_Obra FK
        STRING Descricao_Tarefa
        STRING Status_Atual
    }

    APONTAMENTO_HORA {
        INT Id_Apontamento PK
        INT Id_OS FK
        INT Id_Usuario FK
        DECIMAL Horas_Trabalhadas
        DATE Data_Trabalho
    }
```