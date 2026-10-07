# En tant qu'utilisateur, sur le canevas, quand je clique-glisse avec l'outil Rectangle ou Ellipse, la forme apparaît et je peux la déplacer

## Fonctionnel

- Une barre d'outils : Sélection, Rectangle, Ellipse.
- Avec Rectangle ou Ellipse, je dessine la forme en cliquant-glissant.
- Avec Sélection, je clique sur une forme pour la sélectionner, et je la fais glisser pour la
  déplacer.

## Critères d'acceptation

Sur http://localhost:5173, après `bun dev` :

- [ ] Je dessine en tirant dans tous les sens : la forme a la taille du geste.
- [ ] Un simple clic ne crée pas de forme.
- [ ] Une forme que je déplace suit la souris sans sauter.

## Indications techniques

- Le rendu et le modèle de données sont à toi de décider : toutes les cartes suivantes
  s'appuient dessus.

## Stratégie technique

- **Rendu** : canvas HTML5 pour les formes, DOM pour l'interface autour (élève)
- **Modèle de données** : un modèle par forme — rectangle `{ x, y, w, h }`, ellipse
  `{ cx, cy, rx, ry }` (élève)
- **Stockage** : une seule liste ordonnée `Shape[]`, union discriminée par le champ `type`
  (`RectShape | EllipseShape`), `id` unique par forme (élève)
- **Découpage du code** : `App` détient l'état (formes, outil courant, sélection) ; `Toolbar`,
  `Board` et un module `shape.ts` sont extraits (élève)
- **Barre d'outils** : panneau flottant centré en haut de l'écran, pas une barre fixe (élève)
- **Outil après dessin** : l'outil de forme reste actif après un dessin (élève)
- **Repère** : coordonnées dans celui du canvas ; position souris via `getBoundingClientRect` ;
  canvas mis à l'échelle par `devicePixelRatio` pour des traits nets (agent)
- **Rendu** : redessin complet de la scène à chaque changement, aperçu en direct pendant le
  glisser (agent)
- **Interaction** : `pointerdown/move/up` avec `setPointerCapture` ; un glisser de moins de
  quelques pixels ne crée rien (« un simple clic ne crée pas de forme ») ; rectangle normalisé
  à la création (coin haut-gauche, `w` et `h` positifs) (agent)
- **Détection du clic** : faite main ; rectangle = boîte englobante, ellipse = équation exacte ;
  la forme du dessus est la dernière de la liste (agent)
- **Sélection** : sélection unique (`selectedId`), clic dans le vide désélectionne ; curseur
  `crosshair` avec un outil de forme, `move` au survol d'une forme (agent)
- **Fichiers** : `src/shape.ts` (nouveau), `src/Toolbar.tsx` (nouveau), `src/Board.tsx`
  (nouveau), `src/App.tsx` (modifié), `src/index.css` (modifié)
