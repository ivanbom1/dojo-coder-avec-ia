# En tant qu'utilisateur, dans l'appli, quand j'ouvre la liste de mes schémas, je peux en créer un, le nommer et passer de l'un à l'autre

> Bonus

## Fonctionnel

- Une liste de mes schémas, chacun avec un nom.
- Je crée un schéma, je le renomme, je le supprime, j'en ouvre un autre.

## Critères d'acceptation

Sur http://localhost:5173, après `bun dev` :

- [ ] Je crée deux schémas différents, je passe de l'un à l'autre : chacun garde son contenu.
- [ ] Après un rechargement, je retrouve le dernier schéma ouvert.
- [ ] Ctrl+Z n'annule jamais une action faite dans un autre schéma.

## Indications techniques

- Au sprint 2, l'agent travaillera sur le schéma ouvert.

## Stratégie technique

- **Stockage** : un petit index (`croquis:index`) qui garde la liste `{ id, nom }` et le schéma
  ouvert, plus une entrée par schéma pour ses formes et une pour son historique
  (`croquis:schema:<id>`, `croquis:historique:<id>`). Enregistrer un schéma ne réécrit pas les
  autres, et une valeur abîmée ne coûte qu'elle-même (élève).
- **Où s'ouvre la liste** : un panneau qui s'ouvre depuis un bouton de l'en-tête, qui affiche le nom
  du schéma ouvert ; il liste les schémas, avec « Nouveau schéma » et, sur chaque ligne, renommer et
  supprimer. Le canevas garde toute sa taille (élève).
- **Changer de schéma** : la vue revient à 100 % et le presse-papiers est gardé, pour copier dans un
  schéma et coller dans un autre (élève).
- **Créer et nommer** : « Nouveau schéma » crée « Schéma N », l'ouvre et met son nom en édition tout
  de suite (Entrée valide, Échap garde le nom par défaut) ; renommer plus tard se fait par un
  double-clic sur le nom (élève).
- **Supprimer** : un « Supprimer ? Oui / Non » sur la ligne ; supprimer emporte les formes et
  l'historique du schéma (élève).
- **Après une suppression** : le schéma juste au-dessus dans la liste s'ouvre (le premier, s'il
  était en haut) ; si on supprime le dernier schéma restant, un « Schéma 1 » vide le remplace, pour
  qu'il y en ait toujours un d'ouvert (élève).
- **Un historique par schéma** : changer de schéma change les formes et l'historique ensemble ;
  Ctrl+Z ne peut donc jamais défaire une action d'un autre schéma (agent).
- **Quitter un schéma** : il est enregistré tout de suite, sans attendre la pause de 300 ms ; la
  sélection, l'édition de texte en cours et la vue sont remises à zéro (agent).
- **Ids des formes** : en ouvrant un schéma, le compteur reprend au-delà des ids de ses formes et de
  son historique, sinon une forme neuve pourrait reprendre un id déjà pris dans ce schéma (agent).
- **Schéma déjà enregistré** : l'ancien schéma unique (`croquis:schema`, `croquis:historique`)
  devient le premier schéma, « Schéma 1 », recopié tel quel, sans être relu ni réécrit (agent).
- **Données illisibles** : un schéma illisible est mis de côté sous sa propre clé de secours, le
  message de la carte 6 s'affiche et il s'ouvre vide ; un index illisible est mis de côté, et la
  liste est reconstruite depuis les schémas retrouvés dans le stockage (agent).
- **Noms** : un nom vide garde l'ancien, 60 caractères au plus, deux schémas peuvent porter le même
  nom puisque chacun a son id (agent).
- **Claviers** : dans un champ de nom, Ctrl+Z, Suppr, Espace et Ctrl+C / V restent à ce champ
  (agent).
- **Au sprint 2** : « le schéma ouvert » est l'entrée `ouvert` de l'index, avec son id (agent).
- **Tests** : un test par critère d'acceptation, plus renommer, supprimer, et un schéma enregistré
  avant la carte qui s'ouvre comme « Schéma 1 » ; la suite entière relancée avant de conclure
  (agent).
- **Fichiers** : `src/schema.ts`, `src/Schemas.tsx` (nouveau), `src/App.tsx`, `src/Board.tsx`,
  `src/index.css`, `tests/parcours.spec.ts`.
