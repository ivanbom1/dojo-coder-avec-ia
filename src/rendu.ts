// Le dessin d'une forme, d'un texte ou d'une flèche sur un canvas : partagé par l'écran et par
// l'export, pour que l'image soit exactement ce qu'on voit.

import { TRAIT_PAR_DEFAUT } from './couleurs'
import { arrowEnds, innerWidth, type Point, type Shape } from './shape'
import { drawBlock, layoutText } from './text'

// Longueur de la pointe, en pixels.
export const TAILLE_POINTE = 11

export function dessinerFleche(
  ctx: CanvasRenderingContext2D,
  from: Point,
  to: Point,
  couleur: string,
  selectionnee: boolean,
  apercu = false,
) {
  const angle = Math.atan2(to.y - from.y, to.x - from.x)
  ctx.save()
  // La sélection se montre par un halo sous la flèche : elle garde sa couleur, qu'on voit changer.
  if (selectionnee) {
    ctx.strokeStyle = 'rgba(25, 113, 194, 0.3)'
    ctx.lineWidth = 8
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(to.x, to.y)
    ctx.stroke()
    ctx.lineCap = 'butt'
  }
  ctx.strokeStyle = couleur
  ctx.fillStyle = couleur
  ctx.lineWidth = 1.5
  if (apercu) ctx.setLineDash([6, 4])
  ctx.beginPath()
  ctx.moveTo(from.x, from.y)
  ctx.lineTo(to.x, to.y)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.beginPath()
  ctx.moveTo(to.x, to.y)
  ctx.lineTo(to.x - TAILLE_POINTE * Math.cos(angle - Math.PI / 7), to.y - TAILLE_POINTE * Math.sin(angle - Math.PI / 7))
  ctx.lineTo(to.x - TAILLE_POINTE * Math.cos(angle + Math.PI / 7), to.y - TAILLE_POINTE * Math.sin(angle + Math.PI / 7))
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}


export function dessinerForme(
  ctx: CanvasRenderingContext2D,
  shape: Shape,
  selectionnee: boolean,
  toutes: Shape[],
) {
  if (shape.type === 'arrow') {
    const ends = arrowEnds(shape, toutes)
    if (ends) dessinerFleche(ctx, ends.from, ends.to, shape.stroke ?? TRAIT_PAR_DEFAUT, selectionnee)
    return
  }

  if (shape.type === 'text') {
    const block = layoutText(shape.text)
    if (selectionnee) {
      ctx.save()
      ctx.setLineDash([4, 4])
      ctx.strokeStyle = '#1971c2'
      ctx.lineWidth = 1
      ctx.strokeRect(shape.x, shape.y, block.width, block.height)
      ctx.restore()
    }
    drawBlock(ctx, block, shape.x + block.width / 2, shape.y, shape.stroke)
    return
  }

  ctx.save()
  ctx.strokeStyle = shape.stroke ?? TRAIT_PAR_DEFAUT
  ctx.lineWidth = 1.5
  ctx.fillStyle = shape.fill ?? 'transparent'
  ctx.beginPath()
  if (shape.type === 'rect') ctx.rect(shape.x, shape.y, shape.w, shape.h)
  else ctx.ellipse(shape.cx, shape.cy, shape.rx, shape.ry, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  // La sélection se montre par un contour pointillé bleu, un peu en retrait à l'intérieur : la
  // forme garde ses couleurs, et son emprise ne change pas.
  if (selectionnee) {
    const retrait = 4
    ctx.setLineDash([4, 4])
    ctx.strokeStyle = '#1971c2'
    ctx.lineWidth = 1
    ctx.beginPath()
    if (shape.type === 'rect') {
      ctx.rect(shape.x + retrait, shape.y + retrait, shape.w - 2 * retrait, shape.h - 2 * retrait)
    } else {
      ctx.ellipse(
        shape.cx,
        shape.cy,
        Math.max(shape.rx - retrait, 0),
        Math.max(shape.ry - retrait, 0),
        0,
        0,
        Math.PI * 2,
      )
    }
    ctx.stroke()
  }
  ctx.restore()

  if (shape.text) {
    const block = layoutText(shape.text.text, innerWidth(shape))
    drawBlock(ctx, block, shape.text.x + block.width / 2, shape.text.y)
  }
}
