---
name: grill-me
description: Interroge l'élève sur une carte avant de coder, puis écrit la stratégie technique dans la carte.
disable-model-invocation: true
argument-hint: <carte>
---

L'élève te donne une carte, en général un fichier de `cartes/`, juste après la commande.
S'il n'en donne pas, demande-lui laquelle et attends. Lis la carte, puis le code qu'elle
touche.

Tu ne codes pas pendant ce skill. Ta seule écriture est la section « Stratégie technique »
de la carte, à la fin.

## Sprint 1 : l'élève décide

Les cartes de `cartes/sprint-1/` se jouent ainsi. Interroge l'élève sans relâche jusqu'à une
compréhension commune. Construis l'**arbre de décision** de la carte : chaque décision ouvre
celles qui en dépendent.

Avance par **tours**. La **frontière**, ce sont les décisions dont les prérequis sont déjà
tranchés : celles qu'on peut poser maintenant sans deviner une réponse pas encore donnée.
À chaque tour, pose au plus trois questions de la frontière, les plus structurantes d'abord,
numérotées, chacune avec ta recommandation, puis attends les réponses. Une question qui
dépend d'une autre question du même tour attend le tour suivant.

L'élève débute : explique l'enjeu de chaque question en une ou deux phrases simples, avec les
options concrètes.

```
❓ **Q1 — <titre>** : <l'enjeu, puis les options>

➡️ Je recommande : <ta réponse, et pourquoi en une phrase>
```

Les faits sont ton travail : si le code ou la carte répond à une question, lis-les au lieu
de demander. Les décisions sont celles de l'élève. Le modèle de données et le découpage du
code lui reviennent toujours : pose-lui la question même si la réponse te semble évidente.
Les petits choix d'implémentation qui ne changent rien pour lui, tranche-les toi-même et
note-les dans la stratégie.

## Sprints suivants : tu proposes

Pour une carte d'un autre dossier, pas d'interrogatoire : remplis toi-même la stratégie, puis
demande à l'élève s'il veut y changer quelque chose. S'il te demande de l'interroger,
procède comme au sprint 1.

## Écrire la stratégie

Quand la frontière est vide (chaque branche de l'arbre tranchée par l'élève ou notée comme
ton choix, rien de supposé en silence), remplace le contenu de la section « Stratégie
technique » de la carte, et seulement elle :

```
## Stratégie technique

- **<décision>** : <ce qui est retenu> (élève)
- **<décision>** : <ce qui est retenu> (agent)
- **Fichiers** : <fichiers créés ou modifiés>
```

Une décision par ligne. « (élève) » quand l'élève l'a tranchée, même en acceptant ta
recommandation ; « (agent) » quand tu l'as tranchée seul. Montre ensuite la section à
l'élève et demande-lui s'il valide avant que tu implémentes.

Le skill est fini quand la section est écrite dans le fichier de la carte et que tu as
posé cette question.
