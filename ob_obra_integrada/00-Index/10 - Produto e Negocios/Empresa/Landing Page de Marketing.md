# Especificação da Landing Page Institucional e de Marketing
## Obra Integrada — Estrutura, Roteiro e UX do Site Público de Vendas

**Versão:** 1.0 | **Data:** 13 de junho de 2026 | **Referência:** AIDA Framework (Atenção, Interesse, Desejo, Ação)

---

## 1. Objetivo e Funil de Vendas

A Landing Page institucional é a vitrine pública da plataforma **Obra Integrada** (`www.obraintegrada.com.br`). O objetivo principal do site é converter visitantes (engenheiros, proprietários de construtoras e arquitetos) em:
1. **Contas de Teste Gratuito (Trial):** Para os planos Pro e Growth.
2. **Contatos de Vendas (MQL):** Formulário de agendamento de demonstração personalizada para o plano Enterprise.

---

## 2. Wireframe ASCII do Layout da Página

### 2.1 Página Principal

```
┌────────────────────────────────────────────────────────────────────────────┐
│ [Logo] OBRA INTEGRADA        Módulos   Preços   Sobre Nós   [Entrar no App]│
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  🏗️ A GESTÃO DE CANTEIRO DE OBRAS MAIS ROBUSTA E SIMPLES DO BRASIL.        │
│  Elimine relatórios em papel, controle custos em tempo real e garanta      │
│  a segurança jurídica das suas obras com diários digitais geolocalizados.  │
│                                                                            │
│                     [ Testar Grátis por 14 Dias ]                          │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ [ Imagem/Vídeo de Demonstração do Painel e App de Campo em WebP ]    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  NOSSAS SOLUÇÕES                                                           │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │ 📍 RDO Digital    │  │ 📊 Financeiro    │  │ 🛡️ Segurança      │          │
│  │ Fotos com GPS e  │  │ Custos por obra  │  │ Controle de NRs  │          │
│  │ controle de clima│  │ e reajuste INCC  │  │ e exames sensív. │          │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘          │
│                                                                            │
│  PLANOS E PREÇOS                                                           │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │ PLANO PRO        │  │ PLANO GROWTH     │  │ PLANO ENTERPRISE │          │
│  │ R$ 499 / mês     │  │ R$ 999 / mês     │  │ Sob Consulta     │          │
│  │ Até 3 obras      │  │ Até 8 obras      │  │ Obras ilimitadas │          │
│  │ [ Assinar ]      │  │ [ Assinar ]      │  │ [ Falar c/ Vendas]          │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘          │
│                                                                            │
├────────────────────────────────────────────────────────────────────────────┤
│ 🏢 Obra Integrada Tecnologia Ltda - CNPJ: 12.345.678/0001-90              │
│ Contatos: privacidade@obraintegrada.com.br | security@obraintegrada.com.br  │
│ [Política de Privacidade]   [Termos de Uso]   [Código de Conduta]          │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Roteiro e Copy das Seções da Landing Page

### 3.1 Seção Hero (Dobra 1)
- **Título:** *Gestão de obras eficiente, sem papelada e 100% segura.*
- **Subtítulo:** *Substitua diários físicos e planilhas confusas por um sistema integrado que reduz perdas orçamentárias em até 30% e gerencia sua mão de obra com total conformidade trabalhista e LGPD.*
- **Chamada para Ação (CTA):** Botão em destaque com gradiente premium, com texto: *Iniciar meu teste grátis*.

### 3.2 Seção de Módulos (Benefícios Técnicos)
Apresentar de forma limpa, utilizando ícones personalizados, os principais módulos descritos na especificação de produto:
- **Diário de Obra com Prova Geolocalizada:** Captura de fotos com coordenadas de latitude/longitude e data/hora para servir de barreira jurídica contra processos trabalhistas.
- **Módulo Financeiro Ajustado pelo INCC:** Cálculo de variação e projeção de orçamentos vinculados às tabelas SINAPI e EMOP, com alertas de desvio de custos.
- **Gestão de Segurança (NRs e PCMSO):** Monitoramento das validades das NRs dos funcionários com controle de acesso diferenciado para dados sensíveis de saúde ocupacional.

---

## 4. Integração Técnica do Formulário de Leads

Quando um cliente preencher o formulário "Falar com Vendas" na Landing Page:

1. **Submissão:** O frontend realiza uma chamada assíncrona para o endpoint `POST /api/leads`.
2. **Validação Zod (Segurança backend):**
   ```typescript
   export const CriarLeadSchema = z.object({
     nome: z.string().min(3),
     email: z.string().email(),
     empresa: z.string().min(2),
     cargo: z.enum(['diretor', 'engenheiro', 'comprador', 'outro']),
     telefone: z.string().min(10)
   });
   ```
3. **Distribuição Automatizada:**
   - O backend salva o lead no banco de dados local na tabela `tb_lead`.
   - Dispara um webhook para a ferramenta de CRM (Ex: HubSpot ou Pipefy) para que o time de vendas comerciais inicie a triagem.
   - Envia um e-mail de resposta automática em menos de 2 minutos para o lead confirmando o contato.
