# Auditoria de Conformidade - Documentacao x Projeto

Data da auditoria: 2026-06-11  
Escopo: comparar o estado atual do codigo com a documentacao do projeto, especialmente `ob_obra_integrada`, `README.md` e `ob_obra_integrada/00-Index/10 - Produto e Negocios/13 - Perfis de Usuario (RBAC)/Matriz de Acessos e Permissoes (RBAC Tecnico).md`.  
Restricao solicitada: nao alterar Home, Login, Cadastro, Recuperacao de senha ou Formulario completo de cadastro.

## Conclusao executiva

O projeto atende parcialmente a documentacao.

Existe um MVP funcional com backend Express/Prisma/PostgreSQL, autenticacao JWT com bcrypt, RBAC, multi-tenancy parcial por `tb_cliente`/`tb_obra_cliente`, gestao de obras, diario com foto/GPS, tarefas, documentos, estoque por obra, financeiro simples, RH e dashboards por perfil.

Porem, a documentacao nova descreve uma plataforma SaaS mais completa e madura do que o codigo atual entrega. O maior desalinhamento esta em seguranca, qualidade, DevOps, modelagem de banco, fluxos de OS/apontamentos/faturas e telas completas de materiais, financeiro, equipe, relatorios e mobile.

O checklist de conformidade em `ob_obra_integrada` marca muitos itens como completos, mas varios deles ainda nao existem no codigo ou existem apenas de forma parcial. Antes de dizer que o projeto atende a documentacao, sera necessario ajustar a documentacao para refletir o estado real ou implementar os itens abaixo.

## O que foi verificado

- Documentos principais:
  - `ob_obra_integrada/00-Index/40 - Back-end, APIs e Seguranca/00 - Requisitos Tecnicos e Tecnologias.md`
  - `ob_obra_integrada/00-Index/40 - Back-end, APIs e Seguranca/02 - Checklist de Conformidade.md`
  - `ob_obra_integrada/00-Index/50 - Front-end e Interfaces/50 - Especificacao Completa de Telas.md`
  - `ob_obra_integrada/00-Index/30 - Banco de Dados e Modelagem/30 - Esquema Completo do Banco de Dados.md`
  - `ob_obra_integrada/00-Index/40 - Execucao e Implementacao/06 - Checklist de Implementacao.md`
  - `ob_obra_integrada/00-Index/10 - Produto e Negocios/12 - Perfis Governanca Modulos e Acessos (RBAC).md`
  - `ob_obra_integrada/00-Index/10 - Produto e Negocios/13 - Perfis de Usuario (RBAC)/Matriz de Acessos e Permissoes (RBAC Tecnico).md`
  - `README.md`
- Codigo analisado:
  - `backend/src`
  - `frontend/vite-project/src`
  - `backend/src/prisma/schema.prisma`
  - `package.json`, `backend/package.json`, `frontend/vite-project/package.json`

## Validacoes executadas

- `npm test --prefix backend`
  - Resultado: passou.
  - Observacao: os testes atuais sao mockados/simulados e nao exercitam a API real, banco real, autenticacao real ou RBAC real.

- `npm run lint --prefix frontend/vite-project`
  - Resultado: falhou.
  - Encontrados 42 erros e 8 warnings.
  - Pontos criticos:
    - `frontend/vite-project/src/view/PlansPage.jsx` tem erro de parsing.
    - Muitos `no-unused-vars`.
    - Warnings de dependencias faltantes em hooks React.
    - `ObraEstoque.jsx` possui `body.quantidade_nova` atribuido a ele mesmo.

## Areas que ja atendem parcialmente

### Backend e API

- Express configurado em `backend/src/server.js`.
- Rotas REST para usuarios, obras, diario, tarefas, admin, financeiro e RH.
- Prisma com PostgreSQL em `backend/src/prisma/schema.prisma`.
- Paginacao em listagens de obras, diario, tarefas e RH.
- Transacoes Prisma em criacao/delecao de obra.
- Upload de arquivos com Multer para diario, documentos e financeiro.
- Controllers separados por modulo.

### Autenticacao e autorizacao

