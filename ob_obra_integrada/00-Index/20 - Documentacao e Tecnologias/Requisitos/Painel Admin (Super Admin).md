# Painel de Administração Geral (Super Admin)
## Especificação de Interface e Requisitos Funcionais do Painel SaaS

**Versão:** 1.0 | **Data:** 13 de junho de 2026 | **Referência:** OWASP API Security Top 10 + ISO 27001 (Controle de Acesso)

---

## 1. Introdução e Controle de Acesso

O **Painel de Administração Geral (Super Admin)** é a interface de controle mestre da plataforma Obra Integrada. O acesso a esta interface é restrito exclusivamente a funcionários autorizados da empresa provedora do software (Diretores, Engenheiros de DevOps e Suporte Técnico L2/L3). 

> [!CAUTION]
> Os usuários do painel Super Admin têm poder de leitura e controle global sobre o ecossistema. Portanto, as rotas associadas a este painel devem ser protegidas com autenticação multifator (MFA) obrigatória, detecção de anomalias de login e gravação imutável de logs de auditoria para todas as ações executadas.

---

## 2. Layouts da Interface (ASCII Art)

### 2.1 Dashboard Global da Plataforma
Exibe as métricas de saúde operacional e faturamento consolidado do SaaS.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ OBRA INTEGRADA ── PAINEL DO ADMINISTRADOR GLOBAL (SUPER ADMIN)              │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📄 Clientes   🎛️ Feature Flags   ⚙️ Configurações   📊 Banco   👤 Meu Perfil │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  MÉTRICAS DE NEGÓCIO                   MÉTRICAS DE INFRAESTRUTURA           │
│  ┌──────────────────────────────────┐  ┌──────────────────────────────────┐ │
│  │ Clientes Ativos: 42   (Starters) │  │ Banco (Neon DB): 12% CPU (OK)    │ │
│  │ MRR Faturamento: R$ 41.250,00    │  │ Storage Total Usado: 242.4 GB    │ │
│  │ Usuários Simultâneos: 184        │  │ Latência Média API: 312ms        │ │
│  └──────────────────────────────────┘  └──────────────────────────────────┘ │
│                                                                             │
│  ALERTAS OPERACIONAIS EM ABERTO                                             │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ [14:22] ⚠️ Tentativa de login suspeita (Tenant 12, IP 182.92.12.3)      │ │
│  │ [12:05] 🔴 Falha de upload (Neon connection limit, Tenant 35)          │ │
│  │ [09:12] ⚠️ Consumo de CPU Neon DB acima de 80% (Duração: 4 minutos)     │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Gerenciador de Clientes (Tenants)
Listagem e provisionamento de construtoras no SaaS.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ GERENCIADOR DE CLIENTES (TENANTS)                             [+ NOVO TENANT]│
├─────────────────────────────────────────────────────────────────────────────┤
│ Buscar: [ Construtora XYZ           ] Status: [ Ativos ▾ ] Plano: [ Todos ▾ ]│
├─────────────────────────────────────────────────────────────────────────────┤
│ Razão Social           CNPJ              Plano         Status    Ações      │
├─────────────────────────────────────────────────────────────────────────────┤
│ Construtora Alfa Ltda  12.345.678/0001-90  PRO           🟢 ATIVO  [Editar]   │
│ Empreiteiras Beta S/A  98.765.432/0001-11  GROWTH        🟢 ATIVO  [Editar]   │
│ Construtora Delta Eireli 45.678.901/0001-22 STARTER      🔴 SUSP.  [Editar]   │
├─────────────────────────────────────────────────────────────────────────────┤
│ Mostrando 1-3 de 42 clientes                                  ◀ Anterior  Próximo ▶│
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Detalhes de Cliente e Controle de Feature Flags
Tela para alteração de planos e toggles específicos de validações de negócio.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ DETALHES DO CLIENTE: CONSTRUTORA ALFA LTDA                     [SUSPENDER] │
├─────────────────────────────────────────────────────────────────────────────┤
│ CNPJ: 12.345.678/0001-90 | Plano: [ PRO ▾ ] | Data Adesão: 12/04/2026       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CONTROLE DE CONFIGURAÇÕES E FEATURE FLAGS                                  │
│  [🔘] Exigir assinatura de Qualidade (QC) para conclusão de OS              │
│  [🔘] Verificar validades de certificações NR no canteiro                  │
│  [🔘] Travar consumo de material contra teto de orçamento (BOM Estrita)     │
│  [🔘] Exigir evidência fotográfica no Diário de Obra (RDO)                  │
│  [🔘] Obrigar captura de geolocalização (GPS) no aplicativo móvel           │
│                                                                             │
│  🛠️ SUPORTE TÉCNICO                                                         │
│  [ ACESSAR TELA DO CLIENTE (IMPERSONATION) ]                                │
│                                                                             │
│                                                     [ SALVAR ALTERAÇÕES ]   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Requisitos Funcionais do Painel Admin

- **RF-A01 (Provisionamento de Novo Tenant):** O administrador do sistema deve poder cadastrar uma nova construtora informando CNPJ, Razão Social, Plano Selecionado (Starter, Pro, Growth, Enterprise) e e-mail do primeiro usuário administrador (`ADMIN_MASTER`).
- **RF-A02 (Toggle de Feature Flags):** Permitir a ativação ou desativação de travas de negócio específicas por cliente, controlando a rigidez operacional exigida na plataforma no canteiro de obras.
- **RF-A03 (Alteração de Status de Cobrança):** O painel deve permitir a suspensão de acesso de um tenant em caso de inadimplência financeira ou reativação imediata após regularização.
- **RF-A04 (Impersonation / Acesso de Suporte):** Para depurar bugs operacionais reportados, o Super Admin de nível de suporte L3 deve poder se "impersonar" como o usuário da construtora, visualizando temporariamente as mesmas telas daquele cliente sem necessitar saber sua senha pessoal.
- **RF-A05 (Atualização de Tabelas de Preços):** O painel Super Admin deve possuir rotas de upload para importação e substituição das planilhas de referência nacional (SINAPI, EMOP e índice econômico INCC-M).

---

## 4. Auditoria e Rastreabilidade do Super Admin

Toda ação realizada através da interface Super Admin envolve riscos de violação de conformidade da LGPD (visto que visualiza dados de múltiplos tenants).
- **Log de Auditoria Obrigatório:** Qualquer comando de escrita no banco de dados admin, alteração de feature flags ou acionamento de impersonation de suporte deve gravar obrigatoriamente um registro irrecuperável na tabela `tb_log_auditoria` do PostgreSQL contendo:
  - UUID do Administrador.
  - IP de Origem e Geolocalização de rede aproximada.
  - Ação executada (Ex: `SUPER_ADMIN_IMPERSONATION_START`, `FEATURE_FLAG_TOGGLE`).
  - Target (Ex: `id_tenant_afetado`).
  - Timestamp preciso (UTC).
