---
tags: [master-data, dicionario-dados, modelagem, tipos, dominio]
aliases: [Data Dictionary, Master Data Management]
---
# 📖 Índice - Dicionário de Dados (Master Data)

Documentação de dicionário de dados, tipos, domínios e integridade de dados.

## 🔐 Integridade e Segurança de Dados

### Integridade Referencial
- **Foreign keys**: Relacionamentos obrigatórios
- **Constraints**: CHECK, UNIQUE, NOT NULL
- **Triggers**: Validações complexas
- **Default values**: Valores padrão seguros

### Pool de Conexões
- **Connection pooling**: Reutiliza conexões
- **Max connections**: Limite por tenant
- **Timeout**: Fechar conexões ociosas
- **Health checks**: Validar conexões vivas

### Migração de Bancos de Dados
- **Versionamento de schema**: Liquibase / Flyway
- **Zero-downtime migrations**: Estratégias de rollback
- **Data migration scripts**: ETL estruturado
- **Backup antes de migração**: Recuperação rápida

## 🗂️ Estrutura do Dicionário

### Tabelas Críticas
- Definição de tabelas por módulo
- Campos obrigatórios vs opcionais
- Tipos de dados padronizados
- Restrições e validações

### Tipos de Dados Padrão
- **Identificadores**: INT (PK), UUID (distribuído)
- **Strings**: VARCHAR(n), TEXT
- **Números**: DECIMAL(p,s), INT, BIGINT
- **Datas**: DATE, TIMESTAMP, INTERVAL
- **Booleanos**: BOOLEAN
- **JSON**: JSONB (PostgreSQL)
- **Enums**: Para domínios fechados

### Domínios de Negócio
- Status (Novo, Em Progresso, Concluído, Cancelado)
- Papéis de Usuário (Admin, Gerente, Operacional)
- Tipos de Obra (Comercial, Residencial, Industrial)
- Tipos de Apontamento (Presença, Afastamento, Folga)

## 🔍 Master Data (Dados Mestres)

### Dados Corporativos
- **Tenants**: Construtoras/Clientes
- **Usuários**: Pessoas e papéis
- **Departamentos**: Estrutura organizacional
- **Localizações**: Endereços e coordenadas

### Dados Operacionais
- **Obras**: Projetos de construção
- **Tarefas**: Atividades no canteiro
- **Recursos**: Materiais e equipamentos
- **Pessoas**: Equipe de trabalho

### Dados Transacionais
- **Apontamentos**: Registros de horas
- **Ordens de Serviço**: Trabalho executado
- **Pedidos**: Suprimentos e materiais
- **Documentos**: Comprovantes e anexos

## 📊 Qualidade de Dados

### Validações
- Não permitir duplicatas de registros críticos
- Validar formato de emails, CPFs, CNPJs
- Garantir completude de campos obrigatórios
- Sincronização entre dados relacionados

### Limpeza de Dados
- Script de deduplicação
- Correção de valores inválidos
- Preenchimento de campos vazios
- Auditoria de mudanças

## 🔗 Referências Relacionadas
- [[31 - Diagrama Entidade-Relacionamento (DER)]]
- [[33 - Scripts e Procedures (SQL Server)]]

---
**Status:** 🔄 Em desenvolvimento
**Última atualização:** 11 de junho de 2026