- Login com JWT.
- Hash de senha com bcrypt.
- Middleware de autenticacao.
- Middleware de autorizacao por role/permissao.
- Matriz RBAC espelhada no backend e frontend.
- Checagem de vinculo com obra via `tb_usuario_obra`, `tb_obra_cliente` e responsavel da obra.

### Frontend

- React/Vite com rotas protegidas.
- Home, Login, Cadastro e fluxo de cadastro completo existem.
- Dashboard dinamico por perfil.
- Pagina de obras.
- Pagina detalhada da obra com abas de geral, tarefas, equipe, diario, financeiro, estoque, documentos e organograma.
- Guards de permissao no roteamento principal.

### Produto

- Obras: listagem, criacao, detalhe, atualizacao e exclusao.
- Diario: listagem, criacao com foto/GPS, edicao, exclusao e auditoria.
- Tarefas: CRUD por obra e atualizacao de status.
- RH: CRUD basico de funcionarios com matricula automatica e soft delete por status.
- Financeiro simples por obra.
- Estoque simples por obra.
- Documentos por obra.

## Desalinhamentos principais

### 1. Documentacao declara uma arquitetura mais completa do que existe

Documentado:
- Camadas Controller, Service, Repository e Database.
- Repository Pattern consolidado.
- Error handling robusto e padronizado.
- Otimizacao de consultas e padroes de producao.

Encontrado:
- Controllers chamam Prisma diretamente em muitos pontos.
- Existem `models` finos para usuario/obra, mas nao ha camada consistente de services/repositories.
- Nao ha middleware global de erro.
- Nao ha padrao unico de resposta/erro.

Tarefas:
- Definir se a documentacao sera ajustada para o estado atual ou se o codigo sera evoluido para camadas reais.
- Criar camada de service por modulo antes de aumentar complexidade.
- Padronizar erros HTTP e payloads de erro.
- Adicionar middleware global de erro.
- Remover duplicacoes entre controllers e models.

### 2. Banco real nao corresponde ao DER completo documentado

Documentado:
- Tabelas como `TENANT`, `CONFIG_TENANT`, `PERMISSAO_PAPEL`, `ORDEM_SERVICO`, `APONTAMENTO`, `VALIDACAO`, `MATERIAL_CATALOGO`, `MATERIAL_PEDIDO`, `MATERIAL_CONSUMO`, `FATURA` e `AUDIT_LOG`.
- Triggers para auditoria, custo e sobreposicao.
- Views para relatorios.
- SQL Server como banco secundario/backup.

Encontrado:
- Schema real usa tabelas `tb_*`, como `tb_cliente`, `tb_usuario`, `tb_obra`, `tb_diario_obra`, `tb_tarefa`, `tb_estoque_obra`, `tb_financeiro_obra`, `tb_documento`.
- Existem materiais/requisicoes legadas, mas nao o fluxo completo documentado.
- Nao existe `audit_log` ou `tb_log_auditoria` no schema, apesar do controller de diario tentar registrar logs nessa tabela.
- Nao existem `ordem_servico`, `apontamento`, `validacao` e `fatura`.
- Nao foram encontrados triggers/views documentados no schema Prisma.

Tarefas:
- Criar uma decisao clara: manter nomes `tb_*` ou migrar para o modelo documentado.
- Implementar tabela persistente de auditoria ou remover a promessa de auditoria persistida.
- Modelar OS, apontamento, validacao e fatura.
- Adicionar constraints e indexes que o checklist assume.
- Criar migrations reais e testaveis.
- Revisar o checklist para nao marcar triggers/views/procedures como concluidos enquanto nao existirem.

### 3. Seguranca esta parcial

Documentado:
- 2FA TOTP.
- Bloqueio apos 5 tentativas de login.
- CSP, CSRF, sanitizacao, rate limiting, CORS controlado.
- Argon2 recomendado/implementado.
- AES-256 para dados sensiveis.
- TLS 1.3, certificados, assinaturas digitais e gerenciamento de chaves.
- Auditoria e rastreabilidade completas.

