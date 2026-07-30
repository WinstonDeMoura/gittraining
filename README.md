# 🧪 Git Sandbox — Playground de Treinamento de Git

Aplicação leve em **React + Vite + Tailwind CSS** criada para servir de
playground em treinamentos de Git. Combina duas formas de praticar:

1. **Simulador visual de Git**, direto no navegador: um terminal onde você
   digita comandos (`git commit`, `git merge`, `git rebase`, `git cherry-pick`,
   `git stash`, `git fetch`/`pull`...) e vê o **grafo de commits e branches**
   mudar em tempo real — inclusive conflitos de merge de verdade, com
   marcações `<<<<<<<` / `=======` / `>>>>>>>` para resolver.
2. **Repositório real** (este mesmo repo): os alunos clonam, criam branches,
   editam um arquivo de dados e abrem Pull Requests de verdade no GitHub.

## 🚀 Como rodar

```bash
npm install
npm run dev
```

A aplicação abre em `http://localhost:5173`.

## 📁 Estrutura do projeto

```
src/
  git-sim/
    gitEngine.js          -> motor do Git simulado (commits, branches, merge/rebase/cherry-pick, conflitos)
    scenarios.js           -> estados iniciais pré-carregados, um por exercício
  data/
    sandboxProject.js      -> arquivo de prática do repositório real (fonte dos conflitos de treino)
  components/
    Header.jsx              -> cabeçalho com versão e badge de ambiente
    GitSandbox.jsx           -> compõe terminal + grafo + seletor de cenário
    GitTerminal.jsx          -> terminal interativo (digite comandos git)
    GitGraph.jsx             -> visualização SVG do grafo de commits/branches
    ExerciseGuide.jsx        -> drawer lateral com o guia de exercícios + botão "Praticar aqui"
    Footer.jsx
  App.jsx                    -> composição da página
```

## 🧪 Simulador de Git

O simulador roda 100% no navegador — não mexe em nenhum arquivo real. Ele
modela um pequeno conjunto de "campos" editáveis (`quote`, `status`,
`changelog`) para permitir conflitos reais de 3-way merge. Comandos
suportados: `edit`, `git status`, `git log`, `git branch`, `git checkout`,
`git commit`, `git merge`, `git rebase` (+ `--continue`/`--abort`),
`git cherry-pick` (+ `--continue`/`--abort`), `git revert`,
`git reset --hard`, `git stash` (`push`/`pop`/`list`), `git fetch`, `git pull`,
e `resolve <campo> ours|theirs|"valor"` para fechar conflitos. Digite `help`
no terminal para ver a lista a qualquer momento.

## 📖 Guia de Exercícios

Dentro da aplicação, clique no botão flutuante **"📖 Guia de Exercícios Git"**
para abrir o passo a passo. Cada exercício tem um botão **"▶ Praticar aqui"**
que carrega o cenário certo no simulador antes de você repetir o fluxo de
verdade no repositório:

1. **Commit & Push** — adicione sua entrada em `src/data/sandboxProject.js`.
2. **Conflitos & Merge** — dois alunos editam a mesma linha de propósito e
   praticam resolver as marcações `<<<<<<<`, `=======`, `>>>>>>>`.
3. **Stash & Pop** — guarde um trabalho em progresso para resolver algo
   urgente em outra branch, depois recupere com `git stash pop`.
4. **Rebase vs Merge** — atualize sua branch com a `main` antes de abrir o PR,
   comparando os dois fluxos.
5. **Fetch vs Pull** — baixe alterações remotas sem aplicá-las de imediato.
6. **Cherry-pick / Revert** — resgate um commit específico de outra branch ou
   desfaça uma alteração sem apagar o histórico.

## 🛠️ Build para produção

```bash
npm run build
npm run preview
```

Pronto para deploy em Vercel, Netlify ou GitHub Pages.
