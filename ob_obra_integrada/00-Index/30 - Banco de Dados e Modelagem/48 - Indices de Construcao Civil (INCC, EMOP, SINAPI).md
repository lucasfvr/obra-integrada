---
tags: [incc, emop, sinapi, indices-construcao, custos, orcamento, financeiro, produto]
aliases: [Índices de Construção, INCC, EMOP, SINAPI]
atualizado: 2026-06-13
---

# 📈 INCC, EMOP e SINAPI — Integração com a Plataforma Obra Integrada

> **Objetivo:** Documentar normas, índices e tabelas de custos da construção civil que a plataforma deve incorporar, tanto como funcionalidade de produto quanto como referência técnica para orçamentos e contratos.

---

## 1. INCC — Índice Nacional de Custo da Construção (FGV/IBRE)

### 1.1 O que é

O **INCC** é calculado mensalmente pelo **Instituto Brasileiro de Economia da FGV (IBRE/FGV)** e mede a variação dos custos da construção civil habitacional no Brasil.

É o principal índice usado em:
- **Contratos de compra de imóveis na planta** — reajuste das parcelas durante a obra
- **Financiamentos habitacionais** — cálculo de correção monetária
- **Orçamentos de obras** — projeção de custo futuro
- **Contratos SaaS com construtoras** — muitos contratos são corrigidos pelo INCC

### 1.2 Composição do INCC

```
INCC
├── Materiais, Equipamentos e Serviços (~60%)
│   ├── Materiais (argamassa, concreto, aço, cerâmica, tintas, etc.)
│   ├── Equipamentos (andaimes, betoneiras, etc.)
│   └── Serviços (terraplanagem, fundações, etc.)
└── Mão de Obra (~40%)
    ├── Salários + encargos sociais
    └── Custo por profissional (pedreiro, eletricista, encanador, etc.)
```

### 1.3 Modalidades do INCC

| Modalidade | Período de coleta | Uso típico |
|-----------|------------------|------------|
| **INCC-M** | Dia 21 do mês anterior ao dia 20 do mês referência | Contratos de financiamento |
| **INCC-DI** | 1º ao último dia do mês | Contratos com reajuste mensal |
| **INCC-10** | Dia 11 do mês anterior ao dia 10 do mês referência | Monitoramento de tendências |

> **Desde julho de 2023:** Estrutura atualizada — de 52 para 79 subitens. Agora calculado por **padrão construtivo** (econômico, médio, alto) nas 7 capitais (SP, RJ, BH, Salvador, Recife, Porto Alegre, Brasília).

### 1.4 Como Acessar os Dados

