# Fase 2 — Evolução do Produto

**Projeto:** Obra Integrada
**Data:** 24 de abril de 2026
**Escopo:** Avaliação das funcionalidades atuais, benchmark competitivo e roadmap de features novas

---

## Sumário executivo

O Obra Integrada tem **fundação funcional sólida** para os três pilares básicos de gestão de obras (obras + diário + tarefas) e já apresenta **2 diferenciais competitivos** para a faixa de construtoras pequenas/médias: (1) auditoria geográfica automática do diário com `latitude`/`longitude` no modelo (suporte mobile-first), e (2) arquitetura multi-tenancy por `tb_cliente` desde o schema. Essas duas escolhas são maduras e vão além do que o **Obra Prima** (líder em pequenas construtoras) oferece por default.

Em contrapartida, o produto **carece dos diferenciais atuais do mercado** em 2026: Agentes de IA (Vobi), integração com SINAPI para orçamentação, RDO (Relatório Diário de Obra) estruturado com evidências fotográficas, app mobile nativo ou PWA offline-first, e integrações (WhatsApp, ERPs, planilhas de orçamento). Há também **9 módulos do schema Prisma planejados mas não implementados** (materiais, fabricantes, etapas, requisições) que, se concluídos, já aproximam o produto do patamar do Sienge.

Este artefato detalha 15 features novas propostas, cada uma com estimativa de esforço e impacto, mapeadas em um cronograma de 24 meses que considera: (a) diferenciais para banca acadêmica, (b) aproveitamento de IA, (c) abordagem mobile-first com PWA, e (d) criação de lock-in via histórico acumulado e integrações.

---

## 2.1. Análise das funcionalidades atuais

A tabela abaixo categoriza cada funcionalidade existente. **Status** usa escala: **Completa** (funciona fim-a-fim), **Incompleta** (parcial / UI placeholder), **Com bugs** (apresenta defeitos evidentes). **Tipo competitivo**: **Diferencial** (supera média do mercado), **Paridade** (igual aos concorrentes), **Commodity** (básico esperado).

### 2.1.1. Módulo Obras

| Funcionalidade | Status | Tipo | Observação |
|---|---|---|---|
| CRUD de obras (cadastro, edição, exclusão) | Completa | Commodity | Wizard em `NovaObraWizard.jsx` |
| Listagem com paginação + filtro RBAC por role | Completa | Paridade | — |
| Detalhamento com dados técnicos (área, alvará, ART/RRT) | Completa | Paridade | Campos existem no schema |
| Org-chart da equipe da obra | Completa | Paridade | Há duplicação: função em dois controllers |
| Breakdown de orçamento (material / mão de obra / taxas) | Incompleta | Paridade | Campos no schema, mas sem UI de acompanhamento |
| Geolocalização da obra (lat/long) | Completa | Diferencial | Preparada para mapa na listagem |
| Contatos de emergência | Completa | Commodity | — |

### 2.1.2. Módulo Diário de Obra

| Funcionalidade | Status | Tipo | Observação |
|---|---|---|---|
| Registro diário com descrição | Completa | Commodity | Mínimo 3 caracteres |
| Upload de foto | Completa | Commodity | Via multer diskStorage (problema Vercel) |
| Captura de GPS | Completa | **Diferencial** | `latitude`, `longitude` no schema |
| Status de auditoria (AUTOMATICO → AUTORIZADO/REPROVADO) | Completa | **Diferencial** | Workflow de aprovação |
| Justificativa de GPS (quando fora do raio) | Completa | **Diferencial** | — |
| Log de auditoria (quem aprovou) | **Com bug** | Diferencial | Helper `registrarLog()` grava em `tb_log_auditoria` que **não existe no schema** |
| Dashboard de diários pendentes | Completa | Paridade | `/admin/metrics/pendentes` |

### 2.1.3. Módulo Tarefas

| Funcionalidade | Status | Tipo | Observação |
|---|---|---|---|
| CRUD de tarefas | Completa | Commodity | — |
| Atribuição a múltiplos usuários | Completa | Paridade | Via `tb_tarefa_usuario` |
| Status + percentual de conclusão | Completa | Paridade | Sem validação de percentual ≤100 |
| Prioridade (BAIXA/NORMAL/ALTA/URGENTE) | Completa | Commodity | — |
| Prazo | Completa | Commodity | — |
| Visualização em calendário | Completa | Paridade | Via FullCalendar |
| Dependências entre tarefas | **Ausente** | Diferencial | Não modelado (nada em schema) |
| Caminho crítico (CPM) | **Ausente** | Diferencial | — |
| Gantt | **Ausente** | Paridade | FullCalendar não provê Gantt |

