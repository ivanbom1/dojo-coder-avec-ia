# En tant qu'utilisateur, sur le canevas, quand je fais Ctrl+Z, ma dernière action est annulée, et Ctrl+Maj+Z la rétablit

## Fonctionnel

- Ctrl+Z (Cmd+Z sur Mac) annule la dernière action : dessiner, écrire, relier, déplacer,
  supprimer.
- Ctrl+Maj+Z (Cmd+Maj+Z sur Mac) rétablit ce que je viens d'annuler.

## Critères d'acceptation

Sur http://localhost:5173, après `bun dev` :

- [ ] Je déplace une forme puis j'annule : elle revient d'un coup à sa place, pas pixel par
  pixel.
- [ ] Je supprime une forme reliée par des flèches puis j'annule : la forme et ses flèches
  reviennent.
- [ ] J'annule trois fois puis je rétablis trois fois : je retrouve mon schéma.

## Indications techniques

- Cette carte touche à tout ce qui précède : c'est le moment de vérifier que ton modèle de
  données tient.
- Au sprint 2, ce que dessine un agent devra aussi s'annuler.

## Stratégie technique

- **Modèle de l'historique** : des instantanés de la liste `Shape[]`, pas des actions à inverser.
  Les cartes 1 à 3 ont fait de la liste un tout cohérent (flèches par références, texte embarqué) :
  une copie de la liste est un schéma complet, et annuler une suppression ramène les flèches avec
  la forme. L'historique est `{ passé: Shape[][], futur: Shape[][] }` ; le présent reste `shapes`
  (agent, après lecture des cartes 1 à 6).
- **Un pas d'annulation** : un geste complet (un glisser = un seul pas, d'où le retour d'un coup)
  ou une édition de texte validée. Rien ne change, rien n'est empilé (un clic sans déplacement) ;
  `Échap` n'empile rien (agent).
- **Après une annulation** : une nouvelle action vide le « rétablir » ; l'historique est plafonné
  à 50 pas (agent).
- **Raccourcis** : Ctrl+Z / Cmd+Z annule, Ctrl+Maj+Z / Cmd+Maj+Z rétablit ; le navigateur n'agit pas
  en parallèle (agent).
- **Pendant l'écriture d'un texte** : le champ garde Ctrl+Z pour ses lettres, l'annulation du
  schéma est suspendue tant qu'il est ouvert ; la validation compte pour un pas (élève).
- **Sélection après annuler / rétablir** : conservée si la forme existe encore, sinon effacée ;
  l'outil ne change pas (élève).
- **Sauvegarde de l'historique** : il survit au rechargement (élève), écrit comme le schéma, au fil
  des changements (même pause de 300 ms, écriture immédiate à la fermeture ou en arrière-plan)
  (élève).
- **Où** : sa propre clé `croquis:historique`, qui contient le passé et le futur, pas le présent.
  La clé `croquis:schema` ne change pas de format (carte 6 intacte) (agent).
- **Lecture** : une fois, avant le premier rendu, comme le schéma. Historique illisible, ou schéma
  absent ou illisible : l'historique repart vide, sans message, et le schéma s'ouvre normalement
  (agent).
- **Ids** : au rechargement, le compteur reprend au-delà du plus grand numéro trouvé dans les
  formes **et** dans tout l'historique : un id n'est jamais réutilisé, même celui d'une forme
  supprimée qu'on peut ramener. Garde-fou plus que correctif : l'historique étant linéaire, deux
  formes au même id ne se retrouvent jamais dans un même état, aucun test ne le couvre (agent).
- **Découpage** : un module `src/history.ts` (empiler, annuler, rétablir, plafond) ; `src/schema.ts`
  gagne la lecture et l'écriture de l'historique ; `Board` signale le début et la fin d'un geste
  pour grouper un glisser (agent).
- **Tests** : un test par critère d'acceptation, plus « annuler après rechargement » et « Ctrl+Z
  pendant l'écriture d'un texte » ; la suite entière relancée avant de conclure (agent).
- **Fichiers** : `src/history.ts` (nouveau), `src/schema.ts`, `src/shape.ts`, `src/App.tsx`,
  `src/Board.tsx`, `tests/parcours.spec.ts`.
