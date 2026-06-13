---
tags: [der, diagrama, entidade-relacionamento, modelagem, database]
aliases: [Entity Relationship Diagram, Database Schema]
---
# 🗺️ Índice - Diagrama Entidade-Relacionamento (DER)

Documentação de modelagem de banco de dados relacional e diagramas ER.

## 📚 Modelagem de Banco de Dados Relacional

### Conceitos Fundamentais
- **Diagrama ER visual**: Representação gráfica de entidades
- **Relacionamentos entre entidades**: 1:1, 1:N, N:M
- **Cardinalidade**: Especificação de relacionamentos
- **Entidades fracas**: Entidades dependentes de outra
- **Integridade referencial**: Foreign keys obrigatórias
- **Normalização de dados**: Até BCNF (3NF mínimo)

## 🗄️ Bancos de Dados Utilizados

### Principal
- **PostgreSQL**: Banco relacional open-source
  - ACID compliant
  - Escalável horizontalmente (com replicação)
  - JSON/JSONB support
  - Full-text search
  - Window functions para relatórios complexos

### Secundário/Backup
- **SQL Server**: Banco relacional Microsoft
  - Procedures e funções avançadas
  - Integration Services para ETL
  - Temporal tables para auditoria
  - Query optimization avançada

### Cloud
- **Banco de dados em nuvem**: PostgreSQL RDS (AWS) ou Azure Database

## 🔍 Consultas SQL Avançadas

### Operações Básicas
- **SELECT**: Recuperação com projeção
- **WHERE**: Filtros com condições complexas
- **GROUP BY**: Agregação com HAVING
- **ORDER BY**: Ordenação multi-coluna
- **JOINs**: INNER, LEFT, RIGHT, FULL OUTER
- **Funções de agregação**: SUM, COUNT, AVG, MIN, MAX
- **Consultas complexas**: Subqueries, CTEs (Common Table Expressions)
- **Window functions**: ROW_NUMBER(), RANK(), LAG(), LEAD()

### Otimização de Desempenho
- **Índices de tabelas**: B-tree, Hash, GIST
- **Plano de execução**: EXPLAIN ANALYZE
- **Particionamento**: Range, List, Hash
- **Compressão de dados**: Reduz I/O
- **Archiving**: Movimenta dados antigos

## 📊 Diagramas de Referência

### MER-001: Diagrama da Plataforma (SaaS)
- [[MER-001 - Diagrama da Plataforma (SaaS Obra Integrada)]]
- Gestão de tenants
- Planos de assinatura
- Auditoria global

### MER-002: Diagrama do Cliente (Construtora e Obra)
- [[MER-002 - Diagrama do Cliente (Construtora e Obra)]]
- Estrutura de obras
- Recursos e pessoal
- Ordens de serviço

## 🔗 Referências Relacionadas
- [[32 - Dicionario de Dados (Master Data)]]
- [[33 - Scripts e Procedures (SQL Server)]]
- [[14 - Arquitetura SaaS e Isolamento Multi-Tenant]]

---
**Status:** 🔄 Em desenvolvimento
**Última atualização:** 11 de junho de 2026
