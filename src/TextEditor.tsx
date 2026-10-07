import { useEffect, type CSSProperties, type RefObject } from 'react'

type Props = {
  inputRef: RefObject<HTMLTextAreaElement | null>
  style: CSSProperties
  value: string
  autoWidth: boolean
  onChange: (value: string) => void
  onCancel: () => void
}

// Le textarea HTML posé sur le canvas pendant l'édition : on hérite du curseur, de la
// sélection et du copier-coller sans rien coder.
export default function TextEditor({ inputRef, style, value, autoWidth, onChange, onCancel }: Props) {
  useEffect(() => {
    const champ = inputRef.current
    if (!champ) return
    const placerLeCurseur = () => {
      champ.focus()
      champ.setSelectionRange(champ.value.length, champ.value.length)
    }
    placerLeCurseur()
    // Filet de sécurité : si l'action par défaut du clic a repris le focus, on le reprend.
    const frame = requestAnimationFrame(() => {
      if (document.activeElement !== champ) placerLeCurseur()
    })
    return () => cancelAnimationFrame(frame)
  }, [inputRef])

  // Le champ prend la taille de son contenu : le texte ne bouge donc pas à la validation.
  useEffect(() => {
    const champ = inputRef.current
    if (!champ) return
    champ.style.height = '0px'
    champ.style.height = `${champ.scrollHeight}px`
    if (autoWidth) {
      champ.style.width = '0px'
      champ.style.width = `${champ.scrollWidth}px`
    }
  }, [value, autoWidth, inputRef, style.fontSize])

  return (
    <textarea
      ref={inputRef}
      className={autoWidth ? 'text-editor' : 'text-editor text-editor--wrap'}
      style={style}
      rows={1}
      value={value}
      spellCheck={false}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault()
          onCancel()
        }
      }}
    />
  )
}
