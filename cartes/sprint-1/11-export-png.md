# En tant qu'utilisateur, dans la barre d'outils, quand je clique sur « Exporter en PNG », je télécharge mon schéma en image

> Bonus

## Fonctionnel

- Un bouton « Exporter en PNG » télécharge le schéma sous forme d'image.

## Critères d'acceptation

Sur http://localhost:5173, après `bun dev` :

- [ ] L'image contient toutes les formes, les textes et les flèches, sans la barre d'outils
  ni la sélection.
- [ ] Le schéma est cadré : pas de grand vide autour, rien de coupé.
- [ ] Sur un canevas vide, le bouton ne télécharge rien ou le dit.

## Stratégie technique
