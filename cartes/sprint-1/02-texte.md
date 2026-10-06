# En tant qu'utilisateur, sur le canevas, quand je clique avec l'outil Texte ou double-clique sur une forme, je peux écrire un texte

## Fonctionnel

- Un outil Texte : je clique sur le canevas et je tape un texte libre.
- Un double-clic sur une forme me laisse écrire dans la forme. Le texte est centré et suit la
  forme quand je la déplace.
- Un double-clic sur un texte me permet de le modifier.

## Visuels

![Un texte libre et un rectangle contenant un texte centré](visuels/02-texte.png)

<!-- Capture Excalidraw : un texte libre « Notes » et un rectangle contenant « Serveur »,
centré. -->

## Critères d'acceptation

Sur http://localhost:5173, après `bun dev` :

- [ ] J'écris un texte libre, puis un texte dans un rectangle : les deux restent affichés.
- [ ] Je déplace le rectangle : son texte reste centré dedans.
- [ ] Si je valide un texte vide, il ne reste rien sur le canevas.

## Indications techniques

- Un texte libre et un texte dans une forme ne sont pas forcément la même chose dans ton
  modèle de données : à toi de voir.

## Stratégie technique
