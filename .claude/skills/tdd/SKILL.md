---
name: tdd
description: Écrire un test d'abord, puis le code qui le fait passer, pour une fonctionnalité ou une régression.
disable-model-invocation: true
argument-hint: <ce que tu veux>
---

Le TDD, c'est la boucle **rouge → vert** : un test qui échoue, puis juste assez de code pour
le faire passer. Ce skill dit ce qu'est un test qui vaut la peine d'être gardé. Explique
chaque étape à l'élève en une phrase : il débute.

## Avant le premier test

- **L'outil.** Utilise la commande de test de `package.json`. S'il n'y en a pas, propose un
  outil à l'élève et attends son accord avant d'installer quoi que ce soit : `bun test` est
  intégré à bun (rien à installer) pour la logique pure ; Playwright, pour les parcours dans
  le navigateur, s'installe en version 1.63.0, celle du Chromium déjà téléchargé.
- **Les points de test.** Un point de test, c'est l'interface publique où l'on observe un
  comportement sans regarder à l'intérieur : la page vue par l'utilisateur, une fonction
  exportée. Écris la liste des comportements à tester et de leurs points de test, et fais-la
  valider par l'élève. Quelques tests ciblés sur ce qui compte, pas une suite exhaustive.
- **Les valeurs attendues** viennent des critères de la carte ou de l'élève, jamais du code
  actuel : un test protège ce qui a été décidé, pas ce qu'on voulait.

## La boucle

Une **tranche verticale** à la fois : un test, le code qui le fait passer, puis le suivant.

1. Écris un test, et un seul. Lance-le : il doit être **rouge**, pour la bonne raison (le
   comportement manque, pas une faute de frappe).
2. Écris juste assez de code pour le passer au **vert**. Rien pour les tests suivants.
3. Recommence avec le comportement suivant de la liste.

Pour une **régression** : le premier test reproduit le bug tel que l'élève l'a vu. Regarde-le
échouer avant de corriger quoi que ce soit, puis corrige.

Relance toute la suite une fois à la fin, pas après chaque modification.

## Un bon test

Il vérifie un comportement par l'interface publique, et se lit comme une spécification :
« un clic dans le vide désélectionne la forme ». Il survit à une réécriture du code tant que
le comportement ne change pas. Les trois pièges :

- **Collé à l'implémentation** : il espionne des fonctions internes, ou vérifie un état
  interne au lieu de ce que voit l'utilisateur. Il casse quand on réorganise le code sans
  rien changer au comportement.
- **Tautologique** : la valeur attendue est recalculée comme le fait le code. Il passe
  toujours, et ne peut jamais contredire le code.

  ```ts
  // Tautologique
  expect(largeur(forme)).toBe(forme.x2 - forme.x1)
  // Bon : une valeur connue, tirée d'un exemple
  expect(largeur({ x1: 10, x2: 60 })).toBe(50)
  ```
- **Tous les tests d'abord** : écrire tous les tests avant le code fige des comportements
  imaginés. Une tranche à la fois.

Le skill est fini quand chaque comportement de la liste validée a son test vert, et que la
suite complète passe.
