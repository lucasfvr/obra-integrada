---
tags: [script, procedure, sql, trigger, funcao]
aliases: [Stored Procedures, SQL Scripts]
---
# 🛠️ Índice - Scripts e Procedures (SQL Server)

Documentação de stored procedures, funções, triggers e scripts SQL.

## 📋 Stored Procedures e Transações

### Tipos de Procedures
- **Procedures de Inserção**: CREATE com validações
- **Procedures de Atualização**: UPDATE com audit log
- **Procedures de Exclusão**: DELETE com soft delete
- **Procedures de Consulta**: SELECT com filtros complexos
- **Procedures de Relatório**: Agregações e cálculos

### Características Avançadas
- **Funções customizadas**: Lógica reutilizável
- **Triggers**: Validações e auditoria automática
- **Vistas**: Abstração de tabelas complexas
- **Cursors**: Iteração através de resultados

## ⚡ Transações e Integridade ACID

### Controle Transacional
- **Commit**: Confirma alterações com sucesso
- **Rollback**: Reverte alterações em caso de erro
- **Tratamento de falhas**: Try-Catch em procedures
- **Consistência dos dados**: Validações antes do commit
- **Operações atômicas**: Tudo-ou-nada

### Conceitos ACID
- **Atomicidade**: Transação completa ou não executa
- **Consistência**: Estado válido antes e depois
- **Isolamento**: Transações não interferem entre si
- **Durabilidade**: Dados persistidos após commit

### Controle de Concorrência
- **Read Committed**: Nível padrão de isolamento
- **Repeatable Read**: Evita phantom reads
- **Serializable**: Máximo isolamento (mais lento)
- **Prevenção de leituras inconsistentes**: Locks apropriados

## 🔍 Otimização de Performance

### Índices e Execução
- **Query analysis**: EXPLAIN PLAN
- **Index optimization**: Planos de execução eficientes
- **Statistics update**: Manutenção de índices
- **Query rewrite**: Otimização de SQL

### Monitoramento
- **Slow query logs**: Identificar gargalos
- **Lock monitoring**: Detectar deadlocks
- **Plan cache**: Reutilizar planos compilados

## 📚 Biblioteca de Procedures

### Exemplo: FN_Criar_Usuario_Global
**Referência:** [[PG-001 - FN_Criar_Usuario_Global]]

### Convenção de Nomenclatura
- **SP_**: Stored Procedures (SP_InsertUsuario)
- **FN_**: Functions escalares (FN_ValidarCPF)
- **TR_**: Triggers (TR_AuditaUsuario)

## 🔗 Referências Relacionadas
- [[31 - Diagrama Entidade-Relacionamento (DER)]]
- [[32 - Dicionario de Dados (Master Data)]]
- [[PG-001 - FN_Criar_Usuario_Global]]

---
**Status:** 🔄 Em desenvolvimento
**Última atualização:** 11 de junho de 2026
