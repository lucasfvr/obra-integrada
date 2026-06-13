# Diretrizes de Conformidade LGPD — Obra Integrada
## Proteção de Dados e Governança de Privacidade (Lei 13.709/2018)

**Versão:** 1.0 | **Data:** 13 de junho de 2026 | **Referência:** LGPD Artigos 9º, 18, 37 e 41

---

## 1. Introdução e Propósito

Este documento serve como a ponte pública e de engenharia para as práticas de conformidade com a **Lei Geral de Proteção de Dados Pessoais (LGPD)** aplicadas no ecossistema da plataforma Obra Integrada. 

Para um detalhamento técnico interno completo e inventários específicos de dados (ROPA), consulte os documentos do cofre principal de documentação:
- [44 - LGPD e Proteção de Dados (Interno)](file:///d:/Repositorios/antigravity/obra-integrada/ob_obra_integrada/00-Index/40%20-%20Back-end,%20APIs%20e%20Seguranca/44%20-%20Seguranca,%20Autenticacao%20e%20LGPD/44%20-%20LGPD%20e%20Protecao%20de%20Dados.md)
- [46 - Plano de Resposta a Incidentes de Segurança (PARI)](file:///d:/Repositorios/antigravity/obra-integrada/ob_obra_integrada/00-Index/40%20-%20Back-end,%20APIs%20e%20Seguranca/44%20-%20Seguranca,%20Autenticacao%20e%20LGPD/46%20-%20Plano%20de%20Resposta%20a%20Incidentes.md)

---

## 2. Bases Legais de Tratamento de Dados

A plataforma coleta e trata dados sob bases legais muito claras, definidas no Artigo 7º e Artigo 11 (para dados sensíveis) da LGPD:

| Módulo / Dado Coletado | Base Legal Principal (Art. 7º) | Finalidade do Tratamento |
|------------------------|--------------------------------|--------------------------|
| **Dados cadastrais da Construtora e Administrador** (CNPJ, CPF, Razão Social, email corporativo) | **Execução de Contrato** (Inciso V) | Viabilizar o acesso, faturamento e prestação de serviço do SaaS B2B. |
| **Dados cadastrais de funcionários** (Nome, CPF, Função) | **Execução de Contrato** (Inciso V) | Registrar quem está alocado em cada obra e controle do canteiro. |
| **Certificações NR** (Ex: NR-35, NR-10) | **Cumprimento de Obrigação Legal ou Regulatória** (Inciso II) | Garantir que o funcionário esteja legalmente habilitado para funções de risco na obra. |
| **Exames ocupacionais (PCMSO) / Atestados de Saúde** (Dados Sensíveis) | **Cumprimento de Obrigação Legal** (Art. 11, Inciso II, alínea 'a') | Atender às exigências de saúde e segurança do trabalho do eSocial. |
| **Fotos geolocalizadas do Diário (RDO)** | **Execução de Contrato / Legítimo Interesse** (Incisos V/IX) | Comprovação técnica do avanço de tarefas e segurança jurídica da entrega da obra. |

---

## 3. Direitos dos Titulares (Artigo 18)

A plataforma disponibilizará no frontend um canal simplificado para que qualquer trabalhador, engenheiro ou cliente cadastrado possa exercer seus direitos:

1. **Confirmação da existência e Acesso:** Tela de perfil onde o usuário visualiza e pode baixar todos os dados pessoais associados à sua conta.
2. **Correção:** Possibilidade de atualizar dados incompletos ou inexatos diretamente em seu painel de perfil.
3. **Eliminação/Descarte:** Fluxo formal de solicitação de exclusão (ver regras detalhadas na [Política de Retenção e Exclusão](file:///d:/Repositorios/antigravity/obra-integrada/ob_obra_integrada/00-Index/40%20-%20Back-end,%20APIs%20e%20Seguranca/44%20-%20Seguranca,%20Autenticacao%20e%20LGPD/Politica%20de%20Exclusao%20e%20Retencao.md)).
4. **Portabilidade:** Opção de exportar dados cadastrais e histórico de apontamentos em formato JSON ou CSV estruturado.

---

## 4. Governança e Encarregado (DPO)

Conforme o Artigo 41 da LGPD, o controlador de dados deve indicar um Encarregado pelo Tratamento de Dados Pessoais (DPO - Data Protection Officer).

- **Canal de Atendimento ao Titular:** `privacidade@obraintegrada.com.br`
- **Canal de Segurança:** `security@obraintegrada.com.br`
- **Status do Encarregado:** [Time de Direção a Designar]
- **Atribuições:** Receber reclamações e comunicações dos titulares, prestar esclarecimentos, adotar providências e dialogar diretamente com a Autoridade Nacional de Proteção de Dados (ANPD).

---

## 5. Medidas de Segurança Adotadas (Artigo 46)

Para garantir a confidencialidade e mitigar riscos de incidentes de segurança:

- **Isolamento de dados (Multi-tenancy):** Utilização de chaves de tenant no Prisma para isolar logicamente os dados de cada construtora cliente.
- **Criptografia em trânsito:** Uso de protocolo HTTPS forçado em todas as rotas com certificados TLS atualizados.
- **Criptografia em repouso:** Bancos de dados de produção Neon DB utilizam criptografia AES-256 no armazenamento.
- **Controle de Acesso Granular (RBAC):** Restrição estrita de visualização de dados de funcionários e NRs sensíveis conforme o papel de cada usuário no sistema.
