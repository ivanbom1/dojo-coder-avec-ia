// Les couleurs proposées. Les fonds sont clairs à dessein : le texte d'une forme reste noir, et
// il doit rester lisible sur n'importe lequel d'entre eux.

export type Couleur = { nom: string; valeur: string | undefined }

export const TRAIT_PAR_DEFAUT = '#1e1e1e'

export const COULEURS_TRAIT: Couleur[] = [
  { nom: 'noir', valeur: TRAIT_PAR_DEFAUT },
  { nom: 'rouge', valeur: '#e03131' },
  { nom: 'vert', valeur: '#2f9e44' },
  { nom: 'bleu', valeur: '#1971c2' },
  { nom: 'orange', valeur: '#e8590c' },
]

// `undefined` : pas de fond, la forme reste transparente.
export const COULEURS_FOND: Couleur[] = [
  { nom: 'aucun', valeur: undefined },
  { nom: 'rouge', valeur: '#ffc9c9' },
  { nom: 'vert', valeur: '#b2f2bb' },
  { nom: 'bleu', valeur: '#a5d8ff' },
  { nom: 'jaune', valeur: '#ffec99' },
]
