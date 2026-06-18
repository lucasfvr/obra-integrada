# 📋 API de Trabalhador (Módulo Operacional)

## Visão Geral
API completa para gerenciamento de estatísticas, desempenho e dados operacionais dos trabalhadores em campo.

---

## 🔐 Autenticação
Todas as rotas requerem **Bearer Token** obtido no login.

```bash
Authorization: Bearer <jwt_token>
```

---

## 📊 1. Estatísticas do Trabalhador
**GET** `/api/operational/stats`

Retorna todas as estatísticas consolidadas: financeiro, desempenho, presença, certificações.

### Parâmetros Query
- `userId` (opcional): ID do usuário. Se não informar, usa o usuário autenticado.

### Resposta (200)
```json
{
  "usuario": {
    "id": 5,
    "nome": "João da Silva",
    "email": "joao@obra.com",
    "status": "ATIVO",
    "tipoVinculo": "FUNCIONARIO",
    "dataAdmissao": "2023-03-15T00:00:00.000Z"
  },
  "financeiro": {
    "valorDia": 150.50,
    "diasTrabalhados": 18,
    "proximoPagamento": 2709.00,
    "totalObras": 2,
    "previsaoMensal": 4365.75
  },
  "desempenho": {
    "tarefas": {
      "total": 42,
      "concluidas": 38,
      "emAndamento": 3,
      "pendentes": 1,
      "taxaConclusao": 90,
      "mediaProgresso": 87
    },
    "presenca": {
      "diasTrabalhados": 18,
      "taxaPresenca": 75,
      "diasComTarefas": 2
    }
  },
  "certificacoes": {
    "total": 4,
    "validas": 3,
    "vencidas": 1,
    "items": [
      {
        "nome": "Segurança em Altura NR-35",
        "dataValidade": "2026-08-10T00:00:00.000Z",
        "status": "VÁLIDA"
      }
    ]
  }
}
```

### Exemplos
```bash
# Usando Bearer Token do usuário autenticado
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/operational/stats

# Consultando específico usuário
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/operational/stats?userId=5
```

---

## 💰 2. Histórico de Pagamentos
**GET** `/api/operational/pagamentos`

Retorna histórico de pagamentos agrupado por mês, baseado em diários trabalhados.

### Parâmetros Query
- `userId` (opcional): ID do usuário
- `month` (opcional): Mês específico (formato MM)
- `year` (opcional): Ano específico (formato YYYY)

### Resposta (200)
```json
[
  {
    "mesAno": "06/2026",
    "diasTrabalhados": 18,
    "valorTotal": 2709.00,
    "status": "Processado"
  },
  {
    "mesAno": "05/2026",
    "diasTrabalhados": 22,
    "valorTotal": 3311.00,
    "status": "Processado"
  }
]
```

### Exemplo
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/operational/pagamentos?userId=5
```

---

## 🎯 3. Disponibilidade e Alocação
**GET** `/api/operational/disponibilidade`

Retorna em quais obras está alocado e sua disponibilidade para novas tarefas.

### Resposta (200)
```json
{
  "alocacoes": [
    {
      "obraId": 1,
      "obra": "Residencial Alpha",
      "localizacao": "São Paulo - SP",
      "statusObra": "ATIVA",
      "valorDia": 150.50,
      "tarefasNessa": 3
    },
    {
      "obraId": 2,
      "obra": "Condomínio Beta",
      "localizacao": "Campinas - SP",
      "statusObra": "ATIVA",
      "valorDia": 140.00,
      "tarefasNessa": 1
    }
  ],
  "tarefasAtivas": 4,
  "disponivel": false
}
```

### Exemplo
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/operational/disponibilidade
```

---

## 📈 4. Relatório de Desempenho
**GET** `/api/operational/relatorio`

Gera relatório detalhado de desempenho em um período específico.

### Parâmetros Query
- `userId` (opcional): ID do usuário
- `dataInicio` (opcional): Data inicial (YYYY-MM-DD)
- `dataFim` (opcional): Data final (YYYY-MM-DD)
  - Padrão: últimos 30 dias

