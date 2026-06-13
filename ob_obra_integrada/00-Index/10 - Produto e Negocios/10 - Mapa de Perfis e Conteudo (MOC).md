---
tags: [moc, indice, integracao, consolidado, visao-geral]
---
# ⚙️ MOC: Regras de Negócio, Arquitetura e Fluxos - Obra Integrada

**Documento consolidado que integra toda a lógica de negócio, ciclos de vida, metodologias de gestão e arquitetura técnica da plataforma Obra Integrada.**

O sistema equilibra **flexibilidade no canteiro** com **rigidez financeira e de governança**, funcionando como um hub multi-tenant que atende múltiplas construtoras simultaneamente.

---

## 🗺️ Mapa de Conteúdo (MOC)

```
OBRA INTEGRADA (Sistema)
│
├─ ⏳ DIMENSÃO 1: TEMPO E PLANEJAMENTO
│  └─ [11 - Gestão de Tempo e Cronograma]
│     ├─ Planejamento Macro (EAP, Baseline)
│     ├─ Planejamento Micro (Sprints semanais)
│     ├─ Visão Analítica (Curva S)
│     └─ Máquina de Estados (6 status da OS)
│
├─ 🔄 DIMENSÃO 2: O MOTOR TRANSACIONAL
│  └─ [12 - Ciclo de Vida da Ordem de Serviço (OS)]
│     ├─ Status: PLANEJADA → LIBERADA → EM EXECUÇÃO
│     ├─ Status: CONCLUÍDA → APROVADA
│     ├─ Status Opcional: IMPEDIDA
│     ├─ Fluxo de validações em cada transição
│     └─ Registros de auditoria completos
│
├─ 🧱 DIMENSÃO 3: GOVERNANÇA OPERACIONAL
│  └─ [13 - Governança de Materiais e Pessoas]
│     ├─ Rigidez de Escopo (BOM - Bill of Materials)
│     ├─ Teto de Consumo (não pode exceder sem aditivo)
│     ├─ Aditivos controlados (material, horas, outro)
│     ├─ Governança de Pessoas (Qualificações, NRs)
│     ├─ Bloqueios de Segurança (QHS)
│     └─ Apontamento Parcial (productivity tracking)
│
├─ 🏢 DIMENSÃO 4: ARQUITETURA DE SOFTWARE
│  └─ [14 - Arquitetura SaaS e Isolamento Multi-Tenant]
│     ├─ Tenant_ID obrigatório em TODAS as tabelas
│     ├─ Row-Level Security (RLS) no PostgreSQL
│     ├─ Blindagem de dados entre clientes (3 camadas)
│     ├─ Feature Flags parametrizáveis por construtora
│     └─ Multi-tenant com isolamento garantido
│
├─ 👁️ DIMENSÃO 5: VISÕES, ACESSOS E MODELOS DE NEGÓCIO
│  └─ [12 - Perfis Governança Modulos e Acessos (RBAC)]
│     ├─ 6 Módulos da plataforma
│     │  ├─ Módulo 1: Configurações & Master Data
│     │  ├─ Módulo 2: Visão Executiva & Dashboards
│     │  ├─ Módulo 3: Planejamento & Escopo
│     │  ├─ Módulo 4: Suprimentos & Financeiro
│     │  ├─ Módulo 5: Gestão de Campo & Sprints (Mobile)
│     │  └─ Módulo 6: Qualidade, Saúde & Segurança (QHS)
│     │
│     ├─ 12+ Perfis com permissões granulares
│     │  ├─ Nível SaaS (Super Admin, DevOps, CS)
│     │  └─ Nível Cliente (Admin TI, CEO, Eng.Res., Planejador, etc)
│     │
│     ├─ Matriz RBAC 12 × 6 (perfis × módulos)
│     ├─ Controle granular (Read/Write/Execute)
│     └─ Regra de Transversalidade (Eng.Res. acessa tudo da sua obra)
│
└─ 📋 DIMENSÃO 6: ESPECIFICAÇÕES E PLANEJAMENTO
   ├─ [RN-000 - Regras de Negócio Consolidadas]
   │  └─ 10+ seções com 150+ regras de validação
   │
   ├─ [30 - Esquema Completo do Banco de Dados]
   │  ├─ 14 tabelas relacionais
   │  ├─ 20+ relacionamentos (1:1, 1:N, N:M)
   │  ├─ 30+ índices de performance
   │  ├─ 5+ triggers automáticos
   │  └─ 4+ views para reporting
   │
   ├─ [50 - Especificação Completa de Telas]
   │  ├─ 15+ telas com wireframes ASCII
   │  ├─ 4 dashboards (Super Admin, Admin, Gerente, Operacional)
   │  ├─ Campos, validações e ações por tela
   │  └─ Fluxos de navegação
   │
   ├─ [40 - Execução e Implementação]
   │  ├─ [01 - Fluxo Geral do Projeto] - 9 diagramas de fluxo
   │  ├─ [02 - Cronograma Detalhado] - 26 semanas planejadas
   │  ├─ [03 - Etapas e Fases] - 4 fases com deliverables
   │  ├─ [04 - Marcos, Dependências e Riscos] - 7 milestones
   │  ├─ [05 - Estrutura de Equipes] - 12-15 pessoas com RACI
   │  └─ [06 - Checklist de Implementação] - Validação faseada
   │
   └─ [20 - Índice Completo] - Navegação de toda estrutura
```

