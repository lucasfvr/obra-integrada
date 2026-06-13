---
tags: [governanca, materiais, pessoas, bom, qhs, aditivos, qualificacao]
---
# 🧱 Governança de Materiais e Pessoas

Enquanto o sequenciamento de tempo é **flexível no canteiro**, os **custos e a segurança ocupacional** são tratados com **rigidez pelas regras de validação do backend**.

---

## 1️⃣ Rigidez de Escopo e Estoque (BOM)

### Bill of Materials (BOM)
Cada Ordem de Serviço nasce com uma estrutura de materiais predefinida:

**Estrutura BOM na OS**:
```
OS #1234 - Alvenaria Bloco A
├─ Tijolos: 500 unidades (@ R$ 1.20)
├─ Cimento: 10 sacos (@ R$ 30.00)
├─ Areia: 2 m³ (@ R$ 50.00)
├─ Cal: 5 sacos (@ R$ 25.00)
└─ Massa: 10 sacos (@ R$ 40.00)
   TOTAL MATERIAL ORÇADO: R$ 1.850,00
```

### Teto de Consumo (Ceiling)
A regra mais rígida do sistema:

**❌ O QUE NÃO PODE**: Almoxarife **não pode** dar baixa em quantidade MAIOR que a BOM

**✅ Exemplo válido**:
```
BOM: 500 tijolos
Consumo real: 480 tijolos ✅ (OK, abaixo do teto)
```

**❌ Exemplo BLOQUEADO**:
```
BOM: 500 tijolos
Consumo real: 520 tijolos ❌ (BLOQUEIO - Excede BOM)
Mensagem: "Material excede Bill of Materials. Solicite Aditivo."
```

### Fluxo de Exceção: Solicitação de Aditivo

Quando o consumo **inevitavelmente excede** a BOM:

```
┌──────────────────────────────────────────┐
│ Almoxarife tenta dar baixa 520 tijolos   │
│ (BOM = 500)                             │
└──────────────────┬───────────────────────┘
                   ↓ BLOQUEIO NO SISTEMA
┌──────────────────────────────────────────┐
│ Sistema rejeita e oferece opção:         │
│ "Criar Solicitação de Aditivo"           │
└──────────────────┬───────────────────────┘
                   ↓
┌──────────────────────────────────────────┐
│ Solicitação de Aditivo criada            │
│ - Motivo: Consumo excedido               │
│ - Quantidade extra: 20 tijolos           │
│ - Custo extra: R$ 24.00                  │
│ - Status: PENDENTE APROVAÇÃO             │
└──────────────────┬───────────────────────┘
                   ↓
┌──────────────────────────────────────────┐
│ Engenheiro Residente recebe notificação  │
│ - Aprova ✅ ou Nega ❌                    │
└──────────────────┬───────────────────────┘
                   ↓ SE APROVADO
┌──────────────────────────────────────────┐
│ BOM atualizada:                          │
│ - Novo teto: 520 tijolos                 │
│ - Novo custo: R$ 1.874,00                │
│ - Almoxarife pode liberar os 20 extras   │
└──────────────────────────────────────────┘
```

**Impacto**:
- 💰 Atualiza custo da OS
- 📊 Reduz margem realizada
- 📋 Gera Audit Log completo
- 🔔 Notifica Gerente Obra

### Flexibilidade Controlada
Embora rígida, a BOM permite:
- ✅ **Rolar para próxima OS**: Materiais não usados podem transferir para OS sequencial (com autorização)
- ✅ **Devolver ao estoque**: Aproveitar para compras futuras
- ✅ **Histórico**: Banco de dados registra tudo

---

## 2️⃣ Governança de Pessoas e Segurança (QHS)

### Bloqueio de Qualificação (NR - Norma Regulamentadora)

O sistema **impede alocação** de trabalhador em OS de risco se não tiver certificação válida.

**Tabela de Certificações**:
```
Trabalhador: Carlos Silva
├─ NR-18 (Canteiro): Válido até 30/12/2026 ✅
├─ NR-35 (Trabalho em Altura): Vencido em 30/03/2026 ❌
├─ NR-34 (Mergulho): Não aplica
└─ NR-15 (Insalubridade): Válido até 15/08/2027 ✅
```

