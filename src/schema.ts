// La sauvegarde automatique des schémas, dans le stockage du navigateur.
// Un petit index garde la liste des schémas et celui qui est ouvert ; chaque schéma a ses propres
// entrées (ses formes, son historique). Une valeur illisible n'empêche jamais l'appli de s'ouvrir :
// elle est mise de côté intacte, et ne coûte qu'elle-même.

import { HISTORIQUE_VIDE, type Historique } from './history'
import type { Shape } from './shape'

const CLE_INDEX = 'croquis:index'
const CLE_INDEX_ABANDONNE = 'croquis:index-abandonne'
const PREFIXE_SCHEMA = 'croquis:schema:'
const cleSchema = (id: string) => `${PREFIXE_SCHEMA}${id}`
const cleHistorique = (id: string) => `croquis:historique:${id}`
const cleDeSecours = (id: string) => `croquis:schema-abandonne:${id}`

// Avant plusieurs schémas : un seul schéma, sous ces deux clés.
const ANCIEN_SCHEMA = 'croquis:schema'
const ANCIEN_HISTORIQUE = 'croquis:historique'

// Un nom plus long est coupé.
export const NOM_MAX = 60

export type EntreeSchema = { id: string; nom: string }
export type Index = { ouvert: string; schemas: EntreeSchema[] }

export type Lecture =
  | { etat: 'vide' }
  | { etat: 'ok'; shapes: Shape[] }
  | { etat: 'illisible' }

export function nouvelId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

export function ecrireIndex(index: Index): void {
  try {
    localStorage.setItem(CLE_INDEX, JSON.stringify(index))
  } catch {
    // Stockage plein ou refusé : la sauvegarde est un confort, pas une condition.
  }
}

// L'index lu, ou null s'il n'a pas la forme attendue.
function analyserIndex(brut: string): Index | null {
  try {
    const valeur: unknown = JSON.parse(brut)
    if (typeof valeur !== 'object' || valeur === null) return null
    const { ouvert, schemas } = valeur as Record<string, unknown>
    if (!Array.isArray(schemas) || schemas.length === 0) return null
    const entrees: EntreeSchema[] = []
    for (const entree of schemas) {
      if (typeof entree !== 'object' || entree === null) return null
      const { id, nom } = entree as Record<string, unknown>
      if (typeof id !== 'string' || typeof nom !== 'string') return null
      entrees.push({ id, nom })
    }
    const existe = entrees.some((entree) => entree.id === ouvert)
    return { ouvert: existe ? (ouvert as string) : entrees[0].id, schemas: entrees }
  } catch {
    return null
  }
}

// Le premier index : l'ancien schéma unique, s'il existe, devient « Schéma 1 », recopié tel quel
// sans être relu ni réécrit ; sinon un « Schéma 1 » vide.
function premierIndex(): Index {
  const id = nouvelId()
  const index: Index = { ouvert: id, schemas: [{ id, nom: 'Schéma 1' }] }
  try {
    const ancien = localStorage.getItem(ANCIEN_SCHEMA)
    if (ancien !== null) {
      localStorage.setItem(cleSchema(id), ancien)
      localStorage.removeItem(ANCIEN_SCHEMA)
    }
    const ancienHistorique = localStorage.getItem(ANCIEN_HISTORIQUE)
    if (ancienHistorique !== null) {
      localStorage.setItem(cleHistorique(id), ancienHistorique)
      localStorage.removeItem(ANCIEN_HISTORIQUE)
    }
  } catch {
    // Stockage refusé : on repart d'une page blanche.
  }
  ecrireIndex(index)
  return index
}

// L'index est perdu : on retrouve les schémas qui sont restés dans le stockage.
function reconstruireIndex(): Index {
  const ids: string[] = []
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const cle = localStorage.key(i)
      if (cle?.startsWith(PREFIXE_SCHEMA)) ids.push(cle.slice(PREFIXE_SCHEMA.length))
    }
  } catch {
    // Stockage refusé : rien à retrouver.
  }
  if (ids.length === 0) return premierIndex()
  const index: Index = {
    ouvert: ids[0],
    schemas: ids.map((id, rang) => ({ id, nom: `Schéma retrouvé ${rang + 1}` })),
  }
  ecrireIndex(index)
  return index
}