---

## 🔗 Interconexões Principais

### Fluxo: Criar e Executar uma Ordem de Serviço

```
1. PLANEJADOR cria OS (Módulo 3)
   ├─ Define escopo
   ├─ Define BOM (Materiais)
   └─ Define horas orçadas
   
   👉 Registra em: ORDEM_SERVICO + MATERIAL_CONSUMO
   👉 Sujeito a: RN-000 (regras de validação)

2. ENGENHEIRO valida e libera (Módulo 3 + 4)
   ├─ Verifica materiais em estoque
   ├─ Congela Baseline
   ├─ Libera Sprints
   └─ Status: LIBERADA
   
   👉 Registra em: ORDEM_SERVICO.status = 'LIBERADA'
   👉 Visível em: Mestre Dashboard (Módulo 5)

3. MESTRE atribui equipes (Módulo 5)
   ├─ Visualiza Backlog da Sprint
   ├─ Atribui Encarregado + Equipe
   └─ Reordena prioridade diariamente
   
   👉 Registra em: APONTAMENTO.atribuição

4. ENCARREGADO executa (Módulo 5 + 6)
   ├─ Inicia OS pela tela móvel
   ├─ Sistema valida NR (QHS)
   ├─ Captura GPS, fotos
   ├─ Registra apontamentos diários
   └─ Pode marcar como IMPEDIDA (imprevisto)
   
   👉 Registra em: APONTAMENTO + VALIDACAO
   👉 Sujeito a: [13 - Governança] (bloqueios QHS, BOM)

5. SUPERVISOR valida (Módulo 5)
   ├─ Revisa apontamentos do Encarregado
   ├─ Aprova ou retorna para correção
   └─ Libera para gerente
   
   👉 Registra em: VALIDACAO.status_supervisor

6. GERENTE aprova e fecha (Módulo 2 + 5)
   ├─ Valida qualidade (se necessário consulta QC)
   ├─ Marca APROVADA
   ├─ Dados viram custo financeiro
   └─ Atualiza Curva S
   
   👉 Registra em: ORDEM_SERVICO.status = 'APROVADA'
   👉 Triggers: Atualiza OBRA.earned_value, custo_final
   👉 Visível em: Dashboard (Módulo 2 - Curva S)
```

### Fluxo: Exceção - Exceder BOM

```
ALMOXARIFE tenta consumir > BOM
   ↓
Sistema bloqueia (Trigger validação)
   ↓
Oferece: Criar ADITIVO
   ↓
ENGENHEIRO recebe notificação
   ↓
Aprova ou nega aditivo
   ↓ SE APROVADO
Novo BOM com quantidade extra
   ↓
ALMOXARIFE libera consumo
   ↓
Custo da OS atualizado
   ↓
Margem reduz (impacto financeiro)
```

### Fluxo: Exceção - NR Vencida

```
MESTRE tenta alocar Encarregado em OS de "Trabalho em Altura"
   ↓
Sistema valida NR-35 (Trigger)
   ↓
NR vencida detectada
   ↓ BLOQUEIO (Feature Flag ativa)
Sistema rejeita alocação
   ↓
Opções:
├─ Alocar outro trabalhador (com NR válida)
├─ Renovar certificação (RH faz)
└─ Override (CTO + documentação - raro)
```

---

## 📊 Dimensões de Controle

