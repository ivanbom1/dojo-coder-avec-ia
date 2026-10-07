import { useEffect, useRef, useState, type CSSProperties } from 'react'
import Board, { type Edition } from './Board'
import Toolbar from './Toolbar'
import {
  aCopier,
  centerOf,
  dupliquer,
  innerWidth,
  isConnectable,
  newId,
  reprendreLeCompteur,
  type Shape,
  type TextShape,
  type Tool,
} from './shape'
import {
  HISTORIQUE_VIDE,
  annuler,
  debutGeste,
  etatInitial,
  finGeste,
  modifier,
  retablir,
} from './history'
import { exporterPng } from './export'
import Schemas from './Schemas'
import {
  NOM_MAX,
  ecrireHistorique,
  ecrireIndex,
  ecrireSchema,
  lireHistorique,
  lireIndex,
  lireSchema,
  nouvelId,
  supprimerDuStockage,
  type EntreeSchema,
  type Index,
} from './schema'
import { layoutText } from './text'
import { VUE_INITIALE, fixerEchelle, type Vue } from './vue'

// Vrai quand la touche est tapée dans un champ de saisie : c'est alors le champ qui la garde.
function dansUnChamp(event: KeyboardEvent): boolean {
  const cible = event.target
  return cible instanceof HTMLElement && (cible.tagName === 'INPUT' || cible.tagName === 'TEXTAREA')
}

// De combien chaque collage décale les copies, en pixels.
const DECALAGE_COLLAGE = 20

// Pause avant d'écrire : pendant un glisser, la forme change à chaque déplacement de souris.
const DELAI_SAUVEGARDE = 300

const MESSAGE_SCHEMA_ILLISIBLE =
  'Le schéma enregistré était illisible : il a été mis de côté et le canevas repart à vide.'

// Lit un schéma et son historique. Sans schéma lisible, l'historique n'aurait rien à défaire : il
// repart vide. Le compteur d'ids dépasse ceux des formes et de l'historique : annuler une
// suppression ramène une forme dont l'id ne doit pas avoir été repris entre-temps.
function chargerSchema(id: string) {
  const lecture = lireSchema(id)
  const historique = lecture.etat === 'ok' ? lireHistorique(id) : HISTORIQUE_VIDE
  if (lecture.etat === 'ok') {
    reprendreLeCompteur([...lecture.shapes, ...historique.passe.flat(), ...historique.futur.flat()])
  }
  return { lecture, historique }
}

// Le premier nom libre de la forme « Schéma N ».
function nomLibre(schemas: EntreeSchema[]): string {
  const pris = new Set(schemas.map((schema) => schema.nom))
  let numero = schemas.length + 1
  while (pris.has(`Schéma ${numero}`)) numero += 1
  return `Schéma ${numero}`
}

