# En tant qu'utilisateur, dans Claude Code, quand je demande à mon agent de dessiner un rectangle, il apparaît dans mon outil ouvert, sans recharger

## Fonctionnel

- Un serveur MCP, servi sur http://localhost:5173/mcp, avec un premier outil : dessiner un
  rectangle.
- Mon agent dans Claude Code est branché sur ce serveur.
- Le rectangle apparaît dans l'onglet déjà ouvert, et je peux le manipuler comme un rectangle
  dessiné à la main.

## Critères d'acceptation

Avec `bun dev` lancé et http://localhost:5173 ouvert :

- [ ] Dans `/mcp`, `croquis` est connecté.
- [ ] « Dessine un rectangle en haut à gauche » : il apparaît sans recharger la page.
- [ ] Je déplace ce rectangle à la souris, comme les autres.

## Indications techniques

- Dans ce sprint, tu ne lis pas le code du MCP : l'agent décide de la stratégie technique,
  toi tu testes le résultat.
- L'adresse http://localhost:5173/mcp est imposée : le MCP est déjà déclaré dans
  `.mcp.json`, et désactivé dans `.claude/settings.json`. Remplace `disabledMcpjsonServers`
  par `enabledMcpjsonServers`.
- Le SDK MCP officiel pour TypeScript peut être ajouté au projet.
- Lance `bun dev` avant Claude Code, puis vérifie avec `/mcp`.
- Si l'agent ne voit pas un outil qu'il vient d'ajouter, choisis `croquis` dans `/mcp`, puis
  « Reconnect », ou relance Claude Code.
- La vraie difficulté : le schéma vit dans le navigateur, le serveur MCP dans le serveur de
  dev. Il faut un pont entre les deux.

## Stratégie technique
