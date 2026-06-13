# 🛡️ Agent Skill: Security & Multi-Tenant Compliance Guardian
## Diretrizes de Codificação Segura, Isolamento Lógico de Dados e LGPD

Esta skill orienta o Agente IDE sobre as práticas de desenvolvimento seguras obrigatórias ao editar ou criar código no backend (`apps/api`) e frontend (`apps/web`), garantindo resiliência cibernética e blindagem contra vazamento de dados.

---

## 1. Regra Absoluta do Isolamento Multi-Tenant

A plataforma Obra Integrada compartilha a mesma base de dados física PostgreSQL para múltiplas construtoras clientes.
- **Risco Crítico:** Um usuário da Construtora A conseguir visualizar ou alterar dados da Construtora B (vulnerabilidade IDOR / Multi-tenant data cross).
- **Procedimento Obrigatório:**
  1. Toda tabela que possua relação direta ou indireta com a construtora deve possuir a chave estrangeira `id_tenant` vinculada a `tb_cliente`.
  2. Todo controller/service que realize operações no banco Prisma **deve** ler o `id_tenant` diretamente do token JWT decodificado no middleware de autenticação (`req.user.id_tenant`).
  3. **Nunca** confie no `id_tenant` enviado no corpo da requisição HTTP (`req.body`) ou parâmetros de rota de forma crua, sem validar se o usuário autenticado realmente pertence àquele tenant.

*Exemplo Correto no Prisma:*
```typescript
// service/obraService.ts
async function obterObraPorId(idObra: number, idTenant: string) {
  const obra = await prisma.tb_obra.findFirst({
    where: {
      id: idObra,
      id_tenant: idTenant // Filtro obrigatório de isolamento
    }
  });
  
  if (!obra) {
    throw new AppError('Obra não encontrada ou acesso negado', 404);
  }
  return obra;
}
```

---

## 2. Hardening e Segurança de APIs (OWASP API Top 10)

### 2.1 Configuração do CORS
- **Nunca** deixe o middleware do CORS aberto sem parâmetros: `app.use(cors())`.
- **Procedimento:** Sempre defina a origem com base no domínio do frontend registrado nas variáveis de ambiente, permitindo localhost apenas em ambiente de desenvolvimento:
```javascript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
};
app.use(cors(corsOptions));
```

### 2.2 Headers de Segurança (Helmet)
Toda requisição HTTP deve conter os cabeçalhos de segurança básicos. Certifique-se de que o pacote `helmet` esteja instalado e ativado no entrypoint da API:
```javascript
import helmet from 'helmet';
app.use(helmet());
```

### 2.3 Rate Limiting
Endpoints de autenticação (`/login`, `/register`, `/recuperar-senha`) ou que envolvam processamento pesado de uploads devem ser protegidos contra ataques de força bruta e DoS:
```javascript
import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 requisições por IP por janela
  message: { error: 'Muitas requisições de autenticação vindas deste IP. Tente novamente mais tarde.' }
});
```

---

## 3. Criptografia de Dados Sensíveis (LGPD)

- **Dados Médicos (PCMSO) e Arquivos de Saúde:** Devem ser criptografados antes de salvar no bucket do storage S3/R2 utilizando chaves de criptografia gerenciadas de forma segura.
- **Senhas de Usuários:** Devem ser hashadas obrigatoriamente utilizando a biblioteca `bcrypt` com o número de rounds mínimo de **10** ou utilizando `argon2id`.
- **Criptografia em Trânsito:** Todo tráfego de dados de ponta a ponta (Browser -> Vercel -> API -> Postgres) deve rodar sobre HTTPS.
