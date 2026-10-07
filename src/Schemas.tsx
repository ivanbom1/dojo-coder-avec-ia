import { useEffect, useRef, useState } from 'react'
import { NOM_MAX, type EntreeSchema } from './schema'

type Props = {
  schemas: EntreeSchema[]
  ouvert: string
  onOpen: (id: string) => void
  // Crée un schéma, l'ouvre, et renvoie son id : on met aussitôt son nom en édition.
  onCreate: () => string
  onRename: (id: string, nom: string) => void
  onDelete: (id: string) => void
}

type ChampProps = { valeur: string; onValider: (nom: string) => void; onAnnuler: () => void }

// Le nom en cours d'édition : Entrée valide, Échap garde l'ancien nom, cliquer ailleurs valide.
function ChampNom({ valeur, onValider, onAnnuler }: ChampProps) {
  const champ = useRef<HTMLInputElement>(null)
  const [texte, setTexte] = useState(valeur)
  const termine = useRef(false)

  useEffect(() => {
    champ.current?.focus()
    champ.current?.select()
  }, [])

  const valider = () => {
    if (termine.current) return
    termine.current = true
    onValider(texte)
  }

  return (
    <input
      ref={champ}
      className="schemas__champ"
      value={texte}
      maxLength={NOM_MAX}
      aria-label="Nom du schéma"
      onChange={(event) => setTexte(event.target.value)}
      onBlur={valider}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          valider()
        } else if (event.key === 'Escape') {
          // Échap ne ferme que le champ, pas le panneau.
          event.stopPropagation()
          termine.current = true
          onAnnuler()
        }
      }}
    />
  )
}

export default function Schemas({ schemas, ouvert, onOpen, onCreate, onRename, onDelete }: Props) {
  const [panneauOuvert, setPanneauOuvert] = useState(false)
  const [enRenommage, setEnRenommage] = useState<string | null>(null)
  const [aSupprimer, setASupprimer] = useState<string | null>(null)
  const racine = useRef<HTMLDivElement>(null)
  const courant = schemas.find((schema) => schema.id === ouvert)

  // Le panneau se ferme quand on clique ailleurs ou qu'on appuie sur Échap.
  useEffect(() => {
    if (!panneauOuvert) return
    const fermer = () => {
      setPanneauOuvert(false)
      setEnRenommage(null)
      setASupprimer(null)
    }
    const surClic = (event: PointerEvent) => {
      if (racine.current && event.target instanceof Node && !racine.current.contains(event.target)) {
        fermer()
      }
    }
    const surTouche = (event: KeyboardEvent) => {
      if (event.key === 'Escape') fermer()
    }
    document.addEventListener('pointerdown', surClic)
    document.addEventListener('keydown', surTouche)
    return () => {
      document.removeEventListener('pointerdown', surClic)
      document.removeEventListener('keydown', surTouche)
    }
  }, [panneauOuvert])

  return (
    <div className="schemas" ref={racine}>
      <button
        type="button"
        className="schemas__bouton"
        aria-haspopup="true"
        aria-expanded={panneauOuvert}
        title="Mes schémas"
        onClick={() => setPanneauOuvert((ouvertAvant) => !ouvertAvant)}
      >
        <span className="schemas__courant">{courant?.nom}</span>
        <span aria-hidden="true"> ▾</span>
      </button>

      {panneauOuvert && (
        <div className="schemas__panneau" aria-label="Mes schémas">
          <ul className="schemas__liste">
            {schemas.map((schema) => (
              <li key={schema.id} className="schemas__ligne">
                {enRenommage === schema.id ? (
                  <ChampNom
                    valeur={schema.nom}
                    onValider={(nom) => {
                      onRename(schema.id, nom)
                      setEnRenommage(null)
                    }}
                    onAnnuler={() => setEnRenommage(null)}
                  />
                ) : (
                  <button
                    type="button"
                    className={
                      schema.id === ouvert ? 'schemas__nom schemas__nom--ouvert' : 'schemas__nom'
                    }
                    aria-current={schema.id === ouvert}
                    onClick={() => onOpen(schema.id)}
                    onDoubleClick={() => setEnRenommage(schema.id)}
                  >
                    {schema.nom}
                  </button>
                )}

                {aSupprimer === schema.id ? (
                  <span className="schemas__confirmation">
                    Supprimer ?
                    <button
                      type="button"
                      onClick={() => {
                        onDelete(schema.id)
                        setASupprimer(null)
                      }}
                    >
                      Oui, supprimer
                    </button>
                    <button type="button" onClick={() => setASupprimer(null)}>
                      Non
                    </button>
                  </span>
                ) : (
                  <>
                    <button
                      type="button"
                      className="schemas__action"
                      aria-label={`Renommer ${schema.nom}`}
                      onClick={() => setEnRenommage(schema.id)}
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      className="schemas__action"
                      aria-label={`Supprimer ${schema.nom}`}
                      onClick={() => setASupprimer(schema.id)}
                    >
                      ×
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="schemas__nouveau"
            onClick={() => setEnRenommage(onCreate())}
          >
            Nouveau schéma
          </button>
        </div>
      )}
    </div>
  )
}
