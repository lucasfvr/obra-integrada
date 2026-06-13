---
tags: [rbac, perfis, governanca, permissoes, acesso, seguranca]
aliases: [Profiles, Access Control, Governance]
---
# 👥 Perfis, Governança e Controle de Acesso Detalhado

Documentação completa de papéis, permissões, acesso a campos e governança do sistema.

---

## 🏛️ GOVERNANÇA ORGANIZACIONAL

### Estrutura de Dois Níveis

```
┌─────────────────────────────────────────────────────────┐
│          OBRA INTEGRADA (PLATAFORMA SAAS)              │
│              Nível FORNECEDOR                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────┐  ┌──────────────────┐           │
│  │ Super Admin      │  │ DevOps           │           │
│  │ • Dashboard      │  │ • Infraestrutura │           │
│  │   Global         │  │ • Deploys        │           │
│  │ • Tenants        │  │ • Backups        │           │
│  │ • Segurança      │  │ • Logs           │           │
│  │ • Billing        │  │                  │           │
│  └──────────────────┘  └──────────────────┘           │
│                                                         │
│  ┌──────────────────┐                                  │
│  │ CS/Suporte       │                                  │
│  │ • Onboarding     │                                  │
│  │ • Help Desk      │                                  │
│  │ • Treinamento    │                                  │
│  │ • Relatórios     │                                  │
│  └──────────────────┘                                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
                         │
                    ISOLAMENTO
                   MULTI-TENANT
                         │
          ┌──────────────┴──────────────┐
          │                             │
    ┌─────▼──────────┐          ┌──────▼──────────┐
    │  TENANT 1      │          │  TENANT 2       │
    │ (Construtora A)│          │ (Construtora B) │
    ├────────────────┤          ├─────────────────┤
    │ Nível CLIENTE  │          │ Nível CLIENTE   │
    │                │          │                 │
    │ Admin          │          │ Admin           │
    │ ├─ Gerente     │          │ ├─ Gerente      │
    │ │  ├─ Supv.    │          │ │  ├─ Supv.     │
    │ │  └─ Operac.  │          │ │  └─ Operac.   │
    │ ├─ Gerente     │          │ ├─ Gerente      │
    │ └─ Operacional │          │ └─ Operacional  │
    │                │          │                 │
    └────────────────┘          └─────────────────┘
```

---

## 👤 PERFIS (ROLES) DETALHADOS

### 1️⃣ **SUPER ADMIN** (Nível: SAAS)

**Descrição**: Acesso total à plataforma (exceto dados de clientes diretos)

#### Capacidades
- ✅ Gerenciar tenants (criar, bloquear, ativar)
- ✅ Gerenciar usuários SaaS (Super Admin, DevOps, CS)
- ✅ Visualizar dashboard de plataforma (métricas, alertas)
- ✅ Acessar logs de auditoria de todo sistema
- ✅ Gerenciar planos de assinatura
- ✅ Executar relatórios de compliance (LGPD, GDPR)
- ❌ NÃO pode acessar dados operacionais de clientes (Obra, Apontamentos)
- ❌ NÃO pode manipular dados financeiros sem autorização

#### Permissões por Módulo

| Módulo | Ação | Permitido | Detalhes |
|--------|------|----------|----------|
| **TENANT** | Criar | ✅ | Com validação de CNPJ |
| | Visualizar | ✅ | Todos (lista completa) |
| | Editar | ✅ | Metadados e status |
| | Deletar | ⚠️ | Soft-delete, com auditoria |
| | Bloquear | ✅ | Freezar operações de tenant |
| **USUARIO_SAAS** | Criar | ✅ | Super Admin, DevOps, CS |
| | Visualizar | ✅ | Todos usuários SaaS |
| | Editar | ✅ | Incluindo resetar senha |
| | Deletar | ❌ | Nunca (soft-delete) |
| **AUDITORIA** | Visualizar | ✅ | Todos logs, sem restrição |
| | Exportar | ✅ | Para análise/compliance |
| **FATURAMENTO** | Visualizar | ✅ | Receita por tenant |
| | Gerar | ⚠️ | Apenas relatórios (CFO approval) |
| | Processar | ❌ | Não pode processar pagamentos |

