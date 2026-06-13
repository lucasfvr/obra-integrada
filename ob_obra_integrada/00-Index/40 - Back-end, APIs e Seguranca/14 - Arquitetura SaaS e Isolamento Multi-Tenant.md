---
tags: [arquitetura, saas, multi-tenant, isolamento, banco-dados, seguranca, feature-flags]
---
# 🏢 Arquitetura SaaS e Isolamento Multi-Tenant

Como o Obra Integrada é um **Software como Serviço (SaaS) B2B** vendido para múltiplas empreiteiras, a fundação do banco de dados deve garantir a **separação absoluta das informações** entre clientes e flexibilidade parametrizável.

---

## 🔐 Regra Primária de Isolamento

### Tenant_ID: O Guardião da Separação

**Definição**: `tenant_id` é o identificador único e imutável de cada construtora cliente.

**Estrutura no banco**:
```
TENANT (tabela raiz)
├─ id (PK, UUID)
├─ nome_empresa: "Empreiteira A Ltda"
├─ cnpj: "12.345.678/0001-90"
├─ plano: "PROFESSIONAL"
├─ status: "ATIVO"
├─ data_criacao
└─ data_inativacao (NULL se ativo)
```

### Blindagem no Backend: Tenant_ID em Tudo

**Regra de Ouro**: Absolutamente **TODAS** as tabelas transacionais possuem `tenant_id` como Foreign Key.

**Exemplo de estrutura**:
```
USUARIO
├─ id (PK)
├─ tenant_id (FK → TENANT) ← OBRIGATÓRIO
├─ email
├─ nome
└─ role

OBRA
├─ id (PK)
├─ tenant_id (FK → TENANT) ← OBRIGATÓRIO
├─ nome_projeto
├─ cidade
└─ cronograma

ORDEM_SERVICO
├─ id (PK)
├─ tenant_id (FK → TENANT) ← OBRIGATÓRIO (NÃO pode vir da tabela OBRA)
├─ obra_id (FK → OBRA)
├─ tipo_trabalho
└─ status

APONTAMENTO
├─ id (PK)
├─ tenant_id (FK → TENANT) ← OBRIGATÓRIO
├─ os_id (FK → ORDEM_SERVICO)
├─ usuario_id (FK → USUARIO)
├─ horas_apontadas
└─ gps_coordenadas
```

### Regra de Consulta (Query): Filtro Obrigatório

**Premissa**: Nenhuma requisição via API pode retornar dados **sem** o filtro `WHERE tenant_id = X`.

**Exemplo de query SEGURA**:
```sql
-- ✅ CORRETO
SELECT * FROM ORDEM_SERVICO
WHERE tenant_id = @current_tenant_id
  AND obra_id = @obra_id;

-- ❌ PERIGOSO (sem tenant_id)
SELECT * FROM ORDEM_SERVICO
WHERE obra_id = @obra_id;
```

**Implementação no Backend (Node.js)**:

```typescript
// Middleware que injeta tenant_id em TODA query
app.use((req, res, next) => {
  const tenantId = req.user.tenant_id; // Extraído do JWT
  
  // Salva em contexto (APD)
  res.locals.tenantId = tenantId;
  next();
});

// Repository Pattern (exemplo)
async function getOrdensPorObra(obraId: string) {
  const tenantId = res.locals.tenantId; // Recupera automaticamente
  
  return db.query(
    `SELECT * FROM ordem_servico 
     WHERE tenant_id = $1 AND obra_id = $2`,
    [tenantId, obraId]
  );
}

// Sem o tenant_id na query → throw error
```

### Garantia de Isolamento: Row-Level Security (RLS)

**Complemento**: PostgreSQL RLS garante que mesmo falhas na app não vazam dados.

```sql
-- Enable RLS na tabela ORDEM_SERVICO
ALTER TABLE ordem_servico ENABLE ROW LEVEL SECURITY;

-- Policy: usuário SÓ vê suas próprias ordens
CREATE POLICY tenant_isolate ON ordem_servico
  FOR SELECT USING (
    tenant_id = current_setting('app.current_tenant')::uuid
  );

-- Policy: usuário SÓ pode inserir na sua empresa
CREATE POLICY tenant_insert ON ordem_servico
  FOR INSERT WITH CHECK (
    tenant_id = current_setting('app.current_tenant')::uuid
  );
```

**Fluxo de Segurança em 3 camadas**:
```
Camada 1: JWT + Middleware
  ↓ Extrai tenant_id do token
  ↓ Injeta em contexto da requisição

Camada 2: Backend Query
  ↓ Repository SEMPRE filtra por tenant_id
  ↓ Se esquecer → code review pega

Camada 3: Database RLS
  ↓ Mesmo que app bug → BD rejeita acesso indevido
  ↓ Defesa em profundidade
```

---

## 🎛️ Flexibilidade Parametrizável (Feature Flags)

### Problema de Negócio

Construtoras variam em **tamanho, maturidade e rigor**:
- 🏢 **Grande**: Precisa de RBAC rígido, assinatura de QC, BOM estrito
- 🏭 **Média**: Quer flexibilidade, menos processos
- 🏪 **Pequena**: Opera informalemente, sem almoxarife

