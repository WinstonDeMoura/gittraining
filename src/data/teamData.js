// 📌 Este arquivo é o "coração" do treinamento de Git.
// Várias pessoas vão editar as MESMAS linhas de propósito — é assim que
// geramos conflitos de merge reais para praticar a resolução.

export const projectInfo = {
  version: '1.0.0',
  environment: 'training',
  projectStatus: 'Sprint 3 — Em andamento 🚀',
  quoteOfTheDay:
    'A melhor forma de aprender Git é errando em um ambiente seguro.',
}

export const teamMembers = [
  {
    id: 1,
    name: 'Ana Silva',
    role: 'Product Owner',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
    quote: 'Entregar valor é mais importante do que entregar código.',
  },
  {
    id: 2,
    name: 'Bruno Costa',
    role: 'Tech Lead',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
    quote: 'Code review é um presente, não um ataque pessoal.',
  },
  {
    id: 3,
    name: 'Carla Mendes',
    role: 'Frontend Developer',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
    quote: 'CSS não é uma linguagem de programação, é uma arte marcial.',
  },
  {
    id: 4,
    name: 'Diego Alves',
    role: 'Backend Developer',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
    quote: 'Funciona na minha máquina é o novo "os cachorros comeram meu dever".',
  },
  {
    id: 5,
    name: 'Elisa Ramos',
    role: 'QA Engineer',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
    quote: 'Se não foi testado, não foi feito.',
  },
  {
    id: 6,
    name: 'Felipe Souza',
    role: 'DevOps Engineer',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
    quote: 'Automatize hoje o que você não quer repetir amanhã.',
  },

  // 🚨🚨🚨 ZONA DE CONFLITO — EXERCÍCIO 1 🚨🚨🚨
  // Adicione o SEU card de membro logo ABAIXO desta linha.
  // Como todo mundo edita perto da mesma linha, é normal (e esperado!)
  // que aconteçam conflitos de merge quando dois alunos abrirem PR
  // ao mesmo tempo. Use isso para praticar a resolução de conflitos.
  //
  // Exemplo de objeto para copiar:
  // {
  //   id: 7,
  //   name: 'Seu Nome',
  //   role: 'Seu Cargo',
  //   photo: 'https://images.unsplash.com/photo-XXXXXXX?w=400&q=80',
  //   quote: 'Sua frase favorita sobre programação ou Git.',
  // },
]
