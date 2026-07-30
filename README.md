# 🧑‍🤝‍🧑 Git Training Sandbox — Mural da Equipe

Aplicação leve em **React + Vite + Tailwind CSS** criada para servir de
playground em treinamentos de Git. Os alunos clonam este repositório,
criam branches, editam o mural e abrem Pull Requests — praticando commits,
merges, conflitos, rebase, stash e cherry-pick em um ambiente visual e seguro.

## 🚀 Como rodar

```bash
npm install
npm run dev
```

A aplicação abre em `http://localhost:5173`.

## 📁 Estrutura do projeto

```
src/
  data/teamData.js       -> dados do mural (fonte principal dos conflitos de treino)
  components/
    Header.jsx            -> cabeçalho com versão e badge de ambiente
    MemberCard.jsx         -> card individual de cada membro da equipe
    ExerciseGuide.jsx      -> drawer lateral com o guia de exercícios
    Footer.jsx             -> rodapé
  App.jsx                  -> composição da página
```

## 📖 Guia de Exercícios

Dentro da aplicação, clique no botão flutuante **"📖 Guia de Exercícios Git"**
para abrir o passo a passo interativo. Resumo dos exercícios:

1. **Commit & Push** — adicione seu próprio card em `src/data/teamData.js`.
2. **Conflitos & Merge** — dois alunos editam a mesma linha de propósito e
   praticam resolver as marcações `<<<<<<<`, `=======`, `>>>>>>>`.
3. **Stash & Pop** — guarde um trabalho em progresso para resolver algo
   urgente em outra branch, depois recupere com `git stash pop`.
4. **Rebase vs Merge** — atualize sua branch com a `main` antes de abrir o PR,
   comparando os dois fluxos.
5. **Fetch vs Pull** — baixe alterações remotas sem aplicá-las de imediato.
6. **Cherry-pick / Revert** — resgate um commit específico de outra branch ou
   desfaça uma alteração sem apagar o histórico.

## 🎯 Por que `teamData.js`?

O array `teamMembers` foi estruturado de propósito para gerar conflitos reais:
todo mundo é instruído a adicionar seu card na mesma "zona de conflito" no
final do arquivo. Isso simula, de forma segura, o que acontece quando duas
pessoas mexem na mesma linha em produção.

## 🛠️ Build para produção

```bash
npm run build
npm run preview
```

Pronto para deploy em Vercel, Netlify ou GitHub Pages.
