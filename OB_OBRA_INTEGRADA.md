# OB_OBRA_INTEGRADA - Implementação de Transações Complexas e Operações Avançadas de Banco de Dados

Este documento descreve a implementação de recursos avançados de banco de dados no projeto Obra Integrada, incluindo stored procedures, triggers, consultas complexas e transações personalizadas.

## 📋 Visão Geral

O projeto utiliza Prisma ORM para operações padrão de CRUD, mas estende suas capacidades com SQL nativo para operações complexas que exigem:

- Stored Procedures para lógica de negócio encapsulada
- Triggers para automatização de ações baseado em eventos
- Consultas complexas com subqueries, CTEs e window functions
- Transações personalizadas para operações multi-step críticas

## 🏗️ Estrutura de Arquivos

```
backend/
├── src/
│   ├── sql/                     # ← Scripts SQL customizados
│   │   ├── procedures/          # ← Stored Procedures
│   │   │   └── calcular_custo_obra.sql
│   │   ├── triggers/            # ← Triggers e funções de trigger
│   │   │   └── atualizar_status_obra.sql
│   │   └── queries/             # ← Consultas complexas prontas para uso
│   │       └── relatorio_rh_avancado.sql
│   ├── services/                # ← Serviços de acesso a dados
│   │   ├── DatabaseService.js   # ← Wrapper para queries raw do Prisma
│   │   ├── ObraService.js       # ← Exemplo de serviço usando procedures
│   │   └── RHService.js         # ← Exemplo de serviço usando queries complexas
│   └── scripts/
│       └── deploy-db.js         # ← Script para deploy de SQL custom
└── OB_OBRA_INTEGRADA.md         # ← Este documento
```

## 🔧 Como Funciona

### 1. DatabaseService (backend/src/services/DatabaseService.js)

Wrapper centralizado para execução segura de queries raw usando Prisma:

```javascript
// Executa query com parâmetros seguros (previne SQL injection)
const result = await DatabaseService.queryRaw(
  'SELECT * FROM tb_obra WHERE id_obra = $1 AND status = $2',
  [obraId, 'ATIVO']
);

// Executa comando (INSERT/UPDATE/DELETE)
await DatabaseService.executeRaw(
  'UPDATE tb_obra SET nome = $1 WHERE id_obra = $2',
  [novoNome, obraId]
);

// Executa transação personalizada
await DatabaseService.transaction(async (prisma) => {
  // Operações que devem ser atômicas
  await prisma.tb_obra.update({ ... });
  await prisma.tb_financeiro_obra.create({ ... });
});
```

### 2. Stored Procedures (backend/src/sql/procedures/)

Procedures encapsulam lógica de negócio complexa e reutilizável.

**Exemplo: calcular_custo_obra.sql**
```sql
CREATE OR REPLACE FUNCTION calcular_custo_obra(p_id_obra INTEGER)
RETURNS DECIMAL(12,2) AS $$
DECLARE
  v_custo_material DECIMAL(12,2);
  v_custo_mao_obra DECIMAL(12,2);
  v_custo_taxas DECIMAL(12,2);
BEGIN
  -- Cálculo do custo de materiais
  SELECT COALESCE(SUM(mo.quantidade * m.preco_unitario), 0) +
         COALESCE(SUM(r.quantidade_usada * m.preco_unitario), 0)
  INTO v_custo_material
  FROM tb_movimentacao_estoque mo
  JOIN tb_material m ON mo.id_material = m.id_material
  LEFT JOIN tb_requisicao r ON mo.id_material = r.id_material
    AND mo.id_estoque IN (
      SELECT id_estoque FROM tb_estoque_obra WHERE id_obra = p_id_obra
    )
  WHERE mo.id_obra = p_id_obra AND mo.tipo = 'SAIDA';

  -- Cálculo do custo da mão de obra
  SELECT COALESCE(SUM(p.valor_diaria * p.horas_trabalhadas / 8), 0)
  INTO v_custo_mao_obra
  FROM tb_rh_ponto_diaria p
  WHERE p.id_obra = p_id_obra AND p.status = 'APROVADO';

  -- Cálculo de taxas
  SELECT COALESCE(SUM(f.valor), 0)
  INTO v_custo_taxas
  FROM tb_financeiro_obra f
  WHERE f.id_obra = p_id_obra AND f.tipo = 'TAXA';

  RETURN v_custo_material + v_custo_mao_obra + v_custo_taxas;
END;
$$ LANGUAGE plpgsql;
```

