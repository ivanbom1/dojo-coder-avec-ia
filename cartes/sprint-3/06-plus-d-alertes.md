# En tant qu'utilisateur, dans Claude Code, quand mon agent fait un schéma brouillon, de nouvelles alertes le poussent à le corriger

## Fonctionnel

- De nouvelles alertes renvoyées par les outils : formes qui se chevauchent, élément hors du
  canevas, flèche qui traverse une forme…

## Visuels

![Les trois défauts : chevauchement, élément hors cadre, flèche qui traverse](visuels/06-alertes.png)

<!-- Capture Excalidraw : deux rectangles qui se chevauchent, une ellipse coupée par le bord
du canevas, une flèche qui traverse un rectangle posé entre ses deux formes. -->

## Critères d'acceptation

Avec `bun dev` lancé et http://localhost:5173 ouvert :

- [ ] Pour chaque alerte, une demande qui la déclenche : l'agent corrige de lui-même.
- [ ] Sur un schéma propre, aucune alerte.
- [ ] Le smoke test du MCP couvre les nouvelles alertes.

## Indications techniques

- À comparer avec le skill « dessinateur » : des règles dans l'outil, ou un savoir-faire dans
  un skill ?

## Stratégie technique
