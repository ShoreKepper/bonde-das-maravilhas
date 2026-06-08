// Configuração dos membros do Bonde das Maravilhas
// Para trocar a ordem de exibição, basta reordenar o array

export const MEMBERS = [
  {
    id: 'joao',
    name: 'João Pedro',
    character: 'Patolino',
    avatar: '/bonde-das-maravilhas/avatars/patolino.png',
    color: '#1E90FF',       // azul royal do Patolino
    colorLight: '#1E90FF22',
    colorGlow: '#1E90FF66',
    emoji: '🦆',
  },
  {
    id: 'luis',
    name: 'Luís Felipe',
    character: 'McQueen',
    avatar: '/bonde-das-maravilhas/avatars/macqueen.png',
    color: '#FF3B30',       // vermelho racing
    colorLight: '#FF3B3022',
    colorGlow: '#FF3B3066',
    emoji: '🏎️',
  },
  {
    id: 'jose',
    name: 'José Felype',
    character: 'Kirito',
    avatar: '/bonde-das-maravilhas/avatars/kirito.png',
    color: '#2C2C54',       // preto/azul noturno do Kirito
    colorLight: '#5555AA22',
    colorGlow: '#8888FF66',
    emoji: '⚔️',
  },
  {
    id: 'nauane',
    name: 'Nauane',
    character: 'Barbie',
    avatar: '/bonde-das-maravilhas/avatars/barbie.png',
    color: '#FF2D78',       // rosa Barbie
    colorLight: '#FF2D7822',
    colorGlow: '#FF2D7866',
    emoji: '👸',
  },
  {
    id: 'tatiane',
    name: 'Tatiane',
    character: 'Bibble',
    avatar: '/bonde-das-maravilhas/avatars/bibble.png',
    color: '#A78BFA',       // lilás/roxo do Bibble
    colorLight: '#A78BFA22',
    colorGlow: '#A78BFA66',
    emoji: '💜',
  },
  {
    id: 'aryane',
    name: 'Aryane',
    character: 'Pernalonga',
    avatar: '/bonde-das-maravilhas/avatars/pernalonga.png',
    color: '#8E8E93',       // cinza/prata do Pernalonga
    colorLight: '#8E8E9322',
    colorGlow: '#8E8E9366',
    emoji: '🐰',
  },
]

export const getMemberById = (id) => MEMBERS.find((m) => m.id === id)