### 2.1.4. Módulo Financeiro

| Funcionalidade | Status | Tipo | Observação |
|---|---|---|---|
| Registro de receita/despesa | Completa | Commodity | — |
| Upload de comprovante/NF | Completa | Commodity | Mesma limitação Vercel de uploads |
| Listagem por obra | Completa | Commodity | — |
| Exclusão | **Com bug de segurança** | — | Falta `requireObraAccess` |
| Dashboard financeiro (previsto x realizado) | **Incompleta** | Paridade | Tela UnderConstruction |
| Fluxo de caixa | **Ausente** | Paridade | — |
| DRE / relatórios gerenciais | **Ausente** | Paridade | — |
| Integração contábil | **Ausente** | Diferencial | — |

### 2.1.5. Módulo RH

| Funcionalidade | Status | Tipo | Observação |
|---|---|---|---|
| Cadastro de funcionário com CPF/email validados | Completa | Paridade | `utils/validation.js` |
| Auto-geração de matrícula (MAT-YYYY-NNN) | Completa | Diferencial | — |
| Paginação com busca e filtros | Completa | Paridade | — |
| Inativação (soft delete) com proteção de PROPRIETARIO | Completa | Paridade | — |
| Perfil / CV do trabalhador | Completa | Paridade | `MeuPerfilCV.jsx` |
| Ponto / frequência | **Ausente** | Paridade | — |
| Pagamento por dia / folha | Incompleta | Paridade | Campo `valor_dia` existe; sem tela |
| EPI e segurança do trabalho | **Ausente** | Diferencial | — |

### 2.1.6. Módulo Admin

| Funcionalidade | Status | Tipo | Observação |
|---|---|---|---|
| Métricas globais (obras, usuários, documentos) | Completa | Paridade | Sem RBAC — bug de segurança |
| Listagem de clientes (multi-tenancy) | Completa | Diferencial | Arquitetura madura |
| Auditoria de profissionais | Completa | Diferencial | Status PENDENTE/VERIFICADO/INVALIDO |
| Simulação de rentabilidade (SaaS mock) | Completa | Commodity | Mockado |
| Impersonação de usuários | Completa | Diferencial | Com banner de aviso |
| Health check | Completa | Commodity | — |

### 2.1.7. Módulos planejados no schema mas NÃO implementados

Estes modelos existem no Prisma sem controllers/rotas correspondentes — representam **~40% do schema ocioso**:

| Modelo | Finalidade óbvia | Esforço p/ completar |
|---|---|---|
| `tb_material` | Catálogo global de materiais | M |
| `tb_fabricante` | Catálogo de fabricantes | S |
| `tb_material_fabricante` | M:N material × fabricante | S |
| `tb_etapa` | Etapas/fases da obra | M |
| `tb_etapa_material` | Materiais por etapa | M |
| `tb_requisicao` | Requisição de material | M |
| `tb_material_requisitado` | Itens da requisição | S |
| `tb_estoque_obra` | ✅ implementado parcialmente | — |
| `tb_movimentacao_estoque` | ✅ implementado parcialmente | — |

**Conclusão:** O projeto tem 7 entidades prontas para virar um **módulo de Materiais, Etapas e Requisições** — alta alavancagem, baixo custo incremental (cerca de 3 semanas de trabalho para um dev), alto impacto de produto (aproxima-se de Sienge e Vobi).

---

## 2.2. Benchmark competitivo — mercado brasileiro

Pesquisa feita em abril de 2026 cobrindo 4 concorrentes principais do segmento de software de gestão de obras para construção civil no Brasil. Fontes consultadas (nota: links ao final da seção).

### 2.2.1. Sienge

**Posicionamento:** líder para construtoras médias e grandes. Ecossistema completo (ERP da construção).

**Funcionalidades-chave:**
- Contratos com gerador automático em Word
- Medições com fotos integradas
- Relatórios previsto × realizado
- Controle de materiais e fornecedores
- Gestão financeira (contas a pagar/receber, fluxo de caixa, DRE)
- Folha de pagamento
- Integração contábil

**Preço:** premium (mensalidade para 10+ usuários). Não atende pequenos empreiteiros por custo.

**Gap que Obra Integrada pode explorar:** mercado de **construtoras de 1 a 10 obras/ano** e empreiteiros individuais — custo acessível + experiência mobile.

### 2.2.2. Vobi

