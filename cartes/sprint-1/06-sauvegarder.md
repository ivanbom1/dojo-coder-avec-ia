# En tant qu'utilisateur, dans le navigateur, quand je recharge la page, je retrouve mon schéma tel que je l'avais laissé

## Fonctionnel

- Le schéma est sauvegardé tout seul, sans bouton.
- Après un rechargement, ou si je ferme l'onglet et le rouvre, je retrouve mon schéma.

## Critères d'acceptation

Sur http://localhost:5173, après `bun dev` :

- [ ] Je dessine deux formes reliées par une flèche, avec un texte dans l'une d'elles, puis je
  recharge : tout est là.
- [ ] Après le rechargement, je déplace une forme : la flèche suit toujours.
- [ ] Je supprime tout et je recharge : le canevas reste vide.

## Indications techniques

- Le mode de sauvegarde est à toi de décider.

## Stratégie technique

- **Où** : dans `localStorage`, une seule clé, le schéma en JSON (élève).
- **Quand** : à chaque changement, après une courte pause de 300 ms — pendant un glisser, la
  forme change à chaque déplacement de souris, on attend donc que ça se calme (élève).
- **Un seul schéma** : une seule clé, pas de liste ni de nom ; plusieurs schémas relèvent de la
  carte 13 (élève).
- **Données illisibles** : la valeur fautive est mise de côté intacte sous une clé de secours et
  un message le dit ; le canevas, lui, s'ouvre vide (élève).
- **Contenu sauvegardé** : les formes seulement ; l'outil revient à Sélection et rien n'est
  sélectionné, comme à la première ouverture (élève).
- **Ids après rechargement** : le compteur reprend au-delà du plus grand numéro chargé, sinon une
  nouvelle forme reprendrait un id déjà pris et les flèches pointeraient sur la mauvaise (élève).
- **Clés** : `croquis:schema` pour le schéma, `croquis:schema-abandonne` pour la valeur mise de
  côté (agent).
- **Lecture** : une seule fois, au démarrage, avant le premier rendu (état initial paresseux de
  `useState`) : le schéma est là dès la première image (agent).
- **Écriture** : un `useEffect` sur les formes, avec un `setTimeout` annulé à chaque changement ;
  plus une écriture immédiate quand l'onglet passe en arrière-plan ou se ferme
  (`visibilitychange`, `pagehide`), pour ne pas perdre la dernière modification (agent).
- **Schéma vide** : enregistré comme n'importe quel autre, sans cas particulier — supprimer tout
  puis recharger laisse donc bien un canevas vide (agent).
- **Message** : un bandeau en haut du plateau, refermable, jamais enregistré ; comme la valeur
  fautive a été déplacée au premier chargement, il ne réapparaît pas au suivant (agent).
- **Découpage** : un module `src/schema.ts` (lire, écrire, mettre de côté) ; `src/shape.ts` gagne
  de quoi reprendre le compteur d'ids ; `src/App.tsx` et `src/index.css` suivent (agent).
- **Tests** : un test par critère d'acceptation, ajouté à `tests/`, et la suite entière relancée
  avant de conclure (agent).
- **Fichiers** : `src/schema.ts` (nouveau), `src/shape.ts`, `src/App.tsx`, `src/index.css`,
  `tests/parcours.spec.ts`.

