import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import TextEditor from './TextEditor'
import {
  anchorKey,
  anchorPoint,
  anchorPoints,
  arrowEnds,
  bounds,
  centerOf,
  distanceToSegment,
  handlePoints,
  hitTest,
  innerWidth,
  isConnectable,
  moveBy,
  newId,
  resizeFrom,
  shapeFromDrag,
  type ArrowShape,
  type ConnectableShape,
  type Corner,
  type Point,
  type Shape,
  type Side,
  type TextShape,
  type Tool,
} from './shape'
import { dessinerFleche, dessinerForme } from './rendu'
import { FONT_SIZE, layoutText, lineHeight } from './text'
import { deplacerVue, ecranVersSchema, zoomerVers, type Vue } from './vue'

// En dessous de ce glisser (en pixels), on considère que c'est un simple clic : rien n'est créé.
const TAILLE_MIN = 3

// Distance en dessous de laquelle le curseur est considéré comme posé sur un point d'ancrage.
const RAYON_ACCROCHE = 10

// Distance en dessous de laquelle un clic attrape une flèche.
const EPAISSEUR_CLIC = 6

// Côté des poignées de redimensionnement, et distance du coin en dessous de laquelle on les attrape.
const TAILLE_POIGNEE = 8
const RAYON_POIGNEE = 8

// Ce qui est en cours d'édition : un texte libre (nouveau ou existant) ou le texte d'une forme.
export type Edition =
  | { kind: 'libre'; id: string | null; point: Point; value: string }
  | { kind: 'forme'; shapeId: string; value: string }

// Ce qui est en cours de tracé avec l'outil Flèche : d'où l'on part, et où en est le curseur.
// `retouche` porte la flèche existante qu'on rebranche quand on repart d'un point déjà utilisé.
type Tracage = {
  depart: { shapeId: string; side: Side }
  retouche: string | null
  curseur: Point
}

type Props = {
  shapes: Shape[]
  tool: Tool
  selectedIds: string[]
  editing: Edition | null
  // La vue (zoom et position) et la façon de la changer : la molette et Espace + glisser s'en servent.
  vue: Vue
  onVueChange: (vue: Vue) => void
  onCreate: (shape: Shape) => void
  onUpdate: (shape: Shape) => void
  // Un glisser de déplacement ne compte que pour un pas d'annulation : on signale son début et sa fin.
  onGestureStart: () => void
  onGestureEnd: () => void
  onSelect: (ids: string[]) => void
  // Déplace d'un coup tous les éléments sélectionnés : on passe leurs nouvelles versions.
  onMove: (shapes: Shape[]) => void
  onEdit: (edition: Edition) => void
  onChangeText: (value: string) => void
  onCommit: () => void
  onCancel: () => void
}

function curseurDe(tool: Tool): string {
  if (tool === 'select') return 'default'
  if (tool === 'text') return 'text'
  return 'crosshair'
}

// La flèche du dessus passe sous le curseur : on mesure la distance au segment.
// Les distances d'accroche se comptent en pixels d'écran : on les divise par l'échelle pour les
// comparer à des points du schéma.
function flecheSous(shapes: Shape[], point: Point, echelle: number): ArrowShape | null {
  for (let i = shapes.length - 1; i >= 0; i -= 1) {
    const shape = shapes[i]
    if (shape.type !== 'arrow') continue
    const ends = arrowEnds(shape, shapes)
    if (ends && distanceToSegment(point, ends.from, ends.to) <= EPAISSEUR_CLIC / echelle) {
      return shape
    }
  }
  return null
}

function toucheTexte(shape: TextShape, point: Point): boolean {
  const block = layoutText(shape.text)
  return (
    point.x >= shape.x &&
    point.x <= shape.x + block.width &&
    point.y >= shape.y &&
    point.y <= shape.y + block.height
  )
}

// Les points déjà occupés par le départ d'une flèche : ils ne peuvent plus en démarrer une
// autre, mais restent disponibles comme arrivée.
function departsUtilises(shapes: Shape[]): Set<string> {
  const utilises = new Set<string>()
  for (const shape of shapes) {
    if (shape.type === 'arrow') utilises.add(anchorKey(shape.fromId, shape.fromSide))
  }
  return utilises
}

