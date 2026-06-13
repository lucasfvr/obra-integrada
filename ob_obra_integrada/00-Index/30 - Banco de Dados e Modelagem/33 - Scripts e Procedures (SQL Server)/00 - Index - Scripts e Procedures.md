---
tags: [banco-de-dados, postgresql, neon, index]
---
# 📜 Índice: Scripts, Functions e Procedures (Neon DB)

Este diretório contém todos os scripts de banco de dados escritos em PL/pgSQL para a plataforma Obra Integrada, rodando no Neon (PostgreSQL).

## 🗄️ Esquemas (Schemas)
* **Global:** Dados de nível SaaS (Usuários globais, planos, tenants).
* **Tenant:** Dados isolados por construtora/empreiteira (Obras, OS, Trabalhadores).

## 📝 Lista de Scripts

### Gestão de Identidade (Global)
* [[PG-001 - FN_Criar_Usuario_Global]] - Cria a identidade única do usuário (CPF).

### Gestão de Tenants (B2B)
* *(A criar)* - Vínculo de usuário com o Tenant (Empreiteira).

### Operação e Canteiro
* *(A criar)* - Geração de Ordem de Serviço (OS).
* *(A criar)* - Apontamento de Horas e Mudança de Status (Kanban).