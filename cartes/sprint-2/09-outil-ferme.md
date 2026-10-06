# En tant qu'utilisateur, dans Claude Code, quand mon outil n'est pas ouvert dans le navigateur, mon agent me dit de l'ouvrir au lieu de bloquer

> Bonus

## Fonctionnel

- Si aucun onglet de l'outil n'est ouvert, les outils MCP répondent vite avec un message
  utile, que l'agent me transmet.

## Critères d'acceptation

Avec `bun dev` lancé, sans onglet ouvert :

- [ ] « Dessine un rectangle » : en quelques secondes, l'agent me dit d'ouvrir
  http://localhost:5173.
- [ ] J'ouvre la page et je redemande : ça marche, sans relancer Claude Code.

## Stratégie technique
