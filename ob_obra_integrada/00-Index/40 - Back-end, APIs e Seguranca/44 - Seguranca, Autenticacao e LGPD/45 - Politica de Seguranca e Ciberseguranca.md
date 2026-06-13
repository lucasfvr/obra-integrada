---
tags: [seguranca, ciberseguranca, politica, owasp, vulnerabilidade, pentest, hardening]
aliases: [Security Policy, Cybersecurity, InfoSec]
atualizado: 2026-06-13
status: vigente
---

# 🛡️ Política de Segurança e Cibersegurança — Obra Integrada

> **Escopo:** Esta política cobre segurança da aplicação (AppSec), segurança de infraestrutura, práticas de desenvolvimento seguro (DevSecOps) e gestão de vulnerabilidades para a plataforma Obra Integrada.

---

## 1. Princípios de Segurança

A plataforma adota os seguintes princípios:

| Princípio | Descrição |
|-----------|-----------|
| **Defense in Depth** | Múltiplas camadas de segurança. Nenhuma camada única protege sozinha |
| **Least Privilege** | Cada usuário/processo tem apenas as permissões mínimas necessárias |
| **Fail Secure** | Em caso de falha, o sistema nega acesso (não abre) |
| **Zero Trust** | Nenhuma requisição é confiável por padrão — sempre validar identidade e autorização |
| **Security by Design** | Segurança integrada desde o início do desenvolvimento, não como adendo |
| **Shift Left** | Vulnerabilidades detectadas o mais cedo possível no ciclo de desenvolvimento |

---

## 2. Autenticação e Gestão de Identidade

### 2.1 Padrões Implementados ✅

```javascript
// authMiddleware.js — CORRETO após correção P0
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('[FATAL] JWT_SECRET não configurado. Encerrando.');
  process.exit(1); // Fail secure — não iniciar sem segredo
}
```

### 2.2 Requisitos de Senha

| Regra | Valor Mínimo | Status |
|-------|-------------|--------|
| Comprimento mínimo | 8 caracteres | ⚠️ Verificar validação |
| Caracteres especiais | 1 obrigatório | ⚠️ Verificar validação |
| Hash algorithm | bcrypt, cost=10 | ✅ Implementado |
| Salt | Automático (bcrypt) | ✅ Implementado |
| Histórico de senhas | Últimas 5 não reutilizáveis | ❌ Não implementado |

### 2.3 JWT — Configurações Obrigatórias

```javascript
// Padrão exigido
const token = jwt.sign(payload, process.env.JWT_SECRET, {
  expiresIn: '8h',        // Não usar tokens sem expiração
  issuer: 'obra-integrada',
  audience: 'obra-integrada-api'
});

// Validação — verificar TODOS os campos
jwt.verify(token, process.env.JWT_SECRET, {
  issuer: 'obra-integrada',
  audience: 'obra-integrada-api'
});
```

### 2.4 2FA — Multi-Factor Authentication (Sprint 3)

```
Algoritmo: TOTP (RFC 6238) — Google Authenticator compatível
Biblioteca: otplib ou speakeasy
Backup codes: 8 códigos de 8 dígitos gerados no registro
Aplicar em: todos os perfis ADMIN, ADMIN_MASTER, RESPONSAVEL
```

### 2.5 Bloqueio por Tentativas Inválidas (Sprint 1)

```javascript
// Implementar com express-rate-limit + Redis
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5,                    // máx 5 tentativas por IP
  skipSuccessfulRequests: true,
  message: { error: 'Muitas tentativas. Tente novamente em 15 minutos.' }
});

app.post('/api/auth/login', loginLimiter, authController.login);
```

---

## 3. Autorização e Controle de Acesso (RBAC)

### 3.1 Roles Implementadas

