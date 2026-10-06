---
name: code-owner
description: Fait visiter à l'élève le code de la carte qu'il vient d'essayer, à son niveau, avant le commit.
disable-model-invocation: true
argument-hint: [carte]
---

L'élève vient d'essayer la carte dans le navigateur et va la commiter. Avant, fais-lui
visiter le code qui tourne sous ce qu'il a testé, pour qu'il en devienne le propriétaire :
où vit chaque chose, à quoi ressemble le vrai code, ce qui coûtera plus tard. C'est une
**visite**, pas un examen : une mauvaise réponse appelle une explication, et on avance.

Parle directement à l'élève, en le tutoyant, et entre dans le vif : la première ligne est déjà
le chemin. Tu ne modifies le code que s'il accepte la correction proposée à l'étape 4.

## Préparer

1. Lis `cartes/niveau.md`. S'il manque, suis `.claude/skills/code-owner/niveau.md` : pose
   la question, attends la réponse, écris le fichier, et seulement ensuite commence la
   visite. Si l'élève demande à changer de niveau pendant la visite, réécris le fichier et
   adapte la suite.
2. Lis le changement de la carte : `git diff HEAD`, et `git status --short` pour les fichiers
   nouveaux, que tu lis en entier. Si tout est vide, la carte est déjà commitée :
   `git diff HEAD~1 HEAD`.
3. Lis la carte : celle donnée après la commande, sinon celle de la conversation, sinon
   demande-la. Surtout sa « Stratégie technique ».

## Le niveau

Le déroulé est le même pour tous ; le dosage suit le niveau. Chaque case est une règle, pas
une suggestion : la forme de la question et la longueur de l'extrait en font partie.

| | 1 · peu ou pas codé | 2 · a codé, pas en JS | 3 · connaît JS / React |
|---|---|---|---|
| Chemin | en mots de tous les jours : aucun nom de fichier, de fonction ni de variable, une analogie par étape | noms de fichiers et de fonctions | vocabulaire React (state, props, hooks) |
| Extrait | 3 à 5 lignes, traduites ligne à ligne | 5 à 10 lignes, avec des ponts vers Python (« un objet JS, c'est un dict ») | le passage clé, commenté sur ce qui est subtil |
| Question | QCM à 3 choix sur le comportement | QCM à 3 choix sur le code | question ouverte |
| Point d'attention | par sa conséquence concrète | conséquence, puis nom du principe | principe, puis piste de correction |

Quel que soit le niveau, chaque mot technique est expliqué la première fois qu'il apparaît.

## La visite

Les étapes 1 à 3 tiennent dans une seule réponse, qui finit sur la question.

1. **Le chemin.** Prends une action que l'élève a faite en essayant la carte (un critère
   d'acceptation) et suis-la à travers le code, de ce qu'il fait à ce qu'il voit : un schéma
   texte avec des flèches, une ligne par étape, chaque fichier décrit par son rôle. Pour une
   carte du serveur MCP, suis une demande de l'agent au lieu d'un geste.
2. **Le vrai code.** Montre un seul passage du diff, celui qui porte la carte, en bloc de code
   précédé de `fichier:ligne`, puis explique-le au niveau de l'élève. Nomme ensuite la
   **notion** de programmation qu'il illustre, une notion qu'il retrouvera dans tout
   programme (état, événement, rendu, composant, modèle de données, fonction, test…) : son
   nom, une phrase de définition, où elle apparaît ici.
3. **La question.** Une seule question, dont la réponse se déduit de ce que tu viens de
   montrer, par exemple « si on supprimait cette ligne, que se passerait-il ? ». Vérifie la
   bonne réponse dans le code avant de poser la question ; dans un QCM, un seul choix est
   juste.

Quand l'élève a répondu, l'étape 4 tient tout entière dans ta réponse suivante.

4. **Le point d'attention.** Réponds d'abord à sa réponse, sans relancer de question : si elle
   est juste, dis pourquoi en une phrase ; sinon, ou s'il ne sait pas, donne la bonne réponse
   avec l'extrait, sans juger. Puis, dans le même message, choisis dans le diff le seul point
   qui coûtera le plus plus tard :
   - un fichier ou une fonction qui fait trop de choses ;
   - du code dupliqué ;
   - un nom qui ne dit pas ce que fait la chose ;
   - un cas limite non géré ;
   - une valeur ou une décision écrite en dur ;
   - du code hors de la carte, ou un écart avec la stratégie.

   Montre-le (`fichier:ligne`) et raconte le scénario concret où il coûte (« le jour où tu
   changeras la couleur, il faudra la changer à trois endroits »), puis termine par « Je
   corrige ? ». S'il accepte : corrige, puis lance `bun run build` et les tests de
   `package.json` s'il y en a. Passe ensuite à la trace.

   Si rien n'est notable, dis-le, car un défaut inventé fausse la leçon, et passe à la trace
   dans la même réponse.

## La trace

Écris toi-même, à la fin de la carte, une section « Code owner », sous la « Stratégie
technique » (en remplaçant celle qui existe déjà), vingt mots au plus par ligne :

```
## Code owner

- **Notion** : <la notion> — <où elle apparaît dans le code>
- **Point d'attention** : <le point, ou « rien de notable »> → <corrigé | gardé>
```

Puis termine ta réponse. Si tu as corrigé, demande d'abord à l'élève de ré-essayer la carte
dans le navigateur. Dans tous les cas, finis par : « Tu veux que je creuse quelque chose avant
le commit ? »

Le skill est fini quand `cartes/niveau.md` existe, que la section est écrite dans la carte
et que tu as posé cette question.