Encontrado:
- JWT e bcrypt existem.
- `authMiddleware.js` ainda aceita fallback `SUPER_SECRET` quando `JWT_SECRET` nao existe.
- `server.js` usa `cors()` aberto.
- Nao ha Helmet/CSP.
- Nao ha rate limit.
- Nao ha CSRF.
- Nao ha 2FA.
- Nao ha Argon2.
- CPF/CNPJ ficam em texto no banco.
- Auditoria persistida nao existe no schema.

Tarefas P0:
- Remover fallback `SUPER_SECRET` e falhar o boot se `JWT_SECRET` nao estiver configurado.
- Configurar CORS por allowlist via env.
- Adicionar rate limit nos endpoints de auth.
- Adicionar Helmet/CSP.
- Criar tabela real de auditoria.

Tarefas P1:
- Implementar 2FA TOTP se continuar documentado como requisito.
- Implementar bloqueio temporario por tentativas de login.
- Definir estrategia de criptografia para CPF/CNPJ.
- Criar testes de seguranca para RBAC e tenant isolation.

### 4. RBAC esta bom como base, mas nao cobre toda a matriz nova

Documentado:
- Uma matriz operacional com muitos perfis de negocio: Admin TI, CEO, Diretor, Planejador, Mestre, Encarregado, Almoxarife, QC, SST, Comprador, Financeiro etc.
- `ob_obra_integrada/00-Index/10 - Produto e Negocios/13 - Perfis de Usuario (RBAC)/Matriz de Acessos e Permissoes (RBAC Tecnico).md` usa uma matriz menor e mais proxima do codigo.

Encontrado:
- Codigo implementa roles: `ADMIN_MASTER`, `ADMIN`, `PROPRIETARIO`, `RESPONSAVEL`, `ESTAGIARIO`, `TRABALHADOR`, `CLIENTE`, `USER`.
- O dashboard trata funcoes como `MESTRE`, `PEDREIRO`, `AJUDANTE` via `funcao`, nao como roles completas.
- A documentacao nova e a matriz do codigo nao estao totalmente sincronizadas.

Tarefas:
- Escolher a matriz oficial: a matriz tecnica menor de `ob_obra_integrada/00-Index/10 - Produto e Negocios/13 - Perfis de Usuario (RBAC)/Matriz de Acessos e Permissoes (RBAC Tecnico).md` ou a matriz de negocio ampla em `ob_obra_integrada`.
- Se a matriz ampla for a oficial, adicionar roles/permissoes para Planejador, Almoxarife, QC, SST, Comprador e Financeiro.
- Se a matriz menor for a oficial, ajustar os documentos novos para nao prometer perfis ainda inexistentes.
- Criar roteiro automatizado de testes por perfil.

### 5. Frontend ainda nao atende todas as telas documentadas

Documentado:
- Telas de login, recuperacao, 2FA, dashboards por perfil, obras, apontamentos, materiais, usuarios, relatorios, configuracoes e seguranca.

Encontrado:
- Home/Login/Cadastro existem e devem ser preservados.
- `/dashboard`, `/obras`, `/obra/:id`, `/calendar`, `/documentos`, `/rh`, `/profile` existem.
- Rotas de topo `/materiais`, `/financeiro` e `/equipe` exibem `UnderConstruction`.
- Nao ha rota definida para `/clientes`, embora exista item de sidebar para clientes.
- Nao ha tela de `/apontamentos` completa.
- Nao ha tela de relatorios executivos com PDF/XLSX/email.
- Nao ha tela de 2FA.
- Lint do frontend falha.

Tarefas P0:
- Corrigir lint e parsing sem tocar em Home/Login/Cadastro.
- Remover ou implementar rota `/clientes`.
- Corrigir warnings/erros que impedem qualidade minima.

Tarefas P1:
- Implementar telas reais de materiais, financeiro e equipe no nivel de menu principal, ou remover do menu ate ficarem prontas.
- Criar tela de apontamentos separada se esse fluxo continuar documentado.
- Criar tela de relatorios.
- Criar tela 2FA somente depois de backend 2FA existir.

### 6. Fluxos de negocio importantes ainda faltam

