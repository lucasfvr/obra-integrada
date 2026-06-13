---
tags: [incidentes, resposta, breach, vazamento, seguranca, lgpd, anpd]
aliases: [Incident Response, IRP, PARI]
atualizado: 2026-06-13
revisado: 2026-06-13 (atualizado conforme Resolução CD/ANPD nº 15/2024)
status: vigente
---

# 🚨 Plano de Resposta a Incidentes de Segurança (PARI)

> **Base Legal:** A **Resolução CD/ANPD nº 15, de 24 de abril de 2024** (RCIS — Regulamento de Comunicação de Incidente de Segurança) estabelece os prazos e critérios para comunicação de incidentes. A Obra Integrada, como agente de pequeno porte (Resolução ANPD nº 2/2022), tem **6 dias úteis** (prazo dobrado) para notificar a ANPD.

---

## 1. Definição de Incidente de Segurança

Um incidente de segurança é qualquer evento que comprometa (real ou potencialmente) a **confidencialidade**, **integridade** ou **disponibilidade** de dados ou sistemas da plataforma Obra Integrada.

### 1.1 Exemplos por Categoria

| Categoria | Exemplos |
|-----------|---------|
| **Vazamento de dados** | Dump do banco exposto, credenciais no GitHub, S3 público com dados pessoais |
| **Acesso não autorizado** | Login com credenciais roubadas, bypass de autenticação, escalação de privilégio |
| **Malware/Ransomware** | Código malicioso em dependência (supply chain attack), servidor comprometido |
| **Indisponibilidade** | DDoS, falha de infra que expõe dados, bug que corrompe dados |
| **Violação interna** | Colaborador acessa dados além das permissões, ex-funcionário com acesso ativo |
| **Vulnerabilidade crítica** | CVE em dependência usada em produção, falha de lógica de autorização |

---

## 2. Classificação de Severidade

| Nível | Critério | Exemplo | SLA de Resposta |
|-------|---------|---------|----------------|
| 🔴 **P1 — Crítico** | Dados pessoais expostos, sistema fora do ar, acesso não autorizado ativo | Banco de dados com acesso público, vazamento de CPFs | **Imediato (< 1h)** |
| 🟠 **P2 — Alto** | Vulnerabilidade crítica identificada mas não explorada, suspeita de comprometimento | CVE crítico em produção, tentativas de brute force | **< 4 horas** |
| 🟡 **P3 — Médio** | Vulnerabilidade alta, acesso a dados não sensíveis, anomalia confirmada | Endpoint sem autenticação acessando dados não pessoais | **< 24 horas** |
| 🟢 **P4 — Baixo** | Vulnerabilidade baixa/média, sem evidência de exploração | CVE baixo em dependência, misconfiguration sem impacto | **< 7 dias** |

---

## 3. Equipe de Resposta a Incidentes (IRT)

| Papel | Responsabilidade | Contato |
|-------|-----------------|---------|
| **Líder de Incidente** | Coordenar resposta, decisões finais | Tech Lead (Pessoa 1) |
| **Analista de Segurança** | Investigação técnica, análise forense | Tech Lead + DevOps (Pessoa 5) |
| **DPO / Encarregado** | Avaliação LGPD, notificação ANPD/titulares | DPO (a designar) |
| **Comunicação** | Comunicados externos, titulares, imprensa | Responsável de CS |
| **Jurídico** | Avaliação legal, suporte para notificações | Advogado externo |

---

## 4. Processo de Resposta — Passo a Passo

### Fase 1: DETECÇÃO (T+0)

**Fontes de detecção:**
- Alertas de monitoramento (Sentry, logs de sistema)
- Relatório de usuário (e-mail, suporte)
- Ferramentas de segurança (OWASP ZAP, npm audit)
- Divulgação responsável externa
- Análise interna de código/deploy

**Ação imediata:**
```
1. Confirmar que é um incidente real (não falso positivo)
2. Registrar hora da detecção (timestamp)
3. Acionar o Líder de Incidente
4. Criar canal de comunicação isolado (#incidente-YYYY-MM-DD no Slack/Teams)
5. NÃO comunicar publicamente ainda
```

---

