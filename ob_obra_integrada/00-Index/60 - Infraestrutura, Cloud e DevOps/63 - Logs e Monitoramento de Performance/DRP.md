# DRP — Disaster Recovery Plan
## Obra Integrada — Plano de Recuperação de Desastres

**Versão:** 1.0 | **Data:** 13/06/2026 | **Referência:** ISO 22301 + NIST SP 800-34

---

## 1. Objetivos

| Objetivo | Meta |
|----------|------|
| **RTO** — Recovery Time Objective (tempo máximo para restaurar o serviço) | **4 horas** |
| **RPO** — Recovery Point Objective (perda máxima de dados aceitável) | **24 horas** |
| **MTTR** — Mean Time to Restore | < 2 horas |

---

## 2. Cenários de Desastre

| # | Cenário | Probabilidade | Impacto | Classificação |
|---|---------|-------------|---------|--------------|
| 1 | Banco de dados corrompido ou perdido | Baixa | Catastrófico | **P1 — Crítico** |
| 2 | Indisponibilidade total da Vercel | Baixa | Catastrófico | **P1 — Crítico** |
| 3 | Indisponibilidade do NeonDB | Baixa | Catastrófico | **P1 — Crítico** |
| 4 | Vazamento de JWT_SECRET | Média | Alto | **P1 — Crítico** |
| 5 | Comprometimento de conta admin | Baixa | Alto | P2 — Alto |
| 6 | Perda de arquivos no storage | Baixa | Alto | P2 — Alto |
| 7 | Exclusão acidental de dados de produção | Baixa | Alto | P2 — Alto |
| 8 | Indisponibilidade parcial (1 região) | Média | Médio | P3 — Médio |

---

## 3. Procedimentos de Recuperação

### Cenário 1 — Banco de Dados Corrompido

**Responsável:** Pessoa 5 (DevOps) + Pessoa 1 (Tech Lead)  
**Tempo estimado:** 1–2 horas

```
Passo 1 (0–15min): DETECTAR e COMUNICAR
  ├── Verificar status no painel NeonDB
  ├── Verificar logs de erro no painel Vercel
  └── Notificar equipe pelo canal de incidentes

Passo 2 (15–30min): AVALIAR
  ├── Identificar o último backup disponível
  ├── Estimar volume de dados perdidos (RPO check)
  └── Decidir: restaurar backup OU reconstruir com migration

Passo 3 (30–90min): RESTAURAR
  ├── Via NeonDB: Branch → Restore from backup → Select timestamp
  ├── Executar: npx prisma migrate deploy (validar schema)
  └── Executar seed de dados estáticos se necessário

Passo 4 (90–120min): VALIDAR
  ├── Testar login, CRUD básico, relatórios
  ├── Verificar integridade dos dados críticos
  └── Confirmar com 1 usuário real (construtora de teste)

Passo 5: COMUNICAR recuperação
  └── Notificar tenants afetados por e-mail
```

### Cenário 2 — Indisponibilidade Total da Vercel

**Responsável:** Pessoa 5 (DevOps)  
**Tempo estimado:** 30min–2 horas

```
Passo 1: Verificar status em vercel.com/incidents
Passo 2: Se > 30min sem resolução, ativar fallback:
  ├── Opção A: Railway.app (deploy rápido do mesmo repo)
  ├── Opção B: Render.com (backup de hosting)
  └── Opção C: Fly.io (serverless alternativo)
Passo 3: Atualizar DNS (CNAME) para novo provedor
Passo 4: Comunicar usuários sobre indisponibilidade
```

### Cenário 4 — Vazamento de JWT_SECRET

**Responsável:** Pessoa 1 (Tech Lead) — URGÊNCIA MÁXIMA  
**Tempo estimado:** 30–60 minutos

```
PASSO 1 (imediato — 0–5min):
  ├── Revogar o JWT_SECRET comprometido no painel Vercel
  └── Gerar novo: openssl rand -hex 64

PASSO 2 (5–10min):
  ├── Configurar novo JWT_SECRET nas env vars da Vercel
  └── Forçar redeploy do backend

EFEITO: Todos os tokens anteriores se tornam inválidos.
Todos os usuários precisarão fazer login novamente.

PASSO 3 (10–30min):
  ├── Investigar como o secret vazou (Git? CI? Logs?)
  ├── Notificar usuários sobre necessidade de novo login
  └── Registrar incidente no Registro de Incidentes

PASSO 4 (30–60min):
  ├── RCA (Root Cause Analysis)
  └── Decidir se é necessário notificar ANPD
```

### Cenário 7 — Exclusão Acidental de Dados em Produção

```
PASSO 1: PARAR toda atividade no banco (readonly mode se possível)
PASSO 2: NeonDB → Console → Branching → Create branch from production
PASSO 3: Restaurar backup de menor diff disponível
PASSO 4: Exportar dados recuperados → Import na branch de prod
PASSO 5: Validar integridade e comunicar
```

---

## 4. Plano de Comunicação durante Desastre

| Audiência | Canal | Responsável | Timing |
|-----------|-------|-------------|--------|
| Time interno | Canal de emergência (WhatsApp/Slack) | Qualquer membro | Imediato |
| Tenants afetados | E-mail + status page | Pessoa 1 ou 5 | Em até 30min |
| ANPD (se dados comprometidos) | Portal ANPD | DPO | 6 dias úteis |

**Template de comunicação (tenants):**
```
Assunto: [Obra Integrada] Indisponibilidade — Atualização

Prezados clientes,

Estamos cientes de uma indisponibilidade na plataforma Obra Integrada.
Nosso time está trabalhando na resolução.

Status: Em andamento
Início: [HH:MM - DATA]
Estimativa de resolução: [HH:MM]
Dados afetados: [Descrever ou "Nenhum dado foi perdido"]

Atualizações em: [URL da status page]
```

---

## 5. Inventário de Sistemas Críticos

| Sistema | Provedor | SLA do provedor | Backup? | RTO interno |
|---------|---------|----------------|---------|-------------|
| Backend API | Vercel | 99,99% | N/A (stateless) | 1h (redeploy) |
| Banco de dados | NeonDB | 99,95% | ✅ Diário (7 dias) | 2h |
| Storage de arquivos | A definir (S3/R2) | 99,99% | ✅ S3 (11 noves) | 1h |
| DNS | [provedor] | 99,9% | N/A | 2h (TTL) |
| Repositório Git | GitHub | 99,9% | ✅ | N/A |

---

## 6. Teste do DRP

| Tipo de teste | Frequência | Responsável |
|--------------|-----------|-------------|
| Walkthrough (leitura do plano) | Semestral | Toda equipe |
| Simulação tabletop | Anual | Pessoa 1 + 5 |
| Teste real de restauração | A cada 6 meses | Pessoa 5 |
| Teste de failover de hospedagem | Anual | Pessoa 5 |

---

**Versão:** 1.0 | **Data:** 13/06/2026 | **Responsável:** DevOps (Pessoa 5)
