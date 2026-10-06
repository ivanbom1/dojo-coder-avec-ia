---
name: setup
description: Prépare et vérifie le poste de l'élève pour le dojo.
disable-model-invocation: true
---

Tu prépares le poste d'un élève qui débute. Tu as déjà la preuve que sa clé marche : tu lui
réponds. Ne modifie aucun fichier du dépôt : la config y est versionnée. Seule exception :
`cartes/niveau.md`, ignoré par git, à l'étape 6.

Explique chaque étape en une phrase avant de la lancer. Si une invite de permission
s'affiche, dis à l'élève qu'il peut l'accepter (« Yes ») et pourquoi ; ne l'annonce pas
d'avance : en mode auto, la plupart des commandes passent sans invite.

1. `bun --version`. Si bun manque, installe-le : `curl -fsSL https://bun.sh/install | bash`
   sur macOS et Linux, `powershell -c "irm bun.sh/install.ps1 | iex"` sous Windows. Puis
   arrête-toi : l'élève ferme son terminal, en rouvre un, relance `claude` dans le dépôt
   et retape `/setup`.
2. `bun install`.
3. `bunx playwright@1.63.0 install chromium` : le navigateur des futurs tests, environ
   180 Mo. Rien n'est ajouté au projet.
4. `bun .claude/skills/setup/verifier.ts` : il vérifie Claude Code, bun, git et l'identité git,
   les dépendances, Chromium, puis lance l'appli et vérifie que la page répond.
5. Pour chaque ligne ❌, applique la correction qu'elle indique, puis relance le script.
   Les cas où l'élève agit lui-même :
   - identité git : demande-lui son nom et son email, puis configure-les ;
   - git absent : `xcode-select --install` sur macOS (une fenêtre s'ouvre, il accepte),
     `winget install --id Git.Git -e` sous Windows, puis l'élève ferme son terminal, en rouvre
     un et relance `claude` (Claude Code passe alors par Git Bash) ; sous Linux, il lève la main.

   Deux essais au plus par point. Au-delà, ou si une correction demande un mot de passe
   administrateur, l'élève lève la main.
6. Demande son niveau en code à l'élève : suis `.claude/skills/code-owner/niveau.md`.
7. Fais le bilan, une ligne par point. Si tout est bon, termine par :
   « Tout est bon. Lance `bun dev` dans un autre terminal, ouvre http://localhost:5173 :
   tu dois voir une page blanche titrée « Croquis ». Lance aussi `bun kanban` dans un
   troisième terminal et ouvre http://localhost:4000 : c'est ton tableau. » Sinon, liste
   ce qui reste à faire et dis à l'élève de lever la main.

Le setup est fini quand `cartes/niveau.md` est écrit et que le script affiche « Tout est
bon. », ou que chaque ❌ restant a été essayé deux fois et figure dans le bilan.
