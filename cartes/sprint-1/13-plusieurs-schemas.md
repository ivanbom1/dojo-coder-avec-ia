# En tant qu'utilisateur, dans l'appli, quand j'ouvre la liste de mes schémas, je peux en créer un, le nommer et passer de l'un à l'autre

> Bonus

## Fonctionnel

- Une liste de mes schémas, chacun avec un nom.
- Je crée un schéma, je le renomme, je le supprime, j'en ouvre un autre.

## Critères d'acceptation

Sur http://localhost:5173, après `bun dev` :

- [ ] Je crée deux schémas différents, je passe de l'un à l'autre : chacun garde son contenu.
- [ ] Après un rechargement, je retrouve le dernier schéma ouvert.
- [ ] Ctrl+Z n'annule jamais une action faite dans un autre schéma.

## Indications techniques

- Au sprint 2, l'agent travaillera sur le schéma ouvert.

## Stratégie technique
