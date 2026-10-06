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
