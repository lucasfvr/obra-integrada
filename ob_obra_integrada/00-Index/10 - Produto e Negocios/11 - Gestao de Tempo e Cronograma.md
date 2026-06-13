---
tags: [cronograma, planejamento, sprint, gantt, curva-s, tempo]
---
# ⏳ Gestão de Tempo e Cronograma

O sistema Obra Integrada une a metodologia **preditiva (Tradicional)** com a metodologia **adaptativa (Ágil/Scrum)** para gerenciar o andamento da construção com flexibilidade no canteiro e controle rigoroso nos custos.

---

## 1️⃣ Planejamento Macro (Longo Prazo)

### EAP - Estrutura Analítica do Projeto
A quebra lógica da obra em **Fases** (grandes deliverables):
- **Exemplos**: Fundação, Superestrutura, Alvenaria, Acabamento, Entrega
- Cada fase tem data de **início** e **término** estimadas
- Cada fase agrupa múltiplas Ordens de Serviço (OS)
- No banco de dados: Tabela `OBRA` com fases associadas

### Linha de Base (Baseline)
O **cronograma contratual original**:
- É "congelado" no banco de dados e **não pode ser alterado** após aprovação
- Serve como parâmetro oficial de comparação
- Usado para calcular **desvio de prazo** (real vs. planejado)
- Quem define: **Planejador / Orçamentista** (Engenheiro de Planejamento)
- Quem aprova: **Engenheiro Residente** (congela a baseline)

### Gráfico de Gantt Dinâmico
Visualização das Fases no frontend:
- Mostra a sequência de atividades
- **Recalcula dinamicamente** a data de término com base no atraso/adiantamento das tarefas do canteiro
- Exibe caminho crítico
- Permite visualizar: Planejado (Baseline) vs. Realizado (Actual)
- Filtros: por fase, por recurso, por criticidade

---

## 2️⃣ Planejamento Micro (Curto Prazo / Execução)

### Sprint da Obra (Programação Semanal)
O **recorte curto** do trabalho a executar:
- Horizonte: **7 a 14 dias** (tipicamente 1 semana)
- Engloba: Seleção de OSs que devem ser executadas neste período
- Liberadas pelo **Engenheiro Residente** no final da semana anterior
- Requer: Confirmação de materiais, mão de obra e equipamentos disponíveis
- Status: Uma OS deve estar `Liberada` para ser incluída no Backlog da Sprint

### Backlog da Sprint
Visualização operacional no canteiro:
- **Tela móvel primária**: Exibe todas as OSs da semana em ordem de execução
- **Permissão**: Mestre de Obras atribui equipes a cada OS
- **Estrutura**: Lista com cards (OS number, descrição, horas previstas, equipe)
- **Funcionalidade**: Drag-and-drop para reordenar prioridades

### Flexibilidade Diária (Autonomia Operacional)
O Mestre de Obras tem autonomia para:
- **Reordenar** a fila diária sem aprovação formal
- **Pausar** uma OS se houver imprevisto (chuva, quebra, falta de material) → status `Impedida`
- **Rolar** tarefas para o dia seguinte se não forem 100% concluídas
- **Justificar** mudanças via campo de observação no Apontamento
- **Não pode**: Alterar a Baseline ou adicionar escopo sem aprovação formal

---

## 3️⃣ Visão Analítica (Dashboard Executivo)

### Curva S (Earned Value Management)
O **principal indicador executivo** de progresso:

**Eixo X**: Tempo (semanas/meses)  
**Eixo Y**: Progresso (% concluído ou valor)

**Três linhas no gráfico:**
1. **Linha Base (Planejado)**: Curva teórica de progresso conforme cronograma original
2. **Curva Real (Realizado)**: Progresso efetivo baseado em OSs aprovadas
3. **Forecast (Projeção)**: Extrapolação futura de quando o projeto terminará

**Cálculo do Avanço Real:**
```
Avanço Real (%) = (Σ Horas Apontadas + Validadas) / (Σ Horas Orçadas)
```

Ou em valor:
```
Earned Value = (% Concluído × Orçamento Total da Fase)
```

**Interpretações:**
- Curva Real **acima** da Baseline → Projeto adiantado
- Curva Real **abaixo** da Baseline → Projeto atrasado
- Forecast cruzando linha final **antes** da data → Conclusão antecipada
- Forecast cruzando linha final **depois** da data → Atraso projetado

### Indicadores KPI Derivados

**1. Schedule Performance Index (SPI)**
```
SPI = Earned Value / Planned Value
- SPI > 1.0 = adiantado
- SPI = 1.0 = no prazo
- SPI < 1.0 = atrasado
```

**2. Previsão de Conclusão**
```
Data Estimada = Data Original + [(Data Original - Data Hoje) × (1 - SPI)]
```

**3. Margem de Atraso (Slack)**
```
Slack = Data Baseline - Data Forecast
- Positivo = margem de segurança
- Negativo = atraso já confirmado
```

---

## 4️⃣ Máquina de Estados (Ciclo de Vida da OS)

A OS transita por **6 status** rígidos:

```
┌─────────────┐
│  PLANEJADA  │ (Existe no escopo, sem data exata)
└──────┬──────┘
       │ (Engenheiro libera materiais)
┌──────▼──────────┐
│   LIBERADA      │ (No Backlog da Sprint, pronta para canteiro)
└──────┬──────────┘
       │ (Encarregado inicia)
┌──────▼──────────┐
│  EM EXECUÇÃO    │ (Trabalhadores atuando, contando horas)
└──────┬──────────┘
       │ (Opcional: imprevisto)
┌──────▼──────────┐
│   IMPEDIDA*     │ (Pausa: clima, quebra, falta material)
└──────┬──────────┘
       │ (Retoma quando resolvido)
┌──────▼──────────┐
│   CONCLUÍDA     │ (Trabalho físico terminou, avanço físico registrado)
└──────┬──────────┘
       │ (Engenheiro valida horas/consumos)
┌──────▼──────────┐
│   APROVADA      │ (Dados viram custo financeiro, OS fechada)
└─────────────────┘

* Status IMPEDIDA é opcional conforme Feature Flag da construtora
```

---

## 5️⃣ Documentos Relacionados

| Documento | Função |
|-----------|--------|
| [12 - Ciclo de Vida da OS](12%20-%20Ciclo%20de%20Vida%20da%20Ordem%20de%20Servico.md) | Detalha cada transição de status |
| [13 - Governança de Materiais](13%20-%20Governanca%20de%20Materiais%20e%20Pessoas.md) | Como materiais se ligam às OSs |
| [RN-000 - Regras de Negócio](RN-000%20-%20Regras%20de%20Negocio%20Consolidadas.md) | Validações e gatilhos em cada status |
| [20 - RBAC](20%20-%20Perfis%20Governanca%20e%20Controle%20de%20Acesso.md) | Quem pode fazer cada transição |

---

**Versão**: 1.0 - Integrada  
**Data**: 11 de junho de 2026
