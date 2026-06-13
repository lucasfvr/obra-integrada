---
tags: [ui, ux, telas, wireframes, especificacoes, interface]
aliases: [Wireframes, Screen Specifications, UI Design]
---
# 🖥️ Especificação Completa de Telas e Interfaces

Documentação detalhada de todas as telas do sistema com funcionalidades, informações e fluxos.

---

## 📱 ARQUITETURA DE NAVEGAÇÃO

### Estrutura Multi-Aplicação

```
┌─────────────────────────────────────────────────────────┐
│         OBRA INTEGRADA - Plataforma SaaS               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────┐    ┌──────────────────┐          │
│  │  Web Desktop    │    │  Mobile App      │          │
│  │  (Escritório)   │    │  (Canteiro)      │          │
│  └────────┬────────┘    └────────┬─────────┘          │
│           │                      │                    │
│           └──────────┬───────────┘                    │
│                      ▼                                │
│         ┌────────────────────────┐                   │
│         │   Backend APIs (REST)  │                   │
│         ├────────────────────────┤                   │
│         │  • Auth                │                   │
│         │  • Obras               │                   │
│         │  • Apontamentos        │                   │
│         │  • Materiais           │                   │
│         │  • Relatórios          │                   │
│         └────────────────────────┘                   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 TELAS DE AUTENTICAÇÃO

### 1. Tela de Login

**Localização**: `/login`
**Acessível por**: Qualquer pessoa não autenticada

#### Elementos da Tela
```
┌───────────────────────────────────────────┐
│                                           │
│         🏗️ OBRA INTEGRADA                 │
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │ Email                               │  │
│  │ [___________________________]         │  │
│  └─────────────────────────────────────┘  │
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │ Senha                               │  │
│  │ [___________________________]         │  │
│  │                                     │  │
│  │ [ ] Lembrar de mim                  │  │
│  │ [Esqueci minha senha]               │  │
│  └─────────────────────────────────────┘  │
│                                           │
│  ┌─────────────────────────────────────┐  │
│  │     [ENTRAR] [SUPORTE]              │  │
│  └─────────────────────────────────────┘  │
│                                           │
└───────────────────────────────────────────┘
```

#### Validações
- Email: RFC 5322 format
- Senha: 8+ caracteres
- Tentativas: máximo 5 erros = bloqueio por 15 min
- Log: Registra todo login attempt

#### Ações
- **[ENTRAR]**: Autentica e redireciona para Dashboard
- **[ESQUECI SENHA]**: Vai para recovery
- **[SUPORTE]**: Abre chat com CS

#### Após Login
- Se 2FA habilitado: vai para tela de verificação TOTP
- Caso contrário: Dashboard direto

---

### 2. Tela de Recuperação de Senha

**Localização**: `/forgot-password`

#### Fluxo
1. Usuário entra email
2. Sistema envia link por email
3. Link válido por 24 horas
4. Usuário define nova senha
5. Confirma e volta ao login

#### Validações
- Email deve estar registrado no sistema
- Nova senha: 8+ chars, 1 maiúscula, 1 minúscula, 1 número, 1 especial

---

### 3. Tela de Verificação 2FA

**Localização**: `/verify-2fa`

#### Elementos
```
Insira o código de 6 dígitos do seu autenticador:
[__ __ __ __ __ __]