export function lireIndex(): { index: Index; message: string | null } {
  let brut: string | null = null
  try {
    brut = localStorage.getItem(CLE_INDEX)
  } catch {
    // Stockage refusé : un schéma vide, qui ne sera pas gardé.
    const id = nouvelId()
    return { index: { ouvert: id, schemas: [{ id, nom: 'Schéma 1' }] }, message: null }
  }
  if (brut === null) return { index: premierIndex(), message: null }

  const index = analyserIndex(brut)
  if (index) return { index, message: null }

  try {
    localStorage.setItem(CLE_INDEX_ABANDONNE, brut)
    localStorage.removeItem(CLE_INDEX)
  } catch {
    // Rien à faire de plus : la liste est reconstruite sans.
  }
  return {
    index: reconstruireIndex(),
    message:
      'La liste de tes schémas était illisible : elle a été mise de côté et reconstruite depuis les schémas retrouvés.',
  }
}

export function lireSchema(id: string): Lecture {
  let brut: string | null = null
  try {
    brut = localStorage.getItem(cleSchema(id))
  } catch {
    // Stockage refusé (navigation privée, réglages) : on repart d'une page blanche.
    return { etat: 'vide' }
  }
  if (brut === null) return { etat: 'vide' }

  try {
    const valeur: unknown = JSON.parse(brut)
    if (!Array.isArray(valeur)) throw new Error('ce n est pas une liste de formes')
    return { etat: 'ok', shapes: valeur as Shape[] }
  } catch {
    try {
      localStorage.setItem(cleDeSecours(id), brut)
      localStorage.removeItem(cleSchema(id))
    } catch {
      // Rien à faire de plus : le schéma est perdu, mais l'appli s'ouvre.
    }
    return { etat: 'illisible' }
  }
}

export function ecrireSchema(id: string, shapes: Shape[]): void {
  try {
    localStorage.setItem(cleSchema(id), JSON.stringify(shapes))
  } catch {
    // Stockage plein ou refusé : la sauvegarde est un confort, pas une condition.
  }
}

function estUneListeDeListes(valeur: unknown): valeur is Shape[][] {
  return Array.isArray(valeur) && valeur.every((element) => Array.isArray(element))
}

// L'historique vit sous sa propre clé : le schéma garde son format. Un historique illisible ne
// coûte que lui-même, sans message : on repart d'un historique vide.
export function lireHistorique(id: string): Historique {
  try {
    const brut = localStorage.getItem(cleHistorique(id))
    if (brut === null) return HISTORIQUE_VIDE
    try {
      const valeur: unknown = JSON.parse(brut)
      if (typeof valeur === 'object' && valeur !== null) {
        const { passe, futur } = valeur as Record<string, unknown>
        if (estUneListeDeListes(passe) && estUneListeDeListes(futur)) return { passe, futur }
      }
    } catch {
      // Valeur illisible : écartée ci-dessous.
    }
    localStorage.removeItem(cleHistorique(id))
  } catch {
    // Stockage refusé : pas d'historique.
  }
  return HISTORIQUE_VIDE
}

export function ecrireHistorique(id: string, historique: Historique): void {
  try {
    localStorage.setItem(
      cleHistorique(id),
      JSON.stringify({ passe: historique.passe, futur: historique.futur }),
    )
  } catch {
    // Stockage plein ou refusé : on perd l'historique, pas le schéma.
  }
}

// Un schéma supprimé emporte ses formes, son historique et sa valeur de secours.
export function supprimerDuStockage(id: string): void {
  try {
    localStorage.removeItem(cleSchema(id))
    localStorage.removeItem(cleHistorique(id))
    localStorage.removeItem(cleDeSecours(id))
  } catch {
    // Stockage refusé : rien à supprimer.
  }
}