```
ADMIN_MASTER  → Acesso total à plataforma (multi-tenant)
ADMIN         → Acesso total ao próprio tenant
PROPRIETARIO  → Acesso a obras próprias
RESPONSAVEL   → Acesso a obras vinculadas
ESTAGIARIO    → Acesso leitura em obras vinculadas
TRABALHADOR   → Acesso a próprios registros (diário, apontamentos)
CLIENTE       → Visualização do progresso das obras
```

### 3.2 Regras Críticas de Autorização

> **Regra de Ouro:** Todo controller DEVE filtrar por `id_cliente` do usuário autenticado. Nunca confiar no `id_cliente` da requisição.

```javascript
// ✅ CORRETO — sempre extrair tenant do token, não do body
const { id_cliente, id_usuario, role } = req.user; // vem do JWT
const obras = await prisma.tb_obra.findMany({
  where: { id_cliente } // filtro obrigatório
});

// ❌ ERRADO — não confiar no body
const { id_cliente } = req.body; // atacante pode enviar qualquer valor
```

### 3.3 Matriz de Permissões por Endpoint Crítico

| Endpoint | ADMIN_MASTER | ADMIN | RESPONSAVEL | TRABALHADOR |
|----------|:---:|:---:|:---:|:---:|
| `GET /api/clientes` | ✅ | ❌ | ❌ | ❌ |
| `POST /api/usuarios` | ✅ | ✅ | ❌ | ❌ |
| `DELETE /api/usuarios/:id` | ✅ | ✅ (own tenant) | ❌ | ❌ |
| `GET /api/obras` | ✅ | ✅ (own tenant) | ✅ (own obras) | ✅ (own obras) |
| `GET /api/financeiro/consolidado` | ✅ | ✅ | ❌ | ❌ |
| `PATCH /api/apontamentos/:id/aprovar` | ✅ | ✅ | ✅ | ❌ |
| `POST /api/admin/impersonar/:id` | ✅ | ❌ | ❌ | ❌ |

---

## 4. Segurança da API (OWASP API Security Top 10)

### 4.1 API1 — Broken Object Level Authorization

**Risco:** Usuário acessa dados de outro tenant via manipulação de ID.

```javascript
// ✅ Implementação correta
async function getObra(req, res) {
  const { id } = req.params;
  const { id_cliente } = req.user;
  
  const obra = await prisma.tb_obra.findFirst({
    where: {
      id_obra: parseInt(id),
      id_cliente  // SEMPRE validar tenant
    }
  });
  
  if (!obra) return res.status(404).json({ error: 'Não encontrado' });
  // Não expor 403 vs 404 — usar 404 para não vazar informação
}
```

### 4.2 API2 — Broken Authentication

| Vulnerabilidade | Status | Ação |
|----------------|--------|------|
| JWT sem expiração | ⚠️ Verificar | Adicionar `expiresIn` em todos os `sign()` |
| Fallback JWT_SECRET | 🔴 CRÍTICO | Remover em Sprint 0 |
| Refresh token não implementado | ⚠️ | Implementar ou aceitar re-login |
| Logout não invalida token | ⚠️ | Implementar blacklist ou Redis |

### 4.3 API3 — Broken Object Property Level Authorization

```javascript
// ✅ Usar allowlist de campos retornados (nunca retornar tudo)
function serializeUsuario(user) {
  return {
    id_usuario: user.id_usuario,
    nome: user.nome,
    email: user.email,
    role: user.role,
    // NUNCA incluir: senha_hash, cpf (bruto), tokens internos
  };
}
```

### 4.4 API4 — Unrestricted Resource Consumption (Rate Limiting)

```javascript
// server.js — implementar no Sprint 0
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

app.use(helmet()); // Headers de segurança automáticos

// Rate limit global
app.use(rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100,            // 100 req por IP por minuto
  standardHeaders: true,
  legacyHeaders: false
}));

// Rate limit específico para auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10 // 10 tentativas em 15 min
});
app.use('/api/auth', authLimiter);
```

### 4.5 API5 — Broken Function Level Authorization

