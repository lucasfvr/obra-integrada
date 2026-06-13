---
tags: [rbac, permissoes, modulos, visoes, acessos, roles, governanca]
---
# 👁️ Visões, Acessos e Módulos (RBAC)

Definição completa da **Matriz de Controle de Acesso** mapeando quais **módulos, telas e funções** cada perfil pode **visualizar (Read)**, **editar (Write)** ou **aprovar (Execute)**.

---

## 🏗️ Estrutura de Módulos

O sistema Obra Integrada é dividido em **6 módulos lógicos**:

```
┌─────────────────────────────────────────────────────┐
│ MÓDULO 1: Configurações & Master Data               │
│ (Painel de controle interno da empresa)             │
├─────────────────────────────────────────────────────┤
│ MÓDULO 2: Visão Executiva & Dashboards              │
│ (BI, Business Intelligence, Curva S)                │
├─────────────────────────────────────────────────────┤
│ MÓDULO 3: Planejamento & Escopo                     │
│ (Fábrica de OS, Baseline, Cronograma)              │
├─────────────────────────────────────────────────────┤
│ MÓDULO 4: Suprimentos & Financeiro                  │
│ (Compras, Contas a Pagar, Orçamento)               │
├─────────────────────────────────────────────────────┤
│ MÓDULO 5: Gestão de Campo & Sprints (Mobile/Tablet)│
│ (Coração operacional, tarefas, apontamentos)       │
├─────────────────────────────────────────────────────┤
│ MÓDULO 6: Qualidade, Saúde & Segurança (QHS)       │
│ (Conformidade, certificações, bloqueios)           │
└─────────────────────────────────────────────────────┘
```

---

## 👤 Perfis na Plataforma

### Nível SaaS (Obra Integrada - Empresa)
1. **Super Admin** (Plataforma)
2. **DevOps** (Infraestrutura)
3. **Customer Success** (Onboarding)

### Nível Cliente (Construtora)
4. **Admin da Construtora (TI)**
5. **Diretor/Sócio (Executivo)**
6. **Gerente Técnico (Engenheiro Residente)**
7. **Planejador/Orçamentista**
8. **Mestre de Obras (Supervisor Canteiro)**
9. **Encarregado (Operacional)**
10. **Almoxarife (Suprimentos)**
11. **Inspetor de Qualidade (QC)**
12. **Técnico de Segurança (SST)**

---

## 📊 MÓDULO 1: Configurações e Master Data

*O painel de controle interno da empresa. Telas de parametrização de sistema.*

### Telas Neste Módulo:
- Cadastro de Usuários
- Definição de Permissões/Papéis
- Cadastro de Feriados
- Cadastro de Turnos
- Cadastro de Ofícios/Profissões
- Feature Flags (ativar/desativar funcionalidades)
- Integração com sistemas externos

### Matriz de Acesso

| Perfil | Read | Write | Execute |
|--------|------|-------|---------|
| **Admin da Construtora (TI)** | ✅ TOTAL | ✅ TOTAL | ✅ TOTAL |
| **Diretor/Sócio** | ✅ Leitura | ❌ | ❌ |
| **RH/Departamento Pessoal** | ⚠️ Parcial | ⚠️ Parcial | ❌ |
| **Gerente Técnico** | ❌ | ❌ | ❌ |
| **Planejador** | ❌ | ❌ | ❌ |
| **Mestre de Obras** | ❌ | ❌ | ❌ |
| **Encarregado** | ❌ | ❌ | ❌ |

**Regra**: Apenas **Admin TI** pode criar/editar usuários e permissões. **RH** tem acesso restrito ao "Cadastro de Trabalhadores" e "Taxas de Hora-Homem".

---

## 📊 MÓDULO 2: Visão Executiva e Dashboards (C-Level)

*Telas focadas em Business Intelligence (BI), cruzamento de dados e Curva S global.*

### Telas Neste Módulo:
- Dashboard Executivo (Margem, Fluxo de Caixa, KPIs)
- Curva S Global (todas as obras)
- Análise de Produtividade
- Relatórios Financeiros
- Curva S por Obra (drill-down)
- Índices de Segurança

### Matriz de Acesso

| Perfil | Visualiza | Edita | Aprova |
|--------|-----------|-------|--------|
| **Sócio-Proprietário/CEO** | ✅ TODAS obras (Financial) | ❌ | ❌ |
| **Diretor de Engenharia** | ✅ TODAS obras (Produtividade + Segurança) | ❌ | ❌ |
| **Gerente Técnico (Eng. Res.)** | ✅ SUA OBRA APENAS | ❌ | ❌ |
| **Planejador** | ⚠️ Parcial (seu escopo) | ❌ | ❌ |
| **Mestre de Obras** | ⚠️ Parcial (seu dia) | ❌ | ❌ |
| **Demais** | ❌ | ❌ | ❌ |

