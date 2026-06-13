---
tags: [visao-geral, tecnologia, arquitetura, stack, roadmap]
aliases: [Technology Overview, System Architecture, Tech Stack]
---
# 🏗️ Visão Geral Técnica - Obra Integrada

Documento consolidado com todas as tecnologias, requisitos e arquitetura técnica do projeto.

## 📋 Sumário Executivo

O **Obra Integrada** é uma plataforma SaaS multi-tenant desenvolvida com:
- **Backend**: Node.js + Express.js
- **Banco de Dados**: PostgreSQL (principal) + SQL Server (backup)
- **Arquitetura**: Camadas, Repository Pattern, RBAC
- **Segurança**: JWT, Bcrypt/Argon2, AES-256, LGPD-compliant
- **Qualidade**: Jest 80%+, SonarQube, Autocannon, OWASP ZAP

---

## 🚀 Stack Tecnológico Completo

### Frontend
| Camada | Tecnologia | Propósito |
|--------|-----------|----------|
| **Mobile** | React Native / Flutter | Apontamento de horas no canteiro |
| **Web Desktop** | React / Vue | Gestão administrativo em escritório |
| **UI/UX** | Material-UI / Tailwind | Design System compartilhado |

### Backend
| Camada | Tecnologia | Propósito |
|--------|-----------|----------|
| **Runtime** | Node.js v16+ | Servidor JavaScript |
| **Framework** | Express.js | APIs REST |
| **Linguagem** | JavaScript/TypeScript | Desenvolvimento |
| **ORM** | Sequelize / TypeORM | Abstração de BD |
| **Validação** | Joi / Zod | Input validation |

### Banco de Dados
| Camada | Tecnologia | Propósito |
|--------|-----------|----------|
| **Principal** | PostgreSQL 13+ | BD relacional escalável |
| **Backup** | SQL Server 2019+ | Redundância/Disaster recovery |
| **Cache** | Redis 6+ | Session store, hotspots |
| **Busca** | Elasticsearch (opt.) | Full-text search |
| **Queue** | Bull/RabbitMQ | Async jobs |

### DevOps & Infraestrutura
| Camada | Tecnologia | Propósito |
|--------|-----------|----------|
| **Cloud** | AWS / Azure | Hospedagem |
| **Containerização** | Docker | Isolamento de ambientes |
| **Orquestração** | Kubernetes / ECS | Escalabilidade |
| **CI/CD** | GitHub Actions | Pipeline automatizado |
| **Monitoring** | Prometheus / Grafana | Observabilidade |
| **Logging** | ELK Stack / DataDog | Log centralizados |

### Qualidade & Segurança
| Camada | Tecnologia | Propósito |
|--------|-----------|----------|
| **Unit Tests** | Jest | Testes unitários |
| **Integration** | Supertest | API testing |
| **E2E Tests** | Cypress / Playwright | User flows |
| **Performance** | Autocannon / JMeter | Load testing |
| **Code Analysis** | SonarQube | SAST |
| **Security Scan** | OWASP ZAP | DAST |
| **Dependency Scan** | npm audit / Snyk | Vuln. detection |

---

## 🔐 Segurança - Requisitos Implementados

### Autenticação & Autorização
```
┌─────────────────────────────────────┐
│   Cliente (Mobile/Web)              │
└──────────────┬──────────────────────┘
               │
         1. Login (user/pass)
               │
┌──────────────▼──────────────────────┐
│   Auth Endpoint (Express)           │
│   - Validar credenciais             │
│   - Gerar JWT token                 │
└──────────────┬──────────────────────┘
               │ JWT + Refresh Token
               │
┌──────────────▼──────────────────────┐
│   Aplicação (Rotas Protegidas)      │
│   - Verificar JWT                   │
│   - Validar permissões (RBAC)       │
│   - Routed access (by tenant)       │
└──────────────┬──────────────────────┘
               │
        2. Executar com
      contexto autenticado
```

### Hash de Senhas
- **Bcrypt**: ✅ Implementado
  - Salt: 10+ rounds
  - Tempo: ~100ms por hash
