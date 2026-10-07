// Mesure, retour à la ligne et rendu du texte.
// La mesure passe par un canvas hors écran : n'importe qui peut donc calculer la taille
// d'un bloc de texte, pas seulement le plateau.

export const FONT_SIZE = 20
export const LINE_HEIGHT = 1.25
export const FONT_FAMILY = 'system-ui, sans-serif'
export const TEXT_COLOR = '#1e1e1e'

export type TextBlock = { lines: string[]; width: number; height: number }

function police(): string {
  return `${FONT_SIZE}px ${FONT_FAMILY}`
}

export function lineHeight(): number {
  return FONT_SIZE * LINE_HEIGHT
}

let ctxMesure: CanvasRenderingContext2D | null = null

function mesure(): CanvasRenderingContext2D | null {
  if (!ctxMesure) {
    ctxMesure = document.createElement('canvas').getContext('2d')
  }
  if (ctxMesure) ctxMesure.font = police()
  return ctxMesure
}

function decouper(ctx: CanvasRenderingContext2D, ligne: string, largeurMax: number): string[] {
  if (ligne === '' || ctx.measureText(ligne).width <= largeurMax) return [ligne]

  const lignes: string[] = []
  let courante = ''
  const pousser = () => {
    if (courante !== '') {
      lignes.push(courante)
      courante = ''
    }
  }

  for (const mot of ligne.split(' ')) {
    const essai = courante === '' ? mot : `${courante} ${mot}`
    if (ctx.measureText(essai).width <= largeurMax) {
      courante = essai
      continue
    }
    pousser()
    if (ctx.measureText(mot).width <= largeurMax) {
      courante = mot
      continue
    }
    // Le mot seul dépasse la ligne : on le coupe caractère par caractère, comme le
    // ferait le champ d'édition, plutôt que de le laisser filer en travers de la forme.
    for (const caractere of mot) {
      if (courante !== '' && ctx.measureText(courante + caractere).width > largeurMax) pousser()
      courante += caractere
    }
  }
  pousser()
  return lignes
}

// Sans largeur max, le texte ne se replie pas : seules les lignes tapées comptent.
export function layoutText(texte: string, largeurMax?: number): TextBlock {
  const ctx = mesure()
  const paragraphes = texte.split('\n')
  const lignes =
    !ctx || largeurMax === undefined
      ? paragraphes
      : paragraphes.flatMap((paragraphe) => decouper(ctx, paragraphe, largeurMax))

  let largeur = 0
  if (ctx) for (const ligne of lignes) largeur = Math.max(largeur, ctx.measureText(ligne).width)

  return { lines: lignes, width: largeur, height: lignes.length * lineHeight() }
}

// Le bloc est posé par son coin haut-gauche, mais dessiné centré sur `centreX`.
export function drawBlock(
  ctx: CanvasRenderingContext2D,
  block: TextBlock,
  centreX: number,
  hautY: number,
  couleur: string = TEXT_COLOR,
) {
  ctx.save()
  ctx.font = police()
  ctx.fillStyle = couleur
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const hauteur = lineHeight()
  block.lines.forEach((ligne, index) => {
    ctx.fillText(ligne, centreX, hautY + hauteur * index + hauteur / 2)
  })
  ctx.restore()
}