[ ] Confiar neste dispositivo por 30 dias
[VERIFICAR] [VOLTAR AO LOGIN]
```

---

## 📊 DASHBOARD POR PERFIL

### Dashboard - Super Admin (Plataforma)

**Localização**: `/dashboard/super-admin`
**Acessível por**: Super Admin
**Atualização**: Real-time (WebSocket)

#### Widgets Principais
```
┌─────────────────────────────────────────────────────┐
│ Dashboard - Obra Integrada                          │
│ [Home] [Clientes] [Suporte] [Analytics] [Config]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ┌──────────────────┐  ┌──────────────────┐        │
│ │ 📊 RESUMO        │  │ 📈 MÉTRICAS      │        │
│ ├──────────────────┤  ├──────────────────┤        │
│ │ Tenants Ativos   │  │ Uptime: 99.92%   │        │
│ │ 45               │  │ Requets/min: 1.2K        │
│ │                  │  │ Latência p95: 250ms      │
│ │ Tenants Inativos │  │ CPU: 35% | RAM: 62%     │
│ │ 3                │  │                          │
│ │                  │  │ 🔴 Alertas Críticos      │
│ │ Receita Mensal   │  │ • DB connection pool 80% │
│ │ R$ 125.400       │  │ • Cache hit rate 65%     │
│ │                  │  │ • 2 Erros 5xx últimas 1h │
│ └──────────────────┘  └──────────────────┘        │
│                                                     │
│ ┌──────────────────────────────────────────────┐   │
│ │ 📋 ÚLTIMAS ATIVIDADES                        │   │
│ ├──────────────────────────────────────────────┤   │
│ │ • 09:45 Tenant "Obra Ltda" criado           │   │
│ │ • 09:30 N2 resetou senha de 5 usuários      │   │
│ │ • 09:15 Deploy v1.2.3 concluído (98% tests) │   │
│ │ • 09:00 Pentest externo iniciado            │   │
│ └──────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

#### Informações Disponíveis
- Total de tenants (ativos/inativos)
- Receita mensal/anual
- Saúde dos servidores
- Alertas de segurança
- Últimos deploys
- Tickets de suporte pendentes

#### Ações
- Criar novo tenant
- Bloquear/desbloquear tenant
- Resetar senha de qualquer usuário
- Visualizar logs de auditoria
- Acessar relatório de compliance

---

### Dashboard - Admin Construtora

**Localização**: `/dashboard/admin`
**Acessível por**: Admin de Construtora

#### Layout
```
┌─────────────────────────────────────────────┐
│ Dashboard - Construtora XYZ                │
│ [Obras] [Usuários] [Materiais] [Relatórios]│
├─────────────────────────────────────────────┤
│                                             │
│ 📌 RESUMO DA EMPRESA                        │
│ ├─ Obras Ativas: 5                          │
│ ├─ Equipe: 47 pessoas                       │
│ ├─ Faturado mês: R$ 85.500                  │
│ └─ Pendente recebimento: R$ 12.300          │
│                                             │
│ 📈 OBRAS - TOP 3                            │
│ ┌─────────────────────────────────────────┐ │
│ │ Obra A (Brasília) - 45% | ✅ No prazo  │ │
│ │ Obra B (RJ) - 68% | ⚠️ Atrasada 3 dias  │ │
│ │ Obra C (SP) - 12% | 🔴 Crítico -10 dias  │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ⚡ ALERTAS IMPORTANTES                      │
│ • Obra B: Material X faltando (pedido em 2) │
│ • 15 apontamentos aguardando validação      │
│ • Salário de 3 operacionais não faturado    │
│                                             │
│ ✏️ AÇÕES RÁPIDAS                            │
│ [+ Nova Obra] [+ Usuário] [📊 Relatório]   │
│                                             │
└─────────────────────────────────────────────┘
```

#### Informações
- Listagem de obras com status e progresso
- Resumo financeiro (faturado, pendente, receber)
- Alertas operacionais
- Equipe ativa/inativa
- Materiais em falta

#### Ações
- Criar nova obra
- Adicionar usuário
- Visualizar detalhes da obra
- Gerar relatórios

---

### Dashboard - Gerente de Obra

**Localização**: `/dashboard/gerente`

