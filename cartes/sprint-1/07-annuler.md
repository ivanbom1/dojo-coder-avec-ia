# En tant qu'utilisateur, sur le canevas, quand je fais Ctrl+Z, ma dernière action est annulée, et Ctrl+Maj+Z la rétablit

## Fonctionnel

- Ctrl+Z (Cmd+Z sur Mac) annule la dernière action : dessiner, écrire, relier, déplacer,
  supprimer.
- Ctrl+Maj+Z (Cmd+Maj+Z sur Mac) rétablit ce que je viens d'annuler.

## Critères d'acceptation

Sur http://localhost:5173, après `bun dev` :

- [ ] Je déplace une forme puis j'annule : elle revient d'un coup à sa place, pas pixel par
  pixel.
- [ ] Je supprime une forme reliée par des flèches puis j'annule : la forme et ses flèches
  reviennent.
- [ ] J'annule trois fois puis je rétablis trois fois : je retrouve mon schéma.

## Indications techniques

- Cette carte touche à tout ce qui précède : c'est le moment de vérifier que ton modèle de
  données tient.
- Au sprint 2, ce que dessine un agent devra aussi s'annuler.

## Stratégie technique