#### Acesso a Dados de Campos
- **Dados Pessoais** (CPF, RG, etc): Visualizar apenas em contexto de auditoria
- **Senhas**: Nunca vê senhas, apenas hash
- **Dados Financeiros**: Visualizar agregados (SaaS level)
- **Dados Operacionais**: Não acessa (isolamento total)

---

### 2️⃣ **DEVOPS** (Nível: SAAS)

**Descrição**: Gestão de infraestrutura e deploy

#### Capacidades
- ✅ Gerenciar servidores e containers
- ✅ Executar deploys (staging/produção)
- ✅ Acessar logs de aplicação
- ✅ Gerenciar backups e disaster recovery
- ✅ Monitorar performance (CPU, memória, banco)
- ✅ Resetar cache/sessions
- ❌ NÃO pode acessar dados de clientes
- ❌ NÃO pode alterar código (apenas deploy)

#### Permissões Específicas
- Via SSH: Apenas máquinas de infraestrutura
- Banco de dados: Acesso read-only a logs/performance
- Aplicação: Acesso a logs estruturados
- Secrets: Acesso apenas a chaves de deploy (não BD credentials user-facing)

---

### 3️⃣ **CS/SUPORTE** (Nível: SAAS)

**Descrição**: Customer Success e Onboarding

#### Capacidades
- ✅ Listar tenants (sem dados sensíveis)
- ✅ Resetar senhas de usuários (com confirmação)
- ✅ Visualizar documentação de tenant
- ✅ Enviar comunicações
- ✅ Criar tickets de suporte
- ✅ Ver relatórios agregados
- ❌ NÃO pode acessar dados financeiros detalhados
- ❌ NÃO pode bloquear tenants sozinho

#### Permissões por Ação
- Resetar Senha: ✅ Com MFA do CS agent
- Criar Usuário Tenant: ✅ Com aprovação Admin
- Visualizar Histórico: ✅ Apenas logs de suporte
- Gerar Relatório: ✅ Apenas suporte (sem operacional)

---

### 4️⃣ **ADMIN CONSTRUTORA** (Nível: CLIENTE)

**Descrição**: Administrador da Construtora (tenant)

#### Capacidades
- ✅ Gerenciar usuários da empresa
- ✅ Criar obras
- ✅ Definir configurações da empresa
- ✅ Visualizar relatórios financeiros
- ✅ Aprovar apontamentos (final)
- ✅ Gerenciar integrações (ERP, APIs)
- ❌ NÃO pode resetar senhas do Super Admin
- ❌ NÃO pode acessar sistema de billing da plataforma

#### Permissões Detalhadas

| Ação | Permitido | Restrições |
|------|----------|-----------|
| Criar Obra | ✅ | Apenas sua empresa (tenant_id) |
| Editar Obra | ✅ | Apenas suas obras |
| Deletar Obra | ⚠️ | Soft-delete, com auditoria |
| Criar Usuário | ✅ | Atribuir papel Admin/Gerente/Supervisor/Operacional |
| Resetar Senha | ✅ | De qualquer usuário de sua empresa |
| Deletar Usuário | ⚠️ | Soft-delete (desativar) |
| Criar Material | ✅ | Adicionar ao catálogo da empresa |
| Deletar Material | ⚠️ | Apenas se não tem consumo |
| Gerar Fatura | ✅ | Com dados automáticos, edição limitada |
| Aprovar Fatura | ✅ | Final (envia para cliente) |
| Exportar Dados | ✅ | Relatórios em PDF/Excel |

#### Acesso a Campos Sensíveis
- **CPF de Operacionais**: Visualizar (não editar)
- **Salários**: Visualizar totais agregados
- **Senhas**: Nunca vê, apenas reset
- **Transações**: Visualizar todas (seu tenant)

---

### 5️⃣ **GERENTE DE OBRA** (Nível: CLIENTE)

**Descrição**: Responsável por uma ou mais obras

#### Capacidades
- ✅ Criar ordens de serviço (OS)
- ✅ Atribuir tarefas a operacionais
- ✅ Validar apontamentos (passar para aprovação)
- ✅ Visualizar progresso da obra
- ✅ Gerar relatórios da obra
- ✅ Gerenciar cronograma
- ✅ Solicitar materiais
- ❌ NÃO pode deletar obras
- ❌ NÃO pode alterar estrutura de usuários
- ❌ NÃO pode ver salários detalhados

#### Permissões por Ação

