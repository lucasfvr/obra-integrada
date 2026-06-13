---
tags: [ordem-servico, os, workflow, estados, transicoes, business-rules]
---
# 🔄 Ciclo de Vida da Ordem de Serviço (OS)

A Ordem de Serviço (OS) ou "Cartão da Tarefa" é o **Evento Central** do sistema. **Toda movimentação de pessoas, materiais e dinheiro** gravita ao redor de uma OS.

---

## 🎯 O Motor Transacional

A OS é a **unidade atômica** de trabalho que:
- Define **O QUÊ** será feito (escopo, tipo de trabalho)
- Define **QUANTO** custará (orçamento de horas e materiais)
- Define **QUANDO** deve ser feito (datas, sequência)
- **Registra** como foi efetivamente feito (horas reais, consumo real)
- **Gera** custo financeiro quando aprovada

---

## 📊 Máquina de Estados (Status Flow)

### Diagrama de Transição

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  PLANEJADA → LIBERADA → EM EXECUÇÃO → CONCLUÍDA → APROVADA│
│                            ↓                     ↑         │
│                         IMPEDIDA ──────────────────        │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 🔄 Status Detalhados

### 1️⃣ PLANEJADA
**Descrição**: A OS existe no escopo, mas ainda não tem data exata de execução.

**Quando chega**: Criada pelo Planejador no planejamento macro (EAP)

**Campos obrigatórios**:
- ✅ Título / Descrição
- ✅ Tipo de trabalho (Alvenaria, Elétrica, etc.)
- ✅ Fase da obra associada
- ✅ Orçamento (horas previstas, materiais associados)
- ✅ Sequência (ordem lógica)
- ✅ Dependências (outras OSs que devem terminar antes)

**Validações**:
- ❌ Não pode ser iniciada se não estiver `Liberada`
- ❌ Não pode apontar horas neste status
- ❌ Materiais podem estar pendentes

**Quem pode estar aqui**: Planejador, Orçamentista

**Próximo status**: `Liberada` (Engenheiro aprova)

---

### 2️⃣ LIBERADA
**Descrição**: OS pronta para ir a campo nesta semana. Materiais confirmados. Faz parte do Backlog da Sprint.

**Quando chega**: Engenheiro Residente aprova após validar:
- ✅ Materiais em estoque ou chegando nesta semana
- ✅ Mão de obra disponível
- ✅ Equipamentos necessários reservados
- ✅ Pré-requisitos (outras OSs) terminadas

**Campos preenchidos neste status**:
- 📋 Data de início (início da semana da Sprint)
- 📋 Equipe atribuída (Mestre de Obras + Encarregado)
- 📋 Recursos (equipamentos, ferramentas especiais)

**Ações possíveis**:
- 👷 Mestre de Obras vê no Backlog da Sprint
- 👷 Atribui equipe a cada OS
- 👷 Pode reordenar prioridade diariamente

**Validações**:
- ✅ Material disponível (ativa BOM check)
- ✅ Nenhuma OS com dependência não-concluída
- ❌ Não pode ir direto para `Concluída` (deve passar por `Em Execução`)

**Próximo status**: `Em Execução` (Encarregado inicia na obra)

---

### 3️⃣ EM EXECUÇÃO
**Descrição**: Trabalhadores estão fisicamente atuando nela. O relógio está contando horas. Sistema está capturando dados de Apontamentos.

**Quando chega**: Encarregado inicia a OS pela tela móvel "Minhas Tarefas Hoje"

**Evento dispara**:
```json
{
  "evento": "OS_INICIADA",
  "data_inicio": "2026-06-11 08:30:00",
  "coordenadas_gps": { "lat": -23.5505, "lng": -46.6333 },
  "foto_inicio": "url_foto_entrada",
  "encarregado": "João Silva",
  "equipe": ["Pedro", "Maria", "Carlos"]
}
```

**Apontamentos começam**:
- 📱 Tela móvel ativa para registro de horas
- 📱 GPS captura localização (2x: entrada + saída)
- 📱 Foto de entrada da OS
- 📱 Equipamentos sendo utilizados

**Bloqueios de QHS**:
- ❌ Se trabalhador não tem certificação (NR) válida → BLOQUEIO
- ❌ Se equipamento vencido → AVISO (pode continuar com autorização)

**Validações**:
- ✅ Apenas 1 OS por encarregado por dia (múltiplas OSs por dia = split de horas)
- ✅ Não pode exceder total de horas orçadas sem aditivo

**Transições possíveis**:
- → `IMPEDIDA` (imprevisto pausa execução)
- → `CONCLUÍDA` (encarregado marca como pronto ao final do dia)

---

### 4️⃣ IMPEDIDA (Optional)
**Descrição**: A execução parou antes de terminar. Imprevisto bloqueou o progresso.

**Quando chega**: Encarregado marca como `Impedida` durante execução

**Motivos (lista suspensa obrigatória)**:
- 🌧️ Chuva / Condição climática
- 🔧 Quebra de equipamento
- 📦 Falta de material
- 👷 Falta de mão de obra
- 🧹 Limpeza / Preparação
- 📐 Aguardando liberação de outra OS
- 🔍 Inspeção / Verificação
- 📝 Outro (especificar)

**Registro obrigatório**:
- ⏱️ Hora de pausa
- 📝 Observação (descrição do problema)
- 👤 Responsável pela pausa

**O que NÃO faz**:
- ❌ Não finaliza a OS
- ❌ Não descarta as horas apontadas até então
- ❌ Não gera custo ainda

