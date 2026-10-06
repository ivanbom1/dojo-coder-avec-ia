# En tant qu'utilisateur, sur le canevas, quand j'appuie sur Suppr, l'élément sélectionné disparaît

## Fonctionnel

- Suppr ou Retour arrière supprime l'élément sélectionné : forme, texte ou flèche.
- Supprimer une forme supprime aussi les flèches qui y sont reliées.

## Critères d'acceptation

Sur http://localhost:5173, après `bun dev` :

- [ ] Je sélectionne une flèche, puis un texte libre, et je les supprime.
- [ ] Je supprime une forme reliée à deux autres : ses flèches disparaissent, les autres
  formes restent.
- [ ] Retour arrière pendant que j'écris un texte efface une lettre, pas la forme.

## Indications techniques

- Il faut pouvoir sélectionner une flèche et un texte, pas seulement une forme.

## Stratégie technique
