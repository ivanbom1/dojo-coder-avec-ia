# En tant qu'utilisateur, dans Claude Code, quand je demande à mon agent ce qu'il y a sur le canevas, il le sait, même pour ce que j'ai dessiné à la main

## Fonctionnel

- L'agent peut lire le schéma ouvert : les éléments, leurs textes, leurs positions et qui est
  relié à quoi.

## Critères d'acceptation

Avec `bun dev` lancé et http://localhost:5173 ouvert :

- [ ] Je dessine à la main deux formes « Client » et « Serveur », puis je demande « Qu'y
  a-t-il sur le canevas ? » : l'agent les décrit.
- [ ] Je déplace « Client » à la souris et je demande « Qu'est-ce qui a bougé ? » : il le
  sait.
- [ ] « Relie Client à Serveur » : la flèche relie bien mes deux formes.

## Stratégie technique
