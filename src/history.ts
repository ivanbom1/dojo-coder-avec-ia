// L'historique d'annulation : des instantanés de la liste des formes.
// Tout est fait de fonctions pures, de l'état précédent à l'état suivant.

import type { Shape } from './shape'

// Au-delà, les plus anciens pas sont oubliés : la sauvegarde ne grossit pas sans fin.
export const LIMITE = 50

// Ce qu'on garde d'un schéma pour pouvoir revenir en arrière ou en avant.
export type Historique = { passe: Shape[][]; futur: Shape[][] }

export const HISTORIQUE_VIDE: Historique = { passe: [], futur: [] }

// Le présent (`shapes`) et son historique. `geste` garde la liste telle qu'elle était au début
// d'un glisser : tant qu'il dure, les changements ne comptent pas, et la fin du glisser en fait un
// seul pas.
export type EtatSchema = Historique & { shapes: Shape[]; geste: Shape[] | null }

export function etatInitial(shapes: Shape[], historique: Historique): EtatSchema {
  return { shapes, passe: historique.passe, futur: historique.futur, geste: null }
}

function memesFormes(a: Shape[], b: Shape[]): boolean {
  return a === b || JSON.stringify(a) === JSON.stringify(b)
}

// Range `avant` comme dernier pas : toute action neuve vide ce qu'on pouvait rétablir.
function empiler(etat: EtatSchema, avant: Shape[], shapes: Shape[]): EtatSchema {
  return { ...etat, shapes, passe: [...etat.passe, avant].slice(-LIMITE), futur: [], geste: null }
}

// Applique un changement. Un changement qui ne change rien n'ajoute aucun pas.
export function modifier(etat: EtatSchema, changement: (shapes: Shape[]) => Shape[]): EtatSchema {
  const suivantes = changement(etat.shapes)
  if (etat.geste !== null) return { ...etat, shapes: suivantes }
  if (memesFormes(suivantes, etat.shapes)) return etat
  return empiler(etat, etat.shapes, suivantes)
}

export function debutGeste(etat: EtatSchema): EtatSchema {
  return etat.geste === null ? { ...etat, geste: etat.shapes } : etat
}

export function finGeste(etat: EtatSchema): EtatSchema {
  if (etat.geste === null) return etat
  if (memesFormes(etat.geste, etat.shapes)) return { ...etat, geste: null }
  return empiler(etat, etat.geste, etat.shapes)
}

// Pendant un glisser on n'annule rien : l'état serait à moitié défait.
export function peutAnnuler(etat: EtatSchema): boolean {
  return etat.geste === null && etat.passe.length > 0
}

export function peutRetablir(etat: EtatSchema): boolean {
  return etat.geste === null && etat.futur.length > 0
}

export function annuler(etat: EtatSchema): EtatSchema {
  if (!peutAnnuler(etat)) return etat
  const shapes = etat.passe[etat.passe.length - 1]
  return {
    ...etat,
    shapes,
    passe: etat.passe.slice(0, -1),
    futur: [...etat.futur, etat.shapes],
  }
}

export function retablir(etat: EtatSchema): EtatSchema {
  if (!peutRetablir(etat)) return etat
  const shapes = etat.futur[etat.futur.length - 1]
  return {
    ...etat,
    shapes,
    passe: [...etat.passe, etat.shapes].slice(-LIMITE),
    futur: etat.futur.slice(0, -1),
  }
}
