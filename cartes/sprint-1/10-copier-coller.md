# En tant qu'utilisateur, sur le canevas, quand je sélectionne plusieurs éléments, je peux les déplacer ensemble et les copier-coller

> Bonus

## Fonctionnel

- Maj+clic ajoute un élément à la sélection, ou l'en retire.
- Je déplace tous les éléments sélectionnés d'un coup.
- Ctrl+C puis Ctrl+V (Cmd sur Mac) duplique la sélection, un peu décalée.

## Critères d'acceptation

Sur http://localhost:5173, après `bun dev` :

- [ ] Je copie-colle deux formes reliées par une flèche : la copie a sa propre flèche, reliée
  aux formes copiées.
- [ ] Je déplace la copie : l'original ne bouge pas.
- [ ] Un collage s'annule en un seul Ctrl+Z.

## Stratégie technique

- **Modèle de la sélection** : une liste d'ids dans l'état de `App` (`selectedIds`), hors des
  formes : elle n'est ni enregistrée ni dans l'historique d'annulation, comme la sélection
  d'aujourd'hui. Les poignées de redimensionnement ne s'affichent que pour une seule forme
  sélectionnée ; les couleurs et Suppr s'appliquent à tous les éléments sélectionnés (élève).
- **Presse-papiers** : la mémoire de l'appli, pas le presse-papiers du navigateur ; la copie ne
  survit pas à un rechargement (élève).
- **Après un collage** : les copies deviennent la sélection, et chaque Ctrl+V suivant les décale de
  20 px de plus pour qu'elles ne s'empilent pas (élève).
- **Maj+clic** : ajoute l'élément cliqué à la sélection, ou l'en retire ; il ne démarre pas de
  déplacement. Un clic sans Maj sur un élément déjà sélectionné garde la sélection pour tout
  déplacer ensemble ; s'il n'y a pas eu de mouvement, la sélection se réduit à cet élément
  (agent).
- **Déplacement groupé** : tous les éléments sélectionnés qui ont une géométrie bougent du même
  vecteur, en un seul pas d'annulation ; les flèches suivent parce qu'elles se déduisent des
  formes (agent).
- **Ce qui est copié** : les formes et textes sélectionnés, et les flèches dont les **deux** bouts
  sont dans la sélection, qu'elles soient sélectionnées ou non. Une flèche seule n'est pas
  copiée : elle ne relierait rien (agent).
- **Collage** : chaque forme copiée reçoit un nouvel id, y compris le texte qu'elle porte ; chaque
  flèche copiée pointe sur les copies, pas sur les originaux. Les copies s'ajoutent au-dessus, en
  un seul pas d'annulation (agent).
- **Raccourcis** : Ctrl+C / Cmd+C et Ctrl+V / Cmd+V ; pendant l'écriture d'un texte, le champ garde
  ces touches (agent).
- **Découpage** : les deux calculs purs — ce qu'une copie emporte, et les copies décalées aux
  nouveaux ids — vont dans `src/shape.ts`, avec les autres calculs sur les formes (agent).
- **Fichiers** : `src/shape.ts`, `src/App.tsx`, `src/Board.tsx`, `src/Toolbar.tsx`,
  `tests/parcours.spec.ts`.
