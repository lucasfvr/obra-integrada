---
tags: [obra-integrada, rbac, permissoes, acessos, seguranca]
aliases: [Matriz de Acessos, Tabela CRUD, Isolamento de Dados]
---
# 🔐 RN-003B: Matriz de Acessos e Permissões (RBAC da Obra)

Define o controle granular de visualização (Read), criação (Create), edição (Update) e exclusão (Delete) dentro do sistema, garantindo conformidade com a LGPD e sigilo comercial.

## Tabela de Módulos vs. Nível de Acesso

| Perfil / Função | Módulo Financeiro | Planejamento (Gantt) | Operação (Sprints) | Estoque | QHS (Segurança) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Engenheiro Residente** | Leitura/Aprovação | Criação/Edição | Leitura/Aprovação | Leitura | Leitura |
| **Mestre de Obras** | 🚫 Bloqueado | Leitura | Delegação/Edição | Leitura | Leitura |
| **Encarregado** | 🚫 Bloqueado | 🚫 Bloqueado | Apontamento | 🚫 Bloqueado | 🚫 Bloqueado |
| **Almoxarife** | 🚫 Bloqueado | 🚫 Bloqueado | Leitura (Requisições) | Criação/Baixa | 🚫 Bloqueado |
| **Técnico SST / QA** | 🚫 Bloqueado | 🚫 Bloqueado | Leitura | 🚫 Bloqueado | Criação/Bloqueio |
| **Cliente / Investidor**| Dashboard (Leitura) | Dashboard (Leitura) | Fotos/Relatórios | 🚫 Bloqueado | 🚫 Bloqueado |

## Regras Críticas de Bloqueio (Feature Locks)
1. **Isolamento de Folha de Pagamento:** Nenhum perfil de campo (Mestre, Encarregado) pode visualizar a taxa de "Hora-Homem" (Salário) de outros funcionários no sistema. Eles lidam apenas com "Horas Físicas".
2. **Escopo Intransponível:** Um Encarregado não pode criar uma Ordem de Serviço nova pelo aplicativo mobile. Se surgiu um imprevisto (Aditivo), ele solicita ao Mestre, que escala para o Engenheiro aprovar e injetar no cronograma.
3. **Auditoria (Log Trail):** Toda alteração de status em uma Ordem de Serviço (de "Em Andamento" para "Concluído") grava no banco de dados o `Id_Usuario`, a `Data_Hora` e as coordenadas de `GPS` do celular que realizou a ação.