**Solução**: Feature Flags gerenciadas por Admin da Construtora.

### Feature Flags Disponíveis

**1. Qualidade (QHS)**
```
feature_flags.require_qa_sign_on_completion
├─ TRUE: OS só fecha com assinatura Inspetor QC
└─ FALSE: Encarregado fecha direto (risco!)

feature_flags.require_nrl_certification
├─ TRUE: Bloqueia alocação se NR vencida
└─ FALSE: Apenas aviso (flexível)
```

**2. Estoque (Suprimentos)**
```
feature_flags.strict_bom_enforcement
├─ TRUE: Almoxarife não pode exceder BOM (aditivo obrigatório)
└─ FALSE: Permite overconsumo com aviso (construtoras menores)

feature_flags.require_purchase_order
├─ TRUE: Compra só com PO (rigidez financeira)
└─ FALSE: Pode comprar direto (fluxo rápido)
```

**3. Planejamento (Cronograma)**
```
feature_flags.enable_sprints
├─ TRUE: Sistema usa Sprints/Backlog semanal
└─ FALSE: Libera tudo direto pro canteiro (ágil)

feature_flags.freeze_baseline
├─ TRUE: Cronograma é congelado após liberação
└─ FALSE: Permite alterar baseline dinamicamente
```

**4. Apontamento (Operacional)**
```
feature_flags.require_gps_on_apontamento
├─ TRUE: GPS obrigatório em cada apontamento
└─ FALSE: Apontamento offline sem GPS

feature_flags.require_photo_evidence
├─ TRUE: Foto entrada/saída obrigatória
└─ FALSE: Só texto (mais rápido)

feature_flags.allow_partial_completion
├─ TRUE: Permite OS com 60%, 80%, 100%
└─ FALSE: Só aceita 100% ou 0%
```

### Como Configurar (Admin UX)

```
Tela: Configurações > Feature Flags

┌──────────────────────────────────────┐
│ QUALIDADE                            │
├──────────────────────────────────────┤
│ ☑ Exigir assinatura QC               │ ← Toggle
│ ☑ Verificar NR vencidas              │ ← Toggle
│                                      │
│ ESTOQUE                              │
├──────────────────────────────────────┤
│ ☑ BOM estrita (sem overconsumo)      │ ← Toggle
│ ☑ Exigir PO para compra              │ ← Toggle
│                                      │
│ PLANEJAMENTO                         │
├──────────────────────────────────────┤
│ ☑ Usar Sprints semanais              │ ← Toggle
│ ☑ Congelar Baseline                  │ ← Toggle
│                                      │
│ APONTAMENTO                          │
├──────────────────────────────────────┤
│ ☑ GPS obrigatório                    │ ← Toggle
│ ☑ Foto entrada/saída                 │ ← Toggle
│ ☑ Permitir conclusão parcial         │ ← Toggle
│                                      │
│ [  SALVAR  ]  [ CANCELAR ]            │
└──────────────────────────────────────┘
```

### Exemplo Real: Impacto de Feature Flag

**Cenário A: Construtora Grande (Tudo ativado)**
```
OS #1001 - Alvenaria
├─ BOM: 500 tijolos
├─ Consumo: 520 tijolos
├─ Resultado: ❌ BLOQUEIO (strict_bom = TRUE)
├─ Ação: Criar aditivo
└─ Aditivo status: PENDENTE APROVAÇÃO QC
```

**Cenário B: Construtora Pequena (Flexível)**
```
OS #1001 - Alvenaria
├─ BOM: 500 tijolos
├─ Consumo: 520 tijolos
├─ Resultado: ⚠️ AVISO (strict_bom = FALSE)
├─ Ação: Registra consumo direto
└─ Nota: "Overconsumo de 20 un." (para auditoria)
```

---

## 🗄️ Padrão de Isolamento em Banco

### Exemplo DDL (PostgreSQL)