export default function App() {
  // L'index, le schéma ouvert et son historique sont lus une fois, avant le premier rendu : ils
  // sont là dès la première image.
  const [chargement] = useState(() => {
    const { index, message } = lireIndex()
    return { index, message, ...chargerSchema(index.ouvert) }
  })
  const [index, setIndex] = useState<Index>(chargement.index)

  const [tool, setTool] = useState<Tool>('select')
  const [etat, setEtat] = useState(() =>
    etatInitial(
      chargement.lecture.etat === 'ok' ? chargement.lecture.shapes : [],
      chargement.historique,
    ),
  )
  const { shapes } = etat
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  // La vue (zoom et position) n'est ni enregistrée ni dans l'historique : un rechargement la remet
  // à 100 %, à l'origine.
  const [vue, setVue] = useState<Vue>(VUE_INITIALE)
  const plateauRef = useRef<HTMLElement>(null)
  const [editing, setEditing] = useState<Edition | null>(null)
  // Le bandeau en bas du plateau : une information refermable, jamais enregistrée.
  const [message, setMessage] = useState<string | null>(
    chargement.message ?? (chargement.lecture.etat === 'illisible' ? MESSAGE_SCHEMA_ILLISIBLE : null),
  )

  // Tout changement des formes passe par `changer` : c'est lui qui compte un pas d'annulation.
  const changer = (changement: (precedentes: Shape[]) => Shape[]) =>
    setEtat((courant) => modifier(courant, changement))
  const creer = (shape: Shape) => changer((precedentes) => [...precedentes, shape])
  const mettreAJour = (shape: Shape) =>
    changer((precedentes) => precedentes.map((s) => (s.id === shape.id ? shape : s)))
  const deplacer = (nouvelles: Shape[]) =>
    changer((precedentes) => precedentes.map((s) => nouvelles.find((n) => n.id === s.id) ?? s))

  // Valide l'édition en cours : un texte vide ne laisse rien derrière lui.
  function valider() {
    const edition = editing
    if (!edition) return
    setEditing(null)

    const vide = edition.value.trim() === ''

    if (edition.kind === 'libre') {
      if (edition.id) {
        changer((precedentes) =>
          vide
            ? precedentes.filter((s) => s.id !== edition.id)
            : precedentes.map((s) =>
                s.id === edition.id && s.type === 'text' ? { ...s, text: edition.value } : s,
              ),
        )
        if (vide) setSelectedIds((ids) => ids.filter((id) => id !== edition.id))
      } else if (!vide) {
        const texte: TextShape = {
          id: newId(),
          type: 'text',
          x: edition.point.x,
          y: edition.point.y,
          text: edition.value,
        }
        creer(texte)
      }
      return
    }

    changer((precedentes) =>
      precedentes.map((forme) => {
        if (forme.id !== edition.shapeId || !isConnectable(forme)) return forme
        if (vide) {
          const copie = { ...forme }
          delete copie.text
          return copie
        }
        const block = layoutText(edition.value, innerWidth(forme))
        const centre = centerOf(forme)
        const texte: TextShape = {
          id: forme.text?.id ?? newId(),
          type: 'text',
          x: centre.x - block.width / 2,
          y: centre.y - block.height / 2,
          text: edition.value,
        }
        return { ...forme, text: texte }
      }),
    )
  }

  // Revient à 100 % autour du milieu du plateau : ce qui s'y trouve y reste.
  function revenirA100() {
    const plateau = plateauRef.current
    const milieu = { x: (plateau?.clientWidth ?? 0) / 2, y: (plateau?.clientHeight ?? 0) / 2 }
    setVue((courante) => fixerEchelle(courante, milieu, 1))
  }

  // La grille de fond suit la vue : sa taille et sa position. Trop serrée, elle disparaît.
  const pasDeGrille = 20 * vue.echelle
  const styleDuPlateau = {
    '--pas': `${pasDeGrille}px`,
    '--gx': `${vue.x}px`,
    '--gy': `${vue.y}px`,
    ...(pasDeGrille < 8 ? { backgroundImage: 'none' } : {}),
  } as CSSProperties

  function exporter() {
    if (!exporterPng(shapes)) setMessage('Le schéma est vide : rien à exporter.')
  }

  function changerOutil(nouvelOutil: Tool) {
    valider()
    setTool(nouvelOutil)
  }

  // Colorie les éléments sélectionnés. Le fond n'existe que pour les formes ; un choix identique à
  // la couleur actuelle ne compte pas comme un pas d'annulation.
  const selection = shapes.filter((s) => selectedIds.includes(s.id))
  function colorier(propriete: 'stroke' | 'fill', couleur: string | undefined) {
    if (selectedIds.length === 0) return
    changer((precedentes) =>
      precedentes.map((s) => {
        if (!selectedIds.includes(s.id)) return s
        if (propriete === 'stroke') return { ...s, stroke: couleur }
        return s.type === 'rect' || s.type === 'ellipse' ? { ...s, fill: couleur } : s
      }),
    )
  }

  // Retient la liste et le schéma ouvert, tout de suite.
  function appliquerIndex(suivant: Index) {
    setIndex(suivant)
    ecrireIndex(suivant)
  }

  // Ouvre un schéma : ses formes et son historique prennent la place de ceux de l'ancien, ensemble,
  // pour que Ctrl+Z ne défasse jamais l'action d'un autre schéma. Ce qui appartenait à l'ancien
  // (sélection, texte en cours, vue) est remis à zéro ; le presse-papiers est gardé.
  function charger(id: string, suivant: Index) {
    const { lecture, historique } = chargerSchema(id)
    const nouvelEtat = etatInitial(lecture.etat === 'ok' ? lecture.shapes : [], historique)
    etatRef.current = nouvelEtat
    ouvertRef.current = id
    setEtat(nouvelEtat)
    appliquerIndex(suivant)
    setSelectedIds([])
    setEditing(null)
    setVue(VUE_INITIALE)
    if (lecture.etat === 'illisible') setMessage(MESSAGE_SCHEMA_ILLISIBLE)
  }

  function ouvrirSchema(id: string) {
    if (id === index.ouvert) return
    // Quitter un schéma l'enregistre tout de suite, sans attendre la pause.
    sauvegarder(index.ouvert, etatRef.current)
    charger(id, { ...index, ouvert: id })
  }

  function creerSchema(): string {
    sauvegarder(index.ouvert, etatRef.current)
    const id = nouvelId()
    ecrireSchema(id, [])
    charger(id, {
      ouvert: id,
      schemas: [...index.schemas, { id, nom: nomLibre(index.schemas) }],
    })
    return id
  }

  // Un nom vide garde l'ancien.
  function renommerSchema(id: string, nom: string) {
    const propre = nom.trim().slice(0, NOM_MAX)
    if (propre === '') return
    appliquerIndex({
      ...index,
      schemas: index.schemas.map((schema) => (schema.id === id ? { ...schema, nom: propre } : schema)),
    })
  }

  // Supprimer un schéma emporte ses formes et son historique. Si c'était le schéma ouvert, celui
  // juste au-dessus dans la liste s'ouvre ; s'il n'en reste aucun, un « Schéma 1 » vide le remplace.
  function supprimerSchema(id: string) {
    const position = index.schemas.findIndex((schema) => schema.id === id)
    const restants = index.schemas.filter((schema) => schema.id !== id)
    supprimerDuStockage(id)
    if (id !== index.ouvert) {
      appliquerIndex({ ...index, schemas: restants })
      return
    }
    if (restants.length === 0) {
      const neuf = nouvelId()
      ecrireSchema(neuf, [])
      charger(neuf, { ouvert: neuf, schemas: [{ id: neuf, nom: 'Schéma 1' }] })
      return
    }
    const voisin = restants[Math.max(position - 1, 0)]
    charger(voisin.id, { ouvert: voisin.id, schemas: restants })
  }

  // Supprimer une forme emporte les flèches qui y sont reliées : sans elle, elles n'auraient
  // plus rien à relier.
  function supprimer(ids: string[]) {
    changer((precedentes) =>
      precedentes.filter((s) => {
        if (ids.includes(s.id)) return false
        if (s.type === 'arrow') return !ids.includes(s.fromId) && !ids.includes(s.toId)
        return true
      }),
    )
    setSelectedIds((selection) => selection.filter((id) => !ids.includes(id)))
  }

  // Sauvegarde automatique : on écrit après une courte pause, et tout de suite si l'onglet
  // passe en arrière-plan ou se ferme, pour ne pas perdre la dernière modification.
  const etatRef = useRef(etat)
  etatRef.current = etat
  // Le schéma ouvert et son état changent toujours ensemble : on n'écrit jamais l'un sous l'id de
  // l'autre.
  const ouvertRef = useRef(index.ouvert)
  ouvertRef.current = index.ouvert

  // Le schéma et son historique s'écrivent ensemble, au même rythme.
  const sauvegarder = (id: string, courant: typeof etat) => {
    ecrireSchema(id, courant.shapes)
    ecrireHistorique(id, courant)
  }

  useEffect(() => {
    const minuteur = setTimeout(() => sauvegarder(index.ouvert, etat), DELAI_SAUVEGARDE)
    return () => clearTimeout(minuteur)
  }, [etat, index.ouvert])

  useEffect(() => {
    const toutDeSuite = () => sauvegarder(ouvertRef.current, etatRef.current)
    const surVisibilite = () => {
      if (document.hidden) toutDeSuite()
    }
    document.addEventListener('visibilitychange', surVisibilite)
    window.addEventListener('pagehide', toutDeSuite)
    return () => {
      document.removeEventListener('visibilitychange', surVisibilite)
      window.removeEventListener('pagehide', toutDeSuite)
    }
  }, [])

  // Suppr efface les éléments sélectionnés. On laisse le clavier au champ d'édition quand il est
  // ouvert : là, Suppr doit effacer un caractère, pas la forme.
  useEffect(() => {
    const surTouche = (event: KeyboardEvent) => {
      if (event.key !== 'Delete' || selectedIds.length === 0 || editing !== null) return
      const cible = event.target
      if (
        cible instanceof HTMLElement &&
        (cible.tagName === 'INPUT' || cible.tagName === 'TEXTAREA' || cible.isContentEditable)
      ) {
        return
      }
      supprimer(selectedIds)
    }
    document.addEventListener('keydown', surTouche)
    return () => document.removeEventListener('keydown', surTouche)
  }, [selectedIds, editing])

  // Ctrl+Z annule, Ctrl+Maj+Z rétablit (Cmd sur Mac). Tant qu'un champ de texte ou de nom est ouvert,
  // il garde ces touches pour ses lettres.
  useEffect(() => {
    const surTouche = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.altKey || event.key.toLowerCase() !== 'z') return
      if (editing !== null || dansUnChamp(event)) return
      event.preventDefault()
      const courant = etatRef.current
      const suivant = event.shiftKey ? retablir(courant) : annuler(courant)
      if (suivant === courant) return
      etatRef.current = suivant
      setEtat(suivant)
      // Ce qui existe encore reste sélectionné, le reste s'efface de la sélection.
      setSelectedIds((ids) => ids.filter((id) => suivant.shapes.some((s) => s.id === id)))
    }
    document.addEventListener('keydown', surTouche)
    return () => document.removeEventListener('keydown', surTouche)
  }, [editing])

  // Ctrl+C copie la sélection dans la mémoire de l'appli, Ctrl+V la colle un peu décalée : chaque
  // collage d'affilée décale de plus, pour que les copies ne s'empilent pas. Pendant l'écriture
  // d'un texte, le champ garde ces touches.
  const presse = useRef<Shape[]>([])
  const collages = useRef(0)
  useEffect(() => {
    const surTouche = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.altKey || event.shiftKey) return
      const touche = event.key.toLowerCase()
      if ((touche !== 'c' && touche !== 'v') || editing !== null || dansUnChamp(event)) return

      if (touche === 'c') {
        const copie = aCopier(etatRef.current.shapes, selectedIds)
        if (copie.length === 0) return
        event.preventDefault()
        presse.current = copie
        collages.current = 0
        return
      }

      if (presse.current.length === 0 || etatRef.current.geste !== null) return
      event.preventDefault()
      collages.current += 1
      const decalage = DECALAGE_COLLAGE * collages.current
      const copies = dupliquer(presse.current, decalage, decalage)
      changer((precedentes) => [...precedentes, ...copies])
      setSelectedIds(copies.map((copie) => copie.id))
    }
    document.addEventListener('keydown', surTouche)
    return () => document.removeEventListener('keydown', surTouche)
  }, [selectedIds, editing])

  return (
    <main className="app">
      <Toolbar
        tool={tool}
        onToolChange={changerOutil}
        selection={selection}
        onStroke={(couleur) => colorier('stroke', couleur)}
        onFill={(couleur) => colorier('fill', couleur)}
        onExport={exporter}
      />
      <header className="toolbar">
        <h1>Croquis</h1>
        <Schemas
          schemas={index.schemas}
          ouvert={index.ouvert}
          onOpen={ouvrirSchema}
          onCreate={creerSchema}
          onRename={renommerSchema}
          onDelete={supprimerSchema}
        />
      </header>
      <section ref={plateauRef} className="board" style={styleDuPlateau} aria-label="Zone de dessin">
        <button
          type="button"
          className="zoom"
          onClick={revenirA100}
          aria-label="Revenir à 100 %"
          title="Revenir à 100 %"
        >
          {Math.round(vue.echelle * 100)} %
        </button>
        {message !== null && (
          <p className="avertissement" role="status">
            {message}
            <button
              type="button"
              className="avertissement__fermer"
              onClick={() => setMessage(null)}
              aria-label="Fermer le message"
            >
              ×
            </button>
          </p>
        )}
        <Board
          shapes={shapes}
          tool={tool}
          selectedIds={selectedIds}
          editing={editing}
          vue={vue}
          onVueChange={setVue}
          onCreate={creer}
          onUpdate={mettreAJour}
          onGestureStart={() => setEtat(debutGeste)}
          onGestureEnd={() => setEtat(finGeste)}
          onSelect={setSelectedIds}
          onMove={deplacer}
          onEdit={setEditing}
          onChangeText={(value) => setEditing((edition) => (edition ? { ...edition, value } : edition))}
          onCommit={valider}
          onCancel={() => setEditing(null)}
        />
      </section>
    </main>
  )
}