### Fase 2: CONTENÇÃO (T+0 a T+2h para P1)

**Ações de contenção imediata:**

```bash
# 1. Revogar tokens JWT comprometidos (se JWT_SECRET foi exposto)
#    → Trocar JWT_SECRET imediatamente força logout de todos os usuários

# 2. Bloquear IP atacante (se identificado)
#    → Cloudflare: adicionar regra de firewall
#    → Vercel: adicionar ao blocklist

# 3. Desativar conta comprometida
PATCH /api/admin/usuarios/:id/status { "status": "BLOQUEADO" }

# 4. Revogar chaves de API expostas
#    → GitHub: revogar token em Settings > Developer Settings
#    → AWS: desativar access key no IAM
#    → Vercel: revogar token de deploy

# 5. Se banco de dados exposto:
#    → Alterar senha imediatamente
#    → Verificar usuários com acesso ao banco
#    → Habilitar log de queries para análise forense
```

**Preservação de evidências:**
```bash
# Exportar logs ANTES de qualquer modificação
pg_dump --table=tb_log_auditoria obra_integrada > evidencias_$(date +%Y%m%d_%H%M%S).sql

# Salvar logs de acesso do servidor
cp /var/log/nginx/access.log evidencias_nginx_$(date +%Y%m%d).log

# Screenshot/export dos logs da plataforma de cloud
```

---

### Fase 3: AVALIAÇÃO DE IMPACTO (T+2h a T+4h para P1)

**Perguntas a responder:**

1. **Quais dados foram acessados/expostos?**
   - Tabelas afetadas
   - Número de registros
   - Tipos de dados (pessoais, sensíveis, financeiros)
   
2. **Quem foi afetado?**
   - Quais tenants (id_cliente)
   - Quantos titulares (id_usuario)
   - Categorias de titulares (funcionários, admins, clientes)

3. **Por quanto tempo durou a exposição?**
   - Timestamp do início do incidente
   - Timestamp da contenção

4. **Houve exfiltração confirmada?**
   - Verificar logs de queries volumosas
   - Verificar downloads incomuns
   - Verificar acessos de IPs externos

**Template de avaliação:**
```markdown
## Relatório de Avaliação — Incidente [ID]

Data/hora de detecção: 
Data/hora de contenção: 
Janela de exposição: X horas/minutos

Dados expostos:
- [ ] Nomes e e-mails
- [ ] CPFs / documentos
- [ ] Senhas (hash ou texto plano?)
- [ ] Dados financeiros
- [ ] Localização GPS
- [ ] Fotos/imagens

Número de titulares afetados: ~N pessoas
Tenants afetados: X de Y

Exfiltração confirmada: SIM / NÃO / INCERTO
```

---

### Fase 4: NOTIFICAÇÃO

#### 4.1 Prazos (Resolução CD/ANPD nº 15/2024 — RCIS)

> ⚠️ **ATUALIZAÇÃO:** A Res. 15/2024 revoga o prazo genérico de 72h do art. 48 LGPD. Os prazos abaixo são os vigentes.

| Situação | Prazo | Observação |
|----------|-------|------------|
| **Obra Integrada** (pequeno porte) | **6 dias úteis** | Prazo dobrado — Res. ANPD nº 2/2022 |
| Agente de porte normal | 3 dias úteis | Prazo geral da Res. 15/2024 |
| Informações complementares | 20 dias úteis | Após notificação inicial |
| Registro interno de todos os incidentes | 5 anos | Mesmo os não notificados |

**Início da contagem:** Da data em que o controlador tem **ciência** de que o incidente afetou dados pessoais.

#### 4.1 Notificação à ANPD (Art. 48 LGPD)

**Quando notificar:** Sempre que houver risco relevante ou dano aos titulares.

**Prazo:** 72 horas após ciência do incidente (recomendação ANPD).

**Portal:** https://www.gov.br/anpd/comunicacao-de-incidente-de-seguranca

**Informações necessárias:**
- Descrição do incidente
- Dados e titulares afetados
- Medidas de contenção adotadas
- Medidas de remediação planejadas
- Contato do DPO

#### 4.2 Notificação aos Tenants (Controladores)

