// 📌 Este é o arquivo de prática do repositório real (fora do simulador).
// Vários alunos vão editar as MESMAS linhas de propósito — é assim que
// geramos conflitos de merge reais para praticar a resolução no Exercício 2.

export const projectInfo = {
  version: '1.0.0',
  environment: 'training',
}

export const changelog = [
  { id: 1, version: 'v1.0.0', text: 'Lançamento inicial do sandbox de treinamento de Git.' },
  { id: 2, version: 'v1.1.0', text: 'Adiciona suporte a tema escuro.' },
  { id: 3, version: 'v1.2.0', text: 'Corrige bug de performance no dashboard.' },

  // 🚨🚨🚨 ZONA DE CONFLITO — EXERCÍCIO 1 🚨🚨🚨
  // Adicione sua entrada de changelog logo ABAIXO desta linha.
  // Como todo mundo edita perto da mesma linha, é normal (e esperado!)
  // que aconteçam conflitos de merge quando dois alunos abrirem PR
  // ao mesmo tempo. Use isso para praticar a resolução de conflitos.
  //
  // Exemplo de objeto para copiar:
  // { id: 4, version: 'v1.3.0', text: 'Descrição da sua mudança.' },
]

export const featureFlags = {
  darkMode: true,
  betaCheckout: false,
  newOnboarding: false,
}
