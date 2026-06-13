# 📂 Diretório de Propostas de Atualização Documental (Doc Branching)

Este diretório é o espaço dedicado para que qualquer membro do time proponha modificações, atualizações ou inclusões na documentação técnica, de processos e legal da plataforma **Obra Integrada**.

---

## 🚀 Como Propor uma Alteração

1. **Crie um arquivo** nesta pasta seguindo a nomenclatura padrão:
   `YYYYMMDD-prop-[nome_do_autor]-[documento_alvo].md`
   *Exemplo:* `20260613-prop-rodrigo-srs.md`

2. **Copie e preencha** o template oficial abaixo dentro do seu arquivo:

```markdown
# Proposta de Atualização Documental
## [Breve resumo da alteração]

**Data da Proposta:** [DD/MM/AAAA]  
**Autor:** [Seu Nome]  
**Documento Alvo:** [Caminho do arquivo original, ex: ob_obra_integrada/00-Index/20 - Documentacao e Tecnologias/Requisitos/SRS.md]  
**Versão Atual Alvo:** [Ex: v1.0]  
**Status da Proposta:** PENDENTE  
**Feedback do Líder (Se aplicável):** [Reservado para comentários do Admin]  

---

### 1. Justificativa da Alteração
[Explique em detalhes por que esta alteração é necessária (ajuste de código, nova funcionalidade, requisitos alterados, etc.)]

### 2. Detalhamento das Alterações (Diff de Código/Texto)
Aponte as alterações exatas no texto usando blocos diff:

```diff
- Texto antigo que será removido
+ Texto novo que será inserido no arquivo original
```
```

3. **Submeta a alteração** abrindo um commit na sua branch de desenvolvimento.
4. **Notifique o Líder** para revisão.

---

## ⚖️ Fluxo de Aprovação

- **Aprovado:** O Líder aplica as alterações no arquivo original, incrementa sua versão (ex: v1.0 -> v1.1), atualiza a série histórica e move o seu arquivo de proposta para a subpasta `ob_obra_integrada/00-Index/90 - Sistema Obsidian/95 - Propostas de Atualizacao/historico/` mudando o status para `APROVADO`.
- **Rejeitado:** O Líder edita seu arquivo nesta pasta, muda o status para `REJEITADO` e preenche o campo de feedback com orientações para ajuste.
