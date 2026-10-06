# En tant que développeur, dans le terminal, quand je lance les scénarios de démo, trois demandes types sont rejouées sans moi et je juge les dessins à l'œil

## Fonctionnel

- Trois demandes types, écrites dans un fichier, par exemple : l'architecture d'une appli web,
  le parcours d'un achat en ligne, un organigramme de six personnes.
- Une commande les rejoue l'une après l'autre, sans interaction, en partant d'un canevas vide.
- Je peux regarder le résultat de chacune.

## Critères d'acceptation

- [ ] La commande rejoue les trois scénarios sans que j'intervienne.
- [ ] Je juge chaque dessin : formes qui ne se chevauchent pas, textes dans leurs formes,
  flèches lisibles.
- [ ] J'améliore un point du MCP (par exemple la description d'un outil), je relance : le
  dessin concerné est meilleur.

## Indications techniques

- `claude -p "…"` envoie une demande sans interaction. Une action qui demanderait une invite
  y est refusée d'office : `--allowedTools "mcp__croquis__*"` autorise les outils du MCP.
- `claude -p` lit ta clé dans `.claude/settings.local.json` : lance-le depuis le dossier du
  projet, ou demande à l'agent de le lancer.
- Le résultat varie d'un passage à l'autre : c'est normal.

## Stratégie technique
