// Modèles de données et géométrie des formes.
// Un modèle par forme, réunis dans une liste ordonnée : l'ordre est celui du dessin,
// la dernière forme de la liste est celle du dessus.

import { layoutText } from './text'

export type Tool ='select' | 'rect' | 'ellipse' | 'text' | 'arrow'

export type Point = { x: number; y: number }

// Les quatre points d'ancrage d'une forme : milieu de chaque côté de sa boîte.
export type Side = 'top' | 'right' | 'bottom' | 'left'

// Le texte d'une forme est un TextShape à part entière : il porte son propre coin
// haut-gauche et on le translate avec sa forme pour qu'il reste centré dedans.
export type TextShape = {
  id: string
  type: 'text'
  x: number
  y: number
  text: string
  // Couleur du texte ; absente, c'est le noir. Dans une forme, le texte reste toujours noir.
  stroke?: string
}

// `stroke` : couleur du trait ; `fill` : couleur de fond. Absentes, trait noir et fond transparent
// (les schémas enregistrés avant les couleurs s'ouvrent donc tels quels).
export type RectShape = {
  id: string
  type: 'rect'
  x: number
  y: number
  w: number
  h: number
  text?: TextShape
  stroke?: string
  fill?: string
}

export type EllipseShape = {
  id: string
  type: 'ellipse'
  cx: number
  cy: number
  rx: number
  ry: number
  text?: TextShape
  stroke?: string
  fill?: string
}

// Formes sur lesquelles une flèche peut s'accrocher : elles seules ont des points d'ancrage.
export type ConnectableShape = RectShape | EllipseShape

// Une flèche ne garde que des références : ses extrémités se recalculent à l'affichage,
// c'est ce qui la fait suivre les formes quand on les déplace.
export type ArrowShape = {
  id: string
  type: 'arrow'
  fromId: string
  toId: string
  fromSide: Side
  toSide: Side
  stroke?: string
}

export type Shape = RectShape | EllipseShape | TextShape | ArrowShape

const SIDES: Side[] = ['top', 'right', 'bottom', 'left']

export type Box = { x: number; y: number; w: number; h: number }

// Marge entre le bord d'une forme et son texte.
export const TEXT_PADDING = 6

let compteur = 0

export function newId(): string {
  compteur += 1
  return `shape-${compteur}`
}

// Au rechargement, le compteur repart de zéro alors que le schéma chargé garde ses ids : on le
// fait donc reprendre au-delà du plus grand numéro déjà pris, sinon une nouvelle forme volerait
// l'id d'une forme chargée et les flèches pointeraient sur la mauvaise.
export function reprendreLeCompteur(shapes: Shape[]): void {
  for (const shape of shapes) {
    const trouve = /^shape-(\d+)$/.exec(shape.id)
    if (trouve) compteur = Math.max(compteur, Number(trouve[1]))
  }
}

// Construit une forme à partir du geste, dans n'importe quel sens : on normalise ici,
// une fois pour toutes, plutôt que dans le rendu ou les déplacements.
export function shapeFromDrag(tool: Tool, id: string, start: Point, end: Point): Shape {
  const x = Math.min(start.x, end.x)
  const y = Math.min(start.y, end.y)
  const w = Math.abs(end.x - start.x)
  const h = Math.abs(end.y - start.y)

  if (tool === 'ellipse') {
    return { id, type: 'ellipse', cx: x + w / 2, cy: y + h / 2, rx: w / 2, ry: h / 2 }
  }
  return { id, type: 'rect', x, y, w, h }
}

export function moveBy(shape: Shape, dx: number, dy: number): Shape {
  if (shape.type === 'text') return { ...shape, x: shape.x + dx, y: shape.y + dy }

  // Une flèche n'a pas de géométrie propre : elle se déduit des formes qu'elle relie.
  if (shape.type === 'arrow') return shape

  // Le texte embarqué suit sa forme du même vecteur : il reste donc centré.
  const text = shape.text ? { ...shape.text, x: shape.text.x + dx, y: shape.text.y + dy } : shape.text
  if (shape.type === 'rect') return { ...shape, x: shape.x + dx, y: shape.y + dy, text }
  return { ...shape, cx: shape.cx + dx, cy: shape.cy + dy, text }
}

// Ce qu'une copie emporte : les formes et textes choisis, et les flèches dont les deux bouts le sont
// aussi, choisies ou non. Une flèche dont un bout reste en arrière ne relierait plus rien.
export function aCopier(shapes: Shape[], ids: string[]): Shape[] {
  const choisis = new Set(ids)
  return shapes.filter((shape) =>
    shape.type === 'arrow'
      ? choisis.has(shape.fromId) && choisis.has(shape.toId)
      : choisis.has(shape.id),
  )
}

