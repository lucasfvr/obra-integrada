# Plano de Gestão de Riscos — Obra Integrada
## Análise e Mitigação de Riscos Operacionais, Técnicos e Legais

**Versão:** 1.0 | **Data:** 13 de junho de 2026 | **Referência:** ISO 31000 — Gestão de Riscos

---

## 1. Introdução e Diretrizes

Este documento descreve a metodologia e a matriz de riscos identificados para a sustentação e operação da plataforma SaaS **Obra Integrada**. A gestão de riscos visa identificar falhas potenciais antes que elas ocorram, definindo planos de ação de mitigação preventivos para garantir a estabilidade do negócio.

---

## 2. Matriz de Avaliação de Riscos

A gravidade do risco é calculada multiplicando-se a **Probabilidade** de ocorrência pelo **Impacto** operacional se o risco se concretizar (Pontuação de 1 a 25):

```
      IMPACTO (1-5)
      1: Insignificante | 2: Menor | 3: Moderado | 4: Alto | 5: Catastrófico
P (1-5)
1: Muito Baixa │  [1-4] Baixo     [5-9] Médio      [10-14] Alto     [15-25] Crítico
2: Baixa       │  Os riscos são classificados nessas quatro faixas de gravidade.
3: Média       │  Foco principal de mitigação é em riscos Altos e Críticos.
4: Alta        │
5: Muito Alta  │
```

---

## 3. Registro de Riscos Mapeados e Ações de Mitigação

### 3.1 Riscos de Segurança e Privacidade (LGPD)

#### 🚨 R-01: Vazamento de dados multi-tenant (Acesso a dados de outra construtora)
- **Probabilidade:** 2 (Baixa) | **Impacto:** 5 (Catastrófico) | **Gravidade:** **10 (Alto)**
- **Mitigação:** 
  1. Utilizar middleware global no Express que injete e force a cláusula `where: { id_tenant }` em todas as consultas Prisma ORM.
  2. Implementar suite de testes de integração automatizados que validem que requisições com token do Tenant A recebem erro HTTP 403/404 ao tentar acessar recursos do Tenant B.

#### 🚨 R-02: Vazamento de dados sensíveis de saúde de funcionários (PCMSO/NR-7)
- **Probabilidade:** 2 (Baixa) | **Impacto:** 4 (Alto) | **Gravidade:** **8 (Médio)**
- **Mitigação:** 
  1. Criptografar arquivos de saúde no bucket de storage.
  2. Restringir acesso de leitura a esses arquivos apenas a perfis de usuário com papel de `ADMIN_MASTER` ou de RH do canteiro.

---

### 3.2 Riscos de Infraestrutura e Custos (FinOps)

#### 🚨 R-03: Explosão de custo de infraestrutura serverless (Vercel e Neon DB)
- **Probabilidade:** 3 (Média) | **Impacto:** 3 (Moderado) | **Gravidade:** **9 (Médio)**
- **Mitigação:** 
  1. Configurar alertas de faturamento na Vercel e Neon DB.
  2. Implementar compressão automática de fotos no frontend antes de realizar o upload (conversão para WebP de baixa resolução) para reduzir tráfego e armazenamento.
  3. Limitar o tamanho máximo de upload de arquivos para 10 MB.

#### 🚨 R-04: Indisponibilidade de serviços de terceiros críticos
- **Probabilidade:** 2 (Baixa) | **Impacto:** 4 (Alto) | **Gravidade:** **8 (Médio)**
- **Mitigação:** 
  1. Desenvolver interfaces desacopladas no backend (Design Pattern *Adapter*) para serviços de terceiros (como storage e disparadores de email).
  2. Caso o Supabase Storage fique fora do ar, permitir a transição rápida das credenciais para o Cloudflare R2 em menos de 24 horas mantendo a mesma interface de código.

---

### 3.3 Riscos de Processo e Pessoal

#### 🚨 R-05: Sobrecarga e perda de conhecimento de desenvolvedores-chave
- **Probabilidade:** 4 (Alta) | **Impacto:** 3 (Moderado) | **Gravidade:** **12 (Alto)**
- **Mitigação:** 
  1. Exigir documentação de código e comentários para todas as regras de negócio complexas.
  2. Manter atualizados os guias de desenvolvimento e arquitetura, incluindo este repositório de documentação atualizado semanalmente.
  3. Realizar code reviews obrigatórios antes do merge na branch principal.

---

## 4. Revisão Periódica de Riscos

Este registro de riscos deve ser revisado pela equipe técnica a cada ciclo de **planejamento de release (a cada 3 meses)**, reavaliando a eficácia das mitigações adotadas e adicionando novos riscos surgidos com a evolução do produto.
