# Fase 2 ÔÇö Evolu├º├úo do Produto

**Projeto:** Obra Integrada
**Data:** 24 de abril de 2026
**Escopo:** Avalia├º├úo das funcionalidades atuais, benchmark competitivo e roadmap de features novas

---

## Sum├írio executivo

O Obra Integrada tem **funda├º├úo funcional s├│lida** para os tr├¬s pilares b├ísicos de gest├úo de obras (obras + di├írio + tarefas) e j├í apresenta **2 diferenciais competitivos** para a faixa de construtoras pequenas/m├®dias: (1) auditoria geogr├ífica autom├ítica do di├írio com `latitude`/`longitude` no modelo (suporte mobile-first), e (2) arquitetura multi-tenancy por `tb_cliente` desde o schema. Essas duas escolhas s├úo maduras e v├úo al├®m do que o **Obra Prima** (l├¡der em pequenas construtoras) oferece por default.

Em contrapartida, o produto **carece dos diferenciais atuais do mercado** em 2026: Agentes de IA (Vobi), integra├º├úo com SINAPI para or├ºamenta├º├úo, RDO (Relat├│rio Di├írio de Obra) estruturado com evid├¬ncias fotogr├íficas, app mobile nativo ou PWA offline-first, e integra├º├Áes (WhatsApp, ERPs, planilhas de or├ºamento). H├í tamb├®m **9 m├│dulos do schema Prisma planejados mas n├úo implementados** (materiais, fabricantes, etapas, requisi├º├Áes) que, se conclu├¡dos, j├í aproximam o produto do patamar do Sienge.

Este artefato detalha 15 features novas propostas, cada uma com estimativa de esfor├ºo e impacto, mapeadas em um cronograma de 24 meses que considera: (a) diferenciais para banca acad├¬mica, (b) aproveitamento de IA, (c) abordagem mobile-first com PWA, e (d) cria├º├úo de lock-in via hist├│rico acumulado e integra├º├Áes.

---

## 2.1. An├ílise das funcionalidades atuais

A tabela abaixo categoriza cada funcionalidade existente. **Status** usa escala: **Completa** (funciona fim-a-fim), **Incompleta** (parcial / UI placeholder), **Com bugs** (apresenta defeitos evidentes). **Tipo competitivo**: **Diferencial** (supera m├®dia do mercado), **Paridade** (igual aos concorrentes), **Commodity** (b├ísico esperado).

### 2.1.1. M├│dulo Obras

| Funcionalidade | Status | Tipo | Observa├º├úo |
|---|---|---|---|
| CRUD de obras (cadastro, edi├º├úo, exclus├úo) | Completa | Commodity | Wizard em `NovaObraWizard.jsx` |
| Listagem com pagina├º├úo + filtro RBAC por role | Completa | Paridade | ÔÇö |
| Detalhamento com dados t├®cnicos (├írea, alvar├í, ART/RRT) | Completa | Paridade | Campos existem no schema |
| Org-chart da equipe da obra | Completa | Paridade | H├í duplica├º├úo: fun├º├úo em dois controllers |
| Breakdown de or├ºamento (material / m├úo de obra / taxas) | Incompleta | Paridade | Campos no schema, mas sem UI de acompanhamento |
| Geolocaliza├º├úo da obra (lat/long) | Completa | Diferencial | Preparada para mapa na listagem |
| Contatos de emerg├¬ncia | Completa | Commodity | ÔÇö |

### 2.1.2. M├│dulo Di├írio de Obra

| Funcionalidade | Status | Tipo | Observa├º├úo |
|---|---|---|---|
| Registro di├írio com descri├º├úo | Completa | Commodity | M├¡nimo 3 caracteres |
| Upload de foto | Completa | Commodity | Via multer diskStorage (problema Vercel) |
| Captura de GPS | Completa | **Diferencial** | `latitude`, `longitude` no schema |
| Status de auditoria (AUTOMATICO ÔåÆ AUTORIZADO/REPROVADO) | Completa | **Diferencial** | Workflow de aprova├º├úo |
| Justificativa de GPS (quando fora do raio) | Completa | **Diferencial** | ÔÇö |
| Log de auditoria (quem aprovou) | **Com bug** | Diferencial | Helper `registrarLog()` grava em `tb_log_auditoria` que **n├úo existe no schema** |
| Dashboard de di├írios pendentes | Completa | Paridade | `/admin/metrics/pendentes` |

### 2.1.3. M├│dulo Tarefas

| Funcionalidade | Status | Tipo | Observa├º├úo |
|---|---|---|---|
| CRUD de tarefas | Completa | Commodity | ÔÇö |
| Atribui├º├úo a m├║ltiplos usu├írios | Completa | Paridade | Via `tb_tarefa_usuario` |
| Status + percentual de conclus├úo | Completa | Paridade | Sem valida├º├úo de percentual Ôëñ100 |
| Prioridade (BAIXA/NORMAL/ALTA/URGENTE) | Completa | Commodity | ÔÇö |
| Prazo | Completa | Commodity | ÔÇö |
| Visualiza├º├úo em calend├írio | Completa | Paridade | Via FullCalendar |
| Depend├¬ncias entre tarefas | **Ausente** | Diferencial | N├úo modelado (nada em schema) |
| Caminho cr├¡tico (CPM) | **Ausente** | Diferencial | ÔÇö |
| Gantt | **Ausente** | Paridade | FullCalendar n├úo prov├¬ Gantt |

