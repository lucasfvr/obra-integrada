---
tags: [qa, teste, qualidade, automacao, manual]
aliases: [Quality Assurance, Testing Strategy]
---
# ✅ Índice - Testes e Garantia de Qualidade (QA)

Documentação de estratégia de testes, QA e garantia de qualidade.

## Estratégia de Testes

### Pirâmide de Testes
```
        UI/E2E Tests (10%)
      Integration Tests (30%)
    Unit Tests (60%)
```

## 🔬 Testes Unitários

### Frameworks
- **Jest**: Para Node.js/JavaScript
  - Fast execution
  - Built-in mocking
  - Coverage reporting
- **Pytest**: Para Python (se necessário)
- **xUnit**: Para .NET
- **Coverage mínimo: 80%** de cobertura de linha
- **Rodado em: pre-commit / CI**
- **Mocking**: Stub dependencies, mock functions

### Escopo
- Funções individuais
- Lógica de negócio
- Validações de input
- Error handling

### Exemplo
```python
def test_criar_usuario():
    usuario = criar_usuario(nome="João", email="joao@example.com")
    assert usuario.nome == "João"
    assert usuario.email == "joao@example.com"
```

## 🔗 Testes de Integração

### Framework
- pytest-flask / Spring Test / Jest
- Rodado em: CI
- Coverage: Critical paths

### Escopo
- Integração entre módulos
- Banco de dados
- APIs externas (mocked)
- Cache e sessão

### Caso de Teste
```
Scenario: Criar ordem de serviço
  Given: Usuário autenticado
  When: Fazer POST /api/os
  Then: OS criada com status "Novo"
  And: Notificação enviada ao gerente
```

## 🌐 Testes End-to-End (E2E)

### Framework
- Cypress / Selenium / Playwright
- Rodado em: staging antes de production
- Crítico para: User flows principais

### Casos de Teste Críticos
- Fluxo de login
- Criar e fechar ordem de serviço
- Apontamento de horas
- Gerar relatório

### Exemplo Cypress
```javascript
it('Deve criar apontamento com sucesso', () => {
  cy.login('operario@example.com', 'senha')
  cy.visit('/apontamento')
  cy.get('[data-cy="btn-novo"]').click()
  cy.get('[data-cy="input-horas"]').type('8')
  cy.get('[data-cy="btn-salvar"]').click()
  cy.contains('Apontamento criado com sucesso')
})
```

## 🧪 Testes Manuais

### Tipos
- Smoke testing (após deploy)
- Exploratory testing
- Usability testing
- Accessibility testing

### Checklist de Smoke Test
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Navegação funciona
- [ ] Criar nova OS
- [ ] Apontamento sincroniza

## 🔒 Testes de Segurança

### Análise de Vulnerabilidades
- **OWASP Top 10**:
  - SQL Injection: Prevenção com prepared statements
  - XSS (Cross-Site Scripting): Input validation
  - CSRF (Cross-Site Request Forgery): CSRF tokens
  - Autenticação quebrada: MFA, rate limiting
  - Exposição de dados sensíveis: Encryption
  - XXE (XML External Entity): Desabilitar DTD
  - Broken access control: RBAC enforcement
  - Insecure deserialization: Safe parsing
  - Uso de componentes com vulnerabilidades conhecidas: Dependency scanning
  - Logging & monitoring insuficiente: Audit logs

### Ferramentas de Análise
- **SonarQube (SAST)**: Static Application Security Testing
  - Análise de código-fonte
  - Code smells e vulnerabilidades
  - Coverage e duplicação
- **OWASP ZAP (DAST)**: Dynamic Application Security Testing
  - Teste de APIs
  - Varredura de vulnerabilidades
  - Relatórios detalhados
- **Burp Suite**: Teste de segurança web
- **Dependency scanning**: npm audit, Snyk
- **Automação de verificações de segurança**: GitHub Actions + security workflows

