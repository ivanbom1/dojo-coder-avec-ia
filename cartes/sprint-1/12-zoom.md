# En tant qu'utilisateur, sur le canevas, quand j'utilise la molette, je zoome et je me déplace dans mon schéma

> Bonus

## Fonctionnel

- Ctrl+molette (pinch sur un pavé tactile) zoome vers le pointeur.
- La molette, ou un glisser avec Espace enfoncé, déplace la vue.
- Le niveau de zoom est affiché, avec un bouton pour revenir à 100 %.

## Critères d'acceptation

Sur http://localhost:5173, après `bun dev` :

- [ ] Après un zoom et un déplacement, je dessine une forme : elle apparaît sous la souris.
- [ ] Je déplace une forme et je relie deux formes, zoomé : tout se passe sous la souris.
- [ ] Le zoom ne change pas le schéma : après un rechargement, les formes n'ont pas bougé.

## Stratégie technique

- **Où vit la vue** : l'état `{ echelle, x, y }` est dans `App`, à côté de la sélection ; il n'est ni
  enregistré ni dans l'historique d'annulation. Un nouveau module `src/vue.ts` porte les calculs
  purs (de l'écran au schéma et retour, « zoomer vers ce point », les bornes). `Board`, le champ de
  texte, la grille et l'affichage du zoom la lisent d'`App` (élève).
- **Après un rechargement** : retour à 100 % et à l'origine ; seules les formes sont enregistrées,
  comme à la carte 6 (élève).
- **Bouton « 100 % »** : il revient à 100 % autour du milieu de l'écran, sans bouger la position :
  ce qui est au milieu y reste (élève).
- **Les formes ne bougent pas** : elles gardent leurs coordonnées ; seule la façon de les projeter
  sur l'écran change. Export, copier-coller, annulation et enregistrement ne sont pas touchés
  (agent).
- **Souris** : tout ce qui lit la souris (dessiner, déplacer, redimensionner, relier, cliquer)
  convertit d'abord la position de l'écran vers le schéma (agent).
- **Distances d'accroche** : points d'ancrage, poignées, clic sur une flèche et seuil du simple
  clic gardent leur taille à l'écran, quel que soit le zoom ; poignées et points d'ancrage sont
  dessinés à taille constante (agent).
- **Molette** : Ctrl+molette (et le pincement du pavé tactile) zoome vers le pointeur, la molette
  seule déplace la vue ; l'écouteur est posé à la main pour empêcher le zoom de la page par le
  navigateur (agent).
- **Espace + glisser** : déplace la vue, quel que soit l'outil ; pendant l'écriture d'un texte,
  Espace reste une espace (agent).
- **Zoom** : de 10 % à 400 %, traits et texte qui grossissent avec le zoom (agent).
- **Champ de texte** : sa position et la taille de sa police suivent le zoom (agent).
- **Grille** : celle de l'écran suit la vue (taille et position) ; elle disparaît quand le zoom la
  rend trop serrée (agent).
- **Affichage du zoom** : un petit bouton en haut à droite du plateau, qui affiche le niveau et
  sert de bouton « 100 % » (agent).
- **Tests** : un test par critère d'acceptation, plus l'affichage et le bouton, et Espace + glisser ;
  la suite entière relancée avant de conclure (agent).
- **Fichiers** : `src/vue.ts` (nouveau), `src/App.tsx`, `src/Board.tsx`, `src/TextEditor.tsx`,
  `src/index.css`, `tests/parcours.spec.ts`.
