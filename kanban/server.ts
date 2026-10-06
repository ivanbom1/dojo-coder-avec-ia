// Le kanban du dojo : `bun kanban`, puis http://localhost:4000
import { Glob } from "bun";
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve, sep } from "node:path";

const cartes = resolve(process.env.CARTES ?? join(import.meta.dir, "../cartes"));
const tableau = join(cartes, "tableau.json");
const colonnes = ["a-faire", "en-cours", "fait"];

// L'état de chaque carte : sa colonne et les critères d'acceptation cochés (par position)
type Etat = { colonne?: string; coches?: number[] };

const lireTableau = (): Record<string, Etat> => {
  try {
    const brut: Record<string, string | Etat> = JSON.parse(readFileSync(tableau, "utf8"));
    // Ancien format : "sprint-1/01-formes": "fait"
    return Object.fromEntries(Object.entries(brut).map(([id, v]) => [id, typeof v === "string" ? { colonne: v } : v]));
  } catch { return {}; }
};

const ecrireTableau = (etats: Record<string, Etat>) => {
  const trie = Object.fromEntries(Object.entries(etats).sort(([a], [b]) => a.localeCompare(b)));
  // Les listes de coches sur une ligne, pour des diffs lisibles
  const json = JSON.stringify(trie, null, 2).replace(/\[\s+([\d,\s]+?)\s+\]/g, (_, n) => `[${n.split(/,\s*/).join(", ")}]`);
  writeFileSync(tableau, json + "\n");
};

async function lireCartes() {
  const etats = lireTableau();
  const fichiers = [...new Glob("sprint-*/*.md").scanSync(cartes)].map((f) => f.replaceAll("\\", "/")).sort();
  return Promise.all(fichiers.map(async (fichier) => {
    const markdown = await Bun.file(join(cartes, fichier)).text();
    const id = fichier.replace(/\.md$/, "");
    const titre = markdown.match(/^# +(.+)$/m)?.[1].trim() ?? id;
    return {
      id,
      sprint: fichier.split("/")[0],
      titre,
      bonus: /^> *Bonus *$/m.test(markdown),
      colonne: etats[id]?.colonne ?? "a-faire",
      coches: etats[id]?.coches ?? [],
      html: Bun.markdown.html(markdown),
    };
  }));
}

const server = Bun.serve({
  hostname: "localhost",
  port: Number(process.env.PORT ?? 4000),
  routes: {
    "/": new Response(Bun.file(join(import.meta.dir, "index.html"))),
    "/api/cartes": () => lireCartes().then((c) => Response.json(c)),
    "/api/tableau": {
      POST: async (req) => {
        const { id, colonne, coches } = await req.json();
        const colonneValide = colonne === undefined || colonnes.includes(colonne);
        const cochesValides = coches === undefined || (Array.isArray(coches) && coches.every((i) => Number.isInteger(i) && i >= 0));
        if (typeof id !== "string" || !colonneValide || !cochesValides) return new Response("Requête invalide", { status: 400 });
        const etats = lireTableau();
        const etat: Etat = { ...etats[id] };
        if (colonne !== undefined) etat.colonne = colonne;
        if (coches !== undefined) etat.coches = [...new Set<number>(coches)].sort((a, b) => a - b);
        if (!etat.coches?.length) delete etat.coches;
        if (Object.keys(etat).length) etats[id] = etat;
        else delete etats[id];
        ecrireTableau(etats);
        return new Response(null, { status: 204 });
      },
    },
    // Les images des cartes (section « Visuels »), en chemin relatif au fichier de la carte
    "/cartes/*": async (req) => {
      const fichier = resolve(cartes, decodeURIComponent(new URL(req.url).pathname.slice("/cartes/".length)));
      const file = Bun.file(fichier);
      if (!fichier.startsWith(cartes + sep) || !(await file.exists())) return new Response("Introuvable", { status: 404 });
      return new Response(file);
    },
  },
});

console.log(`Kanban : ${server.url}`);
