# En tant que développeur, dans le terminal, quand je lance les tests, les cartes précédentes sont rejouées dans un navigateur et je vois ce qui casse

## Fonctionnel

- Des tests de parcours qui rejouent les cartes déjà faites dans un vrai navigateur :
  dessiner, écrire, relier, déplacer.
- Une seule commande les lance.
- L'agent les relance avant de conclure chaque carte suivante.

## Critères d'acceptation

- [ ] La commande passe sur le code actuel.
- [ ] Je casse volontairement une carte (par exemple, je demande à l'agent de désactiver le
  déplacement) : au moins un test échoue, avec un message qui dit quoi. Puis je remets le code.
- [ ] Les tests vérifient ce que je veux, pas seulement ce que l'agent a codé : je relis leur
  nom et ce qu'ils vérifient.

## Indications techniques

- Playwright : Chromium est déjà téléchargé par `/setup`, il reste à ajouter Playwright au
  projet.
- Quelques parcours ciblés suffisent, un ou deux par carte.
- Pour que l'agent relance les tests à chaque carte, c'est à `CLAUDE.md` de le lui dire.
- `/tdd` est fait pour ça.

## Stratégie technique
