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
