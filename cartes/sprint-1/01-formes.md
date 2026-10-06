# En tant qu'utilisateur, sur le canevas, quand je clique-glisse avec l'outil Rectangle ou Ellipse, la forme apparaît et je peux la déplacer

## Fonctionnel

- Une barre d'outils : Sélection, Rectangle, Ellipse.
- Avec Rectangle ou Ellipse, je dessine la forme en cliquant-glissant.
- Avec Sélection, je clique sur une forme pour la sélectionner, et je la fais glisser pour la
  déplacer.

## Visuels

![Deux rectangles et une ellipse, l'ellipse sélectionnée](visuels/01-formes.png)

<!-- Capture Excalidraw : barre d'outils, deux rectangles et une ellipse sélectionnée. -->

## Critères d'acceptation

Sur http://localhost:5173, après `bun dev` :

- [ ] Je dessine en tirant dans tous les sens : la forme a la taille du geste.
- [ ] Un simple clic ne crée pas de forme.
- [ ] Une forme que je déplace suit la souris sans sauter.

## Indications techniques

- Le rendu et le modèle de données sont à toi de décider : toutes les cartes suivantes
  s'appuient dessus.

## Stratégie technique