### 2.1.4. M├│dulo Financeiro

| Funcionalidade | Status | Tipo | Observa├º├úo |
|---|---|---|---|
| Registro de receita/despesa | Completa | Commodity | ÔÇö |
| Upload de comprovante/NF | Completa | Commodity | Mesma limita├º├úo Vercel de uploads |
| Listagem por obra | Completa | Commodity | ÔÇö |
| Exclus├úo | **Com bug de seguran├ºa** | ÔÇö | Falta `requireObraAccess` |
| Dashboard financeiro (previsto x realizado) | **Incompleta** | Paridade | Tela UnderConstruction |
| Fluxo de caixa | **Ausente** | Paridade | ÔÇö |
| DRE / relat├│rios gerenciais | **Ausente** | Paridade | ÔÇö |
| Integra├º├úo cont├íbil | **Ausente** | Diferencial | ÔÇö |

### 2.1.5. M├│dulo RH

| Funcionalidade | Status | Tipo | Observa├º├úo |
|---|---|---|---|
| Cadastro de funcion├írio com CPF/email validados | Completa | Paridade | `utils/validation.js` |
| Auto-gera├º├úo de matr├¡cula (MAT-YYYY-NNN) | Completa | Diferencial | ÔÇö |
| Pagina├º├úo com busca e filtros | Completa | Paridade | ÔÇö |
| Inativa├º├úo (soft delete) com prote├º├úo de PROPRIETARIO | Completa | Paridade | ÔÇö |
| Perfil / CV do trabalhador | Completa | Paridade | `MeuPerfilCV.jsx` |
| Ponto / frequ├¬ncia | **Ausente** | Paridade | ÔÇö |
| Pagamento por dia / folha | Incompleta | Paridade | Campo `valor_dia` existe; sem tela |
| EPI e seguran├ºa do trabalho | **Ausente** | Diferencial | ÔÇö |

### 2.1.6. M├│dulo Admin

| Funcionalidade | Status | Tipo | Observa├º├úo |
|---|---|---|---|
| M├®tricas globais (obras, usu├írios, documentos) | Completa | Paridade | Sem RBAC ÔÇö bug de seguran├ºa |
| Listagem de clientes (multi-tenancy) | Completa | Diferencial | Arquitetura madura |
| Auditoria de profissionais | Completa | Diferencial | Status PENDENTE/VERIFICADO/INVALIDO |
| Simula├º├úo de rentabilidade (SaaS mock) | Completa | Commodity | Mockado |
| Impersona├º├úo de usu├írios | Completa | Diferencial | Com banner de aviso |
| Health check | Completa | Commodity | ÔÇö |

### 2.1.7. M├│dulos planejados no schema mas N├âO implementados

Estes modelos existem no Prisma sem controllers/rotas correspondentes ÔÇö representam **~40% do schema ocioso**:

| Modelo | Finalidade ├│bvia | Esfor├ºo p/ completar |
|---|---|---|
| `tb_material` | Cat├ílogo global de materiais | M |
| `tb_fabricante` | Cat├ílogo de fabricantes | S |
| `tb_material_fabricante` | M:N material ├ù fabricante | S |
| `tb_etapa` | Etapas/fases da obra | M |
| `tb_etapa_material` | Materiais por etapa | M |
| `tb_requisicao` | Requisi├º├úo de material | M |
| `tb_material_requisitado` | Itens da requisi├º├úo | S |
| `tb_estoque_obra` | Ô£à implementado parcialmente | ÔÇö |
| `tb_movimentacao_estoque` | Ô£à implementado parcialmente | ÔÇö |

**Conclus├úo:** O projeto tem 7 entidades prontas para virar um **m├│dulo de Materiais, Etapas e Requisi├º├Áes** ÔÇö alta alavancagem, baixo custo incremental (cerca de 3 semanas de trabalho para um dev), alto impacto de produto (aproxima-se de Sienge e Vobi).

---

## 2.2. Benchmark competitivo ÔÇö mercado brasileiro

Pesquisa feita em abril de 2026 cobrindo 4 concorrentes principais do segmento de software de gest├úo de obras para constru├º├úo civil no Brasil. Fontes consultadas (nota: links ao final da se├º├úo).

### 2.2.1. Sienge

**Posicionamento:** l├¡der para construtoras m├®dias e grandes. Ecossistema completo (ERP da constru├º├úo).

**Funcionalidades-chave:**
- Contratos com gerador autom├ítico em Word
- Medi├º├Áes com fotos integradas
- Relat├│rios previsto ├ù realizado
- Controle de materiais e fornecedores
- Gest├úo financeira (contas a pagar/receber, fluxo de caixa, DRE)
- Folha de pagamento
- Integra├º├úo cont├íbil

**Pre├ºo:** premium (mensalidade para 10+ usu├írios). N├úo atende pequenos empreiteiros por custo.

**Gap que Obra Integrada pode explorar:** mercado de **construtoras de 1 a 10 obras/ano** e empreiteiros individuais ÔÇö custo acess├¡vel + experi├¬ncia mobile.

### 2.2.2. Vobi

**Posicionamento:** "O ├║nico software de gest├úo de obras com Agentes de IA do Brasil" (slogan oficial).

