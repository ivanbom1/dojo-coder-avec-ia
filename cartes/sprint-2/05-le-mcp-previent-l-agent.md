# En tant qu'utilisateur, dans Claude Code, quand mon agent dessine un texte qui dépasse de sa forme, il en est averti et corrige sans que je le lui demande

## Fonctionnel

- Chaque outil qui modifie le schéma renvoie aussi les alertes sur le schéma, comme un LSP
  renvoie ses diagnostics après une écriture.
- Première alerte : un texte qui dépasse de sa forme.

## Visuels

![Un texte qui dépasse d'un rectangle trop petit](visuels/05-alerte.png)

<!-- Capture Excalidraw : un petit rectangle avec un texte long qui déborde à droite et à
gauche. -->

## Critères d'acceptation

Avec `bun dev` lancé et http://localhost:5173 ouvert :

- [ ] « Dessine un petit rectangle avec le texte « Service d'authentification des
  utilisateurs » » : l'agent voit l'alerte et agrandit la forme de lui-même.
- [ ] Sur un schéma propre, aucune alerte.
- [ ] J'allonge à la main le texte d'une forme jusqu'à ce qu'il dépasse : au prochain appel
  d'outil, l'agent le voit.

## Indications techniques

- La taille d'un texte affiché se mesure dans le navigateur.

## Stratégie technique
