# Diretrizes Financeiras, Faturamento e Planejamento Tributário
## Obra Integrada — Gestão de Receitas SaaS e FinOps

**Versão:** 1.0 | **Data:** 13 de junho de 2026 | **Referência:** Legislação do ISS (Lei Complementar 116/03) + FinOps Framework

---

## 1. Modelo de Cobrança e Gateway de Pagamentos

A plataforma Obra Integrada opera exclusivamente sob o modelo de assinaturas recorrentes (SaaS B2B). O processamento de pagamentos é terceirizado e automatizado por meio de integração via API com a **Stripe** ou **Iugu**.

### 1.1 Fluxo de Cobrança Automatizado
1. **Cobrança Recorrente:** O gateway processa o cartão de crédito do cliente ou emite o boleto bancário/Pix de forma automatizada no dia do vencimento da assinatura de cada tenant.
2. **Integração de Webhooks:** O gateway de pagamentos envia eventos via Webhooks para a nossa API backend (`POST /api/webhooks/billing`):
   - `invoice.payment_succeeded` -> Atualiza a assinatura do tenant no banco de dados, estendendo a data de expiração da assinatura por 30 dias.
   - `invoice.payment_failed` -> Dispara o fluxo de cobrança amigável por e-mail e alerta na tela do cliente.

---

## 2. Planos de Assinatura e Regras de Preços

O modelo de precificação é baseado em planos mensais/anuais estruturados por volume de obras e limites de usuários:

| Plano | Valor Mensal | Limites Operacionais | Funcionalidades Incluídas |
|---|---|---|---|
| **Starter (Trial)** | R$ 0,00 | 1 Obra | 3 Usuários | Diário de Obras básico, sem upload de comprovantes ou logs. |
| **Pro** | R$ 499,00 | Até 3 Obras | Até 10 Usuários | RDO com fotos geolocalizadas, apontamento de horas, controle financeiro básico. |
| **Growth** | R$ 999,00 | Até 8 Obras | Até 30 Usuários | Todas as do Pro + Integração SINAPI, exportação RDO em PDF, suporte prioritário por WhatsApp. |
| **Enterprise** | Sob Consulta | Obras Ilimitadas | Usuários Ilimitados | Todas as do Growth + Neon DB Branching (isolamento físico), APIs abertas, SLA contratual e DPA personalizado. |

---

## 3. Planejamento Tributário e Emissão de Notas Fiscais (NFS-e)

Como empresa prestadora de serviços de software (SaaS B2B) sediada no Brasil, a empresa está enquadrada nas seguintes normas tributárias:

### 3.1 Regime Tributário Recomendado
- **Simples Nacional (Anexo V ou Anexo III via Fator R):** Ideal para o início da operação (MVP e primeiros 12 meses), onde a alíquota inicial de imposto sobre serviços de software pode variar de **6% a 15,5%** sobre o faturamento bruto, dependendo do volume da folha de salários da empresa.

### 3.2 Imposto Sobre Serviços (ISS)
O serviço de licenciamento de uso de software é classificado no subitem **1.05** da Lei Complementar nº 116/03: *"Licenciamento ou cessão de direito de uso de programas de computação"*.
- **Alíquota:** Varia de **2% a 5%** recolhido pelo município onde a sede da empresa provedora do software está registrada (Ex: Volta Redonda/RJ).

### 3.3 Emissão de Notas Fiscais Eletrônicas (NFS-e)
- **Automatização:** A emissão de NFS-e deve ser automatizada. No momento em que o webhook do gateway confirmar o pagamento (`payment_succeeded`), a API do sistema envia os dados do cliente para um emissor integrado (Ex: e-Notas ou Focus NFe) que gera a nota junto à prefeitura do município e a envia por e-mail para a construtora assinante.

---

## 4. Gestão de Custos de Nuvem (FinOps)

O modelo arquitetural serverless (Vercel + Neon DB + Supabase Storage) permite manter as despesas operacionais proporcionais ao volume de clientes ativos, garantindo uma **margem bruta superior a 80%**:

- **Fórmula de Custo por Cliente (COGS):**
  $$\text{COGS por Tenant} = \text{Custo de Processamento (Vercel Serverless)} + \text{Custo de Dados (Neon DB computed hours)} + \text{Custo de Armazenamento (S3/R2)}$$
- **Otimização de Custos:** A compactação de fotos no frontend antes do upload reduz o tráfego de rede e o custo com buckets de armazenamento na nuvem.
