# Definition of Ready (DoR) — Obra Integrada

> Uma User Story só entra no sprint quando **TODOS** os critérios abaixo forem atendidos.

---

## Critérios de Ready

### 📋 Requisito de Negócio
- [ ] A User Story tem um **título claro** no formato: "Como [persona], quero [ação], para [benefício]"
- [ ] O **problema de negócio** está descrito (não apenas a solução técnica)
- [ ] A história foi **aprovada pelo Dono do Produto**

### ✅ Critérios de Aceite
- [ ] Tem **pelo menos 3 critérios de aceite** escritos no formato Given/When/Then
- [ ] Os critérios de aceite são **testáveis e mensuráveis**
- [ ] Os critérios cobrem **cenários de erro** além do fluxo principal

### 📐 Estimativa e Tamanho
- [ ] A história foi **estimada** pela equipe (Planning Poker)
- [ ] A história tem **tamanho ≤ 8 Story Points** (se maior, dividir)
- [ ] Pode ser entregue em **no máximo 3 dias**

### 🔒 Segurança (obrigatório para qualquer endpoint novo)
- [ ] A rota tem autenticação **E** autorização definidas
- [ ] Os dados de input foram identificados (tipagem, validação Zod)
- [ ] Dados sensíveis (CPF, saúde) identificados e tratamento definido
- [ ] Filtro de tenant (`id_cliente`) está aplicado

### 🧱 Técnico
- [ ] Dependências externas identificadas (APIs, tabelas novas)
- [ ] Tabelas ou campos novos aprovados pela Pessoa 5 (guardião do schema)
- [ ] Não bloqueia nenhuma outra história do sprint

### 🎨 UX/UI (para histórias de interface)
- [ ] Wireframe ou protótipo no Figma disponível e aprovado
- [ ] Comportamento mobile definido

---

## Exemplo de User Story Pronta

```
TÍTULO: Como Engenheiro Responsável, quero ver o financeiro consolidado
        de todas as obras, para ter visão do fluxo de caixa da empresa.

CRITÉRIOS DE ACEITE:
  Given: Usuário com papel PROPRIETARIO ou RESPONSAVEL logado
  When:  Acessa /financeiro/consolidado
  Then:  Vê tabela com total de despesas e receitas por obra

  Given: Usuário com papel TRABALHADOR
  When:  Tenta acessar /api/financeiro/consolidado
  Then:  Recebe 403 Forbidden

  Given: Nenhuma obra tem lançamentos no período selecionado
  When:  Filtra por data sem resultados
  Then:  Exibe mensagem "Nenhum lançamento no período"

ESTIMATIVA: 5 Story Points
TAMANHO: Médio (2 dias)
DEPENDÊNCIAS: Endpoint GET /api/financeiro/consolidado (Pessoa 2, Sprint 2)
```