| Fonte | Tipo | Custo | Link |
|-------|------|-------|------|
| **FGV IBRE (portal oficial)** | Resultado mensal geral | Gratuito | [portalibre.fgv.br](https://portalibre.fgv.br/) |
| **FGV Dados** | Série histórica completa, subitens | Pago (assinatura) | [fgvdados.fgv.br](https://fgvdados.fgv.br/) |
| **Sinduscon regionais** | Série histórica INCC-M em XLSX | Gratuito | Ex: sindusconpr.com.br |
| **API indireta** | Nenhuma API oficial pública | — | — |

> ⚠️ **Não existe API pública oficial do INCC.** A integração é feita via download mensal das planilhas e importação manual ou automatizada.

### 1.5 Como a Plataforma Deve Usar o INCC

#### Funcionalidades de Produto

| Funcionalidade | Prioridade | Módulo |
|---------------|-----------|--------|
| **Exibir INCC atual** no dashboard financeiro | P2 | Financeiro / Dashboard |
| **Calcular reajuste de contrato** com base no INCC acumulado | P2 | Financeiro |
| **Projetar custo futuro da obra** (orçamento × INCC projetado) | P3 | Orçamento |
| **Alertar desvio orçamentário por variação do INCC** | P3 | Orçamento |
| **Histórico de variação do INCC** por período da obra | P3 | Relatórios |

#### Estratégia de Implementação

```
OPÇÃO A — Import manual (MVP/P2)
├── Administrador importa planilha mensal do INCC (CSV/XLSX)
├── Sistema calcula variação acumulada no período da obra
└── Exibe gráfico de variação no módulo financeiro

OPÇÃO B — Scraping automatizado (P3)
├── Job semanal lê página FGV e extrai INCC-M divulgado
├── Armazena na tabela tb_indice_economico
└── Não depende de ação manual

OPÇÃO C — Integração via serviço terceiro (P3)
├── APIs de fornecedores como Sienge, BrasilAPI (se cobrir INCC)
└── Mais confiável, mas pode ter custo
```

### 1.6 Schema de Banco de Dados Sugerido

```prisma
model tb_indice_economico {
  id           Int      @id @default(autoincrement())
  tipo         String   // "INCC-M", "INCC-DI", "INCC-10", "IPCA", "IGP-M"
  mes_referencia DateTime // Mês de competência
  variacao_mes Decimal  @db.Decimal(6, 4) // Ex: 0.48 (0.48%)
  variacao_acumulada_ano Decimal @db.Decimal(6, 4)
  fonte        String   // "FGV", "IBGE", "manual"
  criado_em    DateTime @default(now())

  @@index([tipo, mes_referencia])
}
```

---

## 2. EMOP — Empresa de Obras Públicas do Estado do Rio de Janeiro

### 2.1 O que é

A **EMOP-RJ** publica mensalmente o **Sistema de Custo de Obras do Estado do Rio de Janeiro (SCO-Rio)** — tabelas de preços unitários para:
- Serviços de construção civil
- Composições analíticas de custos
- Insumos e materiais com preços de mercado RJ

### 2.2 Relevância para a Plataforma

| Contexto | Importância |
|----------|-------------|
| Clientes no Rio de Janeiro | As construtoras que fazem obras públicas no RJ **são obrigadas** a usar a tabela EMOP |
| Licitações públicas | Base de referência obrigatória para orçamentos de obras estaduais |
| Privados com foco no RJ | Referência de mercado amplamente utilizada |

### 2.3 Como Acessar

| Fonte | Formato | Custo |
|-------|---------|-------|
| **Portal EMOP-RJ** (www.emop.rj.gov.br/catalogos) | .DBF, PDF, planilhas | Gratuito após cadastro |
| **Boletins mensais** (email: boletins@emop.rj.gov.br) | PDF + planilha | GRE (taxa estadual) |
| **Dúvidas técnicas** (email: sistemadecustos@emop.rj.gov.br) | — | Gratuito |
| **RioCusto** (software licenciado) | Integrado | Pago |

> ⚠️ **Não existe API pública da EMOP.** Os dados são fornecidos em arquivos **.DBF** (compatível com softwares de engenharia), PDF e Excel.

### 2.4 Estrutura dos Dados EMOP

O catálogo EMOP é organizado por:

```
Catálogo EMOP
├── Grupos de Serviço (ex: 01-Serviços Gerais, 02-Movimento de Terra)
│   └── Subgrupos (ex: 01.01-Limpeza de Terreno)
│       └── Itens de Serviço
│           ├── Código do item
│           ├── Descrição
│           ├── Unidade (m², m³, vb, un, h, etc.)
│           ├── Custo Unitário (R$)
│           └── Data de referência
├── Composições Analíticas
│   ├── Insumos (material + mão de obra + equipamento)
│   └── Coeficientes de consumo
└── Tabela de Insumos
    ├── Código
    ├── Descrição
    ├── Unidade
    └── Preço unitário
```

### 2.5 Como a Plataforma Deve Usar a EMOP

| Funcionalidade | Prioridade | Módulo |
|---------------|-----------|--------|
| **Importar tabela EMOP** (upload de planilha) para referência de orçamento | P3 | Orçamento |
| **Vincular serviços da obra** ao código EMOP correspondente | P3 | Orçamento |
| **Gerar planilha orçamentária** com preços EMOP | P3 | Relatórios |
| **Alertar quando preço informado diverge >15% da EMOP** | P3 | Financeiro |

---

## 3. SINAPI — Sistema Nacional de Pesquisa de Custos e Índices da Construção Civil

### 3.1 O que é

O **SINAPI** é gerenciado pela **Caixa Econômica Federal (CEF)** em parceria com o **IBGE**. É a referência obrigatória para **obras públicas federais** financiadas com recursos do governo.

**Aplicação obrigatória:** Obras do PAC, MCMV, contratos com recursos da União.

### 3.2 Estrutura dos Dados

```
SINAPI
├── Preços de Insumos (por estado + mês)
│   ├── Materiais
│   ├── Equipamentos
│   └── Mão de obra
└── Composições de Serviços
    ├── Analíticas (com memória de cálculo)
    └── Sintéticas (resumo por grupo)
```

### 3.3 Como Acessar

| Fonte | Formato | Custo |
|-------|---------|-------|
| **Portal da Caixa** (caixa.gov.br/poder-publico/sinapi) | ZIP → Excel (.xlsx) + PDF | Gratuito |
| **Relatórios mensais** | Por estado, por tipo (insumos/composições) | Gratuito |
| **API pública** | **NÃO EXISTE** — apenas planilhas mensais | — |

> **A partir de 2025:** Novo formato de relatórios — verificar aba de "Notas Divulgadas" na Caixa.

### 3.4 Schema de Banco de Dados Sugerido

```prisma
model tb_sinapi_insumo {
  id           Int      @id @default(autoincrement())
  codigo       String   @unique
  descricao    String
  unidade      String
  estado       String   // SP, RJ, MG, etc.
  preco        Decimal  @db.Decimal(10, 2)
  mes_referencia DateTime
  importado_em DateTime @default(now())

  @@index([codigo, estado])
  @@index([mes_referencia])
}

model tb_sinapi_composicao {
  id           Int      @id @default(autoincrement())
  codigo       String
  descricao    String
  unidade      String
  custo_total  Decimal  @db.Decimal(10, 2)
  estado       String
  mes_referencia DateTime
  insumos      Json     // Array de insumos com coeficientes

  @@index([codigo, estado, mes_referencia])
}
```

---

## 4. Índices Complementares

### 4.1 Outros Índices Relevantes para a Plataforma

| Índice | Responsável | Uso na construção civil |
|--------|------------|------------------------|
| **IPCA** | IBGE | Referência de inflação geral; alguns contratos usam IPCA |
| **IGP-M** | FGV | Amplamente usado em contratos de locação e some obras |
| **CUB** | Sinduscon + ABNT NBR 12721 | Custo Unitário Básico — referência para projetos residenciais |
| **BDI** | Prática do mercado | Bonificação e Despesas Indiretas — percentual sobre o custo direto |

### 4.2 CUB — Custo Unitário Básico (ABNT NBR 12721)

O CUB é calculado mensalmente por cada **Sinduscon estadual** e representa o custo de construção por m² conforme o padrão construtivo:

| Padrão | Descrição |
|--------|-----------|
| R-1 | Residencial popular (1 pavimento) |
| R-8 | Residencial padrão baixo (8 pavimentos) |
| R-16 | Residencial médio (16 pavimentos) |
| RP-1Q | Residencial popular quartos |
| PIS | Projeto de Interesse Social |
| PP-4 | Pequenas Empresas / Prédio Popular |
| CSL-8 | Comercial Salas e Lojas |

**Relevância:** A Obra Integrada pode usar o CUB para:
- Validar orçamentos estimados de novas obras
- Alertar quando o custo/m² declarado está muito abaixo do CUB (risco de subnotificação)

---

## 5. Roadmap de Integração — Priorização

```
SPRINT 0-1 (Agora — P0/P1)
└── Nenhuma integração de índices (focar em segurança e core)

SPRINT 2-3 (P2 — Meses 2-4)
├── Campo "Índice de Reajuste" no contrato de obra (INCC-M, IPCA, etc.)
├── Campo "CUB de referência" no orçamento da obra
└── Exibição manual do INCC corrente no dashboard financeiro

SPRINT 4+ (P3 — Meses 5-8)
├── Importação de planilha SINAPI por estado
├── Módulo de orçamento com itens vinculados ao SINAPI/EMOP
├── Cálculo automático de reajuste por INCC acumulado
├── Alerta de desvio orçamentário por variação de índice
└── Job mensal de scraping/atualização do INCC
```

---

## 6. Referências e Links Úteis

| Recurso | Link |
|---------|------|
| INCC — FGV IBRE | https://portalibre.fgv.br/ |
| SINAPI — Caixa Econômica | https://www.caixa.gov.br/poder-publico/modernizacao-gestao/sinapi/ |
| EMOP-RJ | http://www.emop.rj.gov.br/catalogos |
| CUB — Sinduscon-SP | https://www.sindusconsp.com.br/ |
| ABNT NBR 12721 | https://www.abnt.org.br/ |
| BrasilAPI (índices econômicos) | https://brasilapi.com.br/docs#tag/IBGE |
| Portal Nacional de Contratações Públicas (PNCP) | https://pncp.gov.br |

---

**Versão:** 1.0 | **Data:** 13 de junho de 2026  
**Próxima revisão:** Quando do início do sprint de módulo de orçamento (P3)
