# Business Model Canvas (BMC) — Obra Integrada
## Modelo de Negócio da Plataforma SaaS

**Versão:** 1.0 | **Data:** 13 de junho de 2026 | **Status:** Aprovado

---

## O Canvas em Uma Página

```
┌────────────────────────┬────────────────────────┬────────────────────────┬────────────────────────┬────────────────────────┐
│ Parceiros-Chave        │ Atividades-Chave       │ Propostas de Valor     │ Relacionamento         │ Segmentos Clientes     │
│                        │                        │                        │                        │                        │
│ • Provedores de Cloud  │ • Desenvolvimento SaaS │ • Gestão de obras real-│ • Self-service (SaaS)  │ • Construtoras PME     │
│   (Vercel, Neon DB)    │   e melhoria contínua  │   time e sem papel     │ • Suporte automatizado │   (5-500 funcionários) │
│ • Sindicatos da Const. │ • Suporte ao cliente   │ • Conformidade legal   │   e SLA garantido      │ • Engenheiros autônomos│
│   (Sinduscon) para     │   e suporte técnico    │   (LGPD, NRs e INCC)   │ • CS dedicado (Enterprise│  e gestores de projetos│
│   tabelas e índices    │ • Marketing B2B e      │ • Redução de perdas e  │ • Comunidade/Blog de   │ • Cooperativas e      │
│ • Fornecedores de API  │   vendas consultivas   │   desvios em 20-30%    │   boas práticas        │   escritórios de eng.  │
│   (APIs de índices)    │                        │                        │                        │                        │
├────────────────────────┼────────────────────────┤                        ├────────────────────────┼────────────────────────┤
│ Recursos-Chave         │ Canais                 │                        │ Estrutura de Custos    │ Fontes de Receita      │
│                        │                        │                        │                        │                        │
│ • Infraestrutura de TI │ • Vendas diretas (Inbound)                      │ • Infraestrutura Cloud │ • Assinatura mensal e  │
│   serverless e banco   │ • Parceiros e consultores                      │   (hosting, DB, API)   │   anual (Planos SaaS)  │
│ • Equipe de engenharia │ • Redes sociais e blog                         │ • Equipe de dev e ops  │ • Módulo de consultoria│
│   e suporte            │ • Indicações de clientes                       │ • Marketing e vendas   │   e setup inicial      │
│ • Algoritmo e bases de │ • Portal de Engenharia                         │ • Custo legal e        │ • Integrações customiz.│
│   dados integradas     │                                                 │   conformidade DPO     │   com ERPs terceiros   │
└────────────────────────┴─────────────────────────────────────────────────┴────────────────────────┴────────────────────────┘
```

---

## 1. Segmentos de Clientes (Customer Segments)

- **Construtoras de Pequeno e Médio Porte (PMEs):** Foco principal da plataforma. Empresas com 5 a 500 funcionários que gerenciam de 1 a 10 obras simultâneas e que não possuem orçamento para contratar grandes ERPs de construção (como Sienge ou TOTVS).
- **Engenheiros e Arquitetos Autônomos:** Profissionais que gerenciam obras residenciais e comerciais de pequeno porte e precisam de controle de custos e relatórios para clientes.
- **Empreiteiras e Subempreiteiras:** Empresas terceirizadas que prestam serviços de mão de obra específica e necessitam comprovar o avanço físico e controlar certificações de segurança (NRs).

## 2. Proposta de Valor (Value Propositions)

- **Gestão Sem Papel (Paperless):** Substituição de cadernos físicos e diários de obra em papel por registros digitais instantâneos.
- **Conformidade Legal Nativa:** Plataforma alinhada com as exigências da LGPD (dados de saúde de funcionários protegidos) e suporte integrado para as Normas Regulamentadoras (NR-10, NR-35, etc.).
- **Previsibilidade Financeira:** Redução de perdas e desvios orçamentários estimados em 20% a 30% por meio do acompanhamento financeiro por obra em tempo real e reajuste automático usando o índice INCC e base de custos SINAPI.
- **Rastreabilidade e Segurança Jurídica:** Registro fotográfico geolocalizado (GPS) dos apontamentos de obra, funcionando como comprovação real de entrega e proteção contra disputas trabalhistas ou contratuais.

## 3. Canais (Channels)