### Resposta (200)
```json
{
  "periodo": {
    "inicio": "2026-05-18T00:00:00.000Z",
    "fim": "2026-06-17T00:00:00.000Z"
  },
  "resumo": {
    "diasTrabalhados": 18,
    "tarefasAssignadas": 42,
    "tarefasConcluidas": 38,
    "diariosCom": 18,
    "scoreDesempenho": 87,
    "performanceLabel": "BOM"
  },
  "tarefas": [
    {
      "id": 101,
      "titulo": "Preparação de armação",
      "status": "CONCLUIDA",
      "progresso": 100,
      "dataConclusao": "2026-06-10T14:30:00.000Z"
    }
  ]
}
```

### Exemplo
```bash
# Últimos 30 dias
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/operational/relatorio

# Período customizado
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5000/api/operational/relatorio?dataInicio=2026-05-01&dataFim=2026-05-31"
```

### Score de Desempenho
- **90-100**: EXCELENTE
- **75-89**: BOM
- **60-74**: ADEQUADO
- **< 60**: BAIXO

---

## ✅ 5. Tarefas Ativas
**GET** `/api/operational/tarefas-ativas`

Retorna as próximas tarefas a fazer (PENDENTE e EM_ANDAMENTO).

### Resposta (200)
```json
{
  "total": 4,
  "tarefas": [
    {
      "id": 101,
      "titulo": "Limpeza da área",
      "descricao": "Remover entulho do piso",
      "status": "PENDENTE",
      "progresso": 0,
      "obra": "Residencial Alpha"
    },
    {
      "id": 102,
      "titulo": "Preparação de armação",
      "descricao": "Preparar aço para concretagem",
      "status": "EM_ANDAMENTO",
      "progresso": 45,
      "obra": "Residencial Alpha"
    }
  ]
}
```

### Exemplo
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/operational/tarefas-ativas
```

---

## 🌦️ 6. Clima e Recomendações
**GET** `/api/operational/weather`

Retorna clima local e recomendações de segurança para atividades da obra.

### Parâmetros Query
- `cidade` (opcional): Nome da cidade (default: "Obra Atual")
- `obraId` (opcional): ID da obra (para contexto)

### Resposta (200)
```json
{
  "clima": {
    "cidade": "São Paulo",
    "temperatura": 24,
    "condicao": "Chuvoso",
    "chanceChuva": 80,
    "umidade": 85,
    "vento": 15
  },
  "recomendacoes": [
    {
      "tipo": "ALERTA_CRITICO",
      "mensagem": "⚠️ ALERTA: Não é recomendado realizar atividades de concretagem, pintura ou trabalhos em altura"
    },
    {
      "tipo": "BOM",
      "mensagem": "✅ Demais atividades podem prosseguir normalmente"
    }
  ],
  "timestamp": "2026-06-17T10:30:00.000Z"
}
```

### Tipos de Recomendação
- `ALERTA_CRITICO`: Não recomendado trabalhar
- `ALERTA_MODERADO`: Use proteção extra
- `BOM`: Condições adequadas
- `TEMPERATURA_ALTA`: Risco de calor
- `VENTO_FORTE`: Risco de estruturas instáveis

### Exemplo
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5000/api/operational/weather?cidade=SãoPaulo"
```

---

## 📝 Códigos de Erro

| Código | Mensagem | Causa |
|--------|----------|-------|
| 400 | userId é obrigatório | Parâmetro de query ausente |
| 404 | Usuário não encontrado | ID do usuário inválido |
| 500 | Erro ao calcular... | Erro interno do servidor |

---

## 🔧 Integrações Recomendadas

### Frontend - Painel do Trabalhador
```javascript
// Carregar estatísticas ao abrir dashboard
const response = await fetch('/api/operational/stats', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const stats = await response.json();

// Mostrar próximas tarefas
const tarefas = await fetch('/api/operational/tarefas-ativas', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Verificar clima antes de começar turno
const climate = await fetch('/api/operational/weather?cidade=SãoPaulo', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Mobile App - Notificações
- Alertar quando há tarefas críticas
- Avisar sobre mudanças climáticas
- Confirmar presença com diários

### RH - Relatórios Mensais
- Gerar relatório de desempenho
- Calcular pagamentos
- Auditar certificações vencidas

---

## 📞 Suporte
Para dúvidas, consulte a documentação completa em `/backend/docs/API.md`