// Le point d'ancrage le plus proche du curseur, en partant du dessus de la pile.
function ancreSous(
  shapes: Shape[],
  point: Point,
  echelle: number,
): { shape: ConnectableShape; side: Side } | null {
  for (let i = shapes.length - 1; i >= 0; i -= 1) {
    const shape = shapes[i]
    if (!isConnectable(shape)) continue
    for (const ancre of anchorPoints(shape)) {
      if (Math.hypot(ancre.point.x - point.x, ancre.point.y - point.y) <= RAYON_ACCROCHE / echelle) {
        return { shape, side: ancre.side }
      }
    }
  }
  return null
}

// La poignée du coin sous le curseur, pour la forme sélectionnée.
function poigneeSous(shape: Shape | undefined, point: Point, echelle: number): Corner | null {
  if (!shape || !isConnectable(shape)) return null
  // Sur une très petite forme, les poignées ne recouvrent pas tout le corps : son milieu reste
  // attrapable pour la déplacer.
  const boite = bounds(shape)
  const rayon = Math.min(RAYON_POIGNEE / echelle, Math.min(boite.w, boite.h) / 3)
  for (const poignee of handlePoints(shape)) {
    if (Math.abs(poignee.point.x - point.x) <= rayon && Math.abs(poignee.point.y - point.y) <= rayon) {
      return poignee.corner
    }
  }
  return null
}

function curseurPoignee(corner: Corner): string {
  return corner === 'nw' || corner === 'se' ? 'nwse-resize' : 'nesw-resize'
}

