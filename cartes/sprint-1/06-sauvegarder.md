# En tant qu'utilisateur, dans le navigateur, quand je recharge la page, je retrouve mon schéma tel que je l'avais laissé

## Fonctionnel

- Le schéma est sauvegardé tout seul, sans bouton.
- Après un rechargement, ou si je ferme l'onglet et le rouvre, je retrouve mon schéma.

## Critères d'acceptation

Sur http://localhost:5173, après `bun dev` :

- [ ] Je dessine deux formes reliées par une flèche, avec un texte dans l'une d'elles, puis je
  recharge : tout est là.
- [ ] Après le rechargement, je déplace une forme : la flèche suit toujours.
- [ ] Je supprime tout et je recharge : le canevas reste vide.

## Indications techniques

- Le mode de sauvegarde est à toi de décider.

## Stratégie technique