| Ação | Scope | Permitido |
|------|-------|----------|
| Criar OS | Suas obras | ✅ |
| Editar OS | Criada por ele | ✅ |
| Editar OS | Criada por outro | ⚠️ Apenas status |
| Atribuir Tarefa | Operacionais obra | ✅ |
| Validar Apontamento | De sua obra | ✅ |
| Aprovar Apontamento | Não (supervisor sim) | ❌ |
| Ver Custo Detalhado | Sua obra | ✅ |
| Ver Margem | Agregada | ✅ |
| Visualizar CPF | De operacionais | ✅ (leitura) |

---

### 6️⃣ **SUPERVISOR** (Nível: CLIENTE)

**Descrição**: Valida apontamentos e coordena campo

#### Capacidades
- ✅ Validar apontamentos de operacionais
- ✅ Adicionar observações a apontamentos
- ✅ Visualizar tarefas do dia
- ✅ Gerar relatórios simples
- ✅ Visualizar localização GPS
- ❌ NÃO pode criar OS
- ❌ NÃO pode deletar apontamentos
- ❌ NÃO pode alterar tarefas já atribuídas

#### Fluxo de Validação
```
Operacional faz apontamento
       ↓
Supervisor VALIDA (confirma horas/localização/foto)
       ↓
Gerente APROVA (confirma custo/faturamento)
       ↓
Apontamento → FATURADO
```

#### Permissões Específicas

| Ação | Permitido | Restrições |
|------|----------|-----------|
| Visualizar Apontamento | ✅ | De sua obra/equipe |
| Validar Apontamento | ✅ | Mudar ENVIADO → VALIDADO |
| Rejeitar Apontamento | ✅ | Com motivo obrigatório |
| Adicionar Observação | ✅ | Campo visível a operacional |
| Visualizar Foto | ✅ | Entrada e saída |
| Verificar GPS | ✅ | Entrada, saída e rota |
| Editar Apontamento | ❌ | Nunca (imutável após ENVIADO) |
| Deletar Apontamento | ❌ | Nunca |

---

### 7️⃣ **OPERACIONAL** (Nível: CLIENTE)

**Descrição**: Colaborador de campo (canteiro)

#### Capacidades
- ✅ Fazer apontamentos de horas
- ✅ Tirar fotos
- ✅ Visualizar suas tarefas
- ✅ Consumir materiais (registrar uso)
- ✅ Ver cronograma da obra
- ❌ NÃO pode validar apontamentos
- ❌ NÃO pode deletar apontamentos
- ❌ NÃO pode ver dados de outros operacionais

#### Fluxo Apontamento (Operacional)
```
1. Entrada: Captura hora, foto, GPS
       ↓
2. Trabalho: Realiza tarefas, captura fotos de progresso
       ↓
3. Saída: Captura hora, foto, GPS, intervalo
       ↓
4. Envio: Apontamento em status ENVIADO
       ↓
5. Aguarda: Supervisor vai validar e Gerente aprovar
       ↓
6. Feedback: Recebe confirmação ou rejeição
```

#### Dados Acessíveis
- ✅ Próprias tarefas
- ✅ Próprios apontamentos (após criação)
- ✅ Cronograma geral da obra
- ✅ Localização do canteiro
- ❌ Dados de outros operacionais
- ❌ Custos ou margem
- ❌ Informações financeiras

---

## 📋 MATRIZ CONSOLIDADA DE PERMISSÕES

### Ações Principais (7 Roles × 11 Ações)

