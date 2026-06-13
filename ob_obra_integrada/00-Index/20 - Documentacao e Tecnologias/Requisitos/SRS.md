# SRS — Software Requirements Specification
## Obra Integrada — Plataforma SaaS para Gestão de Obras

**Versão:** 1.0  
**Data:** 13 de junho de 2026  
**Referência:** IEEE 29148 / ISO/IEC/IEEE 29148  
**Status:** Vigente

---

## 1. Introdução

### 1.1 Objetivo
Este documento de Especificação de Requisitos de Software (SRS) descreve em detalhes os requisitos funcionais, não funcionais e as interfaces do sistema **Obra Integrada**. O objetivo é orientar o time de desenvolvimento e auditoria sobre o comportamento esperado da plataforma e suas restrições técnicas.

### 1.2 Escopo do Produto
O Obra Integrada é uma plataforma web e mobile (PWA) de gerenciamento operacional e financeiro de canteiros de obras voltada para construtoras de pequeno e médio porte (PMEs). O sistema realiza a consolidação de diários de obra digitais geolocalizados, controle de tarefas, apontamentos de horas, gestão de documentação e controle de certificações de segurança no trabalho (NRs).

### 1.3 Definições, Acrônimos e Abreviaturas
- **Tenant:** Entidade cliente da plataforma (a construtora), que possui dados logicamente isolados.
- **RBAC (Role-Based Access Control):** Controle de acesso baseado em papéis (ex: Engenheiro, Gestor, Encarregado).
- **RDO (Relatório Diário de Obra):** Documento operacional consolidando as atividades, clima e mão de obra de um dia de trabalho.
- **NR (Norma Regulamentadora):** Normas do Ministério do Trabalho sobre segurança e medicina ocupacional.
- **INCC:** Índice Nacional de Custo da Construção.
- **SINAPI:** Sistema Nacional de Pesquisa de Custos e Índices da Construção Civil.
- **EMOP:** Empresa de Obras Públicas (tabela de referência de custos do RJ).

---

## 2. Descrição Geral

### 2.1 Perspectiva do Produto
O Obra Integrada é um produto SaaS nativo na nuvem com arquitetura multi-tenant lógica (compartilhando a mesma instância de banco de dados, mas utilizando chaves de isolamento por tenant no nível das queries SQL via Prisma).

```
┌────────────────────────────────────────────────────────┐
│                   Acesso Cliente                       │
│           Web App / Mobile PWA (Vite + React)          │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Camada de Endpoints                  │
│                     Express API Gateway                │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│               Lógica de Negócio (Serviços)             │
│            Monolito Modular Express.js + TS            │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│                  Persistência de Dados                 │
│              Prisma ORM → PostgreSQL (Neon DB)         │
└────────────────────────────────────────────────────────┘
```

### 2.2 Classes e Características dos Usuários

1. **Gestor/Diretor da Construtora (ADMIN_MASTER):** Acesso administrativo irrestrito ao tenant, faturamento, criação de novas obras, relatórios financeiros e auditoria legal.
2. **Engenheiro de Obra (USER_ENG):** Responsável técnico pelo planejamento, aprovação de orçamentos, monitoramento físico-financeiro e validação de relatórios diários de obras associadas.
3. **Mestre de Obra / Encarregado (USER_FIELD):** Usuário do canteiro. Registra atividades diárias, fotos de andamento, clima, ocorrências e anexa comprovantes financeiros locais.
4. **Trabalhador de Campo (USER_WORKER):** Possui acesso de leitura básico ou perfil consultivo para apontamento de horas e atualização de suas próprias certificações NR.

---

## 3. Requisitos de Interface Externa

### 3.1 Interfaces de Usuário
- **Frontend Responsivo:** Construído com React 18 e Tailwind CSS 4, aplicando os princípios do *shadcn/ui*.
- **Compatibilidade:** O frontend deve carregar corretamente no Google Chrome (versões 100+), Mozilla Firefox (versões 100+), Safari (versões 15+) e navegadores mobile de sistemas Android e iOS.
- **Design System:** Suporte nativo a dark/light mode e design baseado em painéis modulares e tabelas escaneáveis.