#### Layout
```
Obra: Edifício Inteligente (SP) | 🗺️ Ver Mapa
Status: EM_EXECUÇÃO (68%) | Data: 15/06/2026 - 20/12/2026

📊 PROGRESSO
├─ Progresso Planejado: 65% (no prazo)
├─ Progresso Real: 68% (adiantada +3%)
├─ Horas Trabalhadas: 485h / 730h planejadas
├─ Custo MO: R$ 24.250 / R$ 36.500 orçado
└─ Margem Atual: 18.5% ✅ (target: 15%)

📋 ORDENS DE SERVIÇO - RESUMO
┌────────────────────────────────────────┐
│ OS | Descrição    | Status   | % | 👥 │
├────────────────────────────────────────┤
│ 1  │ Fundações    │ ✅ 100%  | ✓ │ 3  │
│ 2  │ Estrutura    │ ⚠️ 75%   | ⚠ │ 8  │
│ 3  │ Revestimento │ 🔨 30%   | - │ 5  │
│ 4  │ Acabamento   │ ⏱️ Não  │ - │ -  │
│    │              │ iniciada │   │    │
└────────────────────────────────────────┘

📦 MATERIAIS - ÚLTIMOS PEDIDOS
[Material A] 50kg - Status: Recebido (3 dias atrás)
[Material B] 100m - Status: Em Pedido (entrega em 5 dias)
[Material C] 20un - Status: ⚠️ FALTANDO (solicitado +2 dias)

👥 EQUIPE HOJE
✅ 12 presentes | ⚠️ 1 falta | ❌ 1 folga | 🏥 1 afastamento

[+ Nova OS] [+ Tarefas] [✏️ Editar Obra] [📊 Relatórios]
```

#### Informações Detalhadas
- Progresso real vs planejado
- Status de cada OS
- Materiais em uso/pedidos
- Equipe escalada
- Alertas de desvios

#### Ações
- Criar nova OS
- Atribuir tarefas
- Validar apontamentos
- Gerar relatórios
- Editar cronograma

---

### Dashboard - Operacional

**Localização**: `/dashboard/operacional` (Mobile)

#### Layout Compacto
```
🏗️ MINHAS TAREFAS HOJE

📍 Obra: Edifício Inteligente

┌──────────────────────────┐
│ ✅ TAREFA 1 (Concluída)  │
│ Revestimento Bloco A     │
│ 08:00 - 12:30 (4.5h)     │
│ Com fotos ✓              │
└──────────────────────────┘

┌──────────────────────────┐
│ 🔨 TAREFA 2 (Em andamento) │
│ Revestimento Bloco B     │
│ 13:30 -                  │
│ Tempo: 2.5h até agora    │
│ 📷 Tirar foto de saída   │
│ [FINALIZAR] [Pause]      │
└──────────────────────────┘

┌──────────────────────────┐
│ ⏱️ TAREFA 3 (Próxima)    │
│ Revestimento Bloco C     │
│ 15:00 - 18:00            │
│ 👥 Com: João + Maria     │
│ [INICIAR]                │
└──────────────────────────┘

⏰ ENTRADA: 08:15 | SAÍDA: (Ainda trabalhando)
```

#### Funcionalidades
- Visualizar tarefas do dia
- Cronômetro integrado
- Capturar fotos
- Fazer apontamento
- Ver cronograma da obra

---

## ⚙️ TELAS DE GESTÃO

### Tela de Obras (CRUD)

**Localização**: `/obras`
**Acessível por**: Admin, Gerente

#### Listagem
```
┌─────────────────────────────────────────────────────┐
│ Obras - Sua Construtora                            │
│ [Filtros ▼] [Ordenar ▼] [+ Nova Obra]             │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Buscar: [_____________] | Status: [Todas ▼]       │
│                                                     │
│ ┌────────────────────────────────────────────────┐ │
│ │ Obra              │ Local    │ Status │ % │ Ações│
│ ├────────────────────────────────────────────────┤ │
│ │ Edifício ABC      │ São Paulo│ ✅ 68% │ ⚙ │ ... │
│ │ Residencial XYZ   │ Brasília │ ⚠️ 45% │ ⚙ │ ... │
│ │ Shopping Rio      │ Rio J.   │ 🔨 12% │ ⚙ │ ... │
│ │ Casa Verde        │ MG       │ ⏸️ 30% │ ⚙ │ ... │
│ │ Prédio Corp       │ SP       │ 📊 100%│ ⚙ │ ... │
│ └────────────────────────────────────────────────┘ │
│                          Página 1 de 3 [◀ 1 2 3 ▶] │
│                                                     │
└─────────────────────────────────────────────────────┘
```

