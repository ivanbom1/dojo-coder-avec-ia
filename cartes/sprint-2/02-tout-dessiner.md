# En tant qu'utilisateur, dans Claude Code, quand je demande à mon agent un schéma avec des formes, des textes et des flèches, il le dessine dans mon outil

## Fonctionnel

- L'agent sait dessiner tout ce que je dessine à la main : rectangles, ellipses, textes
  libres, textes dans les formes, flèches entre deux formes.

## Critères d'acceptation

Avec `bun dev` lancé et http://localhost:5173 ouvert :

- [ ] « Dessine un navigateur, un serveur et une base de données, reliés de gauche à
  droite » : trois formes nommées, deux flèches.
- [ ] Je déplace une forme à la souris : ses flèches suivent.
- [ ] Je double-clique sur un texte dessiné par l'agent : je peux le modifier.

## Stratégie technique
