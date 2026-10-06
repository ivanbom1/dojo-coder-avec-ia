# En tant que développeur, dans le terminal, quand je lance le smoke test du MCP, il appelle les outils comme un agent et me dit si leur contrat tient

## Fonctionnel

- Un smoke test qui passe par le protocole MCP : un client appelle les outils et vérifie la
  scène, avec l'appli ouverte dans un navigateur.
- Il vérifie le contrat des outils (la forme créée est dans la scène, l'alerte sort), pas la
  qualité du dessin.
- Une seule commande le lance, sans Claude Code. L'agent le relance avant de conclure chaque
  carte suivante.

## Critères d'acceptation

- [ ] La commande passe sur le code actuel.
- [ ] Je demande à l'agent de retirer l'alerte du texte qui dépasse : le test échoue. Puis je
  remets le code.
- [ ] Je lis la liste de ce que le test vérifie : elle couvre les outils des cartes
  précédentes.

## Indications techniques

- Le SDK MCP fournit un client. Playwright, installé au sprint 1, peut ouvrir l'appli.
- Pour que l'agent relance le test à chaque carte, c'est à `CLAUDE.md` de le lui dire.

## Stratégie technique
