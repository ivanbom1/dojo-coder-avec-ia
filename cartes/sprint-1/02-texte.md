# En tant qu'utilisateur, sur le canevas, quand je clique avec l'outil Texte ou double-clique sur une forme, je peux écrire un texte

## Fonctionnel

- Un outil Texte : je clique sur le canevas et je tape un texte libre.
- Un double-clic sur une forme me laisse écrire dans la forme. Le texte est centré et suit la
  forme quand je la déplace.
- Un double-clic sur un texte me permet de le modifier.

## Critères d'acceptation

Sur http://localhost:5173, après `bun dev` :

- [ ] J'écris un texte libre, puis un texte dans un rectangle : les deux restent affichés.
- [ ] Je déplace le rectangle : son texte reste centré dedans.
- [ ] Si je valide un texte vide, il ne reste rien sur le canevas.

## Indications techniques

- Un texte libre et un texte dans une forme ne sont pas forcément la même chose dans ton
  modèle de données : à toi de voir.

## Stratégie technique

- **Modèle de données** : un type `TextShape` s'ajoute à l'union `Shape` ; `RectShape` et
  `EllipseShape` portent un champ optionnel contenant un `TextShape` (avec ses propres
  `x, y`) (élève)
- **Texte libre** : posé avec un outil Texte (clic sur le canevas), pas par double-clic (élève)
- **Édition** : un `<textarea>` HTML posé sur le canvas pendant l'édition ; à la validation,
  le texte est rendu sur le canvas comme le reste (élève)
- **Touches** : `Entrée` insère un saut de ligne ; on valide en cliquant ailleurs ; `Échap`
  annule (élève)
- **Texte vide validé** : l'élément libre disparaît, ou le texte est retiré de la forme —
  dans tous les cas il ne reste rien du texte (élève)
- **Retour à la ligne** : automatique à la largeur de la forme, bloc centré (élève)
- **Texte embarqué** : un vrai `TextShape`, translaté du même vecteur que la forme pour rester
  centré (élève)
- **Ancrage** : `TextShape.x/y` = coin haut-gauche du bloc de texte (agent)
- **Centrage** : à la validation, on mesure le bloc et on pose le `TextShape` pour qu'il soit
  centré dans la boîte de la forme (agent)
- **Police** : 20 px, couleur `#1e1e1e`, police système ; rendu via `textAlign: center` et
  `textBaseline: middle`, une ligne par `fillText` (agent)
- **Texte libre** : pas de retour à la ligne automatique, faute de largeur de conteneur ; les
  lignes viennent des `Entrée` (agent)
- **Entrée en édition** : double-clic sur une forme → son texte embarqué, double-clic sur un
  `TextShape` → lui-même ; le `<textarea>` reprend la position et le style du texte (agent)
- **Hors périmètre** : le retour à la ligne n'est pas recalculé au redimensionnement de la
  forme (carte 09) (agent)
- **Fichiers** : `src/shape.ts` (modifié), `src/Board.tsx` (modifié), `src/Toolbar.tsx`
  (modifié), `src/App.tsx` (modifié), `src/index.css` (modifié)