**Funcionalidades-chave:**
- Or├ºamento com integra├º├úo SINAPI (tabela nacional de insumos da constru├º├úo)
- Controle financeiro e cronograma
- Di├írio de obras
- **Agentes de IA** (principal diferencial declarado)
- Foco em construtoras pequenas/m├®dias, empreiteiros, escrit├│rios de arquitetura/design

**Gap que Obra Integrada pode explorar:** Vobi ainda ├® SaaS propriet├írio; o Obra Integrada pode posicionar-se como **alternativa brasileira com foco mobile-first para canteiro** (campo, n├úo escrit├│rio).

### 2.2.3. Obra Prima

**Posicionamento:** 2.000+ empresas, foco em pequenas e m├®dias construtoras.

**Funcionalidades-chave:**
- Or├ºamenta├º├úo r├ípida
- Cronograma f├¡sico-financeiro integrado
- **RDO (Relat├│rio Di├írio de Obra) completo** ÔÇö bem formatado, com fotos, para enviar ao cliente
- Aplicativo mobile

**Gap:** o Obra Integrada j├í tem di├írio de obra com foto + GPS ÔÇö ├® necess├írio **formatar em RDO export├ível** (PDF mensal) para empatar.

### 2.2.4. Mobuss Constru├º├úo

**Posicionamento:** solu├º├úo modular do canteiro ao p├│s-obra.

**Funcionalidades-chave (11 m├│dulos):**
- Projetos
- Apropria├º├úo (pointing ÔÇö aloca├º├úo de horas)
- Di├írio de obra
- Insumos
- Documentos
- Apontamentos
- Seguran├ºa
- Qualidade
- Inspe├º├úo e Entrega
- Assist├¬ncia T├®cnica (p├│s-obra)
- Integra├º├Áes com ERPs, CRMs, catracas f├¡sicas

**Gap:** a modularidade do Mobuss ├® inspiradora ÔÇö o Obra Integrada pode seguir a mesma l├│gica de **ativa├º├úo opcional de m├│dulos** por cliente (ex: cliente X s├│ quer Di├írio + Tarefas, n├úo paga pelo resto).

### 2.2.5. Consolida├º├úo de gaps do Obra Integrada vs. mercado

Tabela comparativa (Ô£ô = presente e funcional, ÔÜá = parcial, Ô£ù = ausente):

| Funcionalidade | Obra Integrada | Sienge | Vobi | Obra Prima | Mobuss |
|---|---|---|---|---|---|
| Cadastro de obras | Ô£ô | Ô£ô | Ô£ô | Ô£ô | Ô£ô |
| Di├írio de obra | Ô£ô | Ô£ô | Ô£ô | Ô£ô | Ô£ô |
| Di├írio com GPS + auditoria geogr├ífica | Ô£ô | Ô£ù | Ô£ù | ÔÜá | ÔÜá |
| RDO export├ível em PDF | Ô£ù | Ô£ô | Ô£ô | **Ô£ô (principal)** | Ô£ô |
| Or├ºamento com SINAPI | Ô£ù | Ô£ô | **Ô£ô (diferencial)** | Ô£ô | ÔÜá |
| Cronograma f├¡sico-financeiro | ÔÜá | Ô£ô | Ô£ô | Ô£ô | Ô£ô |
| Gantt visual | Ô£ù | Ô£ô | Ô£ô | Ô£ô | Ô£ô |
| Cat├ílogo de materiais | ÔÜá schema only | Ô£ô | Ô£ô | Ô£ô | Ô£ô |
| Cat├ílogo de fabricantes | ÔÜá schema only | Ô£ô | Ô£ô | ÔÜá | Ô£ô |
| Requisi├º├úo de material | ÔÜá schema only | Ô£ô | Ô£ô | Ô£ô | Ô£ô |
| Estoque por obra com movimenta├º├Áes | Ô£ô | Ô£ô | Ô£ô | Ô£ô | Ô£ô |
| RH / folha / ponto | ÔÜá parcial | Ô£ô | ÔÜá | Ô£ô | Ô£ô |
| Seguran├ºa do trabalho (EPI) | Ô£ù | ÔÜá | Ô£ù | Ô£ù | **Ô£ô (diferencial Mobuss)** |
| Qualidade / inspe├º├úo | Ô£ù | ÔÜá | Ô£ù | ÔÜá | Ô£ô |
| Financeiro ÔÇö fluxo de caixa | Ô£ù | Ô£ô | Ô£ô | Ô£ô | ÔÜá |
| DRE / relat├│rios gerenciais | Ô£ù | Ô£ô | Ô£ô | ÔÜá | ÔÜá |
| Agentes de IA | Ô£ù | Ô£ù | **Ô£ô (├║nico)** | Ô£ù | Ô£ù |
| App mobile | Ô£ù | Ô£ô | Ô£ô | Ô£ô | Ô£ô |
| PWA offline | Ô£ù | Ô£ù | Ô£ù | ÔÜá | ÔÜá |
| Multi-tenancy | Ô£ô | Ô£ô | Ô£ô | Ô£ô | Ô£ô |
| WhatsApp (notifica├º├Áes) | Ô£ù | ÔÜá | ÔÜá | Ô£ô | ÔÜá |
| Integra├º├úo cont├íbil | Ô£ù | Ô£ô | ÔÜá | ÔÜá | ÔÜá |
| Impersona├º├úo admin | Ô£ô | ÔÜá | ÔÜá | ÔÜá | ÔÜá |
| Auditoria estrutural (log permanente) | ÔÜá (quebrado) | Ô£ô | Ô£ô | Ô£ô | Ô£ô |

