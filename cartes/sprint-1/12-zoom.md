# En tant qu'utilisateur, sur le canevas, quand j'utilise la molette, je zoome et je me déplace dans mon schéma

> Bonus

## Fonctionnel

- Ctrl+molette (pinch sur un pavé tactile) zoome vers le pointeur.
- La molette, ou un glisser avec Espace enfoncé, déplace la vue.
- Le niveau de zoom est affiché, avec un bouton pour revenir à 100 %.

## Critères d'acceptation

Sur http://localhost:5173, après `bun dev` :

- [ ] Après un zoom et un déplacement, je dessine une forme : elle apparaît sous la souris.
- [ ] Je déplace une forme et je relie deux formes, zoomé : tout se passe sous la souris.
- [ ] Le zoom ne change pas le schéma : après un rechargement, les formes n'ont pas bougé.

## Stratégie technique