**Regra de Transversalidade**: O **Engenheiro Residente** é o único perfil tático que tem acesso de leitura a **todos os módulos** da sua respectiva obra, sendo o elo entre os custos aprovados e os Dashboards.

---

## 📋 MÓDULO 3: Planejamento e Escopo (A "Fábrica" de OS)

*Onde nasce a linha de base, o orçamento e os cronogramas (Gantt).*

### Telas Neste Módulo:
- Linha de Base (Baseline) - Cronograma oficial congelado
- Orçamento Inicial (Budget)
- Cronograma Gantt Dinâmico
- Geração de Sprints/Backlog
- Aditivos de Escopo
- Matriz de Sequência/Dependências

### Matriz de Acesso

| Perfil | Visualiza | Edita | Aprova |
|--------|-----------|-------|--------|
| **Orçamentista** | ✅ | ✅ (Baseline, Orçamento) | ❌ |
| **Planejador/Programador** | ✅ | ✅ (Cronograma, Gera Sprints, Status Planejada) | ❌ |
| **Gerente Técnico (Eng. Res.)** | ✅ | ❌ | ✅ (Congela Baseline, Libera Sprints) |
| **Mestre de Obras** | ✅ (Backlog) | ❌ | ❌ |
| **Demais** | ❌ | ❌ | ❌ |

**Regra**: **Mestre de Obras NÃO altera escopo oficial**. Apenas realoca prioridades dentro da Sprint já liberada.

---

## 💰 MÓDULO 4: Suprimentos e Financeiro

*Onde o dinheiro e o material são negociados.*

### Telas Neste Módulo:
- Catálogo de Materiais
- Pedidos de Compra (PO)
- Requisições de Material
- Recebimento de Notas Fiscais (NF)
- Contas a Pagar (AP)
- Análise de Margem

### Matriz de Acesso

| Perfil | Visualiza | Edita | Aprova |
|--------|-----------|-------|--------|
| **Comprador** | ✅ | ✅ (Cria PO) | ❌ |
| **Financeiro** | ✅ | ✅ (Contas a Pagar) | ✅ (Matching NF) |
| **Gerente de Contratos** | ✅ | ❌ | ✅ (Compras > limite) |
| **Almoxarife** | ⚠️ Parcial (estoque) | ⚠️ (Recebimento) | ❌ |
| **Gerente Técnico** | ✅ | ❌ | ❌ |
| **Demais** | ❌ | ❌ | ❌ |

**Regra**: **Matching obrigatório** entre PO → NF → Recebimento antes de liberar pagamento.

---

## 🏗️ MÓDULO 5: Gestão de Campo e Sprints (Mobile / Tablet)

*O coração operacional. Telas simples, botões grandes.*

### Telas Neste Módulo:
- **Mestre Dashboard**: Backlog da Sprint, atribuição de equipes
- **Minhas Tarefas Hoje**: Lista de OSs para a equipe
- **Apontamento de Horas**: Registro de tempo, GPS, fotos
- **Avanço Físico**: Percentual de conclusão técnica
- **Módulo de Estoque**: Entrada/saída de materiais
- **Validação de Apontamento**: Supervisor valida horas
- **Checklists de Execução**: Verificação de qualidade na prática

### Matriz de Acesso

| Perfil | Visualiza | Edita | Aprova |
|--------|-----------|-------|--------|
| **Mestre de Obras** | ✅ (Backlog Sprint) | ✅ (Atribui OS a equipes) | ❌ |
| **Encarregado** | ✅ (Minhas Tarefas) | ✅ (Apontamento, Status, Consumo) | ❌ |
| **Analista de Medição** | ✅ (Avanço Físico) | ✅ (% conclusão) | ❌ |
| **Almoxarife** | ✅ (Estoque) | ✅ (Entrada/Saída) | ❌ |
| **Supervisor** | ✅ (Apontamentos) | ❌ | ✅ (Valida horas) |
| **Gerente Técnico** | ✅ | ❌ | ✅ (Aprova finalizações) |

**Regra**: Este é o módulo **mais crítico e operacional**. Encarregado PODE realizar mudanças rápidas (reordenar, pausar). Validação acontece em 2 níveis (Supervisor + Gerente).

---

## 🛡️ MÓDULO 6: Qualidade, Saúde e Segurança (QHS)

*Focado em conformidade, bloqueios preventivos e auditoria técnica.*

### Telas Neste Módulo:
- Certificações e NRs (datas de validade)
- Checklists de Liberação
- Relatórios de Não-Conformidade
- Registros de Incidentes
- Liberação Geométrica (Topografia)
- Dashboard de Segurança (Indices)

