# Git do dia a dia — Obra Integrada

Uma página. Se você ler só isto e mais nada, já dá pra trabalhar sem atropelar ninguém.

---

## O ciclo, do começo ao fim

```bash
# 1. Sempre comece da main atualizada. Sempre. É o passo que as pessoas pulam.
git checkout main
git pull

# 2. Crie a branch da SUA tarefa (uma tarefa = uma branch)
git checkout -b feature/nome-curto-da-tarefa

# 3. Trabalhe. Commite quantas vezes quiser, pequeno é melhor que perfeito.
git add .
git commit -m "feat: adiciona campo CPF no cadastro"

# 4. Mande pro GitHub
git push -u origin feature/nome-curto-da-tarefa

# 5. Abra o Pull Request no site. O CI roda sozinho. Espere ficar verde.

# 6. Depois que mergear, apague a branch e volte pra main
git checkout main
git pull
git branch -d feature/nome-curto-da-tarefa
```

**Prefixos do nome da branch:** `feature/` (coisa nova), `fix/` (conserto), `chore/`
(limpeza, config, doc). Não é regra de estilo — é pra bater o olho na lista e saber o que é.

---

## A regra que mais importa: branch curta

**Uma branch deve viver 1 a 3 dias.** Não é preciosismo. Hoje, neste repositório:

```
feature/kaua                      78 commits atrás da main
fix/diario-manager-pode-postar    65 commits atrás
feature/db-tabela-log-auditoria   65 commits atrás
```

Essas três têm trabalho de verdade que **nunca vai entrar**. Não porque alguém
desistiu, mas porque mergear 65 commits de distância significa resolver conflito em
todo arquivo que mudou nesses 65 commits, sem ninguém lembrar mais por quê. O
trabalho existe e está perdido.

Branch longa não guarda seu trabalho. Ela **converte seu trabalho em conflito**.

Se a tarefa é grande demais pra 3 dias, ela está mal cortada — quebre em pedaços que
entrem sozinhos, mesmo que o pedaço ainda não faça nada visível.

---

## Conflito não é erro seu

Todo mundo tem medo de conflito porque parece que quebrou alguma coisa. Não quebrou.
O git só está dizendo: "duas pessoas mudaram as mesmas linhas, decide qual fica".

**O git mergeia LINHA, não arquivo.** Duas pessoas no mesmo arquivo, em funções
diferentes, **não dá conflito** — o git junta sozinho:

```js
// userController.js
export async function login(req, res) { ... }       // ← Kauã mexe aqui
                                                    //   sem conflito nenhum
export async function cadastrar(req, res) { ... }   // ← Victor mexe aqui
```

Por isso "estamos no mesmo arquivo" não é problema. Problema é estar na mesma
**região** do arquivo.

### Os 3 conflitos que acontecem aqui, e o que fazer

**1. `App.jsx` — duas rotas novas no mesmo lugar**
O mais comum e o mais fácil. Ficam as duas linhas. Não tem nada pra decidir:

```jsx
<<<<<<< HEAD
  <Route path="/obras" element={<Obras />} />
=======
  <Route path="/rh" element={<RH />} />
>>>>>>> feature/rh
```
→ apaga as três linhas de marcação (`<<<<`, `====`, `>>>>`) e deixa as duas rotas.

**2. `package-lock.json` — milhares de linhas de hash**
**Nunca edite na mão.** Regenere:

```bash
git checkout --theirs package-lock.json
npm install
git add package-lock.json
```

**3. `schema.prisma` — o único que dá medo com razão**
Duas alterações de schema em paralelo deixam o banco de cada pessoa diferente.
**Avise no grupo antes de mexer** e faça um de cada vez. Este é o único arquivo do
projeto que vale serializar.

---

## O que não fazer (isto sim causa dor)

| Não faça | Por quê |
|---|---|
| Reformatar / reordenar imports de arquivo compartilhado | Toda linha vira conflito e o merge fica ilegível |
| Rodar "prettier em tudo" num PR de feature | Idem, e esconde a mudança real no meio de 2.000 linhas |
| Branch de 2 semanas | Vira as 3 branches mortas aí em cima |
| PR gigante | Acima de ~400 linhas ninguém revisa de verdade, só carimba |
| `git push --force` na main | Apaga trabalho dos outros sem aviso |
| Commitar `node_modules` ou `.env` | O `.gitignore` já cobre — se apareceu, algo está errado |

---

## O CI (novo)

Todo PR agora dispara duas checagens automáticas:

- **Frontend** — `npm ci`, `npm run lint`, `npm run build`
- **Backend** — `npm ci` (roda `prisma generate`) e `npm test`

**Vermelho = não mergeia.** Clique em "Details" pra ver a linha exata que quebrou.

Uma ressalva honesta: os testes atuais em `backend/tests/` não exercitam o código do
projeto — alguns montam um objeto na própria linha e conferem esse objeto, então
passam mesmo com o backend apagado. O verde do backend hoje significa "instala e o
schema é válido", **não** "o backend funciona". Está anotado no `ci.yml`.

---

## Quem revisa

O `.github/CODEOWNERS` faz o GitHub pedir revisão automaticamente. Não precisa marcar
ninguém à mão.

Como revisar sem travar o time:
- **Prazo de 24h.** Revisão que demora mais mata a branch curta, e aí volta tudo.
- **Revise o que importa**: quebra alguma coisa? tem senha/chave commitada? o nome diz
  o que faz? O resto é gosto — comente, mas não bloqueie por causa disso.
- **Aprovar com comentário** é melhor que segurar o PR por detalhe pequeno.
