---
tags: [sla, disponibilidade, suporte, servico, saas, contrato]
aliases: [SLA, Service Level Agreement, Acordo de Nível de Serviço]
atualizado: 2026-06-13
versao: 1.0-draft
status: rascunho — pendente revisão e aprovação técnica
---

# 📊 SLA — Service Level Agreement (Acordo de Nível de Serviço)

**Obra Integrada — Plataforma SaaS para Gestão de Obras**  
**Versão:** 1.0 (rascunho)  
**Vigência:** A partir da assinatura do Contrato de Licença SaaS

---

## 1. Definições

| Termo | Definição |
|-------|-----------|
| **Uptime** | Percentual de tempo em que a plataforma está operacional e acessível |
| **Downtime** | Período em que a plataforma está indisponível para usuários finais |
| **Tempo de Resposta** | Tempo entre a abertura de um chamado e a primeira resposta humana |
| **Tempo de Resolução** | Tempo entre a abertura de um chamado e a solução final |
| **Janela de Manutenção** | Períodos programados de indisponibilidade, previamente comunicados |
| **Incidente** | Evento que causa degradação ou indisponibilidade do serviço |

---

## 2. Compromisso de Disponibilidade

### 2.1 Meta de Uptime

| Plano | Uptime Mensal | Downtime permitido/mês |
|-------|--------------|----------------------|
| **Padrão** | **99,5%** | ~3h 36min |
| **Pro** (futuro) | **99,9%** | ~43min |

> **Como é calculado:** `Uptime (%) = ((Minutos no mês - Downtime em minutos) / Minutos no mês) × 100`

### 2.2 Exclusões do SLA (não contam como Downtime)

- ✅ Manutenções programadas notificadas com ≥24h de antecedência
- ✅ Falhas causadas por ações do próprio Tenant (ex: configurações incorretas)
- ✅ Eventos de força maior (desastres naturais, falhas de ISPs globais)
- ✅ Ataques DDoS ativos sendo mitigados
- ✅ Falhas de terceiros fora do controle da Obra Integrada (ex: queda total da Vercel ou NeonDB)

### 2.3 Status da Plataforma

A disponibilidade em tempo real será monitorada em:
- **Página de status:** [URL/status] — *(a implementar)*
- Notificações por e-mail em caso de incidentes

---

## 3. Categorias de Incidentes e Tempos de Resposta

| Prioridade | Descrição | Exemplo | Tempo de Resposta | Tempo de Resolução |
|-----------|-----------|---------|-------------------|-------------------|
| 🔴 **P1 — Crítico** | Plataforma totalmente indisponível | Erro 500 em todas as rotas | **1 hora útil** | **4 horas úteis** |
| 🟠 **P2 — Alto** | Funcionalidade crítica inoperante | Login não funciona, dados não salvam | **2 horas úteis** | **8 horas úteis** |
| 🟡 **P3 — Médio** | Funcionalidade parcialmente degradada | Relatório lento, upload intermitente | **4 horas úteis** | **3 dias úteis** |
| 🟢 **P4 — Baixo** | Problema cosmético ou não urgente | Layout fora do lugar, texto errado | **1 dia útil** | **7 dias úteis** |

**Horário de atendimento:** Segunda a sexta, 9h–18h (horário de Brasília)  
**Incidentes P1/P2:** Atendimento emergencial pode ser acionado fora do horário.

---

## 4. Canais de Suporte

| Canal | Uso | Horário |
|-------|-----|---------|
| **E-mail:** suporte@obraintegrada.com.br | Chamados em geral | 9h–18h |
| **E-mail:** security@obraintegrada.com.br | Incidentes de segurança | 24/7 |
| **Portal de suporte:** [URL/suporte] (a implementar) | Abertura e acompanhamento de chamados | 24/7 |

### Informações necessárias ao abrir chamado:
1. Nome e e-mail do responsável
2. Descrição detalhada do problema
3. Passos para reproduzir
4. Prints ou vídeos (quando aplicável)
5. Impacto nos usuários/obras afetadas

---

## 5. Manutenções Programadas

- **Janela preferencial:** Terças-feiras, das 2h às 4h (Brasília)
- **Aviso prévio:** Mínimo de **24 horas** por e-mail cadastrado
- **Comunicação:** Via e-mail e página de status
- **Frequência:** Não ultrapassar 1 manutenção programada por semana salvo necessidade crítica de segurança

---

## 6. Créditos por Descumprimento

Caso o Uptime mensal fique abaixo da meta, o Tenant terá direito a créditos no próximo ciclo de cobrança:

| Uptime atingido | Crédito concedido |
|----------------|------------------|
| 99,0% – 99,4% | 10% do valor mensal |
| 98,0% – 98,9% | 25% do valor mensal |
| 95,0% – 97,9% | 50% do valor mensal |
| Abaixo de 95% | 100% do valor mensal |

> **Limite:** O total de créditos em um mês não excederá o valor mensal pago.  
> **Como solicitar:** E-mail para suporte@obraintegrada.com.br em até **15 dias** após o mês de referência.

---

## 7. Backups e Recuperação de Dados

| Item | Especificação |
|------|--------------|
| Frequência de backup | Diária (automático via NeonDB) |
| Retenção de backups | 7 dias (plano padrão) |
| RTO — Recovery Time Objective | 4 horas (tempo para restaurar o serviço) |
| RPO — Recovery Point Objective | 24 horas (perda máxima de dados em caso de falha grave) |
| Localização dos backups | Região separada da produção |

---

## 8. Segurança e Conformidade

| Comprometimento | Detalhe |
|-----------------|---------|
| LGPD | Conformidade com a Lei 13.709/2018 |
| Notificação de incidentes | Conforme ANPD Res. 15/2024 (6 dias úteis) |
| Criptografia em trânsito | TLS 1.2+ (HTTPS obrigatório) |
| Criptografia em repouso | AES-256 para dados sensíveis (em implementação) |
| Logs de auditoria | 5 anos de retenção |

---

## 9. Limitações

Este SLA não se aplica a:
- Ambiente de desenvolvimento/staging
- Funcionalidades marcadas como "beta" ou "experimental"
- Integrações com sistemas de terceiros externos (ex: SINAPI, INCC, APIs externas)

---

## 10. Revisão do SLA

Este documento é revisado anualmente ou quando houver mudanças relevantes na infraestrutura. O Tenant será notificado com **30 dias de antecedência** sobre qualquer mudança nos compromissos.

---

**Versão:** 1.0-draft | **Data:** 13/06/2026  
**Status:** ⚠️ Rascunho — métricas a serem confirmadas pela equipe de infraestrutura antes de publicação
