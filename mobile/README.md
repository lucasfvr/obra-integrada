# Obra Integrada — Aplicativo Mobile (DWAM / APRO)

Aplicativo Android/iOS em **React Native + Expo SDK 58 + TypeScript + NativeWind**.
A implementação fica na pasta \`mobile/\` do branch \`mobile\` e reutiliza a API existente.
O escopo é o Diário de Obra: login, obras, foto, registro, histórico e estado de avaliação.

## 1. Configuração e execução

Pré-requisitos: Node.js compatível com a versão do Expo SDK 58, Android Studio/emulador ou Expo Go compatível, e API acessível pela rede.

\`\`\`bash
git checkout mobile
cd mobile
npm install
npx expo install --fix
cp .env.example .env
# ajuste EXPO_PUBLIC_API_URL no .env
npm run typecheck
npm run android
\`\`\`

No Windows PowerShell, substitua \`cp\` por \`Copy-Item .env.example .env\`.
**Não use \`localhost\` como endereço de API em dispositivo físico:** configure o domínio HTTPS acessível.
O backend é iniciado separadamente a partir de \`backend/\`.

As dependências do Expo/NativeWind devem ser verificadas e alinhadas pelo \`npx expo install --fix\` antes de instalar um APK. Este branch não contém prova de execução em Android nem de testes de integração.

## 2. O que está implementado neste branch

- Navegação com rotas públicas e privadas e contexto de autenticação real.
- Login usando o contrato do **código**: \`POST /api/users/login\` com \`username\` e \`password\`.
- Sessão JWT no armazenamento seguro do dispositivo via \`expo-secure-store\`, revalidação no início e saída de conta.
- Listagem de obras autorizadas com paginação.
- Formulário do diário com foto opcional (câmera ou galeria), descrição obrigatória, clima/efetivo/ocorrências opcionais.
- Envio \`multipart/form-data\` com JWT. Confirmação somente após HTTP 201 **com ID**.
- Histórico por obra, paginação, detalhes e indicação dos diferentes estados.
- Tratamento de erros de autenticação, rede, upload e permissão de imagem.

## 3. Limitações conhecidas da API existente

O backend atual recebe \`descricao\`, \`foto\` e coordenadas no POST do diário, mas não possui colunas específicas comprovadas para clima, efetivo e ocorrências. Temporariamente o app organiza esses dados **dentro da descrição**. A equipe deve evoluir schema/API antes de apresentá-los como campos estruturados do banco.

No banco há registros com status \`AUTOMATICO\`; o app mostra **"Classificação automática (revisar)"**, e não "Aprovado". A API ainda deve ser corrigida para remover a aceitação de status vindo do cliente, impedir autoaprovação, salvar motivo de reprovação e alinhar o contrato OpenAPI. O app nunca envia status de aprovação no POST.

**Offline:** esta versão não mantém rascunhos persistentes nem faz reenvio automático. Em erro de rede, não informa sucesso e recomenda conferir o histórico antes de reenviar. Não declare funcionalidade offline completa.

## 4. Arquitetura

\`\`\`text
App.tsx
 └─ AuthContextProvider
     └─ NavigationRoutes
         ├─ Login (público)
         └─ Obras (privado)
             ├─ NovoDiario → Resultado
             └─ Historico → Detalhe
src/services/
 ├─ api.ts (fetch, JWT, tratamento de erros)
 ├─ auth.ts
 ├─ obras.ts
 └─ diarios.ts
\`\`\`

O papel e a permissão de cada usuário são validados pelo **backend**. O mobile não permite autoatribuir perfis nem executa auditoria do próprio autor.

## 5. Critérios de teste para validação

- [ ] Instalar dependências e executar \`npm run typecheck\` sem erros.
- [ ] Executar no Android e confirmar navegação.
- [ ] Validar login correto/incorreto, persistência segura e logout.
- [ ] Consultar obras reais com permissões distintas.
- [ ] Registrar diário com/sem foto e receber ID.
- [ ] Reiniciar aplicativo e encontrar registro no histórico.
- [ ] Testar senha expirada e falta de rede sem falso sucesso.
- [ ] Confirmar que status \`AUTOMATICO\` não aparece como aprovação técnica.
- [ ] Validar upload de imagem e URLs reais no dispositivo.
- [ ] Integrar com auditoria da engenheira na versão web e comprovar motivos.

**Status:** primeira implementação de código-fonte; build, instalação, integração real e testes continuam pendentes. A branch \`main\` e a API não foram alteradas.

## 6. Referências do projeto e acompanhamento

- Protótipos: Figma e QPRO / Pitch de UX
- Diagrama de sequência: registro do Diário de Obra
- Notion: "Desenvolvimento do App · DWAM" e "Atualizações necessárias - geral"
- GitHub: \`backend/src/controllers/diarioController.js\`, \`backend/src/controllers/userController.js\` e \`backend/src/controllers/obraController.js\`

A aula \`aula_finalizada_06-11-2026\` é referência **interna de programação** e não deve ser citada nem reproduzida no DOCX acadêmico do Obra Integrada.


## Revisão de código - novembro de 2026

- Botão "Registrar o dia" só aparece para perfis com a permissão correspondente na matriz atual. A API continua validando o acesso por obra.
- Respostas 401 encerram a sessão associada ao token expirado. O app não interpreta erro de senha como expiração de uma sessão válida.
- Validação de MIME, extensão e limite informado de 5 MB antes do upload (o backend mantém verificação própria).
- Campos de texto têm rascunho por usuário e obra no SecureStore, restaurado ao retornar ao formulário. A foto **não** é preservada no rascunho. Ainda é necessário testar esse comportamento no Android.
- Backend na branch mobile define status inicial PENDENTE, não autoriza por GPS e exige auditor diferente do autor e motivo na reprovação.
- Migração Prisma da auditoria está apenas no repositório e **não foi executada**. Seguir o roteiro em backend/src/sql/README_AUDITORIA_MOBILE.md.
- Clima, efetivo e ocorrências continuam no texto da descrição até existir migração específica, aprovada e testada.