**Posicionamento:** "O único software de gestão de obras com Agentes de IA do Brasil" (slogan oficial).

**Funcionalidades-chave:**
- Orçamento com integração SINAPI (tabela nacional de insumos da construção)
- Controle financeiro e cronograma
- Diário de obras
- **Agentes de IA** (principal diferencial declarado)
- Foco em construtoras pequenas/médias, empreiteiros, escritórios de arquitetura/design

**Gap que Obra Integrada pode explorar:** Vobi ainda é SaaS proprietário; o Obra Integrada pode posicionar-se como **alternativa brasileira com foco mobile-first para canteiro** (campo, não escritório).

### 2.2.3. Obra Prima

**Posicionamento:** 2.000+ empresas, foco em pequenas e médias construtoras.

**Funcionalidades-chave:**
- Orçamentação rápida
- Cronograma físico-financeiro integrado
- **RDO (Relatório Diário de Obra) completo** — bem formatado, com fotos, para enviar ao cliente
- Aplicativo mobile

**Gap:** o Obra Integrada já tem diário de obra com foto + GPS — é necessário **formatar em RDO exportável** (PDF mensal) para empatar.

### 2.2.4. Mobuss Construção

**Posicionamento:** solução modular do canteiro ao pós-obra.

**Funcionalidades-chave (11 módulos):**
- Projetos
- Apropriação (pointing — alocação de horas)
- Diário de obra
- Insumos
- Documentos
- Apontamentos
- Segurança
- Qualidade
- Inspeção e Entrega
- Assistência Técnica (pós-obra)
- Integrações com ERPs, CRMs, catracas físicas

**Gap:** a modularidade do Mobuss é inspiradora — o Obra Integrada pode seguir a mesma lógica de **ativação opcional de módulos** por cliente (ex: cliente X só quer Diário + Tarefas, não paga pelo resto).

### 2.2.5. Consolidação de gaps do Obra Integrada vs. mercado

Tabela comparativa (✓ = presente e funcional, ⚠ = parcial, ✗ = ausente):

| Funcionalidade | Obra Integrada | Sienge | Vobi | Obra Prima | Mobuss |
|---|---|---|---|---|---|
| Cadastro de obras | ✓ | ✓ | ✓ | ✓ | ✓ |
| Diário de obra | ✓ | ✓ | ✓ | ✓ | ✓ |
| Diário com GPS + auditoria geográfica | ✓ | ✗ | ✗ | ⚠ | ⚠ |
| RDO exportável em PDF | ✗ | ✓ | ✓ | **✓ (principal)** | ✓ |
| Orçamento com SINAPI | ✗ | ✓ | **✓ (diferencial)** | ✓ | ⚠ |
| Cronograma físico-financeiro | ⚠ | ✓ | ✓ | ✓ | ✓ |
| Gantt visual | ✗ | ✓ | ✓ | ✓ | ✓ |
| Catálogo de materiais | ⚠ schema only | ✓ | ✓ | ✓ | ✓ |
| Catálogo de fabricantes | ⚠ schema only | ✓ | ✓ | ⚠ | ✓ |
| Requisição de material | ⚠ schema only | ✓ | ✓ | ✓ | ✓ |
| Estoque por obra com movimentações | ✓ | ✓ | ✓ | ✓ | ✓ |
| RH / folha / ponto | ⚠ parcial | ✓ | ⚠ | ✓ | ✓ |
| Segurança do trabalho (EPI) | ✗ | ⚠ | ✗ | ✗ | **✓ (diferencial Mobuss)** |
| Qualidade / inspeção | ✗ | ⚠ | ✗ | ⚠ | ✓ |
| Financeiro — fluxo de caixa | ✗ | ✓ | ✓ | ✓ | ⚠ |
| DRE / relatórios gerenciais | ✗ | ✓ | ✓ | ⚠ | ⚠ |
| Agentes de IA | ✗ | ✗ | **✓ (único)** | ✗ | ✗ |
| App mobile | ✗ | ✓ | ✓ | ✓ | ✓ |
| PWA offline | ✗ | ✗ | ✗ | ⚠ | ⚠ |
| Multi-tenancy | ✓ | ✓ | ✓ | ✓ | ✓ |
| WhatsApp (notificações) | ✗ | ⚠ | ⚠ | ✓ | ⚠ |
| Integração contábil | ✗ | ✓ | ⚠ | ⚠ | ⚠ |
| Impersonação admin | ✓ | ⚠ | ⚠ | ⚠ | ⚠ |
| Auditoria estrutural (log permanente) | ⚠ (quebrado) | ✓ | ✓ | ✓ | ✓ |

