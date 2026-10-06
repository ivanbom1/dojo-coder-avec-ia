# En tant qu'utilisateur, dans le navigateur, quand mon outil est ouvert dans deux onglets, mon agent dessine sans que les onglets divergent

> Bonus

## Fonctionnel

- Avec deux onglets ouverts, ce que dessine l'agent n'est pas appliqué deux fois, et les deux
  onglets montrent le même schéma.

## Critères d'acceptation

Avec `bun dev` lancé et http://localhost:5173 ouvert dans deux onglets :

- [ ] L'agent dessine trois formes : les deux onglets montrent les trois mêmes formes, une
  seule fois chacune.
- [ ] « Qu'y a-t-il sur le canevas ? » donne une seule réponse cohérente.
- [ ] Je ferme un onglet : l'agent dessine toujours dans l'autre.

## Stratégie technique
