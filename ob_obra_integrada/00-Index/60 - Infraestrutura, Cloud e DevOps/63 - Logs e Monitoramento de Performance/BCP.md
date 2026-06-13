# BCP — Business Continuity Plan
## Obra Integrada — Plano de Continuidade de Negócios

**Versão:** 1.0 | **Data:** 13 de junho de 2026 | **Referência:** ISO 22301 / NIST SP 800-34

---

## 1. Introdução e Objetivo

Este Plano de Continuidade de Negócios (BCP) estabelece os processos e estratégias necessários para garantir que as operações essenciais da plataforma Obra Integrada continuem funcionando ou sejam restauradas rapidamente em caso de falhas severas de infraestrutura, interrupções de fornecedores críticos ou incidentes cibernéticos graves.

O BCP foca na **continuidade operacional** do negócio SaaS B2B, enquanto o DRP ([Plano de Recuperação de Desastres](file:///d:/Repositorios/antigravity/obra-integrada/ob_obra_integrada/00-Index/60%20-%20Infraestrutura,%20Cloud%20e%20DevOps/63%20-%20Logs%20e%20Monitoramento%20de%20Performance/DRP.md)) detalha a execução técnica de TI para restabelecer os sistemas.

---

## 2. Funções Críticas de Negócio e Metas de Recuperação

Foram mapeadas as seguintes funções essenciais para a sobrevivência operacional da plataforma e seus respectivos limites toleráveis de parada:

| Função Crítica de Negócio | Impacto de Parada | RTO (Tempo Máx. Recuperação) | RPO (Perda Máx. de Dados) |
|---------------------------|-------------------|-----------------------------|---------------------------|
| **Autenticação de Usuários** (Login) | Construtores não acessam o painel, impedindo o trabalho | **4 horas** | Zero (Tokens stateless) |
| **Registro de Diário de Obra (RDO)** | Perda do registro diário de avanço de obra | **8 horas** | 1 hora |
| **Armazenamento de Arquivos/Fotos** | Falha em anexar evidências visuais de canteiro | **12 horas** | 4 horas |
| **Acesso ao Financeiro por Obra** | Engenheiros não podem lançar despesas emergenciais | **24 horas** | 4 horas |

---

## 3. Estratégias de Continuidade para Falhas Críticas

### 3.1 Falha Total do Neon DB (PostgreSQL)
* **Impacto:** Banco principal corrompido ou indisponível.
* **Estratégia de Continuidade:** 
  1. Utilizar os backups automáticos com *Point-in-Time Recovery* (PITR) do Neon DB para recriar a base de dados no último estado íntegro (limite de RPO de 4 horas).
  2. Em caso de falha física na região de nuvem da AWS/Neon DB, criar um branch ou nova instância secundária em outra região (Ex: de us-east-1 para us-east-2) e atualizar as variáveis de ambiente na Vercel.

### 3.2 Falha Geral da Vercel (Hospedagem da API e Web App)
* **Impacto:** Domínio fora do ar, requisições HTTP falhando.
* **Estratégia de Continuidade:**
  1. A Vercel possui alta disponibilidade geográfica nativa (Edge Network). Se a falha for isolada em uma região, o tráfego é roteado automaticamente.
  2. Caso ocorra uma queda global da infraestrutura Vercel, o time de DevOps possui um script pronto para publicar o frontend e a API Express em uma plataforma secundária de redundância (Render ou Railway) em menos de 1 hora.

### 3.3 Falha de Conectividade / Queda da Internet no Canteiro
* **Impacto:** Mestres de obras não conseguem salvar diários ou enviar fotos do celular.
* **Estratégia de Continuidade:**
  1. O aplicativo PWA do Obra Integrada implementa recursos offline. Os diários preenchidos no canteiro sem sinal são armazenados localmente no browser do usuário via *IndexedDB*.
  2. Assim que o dispositivo restabelecer conexão 4G ou Wi-Fi estável, o sistema sincronizará os dados com a API backend em segundo plano de forma automática, garantindo RPO virtual de zero para o canteiro.

---

## 4. Time de Gestão de Crise (TGC)

Em caso de ativação deste plano, o time de crise será formado por:

- **Coordenador de Crise (Diretoria):** Responsável por aprovar gastos emergenciais e liderar reuniões de acompanhamento.
- **Líder Técnico (Pessoa 1 - Tech Lead):** Responsável por guiar o restabelecimento técnico e interagir com fornecedores (Vercel, Neon).
- **Encarregado de Proteção de Dados (DPO):** Responsável por avaliar se a falha envolveu vazamento de dados pessoais e emitir as devidas comunicações à ANPD e aos titulares em caso de incidente de segurança.

---

## 5. Protocolo de Comunicação durante Crises

1. **Notificação de Clientes:** Enviar e-mail em massa para os administradores das construtoras ativas quando o tempo estimado de indisponibilidade passar de 2 horas.
2. **Atualização Pública:** Atualizar a página de status informando as estimativas de retorno.
3. **Comunicado Regulatório:** Se o incidente for um ataque cibernético com risco relevante para dados pessoais sensíveis, o DPO deve elaborar e enviar a notificação para a ANPD no prazo de **6 dias úteis** (conforme a Resolução ANPD nº 15/2024 para agentes de pequeno porte).
