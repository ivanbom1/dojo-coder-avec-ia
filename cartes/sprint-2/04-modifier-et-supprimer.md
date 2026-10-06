# En tant qu'utilisateur, dans Claude Code, quand je demande à mon agent de modifier mon schéma, il déplace, renomme ou supprime ce que je lui dis

## Fonctionnel

- L'agent sait déplacer un élément, changer un texte, supprimer un élément et tout effacer.

## Critères d'acceptation

Avec `bun dev` lancé et http://localhost:5173 ouvert, sur un schéma de trois formes reliées :

- [ ] « Mets la base de données sous le serveur » : elle bouge, les flèches suivent.
- [ ] « Renomme Serveur en API » : seul ce texte change.
- [ ] « Supprime le navigateur » : la forme et ses flèches disparaissent.
- [ ] « Efface tout » : le canevas est vide.

## Stratégie technique