```javascript
// ✅ Verificar role E permissão específica
app.post('/api/admin/impersonar/:id',
  authenticate,
  authorize('ADMIN_MASTER'), // role
  requirePermissao('impersonar_usuario'), // permissão granular
  adminController.impersonar
);
```

### 4.6 API6 — Unrestricted Access to Sensitive Business Flows

- Endpoint de cadastro de tenant: exigir verificação de e-mail antes de ativar
- Endpoint de aprovação de apontamentos: limite de N aprovações por minuto
- Upload de arquivos: validar tipo MIME (não confiar na extensão)

### 4.7 API7 — Server-Side Request Forgery (SSRF)

- Nunca fazer requisições HTTP para URLs fornecidas pelo usuário sem validação
- Whitelist de domínios permitidos para integrações externas (ex: SINAPI)

### 4.8 API8 — Security Misconfiguration

```javascript
// server.js — CORS seguro
const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS: Origem não permitida'));
    }
  },
  credentials: true
}));

// Helmet com CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // remover unsafe-inline no futuro
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.API_URL]
    }
  }
}));
```

### 4.9 API9 — Improper Inventory Management

- Manter `swagger.yaml` / OpenAPI atualizado com todos os endpoints
- Remover endpoints de debug/test antes de produção
- Versionar API: `/api/v1/...`

### 4.10 API10 — Unsafe Consumption of APIs

- Validar e sanitizar todas as respostas de APIs externas antes de persistir
- Usar timeout em todas as chamadas externas (ex: SINAPI, ViaCEP)

---

## 5. Proteção de Dados em Repouso

### 5.1 Criptografia de Campos Sensíveis (Sprint 1)

```javascript
// utils/crypto.js — implementar antes de produção
const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // 32 bytes

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

function decrypt(encryptedData) {
  const [ivHex, authTagHex, dataHex] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]).toString('utf8');
}

// Uso no controller
usuario.cpf = encrypt(req.body.cpf); // antes de salvar
const cpfOriginal = decrypt(usuario.cpf); // ao recuperar
```

### 5.2 Variáveis de Ambiente Obrigatórias (Produção)

```env
# .env — NUNCA commitar no git
JWT_SECRET=<min-32-chars-random-string>
ENCRYPTION_KEY=<64-hex-chars-random>
DATABASE_URL=postgresql://user:strongpassword@host:5432/dbname
CORS_ORIGINS=https://app.obraintegrada.com.br
NODE_ENV=production
```

---

## 6. Segurança de Upload de Arquivos

### 6.1 Validações Obrigatórias

```javascript
// Configuração Multer segura
const upload = multer({
  storage: multer.memoryStorage(), // nunca disco local em produção
  limits: {
    fileSize: 10 * 1024 * 1024, // máx 10MB
    files: 5                      // máx 5 arquivos por request
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg', 'image/png', 'image/webp',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'), false);
    }
  }
});
```

### 6.2 Storage Externo (Obrigatório antes de produção)

- **Não usar disco local** em ambiente serverless (Vercel)
- Opções recomendadas: AWS S3, Cloudflare R2, Google Cloud Storage
- Gerar URLs assinadas (presigned URLs) com expiração de 1 hora para download
- Não expor URL direta do bucket

---

## 7. Auditoria e Logging de Segurança

### 7.1 Eventos que DEVEM ser logados

| Evento | Campos Obrigatórios | Nível |
|--------|--------------------|----|
| Login bem-sucedido | `id_usuario`, `ip`, `user_agent`, `timestamp` | INFO |
| Login falho | `email_tentado`, `ip`, `timestamp`, `motivo` | WARN |
| Logout | `id_usuario`, `ip`, `timestamp` | INFO |
| Acesso negado (403) | `id_usuario`, `recurso`, `ip`, `timestamp` | WARN |
| Alteração de dados sensíveis | `id_usuario`, `tabela`, `id_registro`, `campos_alterados`, `ip` | INFO |
| Exclusão de registro | `id_usuario`, `tabela`, `id_registro`, `ip` | WARN |
| Impersonation | `id_admin`, `id_usuario_alvo`, `ip`, `timestamp` | CRITICAL |
| Export de dados | `id_usuario`, `tipo_export`, `timestamp` | INFO |

