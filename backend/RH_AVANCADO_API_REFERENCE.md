# 📋 RH Avançado - API Reference (Multi-Tenant)

## Base URL
```
/api/rh-avancado
```

## Autenticação
- **Middleware:** `authMiddleware` (JWT obrigatório)
- **Permissão:** `gerenciar_salario`, `gerenciar_dados_residenciais`, `gerenciar_conta_banco`, `gerenciar_ponto_diaria`
- **Isolamento Multi-Tenant:** Todas as queries filtram por `id_cliente` do JWT

## Padrão de Resposta
```json
{
  "success": boolean,
  "data": any,
  "error": string | null,
  "meta": {
    "total": number,
    "page": number,
    "limit": number,
    "totalPages": number
  }
}
```

---

## 💰 SALÁRIOS

### GET /salarios
Listar salários com paginação e busca

**Query Parameters:**
- `page` (int, default: 1): Número da página
- `limit` (int, default: 10): Registros por página
- `busca` (string): Busca por nome ou email do funcionário
- `sortBy` (string, default: 'nome'): Campo para ordenação
- `sortOrder` (string, default: 'asc'): Ordem (asc/desc)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id_salario": 1,
      "id_cliente": 1,
      "id_usuario": 10,
      "salario_base": 3000.00,
      "bonus": 500.00,
      "desconto": 0.00,
      "vale_refeicao": 300.00,
      "vale_transporte": 250.00,
      "data_inicio": "2026-01-15",
      "data_fim": null,
      "observacoes": "Salário base 2026",
      "tb_usuario": {
        "id_usuario": 10,
        "nome": "João Silva",
        "email": "joao@empresa.com",
        "matricula": "VANG-2025-0001"
      }
    }
  ],
  "meta": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "totalEmFolha": 15000.00
  }
}
```

### POST /salarios
Criar novo registro de salário

**Request Body:**
```json
{
  "id_usuario": 10,
  "salario_base": 3000.00,
  "bonus": 500.00,
  "desconto": 0.00,
  "vale_refeicao": 300.00,
  "vale_transporte": 250.00,
  "data_inicio": "2026-01-15",
  "observacoes": "Salário base 2026"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { /* salário criado */ },
  "error": null
}
```

**Erros:**
- `400`: Campos obrigatórios faltando
- `404`: Usuário não encontrado
- `409`: Salário ativo já existe para este usuário

### PUT /salarios/:id
Atualizar registro de salário

**Request Body:** (campos opcionais)
```json
{
  "salario_base": 3500.00,
  "bonus": 600.00,
  "desconto": 100.00
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { /* salário atualizado */ },
  "error": null
}
```

---

## 🏠 DADOS RESIDENCIAIS

### GET /residencial
Listar endereços de funcionários

**Query Parameters:**
- `page` (int, default: 1)
- `limit` (int, default: 10)
- `busca` (string): Busca por nome ou email

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id_residencial": 1,
      "id_cliente": 1,
      "id_usuario": 10,
      "logradouro": "Rua das Flores",
      "numero": "123",
      "complemento": "Apto 42",
      "bairro": "Centro",
      "cidade": "São Paulo",
      "estado": "SP",
      "cep": "01310-100",
      "ponto_referencia": "Próximo ao banco",
      "telefone": "1198765432",
      "email_pessoal": "joao.pessoal@email.com",
      "tb_usuario": {
        "id_usuario": 10,
        "nome": "João Silva",
        "email": "joao@empresa.com"
      }
    }
  ],
  "meta": { /* pagination */ }
}
```

### POST /residencial
Criar novo endereço

**Request Body:**
```json
{
  "id_usuario": 10,
  "logradouro": "Rua das Flores",
  "numero": "123",
  "complemento": "Apto 42",
  "bairro": "Centro",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "01310-100",
  "ponto_referencia": "Próximo ao banco",
  "telefone": "1198765432",
  "email_pessoal": "joao.pessoal@email.com"
}
```

### PUT /residencial/:id
Atualizar endereço

---

## 🏦 CONTAS BANCÁRIAS

### GET /contas-banco
Listar contas bancárias

**Query Parameters:**
- `page` (int, default: 1)
- `limit` (int, default: 10)
- `busca` (string)
- `ativo` (boolean, default: true): Filtrar por status

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id_conta_banco": 1,
      "id_cliente": 1,
      "id_usuario": 10,
      "banco": "Itaú",
      "tipo_conta": "CORRENTE",
      "agencia": "1234",
      "numero_conta": "567890",
      "digito_conta": "1",
      "chave_pix": "joao@email.com",
      "titular_conta": "João Silva",
      "cpf_titular": "123.456.789-00",
      "ativo": true,
      "tb_usuario": { /* ... */ }
    }
  ]
}
```

### POST /contas-banco
Criar nova conta bancária

**Request Body:**
```json
{
  "id_usuario": 10,
  "banco": "Itaú",
  "tipo_conta": "CORRENTE",
  "agencia": "1234",
  "numero_conta": "567890",
  "digito_conta": "1",
  "chave_pix": "joao@email.com",
  "titular_conta": "João Silva",
  "cpf_titular": "123.456.789-00"
}
```

### PUT /contas-banco/:id
Atualizar dados da conta

---

## 📋 FOLHA DE PONTO / DIÁRIA

### GET /ponto-diaria
Listar registros de ponto/diária

**Query Parameters:**
- `page` (int, default: 1)
- `limit` (int, default: 10)
- `busca` (string)
- `status` (string): TODOS | PENDENTE | APROVADO | REJEITADO
- `data_inicio` (date): ISO format YYYY-MM-DD
- `data_fim` (date): ISO format YYYY-MM-DD

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id_ponto_diaria": 1,
      "id_cliente": 1,
      "id_usuario": 10,
      "id_obra": 5,
      "data_ponto": "2026-06-17",
      "hora_entrada": "2026-06-17T08:00:00Z",
      "hora_saida": "2026-06-17T17:00:00Z",
      "horas_trabalhadas": 8.5,
      "horas_extras": 0.5,
      "valor_diaria": 250.00,
      "status": "PENDENTE",
      "observacoes": "Trabalho em alvenaria",
      "tb_usuario": { /* ... */ },
      "tb_obra": {
        "id_obra": 5,
        "nome": "Condomínio Terraço Verde"
      }
    }
  ],
  "meta": { /* pagination */ }
}
```

