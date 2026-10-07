// La vue : comment le schéma est projeté sur l'écran. Les formes gardent leurs coordonnées, seule
// la vue change quand on zoome ou qu'on se déplace. Un point du schéma (xs, ys) se trouve à l'écran
// en (xs * echelle + x, ys * echelle + y).

import type { Point } from './shape'

export type Vue = { echelle: number; x: number; y: number }

export const VUE_INITIALE: Vue = { echelle: 1, x: 0, y: 0 }

export const ZOOM_MIN = 0.1
export const ZOOM_MAX = 4

export function ecranVersSchema(vue: Vue, point: Point): Point {
  return { x: (point.x - vue.x) / vue.echelle, y: (point.y - vue.y) / vue.echelle }
}

export function schemaVersEcran(vue: Vue, point: Point): Point {
  return { x: point.x * vue.echelle + vue.x, y: point.y * vue.echelle + vue.y }
}

// Change l'échelle en gardant fixe ce qui se trouve sous `centre` (un point de l'écran).
export function fixerEchelle(vue: Vue, centre: Point, echelle: number): Vue {
  const borne = Math.min(Math.max(echelle, ZOOM_MIN), ZOOM_MAX)
  const sous = ecranVersSchema(vue, centre)
  return { echelle: borne, x: centre.x - sous.x * borne, y: centre.y - sous.y * borne }
}

// Zoome vers `centre` : le point du schéma sous le pointeur reste sous le pointeur.
export function zoomerVers(vue: Vue, centre: Point, facteur: number): Vue {
  return fixerEchelle(vue, centre, vue.echelle * facteur)
}

export function deplacerVue(vue: Vue, dx: number, dy: number): Vue {
  return { ...vue, x: vue.x + dx, y: vue.y + dy }
}
