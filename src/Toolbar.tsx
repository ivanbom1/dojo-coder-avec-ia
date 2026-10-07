import { COULEURS_FOND, COULEURS_TRAIT, TRAIT_PAR_DEFAUT, type Couleur } from './couleurs'
import type { ConnectableShape, Shape, Tool } from './shape'

const OUTILS: { id: Tool; label: string; icone: string }[] = [
  { id: 'select', label: 'Sélection', icone: '↖' },
  { id: 'rect', label: 'Rectangle', icone: '▭' },
  { id: 'ellipse', label: 'Ellipse', icone: '◯' },
  { id: 'text', label: 'Texte', icone: 'T' },
  { id: 'arrow', label: 'Flèche', icone: '→' },
]

type Props = {
  tool: Tool
  onToolChange: (tool: Tool) => void
  // Les éléments sélectionnés : ce sont eux que les couleurs colorient.
  selection: Shape[]
  onStroke: (couleur: string | undefined) => void
  onFill: (couleur: string | undefined) => void
  onExport: () => void
}

type PaletteProps = {
  titre: string
  couleurs: Couleur[]
  courante: string | undefined | null
  onChoose: (couleur: string | undefined) => void
}

function Palette({ titre, couleurs, courante, onChoose }: PaletteProps) {
  return (
    <div className="palette" role="group" aria-label={titre}>
      <span className="palette__titre">{titre}</span>
      {couleurs.map((couleur) => {
        const actif = couleur.valeur === courante
        return (
          <button
            key={couleur.nom}
            type="button"
            className={actif ? 'pastille pastille--active' : 'pastille'}
            style={couleur.valeur ? { background: couleur.valeur } : undefined}
            aria-label={`${titre} ${couleur.nom}`}
            aria-pressed={actif}
            onClick={() => onChoose(couleur.valeur)}
          />
        )
      })}
    </div>
  )
}

// La couleur que partagent tous les éléments, ou `null` s'ils diffèrent : aucune pastille n'est
// alors marquée comme active.
function communeA(valeurs: (string | undefined)[]): string | undefined | null {
  return valeurs.every((valeur) => valeur === valeurs[0]) ? valeurs[0] : null
}

export default function Toolbar({
  tool,
  onToolChange,
  selection,
  onStroke,
  onFill,
  onExport,
}: Props) {
  // Seules les formes ont un fond : un texte ou une flèche n'a que sa couleur de trait.
  const formes = selection.filter(
    (shape): shape is ConnectableShape => shape.type === 'rect' || shape.type === 'ellipse',
  )
  return (
    <div className="panneau">
      <div className="tools" role="toolbar" aria-label="Outils">
        {OUTILS.map((outil) => {
          const actif = outil.id === tool
          return (
            <button
              key={outil.id}
              type="button"
              className={actif ? 'tool tool--active' : 'tool'}
              aria-pressed={actif}
              onClick={() => onToolChange(outil.id)}
            >
              <span className="tool__icone" aria-hidden="true">
                {outil.icone}
              </span>
              <span className="tool__label">{outil.label}</span>
            </button>
          )
        })}
        <span className="tools__separateur" aria-hidden="true" />
        <button type="button" className="tool" onClick={onExport}>
          <span className="tool__icone" aria-hidden="true">
            ⤓
          </span>
          <span className="tool__label">Exporter en PNG</span>
        </button>
      </div>
      {selection.length > 0 && (
        <div className="couleurs">
          <Palette
            titre="Trait"
            couleurs={COULEURS_TRAIT}
            courante={communeA(selection.map((shape) => shape.stroke ?? TRAIT_PAR_DEFAUT))}
            onChoose={onStroke}
          />
          {formes.length > 0 && (
            <Palette
              titre="Fond"
              couleurs={COULEURS_FOND}
              courante={communeA(formes.map((shape) => shape.fill))}
              onChoose={onFill}
            />
          )}
        </div>
      )}
    </div>
  )
}