### 3.2 Interfaces de Software
- **Banco de Dados:** PostgreSQL hospedado no Neon DB, conectando-se via connection poolers (PgBouncer).
- **Provedores de Armazenamento:** Cloudflare R2 ou Supabase Storage utilizando SDK S3-compatible.
- **APIs de Terceiros:** Integração futura com APIs de consulta monetária (BrasilAPI) e eSocial.

---

## 4. Requisitos Funcionais (RF)

### 4.1 Módulo Core e Multi-tenancy
- **RF-001 (Isolamento de Tenant):** O sistema deve injetar automaticamente o identificador `id_tenant` em todas as operações de banco de dados, impedindo acessos cruzados.
- **RF-002 (Cadastro de Tenant):** Permitir a criação de uma conta corporativa de construtora informando CNPJ, Razão Social, Email corporativo e telefone.

### 4.2 Módulo de Gestão de Obras e Planejamento
- **RF-003 (Cadastro de Obra):** O Engenheiro deve poder cadastrar uma obra vinculando dados como endereço, geolocalização aproximada (latitude/longitude), número do CNO e ART do engenheiro.
- **RF-004 (Orçamento Base):** Permitir o upload de planilha orçamentária para criar os centros de custos da obra.
- **RF-005 (Cronograma de Etapas):** Criação de etapas (Ex: Fundações, Alvenaria, Acabamento) com datas estimadas de início e fim.

### 4.3 Módulo Diário de Obra (RDO)
- **RF-006 (Apontamento Diário):** O Encarregado deve registrar o diário informando clima (Manhã/Tarde), efetivo de trabalhadores, equipamentos em uso, progresso das atividades do dia e ocorrências.
- **RF-007 (Apontamento Fotográfico Geolocalizado):** Cada foto adicionada ao diário de obra deve conter a coordenada GPS (latitude/longitude) de onde foi tirada e data/hora no metadata, validando contra o perímetro cadastrado da obra.

### 4.4 Módulo de Segurança do Trabalho e RH
- **RF-008 (Certificações NR):** Cadastro de funcionários da obra com campo para upload de certificados de NRs (Ex: NR-10, NR-35). O sistema deve alertar 30 dias antes do vencimento do certificado.
- **RF-009 (Proteção a Dados de Saúde):** Todos os uploads de exames médicos ocupacionais (PCMSO/NR-7) devem ser criptografados em repouso e seu acesso limitado estritamente a gestores de RH.

---

## 5. Requisitos Não Funcionais (RNF)

### 5.1 RNF de Segurança (Security)
- **RNF-001 (Criptografia de Comunicação):** Todas as requisições HTTP devem ser forçadas a trafegar sobre TLS 1.3 (HTTPS).
- **RNF-002 (Criptografia de Senhas):** As senhas dos usuários devem ser armazenadas com criptografia de hash utilizando bcrypt com fator de custo (*work factor*) igual a 10 ou superior.
- **RNF-003 (Sessões Stateless):** A autenticação deve ser realizada via JWT (JSON Web Token) assinado com algoritmo HMAC-SHA256, com tempo de expiração de 2 horas e tokens de atualização (*refresh tokens*) seguros.
- **RNF-004 (LGPD - Descarte de Dados):** O sistema deve implementar rotinas de descarte definitivo de dados pessoais quando solicitado pelo titular ou após rescisão de contrato, em conformidade com o Artigo 16 da LGPD.

### 5.2 RNF de Performance
- **RNF-005 (Tempo de Resposta):** As requisições de leitura da API devem responder em menos de 500ms sob carga normal de trabalho.
- **RNF-006 (Otimização de Imagens):** As fotos adicionadas via aplicativo mobile devem ser compactadas e convertidas para WebP no frontend antes do upload para economizar banda e armazenamento.

### 5.3 RNF de Confiabilidade e Disponibilidade
- **RNF-007 (Disponibilidade Mensal):** A plataforma deve manter uma taxa de uptime mensal garantida de pelo menos 99,5%.
- **RNF-008 (Backup Periódico):** O banco de dados Neon DB deve realizar rotinas automatizadas de backups pontuais (*point-in-time recovery* - PITR) com retenção de 7 dias.
- **RNF-009 (Resiliência Serverless):** A API Express deve ser stateless para permitir o escalonamento horizontal e execução transparente em Vercel Serverless Functions.

---

**Aprovado por:**  
Time de Arquitetura Obra Integrada