**Efeito no cálculo**:
- ⏸️ Relógio pausa (horas não contam mais)
- ⏸️ A OS fica "suspensa" até resolução

**Transições possíveis**:
- → `EM EXECUÇÃO` (resolve o imprevisto, retoma trabalho)
- → `CONCLUÍDA` (decide abandonar)

**Exemplo real**:
```
Seg 10/06: OS "Alvenaria Bloco A" iniciada 08:00
           Apontadas 4 horas
           14:00 - Falta de tijolos → IMPEDIDA
           
Ter 11/06: Tijolos chegam
           08:00 - Retoma → EM EXECUÇÃO
           12:00 - Termina → CONCLUÍDA
           Total: 8 horas reais (4 + 4)
```

---

### 5️⃣ CONCLUÍDA
**Descrição**: O trabalho físico terminou, mas ainda não foi validado financeiramente.

**Quando chega**: Encarregado marca "Finalizar" na tela móvel

**Evento dispara**:
```json
{
  "evento": "OS_CONCLUIDA",
  "data_conclusao": "2026-06-11 17:30:00",
  "avanço_físico": 100,
  "foto_saida": "url_foto_saida",
  "observacoes": "Tarefa concluída conforme especificado",
  "materiais_consumidos": {
    "tijolos": 500,
    "cimento": 10
  }
}
```

**Preenchimentos obrigatórios**:
- ✅ **Avanço Físico**: Percentual (ex: 100%, 80%, 50%)
- ✅ **Foto de saída**: Comprovação visual
- ✅ **Observações**: Se algo saiu do previsto

**Consumo de Materiais**:
- 📦 Almoxarife registra materiais consumidos
- 📦 Sistema valida contra BOM (Bill of Materials)
- ⚠️ Se exceder BOM → Solicitação de Aditivo
- ⚠️ Se faltar material → Sinaliza para próximas OSs

**Validações automáticas**:
- ✅ Total de horas = soma dos apontamentos
- ✅ Cada apontamento validado (Supervisor/Gerente)
- ✅ Nenhuma hora faltando
- ✅ Materiais não excedem BOM

**Fluxo de Validação** (pode ser multi-nível):
```
Encarregado marca CONCLUÍDA
         ↓
Supervisor valida apontamentos (tela móvel)
         ↓
Gerente aprova (tela web)
         ↓
Status → APROVADA
```

**Transições possíveis**:
- → `APROVADA` (gerente valida e aprova)
- → `RETORNO` (retorna para correção)

---

### 6️⃣ APROVADA
**Descrição**: Horas, consumos e qualidade foram validados. **Os dados viram custo financeiro** no projeto. OS está fechada.

**Quando chega**: Gerente Obra aprova na tela web após análise

**Validações antes de aprovar**:
- ✅ Qualidade OK (Inspetor de Qualidade deu ok, se necessário)
- ✅ Horas batem com apontamentos
- ✅ Consumos batem com estoque
- ✅ Nenhuma observação pendente

**Evento dispara**:
```json
{
  "evento": "OS_APROVADA",
  "data_aprovacao": "2026-06-12 10:00:00",
  "gerente_aprovador": "Silva Gerente",
  "custo_final_mao_obra": 800.00,
  "custo_final_materiais": 1200.00,
  "custo_total": 2000.00,
  "margem_realizada": 0.15
}
```

**Efeito contábil**:
- 💰 Custo de Mão de Obra: Σ (horas_apontadas × taxa_hora_homem)
- 💰 Custo de Materiais: Σ (qtd_consumida × preço_unitário)
- 💰 Custo Total da OS = MO + Materiais
- 📊 Atualiza Curva S (Earned Value)
- 📊 Atualiza Margem Realizada da Obra

**Integrações**:
- 🏦 Dados prontos para Faturamento
- 📈 Contribui para KPIs e Dashboards
- 📋 Audit Log registra tudo

**Transições possíveis**:
- ❌ Nenhuma (é o estado final)

**Reversão (em casos extremos)**:
- Se descobrir erro → Reabrir como `CONCLUÍDA` (com autorização CTO)

---

## 📋 Tabela de Permissões por Status

| Status | Leitura | Edição | Aprovação |
|--------|---------|--------|-----------|
| **PLANEJADA** | Planejador, Eng. Res. | Planejador | Eng. Res. |
| **LIBERADA** | Mestre, Encarregado | Mestre | - |
| **EM EXECUÇÃO** | Supervisor, Gerente | Encarregado | - |
| **IMPEDIDA** | Supervisor, Gerente | Encarregado | - |
| **CONCLUÍDA** | Gerente, Supervisor | Supervisor | Gerente |
| **APROVADA** | Todos (leitura) | - (bloqueado) | - |

---

## 🎯 Documentos Relacionados

| Documento | Relação |
|-----------|---------|
| [11 - Gestão de Tempo](11%20-%20Gestao%20de%20Tempo%20e%20Cronograma.md) | Contexto macro (Sprints, Curva S) |
| [13 - Governança](13%20-%20Governanca%20de%20Materiais%20e%20Pessoas.md) | Materiais BOM e QHS |
| [RN-000 - Regras](RN-000%20-%20Regras%20de%20Negocio%20Consolidadas.md) | Todas as validações |
| [20 - RBAC](20%20-%20Perfis%20Governanca%20e%20Controle%20de%20Acesso.md) | Quem faz cada ação |
| [50 - Especificação de Telas](50%20-%20Especificacao%20Completa%20de%20Telas.md) | Interface para cada status |

---

**Versão**: 1.0 - Integrada  
**Data**: 11 de junho de 2026
