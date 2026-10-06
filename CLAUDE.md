# Croquis

Un outil de schémas dans le navigateur, dans l'esprit d'Excalidraw, construit carte après
carte par un élève qui débute avec un agent de code. Les cartes sont dans `cartes/`.

## Stack et commandes

Vite + React + TypeScript, avec bun à la place de npm et de Node. Passe toujours par `bun` et
`bunx` (jamais `npm`, `npx` ni `node`) : ce sont les seules commandes que l'élève n'a pas à
approuver. Pour lire, lister ou chercher des fichiers, prends tes outils de lecture et de
recherche plutôt que le shell.

- `bun install` : installe les dépendances ;
- `bun run build` : vérifie les types et construit l'appli ; c'est ta vérification ;
- `bun dev` : l'appli sur http://localhost:5173. Il ne rend pas la main : l'élève le lance
  dans son propre terminal.

## Cartes et tableau

- Ne lis pas les cartes que l'élève ne t'a pas données.
- Ne touche ni à `kanban/` ni à `cartes/tableau.json` : le tableau appartient à l'élève.
- Suis la « Stratégie technique » de la carte. Si tu dois t'en écarter, demande d'abord.

## Sobriété

Ce dojo partage un budget entre une trentaine d'élèves. La qualité passe avant tout, mais
évite le gaspillage :
- ne lis pas `node_modules/`, `bun.lock`, `dist/` ni les fichiers générés ;
- fais ce que demande la carte, rien de plus : propose le reste au lieu de le faire ;
- n'ajoute aucune dépendance ni aucun outil de test que la carte ne demande pas ;
- écris quelques tests ciblés plutôt qu'une suite exhaustive, et relance la suite complète
  une fois avant de conclure, pas après chaque modification ;
- fais un résumé final court : ce que tu as fait, ce que tu as décidé seul, ce qui reste à
  vérifier.

Ne saute jamais une vérification pour économiser : une carte ratée coûte plus cher qu'une
vérification.

## Conseils du dojo

En plus de ce que l'élève demande, guide-le sur l'hygiène de la conversation et sur le flux.
Quand une de ces situations se présente, et seulement elles, ajoute une ligne
« 💡 Dojo : … » à la fin de ta réponse :
- la carte vient d'être commitée : propose `/clear` avant la suivante ;
- l'élève attaque une nouvelle carte dans la même conversation : propose `/clear` d'abord ;
- trois tentatives ratées sur le même problème : propose de s'arrêter et de lancer
  `/diagnose` ;
- l'élève demande un commit sans avoir essayé l'appli : rappelle-lui d'essayer d'abord dans
  le navigateur, critères de la carte en main ;
- la demande sort de la carte : signale-le.

Un seul conseil par réponse, jamais le même deux fois dans une conversation. Le conseil
propose une action, pas une question de réflexion ; il s'ajoute à ce que tu fais : tu exécutes toujours la demande. Les décisions produit et
techniques appartiennent à l'élève : tes conseils portent seulement sur le flux.
