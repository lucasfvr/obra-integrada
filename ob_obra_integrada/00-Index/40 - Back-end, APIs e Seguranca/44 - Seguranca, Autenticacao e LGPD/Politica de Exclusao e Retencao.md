# Política de Retenção e Exclusão de Dados — Obra Integrada
## Diretrizes de Descarte Seguro e Guarda de Informações

**Versão:** 1.0 | **Data:** 13 de junho de 2026 | **Referência:** LGPD Artigos 15 e 16 | Código Civil Art. 205/618

---

## 1. Escopo e Propósito

Esta política define os prazos de guarda (retenção) e os procedimentos de descarte definitivo (exclusão) das informações gerenciadas na plataforma SaaS Obra Integrada. O objetivo é equilibrar o princípio da **minimização de dados** da LGPD (não reter dados além do tempo estritamente necessário) com as obrigações legais de guarda para defesa judicial e cumprimento de prazos do Código Civil e Legislação Trabalhista.

---

## 2. Tabela de Prazos de Retenção

Os dados coletados na plataforma possuem diferentes prazos de guarda regulatória antes do descarte seguro:

| Categoria do Dado | Prazo de Retenção | Base Legal da Guarda | Justificativa / Referência |
|-------------------|-------------------|----------------------|----------------------------|
| **Dados cadastrais do Tenant** (CNPJ, endereço, sócios) | **5 anos** após o término do contrato | Exercício regular de direitos em processo judicial | Prazo de prescrição para cobranças e disputas comerciais (Art. 206, § 5º, I do Código Civil). |
| **Logs de Acesso** (IP, Data/Hora, ID do Usuário) | **6 meses** a contar da data de geração | Cumprimento de obrigação legal | Exigência do Marco Civil da Internet (Lei 12.965/2014, Artigo 15). |
| **Diário de Obra (RDO) e Fotos** | **5 a 10 anos** após a conclusão da obra | Cumprimento de obrigação legal / Exercício de direitos | Garantia e responsabilidade técnica por solidez da obra (Art. 618 do Código Civil). |
| **Certificações NR e Ponto de Funcionários** | **20 anos** após o desligamento da obra | Cumprimento de obrigação legal (Trabalhista/Previdenciária) | Defesa em eventuais ações de reparação por danos de saúde ocupacional ou acidentes. |
| **Exames PCMSO / Dados Médicos Ocupacionais** | **20 anos** após o desligamento | Obrigação Legal (NR-7 e eSocial) | Histórico médico do trabalhador de risco sob fiscalização do Ministério do Trabalho. |

---

## 3. Procedimento de Exclusão (Scrubbing)

Quando um prazo de retenção expira ou quando uma exclusão de conta é solicitada e validada, a plataforma executa o descarte seguro dos dados em duas camadas:

### 3.1 Camada de Banco de Dados (PostgreSQL)
1. **Exclusão Lógica (Soft Delete):** Inicialmente, ao excluir um funcionário ou obra, a coluna `deletado_em` é preenchida. O registro é ignorado nas queries normais da aplicação.
2. **Exclusão Física (Hard Delete):** Após 30 dias na lixeira/soft-delete, um job agendado executa o `DELETE` real das linhas correspondentes na base PostgreSQL de produção.
3. **Cascatas:** A exclusão de um registro remove em cascata todas as chaves estrangeiras que dependem dele de forma direta (ex: fotos do diário são excluídas fisicamente quando o diário associado é limpo).

### 3.2 Camada de Arquivos (Storage S3 / Cloudflare R2 / Supabase Storage)
Quando um registro de documento, foto de diário ou comprovante financeiro é excluído fisicamente do banco de dados:
1. O backend captura o evento e obtém o caminho absoluto do arquivo no bucket (Ex: `uploads/tenants/123/obras/456/foto.webp`).
2. O adaptador de storage envia um comando de exclusão (`deleteObject`) para a API do Cloudflare R2 ou Supabase Storage.
3. O arquivo é excluído de forma irrecuperável das mídias físicas da nuvem.

---

## 4. Solicitação de Exclusão pelo Titular (Direito ao Esquecimento)

Se um usuário solicitar a exclusão de seus dados pessoais através do canal `privacidade@obraintegrada.com.br`:

1. **Triagem de Bloqueios:** O Encarregado (DPO) verifica se há obrigações contratuais ou legais que impeçam a exclusão (Ex: se o trabalhador atuou em obra ativa, o registro de NRs e ponto não pode ser apagado por fins trabalhistas de guarda).
2. **Exclusão de Dados Não Essenciais:** Se houver bloqueio legal para exclusão total, o DPO solicita a anonimização dos dados de contato não críticos (como telefone pessoal e email alternativo), mantendo apenas o necessário à defesa da construtora.
3. **Confirmação:** O DPO responde ao titular em até **15 dias úteis** confirmando as medidas de exclusão ou anonimização adotadas.