Documentado:
- Ciclo de vida da Ordem de Servico.
- Apontamento com entrada/saida, GPS, fotos, validacao supervisor e aprovacao gerente.
- Calculo de custo automatico.
- Materiais com catalogo, pedido, recebimento, consumo e matching PO/NF.
- Faturas, relatorios PDF/XLSX e envio por email.
- QHS, certificacoes NR, bloqueios de seguranca e qualidade.
- Mobile app/PWA offline.

Encontrado:
- Tarefas existem, mas nao substituem completamente OS.
- Diario existe, mas nao e apontamento de horas completo.
- Financeiro e estoque existem como registros simples por obra.
- Nao ha fatura, NF, PO, matching, validacao em 2 niveis ou bloqueio por NR.
- Nao ha mobile/PWA offline.

Tarefas:
- Implementar `ordem_servico` e seu ciclo de vida.
- Implementar `apontamento` separado de diario.
- Implementar fluxo supervisor -> gerente para validacao/aprovacao.
- Implementar calculo de custo com base em horas e valor diario/hora.
- Evoluir materiais para catalogo, pedidos, recebimento e consumo.
- Implementar faturas e RDO PDF.
- Planejar QHS somente apos OS/apontamentos estarem maduros.

### 7. Qualidade e testes ainda estao abaixo do que a documentacao promete

Documentado:
- Jest, 80%+ coverage, testes unitarios, integracao, E2E, performance, SonarQube, OWASP ZAP, Autocannon.

Encontrado:
- Backend usa Poku, nao Jest.
- Testes atuais passam, mas sao mocks/simulacoes.
- Nao ha Supertest/Testcontainers.
- Nao ha Cypress/Playwright.
- Nao ha performance tests.
- Nao ha coverage real validado.
- Frontend lint falha.

Tarefas:
- Corrigir lint do frontend.
- Criar testes de integracao reais para API.
- Testar login, RBAC, tenant isolation, obras, diario, tarefas, RH.
- Adicionar testes E2E dos fluxos criticos.
- Adicionar coverage e meta realista.
- Atualizar documentacao para Poku ou migrar para Jest conforme decisao do time.

### 8. DevOps e infraestrutura ainda nao estao conformes

Documentado:
- GitHub Actions, Docker Compose, PostgreSQL/Redis local, CI/CD, AWS/Vercel, `.env.example`, `.vercelignore`, staging/producao, monitoramento.

Encontrado:
- Nao foi encontrada pasta `.github/`.
- Nao foi encontrado Docker Compose.
- Nao foi encontrado `.env.example` do backend.
- Existe `frontend/vite-project/.env.example`, mas ele contem variaveis de backend como `DATABASE_URL` e `JWT_SECRET`.
- Backend tem `vercel.json`.
- Uploads ainda usam disco local.
- Nao ha Sentry, Axiom, Prometheus, Grafana ou Redis no codigo/configuracao.

Tarefas:
- Criar `backend/.env.example`.
- Corrigir `frontend/vite-project/.env.example` para conter `VITE_API_URL`.
- Criar `Setup.md` ou atualizar README com passos testados.
- Criar Docker Compose se continuar no checklist.
- Criar workflows de CI.
- Criar `.vercelignore`.
- Migrar uploads para storage externo antes de producao/serverless.
- Definir ambientes dev/staging/prod.

## Bugs ou riscos especificos encontrados

1. `backend/src/middlewares/authMiddleware.js`
   - Usa fallback `SUPER_SECRET`.
   - Risco: tokens podem ser aceitos com segredo padrao se env estiver ausente.

2. `backend/src/server.js`
   - Usa `cors()` aberto.
   - Risco: qualquer origem pode chamar a API.

3. `backend/src/routes/obraRoutes.js`
   - Rota `/obras/estoque/:idItem/historico` usa `requireObraAccess('parcial')`.
   - `requireObraAccess` espera `req.params.id`, mas essa rota nao tem `:id`.
   - `parcial` nao existe na hierarquia do middleware.
   - Risco: rota quebrada ou autorizacao incorreta.