```
┌─────────────────────┬────────────────────────────────────┐
│ AÇÃO                │ PERMISSÕES POR ROLE                │
├─────────────────────┼────────────────────────────────────┤
│ Criar Obra          │ SA:❌ | Dev:❌ | CS:❌ |          │
│                     │ AD:✅ | GE:❌ | SU:❌ | OP:❌      │
├─────────────────────┼────────────────────────────────────┤
│ Editar Obra         │ SA:❌ | Dev:❌ | CS:❌ |          │
│                     │ AD:✅ | GE:✅* | SU:❌ | OP:❌     │
│                     │ * Apenas status/data              │
├─────────────────────┼────────────────────────────────────┤
│ Deletar Obra        │ SA:❌ | Dev:❌ | CS:❌ |          │
│                     │ AD:✅ | GE:❌ | SU:❌ | OP:❌      │
├─────────────────────┼────────────────────────────────────┤
│ Criar Apontamento   │ SA:❌ | Dev:❌ | CS:❌ |          │
│                     │ AD:❌ | GE:❌ | SU:❌ | OP:✅      │
├─────────────────────┼────────────────────────────────────┤
│ Validar Apontamento │ SA:❌ | Dev:❌ | CS:❌ |          │
│                     │ AD:✅ | GE:⚠️ | SU:✅ | OP:❌      │
│                     │ ⚠️ Apenas final (aprovação)       │
├─────────────────────┼────────────────────────────────────┤
│ Aprovar Apontamento │ SA:❌ | Dev:❌ | CS:❌ |          │
│                     │ AD:✅ | GE:✅ | SU:❌ | OP:❌      │
├─────────────────────┼────────────────────────────────────┤
│ Deletar Apontamento │ SA:❌ | Dev:❌ | CS:❌ |          │
│                     │ AD:✅ | GE:❌ | SU:❌ | OP:❌      │
├─────────────────────┼────────────────────────────────────┤
│ Gerar Fatura        │ SA:❌ | Dev:❌ | CS:❌ |          │
│                     │ AD:✅ | GE:❌ | SU:❌ | OP:❌      │
├─────────────────────┼────────────────────────────────────┤
│ Aprovar Fatura      │ SA:❌ | Dev:❌ | CS:❌ |          │
│                     │ AD:✅ | GE:❌ | SU:❌ | OP:❌      │
├─────────────────────┼────────────────────────────────────┤
│ Ver Relatório       │ SA:✅ | Dev:❌ | CS:✅ |          │
│                     │ AD:✅ | GE:✅ | SU:✅ | OP:❌      │
├─────────────────────┼────────────────────────────────────┤
│ Exportar Dados      │ SA:✅ | Dev:❌ | CS:✅ |          │
│                     │ AD:✅ | GE:✅ | SU:⚠️ | OP:❌      │
│                     │ ⚠️ Apenas relatório pessoal       │
├─────────────────────┼────────────────────────────────────┤
│ Resetar Senha       │ SA:✅ | Dev:❌ | CS:⚠️ | ...      │
│                     │ AD:✅ | GE:❌ | SU:❌ | OP:❌      │
│                     │ ⚠️ Apenas com MFA              │
└─────────────────────┴────────────────────────────────────┘

Legenda:
✅ = Permitido
❌ = Bloqueado
⚠️ = Condicional/Restrito
* = Veja detalhes na linha
```

---

## 🔐 CONTROLE DE ACESSO POR CAMPO (Field-Level ACL)

### Tabela: USUARIO

| Campo | Super Admin | DevOps | CS | Admin | Gerente | Supervisor | Operacional |
|-------|----------|--------|----|----|---------|-----------|-----------|
| id_usuario | 🔍 | ❌ | ⚠️ | ✅ | ⚠️ | ❌ | ⚠️ |
| nome_completo | 🔍 | ❌ | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| cpf | 🔍 | ❌ | ❌ | ✅ | ✅ | ⚠️ | ❌ |
| email | 🔍 | ❌ | ✅ | ✅ | ⚠️ | ❌ | ⚠️ |
| senha_hash | 🔒 | ❌ | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| papel_id | 🔍 | ❌ | 🔍 | ✅ | ⚠️ | ❌ | ❌ |
| data_nascimento | 🔍 | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| status | 🔍 | ❌ | 🔍 | ✅ | ⚠️ | ⚠️ | ❌ |
| ultimo_login | 🔍 | 🔍 | ❌ | ✅ | ❌ | ❌ | ❌ |

**Legenda:**
- 🔍 = Visualizar (read-only)
- ✅ = Visualizar + Editar
- ⚠️ = Visualizar + Editar com restrições (ex: apenas próprio registro)
- 🔒 = Nunca visualizar/editar
- ❌ = Sem acesso

---

### Tabela: APONTAMENTO