#### Detalhes de Uma Obra
```
🏗️ Edifício ABC (São Paulo)

📋 INFORMAÇÕES GERAIS
├─ Localização: Av. Paulista, 1000 - São Paulo
├─ Cliente: ABC Imóveis
├─ Período: 01/03/2026 - 20/12/2026
└─ Status: EM_EXECUÇÃO

📊 PROGRESSO
├─ Progresso Planejado: 65%
├─ Progresso Real: 68%
├─ Gráfico de evolução (últimos 30 dias)
│  ▂▃▄▅▆▇ 68%
└─ Status: ✅ ADIANTADA (+3%)

💰 FINANCEIRO
├─ Orçado: R$ 150.000
├─ Gasto MO: R$ 24.250 (16%)
├─ Gasto Material: R$ 18.500 (12%)
├─ Total Gasto: R$ 42.750 (28%)
├─ Margem: 18.5% ✅
└─ Faturado: R$ 50.000 (33%)

👥 EQUIPE
├─ Gerente: João Silva
├─ Supervisor: Maria Santos
└─ Equipe: 15 pessoas

🗓️ CRONOGRAMA
├─ Fundações: ✅ Concluída
├─ Estrutura: 🔨 Em execução (75%)
├─ Revestimento: ⏱️ Próxima
└─ Acabamento: ⏱️ Próxima

[EDITAR] [PAUSAR] [GERAR RELATÓRIO] [✓ ENCERRAR]
```

#### Criar/Editar Obra
```
🆕 NOVA OBRA

Identificação:
├─ Nome: [_________________________________]
├─ Descrição: [_____________________________]
│            _____________________________
│            _____________________________
├─ Cliente Final: [_________________________]
└─ Local: [_______________________________]
  └─ Latitude: [_________] Longitude: [_________]
  └─ [Usar Mapa] 🗺️

Cronograma:
├─ Data Início Prevista: [__/__/____]
├─ Data Fim Prevista: [__/__/____]
└─ Duração: 263 dias

Financeiro:
├─ Orçamento Total: R$ [_____________]
├─ Custo Hora MO: R$ [_____________]
├─ Encargo Social: [___]%
└─ Margem Mínima: [___]% (target: 15%)

Equipe:
├─ Gerente Responsável: [Admin ▼]
├─ Equipe Mínima: [___] pessoas
└─ Supervisor Principal: [_________]

[CRIAR] [CANCELAR]
```

---

### Tela de Apontamentos

**Localização**: `/apontamentos`

#### Listagem (Desktop - Admin/Gerente)
```
📋 APONTAMENTOS - PERÍODO: JUN 2026

Filtros: [Obra ▼] [Operacional ▼] [Status ▼] [Data ▼]

┌────────────────────────────────────────────────────┐
│ Data     │ Operacional │ Obra  │ Horas │ Status │ ⚙️ │
├────────────────────────────────────────────────────┤
│ 11/06    │ João S.     │ Edif. │ 7.5h  │ ✅ A  │ ..│
│ 11/06    │ Maria T.    │ Edif. │ 8.0h  │ ⏳ P  │ ..│
│ 11/06    │ João S.     │ Shop  │ 8.0h  │ 🔍 V  │ ..│
│ 10/06    │ Pedro L.    │ Edif. │ 6.5h  │ ✅ A  │ ..│
│ 10/06    │ Ana C.      │ Res.  │ 4.0h  │ ⚠️ R  │ ..│
└────────────────────────────────────────────────────┘

Legenda: A=Aprovado | P=Pendente | V=Validado | R=Rejeitado
```

#### Fazer Apontamento (Mobile - Operacional)
```
📱 APONTAMENTO

Tarefa de Hoje: Revestimento Bloco A
Horário Entrada: 08:15 ✓

📍 Local: Avenida Paulista, 1000 (São Paulo)
       GPS: ✓ Capturado

📷 FOTOS
├─ Foto Entrada: ✓ (08:15)
└─ Foto Saída: [📷 Tirar Foto]

⏰ HORÁRIO SAÍDA
└─ [__:__] 

⏸️ INTERVALO (padrão 1h)
└─ [___] minutos

🎯 TAREFA
└─ Revestimento Bloco A ✓

📝 OBSERVAÇÕES
└─ [_____________________________]

💾 VALIDAÇÃO
├─ CPF: Criptografado (verificado)
├─ Biometria: ✓ Coletada
└─ Hash: c3a76... (integridade OK)

[ENVIAR APONTAMENTO] [SALVAR RASCUNHO]
```

