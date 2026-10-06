# ✏️ Croquis

Ce dojo consiste à construire un outil de schémas inspiré d'Excalidraw, sans écrire le code
soi-même : c'est Claude Code, un agent de code, qui l'écrit. Le rôle de l'élève est de le
piloter : cadrer le travail, trancher les choix techniques et vérifier le résultat.

Le travail est découpé en cartes, chacune avec une fonctionnalité et ses critères
d'acceptation, réparties sur trois sprints :

- **Sprint 1** : l'outil de schémas lui-même (formes, texte, flèches, sauvegarde…) ;
- **Sprint 2** : un serveur MCP, pour que l'agent puisse dessiner dans l'outil ;
- **Sprint 3** : des améliorations au choix.

## Installation

1. **Installer Claude Code**

   macOS, Linux, WSL :

   ```bash
   curl -fsSL https://claude.ai/install.sh | bash
   ```

   Windows PowerShell :

   ```powershell
   irm https://claude.ai/install.ps1 | iex
   ```

   Autres méthodes : [documentation de Claude Code](https://code.claude.com/docs/fr/quickstart).
2. **Cloner ce dépôt** et s'y placer :

   ```bash
   git clone https://github.com/nicodeck/dojo-coder-avec-ia.git
   ```

   ```bash
   cd dojo-coder-avec-ia
   ```
3. **Ajouter la clé** fournie par l'animateur dans un fichier `.claude/settings.local.json` :

   ```json
   {
     "env": {
       "ANTHROPIC_AUTH_TOKEN": "<clé>"
     }
   }
   ```

   Ce fichier est ignoré par git : la clé ne part pas dans les commits.
4. **Lancer Claude Code** dans le dossier :

   ```bash
   claude
   ```
5. **Taper `/setup`**. L'agent installe ce qui manque et vérifie que tout fonctionne.

En cas de problème : lever la main.

## Le kanban

Le kanban suit l'avancement des cartes. Il se lance dans un terminal à part :

```bash
bun kanban
```

Puis http://localhost:4000. Les cartes se déplacent à la main ; leur position est enregistrée
dans `cartes/tableau.json` et part avec les commits. Un clic sur une carte l'ouvre, avec la
stratégie technique remplie pendant `/grill-me`.

## Fonctionnement

### Le flux, pour chaque carte

1. Déplacer la carte en « En cours » dans le kanban, puis ouvrir une nouvelle conversation :
   `/clear`.
2. Lancer `/grill-me` suivi du chemin de la carte, par exemple
   `/grill-me cartes/sprint-1/01-formes.md`. L'agent pose ses questions et propose une
   stratégie technique ; l'élève tranche, notamment sur le modèle de données, et la stratégie
   est écrite dans la carte.
3. L'agent implémente.
4. Lire son résumé, en particulier ce qu'il a décidé seul, puis essayer dans le navigateur
   avec les critères de la carte.
5. Demander le commit, et déplacer la carte en « Fait ».

Un commit et une nouvelle conversation par carte.

### L'andon

Comme l'andon des usines Toyota, qui permet à tout ouvrier d'arrêter la chaîne : en cas de
blocage, de doute ou de surprise, lever la main sans attendre.

### Les skills

Des commandes qui donnent une méthode à l'agent :

- `/setup` : prépare et vérifie le poste ;
- `/grill-me <carte>` : pose des questions avant de coder et écrit la stratégie dans la
  carte ;
- `/diagnose` : quand les essais échouent, reproduit le bug avant de le corriger ;
- `/tdd` : écrit un test d'abord, puis le code qui le fait passer ; sert aussi à corriger une
  régression à partir d'un test qui la reproduit.

`/` affiche la liste des commandes.