**Validação no Sistema**:

```
┌─────────────────────────────────┐
│ Mestre tenta alocar Carlos em:  │
│ "OS #5678 - Trabalho em Altura" │
└────────────┬────────────────────┘
             ↓
┌─────────────────────────────────┐
│ Sistema verifica NR-35:         │
│ Vencida em 30/03/2026           │
└────────────┬────────────────────┘
             ↓
     ❌ BLOQUEIO DO SISTEMA
┌─────────────────────────────────┐
│ Mensagem: "Trabalhador não tem  │
│ NR-35 válida. Certificação      │
│ vencida em 30/03/2026."         │
│                                 │
│ Ações:                          │
│ 1. Alocar outro trabalhador     │
│ 2. Renovar certificação (RH)    │
│ 3. Override (CTO + Doc)         │
└─────────────────────────────────┘
```

**Regra por tipo de trabalho**:

| Tipo de OS | NR Obrigatória | Bloqueio |
|-----------|----------------|---------|
| Trabalho em Altura | NR-35 | ❌ Rígido |
| Espaço Confinado | NR-33 | ❌ Rígido |
| Equipamentos Pesados | NR-12 | ⚠️ Aviso |
| Elétrica | NR-10 | ❌ Rígido |
| Canteiro Geral | NR-18 | ⚠️ Aviso |

### Apontamento Parcial (Productivity Tracking)

O sistema permite finalizar OS com **progresso < 100%**:

**Cenário Real**:
```
Terça-feira, 10 de junho

Encarregado iniciou "Alvenaria Bloco A"
Planejava: 100% (8 horas)
Executou: 65% (levanta paredes até 2º andar)
Impedido: Falta de tijolos

Apontamento:
├─ Avanço Físico: 65%
├─ Horas: 8 horas (todas contadas)
├─ Status: CONCLUÍDA com parcial
└─ Observação: Falta de tijolos bloqueia 35% restante
```

**Próximo dia**:
```
Quarta-feira, 11 de junho

Tijolos chegam
Cria nova OS "Alvenaria Bloco A - Continuação" (35% restante)
├─ Escopo: Terminar os 35% (acabamento + argamassa)
├─ Horas orçadas: 3 horas (35% de 8)
├─ BOM ajustada: 175 tijolos (35% de 500)
└─ Realizada como nova OS independente
```

**Benefício**:
- 📊 Produtividade real é medida diariamente
- 📊 Atrasos não acumulam artificialmente
- 📊 Gerente enxerga exatamente onde está o problema
- 💰 Custos refletem esforço real

### Exemplo Completo: Fluxo de Apontamento Parcial

```
SEGUNDA (10/06):
┌──────────────────────────────────────────┐
│ OS #1001 - Alvenaria Bloco A             │
│ Orçado: 500 tijolos, 8 horas, R$ 800    │
│ Status: LIBERADA                         │
└──────────────────────────────────────────┘
         ↓ Encarregado inicia 08:00
┌──────────────────────────────────────────┐
│ Status: EM EXECUÇÃO                      │
│ Tempo: 08:00 - 16:00 (8 horas)          │
│ Progresso: 65% (2º andar + meio)        │
│ Motivo parada: Falta de tijolos         │
└──────────────────────────────────────────┘
         ↓ Encarregado marca CONCLUÍDA 16:00
┌──────────────────────────────────────────┐
│ Status: CONCLUÍDA (parcial)              │
│ Avanço Físico: 65%                      │
│ Horas realizado: 8 (conta tudo)         │
│ Consumo efetivo: 325 tijolos (65%)      │
│ Custo realizado: R$ 800 (conta tudo)    │
└──────────────────────────────────────────┘
         ↓ Supervisor + Gerente validam
┌──────────────────────────────────────────┐
│ Status: APROVADA                         │
│ Custo fixado em: R$ 800                 │
│ Contribui para Curva S em: 65%          │
└──────────────────────────────────────────┘

TERÇA (11/06):
┌──────────────────────────────────────────┐
│ Tijolos chegaram!                        │
│ Planejador cria:                         │
│ OS #1002 - Alvenaria Bloco A (35%)      │
│ Orçado: 175 tijolos, 3 horas, R$ 300   │
│ Status: PLANEJADA → LIBERADA            │
└──────────────────────────────────────────┘
```