## ⚡ Testes de Performance e Carga

### Ferramentas Específicas
- **Apache JMeter**: Load testing framework
- **Autocannon**: Benchmarking tool para Node.js
  - HTTP client rápido
  - Relatórios detalhados
  - Pipeline de teste
- **Poku**: Testing framework lightweight
  - Suporta estilos diversos
  - Sem dependências externas
- **Quibble**: Mock/stub library para testes
- **LoadRunner**: Teste corporativo (Enterprise)
- **New Relic**: APM (Application Performance Monitoring)
- **DataDog**: Observabilidade completa

### Tipos de Teste
- **Testes de carga**: Simulação de usuários normais
- **Testes de estresse**: Além da capacidade nominal
- **Medição de throughput**: Requisições por segundo
- **Medição de latência**: p50, p95, p99 percentiles

### Cenários
```
Carga Normal: 100 usuários/dia, p95 < 200ms
Carga Pico: 5000 usuários/dia, p95 < 500ms
Estresse: 10000 usuários, sistema não deve crashear
```

### Cenário
```
Simular 1000 usuários simultâneos
Validar response time < 500ms
Validar error rate < 1%
Duration: 10 minutos
```

## 🎯 Testes de Acessibilidade

### Critérios WCAG 2.1 AA
- Contraste de cores
- Tamanho de elementos
- Navegação por teclado
- Screen reader compatibility

### Ferramentas
- Axe
- Lighthouse
- WAVE
- Manual testing

## 📋 Plano de Teste

### Template
```
Feature: [Nome da feature]
Sprint: [Number]

Test Cases:
  TC-001: [Descrição]
    Steps: [Passos]
    Expected Result: [Resultado]
    
  TC-002: [Descrição]
  
Test Execution:
  Executado por: [QA]
  Data: [Data]
  Status: ✅ Pass / ❌ Fail
  
Bugs encontrados:
  BUG-001: [Descrição]
```

## 🐛 Gestão de Bugs

### Severidade
- **Critical:** Afeta multiple users, sem workaround
- **High:** Afeta funcionalidade principal
- **Medium:** Afeta funcionalidade secundária
- **Low:** Cosmético, nice-to-have

### Prioridade
- **P0:** Resolver hoje
- **P1:** Resolver em 24h
- **P2:** Resolver em sprint atual
- **P3:** Resolver em future sprint

## 🔐 Secure SDLC (Software Development Lifecycle)

### Desenvolvimento Seguro
- **Code review obrigatório**: 2 aprovações mínimo
- **Pair programming**: Para código crítico
- **Static analysis**: SonarQube em CI/CD
- **Dynamic analysis**: Teste de segurança pós-deploy

### Automação de Verificações
- **Pre-commit hooks**: Lint, testes locais
- **CI/CD pipeline**: SonarQube, OWASP ZAP, dependency scanning
- **Relatórios de vulnerabilidades**: Automáticos e alertas
- **Mitigação de riscos**: Priorização por severidade

## ✅ Definition of Done (QA)

- [ ] Testes unitários com 80%+ coverage (Jest)
- [ ] Testes de integração passando
- [ ] Testes de performance com Autocannon < p95 threshold
- [ ] Smoke tests em staging OK
- [ ] SonarQube: sem blockers, A+ rating
- [ ] OWASP ZAP: sem vulnerabilidades críticas
- [ ] Dependency scanning: sem packages vulneráveis
- [ ] Sem bugs críticos ou altos
- [ ] Documentação atualizada
- [ ] Approved by QA Lead
- [ ] Security review completed

## 🔗 Referências Relacionadas
- [[72 - Sprints Ativas e Retrospectivas]]
- [[81 - Manuais e Onboarding (Base de Conhecimento)]]
- [[62 - Pipelines de Deploy (CI-CD)]]

---
**Status:** 🔄 Em desenvolvimento
**Última atualização:** 11 de junho de 2026