#### Validação (Supervisor)
```
✔️ VALIDAR APONTAMENTO

João Silva | 11/06 | 08:15 - 17:00 (7.75h)
Tarefa: Revestimento Bloco A

📍 Geolocalização
├─ Entrada: Av. Paulista, 1000 ✓ (100m tolerância)
├─ Saída: Av. Paulista, 950 ✓ (100m tolerância)
└─ Mapa: 🗺️ Visualizar

📷 FOTOS
├─ Entrada: [Foto1 - 08:15] ✓ Qualidade OK
└─ Saída: [Foto2 - 17:00] ✓ Qualidade OK

⚠️ ALERTAS
├─ Sobreposição com Maria (14:00-16:00)?
│  └─ João: Revestimento A | Maria: Revestimento B
│  └─ [Localizações diferentes - OK]
│
└─ Intervalo: 1h (padrão) ✓

💰 CUSTO CALCULADO
├─ Horas: 7.75h
├─ Custo Hora: R$ 50.00
├─ Encargo: 40%
└─ Total: R$ 542.50

[APROVAR] [REJEITAR] [SOLICITAR EVIDÊNCIA]

Se rejeitar:
└─ Motivo: [_____________________________]
          _____________________________
```

---

### Tela de Materiais

**Localização**: `/materiais`

#### Gestão de Catálogo
```
📦 CATÁLOGO DE MATERIAIS

[+ Novo Material] [📥 Importar] [📊 Relatório]

Buscar: [_____________] | Categoria: [Todas ▼]

┌──────────────────────────────────────────────────┐
│ Código    │ Material     │ Unidade │ Preço │ ⚙️  │
├──────────────────────────────────────────────────┤
│ CONC-001  │ Concreto 25  │ m³      │ 250   │ ... │
│ CIME-001  │ Cimento      │ kg      │ 1.20  │ ... │
│ AREIA-01  │ Areia Média  │ m³      │ 80    │ ... │
│ ACO-001   │ Aço CA-50    │ kg      │ 5.50  │ ... │
│ TIJOLO-01 │ Tijolo 6 fur │ un      │ 0.80  │ ... │
│ HIDRA-01  │ Cal Hidrata. │ kg      │ 3.20  │ ... │
└──────────────────────────────────────────────────┘
```

#### Pedidos de Material
```
📋 PEDIDOS - JUN 2026

Status: [Todos ▼]

┌────────────────────────────────────────────────┐
│ ID   │ Obra      │ Material │ Qtd  │ Status   │
├────────────────────────────────────────────────┤
│ P001 │ Edif. ABC │ Concreto │ 50m³│ ✅ Rec. │
│ P002 │ Shop RJ   │ Cimento  │ 100 │ 🚚 Trans.│
│ P003 │ Res. MG   │ Aço      │ 500 │ ⏳ Solicit
│ P004 │ Edif. ABC │ Tijolo   │ 5k  │ ❌ Atraso│
└────────────────────────────────────────────────┘
```

---

### Tela de Usuários (Gestão de Equipe)

**Localização**: `/usuarios`
**Acessível por**: Admin, Gerente

#### Listagem
```
👥 USUÁRIOS DA CONSTRUTORA

[+ Novo Usuário] [📥 Importar] [📋 Relatório]

Filtro: [Ativos ▼] | Papel: [Todos ▼]

┌────────────────────────────────────────────────┐
│ Nome         │ Papel    │ Email      │ Status  │
├────────────────────────────────────────────────┤
│ João Silva   │ Gerente  │ j.silva... │ ✅ Ativo│
│ Maria Santos │ Supv.    │ m.santos.. │ ✅ Ativo│
│ Pedro Lima   │ Operac.  │ p.lima...  │ ✅ Ativo│
│ Ana Costa    │ Operac.  │ a.costa... │ ⚠️ Ina. │
│ Carlos Novo  │ Operac.  │ c.novo...  │ ✅ Ativo│
└────────────────────────────────────────────────┘
```

