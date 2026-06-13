# Relatório Técnico — Projeto Obra Integrada

## 1. Introdução
Este relatório apresenta o desenvolvimento e a arquitetura do sistema **Obra Integrada**, uma plataforma web focada na modernização do gerenciamento de canteiros de obras. O projeto consolidou competências em desenvolvimento backend, modelagem de dados, segurança da informação e metodologias ágeis.

## 2. Visão Geral do Sistema
O sistema foi concebido como uma solução multi-tenant, permitindo que diferentes construtoras gerenciem seus portfólios de forma isolada e segura.

### 2.1 Público-Alvo
- **Proprietários e Gestores:** Visão consolidada de custos e prazos.
- **Engenheiros e Responsáveis:** Gestão técnica e delegação de tarefas.
- **Trabalhadores e Mestres:** Apontamento de progresso e diários de campo.
- **Clientes:** Acompanhamento da evolução física da obra.

## 3. Arquitetura e Segurança
A aplicação utiliza uma arquitetura baseada em serviços REST, com autenticação via JSON Web Tokens (JWT).

- **Controle de Acesso (RBAC):** Implementação de 8 perfis técnicos com permissões granulares, garantindo que cada usuário acesse apenas as funcionalidades pertinentes ao seu cargo.
- **Proteção de Dados:** Isolamento de inquilinos (Multi-tenancy) via chaves estrangeiras (`id_cliente`), impedindo o vazamento de informações entre empresas.

## 4. Engenharia de Dados (BD2 e DBE2)
Utilizamos o ORM Prisma para interface com o banco de dados PostgreSQL.
- **Modelagem:** Estrutura relacional normalizada com suporte a relacionamentos complexos e integridade referencial.
- **Performance:** Consultas otimizadas com uso de Eager Loading e paginação nativa no backend para lidar com grandes volumes de registros.

## 5. Qualidade e Governança
- **Testes:** Desenvolvimento orientado a estabilidade, com suíte de testes de integração automatizados que validam os fluxos críticos (Autenticação, CRUD e Lógica de Negócio).
- **Agilidade:** Processo de desenvolvimento iterativo e incremental, focado na entrega de um MVP funcional e escalável.

## 6. Conclusão
O projeto Obra Integrada demonstra a viabilidade de ferramentas digitais robustas no canteiro de obras, unindo rigor técnico e facilidade de uso para todos os níveis da operação.
