# En tant que développeur, dans le terminal, quand je lance les évals, cinq demandes types sont rejouées et notées, et je sais si ma dernière modification a aidé

## Fonctionnel

- Cinq demandes types, rejouées sans interaction.
- Chaque résultat reçoit un score : calculé sur la scène, noté par un modèle, ou les deux.
- Une commande affiche les scores et la moyenne.

## Critères d'acceptation

- [ ] Je lance deux fois sans rien changer : je sais de combien le score varie tout seul.
- [ ] Je modifie le MCP (une description d'outil, une alerte…) et je relance : je sais dire
  si c'est mieux, ou si l'écart est du bruit.

## Indications techniques

- `claude -p --output-format json` donne aussi les tokens de chaque passage (`usage`) : garde
  un nombre de passages raisonnable. Ne te fie pas à `total_cost_usd` : il est calculé au
  tarif d'un modèle Claude, environ dix fois le nôtre.

## Stratégie technique