### POST /ponto-diaria
Registrar novo ponto/diária

**Request Body:**
```json
{
  "id_usuario": 10,
  "id_obra": 5,
  "data_ponto": "2026-06-17",
  "hora_entrada": "2026-06-17T08:00:00Z",
  "hora_saida": "2026-06-17T17:00:00Z",
  "horas_trabalhadas": 8.5,
  "horas_extras": 0.5,
  "valor_diaria": 250.00,
  "observacoes": "Trabalho em alvenaria"
}
```

**Erros:**
- `409`: Já existe registro de ponto para este usuário nesta data

### PATCH /ponto-diaria/:id/aprovar
Aprovar registro de ponto

**Response (200):**
```json
{
  "success": true,
  "data": { /* ponto com status APROVADO */ }
}
```

### PATCH /ponto-diaria/:id/rejeitar
Rejeitar registro de ponto

**Request Body:**
```json
{
  "motivo": "Horário não confere com sistema biométrico"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { /* ponto com status REJEITADO */ }
}
```

---

## ⚠️ Regras de Segurança Multi-Tenant (CRÍTICAS)

### 1. Isolamento por id_cliente
✅ TODA query filtra obrigatoriamente por `id_cliente` do JWT
❌ NUNCA retorna dados de outros tenants

### 2. Validação de Permissões
✅ `gerenciar_salario` → GET/POST/PUT /salarios
✅ `gerenciar_dados_residenciais` → GET/POST/PUT /residencial
✅ `gerenciar_conta_banco` → GET/POST/PUT /contas-banco
✅ `gerenciar_ponto_diaria` → GET/POST/PATCH /ponto-diaria

### 3. Idempotência
✅ Criação de salários: valida duplicidades antes INSERT
✅ Registros de ponto: bloqueia dois registros no mesmo dia para mesmo usuário
✅ Endereços residenciais: um endereço por usuário

### 4. Auditoria
- ✅ Logs de acesso gravados em `tb_log_auditoria`
- ✅ Rastreamento de criação/atualização em `criado_em` / `atualizado_em`

---

## 📊 Tabelas Suportadas

### tb_rh_salario
```
id_salario        → PK
id_cliente        → FK (multi-tenant)
id_usuario        → FK
salario_base      → Decimal(12,2)
bonus             → Decimal(12,2)
desconto          → Decimal(12,2)
vale_refeicao     → Decimal(10,2)
vale_transporte   → Decimal(10,2)
data_inicio       → DATE
data_fim          → DATE (NULL = ativo)
criado_em         → TIMESTAMP
atualizado_em     → TIMESTAMP
```

### tb_rh_residencial
```
id_residencial    → PK
id_cliente        → FK (multi-tenant)
id_usuario        → FK
logradouro, numero, bairro, cidade, estado, cep
ponto_referencia  → Descrição
telefone, email_pessoal
criado_em, atualizado_em
```

### tb_rh_conta_banco
```
id_conta_banco    → PK
id_cliente        → FK (multi-tenant)
id_usuario        → FK
banco             → STRING
tipo_conta        → "CORRENTE" | "POUPANÇA"
agencia, numero_conta, digito_conta, chave_pix
titular_conta, cpf_titular
ativo             → BOOLEAN
criado_em, atualizado_em
```

### tb_rh_ponto_diaria
```
id_ponto_diaria   → PK
id_cliente        → FK (multi-tenant)
id_usuario        → FK
id_obra           → FK (opcional)
data_ponto        → DATE
hora_entrada, hora_saida → TIMESTAMP
horas_trabalhadas, horas_extras → Decimal
valor_diaria      → Decimal(10,2)
status            → "PENDENTE" | "APROVADO" | "REJEITADO"
observacoes       → STRING
criado_em, atualizado_em
```

---

## 🧪 Exemplos de Requisição (cURL)

### Listar Salários
```bash
curl -X GET "http://localhost:5000/api/rh-avancado/salarios?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Criar Novo Salário
```bash
curl -X POST "http://localhost:5000/api/rh-avancado/salarios" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id_usuario": 10,
    "salario_base": 3000.00,
    "bonus": 500.00,
    "data_inicio": "2026-01-15"
  }'
```

### Registrar Ponto
```bash
curl -X POST "http://localhost:5000/api/rh-avancado/ponto-diaria" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id_usuario": 10,
    "id_obra": 5,
    "data_ponto": "2026-06-17",
    "horas_trabalhadas": 8.5,
    "valor_diaria": 250.00
  }'
```

### Aprovar Ponto
```bash
curl -X PATCH "http://localhost:5000/api/rh-avancado/ponto-diaria/1/aprovar" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```
