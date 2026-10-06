# En tant qu'utilisateur, sur le canevas, quand je fais glisser une poignée de la forme sélectionnée, la forme change de taille

> Bonus

## Fonctionnel

- Une forme sélectionnée affiche des poignées à ses coins.
- Je fais glisser une poignée pour redimensionner la forme.

## Visuels

![Un rectangle sélectionné avec ses poignées aux coins](visuels/09-redimensionner.png)

<!-- Capture Excalidraw : un rectangle sélectionné, poignées de redimensionnement visibles
aux coins. -->

## Critères d'acceptation

Sur http://localhost:5173, après `bun dev` :

- [ ] Les flèches reliées suivent le bord de la forme redimensionnée.
- [ ] Le texte de la forme reste centré.
- [ ] Je tire une poignée au-delà du coin opposé : la forme ne disparaît pas et reste
  manipulable.

## Stratégie technique
