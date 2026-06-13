# Regras de Desenvolvimento, Atualização e Governança da Equipe
## Diretrizes de Qualidade, Versionamento e Workflow de Documentos e Código

**Versão:** 1.0 | **Data:** 13 de junho de 2026 | **Referência:** ISO 9001 (Controle Documental) + DevOps DORA

---

## 1. Introdução

Este documento estabelece as **Regras de Desenvolvimento** e o **Fluxo de Atualização de Documentos** para a equipe da plataforma Obra Integrada. O objetivo é garantir que toda alteração de código ou de documentação técnica/legal passe por um processo de controle de qualidade, revisão por pares e aprovação formal do Líder do Projeto (Admin/Líder), mantendo a integridade e rastreabilidade total do sistema.

---

## 2. Processo de "Doc Branching" (Propostas de Atualização)

Para que membros do time (Pessoas 1, 2, 3, 4, 5) proponham atualizações na documentação técnica (arquitetada na pasta `ob_obra_integrada/00-Index/`) ou no cofre Obsidian (`ob_obra_integrada/`) sem corromper a versão estável ("Main"), adota-se o fluxo de **Propostas de Atualização**:

```
Membro do Time            Pasta ob_obra_integrada/00-Index/90 - ...           Líder (Admin)
┌──────────────┐                  ┌──────────────────────┐               ┌──────────────────┐
│ Cria arquivo │─────────────────►│ YYYYMMDD-proposta.md │              │ Revisa proposta  │
│ de proposta  │                  │ Status: PENDENTE     │               └────────┬─────────┘
└──────────────┘                  └──────────────────────┘                        │

                                                                         [Decisão de Aprovação]
                                                                                  │
                                     ┌────────────────────────────────────────────┴───────────┐
                                     ▼ (Aprovado)                                             ▼ (Rejeitado)
                          ┌──────────────────────┐                        ┌──────────────────────┐
                          │ Mescla na Main Doc   │                        │ Status: REJEITADO    │
                          │ Move para /historico │                        │ Adiciona feedback    │
                          │ Status: APROVADO     │                        └──────────────────────┘
                          └──────────────────────┘
```

### 2.1 Como Funciona o Fluxo Passo a Passo (Manual do Desenvolvedor)

1. **Identificação da Mudança:** O desenvolvedor identifica a necessidade de alterar ou adicionar regras em algum documento estável (Ex: adicionar um novo requisito na especificação de requisitos `SRS.md`).
2. **Criação da Proposta:** Em vez de editar diretamente o arquivo em `ob_obra_integrada/00-Index/`, o desenvolvedor cria um novo arquivo markdown na pasta `ob_obra_integrada/00-Index/90 - Sistema Obsidian/95 - Propostas de Atualizacao/` seguindo a nomenclatura padrão:
   `ob_obra_integrada/00-Index/90 - Sistema Obsidian/95 - Propostas de Atualizacao/YYYYMMDD-prop-[nome]-[documento_alvo].md`
   *Exemplo:* `ob_obra_integrada/00-Index/90 - Sistema Obsidian/95 - Propostas de Atualizacao/20260613-prop-lucas-srs.md`
3. **Preenchimento da Proposta:** O arquivo de proposta deve ser preenchido utilizando o template oficial (ver Seção 2.2).
4. **Revisão pelo Líder (Aprovação):** O Líder do Projeto revisa periodicamente a pasta `ob_obra_integrada/00-Index/90 - Sistema Obsidian/95 - Propostas de Atualizacao/`.
5. **Consolidação (Merge):** 
   - Se **Aprovado**, o Líder copia as modificações para o documento oficial na pasta `ob_obra_integrada/00-Index/`, atualiza a versão do documento oficial no cabeçalho (ex: v1.0 -> v1.1) e move a proposta para a subpasta `ob_obra_integrada/00-Index/90 - Sistema Obsidian/95 - Propostas de Atualizacao/historico/` alterando seu status para `APROVADO`.
   - Se **Rejeitado**, o Líder edita a proposta na pasta `ob_obra_integrada/00-Index/90 - Sistema Obsidian/95 - Propostas de Atualizacao/`, altera o status para `REJEITADO` e adiciona o feedback com os motivos, notificando o desenvolvedor para correção.

---

### 2.2 Template Oficial de Proposta de Atualização

Toda proposta criada na pasta `ob_obra_integrada/00-Index/90 - Sistema Obsidian/95 - Propostas de Atualizacao/` deve iniciar com o seguinte cabeçalho e estrutura:

```markdown
# Proposta de Atualização Documental
## [Breve resumo da alteração]

**Data da Proposta:** [DD/MM/AAAA]  
**Autor:** [Nome do Integrante]  
**Documento Alvo:** [Caminho do arquivo, ex: ob_obra_integrada/00-Index/20 - Documentacao e Tecnologias/Requisitos/SRS.md]  
**Versão Atual Alvo:** [Ex: v1.0]  
**Status da Proposta:** [PENDENTE / APROVADO / REJEITADO]  
**Feedback do Líder (Se aplicável):** [Reservado para comentários de revisão]  

---

### 1. Justificativa da Alteração
[Explicar o porquê de alterar o documento original, vinculando à regra de negócio ou mudança de código.]

### 2. Detalhamento das Alterações (Diff de Código/Texto)
Use blocos diff `+` para adições e `-` para exclusões de texto:

```diff
- Texto antigo que será removido do documento original.
+ Texto novo que será inserido no documento original.
```
```

---

## 3. Versionamento de Documentos e Código

A plataforma adota um sistema híbrido de versionamento para garantir a sincronia entre Engenharia, Produto e Negócio.

### 3.1 Versionamento de Código (Semantic Versioning 2.0.0)
As releases de código do backend e frontend seguem o formato `MAJOR.MINOR.PATCH`:
- **MAJOR:** Alterações incompatíveis na API (quebras de contrato, mudanças severas de banco).
- **MINOR:** Novas funcionalidades que não quebram compatibilidade (CRUD de novo módulo).
- **PATCH:** Correções de bugs, segurança e melhorias de performance.

### 3.2 Versionamento de Documentos (Controle de Revisões)
Cada documento técnico individual possui sua versão independente no cabeçalho (Ex: `Versão: 1.2`):
- Incremento de **0.1** (Ex: v1.0 -> v1.1): Pequenas correções gramaticais, adição de exemplos de código ou esclarecimentos de regras existentes.
- Incremento de **1.0** (Ex: v1.0 -> v2.0): Mudança profunda nos requisitos de negócio, reestruturação arquitetural ou inclusão de novos módulos funcionais no escopo.

---

## 4. Regras Gerais de Engenharia para a Equipe

1. **Commit Seguidor:** Todo commit de código no Git deve obrigatoriamente seguir a especificação de **Conventional Commits** (ex: `feat(api): adicionar endpoint x`, `fix(web): corrigir alinhamento`).
2. **Proteção da Main:** Commits diretos na branch `main` são proibidos. Toda alteração de código deve ser feita via branch específica (`feat/`, `fix/`, `chore/`) e mesclada através de **Pull Request** com no mínimo uma aprovação de revisor designado.
3. **Isolamento de Dados Obrigatório:** É proibido comitar consultas SQL ou Prisma que não filtrem os dados utilizando a chave de tenant obtida na autenticação do usuário.
4. **Sem Secrets no Repositório:** Chaves de banco de dados, senhas de APIs e segredos JWT devem ser configurados exclusivamente por meio de variáveis de ambiente (`.env`). O arquivo `.env` nunca deve ser adicionado ao controle do Git.