| Dimensão | Controla | Sujeito a |
|----------|----------|-----------|
| **1. Tempo** | Quando trabalho ocorre | Sequência, dependências, Sprints |
| **2. Transação (OS)** | Fluxo de trabalho | 6 status rígidos |
| **3. Governança** | Como executar | BOM, Qualificação, Aditivos |
| **4. Arquitetura** | Isolamento de dados | Tenant_ID, RLS, Feature Flags |
| **5. Acessos (RBAC)** | Quem faz o quê | 12 perfis × 6 módulos |
| **6. Especificações** | Como implementar | Telas, DB, APIs, Timeline |

---

## 🎯 Exemplos Integrados

### Caso 1: Gerente quer saber se está atrasado
```
Abre [Módulo 2 - Dashboard Executivo]
   ↓
Visualiza Curva S (Planejado vs. Real)
   ↓
Consulta [11 - Gestão de Tempo] para entender calc
   ↓
Identifica atraso em "Alvenaria"
   ↓
Abre [12 - Ciclo de Vida OS] para ver quais OSs estão IMPEDIDAS
   ↓
Aciona MESTRE para retomar trabalho
```

### Caso 2: Almoxarife recebe tijolos mas BOM diz que só pode 500
```
Tenta dar baixa 520 tijolos
   ↓
Consulta [13 - Governança] regra de BOM
   ↓
Sistema bloqueia (Trigger de [30 - Schema DB])
   ↓
Cria Aditivo (fluxo de [12 - Ciclo de Vida])
   ↓
ENGENHEIRO recebe (notificação por RBAC [12 - RBAC])
   ↓
Aprova aditivo
   ↓
BOM atualizada para 520
   ↓
Almoxarife libera 20 extras
```

### Caso 3: Implementador quer entender arquitetura
```
Lê [14 - Arquitetura SaaS]
   ↓
Entende que Tenant_ID é obrigatório
   ↓
Consulta [30 - Schema DB] para ver DDL
   ↓
Implementa Query: SELECT * FROM ordem_servico WHERE tenant_id = $1
   ↓
Valida com Code Review (RACI em [05 - Equipes])
   ↓
Deploy com CI/CD (descrito em [02 - Cronograma])
```

---

## 📋 Documentos por Tipo

### 📌 Documentos de Negócio (Por quê?)
- [RN-000 - Regras de Negócio] - Todas as regras que regem o sistema
- [11 - Gestão de Tempo] - Filosofia de planejamento
- [12 - Ciclo de Vida OS] - Fluxo de uma tarefa
- [13 - Governança] - Bloqueios e controles operacionais

### 📌 Documentos de Governança (Quem faz o quê?)
- [12 - RBAC Módulos e Acessos] - Matriz de permissões
- [05 - Estrutura de Equipes] - Organização do time
- [04 - Marcos e Riscos] - Responsabilidades e gates

### 📌 Documentos Técnicos (Como fazer?)
- [14 - Arquitetura SaaS] - Padrão de isolamento multi-tenant
- [30 - Schema DB] - DDL completo e triggers
- [50 - Especificação Telas] - UI/UX de cada módulo
- [06 - Checklist Implementação] - Validação técnica

### 📌 Documentos de Execução (Plano?)
- [01 - Fluxo Geral] - Diagramas de processo
- [02 - Cronograma] - Timeline 6 meses
- [03 - Etapas e Fases] - Deliverables por semana

---

## ✅ Validação de Completude

| Aspecto | Documento | Status |
|---------|-----------|--------|
| **Negócio** | RN-000 + 11/12/13 | ✅ Completo |
| **Governança** | 12 (RBAC) + 04/05 | ✅ Completo |
| **Arquitetura** | 14 + 30 | ✅ Completo |
| **UI/UX** | 50 | ✅ Completo |
| **Planejamento** | 01/02/03/04 | ✅ Completo |
| **Implementação** | 06 + 02 (Cronograma) | ✅ Completo |

---

## 🚀 Próximas Etapas

1. **Validação com Stakeholders**
   - Revisar com Sócios (negócio)
   - Revisar com Construtoras Piloto (usabilidade)
   - Revisar com DevOps (infraestrutura)

2. **Refinement**
   - Ajustar timeline conforme feedback
   - Validar EAPs com especialistas
   - Detalhamento de integrações externas

3. **Iniciação de Execução**
   - Contratar CTO + Tech Lead
   - Provisionar AWS
   - Iniciar Sprint 1 (semana 1)

---

**Versão**: 1.0 - Integrada  
**Data**: 11 de junho de 2026  
**Status**: ✅ Pronto para Execução

**Nota**: Este MOC serve como guia de navegação. Cada documento referenciado é independente mas interconectado, formando uma visão 360° do sistema.
