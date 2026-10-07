# En tant qu'utilisateur, sur le canevas, quand je fais glisser une poignée de la forme sélectionnée, la forme change de taille

> Bonus

## Fonctionnel

- Une forme sélectionnée affiche des poignées à ses coins.
- Je fais glisser une poignée pour redimensionner la forme.

## Critères d'acceptation

Sur http://localhost:5173, après `bun dev` :

- [ ] Les flèches reliées suivent le bord de la forme redimensionnée.
- [ ] Le texte de la forme reste centré.
- [ ] Je tire une poignée au-delà du coin opposé : la forme ne disparaît pas et reste
  manipulable.

## Stratégie technique

- **Au-delà du coin opposé** : la forme s'arrête à une taille minimale et ne suit plus la souris
  tant qu'on n'est pas revenu en deçà ; elle ne se retourne pas (élève).
- **Forme plus petite que son texte** : le texte reste centré et déborde de la forme, rien ne
  bloque le rétrécissement (élève).
- **Découpage** : des fonctions pures dans `src/shape.ts`, à côté de `moveBy` (les poignées d'une
  forme, la nouvelle taille d'après le coin et la souris, le texte recentré) ; `Board.tsx`
  dessine les poignées et écoute la souris. Le modèle ne change pas : un rectangle garde
  `x, y, w, h`, une ellipse `cx, cy, rx, ry`, et les poignées se calculent depuis la boîte, elles
  ne sont jamais stockées (élève).
- **Poignées** : quatre, aux coins de la boîte, petits carrés ; visibles seulement pour un
  rectangle ou une ellipse sélectionné avec l'outil Sélection ; pas de poignées sur un texte libre
  ni sur une flèche (agent).
- **Geste** : le coin opposé reste fixe ; une poignée est testée avant le corps de la forme, pour
  qu'un clic dessus redimensionne au lieu de déplacer ; le curseur devient `nwse-resize` ou
  `nesw-resize` au survol (agent).
- **Taille minimale** : 10 px de large et de haut ; en dessous, la forme ne rétrécit plus (agent).
- **Flèches** : rien à faire, elles ne gardent que le côté d'ancrage et se recalculent depuis la
  boîte (agent).
- **Texte de la forme** : à chaque mouvement de poignée, son `x, y` est recalculé pour qu'il reste
  centré sur le nouveau centre, avec le retour à la ligne de la nouvelle largeur (agent).
- **Annulation** : un glisser de poignée est un seul pas, comme un déplacement, grâce à
  `onGestureStart` / `onGestureEnd` ; la sauvegarde suit comme pour tout changement (agent).
- **Tests** : un test par critère d'acceptation, plus un annuler d'un coup ; la suite entière
  relancée avant de conclure (agent).
- **Fichiers** : `src/shape.ts`, `src/Board.tsx`, `tests/parcours.spec.ts`.