4. `backend/src/controllers/diarioController.js`
   - Tenta gravar `prisma.tb_log_auditoria`, mas o model nao existe no Prisma schema.
   - Hoje cai em fallback de console.
   - Risco: documentacao promete auditoria, mas nao ha persistencia.

5. `backend/src/routes/financeiroRoutes.js`
   - Upload de comprovante usa destino literal `uploads/financeiro`.
   - Diferente do storage service centralizado.
   - Risco: comportamento inconsistente em deploy serverless.

6. `frontend/vite-project/src/layout/AppSidebar.tsx`
   - Possui item `/clientes`, mas `App.jsx` nao define rota correspondente.
   - Risco: usuario com permissao cai no fallback para `/`.

7. `frontend/vite-project/src/view/PlansPage.jsx`
   - Lint acusa erro de parsing.
   - Risco: build pode falhar se o arquivo for importado no futuro ou se a ferramenta analisar tudo.

8. `backend/tests`
   - Testes passam, mas nao testam endpoints reais.
   - Risco: falso senso de conformidade.

## Backlog priorizado

### P0 - Antes de afirmar conformidade

1. Corrigir lint do frontend e erro de parsing em `PlansPage.jsx`.
2. Remover fallback `SUPER_SECRET`.
3. Configurar CORS por allowlist.
4. Adicionar rate limit nas rotas de login/cadastro/recuperacao.
5. Corrigir rota de historico de estoque.
6. Criar auditoria persistida ou ajustar a documentacao para dizer que ainda e console-only.
7. Criar `backend/.env.example` e corrigir `frontend/vite-project/.env.example`.
8. Revisar o checklist em `ob_obra_integrada` para marcar como parcial/backlog tudo que ainda nao existe.
9. Criar testes reais de integracao para auth, RBAC e multi-tenancy.

### P1 - Fechar MVP documentado

1. Implementar OS e ciclo de vida.
2. Implementar apontamentos de horas com validacao/aprovacao.
3. Implementar material catalogo/pedido/recebimento/consumo.
4. Implementar faturas e RDO PDF.
5. Implementar telas de materiais, financeiro e equipe fora do estado `UnderConstruction`, ou esconder do menu.
6. Implementar tela de relatorios.
7. Padronizar respostas e erros da API.
8. Criar OpenAPI/Swagger.
9. Criar CI com lint/test.
10. Migrar upload para storage externo.

### P2 - Evoluir para SaaS maduro

1. Implementar 2FA TOTP.
2. Implementar lockout por tentativas de login.
3. Implementar criptografia de dados sensiveis.
4. Implementar Redis/cache apenas quando houver necessidade medida.
5. Implementar monitoramento e logs estruturados.
6. Criar testes E2E e performance.
7. Implementar mobile/PWA offline.
8. Implementar QHS, NR e bloqueios de seguranca.

### P3 - Diferenciais e integracoes

1. Integracao SINAPI.
2. BI executivo/Curva S completa.
3. Integracao ERP.
4. IA para RDO automatico, chatbot e estimativas.
5. App mobile publicado.

## Arquivos que devem ser preservados por enquanto

Nao alterar nesta rodada, conforme pedido:

- `frontend/vite-project/src/view/Home.jsx`
- `frontend/vite-project/src/view/Login.jsx`
- `frontend/vite-project/src/view/RegisterModal.jsx`
- `frontend/vite-project/src/view/ForgotPasswordModal.jsx`
- `frontend/vite-project/src/view/FormularioCompletoPage.jsx`
- Fluxos de rota publica em `frontend/vite-project/src/view/App.jsx` relacionados a home/login/cadastro, salvo ajuste futuro explicitamente autorizado.

## Recomendacao final

O caminho mais seguro e primeiro alinhar a documentacao com a realidade, sem reduzir a ambicao do roadmap. Sugestao:

1. Criar uma tabela oficial de status: `Implementado`, `Parcial`, `Planejado`, `Nao iniciado`.
2. Marcar o projeto atual como MVP parcial.
3. Resolver P0.
4. Implementar P1 por modulo, sem mexer em Home/Login/Cadastro.
5. So depois avancar para itens P2/P3 de SaaS maduro.