| Campo | Super Admin | DevOps | CS | Admin | Gerente | Supervisor | Operacional |
|-------|----------|--------|----|----|---------|-----------|-----------|
| id_apontamento | 🔍 | ❌ | ❌ | ✅ | ✅ | ✅ | ⚠️ |
| id_usuario | 🔍 | ❌ | ❌ | ✅ | ✅ | 🔍 | ⚠️ |
| data_apontamento | 🔍 | ❌ | ❌ | ✅ | ✅ | 🔍 | ✅ |
| hora_entrada | 🔍 | ❌ | ❌ | ✅ | ✅ | 🔍 | ✅ |
| hora_saida | 🔍 | ❌ | ❌ | ✅ | ✅ | 🔍 | ✅ |
| horas_trabalho | 🔍 | ❌ | ❌ | ✅ | ✅ | 🔍 | 🔍 |
| latitude_entrada | 🔍 | ❌ | ❌ | ✅ | ✅ | 🔍 | ⚠️ |
| longitude_entrada | 🔍 | ❌ | ❌ | ✅ | ✅ | 🔍 | ⚠️ |
| foto_entrada_url | 🔍 | ❌ | ❌ | ✅ | ✅ | 🔍 | ⚠️ |
| foto_saida_url | 🔍 | ❌ | ❌ | ✅ | ✅ | 🔍 | ⚠️ |
| status | 🔍 | ❌ | ❌ | ✅ | ✅ | ✅ | 🔍 |
| custo_mao_obra | 🔍 | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| observacoes | 🔍 | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |

---

### Tabela: OBRA

| Campo | Super Admin | DevOps | CS | Admin | Gerente | Supervisor | Operacional |
|-------|----------|--------|----|----|---------|-----------|-----------|
| id_obra | 🔍 | ❌ | ❌ | ✅ | ✅ | 🔍 | 🔍 |
| nome_obra | 🔍 | ❌ | ❌ | ✅ | ✅ | 🔍 | 🔍 |
| endereco | 🔍 | ❌ | ❌ | ✅ | ✅ | 🔍 | 🔍 |
| latitude, longitude | 🔍 | ❌ | ❌ | ✅ | ✅ | 🔍 | ⚠️ |
| valor_orcado | 🔍 | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| custo_hora_mo | 🔍 | ❌ | ❌ | ✅ | 🔍 | ❌ | ❌ |
| encargo_social | 🔍 | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| status | 🔍 | ❌ | ❌ | ✅ | ✅ | 🔍 | 🔍 |
| progresso_fisico | 🔍 | ❌ | ❌ | ✅ | ✅ | 🔍 | ⚠️ |
| gerente_id | 🔍 | ❌ | ❌ | ✅ | 🔍 | ❌ | ❌ |

**Nota**: ⚠️ em progresso_fisico para Operacional = Apenas visualizar progresso (não editar)

---

## 🔒 REGRAS DE SEGURANÇA POR PERFIL

### Super Admin (SaaS)
```
✅ CAN:
- Visualizar logs de segurança (audit_log)
- Resetar senhas de qualquer usuário SaaS
- Executar backup/restore
- Gerenciar planos e assinaturas
- Exportar dados agregados para compliance

❌ CANNOT:
- Acessar dados operacionais de tenants diretamente
- Executar deletions de banco de produção
- Modificar código (apenas DevOps faz deploy)
- Acessar senhas (even hash, apenas reset)
- Alterar assinaturas sem log formal

⚠️ AUDITADO:
- Toda ação é registrada em AUDIT_LOG
- MFA obrigatório
- IP whitelist (se configurado)
- Session timeout: 30 minutos
```

### DevOps (SaaS)
```
✅ CAN:
- SSH em máquinas de infraestrutura
- Executar deploys (staging/produção)
- Acessar logs de aplicação
- Gerenciar backups
- Resetar cache

❌ CANNOT:
- Acessar banco de dados de clientes
- Deletar dados (exceto cache expirado)
- Resetar senhas de usuários
- Alterar configurações de negócio
- Acessar credenciais de integração

⚠️ AUDITADO:
- Deploy log com quem, quando, qual versão
- Comando executado (para auditoria)
- Acesso SSH com session recording
```

### CS (SaaS)
```
✅ CAN:
- Resetar senha de usuários de clientes (com MFA)
- Visualizar ticket de suporte
- Criar usuário em tenant (com aprovação)
- Enviar comunicados para tenants
- Acessar relatórios agregados

❌ CANNOT:
- Deletar usuários
- Acessar dados financeiros detalhados
- Bloquear tenants sozinho
- Alterar permissões
- Acessar logs de auditoria

⚠️ AUDITADO:
- Reset de senha
- Criar usuário
- Enviar comunicado
```

