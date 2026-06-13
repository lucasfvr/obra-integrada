# Security Policy — Obra Integrada

## Supported Versions

The following versions are currently supported with security updates:

| Version | Supported |
|---------|-----------|
| Latest (main branch) | ✅ Yes |
| Previous minor | ⚠️ Critical fixes only |
| Older | ❌ No |

---

## Reporting a Vulnerability

**Contato:** security@obraintegrada.com.br  
**Idioma preferido:** Português ou Inglês  
**Chave PGP:** *(a publicar antes do lançamento)*

### Como reportar

Se você identificou uma vulnerabilidade de segurança no Obra Integrada, **NÃO abra uma issue pública**. Por favor:

1. **Envie um e-mail** para `security@obraintegrada.com.br` com o assunto:  
   `[SECURITY] <descrição breve da vulnerabilidade>`

2. Inclua no relatório:
   - Descrição detalhada da vulnerabilidade
   - Passos para reproduzir (Proof of Concept, se possível)
   - Impacto estimado (dados afetados, usuários afetados)
   - Versão/branch onde foi encontrada
   - Suas informações de contato (para follow-up)

3. **Aguarde nossa resposta.** Nos comprometemos a:
   - Confirmar o recebimento em até **48 horas úteis**
   - Fornecer uma avaliação inicial em até **5 dias úteis**
   - Manter você informado sobre o progresso da correção

---

## Disclosure Policy (Divulgação Responsável)

| Nível | SLA de Correção | Descrição |
|-------|----------------|-----------|
| 🔴 Crítico (CVSS 9.0–10.0) | **7 dias** | Acesso não autorizado a dados, RCE |
| 🟠 Alto (CVSS 7.0–8.9) | **30 dias** | Escalação de privilégio, XSS persistente |
| 🟡 Médio (CVSS 4.0–6.9) | **90 dias** | CSRF, exposição de informação limitada |
| 🟢 Baixo (CVSS 0.1–3.9) | **180 dias** | Melhorias de hardening |

Após o prazo de correção, o pesquisador pode publicar os detalhes da vulnerabilidade (coordinated disclosure). Pedimos gentileza de nos notificar antes da publicação.

---

## Scope — O que está no escopo

- API backend (`backend/src/`)
- Frontend (`frontend/vite-project/src/`)
- Autenticação e autorização (JWT, RBAC)
- Dados de usuários e isolamento multi-tenant
- Endpoints de upload de arquivos
- Configuração de infraestrutura (vercel.json, docker-compose)

## Out of Scope — O que NÃO está no escopo

- Ataques de força bruta sem demonstração de bypass de rate limit
- Spam ou engenharia social contra nossa equipe
- Vulnerabilidades em dependências sem demonstração de impacto real
- Ataques que exigem acesso físico ao servidor
- Ataques DDoS / volumétricos

---

## O que oferecemos

Por ora, não temos programa de bug bounty formal. Porém, para pesquisadores que reportarem vulnerabilidades críticas ou altas de forma responsável:

- **Crédito público** na lista de agradecimentos (Hall of Fame) — se desejado
- **Referência de reconhecimento** para seu portfólio

---

## Contatos de Segurança

| Canal | Contato | Uso |
|-------|---------|-----|
| E-mail de segurança | security@obraintegrada.com.br | Reporte de vulnerabilidades |
| E-mail de privacidade | privacidade@obraintegrada.com.br | Questões de dados e LGPD |
| DPO (Encarregado) | privacidade@obraintegrada.com.br | Direitos dos titulares |

---

## Referências

- [LGPD — Lei nº 13.709/2018](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [Resolução CD/ANPD nº 15/2024 — Comunicação de Incidentes](https://www.gov.br/anpd/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)

---

*Última atualização: junho de 2026*  
*Responsável: Tech Lead — Obra Integrada*