- **Plataforma Web (SaaS):** Acesso principal de administração e gestão via navegador em qualquer dispositivo.
- **Aplicativo Mobile (PWA):** Uso direto pelos encarregados e mestres de obras no canteiro, com suporte a captura de fotos offline.
- **Marketing de Conteúdo (Inbound):** Blog focado em engenharia de produção civil, conformidade de obras e eficiência de custos.
- **Parcerias com Consultores de Obras:** Engenheiros sêniores e consultores que indicam a plataforma para suas construtoras parceiras em troca de comissões de afiliação.

## 4. Relacionamento com Clientes (Customer Relationships)

- **Self-Service Assistido:** Fluxo de onboarding guiado por vídeos e tutoriais passo a passo.
- **Suporte Técnico Automatizado:** Central de ajuda com chatbots inteligentes de triagem de dúvidas.
- **Customer Success (CS) Dedicado:** Acompanhamento próximo para contas do plano Enterprise para garantir a adoção da plataforma por toda a equipe de campo.
- **Comunidade de Construtores:** Fórum privado e canal de feedback direto para evolução colaborativa do roadmap do produto.

## 5. Fontes de Receita (Revenue Streams)

A plataforma utiliza o modelo de assinatura recorrente (SaaS B2B) com planos flexíveis:

- **Plano Pro (R$ 499/mês):** Até 3 obras ativas, 10 usuários, relatórios padrão, importação manual de INCC.
- **Plano Growth (R$ 999/mês):** Até 8 obras ativas, 30 usuários, relatórios personalizados, integração com SINAPI, suporte por email/WhatsApp.
- **Plano Enterprise (Sob consulta):** Obras ilimitadas, usuários ilimitados, APIs abertas, SLA garantido de 99,9%, suporte prioritário 24/7 e DPA assinado.
- **Serviços Adicionais:** Carga inicial de dados, treinamento presencial de equipe de campo e desenvolvimento de integrações personalizadas com ERPs (TOTVS, SAP).

## 6. Recursos-Chave (Key Resources)

- **Propriedade Intelectual (Código-Fonte):** A plataforma web React e backend Node.js integrado ao banco de dados PostgreSQL.
- **Infraestrutura Servidora:** Servidores na nuvem auto-escaláveis (Vercel) e banco de dados gerenciado (Neon DB).
- **Banco de Dados de Referência:** Bases de dados locais de insumos SINAPI por estado e série histórica de índices (INCC, IPCA).
- **Equipe Técnica:** Engenheiros de software, designers de interface (UX/UI) e especialistas em segurança e privacidade (DPO).

## 7. Atividades-Chave (Key Activities)

- **Desenvolvimento de Software e QA:** Codificação contínua, correção de bugs, execução de testes unitários e de integração e melhorias de usabilidade.
- **Manutenção de Bancos de Dados Legal-Financeiro:** Atualização das tabelas mensais de SINAPI, EMOP e do índice INCC.
- **Marketing B2B:** Geração de leads qualificados (MQLs) e campanhas de conversão de clientes.
- **Atendimento e Suporte:** Garantia do cumprimento dos SLAs contratados e resolução ágil de problemas em produção.

## 8. Parceiros-Chave (Key Partners)

- **Provedores de Nuvem (Cloud/DB Providers):** Vercel e Neon DB, garantindo alta disponibilidade e escalabilidade.
- **Órgãos de Classe (CREA/CAU e Sinduscon):** Fontes de legitimação institucional e provedores de séries históricas e dados sobre o CUB e INCC.
- **Advogados de Direito Digital:** Apoio no desenvolvimento e atualização constante da Política de Privacidade, Termos de Uso e DPA (Data Processing Agreement).
- **Consultores de Engenharia Civil:** Parceiros que auxiliam na especificação de novos requisitos do setor.

## 9. Estrutura de Custos (Cost Structure)

- **Custos de Infraestrutura Cloud:** Hospedagem na Vercel, armazenamento de arquivos no Supabase Storage / Cloudflare R2 e transações no Neon DB.
- **Custos de Equipe (Folha de Pagamento):** Desenvolvedores, Designers, Product Manager e Suporte de TI.
- **Custos de Marketing e Vendas:** Licenças de CRM (HubSpot), tráfego pago (Google Ads) e participação em feiras de construção civil.
- **Segurança e Conformidade:** Gastos com ferramentas de segurança (SAST/DAST), taxas de auditoria de proteção de dados e assessoria jurídica.

---

**Notas de Revisão:** O modelo demonstra robustez financeira e operacional, com margens brutas estimadas em 80-85% típicas de SaaS, e atende às restrições do TCC com custos de MVP otimizados pelo uso de arquitetura serverless.
