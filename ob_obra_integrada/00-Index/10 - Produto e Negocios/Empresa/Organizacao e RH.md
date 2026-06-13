# Estrutura Organizacional e Gestão de Pessoas
## Obra Integrada — Papéis, Contratação e Onboarding Corporativo

**Versão:** 1.0 | **Data:** 13 de junho de 2026 | **Referência:** ISO 9001 (Recursos Humanos)

---

## 1. Descrição dos Papéis de Liderança (C-Level)

- **CEO (Chief Executive Officer):** Lidera o direcionamento estratégico da empresa, relações públicas com parceiros comerciais e captação de recursos/investidores.
- **CTO (Chief Technology Officer):** Responsável por toda a infraestrutura de engenharia de software, segurança da informação (CISO), gerenciamento do monorepo, banco de dados (Neon DB) e conformidade LGPD (DPO técnico).
- **CMO / Diretor Comercial:** Responsável pela geração de leads corporativos (Inbound/Outbound Marketing), precificação dos planos e gestão da equipe de vendas diretas.
- **Diretor de Sucesso do Cliente (CS):** Lidera a equipe de suporte e onboarding de novos clientes, monitorando taxas de ativação, engajamento e churn.

---

## 2. Processo de Contratação e Perfis de Vaga

Toda contratação de colaboradores para o time da Obra Integrada segue regras claras de perfil e conformidade:

### 2.1 Perfil: Desenvolvedor Software (Backend / Frontend)
- **Foco:** Clean Code, respeito a padrões (Express, React), conhecimento em bancos relacionais e testes automatizados.
- **Avaliação:** Desafio técnico prático no Git + entrevista comportamental focada em trabalho colaborativo e segurança cibernética (OWASP).
- **Compliance:** Assinatura obrigatória de Acordo de Confidencialidade (NDA) e Cessão de Direitos de Propriedade Intelectual (código pertence 100% à empresa).

### 2.2 Perfil: Especialista de Sucesso do Cliente (CS)
- **Foco:** Empatia, boa comunicação escrita e falada, e familiaridade básica com termos da construção civil (RDO, diários, ordens de serviço).
- **Avaliação:** Simulação prática de resolução de conflitos e atendimento de suporte L2.

---

## 3. Roteiro de Onboarding do Colaborador (Primeira Semana)

Ao ingressar na empresa, o funcionário passa por um processo estruturado de integração para garantir segurança e alinhamento de contexto:

```
 Dia 1: Acessos e Equipamentos
 ├── Entrega e inventário de notebook corporativo (BYOD requer antivírus e criptografia ativa)
 ├── Criação de email institucional (@obraintegrada.com.br)
 └── Liberação de acessos (GitHub, Slack, Canva, Neon DB read-only)

 Dia 2: Treinamento de Segurança e NDA
 ├── Leitura e assinatura do NDA (Acordo de Confidencialidade)
 ├── Configuração de autenticação multifator (MFA) em todas as contas criadas
 └── Leitura obrigatória do documento de Segurança Interna (docs/empresa/padroes-seguranca.md)

 Dia 3 a 5: Contexto de Produto e Negócio
 ├── Leitura do manual para IAs e Desenvolvedores (docs/agent/README.md)
 ├── Simulação de uso do software (criar obra de teste, preencher diário de obra)
 └── Reunião com o padrinho/mentor do setor para definição das primeiras tarefas
```

---

## 4. Matriz RACI de Decisões Organizacionais

Define os níveis de responsabilidade pelas principais ações corporativas:

```
R = Responsável por Executar | A = Aprovador Final | C = Consultado | I = Informado
```

| Decisão Organizacional | CEO | CTO | Diretor Comercial | Dir. CS | Legal/DPO |
|------------------------|:---:|:---:|:-----------------:|:-------:|:---------:|
| **Alteração nos Preços dos Planos** | **A** | **C** | **R** | **C** | **C** |
| **Deploy de Código em Produção** | **I** | **A** | **I** | **I** | **-** |
| **Contratação de Funcionários** | **A** | **R** | **R** | **R** | **C** |
| **Investigação de Incidentes LGPD** | **I** | **R** | **-** | **I** | **A** |
| **Mudanças de Regras no Monorepo** | **-** | **A** | **-** | **-** | **-** |