// Des copies prêtes à coller, décalées de (dx, dy) : tout reçoit un nouvel id, le texte d'une forme
// aussi, et les flèches pointent sur les copies des formes, jamais sur les originaux.
export function dupliquer(copie: Shape[], dx: number, dy: number): Shape[] {
  const nouveauxIds = new Map<string, string>()
  for (const shape of copie) if (shape.type !== 'arrow') nouveauxIds.set(shape.id, newId())

  return copie.flatMap((shape): Shape[] => {
    if (shape.type === 'arrow') {
      const fromId = nouveauxIds.get(shape.fromId)
      const toId = nouveauxIds.get(shape.toId)
      return fromId && toId ? [{ ...shape, id: newId(), fromId, toId }] : []
    }
    const decalee = moveBy(shape, dx, dy)
    const id = nouveauxIds.get(shape.id)!
    if (decalee.type === 'text' || decalee.type === 'arrow') return [{ ...decalee, id }]
    return [{ ...decalee, id, text: decalee.text && { ...decalee.text, id: newId() } }]
  })
}

// La plus petite boîte qui contient tout ce qui est dessiné : les formes, les textes libres, le
// texte des formes (qui peut déborder d'elles) et les deux bouts des flèches. `null` si rien n'est
// dessiné, par exemple sur un canevas vide. La pointe d'une flèche reste à moins d'une dizaine de
// pixels de son bout : la marge de l'export la couvre.
export function boiteDuSchema(shapes: Shape[]): Box | null {
  let gauche = Infinity
  let haut = Infinity
  let droite = -Infinity
  let bas = -Infinity
  const inclure = (x: number, y: number, w = 0, h = 0) => {
    gauche = Math.min(gauche, x)
    haut = Math.min(haut, y)
    droite = Math.max(droite, x + w)
    bas = Math.max(bas, y + h)
  }

  for (const shape of shapes) {
    if (shape.type === 'arrow') {
      const bouts = arrowEnds(shape, shapes)
      if (bouts) {
        inclure(bouts.from.x, bouts.from.y)
        inclure(bouts.to.x, bouts.to.y)
      }
    } else if (shape.type === 'text') {
      const bloc = layoutText(shape.text)
      inclure(shape.x, shape.y, bloc.width, bloc.height)
    } else {
      const boite = bounds(shape)
      inclure(boite.x, boite.y, boite.w, boite.h)
      if (shape.text) {
        const bloc = layoutText(shape.text.text, innerWidth(shape))
        inclure(shape.text.x, shape.text.y, bloc.width, bloc.height)
      }
    }
  }

  if (gauche === Infinity) return null
  return { x: gauche, y: haut, w: droite - gauche, h: bas - haut }
}

// Les poignées de redimensionnement sont aux quatre coins de la boîte ; elles se calculent depuis
// elle, rien n'est stocké.
export type Corner = 'nw' | 'ne' | 'se' | 'sw'

// En dessous, une forme ne rétrécit plus : elle reste visible et attrapable.
export const TAILLE_MIN_FORME = 10

export function handlePoints(shape: ConnectableShape): { corner: Corner; point: Point }[] {
  const b = bounds(shape)
  return [
    { corner: 'nw', point: { x: b.x, y: b.y } },
    { corner: 'ne', point: { x: b.x + b.w, y: b.y } },
    { corner: 'se', point: { x: b.x + b.w, y: b.y + b.h } },
    { corner: 'sw', point: { x: b.x, y: b.y + b.h } },
  ]
}

// Remet le texte d'une forme au centre de sa boîte, avec le retour à la ligne de sa largeur.
function recentrerTexte(shape: ConnectableShape): ConnectableShape {
  if (!shape.text) return shape
  const block = layoutText(shape.text.text, innerWidth(shape))
  const centre = centerOf(shape)
  const text = { ...shape.text, x: centre.x - block.width / 2, y: centre.y - block.height / 2 }
  return { ...shape, text }
}

