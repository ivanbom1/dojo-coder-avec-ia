# En tant que développeur, dans Claude Code, quand je demande à mon agent l'architecture de mon dépôt, il l'explore et la dessine dans mon outil

## Fonctionnel

- L'agent explore le dépôt et dessine son architecture : les morceaux principaux et qui parle
  à qui (navigateur, serveur de dev, MCP, agent…).

## Critères d'acceptation

Avec `bun dev` lancé et http://localhost:5173 ouvert :

- [ ] Le schéma montre les vrais morceaux du code, avec leurs noms.
- [ ] Je vérifie trois flèches au hasard dans le code : elles sont justes.
- [ ] Le schéma est lisible sans explication.

## Stratégie technique
