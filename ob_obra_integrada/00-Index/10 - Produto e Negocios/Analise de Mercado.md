# Análise de Mercado — Obra Integrada
## Estudo de Viabilidade e Panorama de Concorrentes

**Versão:** 1.0 | **Data:** 13 de junho de 2026 | **Status:** Aprovado

---

## 1. Panorama da Construção Civil Habitacional (SMEs)

A indústria da construção civil no Brasil é historicamente conhecida pela baixa digitalização, processos fragmentados e alta dependência de mão de obra operacional. No entanto, o segmento de construtoras de pequeno e médio porte (PMEs) representa a maior fatia em número de empresas ativas no país.

### 1.1 Cenário Atual
- **Baixa Maturidade Digital:** A maior parte das PMEs da construção ainda gerencia o canteiro de obras usando cadernos físicos, planilhas de Excel compartilhadas via WhatsApp e registros em papel.
- **Pressão por Custos:** Com a variação constante do custo de materiais e insumos (representada pelo índice INCC-M), a margem das construtoras é pressionada. A falta de controle em tempo real gera desvios que variam de 15% a 30% do orçamento inicial da obra.
- **Exigência de Conformidade:** Fiscalizações trabalhistas (normas regulamentadoras de segurança NR) e exigências legais de proteção de dados (LGPD - dados pessoais comuns e dados de saúde no PCMSO/NR-7) demandam dos gestores um controle sistemático que as planilhas comuns não conseguem oferecer.

---

## 2. Dimensionamento de Mercado (TAM, SAM, SOM)

```
┌────────────────────────────────────────────────────────┐
│ TAM — Total Addressable Market                         │
│ Mercado total de construtoras no Brasil                │
│ ~ 150.000 construtoras ativas (IBGE/Sinduscon)          │
├────────────────────────────────────────────────────────┤
│ SAM — Serviceable Addressable Market                   │
│ Foco em Construtoras PME (5 a 500 funcionários)        │
│ ~ 45.000 empresas                                      │
├────────────────────────────────────────────────────────┤
│ SOM — Serviceable Obtainable Market                    │
│ Meta de penetração da plataforma nos primeiros 3 anos │
│ ~ 900 construtoras (~2% do SAM)                        │
└────────────────────────────────────────────────────────┘
```

- **TAM (Total Addressable Market):** O mercado total compreende todas as empresas de engenharia civil, arquitetura e construção registradas no Brasil, estimado em aproximadamente 150.000 CNPJs ativos.
- **SAM (Serviceable Addressable Market):** Filtrando para o foco de atuação (construtoras PMEs, escritórios de engenharia estruturada e empreiteiras que faturem de R$ 500k a R$ 20M por ano), o mercado viável é de aproximadamente 45.000 empresas.
- **SOM (Serviceable Obtainable Market):** A meta realista de captação comercial nos primeiros 3 anos de operação da plataforma, focando em marketing digital B2B focado e parcerias regionais, é de 900 clientes ativos.

---

## 3. Análise de Concorrentes

A tabela abaixo compara o posicionamento da plataforma **Obra Integrada** em relação aos principais competidores do mercado nacional.

| Concorrente | Perfil | Pontos Fortes | Pontos Fracos | Posicionamento do Obra Integrada vs Concorrente |
|-------------|--------|---------------|---------------|------------------------------------------------|
| **Sienge (Softplan)** | ERP Corporativo Enterprise | Extremamente robusto, cobre contabilidade e suprimentos | Preço muito alto, implantação lenta (meses), interface complexa | O Obra Integrada atende à fatia de PMEs que acham o Sienge caro e complexo demais para sua operação. |
| **Obra Prima** | SaaS para PMEs | Bom controle financeiro, app de diário de obra estável | Interface visual ultrapassada, custos elevados de suporte | Foco em design premium, excelente usabilidade no campo e integração nativa com auditoria e conformidade. |
| **Mobuss Construção** | Foco em controle de campo | Robusto para diário e controle de qualidade | Pouco flexível para gestão de micro-tarefas e orçamentos | O Obra Integrada traz maior agilidade e simplicidade no planejamento e cronograma físico-financeiro. |
| **Eva (Construção)** | SaaS para obras residenciais | Foco no cliente final e no arquiteto | Não atende construtoras estruturadas, fraco em segurança | O Obra Integrada atende ao lado corporativo da construtora com controle B2B maduro. |

---

## 4. Análise SWOT (F.O.F.A.)

### Forças (Strengths)
- **Foco em Conformidade Integrada:** Primeira plataforma a trazer suporte nativo para conformidade com a LGPD (especialmente dados sensíveis de segurança do trabalho como NR e PCMSO) e regras da ANPD (Resolução nº 15/2024).
- **Aesthetics Premium:** Interface moderna (glassmorphism, dark mode nativo e transições suaves) que aumenta o engajamento e a facilidade de uso do trabalhador de canteiro.
- **Arquitetura Escalável:** Desenvolvimento serverless na Vercel com Neon DB Postgres, oferecendo alta performance com baixo custo operacional.

### Fraquezas (Weaknesses)
- **Falta de Módulo Contábil/Fiscal Completo:** A plataforma não é um ERP contábil nativo (depende de integrações futuras).
- **Sem API de Terceiros Própria no MVP:** Integrações com SINAPI e EMOP serão manuais (via upload de planilhas estruturadas) na fase inicial de implantação.
- **Ausência de Aplicativo Nativo (iOS/Android):** O MVP utiliza PWA (Progressive Web App), o que pode ter limitações menores de hardware vs app nativo.

### Oportunidades (Opportunities)
- **Obrigatoriedade de CNO e eSocial:** A cobrança rígida do governo por conformidade com segurança do trabalho força construtoras a buscarem sistemas de gestão organizados.
- **Digitalização Acelerada:** Nova geração de gestores de construtoras familiares exige ferramentas baseadas em nuvem e mobile.
- **Integração com IA:** Uso de modelos de linguagem para análise inteligente de diários de obra (RDOs) e alertas de produtividade.

### Ameaças (Threats)
- **Consolidação de Concorrentes:** Fusões e aquisições no mercado de construtechs (como a Softplan adquirindo empresas menores).
- **Resistência Cultural:** Trabalhadores e encarregados antigos resistindo ao uso de ferramentas digitais no canteiro de obras.
- **Mudanças Regulatórias:** Novas portarias e exigências técnicas que exijam refatoração rápida dos módulos do sistema.

---

## 5. Principais Tendências de Mercado

1. **ESG na Construção Civil:** Sistemas que facilitem o descarte correto de materiais (NR-18) e controle de produtividade socialmente responsável.
2. **Mobile-First / Offline-First:** Conectividade intermitente em canteiros de subsolos ou áreas isoladas exige sincronização em segundo plano estável.
3. **Data-Driven Construction:** Engenheiros não querem apenas preencher diários de obra; querem relatórios que mostrem desvios de cronograma calculados automaticamente (Curva S).