---

## 3️⃣ Integração com Banco de Dados

### Tabelas Envolvidas

```
┌─────────────────────┐
│   ORDEM_SERVICO     │
├─────────────────────┤
│ id (PK)             │
│ obra_id (FK)        │
│ status              │ ← CONCLUÍDA, APROVADA, etc
│ avanço_físico       │ ← Percentual (65%, 100%)
│ data_inicio         │
│ data_conclusao      │
└─────────────────────┘
        ↓ 1:N
┌─────────────────────┐
│   MATERIAL_CONSUMO  │
├─────────────────────┤
│ id (PK)             │
│ os_id (FK)          │
│ material_id (FK)    │
│ qtd_consumida       │
│ qtd_bom             │
│ data_consumo        │
└─────────────────────┘
        ↓ 1:N
┌─────────────────────┐
│   ADITIVO           │
├─────────────────────┤
│ id (PK)             │
│ os_id (FK)          │
│ tipo                │ ← material, horas, outro
│ qtd_extra           │
│ status              │ ← PENDENTE, APROVADO
│ aprovador_id (FK)   │
│ data_aprovacao      │
└─────────────────────┘
        ↓ 1:N
┌──────────────────────┐
│   CERTIFICACAO       │
├──────────────────────┤
│ id (PK)              │
│ usuario_id (FK)      │
│ nr_numero            │ ← NR-35, NR-18, etc
│ data_vencimento      │
│ status               │ ← VÁLIDA, VENCIDA
│ arquivo_certificado  │
└──────────────────────┘
```

### Triggers Automáticos

**Trigger 1: Validar BOM ao consumir**
```sql
BEFORE INSERT ON MATERIAL_CONSUMO
  IF qtd_consumida > qtd_bom THEN
    INSERT INTO ADITIVO (pendente)
    RAISE ERROR "BOM excedido"
  END IF
```

**Trigger 2: Atualizar Curva S ao aprovar**
```sql
AFTER UPDATE ORDEM_SERVICO (status = 'APROVADA')
  UPDATE OBRA SET
    earned_value = earned_value + (avanço_físico * valor_or)
    custo_mao_obra = custo_mao_obra + custo_real
    custo_materiais = custo_materiais + consumo_valor
```

**Trigger 3: Verificar NR antes de alocar**
```sql
BEFORE INSERT ON APONTAMENTO
  SELECT * FROM CERTIFICACAO
  WHERE usuario_id = @user
    AND nr_numero = (SELECT nr_obrigatoria FROM ORDEM_SERVICO)
    AND data_vencimento >= NOW()
  IF NOT FOUND THEN
    RAISE ERROR "Certificação faltando"
  END IF
```

---

## 4️⃣ Documentos Relacionados

| Documento | Relação |
|-----------|---------|
| [12 - Ciclo de Vida da OS](12%20-%20Ciclo%20de%20Vida%20da%20Ordem%20de%20Servico.md) | Estados e transições |
| [11 - Gestão de Tempo](11%20-%20Gestao%20de%20Tempo%20e%20Cronograma.md) | Contexto Sprints |
| [RN-000 - Regras](RN-000%20-%20Regras%20de%20Negocio%20Consolidadas.md) | Todas as validações |
| [20 - RBAC](20%20-%20Perfis%20Governanca%20e%20Controle%20de%20Acesso.md) | Quem aprova aditivos |
| [30 - Esquema DB](30%20-%20Esquema%20Completo%20do%20Banco%20de%20Dados.md) | DDL tabelas |

---

**Versão**: 1.0 - Integrada  
**Data**: 11 de junho de 2026