### Admin Construtora (Cliente)
```
✅ CAN:
- Gerenciar todos os usuários da empresa
- Criar obras e OS
- Gerar faturas
- Visualizar todos os dados operacionais
- Exportar dados da empresa

❌ CANNOT:
- Resetar senha do Super Admin
- Acessar dados de outras construtoras
- Executar deletions em produção (soft-delete)
- Alterar plano de assinatura
- Acessar sistema de billing

⚠️ AUDITADO:
- Criação de obra
- Geração de fatura
- Resetar senha de operacional
```

### Gerente Obra (Cliente)
```
✅ CAN:
- Criar/editar OS de suas obras
- Visualizar progresso e custos
- Validar e aprovar apontamentos
- Gerar relatórios da obra
- Solicitar materiais

❌ CANNOT:
- Deletar apontamentos (apenas soft-delete para Admin)
- Editar apontamentos após validação
- Visualizar dados de outras obras
- Alterar equipe da obra
- Gerar faturas (Admin faz isso)

⚠️ AUDITADO:
- Validação de apontamento
- Geração de relatório
- Alteração de cronograma
```

### Supervisor (Cliente)
```
✅ CAN:
- Validar apontamentos
- Adicionar observações
- Visualizar equipe e tarefas
- Gerar relatórios simples
- Ver GPS e fotos

❌ CANNOT:
- Editar apontamentos
- Criar OS
- Deletar registros
- Visualizar custos detalhados
- Alterar cronograma

⚠️ AUDITADO:
- Validação de apontamento
- Rejeição de apontamento
- Adição de observação
```

### Operacional (Cliente)
```
✅ CAN:
- Fazer apontamentos
- Tirar fotos
- Visualizar suas tarefas
- Consumir materiais
- Ver cronograma

❌ CANNOT:
- Visualizar dados de outros operacionais
- Editar apontamentos após envio
- Validar apontamentos
- Ver custos/salários
- Acessar dados sensíveis

⚠️ AUDITADO:
- Criação de apontamento
- Envio de apontamento
- Consumo de material
- Foto capturada (timestamp + GPS)
```

---

## 🔐 ISOLAMENTO MULTI-TENANT

### Princípios de Isolamento

```sql
-- REGRA 1: Filtro tenant_id em TODA query
SELECT * FROM usuario 
WHERE id_tenant = :current_tenant_id
AND id_usuario = :user_id;

-- REGRA 2: Middleware de autenticação
app.use((req, res, next) => {
  const tenant_id = req.user.id_tenant;
  req.db = db.where({ tenant_id });
  next();
});

-- REGRA 3: Índices compostos para performance
CREATE INDEX idx_usuario_tenant_email 
  ON usuario(id_tenant, email);

-- REGRA 4: Soft-delete com tenant_id
DELETE FROM usuario 
WHERE id_usuario = :id 
  AND id_tenant = :tenant_id;
```

### Row-Level Security (RLS)

```sql
-- PostgreSQL RLS Policy
CREATE POLICY tenant_isolation ON usuario
  USING (id_tenant = current_setting('app.current_tenant')::INT);

ALTER TABLE usuario ENABLE ROW LEVEL SECURITY;
```

---

## 📊 AUDITORIA COMPLETA

### O Que é Registrado

| Ação | Quem | O Que | Quando | Onde |
|------|------|--------|--------|------|
| Login | id_usuario | Sucesso/Falha | timestamp | IP + User-Agent |
| Criar Obra | id_usuario | Dados novos | timestamp | id_obra |
| Editar Obra | id_usuario | Antes/Depois | timestamp | id_obra |
| Validar Apto | id_usuario | Status muda | timestamp | id_apto |
| Deletar (soft) | id_usuario | Deletado_em | timestamp | id_registro |
| Exportar | id_usuario | Qual relatório | timestamp | Arquivo |
| Resetar Senha | id_usuario | Quem fez | timestamp | id_usuario_afetado |
| Bloquear Tenant | id_usuario_saas | Motivo | timestamp | id_tenant |

### Retenção de Logs

```
Logs de Acesso (login): 2 anos
Logs de Auditoria (alterações): 5 anos (LGPD)
Logs de Erro: 1 ano
Logs de Deploy: 1 ano
Backup: 30 dias + 1 backup semanal 1 ano
```

---

**Última atualização**: 11 de junho de 2026
**Versão**: 1.0
