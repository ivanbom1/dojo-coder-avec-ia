# En tant qu'utilisateur, dans Claude Code, quand je donne à mon agent la photo d'un schéma, il le redessine dans mon outil, regarde son résultat et le corrige

> Toutes les cartes de ce sprint sont au choix : commence par celle-ci.

## Fonctionnel

- Je donne une photo à l'agent : collée dans la saisie (Ctrl+V, même sur Mac), ou en
  donnant son chemin dans ma demande.
- Il redessine le schéma dans mon outil.
- Il fait une capture de son résultat, la compare à la photo et corrige, sans que je le lui
  demande.

## Critères d'acceptation

Avec `bun dev` lancé et http://localhost:5173 ouvert, avec la photo
`cartes/sprint-3/photos/schema-a-la-main.png` :

- [ ] Toutes les formes, tous les textes et toutes les flèches de la photo sont là, dans le
  bon sens.
- [ ] L'agent a regardé au moins une capture de son résultat et dit ce qu'il a corrigé.
- [ ] Avec une photo de mon cru, ça marche aussi.

## Indications techniques

- L'agent sait lire une image avec son outil `Read`, et faire une capture avec Playwright.
- Un navigateur lancé par Playwright part de zéro : vérifie que la capture montre bien ton
  schéma, pas un canevas vide.

## Stratégie technique