#### Criar/Editar Usuário
```
🆕 NOVO USUÁRIO

Informações Pessoais:
├─ Nome Completo: [__________________________]
├─ CPF: [___.___.___-__] (criptografado)
├─ Email: [_________________________________]
├─ Telefone: [________________________]
└─ Data Nascimento: [__/__/____]

Profissionais:
├─ Papel: [Gerente ▼]
│         Opções: Admin, Gerente, Supervisor, Operacional
├─ Departamento: [Canteiro ▼]
└─ Data de Admissão: [__/__/____]

Segurança:
├─ Senha: [____________________]
│        Requisitos: 8+ chars, maiúscula, número, especial
├─ Confirmar Senha: [____________________]
└─ Habilitar 2FA: [ ]

Permissões Especiais:
└─ [ ] Aprovar faturas
   [ ] Resetar senhas
   [ ] Deletar dados
   [ ] Acessar relatórios financeiros

[CRIAR] [CANCELAR]
```

---

## 📊 TELAS DE RELATÓRIOS

### Relatório Executivo
```
📊 RELATÓRIO EXECUTIVO - JUNHO 2026

Período: 01/06/2026 - 30/06/2026

RESUMO OPERACIONAL
├─ Obras Ativas: 5
├─ Total de Apontamentos: 1.247
├─ Horas Trabalhadas: 9.976h
├─ Apontamentos Aprovados: 98.5%
├─ Taxa de Erros: 1.5%
└─ Fotos Documentadas: 3.421

RESUMO FINANCEIRO
├─ Faturado: R$ 250.500
├─ Custo MO: R$ 125.300
├─ Custo Material: R$ 78.200
├─ Margem Total: 16.8% ✅
├─ Recebido: R$ 180.000
└─ Pendente: R$ 70.500

TOP 3 OBRAS POR FATURAMENTO
1. Edifício ABC (SP): R$ 125.000 | 68% | ✅
2. Shopping RJ (RJ): R$ 89.500 | 45% | ⚠️
3. Residencial MG (MG): R$ 36.000 | 12% | 🔨

DESVIOS E ALERTAS
⚠️ Obra "Shopping RJ" atrasada 3 dias
❌ 15 apontamentos rejeitados
📦 Material "Cimento" com estoque baixo
💰 Margem abaixo de 15% em 1 obra

[PDF] [XLSX] [ENVIAR EMAIL]
```

---

## 🔐 TELAS DE CONFIGURAÇÃO E SEGURANÇA

### Configurações da Construtora
```
⚙️ CONFIGURAÇÕES DA EMPRESA

├─ DADOS GERAIS
│  ├─ Razão Social: [XYZ Construtora]
│  ├─ CNPJ: [14.000.000/0001-00]
│  ├─ Email Corporativo: [admin@xyz.com]
│  └─ Telefone: [(11) 99999-9999]
│
├─ PARAMETRIZAÇÃO OPERACIONAL
│  ├─ Custo Hora MO Padrão: R$ [50.00]
│  ├─ Encargo Social: [40]%
│  ├─ Intervalo Almoço: [1.0] hora
│  ├─ Tolerância GPS: [100] metros
│  ├─ Dias para Arquivo: [30] dias
│  └─ Margem Mínima: [15]%
│
├─ INTEGRAÇÕES
│  ├─ ERP Conectado: [SAP ▼]
│  ├─ Status: ✅ Sincronizando
│  ├─ Último Sync: 11/06 14:30
│  └─ [Testar Conexão] [Reconectar]
│
├─ SEGURANÇA
│  ├─ 2FA Obrigatório: [Sim]
│  ├─ Expiração de Sessão: [30] minutos
│  └─ [RESETAR SENHAS] [VER LOGS]
│
└─ ASSINATURA
   ├─ Plano: Enterprise
   ├─ Vencimento: 30/07/2026
   ├─ Valor Mensal: R$ 2.500
   └─ [FAZER UPGRADE]
```

---

**Última atualização**: 11 de junho de 2026
**Versão**: 1.0
