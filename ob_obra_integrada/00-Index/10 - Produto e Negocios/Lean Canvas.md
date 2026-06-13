# Lean Canvas — Obra Integrada
## Modelo de Negócio em Uma Página

**Versão:** 1.0 | **Data:** 13/06/2026

---

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           LEAN CANVAS — OBRA INTEGRADA                         │
├──────────────────┬───────────────────────────────────────┬──────────────────────┤
│   PROBLEMA       │           SOLUÇÃO                      │  PROPOSTA ÚNICA      │
│                  │                                        │  DE VALOR            │
│ 1. Diário de     │ 1. Diário digital com foto,            │                      │
│ obra em caderno  │    GPS e status de auditoria           │ "A única plataforma  │
│ → sem rastreio   │                                        │ que integra QUEM     │
│                  │ 2. Dashboard executivo por             │ fez O QUE, ONDE e    │
│ 2. Financeiro    │    obra e pela empresa                 │ QUANDO — do canteiro │
│ em planilhas     │                                        │ ao financeiro"       │
│ espalhadas       │ 3. Financeiro centralizado             │                      │
│                  │    com comprovantes                    │ Para construtoras    │
│ 3. Comunicação   │                                        │ que ainda usam       │
│ por WhatsApp     │ 4. RBAC com 7 perfis                   │ caderno e WhatsApp   │
│ → sem controle   │    (do peão ao proprietário)           │                      │
├──────────────────┴───────────────────────────────────────┤                      │
│   MÉTRICAS-CHAVE                                         │                      │
│                                                          │                      │
│ • Obras ativas por construtora (meta: ≥ 3/tenant)        │                      │
│ • NPS dos usuários (meta: ≥ 50)                          │                      │
│ • DAU/MAU (meta: ≥ 60%)                                  │                      │
│ • Churn mensal (meta: < 5%)                              │                      │
│ • Tempo médio de abertura do diário (meta: < 3min)       │                      │
├──────────────────────────────────────────────────────────┤──────────────────────┤
│   SEGMENTOS DE CLIENTES                                  │  CANAIS              │
│                                                          │                      │
│ Early Adopters:                                          │ • Indicação direta   │
│ • Construtoras 5–50 func.                                │ • LinkedIn B2B       │
│ • Dono que também é engenheiro                           │ • Engenheiros CREA   │
│ • Obra residencial ou comercial pequeno/médio            │ • Parceiros contábeis│
│                                                          │                      │
│ Segmento principal:                                      │ • Demo gratuita 14d  │
│ • Construtoras 50–500 func.                              │ • YouTube (tutoriais)│
│ • Tem engenheiro + mestre + equipe                       │                      │
│ • Rio de Janeiro, São Paulo, BH                          │                      │
├───────────────────────────────────────────────────────────────────────────────-─┤
│   ESTRUTURA DE CUSTOS                 │  FLUXO DE RECEITA                       │
│                                       │                                         │
│ • Infraestrutura (Vercel + NeonDB):   │ • SaaS mensal por tenant                │
│   ~$20–100/mês em escala              │                                         │
│ • Storage (S3/R2): ~$5/mês inicial    │ Plano Básico: R$ 199/mês (até 3 obras)  │
│ • Desenvolvimento: equipe interna     │ Plano Pro: R$ 499/mês (ilimitado)       │
│ • Suporte: 1 pessoa em tempo parcial  │ Plano Enterprise: sob consulta          │
│ • Domínio + certificado: ~$20/ano     │                                         │
│                                       │ Setup fee: R$ 500 (opcional)            │
│ CAC estimado: R$ 300–800              │ Consultoria de implantação: R$ 200/h    │
│ LTV estimado: R$ 6.000–15.000         │                                         │
└───────────────────────────────────────┴─────────────────────────────────────────┘

VANTAGEM INJUSTA:
• Criado por quem trabalha na construção civil (conhecimento de domínio real)
• Foco no Brasil (LGPD, NR, INCC, SINAPI nativo)
• Preço 10x menor que ERPs tradicionais (Sienge, Obra Prima)
```

---

## Hipóteses a Validar (Antes de Escalar)

| # | Hipótese | Métrica de validação | Status |
|---|---------|---------------------|--------|
| H1 | Construtoras pagariam R$ 199/mês por isso | 5 clientes pagantes | ⏳ Validar |
| H2 | Engenheiro usa o app pelo menos 3x/semana | DAU ≥ 60% | ⏳ Validar |
| H3 | Mestre de obras consegue usar sem treinamento | Onboarding < 10min | ⏳ Validar |
| H4 | CAC < R$ 500 via indicação | Custo de aquisição medido | ⏳ Validar |
