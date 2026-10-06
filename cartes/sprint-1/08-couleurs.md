# En tant qu'utilisateur, sur le canevas, quand un élément est sélectionné, je peux changer sa couleur

> Bonus

## Fonctionnel

- Quand un élément est sélectionné, je choisis sa couleur de trait parmi quelques-unes, et
  pour une forme, sa couleur de fond.

## Visuels

![Le panneau de couleurs à côté d'une forme sélectionnée](visuels/08-couleurs.png)

<!-- Capture Excalidraw : un rectangle sélectionné, fond coloré, avec le panneau des couleurs
de trait et de fond ouvert à gauche. -->

## Critères d'acceptation

Sur http://localhost:5173, après `bun dev` :

- [ ] Je colorie une forme, une flèche et un texte : chacun garde sa couleur.
- [ ] Le texte dans une forme colorée reste lisible.
- [ ] Les couleurs survivent à un rechargement et s'annulent avec Ctrl+Z.

## Stratégie technique
