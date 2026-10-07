# En tant qu'utilisateur, dans la barre d'outils, quand je clique sur « Exporter en PNG », je télécharge mon schéma en image

> Bonus

## Fonctionnel

- Un bouton « Exporter en PNG » télécharge le schéma sous forme d'image.

## Critères d'acceptation

Sur http://localhost:5173, après `bun dev` :

- [ ] L'image contient toutes les formes, les textes et les flèches, sans la barre d'outils
  ni la sélection.
- [ ] Le schéma est cadré : pas de grand vide autour, rien de coupé.
- [ ] Sur un canevas vide, le bouton ne télécharge rien ou le dit.

## Stratégie technique

- **Fond de l'image** : gris très clair avec une grille estompée, pas du blanc ni du transparent
  (élève).
- **Canevas vide** : le bouton reste cliquable et affiche le bandeau refermable de la carte 6 :
  « Le schéma est vide : rien à exporter » ; rien n'est téléchargé (élève).
- **Découpage** : les fonctions de dessin quittent `Board.tsx` pour un nouveau `src/rendu.ts`,
  partagé par l'écran et l'export, pour que l'image soit exactement ce qu'on voit ; la boîte qui
  cadre le schéma est une fonction pure de `src/shape.ts` ; la fabrication du PNG est dans
  `src/export.ts` (élève).
- **Contenu de l'image** : l'export redessine toutes les formes, textes et flèches sur un canvas à
  part, sans sélection, sans poignées, sans points d'ancrage, sans la barre d'outils (agent).
- **Cadrage** : la boîte englobe les formes, les textes libres, le texte des formes (qui peut
  déborder, carte 9) et les deux bouts des flèches avec leur pointe ; 20 px de marge tout autour
  (agent).
- **Qualité** : l'image est dessinée au double de la résolution pour que les traits restent nets
  (agent).
- **Téléchargement** : un fichier `croquis.png` produit par le navigateur, sans serveur ni
  dépendance (agent).
- **Bouton** : « Exporter en PNG », dans le panneau d'outils après un petit écart, sans effet sur
  la sélection ni sur l'historique (agent).
- **Fond à l'écran** : le plateau a le même gris et la même grille que l'image, en CSS (les lignes
  ne sont pas dessinées sur le canvas, qui reste transparent) (élève).
- **Tests** : un test par critère d'acceptation, qui lit l'image téléchargée ; la suite entière
  relancée avant de conclure (agent).
- **Fichiers** : `src/rendu.ts` (nouveau), `src/export.ts` (nouveau), `src/shape.ts`,
  `src/Board.tsx`, `src/Toolbar.tsx`, `src/App.tsx`, `src/index.css`, `tests/parcours.spec.ts`.