- **Argon2**: ✅ Recomendado para novos projetos
  - GPU-resistant
  - Tempo: ~50ms por hash

### Criptografia de Dados
- **Em repouso**: AES-256 (campos: CPF, salário, etc)
- **Em trânsito**: TLS 1.3 (HTTPS obrigatório)
- **Chaves**: Vault / AWS KMS

### Proteção Web (OWASP Top 10)
- ✅ SQL Injection: Prepared statements + ORM
- ✅ XSS: Input sanitization + CSP headers
- ✅ CSRF: CSRF tokens + SameSite cookies
- ✅ Autenticação: JWT + MFA
- ✅ Exposição dados: Encryption + PII masking
- ✅ XXE: Disable DTD parsing
- ✅ Access control: RBAC + tenant isolation
- ✅ Deserialization: Safe JSON parsing
- ✅ Dependencies: Dependency scanning
- ✅ Logging: Audit trails completos

---

## 📊 Banco de Dados - Requisitos Implementados

### Modelagem
```sql
-- Exemplo de relacionamento 1:N com integridade referencial
CREATE TABLE tenant (
    id_tenant SERIAL PRIMARY KEY,
    razao_social VARCHAR(255) NOT NULL,
    cnpj VARCHAR(14) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    id_tenant INT NOT NULL REFERENCES tenant(id_tenant) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,  -- Bcrypt
    papel ENUM('admin','gerente','operacional'),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_usuario_tenant ON usuario(id_tenant);
CREATE INDEX idx_usuario_email ON usuario(email);
```

### Transações ACID
```javascript
// Exemplo com transação atomicidade
const criarOrdenServico = async (ostData) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    // Tudo executa ou nada executa
    const os = await OS.create(ostData, { transaction });
    const tarefas = await Tarefa.bulkCreate(ostData.tarefas, { transaction });
    
    // Log de auditoria
    await AuditLog.create({
      acao: 'CREATE_OS',
      id_usuario: ostData.id_usuario,
      id_tenant: ostData.id_tenant
    }, { transaction });
    
    await transaction.commit();
    return { os, tarefas };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
```

### Controle de Concorrência
```sql
-- Read Committed (padrão)
BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;

-- Repeatable Read (evita phantom reads)
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;

-- Serializable (máximo isolamento)
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;
```

### Procedures & Triggers
- ✅ CRUD procedures com validação
- ✅ Triggers de auditoria automática
- ✅ Funções de cálculo complexas
- ✅ Vistas para abstração de lógica

---

## ✅ Testes - Requisitos Implementados

### Pirâmide de Testes
```
        E2E: Cypress (10%)
        ↑ 5% cobertura
      ┌─────────────────┐
      │ User Flows      │
      └────────┬────────┘
      Integration: Supertest (30%)
        ↑ 30% cobertura
      ┌─────────────────┐
      │ API + BD        │
      │ Fluxos módulos  │
      └────────┬────────┘
      Unit: Jest (60%)
      ↑ 80%+ cobertura
    ┌─────────────────┐
    │ Funções        │
    │ Services       │
    │ Validators     │
    └─────────────────┘
```

### Cobertura & Ferramentas
| Tipo | Ferramenta | Cobertura | CI/CD |
|------|-----------|----------|-------|
| Unit | Jest | 80%+ | ✅ Pré-commit |
| Integration | Supertest | 30%+ | ✅ CI |
| E2E | Cypress | 10%+ | ✅ Staging |
| Performance | Autocannon | p95<500ms | ✅ CI |
| SAST | SonarQube | A+ rating | ✅ CI |
| DAST | OWASP ZAP | 0 crítico | ✅ Staging |
| Deps | npm audit | 0 vuln | ✅ CI |