### 7.2 Schema da Tabela de Auditoria

```prisma
model tb_log_auditoria {
  id_log       Int      @id @default(autoincrement())
  tabela       String   // nome da tabela afetada
  operacao     String   // INSERT | UPDATE | DELETE | LOGIN | ACCESS_DENIED
  id_registro  String?  // ID do registro afetado
  id_usuario   Int?     // quem fez a ação
  dados_antes  Json?    // estado anterior (UPDATE/DELETE)
  dados_apos   Json?    // estado novo (INSERT/UPDATE)
  ip_origem    String?  // IP do cliente
  user_agent   String?  // browser/app
  criado_em    DateTime @default(now())
  
  tb_usuario   tb_usuario? @relation(fields: [id_usuario], references: [id_usuario])
  
  @@index([tabela, criado_em])
  @@index([id_usuario, criado_em])
  @@index([operacao, criado_em])
}
```

### 7.3 Redação de Dados Sensíveis em Logs

```javascript
// NUNCA logar dados sensíveis — usar redact
function sanitizeForLog(data) {
  const sensitive = ['senha', 'password', 'cpf', 'token', 'secret', 'key'];
  return Object.fromEntries(
    Object.entries(data).map(([k, v]) => [
      k,
      sensitive.some(s => k.toLowerCase().includes(s)) ? '[REDACTED]' : v
    ])
  );
}
```

---

## 8. Segurança de Infraestrutura e DevOps

### 8.1 Variáveis de Ambiente e Secrets

| Regra | Justificativa |
|-------|--------------|
| `.env` nunca no git (`.gitignore`) | Evitar vazamento de credenciais |
| Secrets em produção via plataforma (Vercel env, AWS Secrets Manager) | Não hardcodar |
| Rotação de JWT_SECRET a cada 90 dias | Limitar janela de comprometimento |
| Rotação de ENCRYPTION_KEY com migração dos dados | Manter confidencialidade a longo prazo |

### 8.2 Checklist de Segurança para PR (Code Review)

Antes de aprovar qualquer PR, verificar:

- [ ] Nenhum secret ou credencial hardcodada
- [ ] Todas as rotas novas têm middleware de autenticação
- [ ] Todas as rotas novas filtram por `id_cliente` (tenant isolation)
- [ ] Inputs validados antes de usar no SQL/Prisma
- [ ] Arquivos de upload validados por MIME type
- [ ] Dados sensíveis não aparecem nos logs
- [ ] Erros não expõem stack trace em produção
- [ ] `npm audit` sem vulnerabilidades críticas/altas

### 8.3 Dependências — Gestão de Vulnerabilidades

```bash
# Rodar antes de cada deploy
npm audit --audit-level=high

# Atualizar dependências com patches de segurança
npm update

# Verificar licenças
npx license-checker --onlyAllow "MIT;ISC;BSD-2-Clause;BSD-3-Clause;Apache-2.0"
```

### 8.4 Headers HTTP de Segurança (via Helmet)

| Header | Valor | Proteção |
|--------|-------|---------|
| `X-Frame-Options` | `DENY` | Clickjacking |
| `X-Content-Type-Options` | `nosniff` | MIME sniffing |
| `Strict-Transport-Security` | `max-age=31536000` | HTTPS forçado |
| `Content-Security-Policy` | Ver seção 4.8 | XSS |
| `X-XSS-Protection` | `1; mode=block` | XSS (browsers antigos) |
| `Referrer-Policy` | `no-referrer-when-downgrade` | Privacy |

---

## 9. Gestão de Vulnerabilidades

### 9.1 Processo de Divulgação Responsável (Responsible Disclosure)

```
Contato para reportar vulnerabilidades: security@obraintegrada.com.br [A CRIAR]
PGP Key: [publicar chave PGP]
Prazo de resposta: 48 horas
Prazo de correção: até 90 dias para críticas, 180 para médias
```