// La forme de départ `origin`, dont on tire le coin `corner` jusqu'à `point` : le coin opposé
// reste en place, et la forme s'arrête à la taille minimale au lieu de se retourner.
export function resizeFrom(origin: ConnectableShape, corner: Corner, point: Point): ConnectableShape {
  const b = bounds(origin)
  const gauche = corner === 'nw' || corner === 'sw'
  const haut = corner === 'nw' || corner === 'ne'

  const x = gauche ? Math.min(point.x, b.x + b.w - TAILLE_MIN_FORME) : b.x
  const droite = gauche ? b.x + b.w : Math.max(point.x, b.x + TAILLE_MIN_FORME)
  const y = haut ? Math.min(point.y, b.y + b.h - TAILLE_MIN_FORME) : b.y
  const bas = haut ? b.y + b.h : Math.max(point.y, b.y + TAILLE_MIN_FORME)
  const w = droite - x
  const h = bas - y

  const redimensionnee: ConnectableShape =
    origin.type === 'rect'
      ? { ...origin, x, y, w, h }
      : { ...origin, cx: x + w / 2, cy: y + h / 2, rx: w / 2, ry: h / 2 }
  return recentrerTexte(redimensionnee)
}

export function bounds(shape: Shape): Box {
  if (shape.type === 'rect') return { x: shape.x, y: shape.y, w: shape.w, h: shape.h }
  if (shape.type === 'ellipse') {
    return { x: shape.cx - shape.rx, y: shape.cy - shape.ry, w: shape.rx * 2, h: shape.ry * 2 }
  }
  // Une flèche n'a pas de boîte à elle : il faudrait la liste des formes pour la déduire.
  return { x: 0, y: 0, w: 0, h: 0 }
}

export function centerOf(shape: Shape): Point {
  if (shape.type === 'rect') return { x: shape.x + shape.w / 2, y: shape.y + shape.h / 2 }
  if (shape.type === 'ellipse') return { x: shape.cx, y: shape.cy }
  return { x: 0, y: 0 }
}

export function isConnectable(shape: Shape): shape is ConnectableShape {
  return shape.type === 'rect' || shape.type === 'ellipse'
}

// Le point d'ancrage est posé sur le bord de la forme : une flèche qui s'y accroche s'arrête
// donc au bord, jamais au centre.
export function anchorPoint(shape: ConnectableShape, side: Side): Point {
  const b = bounds(shape)
  if (side === 'top') return { x: b.x + b.w / 2, y: b.y }
  if (side === 'bottom') return { x: b.x + b.w / 2, y: b.y + b.h }
  if (side === 'left') return { x: b.x, y: b.y + b.h / 2 }
  return { x: b.x + b.w, y: b.y + b.h / 2 }
}

export function anchorPoints(shape: ConnectableShape): { side: Side; point: Point }[] {
  return SIDES.map((side) => ({ side, point: anchorPoint(shape, side) }))
}

export function anchorKey(shapeId: string, side: Side): string {
  return `${shapeId}:${side}`
}

// Les extrémités d'une flèche, recalculées depuis les formes qu'elle relie. Renvoie null si
// l'une des deux formes a disparu : il n'y a alors plus rien à dessiner.
export function arrowEnds(arrow: ArrowShape, shapes: Shape[]): { from: Point; to: Point } | null {
  const from = shapes.find((s) => s.id === arrow.fromId)
  const to = shapes.find((s) => s.id === arrow.toId)
  if (!from || !to || !isConnectable(from) || !isConnectable(to)) return null
  return { from: anchorPoint(from, arrow.fromSide), to: anchorPoint(to, arrow.toSide) }
}

export function distanceToSegment(point: Point, a: Point, b: Point): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const carre = dx * dx + dy * dy
  if (carre === 0) return Math.hypot(point.x - a.x, point.y - a.y)
  const t = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / carre))
  return Math.hypot(point.x - (a.x + t * dx), point.y - (a.y + t * dy))
}

// Largeur offerte au texte d'une forme : la boîte pour un rectangle, un peu moins
// pour une ellipse, qui est plus étroite en haut et en bas.
export function innerWidth(shape: Shape): number {
  if (shape.type === 'rect') return Math.max(shape.w - 2 * TEXT_PADDING, 1)
  if (shape.type === 'ellipse') return Math.max(shape.rx * 1.4, 1)
  return Number.POSITIVE_INFINITY
}

// Détection du clic pour les formes à boîte ; le texte, qui doit être mesuré, est traité
// par le plateau.
export function hitTest(shape: Shape, point: Point): boolean {
  if (shape.type === 'rect') {
    return (
      point.x >= shape.x &&
      point.x <= shape.x + shape.w &&
      point.y >= shape.y &&
      point.y <= shape.y + shape.h
    )
  }
  if (shape.type === 'ellipse') {
    if (shape.rx <= 0 || shape.ry <= 0) return false
    const dx = (point.x - shape.cx) / shape.rx
    const dy = (point.y - shape.cy) / shape.ry
    return dx * dx + dy * dy <= 1
  }
  return false
}