### Exemplo - Jest Unit Test
```javascript
describe('UserService', () => {
  let userService;
  let userRepository;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      create: jest.fn()
    };
    userService = new UserService(userRepository);
  });

  it('deve criar usuário com sucesso', async () => {
    const userData = { nome: 'João', email: 'joao@example.com' };
    userRepository.create.mockResolvedValue(userData);

    const result = await userService.criar(userData);

    expect(result.nome).toBe('João');
    expect(userRepository.create).toHaveBeenCalledWith(userData);
  });

  it('deve hashear senha com Bcrypt', async () => {
    const password = '123456';
    const hashed = await userService.hashPassword(password);

    expect(hashed).not.toBe(password);
    expect(await bcrypt.compare(password, hashed)).toBe(true);
  });
});
```

---

## 🏛️ Arquitetura - Boas Práticas

### Separação de Responsabilidades
```
app.ts
├── routes/
│   └── usuario.routes.ts (Express Router)
├── controllers/
│   └── usuarioController.ts (Requisição → Serviço)
├── services/
│   └── usuarioService.ts (Lógica de negócio)
├── repositories/
│   └── usuarioRepository.ts (Abstração de BD)
├── models/
│   └── usuario.model.ts (ORM Sequelize)
├── validators/
│   └── usuario.validator.ts (Validação de input)
├── middlewares/
│   ├── auth.middleware.ts (JWT verification)
│   ├── rbac.middleware.ts (Permission check)
│   └── errorHandler.middleware.ts (Error handling)
└── utils/
    ├── logger.ts (Logging)
    ├── crypto.ts (Encryption)
    └── mailer.ts (Email)
```

### Repository Pattern
```javascript
// usuarioRepository.ts
class UsuarioRepository {
  async criar(userData) {
    return await Usuario.create(userData);
  }

  async buscarPorId(id, tenantId) {
    // Isolamento multi-tenant
    return await Usuario.findOne({
      where: { id_usuario: id, id_tenant: tenantId }
    });
  }

  async listar(tenantId, { limit, offset, filtros }) {
    // Paginação
    return await Usuario.findAndCountAll({
      where: { id_tenant: tenantId, ...filtros },
      limit, offset
    });
  }
}
```

### Tratamento de Exceções
```javascript
// errorHandler.middleware.ts
const errorHandler = (error, req, res, next) => {
  // Log estruturado
  logger.error({
    message: error.message,
    stack: error.stack,
    userId: req.user?.id,
    tenantId: req.user?.tenant_id,
    path: req.path,
    timestamp: new Date()
  });

  // Resposta padronizada
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Erro interno do servidor';

  res.status(statusCode).json({
    success: false,
    error: {
      code: error.code,
      message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }
  });
};
```

---

## 📈 Performance & Escalabilidade

### Otimizações Database
- ✅ Índices em colunas frequentes
- ✅ Particionamento por tenant
- ✅ Query optimization (EXPLAIN ANALYZE)
- ✅ Connection pooling (10-20 conexões)
- ✅ Caching de resultados (Redis)

### Escalabilidade Horizontal
```
                    Load Balancer (Nginx)
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    Instance 1         Instance 2        Instance 3
    (Port 3001)        (Port 3002)       (Port 3003)
         │                 │                 │
         └─────────────────┼─────────────────┘
                           │
                  Shared Resources
                  ├── PostgreSQL (RDS)
                  ├── Redis (ElastiCache)
                  └── S3 (Storage)
```

### Monitoramento Contínuo
- **Prometheus**: Coleta de métricas
- **Grafana**: Visualização de dashboards
- **Alert Manager**: Notificações automáticas
- **DataDog**: APM e observabilidade

---

## 🔗 Referências

### Documentação Técnica
- [[00 - Requisitos Técnicos e Tecnologias]]
- [[99 - Arquitetura Backend (Boas Práticas)]]
- [[41 - Index - Endpoints]]
- [[42 - Index - Controllers]]
- [[44 - Index - Seguranca]]
- [[31 - Index - DER]]
- [[82 - Index - QA]]

### Tecnologias Específicas
- [Express.js Docs](https://expressjs.com)
- [PostgreSQL Docs](https://www.postgresql.org/docs)
- [Jest Testing](https://jestjs.io)
- [OWASP Top 10](https://owasp.org/Top10/)

---
**Versão**: 2.0.0
**Status**: ✅ Production-Ready
**Última atualização**: 11 de junho de 2026
