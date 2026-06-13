---
tags: [obra-integrada, mer, saas, plataforma, admin]
aliases: [Diagrama Interno, Banco de Dados SaaS]
---
# 🗺️ MER-001: Diagrama da Plataforma (SaaS Obra Integrada)

Este diagrama mapeia o banco de dados interno da empresa fornecedora do software. É a camada de infraestrutura, suporte e faturamento. Nenhuma construtora tem acesso a essas tabelas.

## 1. Regras de Negócio do Nível SaaS
* **Equipe Isolada:** Os usuários da plataforma (Devs, Suporte, PO) não existem na tabela de trabalhadores das construtoras.
* **Gestão de Tenants:** A Plataforma enxerga as Construtoras (Tenants) como "Clientes pagantes", podendo bloquear o acesso geral de uma empresa por inadimplência.
* **Auditoria Global:** Toda ação de um desenvolvedor ou suporte técnico no banco de dados deve gerar um log para conformidade com a LGPD.

## 2. Diagrama Visual (MER SaaS)

```mermaid
erDiagram
    %% ==========================================
    %% GESTÃO DA PLATAFORMA E CLIENTES (TENANTS)
    %% ==========================================
    EQUIPE_PLATAFORMA ||--o{ LOG_AUDITORIA_SAAS : "gera"
    EQUIPE_PLATAFORMA {
        INT Id_Admin PK
        STRING Nome_Colaborador
        STRING Email_Corporativo
        STRING Papel_SaaS "Ex: Dev, PO, Suporte_N3"
    }

    TENANT ||--o{ PLANO_ASSINATURA : "contrata"
    TENANT {
        INT Id_Tenant PK
        STRING Razao_Social
        STRING Documento_CNPJ_CPF
        BOOLEAN Flag_Ativo "Bloqueio global do cliente"
    }

    PLANO_ASSINATURA {
        INT Id_Contrato PK
        INT Id_Tenant FK
        STRING Tipo_Plano "Ex: Básico, Enterprise"
        INT Limite_Obras_Ativas
        DATE Data_Renovacao
    }

    LOG_AUDITORIA_SAAS {
        INT Id_Log PK
        INT Id_Admin FK
        STRING Acao_Realizada "Ex: Resetou senha do CEO do Tenant X"
        DATETIME Data_Hora
    }
```