**Uso no serviço:**
```javascript
const result = await DatabaseService.queryRaw(
  'SELECT calcular_custo_obra($1) AS custo_total',
  [idObra]
);
```

### 3. Triggers (backend/src/sql/triggers/)

Triggers automatizam ações baseado em eventos de tabela (INSERT, UPDATE, DELETE).

**Exemplo: atualizar_status_obra.sql**
```sql
CREATE OR REPLACE FUNCTION atualizar_status_obra_apenas()
RETURNS TRIGGER AS $$
BEGIN
  -- Se todas as etapas da obra estiverem concluídas, marca obra como finalizada
  IF (SELECT COUNT(*) FROM tb_etapa
      WHERE id_obra = NEW.id_obra AND id_status != 3) = 0 THEN
    UPDATE tb_obra
    SET id_status = 4,  -- 4 = FINALIZADO
        data_termino_real = NOW()
    WHERE id_obra = NEW.id_obra;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_status_obra
AFTER UPDATE ON tb_etapa
FOR EACH ROW
EXECUTE FUNCTION atualizar_status_obra_apenas();
```

Este trigger atualiza automaticamente o status da obra quando todas suas etapas são marcadas como concluídas.

### 4. Consultas Complexas (backend/src/sql/queries/)

Consultas otimizadas para relatórios e análises complexas.

**Exemplo: relatorio_rh_avancado.sql**
```sql
-- Relatório avançado de RH: Funcionários com certificações vencidas
-- trabalhando em obras de alto risco nos últimos 30 dias
SELECT
  u.id_usuario,
  u.nome,
  u.cpf,
  c.nome AS certificacao,
  c.data_validade,
  o.id_obra,
  o.nome AS obra,
  o.tipo_obra,
  (CURRENT_DATE - c.data_validade) AS dias_vencido,
  COUNT(p.id_ponto_diaria) AS pontos_recentes
FROM tb_usuario u
JOIN tb_certificacao c ON u.id_usuario = c.id_usuario
JOIN tb_rh_ponto_diaria p ON u.id_usuario = p.id_usuario
JOIN tb_obra o ON p.id_obra = o.id_obra
WHERE
  c.data_validade < CURRENT_DATE
  AND o.tipo_obra IN ('ELÉTRICA', 'ALTURA', 'CONFINAMENTO', 'TAQUELAGEM')  -- Obras de risco
  AND p.data_ponto >= CURRENT_DATE - INTERVAL '30 dias'
  AND u.status = 'ATIVO'
GROUP BY
  u.id_usuario, u.nome, u.cpf, c.nome, c.data_validade,
  o.id_obra, o.nome, o.tipo_obra
ORDER BY
  dias_vencido DESC, u.nome;
```

## 🚀 Como Deployar

### Passo a Passo:

1. **Execute as migrações do Prisma normalmente:**
   ```bash
   npx prisma migrate deploy
   ```

2. **Deploy dos procedimentos, triggers e funções customizadas:**
   ```bash
   npm run deploy-db
   ```

3. **Verifique se os objetos foram criados corretamente:**
   ```bash
   npm run verify-db
   ```

### Integração com CI/CD:

Adicione ao seu pipeline de deploy:
```bash
# Após migrations do Prisma
npx prisma migrate deploy
npm run deploy-db
```

## 📚 Exemplos de Uso nos Serviços

### ObraService.js
```javascript
const DatabaseService = require('./DatabaseService');

class ObraService {
  static async calcularCustoObra(idObra) {
    const result = await DatabaseService.queryRaw(
      'SELECT calcular_custo_obra($1) AS custo_total',
      [idObra]
    );
    return { idObra, custoTotal: Number(result[0].custo_total) || 0 };
  }

  static async atualizarStatusFinanceiro(idObra) {
    return await DatabaseService.transaction(async (prisma) => {
      // Lógica complexa de atualização financeira
      // ...
    });
  }
}
```

### RHService.js
```javascript
const DatabaseService = require('./DatabaseService');
const fs = require('fs');
const path = require('path');

class RHService {
  static async getFuncionariosComCertificacaoVencidaEmObrasDeRisco() {
    const queryPath = path.join(__dirname, '../sql/queries/relatorio_rh_avancado.sql');
    const query = fs.readFileSync(queryPath, 'utf8');
    return await DatabaseService.queryRaw(query);
  }
}
```