export default function Board({
  shapes,
  tool,
  selectedIds,
  editing,
  vue,
  onVueChange,
  onCreate,
  onUpdate,
  onGestureStart,
  onGestureEnd,
  onSelect,
  onMove,
  onEdit,
  onChangeText,
  onCommit,
  onCancel,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [draft, setDraft] = useState<Shape | null>(null)
  const [trace, setTrace] = useState<Tracage | null>(null)
  const dessin = useRef<{ start: Point; id: string } | null>(null)
  // `origins` : les éléments déplacés, tels qu'ils étaient au début du glisser ; `clic` : celui qu'on
  // a attrapé ; `aBouge` : sans mouvement, un clic sur un élément d'un groupe le garde seul.
  const deplacement = useRef<{
    start: Point
    origins: Shape[]
    clic: string
    aBouge: boolean
  } | null>(null)

  // Les poignées n'ont de sens que pour une seule forme sélectionnée.
  const formeSeule = (): Shape | undefined =>
    selectedIds.length === 1 ? shapes.find((shape) => shape.id === selectedIds[0]) : undefined
  const redimension = useRef<{ corner: Corner; origin: ConnectableShape } | null>(null)

  // Espace enfoncé, ou glisser de la vue en cours : on garde la souris et la vue du début.
  const espace = useRef(false)
  const deplacementVue = useRef<{ x: number; y: number; vue: Vue } | null>(null)

  // La dernière vue, le dernier outil et l'état d'édition sous la main, pour les écouteurs posés
  // une seule fois.
  const vueRef = useRef(vue)
  vueRef.current = vue
  const onVueRef = useRef(onVueChange)
  onVueRef.current = onVueChange
  const outilRef = useRef(tool)
  outilRef.current = tool
  const enEditionRef = useRef(editing !== null)
  enEditionRef.current = editing !== null

  // On garde la dernière validation sous la main sans réabonner l'écouteur à chaque frappe.
  const commitRef = useRef(onCommit)
  commitRef.current = onCommit

  // Le canvas suit la taille de la zone de dessin.
  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    if (!canvas || !parent) return
    const redimensionner = () => setSize({ width: parent.clientWidth, height: parent.clientHeight })
    redimensionner()
    const observer = new ResizeObserver(redimensionner)
    observer.observe(parent)
    return () => observer.disconnect()
  }, [])

  // Redessin complet de la scène à chaque changement, net sur écran haute densité.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || size.width === 0 || size.height === 0) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.round(size.width * dpr)
    canvas.height = Math.round(size.height * dpr)
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, size.width, size.height)
    // Tout ce qui suit se dessine dans le repère du schéma : la vue le place à l'écran.
    ctx.translate(vue.x, vue.y)
    ctx.scale(vue.echelle, vue.echelle)
    const toutes = draft ? [...shapes, draft] : shapes
    for (const shape of toutes) dessinerForme(ctx, shape, selectedIds.includes(shape.id), toutes)

    // Les poignées de la forme sélectionnée, seulement avec l'outil Sélection.
    const choisie = formeSeule()
    if (tool === 'select' && !editing && choisie && isConnectable(choisie)) {
      ctx.save()
      ctx.fillStyle = '#fff'
      ctx.strokeStyle = '#1971c2'
      // Les poignées gardent leur taille à l'écran, quel que soit le zoom.
      ctx.lineWidth = 1.5 / vue.echelle
      const cote = TAILLE_POIGNEE / vue.echelle
      for (const poignee of handlePoints(choisie)) {
        ctx.fillRect(poignee.point.x - cote / 2, poignee.point.y - cote / 2, cote, cote)
        ctx.strokeRect(poignee.point.x - cote / 2, poignee.point.y - cote / 2, cote, cote)
      }
      ctx.restore()
    }

    // Avec l'outil Flèche, les points d'ancrage restent visibles : on voit où l'on peut partir
    // et où l'on peut arriver.
    if (tool === 'arrow' || trace) {
      const utilises = departsUtilises(shapes)
      for (const shape of shapes) {
        if (!isConnectable(shape)) continue
        for (const ancre of anchorPoints(shape)) {
          const libre = !utilises.has(anchorKey(shape.id, ancre.side))
          ctx.beginPath()
          ctx.arc(ancre.point.x, ancre.point.y, (libre ? 4 : 3) / vue.echelle, 0, Math.PI * 2)
          ctx.fillStyle = libre ? '#1971c2' : '#ced4da'
          ctx.fill()
        }
      }
    }

    // Le tracé en cours : un aperçu en pointillés du point de départ au curseur.
    if (trace) {
      const source = shapes.find((shape) => shape.id === trace.depart.shapeId)
      if (source && isConnectable(source)) {
        dessinerFleche(ctx, anchorPoint(source, trace.depart.side), trace.curseur, '#1971c2', false, true)
      }
    }
  }, [shapes, draft, trace, tool, selectedIds, size, editing, vue])

  const curseur = (valeur: string) => {
    if (canvasRef.current) canvasRef.current.style.cursor = valeur
  }

  // Ctrl+molette (et le pincement d'un pavé tactile) zoome vers le pointeur, la molette seule
  // déplace la vue. L'écouteur est posé à la main : sans cela, le navigateur zoomerait la page.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const surRoulette = (event: WheelEvent) => {
      event.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const courante = vueRef.current
      const suivante = event.ctrlKey
        ? zoomerVers(
            courante,
            { x: event.clientX - rect.left, y: event.clientY - rect.top },
            Math.exp(-event.deltaY * 0.002),
          )
        : deplacerVue(courante, -event.deltaX, -event.deltaY)
      vueRef.current = suivante
      onVueRef.current(suivante)
    }
    canvas.addEventListener('wheel', surRoulette, { passive: false })
    return () => canvas.removeEventListener('wheel', surRoulette)
  }, [])

  // Espace enfoncé : un glisser déplace la vue, quel que soit l'outil. Pendant l'écriture d'un
  // texte, Espace reste une espace.
  useEffect(() => {
    const surBaisse = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || enEditionRef.current) return
      // Dans un champ de saisie (un nom de schéma), Espace reste une espace.
      const cible = event.target
      if (cible instanceof HTMLElement && (cible.tagName === 'INPUT' || cible.tagName === 'TEXTAREA')) {
        return
      }
      event.preventDefault()
      if (event.repeat) return
      espace.current = true
      if (!deplacementVue.current) curseur('grab')
    }
    const relacher = () => {
      if (!espace.current) return
      espace.current = false
      if (!deplacementVue.current) curseur(curseurDe(outilRef.current))
    }
    const surLeve = (event: KeyboardEvent) => {
      if (event.code !== 'Space') return
      if (espace.current) event.preventDefault()
      relacher()
    }
    document.addEventListener('keydown', surBaisse)
    document.addEventListener('keyup', surLeve)
    window.addEventListener('blur', relacher)
    return () => {
      document.removeEventListener('keydown', surBaisse)
      document.removeEventListener('keyup', surLeve)
      window.removeEventListener('blur', relacher)
    }
  }, [])

  useEffect(() => {
    curseur(curseurDe(tool))
  }, [tool])

  // Cliquer n'importe où hors du champ valide l'édition, et le clic n'a pas d'autre effet.
  const editionActive = editing !== null
  useEffect(() => {
    if (!editionActive) return
    const surClic = (event: PointerEvent) => {
      const champ = inputRef.current
      if (champ && event.target instanceof Node && champ.contains(event.target)) return
      event.stopPropagation()
      commitRef.current()
    }
    document.addEventListener('pointerdown', surClic, true)
    return () => document.removeEventListener('pointerdown', surClic, true)
  }, [editionActive])

  // La position de la souris, ramenée dans le repère du schéma : c'est elle que lit tout le reste.
  const pointDe = (event: ReactPointerEvent<HTMLCanvasElement>): Point => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return ecranVersSchema(vue, { x: event.clientX - rect.left, y: event.clientY - rect.top })
  }

  // La forme du dessus est la dernière de la liste.
  const formeSous = (point: Point): Shape | null => {
    for (let i = shapes.length - 1; i >= 0; i -= 1) {
      const shape = shapes[i]
      if (shape.type === 'arrow') continue
      const touchee = shape.type === 'text' ? toucheTexte(shape, point) : hitTest(shape, point)
      if (touchee) return shape
    }
    return null
  }

  // Une flèche se clique aussi, mais elle est traitée à part : sa géométrie se déduit des
  // formes qu'elle relie.
  const cibleSous = (point: Point): Shape | null =>
    flecheSous(shapes, point, vue.echelle) ?? formeSous(point)

  function handlePointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    // Espace enfoncé : on attrape la vue, pas le schéma.
    if (espace.current) {
      event.preventDefault()
      event.currentTarget.setPointerCapture(event.pointerId)
      deplacementVue.current = { x: event.clientX, y: event.clientY, vue }
      curseur('grabbing')
      return
    }

    const point = pointDe(event)

    if (tool === 'text') {
      // Sans cela, l'action par défaut du navigateur rendrait le focus au document et le
      // champ qui vient de s'ouvrir perdrait le clavier.
      event.preventDefault()
      onEdit({ kind: 'libre', id: null, point, value: '' })
      return
    }

    event.currentTarget.setPointerCapture(event.pointerId)

    if (tool === 'arrow') {
      const ancre = ancreSous(shapes, point, vue.echelle)
      if (!ancre) return
      // Repartir d'un point déjà occupé, c'est reprendre la flèche qui en part pour la
      // rebrancher ailleurs ; un point libre démarre une flèche neuve.
      const existante = shapes.find(
        (shape): shape is ArrowShape =>
          shape.type === 'arrow' &&
          shape.fromId === ancre.shape.id &&
          shape.fromSide === ancre.side,
      )
      setTrace({
        depart: { shapeId: ancre.shape.id, side: ancre.side },
        retouche: existante ? existante.id : null,
        curseur: point,
      })
      return
    }

    if (tool === 'select') {
      // Une poignée de la forme sélectionnée passe avant tout : on la tire au lieu de déplacer.
      const selectionnee = formeSeule()
      const poignee = poigneeSous(selectionnee, point, vue.echelle)
      if (poignee && selectionnee && isConnectable(selectionnee)) {
        redimension.current = { corner: poignee, origin: selectionnee }
        onGestureStart()
        curseur(curseurPoignee(poignee))
        return
      }
      const trouvee = cibleSous(point)
      if (event.shiftKey) {
        // Maj+clic ajoute l'élément à la sélection ou l'en retire, sans rien déplacer.
        if (trouvee) {
          onSelect(
            selectedIds.includes(trouvee.id)
              ? selectedIds.filter((id) => id !== trouvee.id)
              : [...selectedIds, trouvee.id],
          )
        }
        return
      }
      // Attraper un élément déjà sélectionné garde toute la sélection : on la déplace ensemble.
      const dejaChoisi = trouvee !== null && selectedIds.includes(trouvee.id)
      if (!dejaChoisi) onSelect(trouvee ? [trouvee.id] : [])
      // Une flèche ne se déplace pas : elle se rebranche, et seulement avec l'outil Flèche.
      if (trouvee && trouvee.type !== 'arrow') {
        const groupe = dejaChoisi ? selectedIds : [trouvee.id]
        const origins = shapes.filter((shape) => groupe.includes(shape.id) && shape.type !== 'arrow')
        deplacement.current = { start: point, origins, clic: trouvee.id, aBouge: false }
        onGestureStart()
        curseur('move')
      }
      return
    }

    const id = newId()
    dessin.current = { start: point, id }
    setDraft(shapeFromDrag(tool, id, point, point))
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (deplacementVue.current) {
      const { x, y, vue: depart } = deplacementVue.current
      onVueChange(deplacerVue(depart, event.clientX - x, event.clientY - y))
      return
    }

    const point = pointDe(event)

    if (trace) {
      setTrace({ ...trace, curseur: point })
      return
    }

    if (dessin.current) {
      setDraft(shapeFromDrag(tool, dessin.current.id, dessin.current.start, point))
      return
    }

    if (redimension.current) {
      const { corner, origin } = redimension.current
      onUpdate(resizeFrom(origin, corner, point))
      return
    }

    if (deplacement.current) {
      const { start, origins } = deplacement.current
      const dx = point.x - start.x
      const dy = point.y - start.y
      if (dx !== 0 || dy !== 0) deplacement.current.aBouge = true
      onMove(origins.map((origin) => moveBy(origin, dx, dy)))
      return
    }

    if (tool === 'select') {
      const poignee = poigneeSous(formeSeule(), point, vue.echelle)
      curseur(poignee ? curseurPoignee(poignee) : cibleSous(point) ? 'move' : 'default')
    }
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (deplacementVue.current) {
      deplacementVue.current = null
      curseur(espace.current ? 'grab' : curseurDe(tool))
      return
    }

    if (trace) {
      const cible = ancreSous(shapes, pointDe(event), vue.echelle)
      const source = trace.depart.shapeId
      if (cible && cible.shape.id !== source) {
        const ancienne = trace.retouche
          ? shapes.find((shape): shape is ArrowShape => shape.id === trace.retouche)
          : null
        if (trace.retouche && ancienne) {
          // Rebrancher : un seul bout change, l'autre reste où il est.
          if (ancienne.toId !== cible.shape.id) {
            onUpdate({ ...ancienne, fromId: cible.shape.id, fromSide: cible.side })
          }
        } else {
          onCreate({
            id: newId(),
            type: 'arrow',
            fromId: source,
            fromSide: trace.depart.side,
            toId: cible.shape.id,
            toSide: cible.side,
          })
        }
      }
      setTrace(null)
      curseur(curseurDe(tool))
      return
    }

    if (dessin.current && draft) {
      const boite = bounds(draft)
      if (boite.w * vue.echelle >= TAILLE_MIN && boite.h * vue.echelle >= TAILLE_MIN) onCreate(draft)
    }
    if (deplacement.current || redimension.current) onGestureEnd()
    // Un clic sans mouvement sur un élément d'un groupe réduit la sélection à cet élément.
    if (deplacement.current && !deplacement.current.aBouge && selectedIds.length > 1) {
      onSelect([deplacement.current.clic])
    }
    dessin.current = null
    deplacement.current = null
    redimension.current = null
    setDraft(null)
    curseur(curseurDe(tool))
  }

  // Double-clic sur une forme ou un texte : on ouvre son édition. Avec les outils Texte et
  // Flèche, le clic a déjà un autre rôle, on ne double-clique donc pas.
  function handleDoubleClick(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (tool === 'text' || tool === 'arrow') return
    const cible = formeSous(pointDe(event))
    if (!cible) return
    if (cible.type === 'text') {
      onEdit({ kind: 'libre', id: cible.id, point: { x: cible.x, y: cible.y }, value: cible.text })
    } else if (isConnectable(cible)) {
      onEdit({ kind: 'forme', shapeId: cible.id, value: cible.text?.text ?? '' })
    }
  }

  // Le champ est un élément HTML posé sur l'écran : sa position et sa police suivent la vue.
  function styleEditeur(): CSSProperties {
    if (!editing) return {}
    const e = vue.echelle
    const taille = FONT_SIZE * e
    if (editing.kind === 'libre') {
      return {
        left: editing.point.x * e + vue.x,
        top: editing.point.y * e + vue.y,
        fontSize: taille,
        textAlign: 'left',
      }
    }
    const forme = shapes.find((shape) => shape.id === editing.shapeId)
    if (!forme) return {}
    const largeur = innerWidth(forme)
    const centre = centerOf(forme)
    return {
      left: (centre.x - largeur / 2) * e + vue.x,
      top: (centre.y - lineHeight() / 2) * e + vue.y,
      width: largeur * e,
      fontSize: taille,
      textAlign: 'center',
    }
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        className="board__canvas"
        style={{ width: size.width, height: size.height }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={handleDoubleClick}
      />
      {editing && (
        <TextEditor
          inputRef={inputRef}
          style={styleEditeur()}
          value={editing.value}
          autoWidth={editing.kind === 'libre'}
          onChange={onChangeText}
          onCancel={onCancel}
        />
      )}
    </>
  )
}
