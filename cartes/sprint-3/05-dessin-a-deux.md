# En tant qu'utilisateur, sur le canevas, quand je commence un schéma et demande à mon agent de le compléter, il continue mon dessin sans abîmer le mien

## Fonctionnel

- L'agent lit ce que j'ai dessiné et le complète, dans le même style.
- Je peux continuer à dessiner pendant qu'il travaille.

## Critères d'acceptation

Avec `bun dev` lancé et http://localhost:5173 ouvert :

- [ ] Je dessine le haut d'un organigramme et je demande « Complète » : il ajoute la suite,
  sans déplacer mes formes.
- [ ] Je dessine pendant que l'agent dessine : rien ne se perd, ni chez lui ni chez moi.

## Stratégie technique
