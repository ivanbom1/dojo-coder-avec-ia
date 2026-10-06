---
name: diagnose
description: Boucle de diagnostic quand quelque chose est cassé ou que les essais échouent.
disable-model-invocation: true
argument-hint: <ce qui casse>
---

Une méthode pour les bugs qui résistent. Arrête de tenter des corrections : on reproduit
d'abord, on comprend ensuite, on corrige en dernier. Dis à l'élève à chaque étape où tu en
es, en une phrase.

## 1. Une boucle rouge

**C'est tout le skill.** Construis une commande qui montre le bug : elle passe au **rouge**
sur ce bug précis, et passera au vert une fois corrigé. Avec elle, la cause se trouve ;
sans elle, relire le code ne suffit pas. Essaie dans cet ordre :

1. un test qui échoue, avec la commande de test de `package.json` s'il y en a une ;
2. un petit script `bun` (un fichier temporaire, ou `bun -e "…"`) qui appelle le code fautif
   et affiche le mauvais résultat ;
3. une capture de l'appli : `bunx playwright@1.63.0 screenshot http://localhost:5173 capture.png`,
   que tu relis avec ton outil de lecture d'images (l'élève doit avoir lancé `bun dev`) ;
4. en dernier recours, l'élève : donne-lui des étapes précises à faire dans le navigateur,
   et ce qu'il doit te rapporter (ce qu'il voit, le message de la console du navigateur).

Rends la boucle **serrée** : rapide (quelques secondes), même verdict à chaque fois, et qui
vérifie le symptôme exact décrit par l'élève, pas seulement « ça ne plante pas ».

Étape finie quand tu peux montrer la commande, que tu l'as lancée, et que sa sortie montre
le symptôme de l'élève. Pas de boucle, pas d'hypothèse : si tu n'y arrives pas, dis ce que
tu as essayé et demande à l'élève ce qui te manque.

## 2. Réduire

Retire un à un les éléments du scénario (étapes, formes, données) en relançant la boucle à
chaque fois. Garde seulement ce qui fait passer au rouge.

## 3. Hypothèses

Écris 3 hypothèses classées, chacune avec sa prédiction : « Si la cause est X, alors changer
Y fera disparaître le bug. » Montre-les à l'élève avant de tester : il sait souvent quelque
chose (« ça marchait avant la carte Texte »). Continue sans attendre s'il ne répond pas.

## 4. Instrumenter

Teste les hypothèses une par une, en changeant une seule chose à la fois. Préfixe chaque log
de débogage par une balise unique, par exemple `[DEBUG-a4f2]`, pour tous les retrouver à la
fin.

## 5. Corriger

S'il existe déjà des tests, transforme d'abord la boucle en test qui échoue, puis corrige,
puis regarde-le passer. Sinon, corrige et relance la boucle de l'étape 1 : elle doit passer
au vert.

## 6. Nettoyer et expliquer

- relance la boucle de l'étape 1 : verte ;
- supprime les logs `[DEBUG-…]` (cherche la balise) et les scripts ou captures temporaires ;
- explique à l'élève, en deux ou trois phrases, la cause, et ce qui aurait permis de la voir
  plus tôt.
