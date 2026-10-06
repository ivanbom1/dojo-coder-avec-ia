# En tant qu'utilisateur, dans Claude Code, quand mon agent dessine avec le skill « dessinateur », ses schémas sont plus beaux qu'avant

## Fonctionnel

- Un skill « dessinateur » qui apprend à l'agent à faire de beaux schémas : alignement,
  espacement, légendes.
- Je compare le même schéma demandé avant et après le skill.

## Visuels

![Le même schéma, brouillon puis propre](visuels/03-dessinateur.png)

<!-- Capture Excalidraw : à gauche, cinq formes reliées posées en vrac (tailles inégales,
flèches qui se croisent) ; à droite, les mêmes alignées sur une grille, espacées
régulièrement, avec une légende. -->

## Critères d'acceptation

Avec `bun dev` lancé et http://localhost:5173 ouvert :

- [ ] La même demande, avant et après le skill, dans deux conversations neuves : la
  différence se voit.
- [ ] L'agent charge le skill quand il dessine, sans que je le lui dise.
- [ ] Le skill tient en une page.

## Indications techniques

- Un skill est un fichier `SKILL.md` dans `.claude/skills/<nom>/`. Sa description décide
  quand l'agent le charge.

## Stratégie technique
