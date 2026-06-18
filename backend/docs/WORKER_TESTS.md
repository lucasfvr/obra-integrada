# 🧪 Testes das Rotas de Trabalhador

## Como Testar as APIs

### Pré-requisito
1. Backend rodando em `http://localhost:5000`
2. Ter um JWT Token válido de um usuário autenticado

### Obter JWT Token
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rh@obra.com",
    "senha": "Dev:RH"
  }'
```

Copiar o `token` da resposta.

---

## 🔴 1. TESTE: Estatísticas do Trabalhador

### Comando
```bash
TOKEN="seu_token_aqui"

curl -X GET http://localhost:5000/api/operational/stats \
  -H "Authorization: Bearer $TOKEN"
```

### Resposta Esperada (200)
```json
{
  "usuario": {
    "id": 5,
    "nome": "João Silva",
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

---

## 🟠 2. TESTE: Histórico de Pagamentos

### Comando
```bash
curl -X GET http://localhost:5000/api/operational/pagamentos \
  -H "Authorization: Bearer $TOKEN"
```

### Resposta Esperada (200)
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
  },
  {
    "mesAno": "04/2026",
    "diasTrabalhados": 20,
    "valorTotal": 3010.00,
    "status": "Processado"
  }
]
```

---

## 🟡 3. TESTE: Disponibilidade e Alocação

### Comando
```bash
curl -X GET http://localhost:5000/api/operational/disponibilidade \
  -H "Authorization: Bearer $TOKEN"
```

### Resposta Esperada (200)
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

---

## 🟢 4. TESTE: Relatório de Desempenho

### Comando - Últimos 30 dias
```bash
curl -X GET http://localhost:5000/api/operational/relatorio \
  -H "Authorization: Bearer $TOKEN"
```

### Comando - Período específico
```bash
curl -X GET "http://localhost:5000/api/operational/relatorio?dataInicio=2026-05-01&dataFim=2026-05-31" \
  -H "Authorization: Bearer $TOKEN"
```

### Resposta Esperada (200)
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
    },
    {
      "id": 102,
      "titulo": "Limpeza da área",
      "status": "CONCLUIDA",
      "progresso": 100,
      "dataConclusao": "2026-06-09T16:45:00.000Z"
    }
  ]
}
```

---

## 🔵 5. TESTE: Tarefas Ativas

### Comando
```bash
curl -X GET http://localhost:5000/api/operational/tarefas-ativas \
  -H "Authorization: Bearer $TOKEN"
```

### Resposta Esperada (200)
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
    },
    {
      "id": 103,
      "titulo": "Montagem de formas",
      "descricao": "Montar formas para laje",
      "status": "PENDENTE",
      "progresso": 0,
      "obra": "Condomínio Beta"
    },
    {
      "id": 104,
      "titulo": "Verificação de estrutura",
      "descricao": "Inspeção final da estrutura",
      "status": "PENDENTE",
      "progresso": 0,
      "obra": "Condomínio Beta"
    }
  ]
}
```

---

## 🟣 6. TESTE: Clima e Recomendações

### Comando - Clima genérico
```bash
curl -X GET http://localhost:5000/api/operational/weather \
  -H "Authorization: Bearer $TOKEN"
```

### Comando - Clima específico
```bash
curl -X GET "http://localhost:5000/api/operational/weather?cidade=SãoPaulo" \
  -H "Authorization: Bearer $TOKEN"
```

### Resposta Esperada (200)
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

---

## 📊 Teste com Insomnia/Postman

### Importar Collection
```json
{
  "info": {
    "name": "Worker API",
    "description": "Testes da API de Trabalhador"
  },
  "item": [
    {
      "name": "Stats",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/api/operational/stats",
        "header": {
          "Authorization": "Bearer {{TOKEN}}"
        }
      }
    },
    {
      "name": "Pagamentos",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/api/operational/pagamentos",
        "header": {
          "Authorization": "Bearer {{TOKEN}}"
        }
      }
    }
  ]
}
```

---

## ✅ Checklist de Validação

- [ ] `/operational/stats` retorna dados completos
- [ ] `/operational/pagamentos` lista histórico mensal
- [ ] `/operational/disponibilidade` mostra alocações
- [ ] `/operational/relatorio` gera relatório com score
- [ ] `/operational/tarefas-ativas` lista tarefas PENDENTE/EM_ANDAMENTO
- [ ] `/operational/weather` retorna clima com recomendações
- [ ] Todas as respostas incluem dados corretos
- [ ] Nenhum erro 500
- [ ] Documentação coincide com respostas

---

## 🐛 Troubleshooting

### Erro 401 (Unauthorized)
- ✅ Verificar se TOKEN está válido
- ✅ Verificar se Bearer está no header
- ✅ Verificar se usuário está autenticado

### Erro 404 (Not Found)
- ✅ Verificar se userId existe
- ✅ Verificar se endpoint está escrito corretamente
- ✅ Verificar se backend está rodando

### Erro 500 (Internal Server Error)
- ✅ Verificar logs do backend
- ✅ Verificar permissões do usuário
- ✅ Verificar dados no banco de dados

---

## 📝 Notas

- Todas as rotas requerem autenticação (Bearer Token)
- `userId` é opcional (usa autenticado se não informar)
- Datas no formato ISO (YYYY-MM-DD)
- Valores monetários com 2 casas decimais
- Percentuais arredondados (0-100)

