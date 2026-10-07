# En tant qu'utilisateur, sur le canevas, quand je clique-glisse d'une forme à une autre avec l'outil Flèche, une flèche les relie et suit les formes quand je les déplace

## Fonctionnel

- Un outil Flèche : je clique-glisse d'une forme vers une autre pour les relier.
- Quand je déplace une forme, les flèches qui y sont reliées suivent.

## Critères d'acceptation

Sur http://localhost:5173, après `bun dev` :

- [ ] Je relie trois formes en chaîne : deux flèches, chacune avec sa pointe du bon côté.
- [ ] Je déplace la forme du milieu : les deux flèches suivent.
- [ ] Les flèches s'arrêtent au bord des formes, pas en leur centre.

## Indications techniques

- Une flèche relie deux formes : ton modèle de données doit garder ce lien, pas seulement
  des coordonnées.

## Stratégie technique

- **Modèle d'une flèche** : une `ArrowShape` dans la même liste `Shape[]` que les autres formes,
  réduite à des références — `fromId`, `toId` et le côté d'ancrage de chaque bout
  (`fromSide`, `toSide`) ; les extrémités ne sont jamais stockées, elles se recalculent à
  l'affichage depuis la position actuelle des deux formes (élève).
- **Les 4 points d'ancrage** : chaque rectangle et chaque ellipse expose 4 points — milieu du
  haut, de la droite, du bas, de la gauche — posés sur le bord ; la flèche part et arrive donc
  au bord, jamais au centre (élève).
- **Point consommé au départ** : un point déjà utilisé comme *départ* d'une flèche n'est plus
  proposé et ne peut pas en démarrer une autre ; il reste disponible comme arrivée (élève).
- **Pendant le glisser** : outil Flèche actif, les points libres de chaque forme sont affichés ;
  le glisser part d'un point libre et la flèche n'existe que s'il est relâché sur un point libre
  d'une **autre** forme — relâché ailleurs, il ne reste rien (élève).
- **Ancrage fixe** : la flèche garde le point choisi au tracé quand les formes bougent (élève).
- **Ce qui est connectable** : forme → forme uniquement, rectangles et ellipses ; les textes
  libres n'ont pas de points d'ancrage (élève).
- **Flèche sélectionnable et rebranchable** : avec Sélection, la flèche se clique et se supprime
  avec `Suppr` ; avec l'outil Flèche, repartir d'un point déjà utilisé attrape l'extrémité de la
  flèche existante pour la rebrancher (élève).
- **Suppression en cascade** : supprimer une forme supprime les flèches qui y sont reliées (élève).
- **Rendu et outillage** : trait 1,5 px `#1e1e1e`, pointe triangulaire pleine au bout d'arrivée,
  bleu `#1971c2` quand la flèche est sélectionnée ; points d'ancrage en disques de 4 px ; rayon
  d'accroche 10 px ; clic sur une flèche = distance point-segment < 6 px ; 5e bouton « Flèche »
  dans la barre d'outils ; helper `anchorPoint(forme, côté)` dans `shape.ts` ; `bounds` et
  `hitTest` étendus à la flèche ; `moveBy` d'une flèche ne fait rien (elle n'a pas de géométrie
  propre) (agent).
- **Fichiers** : `src/shape.ts`, `src/Board.tsx`, `src/App.tsx`, `src/Toolbar.tsx`.