**Sinais positivos:** O Obra Integrada já tem 3 itens onde se posiciona **igual ou melhor** que os líderes (diário com GPS, impersonação admin, multi-tenancy no core desde o início).

**Sinais preocupantes:** Falta o básico do concorrente brasileiro mais popular em pequenas construtoras (RDO exportável do Obra Prima). Implementar isso é o gap #1 do roadmap.

**Fontes consultadas:**
- [Os 12 melhores softwares de gestão de obras — blog Obra Prima](https://blog.obraprima.eng.br/12-melhores-de-softwares-de-gestao-de-obras/)
- [Os 10 Melhores Softwares para Construtoras em 2026 — Foco em Obra](https://focoenobra.com/pt-br/blog/10-melhores-softwares-para-construtoras/)
- [Vobi — Software de Gestão de Obras com Agentes de IA](https://www.vobi.com.br)
- [Sienge — Software de gestão de obras](https://sienge.com.br/blog/software-de-gestao-de-obras/)
- [Mobuss Construção — solução modular](https://www.mobussconstrucao.com.br/)
- [Mobuss — Diário de obras](https://www.mobussconstrucao.com.br/modulo/diario-de-obras/)

---

## 2.3. Novas funcionalidades sugeridas

A seguir, **15 features propostas** com racional completo. A distribuição ao longo do cronograma de 24 meses está em 2.3.16.

### 2.3.1. Feature 01 — RDO exportável em PDF

**Problema que resolve:** o diário de obra existe, mas não há forma de **entregar ao cliente** (engenheiro/proprietário) um relatório formatado. Hoje cada entrada fica isolada no sistema.

**Descrição funcional:** dado um intervalo de datas (dia, semana, mês), gerar PDF com logo da obra, cabeçalho (obra, cliente, engenheiro responsável), lista de entradas do diário no período (cada uma com descrição, foto reduzida, GPS, autor, status de auditoria) e resumo (dias trabalhados, dias parados, fotos totais). Botão "Enviar por e-mail ao cliente".

**Tecnologia:** `pdfkit` ou `puppeteer-core` (renderizar HTML → PDF) no backend; template HTML/React SSR.

**Impacto no usuário:** **5/5** — paridade com Obra Prima, diferencial versus Sienge em pequena escala.

**Esforço de implementação:** **M** (3-5 dias).

**Dependências técnicas:** migração de uploads para S3/Supabase (Feature 06), caso contrário fotos não aparecem no PDF em produção.

**Mês sugerido:** Mês 4.

### 2.3.2. Feature 02 — Módulo de Materiais + Catálogo de Fabricantes

**Problema que resolve:** 7 entidades do schema (`tb_material`, `tb_fabricante`, `tb_material_fabricante`, `tb_etapa`, `tb_etapa_material`, `tb_requisicao`, `tb_material_requisitado`) estão prontas mas não expostas — potencial de mercado desperdiçado.

**Descrição funcional:**
- CRUD de materiais globais (cimento, brita, areia, tinta, etc.) com unidade de medida, preço unitário, densidade, resistência
- CRUD de fabricantes
- M:N entre material e fabricante (ex: cimento CP-II pode ser Votorantim, Mizu ou InterCement)
- Filtro por material em requisições

**Tecnologia:** 7 novos controllers + rotas + telas FE.

**Impacto no usuário:** **4/5** — habilita orçamentação, requisições, estoque — bloqueador para Features 03 e 04.

**Esforço:** **L** (~2 semanas).

**Dependências:** nenhuma.

**Mês sugerido:** Mês 5.

### 2.3.3. Feature 03 — Módulo de Etapas da Obra (Cronograma Físico)

**Problema que resolve:** obras têm etapas (fundação, estrutura, alvenaria, acabamento), mas hoje não existem como objetos — tarefas ficam soltas.

**Descrição funcional:**
- Cada obra tem N etapas com nome, `previsao_inicio`, `previsao_fim`, `id_status`
- Cada etapa tem M materiais previstos (via `tb_etapa_material`)
- Progresso da etapa = % de tarefas concluídas dentro dela
- Visualização em timeline horizontal (similar a Gantt simplificado)

**Tecnologia:** schema já existe. Backend: CRUD. Frontend: componente de timeline customizado (ou `dhtmlx-gantt` / `frappe-gantt`).

**Impacto:** **5/5** — bloqueador para Feature 04 (caminho crítico) e Feature 07 (previsto × realizado).

**Esforço:** **L** (~2 semanas).

**Dependências:** Feature 02 parcial (só materiais).

**Mês sugerido:** Mês 6.

### 2.3.4. Feature 04 — Cronograma físico-financeiro com Curva S

**Problema que resolve:** construtoras precisam visualizar **avanço físico** (% da obra entregue) × **avanço financeiro** (% do orçamento gasto) ao longo do tempo. É o KPI clássico da construção.

**Descrição funcional:**
- Gráfico de curva S com 3 linhas: previsto físico, realizado físico, realizado financeiro
- Alerta automático quando realizado físico < previsto físico - 10%
- Exportável

**Tecnologia:** ApexCharts (já no stack) para gráfico; cálculos no backend.

**Impacto:** **5/5** — paridade com concorrentes grandes; vende a banca acadêmica (visualização profissional).

**Esforço:** **M** (4-6 dias).

**Dependências:** Feature 03.

**Mês sugerido:** Mês 7.

### 2.3.5. Feature 05 — PWA offline-first para canteiro de obra

**Problema que resolve:** canteiros de obra frequentemente têm **conexão 3G/4G instável ou ausente**. Hoje o frontend é SPA online — se o mestre de obras perde sinal, não registra o diário.

**Descrição funcional:**
- Service Worker com cache estratégico (CacheFirst para assets, NetworkFirst com fallback para dados)
- Fila de sincronização: diário/tarefa criados offline ficam em IndexedDB e são enviados quando reconecta
- Indicador visual "modo offline" na UI
- Instalável como PWA (`manifest.json`, ícones)

**Tecnologia:** `vite-plugin-pwa` + `workbox`. IndexedDB via `idb` ou `dexie`.

**Impacto:** **5/5** — **diferencial enorme para canteiro**, nenhum concorrente grande faz bem.

**Esforço:** **L** (~2 semanas).

**Dependências:** Feature 06 (storage externo), caso contrário fotos offline não sincronizam.

**Mês sugerido:** Mês 10.

### 2.3.6. Feature 06 — Storage externo (Supabase Storage ou R2)

**Problema que resolve:** `multer.diskStorage` é incompatível com Vercel (filesystem efêmero). Bloqueador de produção.

**Descrição funcional:**
- Backend: trocar `storageService.js` para upload direto ao Supabase Storage ou Cloudflare R2
- Streaming direto (memoryStorage do multer + stream)
- URL pré-assinada (signed URL) para download privado

**Tecnologia:** `@supabase/storage-js` OU `@aws-sdk/client-s3` + R2 endpoint.

**Impacto:** **5/5** — bloqueador.

**Esforço:** **M** (3-5 dias).

**Dependências:** nenhuma.

**Mês sugerido:** Mês 2 (antes do primeiro deploy em Vercel).

### 2.3.7. Feature 07 — IA: geração automática de RDO a partir de texto + fotos

**Problema que resolve:** pedreiro/mestre não quer digitar um parágrafo bem escrito. Dita no WhatsApp ("Hoje concretou a laje do térreo, usamos 4 caminhões de brita, faltou cimento CP-II"). Virar isso em RDO formatado é trabalhoso.

**Descrição funcional:**
- Usuário manda mensagem de voz ou texto + fotos
- IA (Claude/GPT-4) estrutura em: atividades realizadas, materiais usados, pendências, observações
- Retorna JSON estruturado que é pré-preenchido no diário
- Analisa fotos para detectar EPI (capacete, bota) e alertar

**Tecnologia:** API Anthropic ou OpenAI; vision model para análise de foto.

**Impacto:** **5/5** — diferencial IA competitivo com Vobi; banca acadêmica adora.

**Esforço:** **L** (~3 semanas).

**Dependências:** Features 01 e 06.

**Mês sugerido:** Mês 13.

### 2.3.8. Feature 08 — Estimativa automática de materiais por m² via IA + SINAPI

**Problema que resolve:** orçamentação é trabalhosa; hoje o usuário calcula materiais manualmente.

**Descrição funcional:**
- Dado: área da obra (m²), tipo (casa térrea, sobrado, comercial), nível de acabamento (popular/médio/alto)
- IA sugere lista de materiais com quantidades baseadas em tabelas SINAPI e padrões comuns
- Usuário revisa, ajusta, confirma. Sistema cria requisições iniciais.

**Tecnologia:** SINAPI via dataset público (atualização mensal); IA para interpretar input; regras para cálculo por m².

**Impacto:** **5/5** — paridade com Vobi; vende o produto em demos.

**Esforço:** **XL** (~1 mês).

**Dependências:** Features 02 e 03.

**Mês sugerido:** Mês 15.

### 2.3.9. Feature 09 — Chat com IA para trabalhadores ("Dúvidas da obra")

**Problema que resolve:** ajudante pergunta "quanto de cimento vai num saco de argamassa?" — sem treinamento é complicado.

**Descrição funcional:**
- Chatbot embarcado no app/PWA
- RAG (Retrieval Augmented Generation) sobre base de conhecimento: manuais de fabricantes, normas ABNT, tabelas de traço de concreto
- Usuário digita ou fala pergunta, IA responde com fontes
- Memória curta por sessão

**Tecnologia:** Claude/GPT + embedding + vector DB (Supabase pgvector é suficiente).

**Impacto:** **4/5** — marketing forte, utilidade real limitada (pedreiros experientes já sabem).

**Esforço:** **L** (~2 semanas).

**Dependências:** nenhuma técnica, mas exige curadoria de conteúdo.

**Mês sugerido:** Mês 17.

### 2.3.10. Feature 10 — Notificações WhatsApp Business (ativas)

**Problema que resolve:** trabalhador não abre app. Mas todo mundo usa WhatsApp.

**Descrição funcional:**
- Integração com WhatsApp Business Cloud API (Meta)
- Triggers: tarefa atribuída, prazo vencendo em 24h, diário requer auditoria, pagamento próximo
- Usuário pode responder "concluída" no WhatsApp e o sistema atualiza o status

**Tecnologia:** WhatsApp Cloud API; webhook de mensagens recebidas; número verificado.

**Impacto:** **4/5** — diferencial real no mercado BR.

**Esforço:** **L** (~2 semanas) + processo burocrático de verificação Meta.

**Dependências:** nenhuma técnica; dependência legal (conta verificada Meta).

**Mês sugerido:** Mês 14.

### 2.3.11. Feature 11 — Módulo de Segurança do Trabalho (EPI + NR-18)

**Problema que resolve:** segurança em canteiro é obrigatória (NR-18); não tem no Obra Integrada. Mobuss usa como diferencial.

**Descrição funcional:**
- Checklist de EPI por trabalhador (capacete, botina, óculos, luva, cinto de segurança) — entrega registrada
- Ficha de NR-18 por obra (condições do canteiro)
- Registro de incidentes (leve, moderado, grave)
- Dashboard com taxa de entrega de EPI, incidentes por mês

**Tecnologia:** novas entidades Prisma + CRUD. Foto do trabalhador com EPI colocado (feature 07 pode auto-validar).

**Impacto:** **4/5** — compliance legal, diferencial em concorrentes pequenos.

**Esforço:** **L** (~2 semanas).

**Dependências:** Feature 11 pode usar Feature 07 se integrado.

**Mês sugerido:** Mês 18.

### 2.3.12. Feature 12 — Dashboard executivo BI

**Problema que resolve:** proprietário de construtora pequena quer saber "como está o negócio?" — hoje tem que abrir cada obra.

**Descrição funcional:**
- Widgets: número de obras ativas, faturamento no mês, margem média, obras atrasadas, tarefas pendentes, fluxo de caixa consolidado
- Filtro por período
- Exportação Excel/PDF
- Drill-down por obra

**Tecnologia:** ApexCharts já no stack.

**Impacto:** **4/5** — vende para o tomador de decisão (proprietário).

**Esforço:** **M** (~1 semana).

**Dependências:** Features 03 e 04.

**Mês sugerido:** Mês 8.

### 2.3.13. Feature 13 — Integração com Google Maps (navegação)

**Problema que resolve:** trabalhador recebe endereço da obra e precisa copiar-colar no maps. Poderia ser click-to-navigate.

**Descrição funcional:**
- Na tela da obra, botão "Ir até a obra" que abre Google Maps com rota
- Se feature 05 (PWA), usa geolocalização atual como origem
- Ícone no app para última obra visitada

**Tecnologia:** deep link `https://www.google.com/maps/dir/?api=1&destination=LAT,LONG`. Sem custo de API.

**Impacto:** **3/5** — conveniência, não transformador.

**Esforço:** **S** (<1 dia).

**Dependências:** nenhuma. Já tem lat/long na obra.

**Mês sugerido:** Mês 3 (quick win).

### 2.3.14. Feature 14 — Previsão do tempo por obra

**Problema que resolve:** `operationalController.getWeatherMock` é placeholder. Concretagem não pode em chuva; mestre de obras precisa saber com antecedência.

**Descrição funcional:**
- Para cada obra (lat/long), busca previsão de 7 dias em API pública (OpenWeatherMap, CPTEC, INPE)
- Alerta na dashboard se previsão de chuva >60% em dia de concretagem planejada
- Integração com tarefas: marcar tarefa como "sensível a chuva"

**Tecnologia:** OpenWeatherMap tem plano free (1000 calls/dia — suficiente para <30 obras ativas).

**Impacto:** **4/5** — utilidade real, fácil de demonstrar.

**Esforço:** **S** (~2 dias).

**Dependências:** nenhuma.

**Mês sugerido:** Mês 3 (quick win).

### 2.3.15. Feature 15 — Biblioteca de plantas e BIM (visualização básica)

**Problema que resolve:** upload de documentos existe, mas PDF de planta fica misturado com contratos e NFs. Engenheiro quer visualização rápida no mobile.

**Descrição funcional:**
- Categorização de documentos: Planta, Contrato, NF, Foto, ART/RRT, Licença
- Viewer embutido de PDF/DWG (visualização leve)
- Anotações do engenheiro na planta (pontos com comentário)
- Links de planta compartilháveis com trabalhador (sem login)

**Tecnologia:** `react-pdf` para PDF; `three.js` + `three-dxf` para DWG (mais complexo).

**Impacto:** **4/5** — diferencial profissional.

**Esforço:** **L** (~2 semanas).

**Dependências:** Feature 06.

**Mês sugerido:** Mês 20.

### 2.3.16. Cronograma macro das 15 features

| Mês | Feature | Esforço | Justificativa de posicionamento |
|---|---|---|---|
| 2 | Feature 06 — Storage S3/Supabase | M | Bloqueador de deploy |
| 3 | Feature 13 — Google Maps | S | Quick win (<1 dia) |
| 3 | Feature 14 — Previsão do tempo | S | Quick win, substitui o mock atual |
| 4 | Feature 01 — RDO PDF | M | Fecha gap competitivo com Obra Prima |
| 5 | Feature 02 — Materiais + Fabricantes | L | Base para toda cadeia de orçamento |
| 6 | Feature 03 — Etapas | L | Base para cronograma e BI |
| 7 | Feature 04 — Curva S | M | Visual profissional para banca |
| 8 | Feature 12 — Dashboard BI | M | Consolida dados das anteriores |
| 10 | Feature 05 — PWA offline | L | Diferencial mobile; após base estável |
| 13 | Feature 07 — IA de RDO | L | Requer base Features 01 e 06 |
| 14 | Feature 10 — WhatsApp | L | Requer verificação Meta (processo longo) |
| 15 | Feature 08 — IA + SINAPI | XL | Maior complexidade, após materiais |
| 17 | Feature 09 — Chat IA trabalhadores | L | Refinamento; base de conhecimento leva tempo |
| 18 | Feature 11 — Segurança do trabalho | L | Módulo grande, mas sem bloqueadores |
| 20 | Feature 15 — Biblioteca de plantas/BIM | L | Polimento final |

**Total de esforço:** ~6 meses-equivalente de 1 desenvolvedor (considerando 5 devs trabalhando em paralelo + overhead, cabe confortavelmente em 18 meses dedicados a features + 2 meses de polimento).

---

## 2.4. Oportunidades de arquitetura

### 2.4.1. Eventos e filas assíncronas

**Caso de uso:**
- Envio de e-mail de auditoria pendente
- Processamento de foto do diário (redimensionamento, geração de thumbnail, análise de EPI via IA)
- Geração de PDF RDO mensal
- Notificação WhatsApp
- Sync offline (Feature 05)

**Alternativas:**
- **BullMQ + Redis (Upstash)**: padrão Node.js, integra bem, Upstash tem free tier serverless
- **AWS SQS + Lambda**: mais escalável, mas complexidade operacional maior
- **Inngest**: função-como-job, integra direto com Vercel, produto jovem mas crescente

**Recomendação:** BullMQ + Upstash para MVP (entrega valor em Mês 4), reavaliar para Inngest quando processamentos chegarem a milhares/dia.

### 2.4.2. Cache

**Caso de uso:**
- `requireObraAccess` executa 2-3 queries por request protegido — cachear o mapa `user → obras acessíveis` por 60s reduz carga significativamente
- Catálogos (`tb_status`, `tb_papel`, materiais globais) — cacheáveis por horas
- Métricas globais do Admin — recalcular a cada 5 min, servir cached

**Alternativas:**
- **Redis (Upstash)**: mesma infra do BullMQ
- **In-memory LRU com invalidação por TTL**: suficiente por Vercel Function; trade-off: cada instância tem seu cache (pior para dados compartilhados)
- **Vercel Edge Config**: ótimo para dados globais raramente mutáveis

**Recomendação:** Upstash Redis compartilhado para o que é compartilhável; LRU em memória para o resto.

### 2.4.3. Realtime

**Caso de uso:**
- Quando mestre de obras adiciona entrada no diário, gerente vê na dashboard sem refresh
- Colaboração em formulário de obra (2 pessoas editando a mesma obra)
- Notificação visual em tempo real

**Alternativas:**
- **Supabase Realtime** (CDC do Postgres via WebSocket): se DB já é Supabase, é zero-effort
- **Pusher** / **Ably**: SaaS dedicados, free tiers generosos
- **Server-Sent Events (SSE)** caseiro: simples, funciona em Vercel com streaming (Edge Functions)

**Recomendação:** Supabase Realtime se o Postgres estiver hospedado lá (ADR-002). Custo zero, setup de 1 hora.

### 2.4.4. Integrações externas

| Integração | Prioridade | Mês | Complexidade |
|---|---|---|---|
| WhatsApp Business (Meta Cloud API) | Alta | 14 | Alta (burocrática) |
| Google Maps / Geocoding | Média | 3 | Baixa |
| OpenWeatherMap / CPTEC | Média | 3 | Baixa |
| SINAPI (dados públicos Caixa) | Alta | 15 | Média (parse de planilha) |
| WhatsApp Twilio (alternativa) | Baixa | 18 | Baixa (custo por mensagem) |
| API de cotação de materiais | Baixa | 22 | Média (sem API oficial; scraping de Leroy / C&C) |
| IA (Anthropic / OpenAI) | Alta | 13 | Baixa |
| Stripe / Pagar.me | Média | 20 | Média (para SaaS cobrar assinatura) |
| ReceitaWS / CPF validation | Baixa | 12 | Baixa |
| Cloudinary (fallback de imagens) | Baixa | — | Baixa |

### 2.4.5. Arquitetura em camadas (preparação para escala)

Proposta detalhada no artefato 03 (ADR-011 implícito). Em resumo:

```
┌──────────────────────────────────┐
│  Controllers (HTTP adapters)     │
├──────────────────────────────────┤
│  Services (regra de negócio)     │
├──────────────────────────────────┤
│  Repositories (acesso a dados)   │
├──────────────────────────────────┤
│  Prisma / External APIs          │
└──────────────────────────────────┘
```

Aplicar **Ports & Adapters (Hexagonal Architecture)** de Alistair Cockburn, com as seguintes correspondências:
- **Ports:** interfaces de service (ex: `IObraService.criar(dto)`)
- **Adapters primários:** controllers Express (recebem HTTP e chamam service)
- **Adapters secundários:** `PrismaObraRepository`, `SupabaseStorageAdapter`, `WhatsAppNotifier`

Isso permite trocar Prisma → Drizzle, ou Supabase → R2, sem tocar em services. Critério para aplicar: módulos novos (Features 02, 03) já nascem com a arquitetura correta; módulos existentes são refatorados gradualmente.

---

## Conclusão da Fase 2

O Obra Integrada está em **posição estratégica favorável** como projeto acadêmico: escopo já funcional, arquitetura moderna, e 7 entidades de materiais/requisições prontas para virar módulo — uma vantagem de **~3 semanas de trabalho** sobre um começo do zero.

As 15 features propostas equilibram: (1) **paridade competitiva** (RDO PDF, cronograma físico-financeiro, materiais) nas Features 01-04, 12; (2) **diferencial mobile-first** (PWA, Google Maps, tempo) nas Features 05, 13, 14; (3) **diferencial IA para impressionar banca** (RDO automático, estimativa SINAPI, chat) nas Features 07, 08, 09; e (4) **lock-in e compliance** (EPI/NR-18, BI, biblioteca de plantas) nas Features 11, 12, 15.

Nenhuma feature isolada é revolucionária — o diferencial do produto acadêmico é **a combinação coerente** de mobile-first + GPS nativo + IA aplicada + modularidade por cliente, colocando o Obra Integrada em posição competitiva com Vobi (diferencial IA) e Obra Prima (RDO e simplicidade) para a faixa de construtoras pequenas.

O detalhamento de **como** implementar essas features com qualidade (arquitetura, ADRs, limpeza técnica) está no artefato 03.
