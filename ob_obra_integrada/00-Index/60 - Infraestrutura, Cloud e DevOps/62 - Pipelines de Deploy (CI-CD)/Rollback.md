# Plano de Rollback e Recuperação de Deploy — Obra Integrada
## Guia de Procedimento para Mitigação de Falhas em Produção

**Versão:** 1.0 | **Data:** 13 de junho de 2026 | **Referência:** NIST SSDF (PW.8)

---

## 1. Escopo e Objetivos

Este documento descreve os procedimentos formais de **rollback** (reversão) de código e banco de dados caso um deploy em produção introduza falhas graves que afetem a disponibilidade, segurança ou integridade dos dados da plataforma Obra Integrada.

O principal objetivo é mitigar incidentes rapidamente, estabelecendo um tempo máximo para recuperação (MTTR) de **menos de 15 minutos** para falhas de aplicação.

---

## 2. Gatilhos para Rollback

O processo de rollback deve ser acionado imediatamente se, após a conclusão do deploy:

1. **Indisponibilidade Crítica:** Erros HTTP 5xx na API que impeçam o login ou fluxos críticos (criar diário, visualizar obras) com taxa > 5% das requisições.
2. **Exposição de Dados / Falha de Segurança:** Vazamento de informações cruzadas entre tenants (vulnerabilidade multi-tenant ativa) ou falhas no middleware de autenticação (bypass de JWT).
3. **Corrupção de Dados:** Operações normais inserindo dados corrompidos ou apagando registros indevidamente.
4. **Performance Severa:** Aumento do tempo de resposta médio das requisições da API para > 3 segundos (degradando a experiência geral).

---

## 3. Procedimento de Rollback: Camada de Aplicação (Vercel)

Como a API backend Express e o Web App React são hospedados na **Vercel**, a reversão de código é instantânea e stateless.

### 3.1 Via Painel Web da Vercel (Recomendado por Velocidade)
1. Acesse o dashboard do projeto na Vercel: [vercel.com](https://vercel.com).
2. Vá na aba **Deployments**.
3. Identifique o penúltimo deploy (o deploy anterior que estava estável).
4. Clique nos três pontos (`...`) ao lado do deploy estável e selecione **Instant Rollback**.
5. Confirme a ação. A Vercel redirecionará o tráfego de produção de volta para este build imediatamente.

### 3.2 Via CLI da Vercel (Caso o painel esteja inacessível)
Execute o comando de deploy referenciando o ID do build estável anterior:
```bash
# Formato do comando
vercel promote <deployment-id-estável-anterior> --prod
```

### 3.3 Via Git (Rede de Segurança)
Se a Vercel falhar em fazer o rollback automático ou se o build anterior estiver corrompido:
1. Reverter o commit que causou a falha na branch principal (`main`):
   ```bash
   git checkout main
   git pull origin main
   git revert HEAD --no-edit
   git push origin main
   ```
2. O pipeline do GitHub Actions compilará e implantará automaticamente a versão estável revertida.

---

## 4. Procedimento de Rollback: Camada de Dados (PostgreSQL + NeonDB)

Reverter banco de dados é uma operação de alto risco, pois pode levar à perda de dados legítimos inseridos entre o deploy e a decisão de reversão.

### 4.1 Cenário A: Migração Prisma Destrutiva sem novos dados importantes
Se a migração de banco gerou um erro de schema que quebrou a aplicação, mas nenhum dado novo crítico foi gravado:
1. Utilizar o **Neon Database Branching** para restaurar o banco ao estado estável anterior (Neon permite criar branches pontuais baseados em timestamps ou LSN).
2. No console do Neon DB, selecione o branch principal, escolha o ponto de restauração (timestamp de minutos antes do deploy) e clique em **Restore/Replace**.

### 4.2 Cenário B: Reversão Manual de Migration (Sem perda de dados)
Se novos dados legítimos já foram inseridos e não podemos restaurar um backup completo:
1. Criar uma nova migration Prisma de correção (Roll-Forward). **Nunca edite arquivos de migrations passadas já aplicadas no banco de produção.**
2. Desenvolver comandos SQL manuais para restaurar a estrutura antiga sem apagar tabelas novas (Ex: recriar colunas que foram removidas, reverter constraints de chaves estrangeiras).
3. Aplicar via console do Prisma:
   ```bash
   npx prisma migrate resolve --rolled-back <migration_name_que_falhou>
   ```

---

## 5. Script de Verificação Pós-Rollback (Smoke Test)

Após qualquer rollback, o engenheiro de plantão deve validar a integridade básica rodando o seguinte roteiro de testes (manuais ou automatizados):

- [ ] **Health Check:** Acessar a rota `GET /api/health` e garantir retorno HTTP 200 `{ "status": "ok" }`.
- [ ] **Autenticação:** Tentar realizar login no frontend com uma conta de testes.
- [ ] **Leitura de Dados:** Acessar a listagem de obras e verificar se os registros aparecem.
- [ ] **Escrita de Dados:** Criar uma nova tarefa em uma obra teste e deletá-la.
- [ ] **Uploader:** Fazer upload de um documento de testes e garantir que o arquivo seja salvo no storage de forma legível.

---

## 6. Comunicação de Incidentes

1. **Foco Interno:** Notificar a equipe de engenharia e produto no canal de incidentes do Slack/Teams imediatamente após identificar a necessidade de rollback.
2. **Status Page:** Se o tempo de indisponibilidade passar de 5 minutos, atualizar a página de status (`STATUS.md` ou serviço equivalente) informando: *"Instabilidade temporária identificada. Equipe técnica trabalhando na correção."*
3. **Pós-Mortem:** Dentro de 24 horas úteis após o incidente, o Tech Lead deve liderar uma reunião de pós-mortem para identificar a causa raiz e definir ações preventivas para evitar recorrência.