**Sinais positivos:** O Obra Integrada j├í tem 3 itens onde se posiciona **igual ou melhor** que os l├¡deres (di├írio com GPS, impersona├º├úo admin, multi-tenancy no core desde o in├¡cio).

**Sinais preocupantes:** Falta o b├ísico do concorrente brasileiro mais popular em pequenas construtoras (RDO export├ível do Obra Prima). Implementar isso ├® o gap #1 do roadmap.

**Fontes consultadas:**
- [Os 12 melhores softwares de gest├úo de obras ÔÇö blog Obra Prima](https://blog.obraprima.eng.br/12-melhores-de-softwares-de-gestao-de-obras/)
- [Os 10 Melhores Softwares para Construtoras em 2026 ÔÇö Foco em Obra](https://focoenobra.com/pt-br/blog/10-melhores-softwares-para-construtoras/)
- [Vobi ÔÇö Software de Gest├úo de Obras com Agentes de IA](https://www.vobi.com.br)
- [Sienge ÔÇö Software de gest├úo de obras](https://sienge.com.br/blog/software-de-gestao-de-obras/)
- [Mobuss Constru├º├úo ÔÇö solu├º├úo modular](https://www.mobussconstrucao.com.br/)
- [Mobuss ÔÇö Di├írio de obras](https://www.mobussconstrucao.com.br/modulo/diario-de-obras/)

---

## 2.3. Novas funcionalidades sugeridas

A seguir, **15 features propostas** com racional completo. A distribui├º├úo ao longo do cronograma de 24 meses est├í em 2.3.16.

### 2.3.1. Feature 01 ÔÇö RDO export├ível em PDF

**Problema que resolve:** o di├írio de obra existe, mas n├úo h├í forma de **entregar ao cliente** (engenheiro/propriet├írio) um relat├│rio formatado. Hoje cada entrada fica isolada no sistema.

**Descri├º├úo funcional:** dado um intervalo de datas (dia, semana, m├¬s), gerar PDF com logo da obra, cabe├ºalho (obra, cliente, engenheiro respons├ível), lista de entradas do di├írio no per├¡odo (cada uma com descri├º├úo, foto reduzida, GPS, autor, status de auditoria) e resumo (dias trabalhados, dias parados, fotos totais). Bot├úo "Enviar por e-mail ao cliente".

**Tecnologia:** `pdfkit` ou `puppeteer-core` (renderizar HTML ÔåÆ PDF) no backend; template HTML/React SSR.

**Impacto no usu├írio:** **5/5** ÔÇö paridade com Obra Prima, diferencial versus Sienge em pequena escala.

**Esfor├ºo de implementa├º├úo:** **M** (3-5 dias).

**Depend├¬ncias t├®cnicas:** migra├º├úo de uploads para S3/Supabase (Feature 06), caso contr├írio fotos n├úo aparecem no PDF em produ├º├úo.

**M├¬s sugerido:** M├¬s 4.

### 2.3.2. Feature 02 ÔÇö M├│dulo de Materiais + Cat├ílogo de Fabricantes

**Problema que resolve:** 7 entidades do schema (`tb_material`, `tb_fabricante`, `tb_material_fabricante`, `tb_etapa`, `tb_etapa_material`, `tb_requisicao`, `tb_material_requisitado`) est├úo prontas mas n├úo expostas ÔÇö potencial de mercado desperdi├ºado.

**Descri├º├úo funcional:**
- CRUD de materiais globais (cimento, brita, areia, tinta, etc.) com unidade de medida, pre├ºo unit├írio, densidade, resist├¬ncia
- CRUD de fabricantes
- M:N entre material e fabricante (ex: cimento CP-II pode ser Votorantim, Mizu ou InterCement)
- Filtro por material em requisi├º├Áes

**Tecnologia:** 7 novos controllers + rotas + telas FE.

**Impacto no usu├írio:** **4/5** ÔÇö habilita or├ºamenta├º├úo, requisi├º├Áes, estoque ÔÇö bloqueador para Features 03 e 04.

**Esfor├ºo:** **L** (~2 semanas).

**Depend├¬ncias:** nenhuma.

**M├¬s sugerido:** M├¬s 5.

### 2.3.3. Feature 03 ÔÇö M├│dulo de Etapas da Obra (Cronograma F├¡sico)

**Problema que resolve:** obras t├¬m etapas (funda├º├úo, estrutura, alvenaria, acabamento), mas hoje n├úo existem como objetos ÔÇö tarefas ficam soltas.

**Descri├º├úo funcional:**
- Cada obra tem N etapas com nome, `previsao_inicio`, `previsao_fim`, `id_status`
- Cada etapa tem M materiais previstos (via `tb_etapa_material`)
- Progresso da etapa = % de tarefas conclu├¡das dentro dela
- Visualiza├º├úo em timeline horizontal (similar a Gantt simplificado)

**Tecnologia:** schema j├í existe. Backend: CRUD. Frontend: componente de timeline customizado (ou `dhtmlx-gantt` / `frappe-gantt`).

**Impacto:** **5/5** ÔÇö bloqueador para Feature 04 (caminho cr├¡tico) e Feature 07 (previsto ├ù realizado).

**Esfor├ºo:** **L** (~2 semanas).

**Depend├¬ncias:** Feature 02 parcial (s├│ materiais).

**M├¬s sugerido:** M├¬s 6.

### 2.3.4. Feature 04 ÔÇö Cronograma f├¡sico-financeiro com Curva S

**Problema que resolve:** construtoras precisam visualizar **avan├ºo f├¡sico** (% da obra entregue) ├ù **avan├ºo financeiro** (% do or├ºamento gasto) ao longo do tempo. ├ë o KPI cl├íssico da constru├º├úo.

**Descri├º├úo funcional:**
- Gr├ífico de curva S com 3 linhas: previsto f├¡sico, realizado f├¡sico, realizado financeiro
- Alerta autom├ítico quando realizado f├¡sico < previsto f├¡sico - 10%
- Export├ível

**Tecnologia:** ApexCharts (j├í no stack) para gr├ífico; c├ílculos no backend.

**Impacto:** **5/5** ÔÇö paridade com concorrentes grandes; vende a banca acad├¬mica (visualiza├º├úo profissional).

**Esfor├ºo:** **M** (4-6 dias).

**Depend├¬ncias:** Feature 03.

**M├¬s sugerido:** M├¬s 7.

### 2.3.5. Feature 05 ÔÇö PWA offline-first para canteiro de obra

**Problema que resolve:** canteiros de obra frequentemente t├¬m **conex├úo 3G/4G inst├ível ou ausente**. Hoje o frontend ├® SPA online ÔÇö se o mestre de obras perde sinal, n├úo registra o di├írio.

**Descri├º├úo funcional:**
- Service Worker com cache estrat├®gico (CacheFirst para assets, NetworkFirst com fallback para dados)
- Fila de sincroniza├º├úo: di├írio/tarefa criados offline ficam em IndexedDB e s├úo enviados quando reconecta
- Indicador visual "modo offline" na UI
- Instal├ível como PWA (`manifest.json`, ├¡cones)

**Tecnologia:** `vite-plugin-pwa` + `workbox`. IndexedDB via `idb` ou `dexie`.

**Impacto:** **5/5** ÔÇö **diferencial enorme para canteiro**, nenhum concorrente grande faz bem.

**Esfor├ºo:** **L** (~2 semanas).

**Depend├¬ncias:** Feature 06 (storage externo), caso contr├írio fotos offline n├úo sincronizam.

**M├¬s sugerido:** M├¬s 10.

### 2.3.6. Feature 06 ÔÇö Storage externo (Supabase Storage ou R2)

**Problema que resolve:** `multer.diskStorage` ├® incompat├¡vel com Vercel (filesystem ef├¬mero). Bloqueador de produ├º├úo.

**Descri├º├úo funcional:**
- Backend: trocar `storageService.js` para upload direto ao Supabase Storage ou Cloudflare R2
- Streaming direto (memoryStorage do multer + stream)
- URL pr├®-assinada (signed URL) para download privado

**Tecnologia:** `@supabase/storage-js` OU `@aws-sdk/client-s3` + R2 endpoint.

**Impacto:** **5/5** ÔÇö bloqueador.

**Esfor├ºo:** **M** (3-5 dias).

**Depend├¬ncias:** nenhuma.

**M├¬s sugerido:** M├¬s 2 (antes do primeiro deploy em Vercel).

### 2.3.7. Feature 07 ÔÇö IA: gera├º├úo autom├ítica de RDO a partir de texto + fotos

**Problema que resolve:** pedreiro/mestre n├úo quer digitar um par├ígrafo bem escrito. Dita no WhatsApp ("Hoje concretou a laje do t├®rreo, usamos 4 caminh├Áes de brita, faltou cimento CP-II"). Virar isso em RDO formatado ├® trabalhoso.

**Descri├º├úo funcional:**
- Usu├írio manda mensagem de voz ou texto + fotos
- IA (Claude/GPT-4) estrutura em: atividades realizadas, materiais usados, pend├¬ncias, observa├º├Áes
- Retorna JSON estruturado que ├® pr├®-preenchido no di├írio
- Analisa fotos para detectar EPI (capacete, bota) e alertar

**Tecnologia:** API Anthropic ou OpenAI; vision model para an├ílise de foto.

**Impacto:** **5/5** ÔÇö diferencial IA competitivo com Vobi; banca acad├¬mica adora.

**Esfor├ºo:** **L** (~3 semanas).

**Depend├¬ncias:** Features 01 e 06.

**M├¬s sugerido:** M├¬s 13.

### 2.3.8. Feature 08 ÔÇö Estimativa autom├ítica de materiais por m┬▓ via IA + SINAPI

**Problema que resolve:** or├ºamenta├º├úo ├® trabalhosa; hoje o usu├írio calcula materiais manualmente.

**Descri├º├úo funcional:**
- Dado: ├írea da obra (m┬▓), tipo (casa t├®rrea, sobrado, comercial), n├¡vel de acabamento (popular/m├®dio/alto)
- IA sugere lista de materiais com quantidades baseadas em tabelas SINAPI e padr├Áes comuns
- Usu├írio revisa, ajusta, confirma. Sistema cria requisi├º├Áes iniciais.

**Tecnologia:** SINAPI via dataset p├║blico (atualiza├º├úo mensal); IA para interpretar input; regras para c├ílculo por m┬▓.

**Impacto:** **5/5** ÔÇö paridade com Vobi; vende o produto em demos.

**Esfor├ºo:** **XL** (~1 m├¬s).

**Depend├¬ncias:** Features 02 e 03.

**M├¬s sugerido:** M├¬s 15.

### 2.3.9. Feature 09 ÔÇö Chat com IA para trabalhadores ("D├║vidas da obra")

**Problema que resolve:** ajudante pergunta "quanto de cimento vai num saco de argamassa?" ÔÇö sem treinamento ├® complicado.

**Descri├º├úo funcional:**
- Chatbot embarcado no app/PWA
- RAG (Retrieval Augmented Generation) sobre base de conhecimento: manuais de fabricantes, normas ABNT, tabelas de tra├ºo de concreto
- Usu├írio digita ou fala pergunta, IA responde com fontes
- Mem├│ria curta por sess├úo

**Tecnologia:** Claude/GPT + embedding + vector DB (Supabase pgvector ├® suficiente).

**Impacto:** **4/5** ÔÇö marketing forte, utilidade real limitada (pedreiros experientes j├í sabem).

**Esfor├ºo:** **L** (~2 semanas).

**Depend├¬ncias:** nenhuma t├®cnica, mas exige curadoria de conte├║do.

**M├¬s sugerido:** M├¬s 17.

### 2.3.10. Feature 10 ÔÇö Notifica├º├Áes WhatsApp Business (ativas)

**Problema que resolve:** trabalhador n├úo abre app. Mas todo mundo usa WhatsApp.

**Descri├º├úo funcional:**
- Integra├º├úo com WhatsApp Business Cloud API (Meta)
- Triggers: tarefa atribu├¡da, prazo vencendo em 24h, di├írio requer auditoria, pagamento pr├│ximo
- Usu├írio pode responder "conclu├¡da" no WhatsApp e o sistema atualiza o status

**Tecnologia:** WhatsApp Cloud API; webhook de mensagens recebidas; n├║mero verificado.

**Impacto:** **4/5** ÔÇö diferencial real no mercado BR.

**Esfor├ºo:** **L** (~2 semanas) + processo burocr├ítico de verifica├º├úo Meta.

**Depend├¬ncias:** nenhuma t├®cnica; depend├¬ncia legal (conta verificada Meta).

**M├¬s sugerido:** M├¬s 14.

### 2.3.11. Feature 11 ÔÇö M├│dulo de Seguran├ºa do Trabalho (EPI + NR-18)

**Problema que resolve:** seguran├ºa em canteiro ├® obrigat├│ria (NR-18); n├úo tem no Obra Integrada. Mobuss usa como diferencial.

**Descri├º├úo funcional:**
- Checklist de EPI por trabalhador (capacete, botina, ├│culos, luva, cinto de seguran├ºa) ÔÇö entrega registrada
- Ficha de NR-18 por obra (condi├º├Áes do canteiro)
- Registro de incidentes (leve, moderado, grave)
- Dashboard com taxa de entrega de EPI, incidentes por m├¬s

**Tecnologia:** novas entidades Prisma + CRUD. Foto do trabalhador com EPI colocado (feature 07 pode auto-validar).

**Impacto:** **4/5** ÔÇö compliance legal, diferencial em concorrentes pequenos.

**Esfor├ºo:** **L** (~2 semanas).

**Depend├¬ncias:** Feature 11 pode usar Feature 07 se integrado.

**M├¬s sugerido:** M├¬s 18.

### 2.3.12. Feature 12 ÔÇö Dashboard executivo BI

**Problema que resolve:** propriet├írio de construtora pequena quer saber "como est├í o neg├│cio?" ÔÇö hoje tem que abrir cada obra.

**Descri├º├úo funcional:**
- Widgets: n├║mero de obras ativas, faturamento no m├¬s, margem m├®dia, obras atrasadas, tarefas pendentes, fluxo de caixa consolidado
- Filtro por per├¡odo
- Exporta├º├úo Excel/PDF
- Drill-down por obra

**Tecnologia:** ApexCharts j├í no stack.

**Impacto:** **4/5** ÔÇö vende para o tomador de decis├úo (propriet├írio).

**Esfor├ºo:** **M** (~1 semana).

**Depend├¬ncias:** Features 03 e 04.

**M├¬s sugerido:** M├¬s 8.

### 2.3.13. Feature 13 ÔÇö Integra├º├úo com Google Maps (navega├º├úo)

**Problema que resolve:** trabalhador recebe endere├ºo da obra e precisa copiar-colar no maps. Poderia ser click-to-navigate.

**Descri├º├úo funcional:**
- Na tela da obra, bot├úo "Ir at├® a obra" que abre Google Maps com rota
- Se feature 05 (PWA), usa geolocaliza├º├úo atual como origem
- ├ìcone no app para ├║ltima obra visitada

**Tecnologia:** deep link `https://www.google.com/maps/dir/?api=1&destination=LAT,LONG`. Sem custo de API.

**Impacto:** **3/5** ÔÇö conveni├¬ncia, n├úo transformador.

**Esfor├ºo:** **S** (<1 dia).

**Depend├¬ncias:** nenhuma. J├í tem lat/long na obra.

**M├¬s sugerido:** M├¬s 3 (quick win).

### 2.3.14. Feature 14 ÔÇö Previs├úo do tempo por obra

**Problema que resolve:** `operationalController.getWeatherMock` ├® placeholder. Concretagem n├úo pode em chuva; mestre de obras precisa saber com anteced├¬ncia.

**Descri├º├úo funcional:**
- Para cada obra (lat/long), busca previs├úo de 7 dias em API p├║blica (OpenWeatherMap, CPTEC, INPE)
- Alerta na dashboard se previs├úo de chuva >60% em dia de concretagem planejada
- Integra├º├úo com tarefas: marcar tarefa como "sens├¡vel a chuva"

**Tecnologia:** OpenWeatherMap tem plano free (1000 calls/dia ÔÇö suficiente para <30 obras ativas).

**Impacto:** **4/5** ÔÇö utilidade real, f├ícil de demonstrar.

**Esfor├ºo:** **S** (~2 dias).

**Depend├¬ncias:** nenhuma.

**M├¬s sugerido:** M├¬s 3 (quick win).

### 2.3.15. Feature 15 ÔÇö Biblioteca de plantas e BIM (visualiza├º├úo b├ísica)

**Problema que resolve:** upload de documentos existe, mas PDF de planta fica misturado com contratos e NFs. Engenheiro quer visualiza├º├úo r├ípida no mobile.

**Descri├º├úo funcional:**
- Categoriza├º├úo de documentos: Planta, Contrato, NF, Foto, ART/RRT, Licen├ºa
- Viewer embutido de PDF/DWG (visualiza├º├úo leve)
- Anota├º├Áes do engenheiro na planta (pontos com coment├írio)
- Links de planta compartilh├íveis com trabalhador (sem login)

**Tecnologia:** `react-pdf` para PDF; `three.js` + `three-dxf` para DWG (mais complexo).

**Impacto:** **4/5** ÔÇö diferencial profissional.

**Esfor├ºo:** **L** (~2 semanas).

**Depend├¬ncias:** Feature 06.

**M├¬s sugerido:** M├¬s 20.

### 2.3.16. Cronograma macro das 15 features

| M├¬s | Feature | Esfor├ºo | Justificativa de posicionamento |
|---|---|---|---|
| 2 | Feature 06 ÔÇö Storage S3/Supabase | M | Bloqueador de deploy |
| 3 | Feature 13 ÔÇö Google Maps | S | Quick win (<1 dia) |
| 3 | Feature 14 ÔÇö Previs├úo do tempo | S | Quick win, substitui o mock atual |
| 4 | Feature 01 ÔÇö RDO PDF | M | Fecha gap competitivo com Obra Prima |
| 5 | Feature 02 ÔÇö Materiais + Fabricantes | L | Base para toda cadeia de or├ºamento |
| 6 | Feature 03 ÔÇö Etapas | L | Base para cronograma e BI |
| 7 | Feature 04 ÔÇö Curva S | M | Visual profissional para banca |
| 8 | Feature 12 ÔÇö Dashboard BI | M | Consolida dados das anteriores |
| 10 | Feature 05 ÔÇö PWA offline | L | Diferencial mobile; ap├│s base est├ível |
| 13 | Feature 07 ÔÇö IA de RDO | L | Requer base Features 01 e 06 |
| 14 | Feature 10 ÔÇö WhatsApp | L | Requer verifica├º├úo Meta (processo longo) |
| 15 | Feature 08 ÔÇö IA + SINAPI | XL | Maior complexidade, ap├│s materiais |
| 17 | Feature 09 ÔÇö Chat IA trabalhadores | L | Refinamento; base de conhecimento leva tempo |
| 18 | Feature 11 ÔÇö Seguran├ºa do trabalho | L | M├│dulo grande, mas sem bloqueadores |
| 20 | Feature 15 ÔÇö Biblioteca de plantas/BIM | L | Polimento final |

**Total de esfor├ºo:** ~6 meses-equivalente de 1 desenvolvedor (considerando 5 devs trabalhando em paralelo + overhead, cabe confortavelmente em 18 meses dedicados a features + 2 meses de polimento).

---

## 2.4. Oportunidades de arquitetura

### 2.4.1. Eventos e filas ass├¡ncronas

**Caso de uso:**
- Envio de e-mail de auditoria pendente
- Processamento de foto do di├írio (redimensionamento, gera├º├úo de thumbnail, an├ílise de EPI via IA)
- Gera├º├úo de PDF RDO mensal
- Notifica├º├úo WhatsApp
- Sync offline (Feature 05)

**Alternativas:**
- **BullMQ + Redis (Upstash)**: padr├úo Node.js, integra bem, Upstash tem free tier serverless
- **AWS SQS + Lambda**: mais escal├ível, mas complexidade operacional maior
- **Inngest**: fun├º├úo-como-job, integra direto com Vercel, produto jovem mas crescente

**Recomenda├º├úo:** BullMQ + Upstash para MVP (entrega valor em M├¬s 4), reavaliar para Inngest quando processamentos chegarem a milhares/dia.

### 2.4.2. Cache

**Caso de uso:**
- `requireObraAccess` executa 2-3 queries por request protegido ÔÇö cachear o mapa `user ÔåÆ obras acess├¡veis` por 60s reduz carga significativamente
- Cat├ílogos (`tb_status`, `tb_papel`, materiais globais) ÔÇö cache├íveis por horas
- M├®tricas globais do Admin ÔÇö recalcular a cada 5 min, servir cached

**Alternativas:**
- **Redis (Upstash)**: mesma infra do BullMQ
- **In-memory LRU com invalida├º├úo por TTL**: suficiente por Vercel Function; trade-off: cada inst├óncia tem seu cache (pior para dados compartilhados)
- **Vercel Edge Config**: ├│timo para dados globais raramente mut├íveis

**Recomenda├º├úo:** Upstash Redis compartilhado para o que ├® compartilh├ível; LRU em mem├│ria para o resto.

### 2.4.3. Realtime

**Caso de uso:**
- Quando mestre de obras adiciona entrada no di├írio, gerente v├¬ na dashboard sem refresh
- Colabora├º├úo em formul├írio de obra (2 pessoas editando a mesma obra)
- Notifica├º├úo visual em tempo real

**Alternativas:**
- **Supabase Realtime** (CDC do Postgres via WebSocket): se DB j├í ├® Supabase, ├® zero-effort
- **Pusher** / **Ably**: SaaS dedicados, free tiers generosos
- **Server-Sent Events (SSE)** caseiro: simples, funciona em Vercel com streaming (Edge Functions)

**Recomenda├º├úo:** Supabase Realtime se o Postgres estiver hospedado l├í (ADR-002). Custo zero, setup de 1 hora.

### 2.4.4. Integra├º├Áes externas

| Integra├º├úo | Prioridade | M├¬s | Complexidade |
|---|---|---|---|
| WhatsApp Business (Meta Cloud API) | Alta | 14 | Alta (burocr├ítica) |
| Google Maps / Geocoding | M├®dia | 3 | Baixa |
| OpenWeatherMap / CPTEC | M├®dia | 3 | Baixa |
| SINAPI (dados p├║blicos Caixa) | Alta | 15 | M├®dia (parse de planilha) |
| WhatsApp Twilio (alternativa) | Baixa | 18 | Baixa (custo por mensagem) |
| API de cota├º├úo de materiais | Baixa | 22 | M├®dia (sem API oficial; scraping de Leroy / C&C) |
| IA (Anthropic / OpenAI) | Alta | 13 | Baixa |
| Stripe / Pagar.me | M├®dia | 20 | M├®dia (para SaaS cobrar assinatura) |
| ReceitaWS / CPF validation | Baixa | 12 | Baixa |
| Cloudinary (fallback de imagens) | Baixa | ÔÇö | Baixa |

### 2.4.5. Arquitetura em camadas (prepara├º├úo para escala)

Proposta detalhada no artefato 03 (ADR-011 impl├¡cito). Em resumo:

```
ÔöîÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÉ
Ôöé  Controllers (HTTP adapters)     Ôöé
Ôö£ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöñ
Ôöé  Services (regra de neg├│cio)     Ôöé
Ôö£ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöñ
Ôöé  Repositories (acesso a dados)   Ôöé
Ôö£ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöñ
Ôöé  Prisma / External APIs          Ôöé
ÔööÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÿ
```

Aplicar **Ports & Adapters (Hexagonal Architecture)** de Alistair Cockburn, com as seguintes correspond├¬ncias:
- **Ports:** interfaces de service (ex: `IObraService.criar(dto)`)
- **Adapters prim├írios:** controllers Express (recebem HTTP e chamam service)
- **Adapters secund├írios:** `PrismaObraRepository`, `SupabaseStorageAdapter`, `WhatsAppNotifier`

Isso permite trocar Prisma ÔåÆ Drizzle, ou Supabase ÔåÆ R2, sem tocar em services. Crit├®rio para aplicar: m├│dulos novos (Features 02, 03) j├í nascem com a arquitetura correta; m├│dulos existentes s├úo refatorados gradualmente.

---

## Conclus├úo da Fase 2

O Obra Integrada est├í em **posi├º├úo estrat├®gica favor├ível** como projeto acad├¬mico: escopo j├í funcional, arquitetura moderna, e 7 entidades de materiais/requisi├º├Áes prontas para virar m├│dulo ÔÇö uma vantagem de **~3 semanas de trabalho** sobre um come├ºo do zero.

As 15 features propostas equilibram: (1) **paridade competitiva** (RDO PDF, cronograma f├¡sico-financeiro, materiais) nas Features 01-04, 12; (2) **diferencial mobile-first** (PWA, Google Maps, tempo) nas Features 05, 13, 14; (3) **diferencial IA para impressionar banca** (RDO autom├ítico, estimativa SINAPI, chat) nas Features 07, 08, 09; e (4) **lock-in e compliance** (EPI/NR-18, BI, biblioteca de plantas) nas Features 11, 12, 15.

Nenhuma feature isolada ├® revolucion├íria ÔÇö o diferencial do produto acad├¬mico ├® **a combina├º├úo coerente** de mobile-first + GPS nativo + IA aplicada + modularidade por cliente, colocando o Obra Integrada em posi├º├úo competitiva com Vobi (diferencial IA) e Obra Prima (RDO e simplicidade) para a faixa de construtoras pequenas.

O detalhamento de **como** implementar essas features com qualidade (arquitetura, ADRs, limpeza t├®cnica) est├í no artefato 03.