```sql
-- Tabela TENANT (raiz)
CREATE TABLE public.tenant (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_empresa VARCHAR(255) NOT NULL,
  cnpj VARCHAR(20) UNIQUE NOT NULL,
  plano VARCHAR(50) CHECK (plano IN ('STARTER', 'PROFESSIONAL', 'ENTERPRISE')),
  status VARCHAR(20) CHECK (status IN ('ATIVO', 'INATIVO', 'TRIAL')),
  data_criacao TIMESTAMP DEFAULT NOW(),
  data_inativacao TIMESTAMP NULL
);

-- Tabela USUARIO (referencia TENANT)
CREATE TABLE public.usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenant(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  role VARCHAR(50),
  senha_hash VARCHAR(255),
  status VARCHAR(20),
  data_criacao TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, email) -- Não pode repetir email dentro de um tenant
);

-- Tabela OBRA (referencia TENANT + USUARIO)
CREATE TABLE public.obra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenant(id) ON DELETE CASCADE,
  engenheiro_residente_id UUID NOT NULL REFERENCES public.usuario(id),
  nome_projeto VARCHAR(255) NOT NULL,
  cidade VARCHAR(100),
  data_inicio DATE,
  data_fim_previsto DATE,
  data_criacao TIMESTAMP DEFAULT NOW()
);

-- Tabela ORDEM_SERVICO (referencia TENANT em 2 lugares!)
CREATE TABLE public.ordem_servico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenant(id) ON DELETE CASCADE, ← OBRIGATÓRIO
  obra_id UUID NOT NULL REFERENCES public.obra(id),
  tipo_trabalho VARCHAR(50),
  status VARCHAR(20),
  avanço_físico NUMERIC(5,2),
  data_criacao TIMESTAMP DEFAULT NOW(),
  
  -- Constraint: obra_id tem que ser do mesmo tenant_id
  CONSTRAINT fk_obra_tenant CHECK (
    tenant_id = (SELECT tenant_id FROM obra WHERE id = obra_id)
  )
);

-- Índices para performance
CREATE INDEX idx_ordem_servico_tenant ON ordem_servico(tenant_id);
CREATE INDEX idx_ordem_servico_obra ON ordem_servico(obra_id);
CREATE INDEX idx_usuario_tenant ON usuario(tenant_id);
CREATE INDEX idx_obra_tenant ON obra(tenant_id);

-- RLS (Row-Level Security)
ALTER TABLE ordem_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE obra ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuario ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolate_os ON ordem_servico
  FOR SELECT USING (
    tenant_id = current_setting('app.tenant_id')::uuid
  );

CREATE POLICY tenant_isolate_obra ON obra
  FOR SELECT USING (
    tenant_id = current_setting('app.tenant_id')::uuid
  );
```

---

## 🔌 Integração com Feature Flags

### Tabela FEATURE_FLAG

```sql
CREATE TABLE public.feature_flag (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenant(id),
  flag_name VARCHAR(100) NOT NULL,
  is_enabled BOOLEAN DEFAULT FALSE,
  data_criacao TIMESTAMP DEFAULT NOW(),
  UNIQUE(tenant_id, flag_name)
);

-- Exemplos de inserção
INSERT INTO feature_flag (tenant_id, flag_name, is_enabled) VALUES
  ('tenant-a-uuid', 'require_qa_sign_on_completion', true),
  ('tenant-a-uuid', 'strict_bom_enforcement', true),
  ('tenant-a-uuid', 'require_gps_on_apontamento', true),
  ('tenant-b-uuid', 'require_qa_sign_on_completion', false),
  ('tenant-b-uuid', 'strict_bom_enforcement', false),
  ('tenant-b-uuid', 'require_gps_on_apontamento', false);
```

### Como Usar no Backend

```typescript
// Service para consultar Feature Flag
async function isFeatureEnabled(tenantId: string, flagName: string): Promise<boolean> {
  const result = await db.query(
    `SELECT is_enabled FROM feature_flag
     WHERE tenant_id = $1 AND flag_name = $2`,
    [tenantId, flagName]
  );
  return result.rows[0]?.is_enabled ?? false;
}

// Exemplo: Validação de BOM
async function validateBOMConsumption(
  tenantId: string,
  osId: string,
  materialId: string,
  qtdConsumir: number
) {
  const strictBom = await isFeatureEnabled(tenantId, 'strict_bom_enforcement');
  
  const bom = await db.query(
    `SELECT qtd_bom FROM material_consumo
     WHERE os_id = $1 AND material_id = $2`,
    [osId, materialId]
  );
  
  const qtdBom = bom.rows[0].qtd_bom;
  
  if (strictBom && qtdConsumir > qtdBom) {
    throw new Error('BOM excedido. Crie aditivo para continuar.');
  } else if (!strictBom && qtdConsumir > qtdBom) {
    console.warn(`Overconsumo detectado: ${qtdConsumir} > ${qtdBom}`);
    // Permite com aviso
  }
  
  return true;
}
```

---

## 📋 Documentos Relacionados

| Documento | Relação |
|-----------|---------|
| [RN-000 - Regras](RN-000%20-%20Regras%20de%20Negocio%20Consolidadas.md) | Validações que usam tenant_id |
| [30 - Esquema DB](30%20-%20Esquema%20Completo%20do%20Banco%20de%20Dados.md) | DDL completo com tenant_id |
| [20 - RBAC](20%20-%20Perfis%20Governanca%20e%20Controle%20de%20Acesso.md) | Como isolamento impacta permissões |
| [13 - Governança](13%20-%20Governanca%20de%20Materiais%20e%20Pessoas.md) | Usa feature flags em validação |

---

**Versão**: 1.0 - Integrada  
**Data**: 11 de junho de 2026

---

## 🎯 Resumo de Segurança

✅ **Tenant_ID em TODAS as tabelas**  
✅ **Middleware injeta tenant_id em contexto**  
✅ **Repository SEMPRE filtra por tenant_id**  
✅ **Database RLS como 3ª linha de defesa**  
✅ **Feature Flags flexibilizam sem quebrar segurança**  
✅ **Código review obrigatório em queries sensíveis**  

**Resultado**: Construtora A **NUNCA** vê ou altera dados da Construtora B. Garantido em 3 camadas.