## ⚠️ Boas Práticas

### Segurança
- **Nunca concatenar strings** em queries raw - sempre use parâmetros
- Validar todos os inputs antes de usar em procedures/triggers
- Usar o `DatabaseService.queryRaw` e `executeRaw` para proteção automática contra SQL injection

### Performance
- Analisar planos de execução com `EXPLAIN ANALYZE` para queries complexas
- Criar índices estratégicos baseado nos padrões de consulta
- Procedures bem escritas podem ser mais rápidas que múltiplas queries separadas

### Manutenibilidade
- Documentar cada procedure/trigger com comentários claros
- Versionar arquivos .sql como código fonte (git)
- Criar testes automatizados para procedures críticas
- Manter consistency entre o schema.prisma e as tabelas referenciadas no SQL custom

### Tratamento de Erros
- Sempre envolver calls ao DatabaseService em try/catch
- Logar erros com contexto adequado para facilitar debug
- Considerar estratégias de retry para operações transitórias

## 🔄 Fluxo de Trabalho Recomendado

1. **Para novas funcionalidades:**
   - Comece tentando implementar com Prisma padrão
   - Se necessário recorra a SQL complexo, crie procedure/query em src/sql/
   - Crie ou atualize serviço relevante para usar o novo recurso
   - Atualize documentação se necessário

2. **Para manutenção:**
   - Use `npm run verify-db` periodicamente para garantir que objetos existem
   - Monitorar performance com `pg_stat_statements`
   - Revisar procedures anuais para otimizações

## 📊 Monitoramento

Queries úteis para monitoramento:
```sql
-- Verificar procedures existentes
SELECT proname, prosrc
FROM pg_proc
JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid
WHERE nspname = 'public';

-- Verificar triggers
SELECT tgname, tgrelid::regclass AS table_name
FROM pg_trigger
WHERE tgname LIKE 'trigger_%';

-- Monitorar performance de procedures
SELECT *
FROM pg_stat_user_functions
WHERE funcname IN ('calcular_custo_obra', 'atualizar_status_obra_apenas');
```

## 🛠️ Solução de Problemas Comuns

### "Function does not exist"
- Verificar se `npm run deploy-db` foi executado após as migrações
- Chegar se o nome da procedure está correto (case-sensitive no PostgreSQL)
- Verificar se o usuário do banco tem permissão para executar a function

### "Permission denied"
- O usuário do banco de dados precisa de privilégios EXECUTE nas functions
- Pode ser necessário conceder permissões explícitas:
  ```sql
  GRANT EXECUTE ON FUNCTION calcular_custo_obra TO usuario_app;
  ```

### Performance ruim
- Executar `EXPLAIN ANALYZE` na query/procedure
- Verificar se índices adequados existem nas tabelas envolvidas
- Considerar refatorar para usar CTEs ou temporary tables se apropriado

## ✅ Benefícios Implementados

Com esta implementação, o projeto Obra Integrada agora possui:

1. **Lógica de Negócio Encapsulada**: Procedures como `calcular_custo_obra` centralizam regras complexas
2. **Automatização**: Triggers eliminam necessidade de lógica de atualização em múltiplos lugares
3. **Performance Otimizada**: Consultas complexas pré-otimizadas para relatórios críticos
4. **Segurança**: Proteção automática contra SQL injection através de parâmetros
5. **Manutenibilidade**: Separação clara entre operações padrão (Prisma) e complexas (SQL custom)
6. **Escalabilidade**: Fácil de adicionar novos procedures/triggers conforme necessidades do negócio crescem

## 📌 Próximos Passos Sugeridos

1. **Implementar procedures específicas** para módulos financeiros avançados
2. **Criar triggers de auditoria** para mudanças críticas em dados de usuários e obras
3. **Desenvolver package de funções úteis** para cálculos comuns (juros, correções monetárias, etc.)
4. **Criar views materializadas** para dashboards que exigem agregações pesadas
5. **Implementar teste de carga** para validar performance das procedures em volume

---

*Documentação mantida pela equipe de desenvolvimento Obra Integrada*
*Última atualização: $(date)*