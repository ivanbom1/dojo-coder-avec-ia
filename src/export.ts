// L'export du schéma en image PNG : on redessine tout sur un canvas à part, cadré sur le schéma.
// Rien de ce qui n'appartient qu'à l'écran n'y entre : ni sélection, ni poignées, ni barre d'outils.

import { dessinerForme } from './rendu'
import { boiteDuSchema, type Box, type Shape } from './shape'

const MARGE = 20
// L'image est dessinée au double de la taille affichée, pour des traits nets.
const ECHELLE = 2
const PAS_DE_GRILLE = 20
const FOND = '#f1f3f5'
const GRILLE = '#e3e6ea'
const NOM_DU_FICHIER = 'croquis.png'

// Le fond de l'image : un gris très clair rayé d'une grille estompée.
function dessinerFond(ctx: CanvasRenderingContext2D, largeur: number, hauteur: number) {
  ctx.fillStyle = FOND
  ctx.fillRect(0, 0, largeur, hauteur)
  ctx.strokeStyle = GRILLE
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let x = 0; x <= largeur; x += PAS_DE_GRILLE) {
    ctx.moveTo(x + 0.5, 0)
    ctx.lineTo(x + 0.5, hauteur)
  }
  for (let y = 0; y <= hauteur; y += PAS_DE_GRILLE) {
    ctx.moveTo(0, y + 0.5)
    ctx.lineTo(largeur, y + 0.5)
  }
  ctx.stroke()
}

function dessinerImage(shapes: Shape[], boite: Box): HTMLCanvasElement | null {
  const largeur = Math.ceil(boite.w + 2 * MARGE)
  const hauteur = Math.ceil(boite.h + 2 * MARGE)
  const canvas = document.createElement('canvas')
  canvas.width = largeur * ECHELLE
  canvas.height = hauteur * ECHELLE
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.scale(ECHELLE, ECHELLE)
  dessinerFond(ctx, largeur, hauteur)
  // Le coin haut-gauche du schéma tombe à une marge du coin de l'image.
  ctx.translate(MARGE - boite.x, MARGE - boite.y)
  for (const shape of shapes) dessinerForme(ctx, shape, false, shapes)
  return canvas
}

// Télécharge le schéma en PNG. Renvoie `false` quand il n'y a rien à exporter : rien n'est alors
// téléchargé, c'est à l'appelant de le dire.
export function exporterPng(shapes: Shape[]): boolean {
  const boite = boiteDuSchema(shapes)
  if (!boite) return false
  const canvas = dessinerImage(shapes, boite)
  if (!canvas) return false

  canvas.toBlob((blob) => {
    if (!blob) return
    const adresse = URL.createObjectURL(blob)
    const lien = document.createElement('a')
    lien.href = adresse
    lien.download = NOM_DU_FICHIER
    lien.click()
    URL.revokeObjectURL(adresse)
  }, 'image/png')
  return true
}
