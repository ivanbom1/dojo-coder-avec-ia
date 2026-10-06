# En tant qu'utilisateur, sur le canevas, quand mon agent a dessiné, je recharge ou je fais Ctrl+Z comme si j'avais dessiné moi-même

## Fonctionnel

- Ce que dessine l'agent est sauvegardé, comme ce que je dessine.
- Ctrl+Z annule ce qu'a fait l'agent, et Ctrl+Maj+Z le rétablit.

## Critères d'acceptation

Avec `bun dev` lancé et http://localhost:5173 ouvert :

- [ ] L'agent dessine trois formes reliées, je recharge : tout est là.
- [ ] Ctrl+Z annule la dernière modification de l'agent, pas tout le schéma d'un coup.
- [ ] Je dessine à la main après l'agent : Ctrl+Z annule d'abord mon dessin, puis le sien.
- [ ] Les tests du sprint 1 passent toujours.

## Indications techniques

- C'est ici que le MCP rencontre ton code du sprint 1 : relis ce que l'agent change dans ton
  modèle de données et dans l'annulation.

## Stratégie technique
