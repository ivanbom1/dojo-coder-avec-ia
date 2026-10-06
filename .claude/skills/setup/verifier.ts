// Vérifications du skill setup : `bun .claude/skills/setup/verifier.ts`, depuis la racine du dépôt.
// Une ligne par point, ✅ ou ❌ suivi de la correction ; code de sortie 1 si un point échoue.
import { existsSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const CLAUDE_CODE_TESTE = '2.1.289'
const URL_APPLI = 'http://localhost:5173'

let echecs = 0
const ok = (texte: string) => console.log(`✅ ${texte}`)
const ko = (texte: string, correction: string) => {
  echecs++
  console.log(`❌ ${texte}\n   → ${correction}`)
}

function sortie(commande: string[]): string | null {
  try {
    const resultat = Bun.spawnSync(commande, { stderr: 'ignore' })
    return resultat.success ? resultat.stdout.toString().trim() : null
  } catch {
    return null
  }
}

async function repond(): Promise<boolean> {
  try {
    const reponse = await fetch(URL_APPLI)
    return reponse.ok && (await reponse.text()).includes('id="root"')
  } catch {
    return false
  }
}

// 1. Claude Code : toute version convient, le dojo a été testé avec CLAUDE_CODE_TESTE
const claude = sortie(['claude', '--version'])?.split(' ')[0]
if (claude === undefined) ko('Claude Code introuvable dans le PATH', 'installe Claude Code (README, étape 1)')
else ok(`Claude Code ${claude}${claude === CLAUDE_CODE_TESTE ? '' : ` (dojo testé avec ${CLAUDE_CODE_TESTE})`}`)

// 2. bun et git
if (typeof (Bun as { markdown?: { html?: unknown } }).markdown?.html === 'function') ok(`bun ${Bun.version}`)
else ko(`bun ${Bun.version} trop ancien pour le kanban`, 'bun upgrade')

const git = sortie(['git', '--version'])
if (git === null) ko('git introuvable', 'installe git')
else {
  ok(git)
  const nom = sortie(['git', 'config', 'user.name'])
  const email = sortie(['git', 'config', 'user.email'])
  if (nom && email) ok(`identité git : ${nom} <${email}>`)
  else ko('identité git manquante (user.name ou user.email)', 'demande son nom et son email à l’élève, puis git config --global user.name "…" et git config --global user.email "…"')
}

// 3. Dépendances
if (existsSync('node_modules/vite')) ok('dépendances installées')
else ko('dépendances absentes', 'bun install')

// 4. Chromium pour Playwright
const navigateurs =
  process.env.PLAYWRIGHT_BROWSERS_PATH ??
  (process.platform === 'darwin'
    ? join(homedir(), 'Library/Caches/ms-playwright')
    : process.platform === 'win32'
      ? join(process.env.LOCALAPPDATA ?? join(homedir(), 'AppData/Local'), 'ms-playwright')
      : join(homedir(), '.cache/ms-playwright'))
const chromium = existsSync(navigateurs) && readdirSync(navigateurs).some((d) => d.startsWith('chromium-'))
if (chromium) ok('Chromium pour Playwright')
else ko('Chromium pour Playwright absent', 'bunx playwright@1.63.0 install chromium')

// 5. L'appli
if (await repond()) ok(`l'appli répond déjà sur ${URL_APPLI}`)
else if (!existsSync('node_modules/vite')) ko("l'appli n'a pas pu être lancée", 'bun install, puis relance cette vérification')
else {
  const dev = Bun.spawn(['bun', 'run', 'dev'], { stdout: 'ignore', stderr: 'pipe' })
  let lancee = false
  for (let i = 0; i < 60 && !lancee; i++) {
    lancee = await repond()
    if (!lancee) await Bun.sleep(250)
  }
  dev.kill()
  const erreurs = (await new Response(dev.stderr).text()).trim()
  if (lancee) ok(`bun dev : la page répond sur ${URL_APPLI}`)
  else if (erreurs.includes('already in use')) ko('le port 5173 est déjà pris par un autre programme', 'ferme l’autre serveur de dev (ou redémarre la machine), puis relance cette vérification')
  else ko("bun dev : la page ne répond pas", `lis l'erreur ci-dessous ; si elle ne dit rien d'évident, lève la main\n${erreurs.split('\n').slice(-10).join('\n')}`)
}

console.log(echecs === 0 ? '\nTout est bon.' : `\n${echecs} point(s) à corriger.`)
process.exit(echecs === 0 ? 0 : 1)