### 9.2 Classificação por Criticidade (CVSS)

| Score CVSS | Classificação | SLA de Correção |
|-----------|---------------|----------------|
| 9.0–10.0 | 🔴 Crítico | 24 horas |
| 7.0–8.9 | 🟠 Alto | 7 dias |
| 4.0–6.9 | 🟡 Médio | 30 dias |
| 0.1–3.9 | 🟢 Baixo | 90 dias |

### 9.3 Ferramentas de Análise

| Ferramenta | Tipo | Frequência | Status |
|------------|------|-----------|--------|
| `npm audit` | SCA (dependências) | A cada PR | ❌ Não automatizado |
| OWASP ZAP | DAST (dinâmico) | Mensalmente | ❌ Não configurado |
| SonarQube / SonarCloud | SAST (estático) | A cada PR | ❌ Não configurado |
| Pentest externo | Manual | Semestral | ❌ Não realizado |
| Snyk | SCA + SAST | A cada PR | ❌ Não configurado |

---

## 10. Plano de Hardening por Sprint

### Sprint 0 — Vulnerabilidades Críticas (Semana 1)
- [ ] Remover fallback `SUPER_SECRET` → `process.exit(1)` se ausente
- [ ] CORS por allowlist via `CORS_ORIGINS` env
- [ ] Helmet + CSP básico
- [ ] Rate limiting: 10 tentativas de login / 15 min por IP
- [ ] `npm audit --audit-level=high` no CI

### Sprint 1 — Hardening de Dados (Semanas 2–4)
- [ ] AES-256 para CPF/CNPJ
- [ ] Tabela `tb_log_auditoria` persistida
- [ ] Bloqueio de conta após 5 tentativas falhas
- [ ] Validação de MIME type em uploads
- [ ] Middleware global de erro (sem stack trace em produção)
- [ ] `ENCRYPTION_KEY` no env

### Sprint 2 — Maturidade de Segurança (Semanas 5–8)
- [ ] SonarCloud integrado ao GitHub Actions
- [ ] OWASP ZAP scan mensal automatizado
- [ ] Refresh token + blacklist (Redis)
- [ ] Storage externo para uploads (S3/R2)
- [ ] Presigned URLs para downloads

### Sprint 3 — Segurança Avançada (Semanas 9+)
- [ ] 2FA TOTP obrigatório para ADMIN e ADMIN_MASTER
- [ ] WAF (Cloudflare ou AWS WAF)
- [ ] Pentest externo por empresa especializada
- [ ] Rotação automática de secrets (AWS Secrets Manager)
- [ ] Monitoramento de anomalias (Sentry + alertas)

---

## 11. Referências e Normas

| Norma / Padrão | Relevância |
|----------------|-----------|
| [OWASP Top 10 (2021)](https://owasp.org/www-project-top-ten/) | Vulnerabilidades web mais críticas |
| [OWASP API Security Top 10](https://owasp.org/www-project-api-security/) | Específico para APIs REST |
| [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework) | Framework de gestão de riscos |
| [ISO 27001](https://www.iso.org/isoiec-27001-information-security.html) | SGSI — futuro objetivo de certificação |
| [LGPD — Lei 13.709/2018](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm) | Proteção de dados pessoais |
| [NR-1 (SESMT)](https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/consultas-publicas/arquivos/nr1atualizada.pdf) | Segurança do trabalho — obrigações de certificações |

- [[44 - LGPD e Protecao de Dados]]
- [[46 - Plano de Resposta a Incidentes]]
- [[08 - Divisao de Tarefas por Pessoa (Jun 2026)]]

---

**Versão:** 1.0
**Data:** 13 de junho de 2026
**Responsável:** Tech Lead / CISO (a designar)
**Próxima revisão:** 13 de setembro de 2026
**Status:** ⚠️ Itens P0 pendentes de implementação