```
De: privacidade@obraintegrada.com.br
Para: [admin@tenant.com.br]
Assunto: [URGENTE] Notificação de Incidente de Segurança — Obra Integrada

Prezado(a) [Nome],

Identificamos um incidente de segurança em nossa plataforma que pode ter
afetado dados de sua empresa.

RESUMO DO INCIDENTE:
- Data/hora: [timestamp]
- Dados potencialmente afetados: [lista]
- Número estimado de registros: [N]
- Medidas de contenção: [ações tomadas]

PRÓXIMOS PASSOS:
- Estamos investigando a extensão do incidente
- Recomendamos que seus usuários alterem suas senhas
- Relatório completo será disponibilizado em [prazo]

Para dúvidas: privacidade@obraintegrada.com.br | Tel: [número]

Atenciosamente,
[DPO / Responsável Legal]
Obra Integrada
```

#### 4.3 Notificação aos Titulares (Usuários Finais)

```
De: noreply@obraintegrada.com.br
Para: [email do usuário]
Assunto: Aviso de Segurança — Ação necessária em sua conta

Prezado(a) [Nome],

Informamos que identificamos um incidente de segurança na plataforma
Obra Integrada que pode ter afetado sua conta.

O QUE ACONTECEU:
[Descrição clara e objetiva, sem termos técnicos]

SEUS DADOS AFETADOS:
[Lista específica dos tipos de dados expostos]

O QUE VOCÊ DEVE FAZER AGORA:
1. Altere sua senha imediatamente: [link]
2. Verifique atividades suspeitas em sua conta
3. Se notar atividade estranha, entre em contato: [link]

MEDIDAS QUE TOMAMOS:
[Ações de contenção e remediação]

Para mais informações: [link FAQ sobre o incidente]
```

---

### Fase 5: REMEDIAÇÃO (variável)

**Ações de remediação:**

1. **Corrigir a vulnerabilidade** que causou o incidente
2. **Realizar novo deploy** com a correção
3. **Verificar se há outras ocorrências** da mesma vulnerabilidade
4. **Resetar credenciais** afetadas (JWT_SECRET, senhas de banco, API keys)
5. **Notificar usuários** para troca de senha se necessário
6. **Revisar controles** para evitar reincidência

---

### Fase 6: PÓS-INCIDENTE (T+7 a T+30 dias)

#### 6.1 Relatório de Lições Aprendidas (RCA — Root Cause Analysis)

```markdown
## RCA — Incidente [ID] — [Data]

### Resumo Executivo
[Descrição breve do incidente e impacto]

### Linha do Tempo
| Timestamp | Evento |
|-----------|--------|
| T+0 | Detecção |
| ... | ... |

### Causa Raiz
[O que causou o incidente]

### Fatores Contribuintes
[O que permitiu que o incidente ocorresse/escalonasse]

### O que funcionou bem
- [Lista]

### O que pode melhorar
- [Lista]

### Ações Corretivas
| Ação | Responsável | Prazo |
|------|-------------|-------|
| ... | ... | ... |
```

#### 6.2 Registro de Incidentes

Manter registro histórico de todos os incidentes em:
```
ob_obra_integrada/00-Index/40 - Back-end, APIs e Seguranca/
  44 - Seguranca, Autenticacao e LGPD/
    Incidentes/
      INC-2026-001-RCA.md
      INC-2026-002-RCA.md
```

---

## 5. Cenários Específicos — Playbooks

### Playbook A: Credencial Exposta no GitHub

```
1. [ ] Revogar imediatamente a credencial no serviço (GitHub, AWS, Vercel)
2. [ ] Verificar no GitHub se houve acesso ao commit com credencial
   git log --all --source --abbrev-commit --format="%H %ai %s" | grep -n "secret\|key\|token"
3. [ ] Verificar histórico de acesso à API com a credencial
4. [ ] Gerar nova credencial e atualizar em TODOS os ambientes
5. [ ] Usar git-filter-repo para remover do histórico:
   pip install git-filter-repo
   git-filter-repo --replace-text <(echo "CREDENCIAL_ANTIGA==>REMOVIDO")
6. [ ] Force push + notificar colaboradores para re-clonar
7. [ ] Verificar se o repositório é público (se sim, escopo maior)
8. [ ] Avaliar se há necessidade de notificação ANPD
```