### Matriz de Acesso

| Perfil | Visualiza | Edita | Aprova |
|--------|-----------|-------|--------|
| **Técnico de Segurança (SST)** | ✅ | ✅ (Certificações NRs) | ❌ |
| **Inspetor de Qualidade (QC)** | ✅ | ✅ (Checklists) | ✅ (Libera OS Concluída → Qualidade) |
| **Topógrafo** | ✅ (Geometria) | ✅ | ✅ (Aprova liberação geométrica) |
| **Gerente Técnico** | ✅ | ❌ | ❌ |
| **Encarregado** | ⚠️ Parcial | ❌ | ❌ |

**Regra**: **Sistema bloqueia automaticamente** alocação de trabalhador em OS com risco se NR vencer. Apenas **QC** pode mover OS de "Executada" para "Concluída com Qualidade".

---

## 📋 Resumo de Permissões por Função

### Leitura (Read)
```
Super Admin (Plataforma): ✅ TODOS os dados da plataforma
CEO/Sócio: ✅ Dashboards de todas as obras (executivo)
Eng. Residente: ✅ TODOS os módulos de SUA obra
Planejador: ✅ Cronograma, Sprints, Orçamento
Mestre de Obras: ✅ Backlog, Tarefas hoje, Estoque
Encarregado: ✅ Minhas tarefas apenas
Almoxarife: ✅ Estoque e requisições
QC: ✅ Checklists, Não-conformidades
SST: ✅ Certificações, Incidentes
```

### Escrita (Write)
```
Admin TI: ✅ TUDO (Usuários, permissões, features)
Orçamentista: ✅ Baseline, Orçamento
Planejador: ✅ Cronograma, Gera Sprints
Mestre de Obras: ✅ Atribui equipes, reordena prioridades
Encarregado: ✅ Apontamentos, Status, Consumo materiais
Almoxarife: ✅ Entrada/Saída estoque
QC: ✅ Checklists, Não-conformidades
SST: ✅ Certificações
Comprador: ✅ Pedidos de compra
Financeiro: ✅ Contas a pagar
```

### Aprovação (Execute)
```
Eng. Residente: ✅ Congela Baseline, Libera Sprints, Aprova OS
Gerente Contratos: ✅ Compras acima do limite
Financeiro: ✅ Matching NF/PO/Recebimento
Supervisor: ✅ Valida apontamentos
QC: ✅ Libera OS após qualidade
Topógrafo: ✅ Aprovação geométrica
```

---

## 🔄 Fluxo de Aprovação Exemplo: Finalizar OS

```
Encarregado marca CONCLUÍDA
    ↓ (Módulo 5)
Supervisor valida horas (Módulo 5)
    ↓
Gerente aprova em web (Módulo 5)
    ↓
QC verifica qualidade (Módulo 6)
    ↓ SE OK
Gerente marca APROVADA (Módulo 2)
    ↓
Dashboard atualiza (Módulo 2)
    ↓
Custo finalizado
```

---

## 🚫 Bloqueios de Segurança

### Por Tenant_ID
- ✅ Construtora A NUNCA vê dados de Construtora B
- ✅ Filtro `WHERE tenant_id = X` obrigatório em TODAS as queries

### Por Perfil
- ❌ Encarregado NÃO pode criar Ordem de Serviço
- ❌ Mestre de Obras NÃO pode alterar Baseline
- ❌ Almoxarife NÃO pode exceder BOM (sem aditivo)
- ❌ QC NÃO pode liberar OS sem validação

### Por Feature Flag
- ⚠️ Construtora pode desativar "Exigir QC" (config)
- ⚠️ Construtora pode desativar "Bloquear NR vencida" (config)
- ⚠️ Construtora pode desativar "BOM rígida" (config)

---

## 📋 Documentos Relacionados

| Documento | Relação |
|-----------|---------|
| [RN-000 - Regras](RN-000%20-%20Regras%20de%20Negocio%20Consolidadas.md) | Validações por perfil |
| [12 - Ciclo de Vida OS](12%20-%20Ciclo%20de%20Vida%20da%20Ordem%20de%20Servico.md) | Quem faz cada transição |
| [13 - Governança](13%20-%20Governanca%20de%20Materiais%20e%20Pessoas.md) | Bloqueios técnicos |
| [14 - Arquitetura SaaS](14%20-%20Arquitetura%20SaaS%20e%20Isolamento%20Multi-Tenant.md) | Isolamento tenant_id |
| [50 - Especificação Telas](50%20-%20Especificacao%20Completa%20de%20Telas.md) | UI por perfil |

---

**Versão**: 1.0 - Integrada com 6 Módulos  
**Data**: 11 de junho de 2026