### Playbook B: Banco de Dados com Acesso Público

```
1. [ ] Revogar acesso público imediatamente (remover regra de firewall/security group)
2. [ ] Verificar logs do banco: quantas conexões externas?
   SELECT client_addr, count(*), max(query_start)
   FROM pg_stat_activity
   WHERE client_addr NOT IN ('127.0.0.1', 'IP_BACKEND')
   GROUP BY client_addr;
3. [ ] Exportar logs de auditoria do banco para análise forense
4. [ ] Verificar se há dumps ou exports recentes
5. [ ] Alterar senha do banco imediatamente
6. [ ] Avaliar dados expostos (todas as tabelas são sensíveis)
7. [ ] Notificação ANPD em até 72h (incidente de alto impacto)
8. [ ] Notificar todos os tenants afetados
```

### Playbook C: Conta de Usuário Comprometida

```
1. [ ] Bloquear a conta imediatamente via admin
   PATCH /api/admin/usuarios/:id { "status": "BLOQUEADO" }
2. [ ] Invalidar todos os tokens ativos do usuário
   (requer implementação de blacklist de tokens — Sprint 2)
3. [ ] Verificar ações realizadas pela conta nos últimos 30 dias
   SELECT * FROM tb_log_auditoria
   WHERE id_usuario = :id AND criado_em > NOW() - INTERVAL '30 days'
   ORDER BY criado_em DESC;
4. [ ] Notificar o usuário legítimo
5. [ ] Verificar se dados foram exfiltrados
6. [ ] Resetar senha e enviar link de redefinição
7. [ ] Habilitar 2FA após restauração (se disponível)
```

### Playbook D: Ataque de Força Bruta no Login

```
1. [ ] Confirmar o ataque nos logs (múltiplas tentativas falhas por IP)
2. [ ] Bloquear IPs atacantes no WAF/Cloudflare
3. [ ] Verificar se alguma conta foi comprometida
4. [ ] Ativar CAPTCHA temporário no endpoint de login
5. [ ] Verificar se rate limiting estava ativo (se não → P0 para implementar)
6. [ ] Notificar usuários com contas que receberam muitas tentativas falhas
7. [ ] Revisar regras de rate limiting após incidente
```

---

## 6. Testes e Simulações

| Atividade | Frequência | Responsável |
|-----------|-----------|-------------|
| Simulação de incidente (tabletop exercise) | Semestral | Tech Lead + DPO |
| Teste de playbooks | Trimestral | Equipe de segurança |
| Revisão deste plano | Anual ou após incidente | Tech Lead + DPO |
| Teste de notificação à ANPD (simulado) | Anual | DPO |

---

## 7. Contatos de Emergência

```
ANPD — Autoridade Nacional de Proteção de Dados
Portal: https://www.gov.br/anpd/
Comunicação de incidente: https://www.gov.br/anpd/comunicacao-de-incidente-de-seguranca

CERT.br — Centro de Estudos, Resposta e Tratamento de Incidentes no Brasil
Portal: https://www.cert.br/
E-mail de reporte: cert@cert.br

Polícia Federal — Crimes cibernéticos
Portal: https://www.pf.gov.br/
```

---

## 8. Referências

- [Art. 48 LGPD — Comunicação de incidentes](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [Guia ANPD — Comunicação de incidentes de segurança](https://www.gov.br/anpd/pt-br/documentos-e-publicacoes/guias-e-recomendacoes)
- [NIST SP 800-61 — Computer Security Incident Handling Guide](https://csrc.nist.gov/publications/detail/sp/800-61/rev-2/final)
- [[44 - LGPD e Protecao de Dados]]
- [[45 - Politica de Seguranca e Ciberseguranca]]

---

**Versão:** 1.0
**Data:** 13 de junho de 2026
**Responsável:** Tech Lead + DPO (a designar)
**Próxima revisão:** 13 de junho de 2027 ou após qualquer incidente P1/P2
**Status:** ✅ Pronto — implementar canais de comunicação (DPO email, formulário)
