import { expect, test, type Page } from '@playwright/test'

// Ces tests rejouent les cartes déjà faites, dans un vrai navigateur : ils cliquent et
// glissent comme un utilisateur, puis relisent le canvas. Aucun ne regarde dans le code :
// chaque test reprend un critère d'acceptation d'une carte, et porte son nom.

const CANVAS = 'canvas.board__canvas'

type PointCanvas = [number, number]
type Region = [number, number, number, number]

// Ce que l'utilisateur voit : les pixels non transparents du canvas.
type Encre = {
  x1: number
  y1: number
  x2: number
  y2: number
  nombre: number
  centre: PointCanvas
}

async function ouvrir(page: Page) {
  await page.goto('/')
  await page.locator(CANVAS).waitFor()
  await page.waitForTimeout(150)
}

async function origine(page: Page) {
  const box = await page.locator(CANVAS).boundingBox()
  if (!box) throw new Error('canvas introuvable')
  return box
}

async function choisir(page: Page, outil: string) {
  await page.getByRole('button', { name: outil }).click()
  await page.waitForTimeout(50)
}

async function glisser(page: Page, [x1, y1]: PointCanvas, [x2, y2]: PointCanvas) {
  const box = await origine(page)
  await page.mouse.move(box.x + x1, box.y + y1)
  await page.mouse.down()
  await page.mouse.move(box.x + x2, box.y + y2, { steps: 10 })
  await page.mouse.up()
  await page.waitForTimeout(50)
}

async function cliquer(page: Page, [x, y]: PointCanvas) {
  const box = await origine(page)
  await page.mouse.click(box.x + x, box.y + y)
  await page.waitForTimeout(50)
}

async function doubleCliquer(page: Page, [x, y]: PointCanvas) {
  const box = await origine(page)
  await page.mouse.dblclick(box.x + x, box.y + y)
  await page.waitForTimeout(50)
}

// Mesure l'encre du canvas, dans une région donnée (tout le canvas par défaut).
async function encre(page: Page, region?: Region): Promise<Encre | null> {
  return page.evaluate((region) => {
    const c = document.querySelector('canvas.board__canvas') as HTMLCanvasElement
    const dpr = window.devicePixelRatio || 1
    const ctx = c.getContext('2d', { willReadFrequently: true })!
    const [rx, ry, rw, rh] = region ?? [0, 0, c.width / dpr, c.height / dpr]
    const largeur = Math.round(rw * dpr)
    const d = ctx.getImageData(Math.round(rx * dpr), Math.round(ry * dpr), largeur, Math.round(rh * dpr)).data
    let x1 = Infinity
    let y1 = Infinity
    let x2 = -Infinity
    let y2 = -Infinity
    let nombre = 0
    let sommeX = 0
    let sommeY = 0
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] === 0) continue
      const p = i / 4
      const x = (p % largeur) / dpr + rx
      const y = Math.floor(p / largeur) / dpr + ry
      if (x < x1) x1 = x
      if (y < y1) y1 = y
      if (x > x2) x2 = x
      if (y > y2) y2 = y
      nombre += 1
      sommeX += x
      sommeY += y
    }
    if (nombre === 0) return null
    return { x1, y1, x2, y2, nombre, centre: [sommeX / nombre, sommeY / nombre] as [number, number] }
  }, region)
}

function opaque(page: Page, region: Region) {
  return encre(page, region).then((e) => (e?.nombre ?? 0) > 0)
}

function epaisseur(page: Page, x: number, y1: number, y2: number) {
  return encre(page, [x, y1, 1, y2]).then((e) => e?.nombre ?? 0)
}

// Le trait est épais de quelques pixels : on tolère la largeur du pinceau.
function proche(valeur: number, cible: number, tolerance = 2) {
  expect(Math.abs(valeur - cible), `${valeur} devrait être proche de ${cible}`).toBeLessThanOrEqual(
    tolerance,
  )
}

// Trois rectangles alignés, reliés en chaîne : A → B → C.
async function chaineDeTroisFormes(page: Page) {
  await choisir(page, 'Rectangle')
  await glisser(page, [100, 150], [220, 250]) // A
  await glisser(page, [350, 150], [470, 250]) // B
  await glisser(page, [600, 150], [720, 250]) // C
  await choisir(page, 'Flèche')
  await glisser(page, [220, 200], [350, 200]) // A droite → B gauche
  await glisser(page, [470, 200], [600, 200]) // B droite → C gauche
}

// Un rectangle avec « Dedans » écrit dedans.
async function rectangleAvecTexte(page: Page) {
  await choisir(page, 'Rectangle')
  await glisser(page, [200, 300], [450, 450])
  await doubleCliquer(page, [325, 375])
  await page.keyboard.type('Dedans')
  await cliquer(page, [1000, 700])
}

// Recharge la page en laissant d'abord la sauvegarde automatique se faire.
async function recharger(page: Page) {
  await page.waitForTimeout(450)
  await page.reload()
  await page.locator(CANVAS).waitFor()
  await page.waitForTimeout(250)
}

test("carte 1 : dessiner en tirant dans n'importe quel sens donne une forme à la taille du geste", async ({
  page,
}) => {
  await ouvrir(page)
  await choisir(page, 'Rectangle')
  // Le geste part du coin bas-droit et remonte vers le haut-gauche.
  await glisser(page, [700, 500], [400, 300])

  const dessin = await encre(page)
  expect(dessin, 'aucune forme dessinée').not.toBeNull()
  proche(dessin!.x1, 400)
  proche(dessin!.y1, 300)
  proche(dessin!.x2, 700)
  proche(dessin!.y2, 500)
})

test('carte 1 : un simple clic ne crée pas de forme', async ({ page }) => {
  await ouvrir(page)
  await choisir(page, 'Rectangle')
  await cliquer(page, [500, 400])

  expect(await encre(page), 'un clic sans glisser a créé quelque chose').toBeNull()
})

test('carte 1 : une forme déplacée suit la souris sans sauter', async ({ page }) => {
  await ouvrir(page)
  await choisir(page, 'Rectangle')
  await glisser(page, [300, 300], [500, 450])
  const avant = await encre(page)

  await choisir(page, 'Sélection')
  await glisser(page, [400, 375], [700, 525]) // +300 en x, +150 en y
  await cliquer(page, [1000, 700]) // on désélectionne : les poignées ne comptent pas dans la forme
  const apres = await encre(page)

  expect(avant, 'la forme de départ manque').not.toBeNull()
  expect(apres, 'la forme a disparu').not.toBeNull()
  proche(apres!.x1 - avant!.x1, 300)
  proche(apres!.y1 - avant!.y1, 150)
  proche(apres!.x2 - avant!.x2, 300)
  proche(apres!.y2 - avant!.y2, 150)
})

test('carte 2 : un texte libre et un texte dans un rectangle restent tous les deux affichés', async ({
  page,
}) => {
  await ouvrir(page)
  await choisir(page, 'Texte')
  await cliquer(page, [820, 130])
  await page.keyboard.type('Libre')
  await cliquer(page, [1000, 700])

  await rectangleAvecTexte(page)

  expect(await opaque(page, [760, 100, 220, 60]), 'le texte libre a disparu').toBe(true)
  expect(await opaque(page, [215, 315, 220, 120]), 'le texte dans le rectangle a disparu').toBe(true)
})

test('carte 2 : déplacer le rectangle garde son texte centré dedans', async ({ page }) => {
  await ouvrir(page)
  await rectangleAvecTexte(page)

  // Le texte seul, à l'intérieur de la forme (le bord est écarté de quelques pixels).
  const avant = await encre(page, [206, 306, 238, 138])
  expect(avant, 'aucun texte dans le rectangle').not.toBeNull()
  proche(avant!.centre[0], 325, 4)
  proche(avant!.centre[1], 375, 4)

  await choisir(page, 'Sélection')
  await glisser(page, [325, 375], [575, 525]) // +250 en x, +150 en y

  const apres = await encre(page, [456, 456, 238, 138])
  expect(apres, 'le texte a disparu avec le déplacement').not.toBeNull()
  proche(apres!.centre[0], 575, 4)
  proche(apres!.centre[1], 525, 4)
})

test('carte 2 : valider un texte vide ne laisse rien sur le canevas', async ({ page }) => {
  await ouvrir(page)
  await choisir(page, 'Texte')
  await cliquer(page, [400, 300])
  await page.keyboard.type('abc')
  await page.keyboard.press('Backspace')
  await page.keyboard.press('Backspace')
  await page.keyboard.press('Backspace')
  await cliquer(page, [900, 700])

  expect(await encre(page), 'un texte vidé est resté affiché').toBeNull()
})

test('carte 3 : relier trois formes en chaîne donne deux flèches, chacune avec sa pointe du bon côté', async ({
  page,
}) => {
  await ouvrir(page)
  await chaineDeTroisFormes(page)

  expect(await opaque(page, [280, 195, 10, 10]), 'pas de flèche entre A et B').toBe(true)
  expect(await opaque(page, [530, 195, 10, 10]), 'pas de flèche entre B et C').toBe(true)

  // La pointe est un triangle : la flèche est plus épaisse près de son arrivée que de son départ.
  const auDepart = await epaisseur(page, 240, 190, 210)
  const aLArrivee = await epaisseur(page, 344, 190, 210)
  expect(aLArrivee, `pointe absente ou à l'envers (départ ${auDepart} px, arrivée ${aLArrivee} px)`).toBeGreaterThan(
    auDepart,
  )
})

test('carte 3 : déplacer la forme du milieu fait suivre les deux flèches', async ({ page }) => {
  await ouvrir(page)
  await chaineDeTroisFormes(page)

  await choisir(page, 'Sélection')
  await glisser(page, [410, 200], [410, 400]) // la forme du milieu descend de 200

  expect(await opaque(page, [280, 295, 10, 10]), 'la flèche A → B ne suit pas').toBe(true)
  expect(await opaque(page, [530, 295, 10, 10]), 'la flèche B → C ne suit pas').toBe(true)
  expect(await opaque(page, [280, 195, 10, 10]), "l'ancien tracé est resté affiché").toBe(false)
})

test("carte 3 : les flèches s'arrêtent au bord des formes, pas en leur centre", async ({ page }) => {
  await ouvrir(page)
  await chaineDeTroisFormes(page)

  // Le milieu de chaque forme reste vide : le trait s'arrête sur le bord.
  expect(await opaque(page, [155, 195, 10, 10]), "un trait entre au centre de A").toBe(false)
  expect(await opaque(page, [405, 195, 10, 10]), 'un trait entre au centre de B').toBe(false)
  expect(await opaque(page, [655, 195, 10, 10]), 'un trait entre au centre de C').toBe(false)
  // Et il est bien dessiné entre les formes.
  expect(await opaque(page, [280, 195, 10, 10]), "la flèche n'est pas dessinée").toBe(true)
})

test('carte 6 : recharger retrouve le schéma tel qu’il était', async ({ page }) => {
  await ouvrir(page)
  await choisir(page, 'Rectangle')
  await glisser(page, [150, 200], [350, 340]) // forme qui porte le texte
  await glisser(page, [550, 200], [750, 340]) // seconde forme
  await choisir(page, 'Sélection')
  await doubleCliquer(page, [250, 270])
  await page.keyboard.type('Dedans')
  await cliquer(page, [1000, 700])
  await choisir(page, 'Flèche')
  await glisser(page, [350, 270], [550, 270]) // la flèche qui les relie
  // On repasse en Sélection : avec l'outil Flèche, les points d'ancrage s'ajoutent au dessin.
  await choisir(page, 'Sélection')
  await cliquer(page, [1000, 700]) // rien de sélectionné, comme après un rechargement
  const avant = await encre(page)

  await recharger(page)
  const apres = await encre(page)

  expect(avant, 'rien dessiné avant le rechargement').not.toBeNull()
  expect(apres, 'le schéma a disparu au rechargement').not.toBeNull()
  proche(apres!.x1, avant!.x1)
  proche(apres!.y1, avant!.y1)
  proche(apres!.x2, avant!.x2)
  proche(apres!.y2, avant!.y2)
  expect(await opaque(page, [220, 255, 60, 30]), 'le texte n’est pas revenu').toBe(true)
  expect(await opaque(page, [440, 265, 20, 10]), 'la flèche n’est pas revenue').toBe(true)
})

test('carte 6 : après un rechargement, déplacer une forme fait toujours suivre la flèche', async ({
  page,
}) => {
  await ouvrir(page)
  await choisir(page, 'Rectangle')
  await glisser(page, [100, 150], [220, 250]) // A
  await glisser(page, [350, 150], [470, 250]) // B
  await choisir(page, 'Flèche')
  await glisser(page, [220, 200], [350, 200]) // A droite → B gauche

  await recharger(page)

  await choisir(page, 'Sélection')
  await glisser(page, [410, 200], [410, 400]) // B descend de 200
  expect(await opaque(page, [280, 295, 10, 10]), 'la flèche ne suit plus après un rechargement').toBe(
    true,
  )
  expect(await opaque(page, [280, 195, 10, 10]), "l'ancien tracé est resté affiché").toBe(false)
})

test('carte 6 : tout supprimer puis recharger laisse le canevas vide', async ({ page }) => {
  await ouvrir(page)
  await choisir(page, 'Rectangle')
  await glisser(page, [200, 200], [400, 350])
  await glisser(page, [500, 200], [700, 350])

  await choisir(page, 'Sélection')
  await cliquer(page, [300, 275])
  await page.keyboard.press('Delete')
  await cliquer(page, [600, 275])
  await page.keyboard.press('Delete')
  expect(await encre(page), 'les formes ne sont pas parties').toBeNull()

  await recharger(page)
  expect(await encre(page), 'le schéma supprimé est revenu au rechargement').toBeNull()
})

const ANNULER = 'Control+z'
const RETABLIR = 'Control+Shift+z'

test("carte 7 : annuler un déplacement remet la forme d'un coup à sa place", async ({ page }) => {
  await ouvrir(page)
  await choisir(page, 'Rectangle')
  await glisser(page, [300, 300], [500, 450])
  await choisir(page, 'Sélection')
  const avant = await encre(page)

  await glisser(page, [400, 375], [700, 525])
  const deplacee = await encre(page)
  expect(deplacee!.x1, 'la forme ne s’est pas déplacée').not.toBe(avant!.x1)

  await page.keyboard.press(ANNULER)
  await cliquer(page, [1000, 700]) // la sélection reste après l'annulation : on la retire avant de mesurer
  const apres = await encre(page)
  expect(apres, 'la forme a disparu à l’annulation').not.toBeNull()
  proche(apres!.x1, avant!.x1, 0)
  proche(apres!.y1, avant!.y1, 0)
  proche(apres!.x2, avant!.x2, 0)
  proche(apres!.y2, avant!.y2, 0)
})

test('carte 7 : annuler la suppression d’une forme reliée ramène la forme et ses flèches', async ({
  page,
}) => {
  await ouvrir(page)
  await chaineDeTroisFormes(page)
  await choisir(page, 'Sélection')
  const avant = await encre(page)

  await cliquer(page, [410, 200]) // la forme du milieu
  await page.keyboard.press('Delete')
  expect(await opaque(page, [280, 195, 10, 10]), 'la flèche A → B est restée').toBe(false)
  expect(await opaque(page, [530, 195, 10, 10]), 'la flèche B → C est restée').toBe(false)

  await page.keyboard.press(ANNULER)
  const apres = await encre(page)
  expect(await opaque(page, [280, 195, 10, 10]), 'la flèche A → B n’est pas revenue').toBe(true)
  expect(await opaque(page, [530, 195, 10, 10]), 'la flèche B → C n’est pas revenue').toBe(true)
  expect(apres!.nombre, 'le schéma n’est pas revenu tel qu’il était').toBe(avant!.nombre)
})

test('carte 7 : annuler trois fois puis rétablir trois fois retrouve le schéma', async ({ page }) => {
  await ouvrir(page)
  await choisir(page, 'Rectangle')
  await glisser(page, [100, 150], [220, 250])
  await glisser(page, [350, 150], [470, 250])
  await glisser(page, [600, 150], [720, 250])
  const avant = await encre(page)

  for (let i = 0; i < 3; i += 1) await page.keyboard.press(ANNULER)
  expect(await encre(page), 'le canevas n’est pas vide après trois annulations').toBeNull()

  for (let i = 0; i < 3; i += 1) await page.keyboard.press(RETABLIR)
  const apres = await encre(page)
  expect(apres, 'rien n’est revenu après trois rétablissements').not.toBeNull()
  expect(apres!.nombre).toBe(avant!.nombre)
  proche(apres!.x1, avant!.x1, 0)
  proche(apres!.x2, avant!.x2, 0)
})

test('carte 7 : après un rechargement, on peut encore annuler', async ({ page }) => {
  await ouvrir(page)
  await choisir(page, 'Rectangle')
  await glisser(page, [100, 150], [220, 250])
  await glisser(page, [600, 150], [720, 250])

  await recharger(page)
  await page.keyboard.press(ANNULER)

  expect(await opaque(page, [600, 150, 120, 100]), 'la seconde forme n’a pas été annulée').toBe(false)
  expect(await opaque(page, [100, 150, 120, 100]), 'la première forme a disparu aussi').toBe(true)
})

test('carte 7 : pendant l’écriture d’un texte, Ctrl+Z ne défait pas le schéma', async ({ page }) => {
  await ouvrir(page)
  await choisir(page, 'Rectangle')
  await glisser(page, [200, 300], [450, 450])
  await doubleCliquer(page, [325, 375])
  await page.keyboard.type('abc')
  await page.keyboard.press(ANNULER)
  await cliquer(page, [1000, 700])

  expect(await opaque(page, [200, 300, 250, 150]), 'la forme a été annulée pendant la frappe').toBe(true)
})

// Couleur moyenne (r, g, b) des pixels bien visibles d'une région : celle que voit l'utilisateur.
async function couleur(page: Page, region: Region): Promise<[number, number, number] | null> {
  return page.evaluate((region) => {
    const c = document.querySelector('canvas.board__canvas') as HTMLCanvasElement
    const dpr = window.devicePixelRatio || 1
    const ctx = c.getContext('2d', { willReadFrequently: true })!
    const [rx, ry, rw, rh] = region
    const d = ctx.getImageData(Math.round(rx * dpr), Math.round(ry * dpr), Math.round(rw * dpr), Math.round(rh * dpr)).data
    let n = 0
    let r = 0
    let g = 0
    let b = 0
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 100) continue
      n += 1
      r += d[i]
      g += d[i + 1]
      b += d[i + 2]
    }
    return n === 0 ? null : ([r / n, g / n, b / n] as [number, number, number])
  }, region)
}

function hex(valeur: string): [number, number, number] {
  return [1, 3, 5].map((i) => parseInt(valeur.slice(i, i + 2), 16)) as [number, number, number]
}

function estCouleur(vu: [number, number, number] | null, attendu: string, nom: string) {
  expect(vu, `${nom} : rien n'est dessiné là`).not.toBeNull()
  const cible = hex(attendu)
  for (let i = 0; i < 3; i += 1) {
    expect(Math.abs(vu![i] - cible[i]), `${nom} : ${vu!.map(Math.round)} au lieu de ${cible}`).toBeLessThanOrEqual(12)
  }
}

async function pastille(page: Page, nom: string) {
  await page.getByRole('button', { name: nom, exact: true }).click()
  await page.waitForTimeout(50)
}

test('carte 8 : une forme, une flèche et un texte coloriés gardent chacun leur couleur', async ({
  page,
}) => {
  await ouvrir(page)
  await choisir(page, 'Rectangle')
  await glisser(page, [100, 150], [220, 250]) // A
  await glisser(page, [350, 150], [470, 250]) // B
  await choisir(page, 'Flèche')
  await glisser(page, [220, 200], [350, 200]) // A → B
  await choisir(page, 'Texte')
  await cliquer(page, [820, 150])
  await page.keyboard.type('Libre')
  await cliquer(page, [1000, 600])
  await choisir(page, 'Sélection')

  await cliquer(page, [160, 160]) // la forme A
  await pastille(page, 'Trait rouge')
  await pastille(page, 'Fond jaune')
  await cliquer(page, [285, 200]) // la flèche
  await pastille(page, 'Trait vert')
  await cliquer(page, [840, 162]) // le texte
  await pastille(page, 'Trait bleu')
  await cliquer(page, [1000, 600]) // plus rien de sélectionné

  estCouleur(await couleur(page, [99, 190, 1, 20]), '#e03131', 'le trait de la forme')
  estCouleur(await couleur(page, [130, 180, 20, 20]), '#ffec99', 'le fond de la forme')
  estCouleur(await couleur(page, [260, 199, 10, 3]), '#2f9e44', 'la flèche')
  estCouleur(await couleur(page, [820, 150, 60, 25]), '#1971c2', 'le texte')
})

test('carte 8 : le texte dans une forme colorée reste lisible sur chaque fond', async ({ page }) => {
  await ouvrir(page)
  await rectangleAvecTexte(page)
  await choisir(page, 'Sélection')
  await cliquer(page, [210, 310])

  for (const fond of ['rouge', 'vert', 'bleu', 'jaune']) {
    await pastille(page, `Fond ${fond}`)
    // Contraste entre le fond (la couleur la plus fréquente) et le pixel le plus sombre : le texte.
    const contraste = await page.evaluate(() => {
      const c = document.querySelector('canvas.board__canvas') as HTMLCanvasElement
      const dpr = window.devicePixelRatio || 1
      const ctx = c.getContext('2d', { willReadFrequently: true })!
      const d = ctx.getImageData(206 * dpr, 306 * dpr, 238 * dpr, 138 * dpr).data
      const luminance = (r: number, g: number, b: number) => {
        const lin = (v: number) => {
          const s = v / 255
          return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
        }
        return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
      }
      const comptes = new Map<string, number>()
      let sombre = 1
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] !== 255) continue
        const cle = `${d[i]},${d[i + 1]},${d[i + 2]}`
        comptes.set(cle, (comptes.get(cle) ?? 0) + 1)
        sombre = Math.min(sombre, luminance(d[i], d[i + 1], d[i + 2]))
      }
      const [fondCle] = [...comptes.entries()].sort((a, b) => b[1] - a[1])[0]
      const [r, g, b] = fondCle.split(',').map(Number)
      return (luminance(r, g, b) + 0.05) / (sombre + 0.05)
    })
    expect(contraste, `le texte est illisible sur le fond ${fond} (contraste ${contraste.toFixed(1)})`).toBeGreaterThanOrEqual(7)
  }
})

test('carte 8 : les couleurs survivent à un rechargement et s’annulent avec Ctrl+Z', async ({
  page,
}) => {
  await ouvrir(page)
  await choisir(page, 'Rectangle')
  await glisser(page, [100, 150], [220, 250])
  await choisir(page, 'Sélection')
  await cliquer(page, [160, 160])
  await pastille(page, 'Trait rouge')
  await pastille(page, 'Fond vert')
  await cliquer(page, [1000, 600])

  await recharger(page)
  estCouleur(await couleur(page, [99, 190, 1, 20]), '#e03131', 'le trait après rechargement')
  estCouleur(await couleur(page, [130, 180, 20, 20]), '#b2f2bb', 'le fond après rechargement')

  await page.keyboard.press(ANNULER) // le fond s'en va
  expect(await opaque(page, [130, 180, 20, 20]), 'le fond est resté').toBe(false)
  estCouleur(await couleur(page, [99, 190, 1, 20]), '#e03131', 'le trait garde sa couleur')

  await page.keyboard.press(ANNULER) // le trait redevient noir
  estCouleur(await couleur(page, [99, 190, 1, 20]), '#1e1e1e', 'le trait annulé')
})

test('carte 9 : les flèches reliées suivent le bord de la forme redimensionnée', async ({ page }) => {
  await ouvrir(page)
  await choisir(page, 'Rectangle')
  await glisser(page, [100, 150], [220, 250]) // A
  await glisser(page, [350, 150], [470, 250]) // B
  await choisir(page, 'Flèche')
  await glisser(page, [220, 200], [350, 200]) // A → B
  await choisir(page, 'Sélection')

  await cliquer(page, [410, 200]) // sélectionne B
  await glisser(page, [350, 150], [300, 150]) // tire sa poignée haut-gauche vers la gauche

  expect(await opaque(page, [250, 195, 30, 10]), 'la flèche a disparu').toBe(true)
  expect(await opaque(page, [310, 195, 30, 10]), 'la flèche traverse encore B, elle ne suit pas son bord').toBe(false)
  expect(await opaque(page, [296, 190, 8, 20]), 'la flèche n’arrive pas au nouveau bord de B').toBe(true)
})

test('carte 9 : le texte de la forme reste centré après un redimensionnement', async ({ page }) => {
  await ouvrir(page)
  await rectangleAvecTexte(page) // [200,300] → [450,450]
  await choisir(page, 'Sélection')
  await cliquer(page, [210, 310])
  await glisser(page, [450, 450], [650, 550]) // poignée bas-droite : la forme devient [200,300] → [650,550]

  const texte = await encre(page, [206, 306, 438, 238])
  expect(texte, 'le texte a disparu au redimensionnement').not.toBeNull()
  proche(texte!.centre[0], 425, 4)
  proche(texte!.centre[1], 425, 4)
})

test('carte 9 : tirer une poignée au-delà du coin opposé ne fait pas disparaître la forme', async ({
  page,
}) => {
  await ouvrir(page)
  await choisir(page, 'Rectangle')
  await glisser(page, [200, 300], [450, 450])
  await choisir(page, 'Sélection')
  await cliquer(page, [300, 375])
  await glisser(page, [200, 300], [600, 500]) // la poignée haut-gauche passe au-delà du coin bas-droit

  expect(await opaque(page, [430, 430, 30, 30]), 'la forme a disparu').toBe(true)

  // Elle reste manipulable : on l'attrape par son milieu et on la déplace.
  await glisser(page, [445, 445], [545, 545])
  expect(await opaque(page, [530, 530, 30, 30]), 'la forme n’a pas pu être déplacée').toBe(true)
  expect(await opaque(page, [420, 420, 20, 20]), 'la forme est restée à son ancienne place').toBe(false)
})

test('carte 9 : annuler un redimensionnement remet la taille d’un coup', async ({ page }) => {
  await ouvrir(page)
  await choisir(page, 'Rectangle')
  await glisser(page, [300, 300], [500, 450])
  await choisir(page, 'Sélection')
  await cliquer(page, [400, 375])
  const avant = await encre(page)

  await glisser(page, [500, 450], [700, 550])
  expect((await encre(page))!.x2, 'la forme n’a pas grandi').toBeGreaterThan(avant!.x2 + 100)

  await page.keyboard.press(ANNULER)
  const apres = await encre(page)
  proche(apres!.x2, avant!.x2, 0)
  proche(apres!.y2, avant!.y2, 0)
})

// Clique en tenant Maj, pour ajouter un élément à la sélection ou l'en retirer.
async function cliquerAvecMaj(page: Page, point: PointCanvas) {
  await page.keyboard.down('Shift')
  await cliquer(page, point)
  await page.keyboard.up('Shift')
}

// A et B reliés par une flèche, puis les deux formes sélectionnées (la flèche, non).
async function deuxFormesReliees(page: Page) {
  await choisir(page, 'Rectangle')
  await glisser(page, [100, 150], [220, 250]) // A
  await glisser(page, [350, 150], [470, 250]) // B
  await choisir(page, 'Flèche')
  await glisser(page, [220, 200], [350, 200]) // A → B
  await choisir(page, 'Sélection')
  await cliquer(page, [160, 160])
  await cliquerAvecMaj(page, [410, 160])
}

test('carte 10 : copier-coller deux formes reliées donne une copie avec sa propre flèche, reliée aux copies', async ({
  page,
}) => {
  await ouvrir(page)
  await deuxFormesReliees(page)
  await page.keyboard.press('Control+c')
  await page.keyboard.press('Control+v') // les copies sont décalées de 20 px en x et en y

  // La flèche de la copie : 20 px plus bas que l'originale.
  expect(await opaque(page, [290, 215, 10, 10]), 'la copie n’a pas sa flèche').toBe(true)

  // Elle est bien reliée aux copies : en descendant la copie de B, sa flèche la suit.
  await cliquer(page, [1000, 700])
  await glisser(page, [480, 260], [480, 360]) // B' (seule la copie couvre ce point)
  expect(await opaque(page, [290, 265, 20, 20]), 'la flèche de la copie ne suit pas sa forme').toBe(true)
  // L'original garde sa flèche, droite, entre A et B.
  expect(await opaque(page, [270, 195, 10, 10]), 'la flèche d’origine a bougé').toBe(true)
})

test('carte 10 : déplacer la copie ne déplace pas l’original', async ({ page }) => {
  await ouvrir(page)
  await deuxFormesReliees(page)
  await page.keyboard.press('Control+c')
  await page.keyboard.press('Control+v')

  // Les copies sont sélectionnées : on les déplace ensemble, loin des originaux.
  await glisser(page, [140, 190], [540, 490]) // la copie de A, attrapée là où seule elle se trouve
  expect(await opaque(page, [95, 145, 12, 12]), 'l’original de A a bougé').toBe(true)
  expect(await opaque(page, [345, 145, 12, 12]), 'l’original de B a bougé').toBe(true)
  expect(await opaque(page, [515, 500, 10, 20]), 'la copie n’a pas bougé').toBe(true)
})

test('carte 10 : un collage s’annule en un seul Ctrl+Z', async ({ page }) => {
  await ouvrir(page)
  await deuxFormesReliees(page)
  await page.keyboard.press('Control+c')
  await page.keyboard.press('Control+v')
  expect(await opaque(page, [480, 255, 15, 15]), 'le collage n’a rien créé').toBe(true)

  await page.keyboard.press(ANNULER)
  expect(await opaque(page, [480, 255, 15, 15]), 'la copie de B est restée').toBe(false)
  expect(await opaque(page, [290, 215, 10, 10]), 'la flèche de la copie est restée').toBe(false)
  expect(await opaque(page, [95, 145, 12, 12]), 'l’original de A a disparu').toBe(true)
  expect(await opaque(page, [270, 195, 10, 10]), 'la flèche d’origine a disparu').toBe(true)
})

test('carte 10 : Maj+clic ajoute et retire un élément, et la sélection se déplace d’un coup', async ({
  page,
}) => {
  await ouvrir(page)
  await choisir(page, 'Rectangle')
  await glisser(page, [100, 150], [220, 250]) // A
  await glisser(page, [350, 150], [470, 250]) // B
  await choisir(page, 'Sélection')

  // B est ajoutée puis retirée : seule A reste sélectionnée, donc seule A bouge.
  await cliquer(page, [160, 160])
  await cliquerAvecMaj(page, [410, 160])
  await cliquerAvecMaj(page, [410, 160])
  await glisser(page, [160, 200], [160, 400])
  expect(await opaque(page, [345, 145, 12, 12]), 'B a bougé alors qu’elle était retirée').toBe(true)
  expect(await opaque(page, [95, 145, 12, 12]), 'A n’a pas bougé').toBe(false)

  // Avec les deux, tout bouge ensemble.
  await cliquer(page, [1000, 700])
  await cliquer(page, [160, 360])
  await cliquerAvecMaj(page, [410, 160])
  await glisser(page, [410, 160], [410, 360])
  expect(await opaque(page, [345, 145, 12, 12]), 'B n’a pas bougé avec la sélection').toBe(false)
  expect(await opaque(page, [345, 345, 12, 12]), 'B n’est pas arrivée').toBe(true)
})

// Clique sur « Exporter en PNG » et lit l'image téléchargée.
async function exporterEnPng(page: Page) {
  const [telechargement] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Exporter en PNG' }).click(),
  ])
  // On lit le fichier par morceaux, puis on les met bout à bout.
  const morceaux: Uint8Array[] = []
  for await (const morceau of await telechargement.createReadStream()) morceaux.push(morceau)
  const octets = new Uint8Array(morceaux.reduce((total, m) => total + m.length, 0))
  let position = 0
  for (const morceau of morceaux) {
    octets.set(morceau, position)
    position += morceau.length
  }
  return { nom: telechargement.suggestedFilename(), octets: Array.from(octets) }
}

type ZoneImage = [number, number, number, number]

// Ce qu'on voit dans l'image : sa taille, où est l'encre sombre, s'il reste du bleu de sélection,
// et combien de pixels sombres tombent dans chaque zone demandée (en pixels de l'image).
async function lireImage(page: Page, octets: number[], zones: ZoneImage[] = []) {
  return page.evaluate(
    async ({ octets, zones }) => {
      const image = new Image()
      image.src = URL.createObjectURL(new Blob([new Uint8Array(octets)], { type: 'image/png' }))
      await image.decode()
      const canvas = document.createElement('canvas')
      canvas.width = image.width
      canvas.height = image.height
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!
      ctx.drawImage(image, 0, 0)
      const d = ctx.getImageData(0, 0, image.width, image.height).data
      const sombre = (i: number) => d[i] < 110 && d[i + 1] < 110 && d[i + 2] < 110
      let x1 = Infinity
      let y1 = Infinity
      let x2 = -Infinity
      let y2 = -Infinity
      let bleu = 0
      for (let i = 0; i < d.length; i += 4) {
        const p = i / 4
        const x = p % image.width
        const y = Math.floor(p / image.width)
        if (sombre(i)) {
          x1 = Math.min(x1, x)
          y1 = Math.min(y1, y)
          x2 = Math.max(x2, x)
          y2 = Math.max(y2, y)
        }
        if (Math.abs(d[i] - 25) < 35 && Math.abs(d[i + 1] - 113) < 35 && Math.abs(d[i + 2] - 194) < 35) bleu += 1
      }
      const dansZones = zones.map(([zx, zy, zw, zh]) => {
        let n = 0
        for (let y = zy; y < zy + zh; y += 1) {
          for (let x = zx; x < zx + zw; x += 1) if (sombre((y * image.width + x) * 4)) n += 1
        }
        return n
      })
      return {
        largeur: image.width,
        hauteur: image.height,
        encre: { x1, y1, x2, y2 },
        bleu,
        dansZones,
        coin: [d[40], d[41], d[42], d[43]],
      }
    },
    { octets, zones },
  )
}

test('carte 11 : l’image contient les formes, le texte et les flèches, sans la sélection', async ({
  page,
}) => {
  await ouvrir(page)
  await choisir(page, 'Rectangle')
  await glisser(page, [100, 150], [220, 250]) // A
  await glisser(page, [350, 150], [470, 250]) // B
  await choisir(page, 'Flèche')
  await glisser(page, [220, 200], [350, 200]) // A → B
  await choisir(page, 'Texte')
  await cliquer(page, [700, 300])
  await page.keyboard.type('Fin')
  await cliquer(page, [1000, 600])
  await choisir(page, 'Sélection')
  await cliquer(page, [160, 160]) // A est sélectionnée : poignées et contour bleu à l'écran

  const { nom, octets } = await exporterEnPng(page)
  expect(nom).toBe('croquis.png')

  // L'image est cadrée sur le schéma : le coin haut-gauche de A est à une marge (20 px, doublée).
  const image = await lireImage(page, octets, [
    [34, 100, 12, 40], // le bord gauche de A
    [400, 132, 20, 16], // la flèche entre A et B
    [1240, 340, 60, 50], // le texte « Fin »
  ])
  expect(image.dansZones[0], 'la forme A manque dans l’image').toBeGreaterThan(0)
  expect(image.dansZones[1], 'la flèche manque dans l’image').toBeGreaterThan(0)
  expect(image.dansZones[2], 'le texte manque dans l’image').toBeGreaterThan(0)
  expect(image.bleu, 'la sélection (poignées, contour bleu) est dans l’image').toBe(0)
  // Fond : un gris clair opaque, pas du transparent ni du blanc.
  expect(image.coin[3], 'le fond est transparent').toBe(255)
  expect(image.coin[0], 'le fond n’est pas gris clair').toBeLessThan(250)
  expect(image.coin[0], 'le fond est trop sombre').toBeGreaterThan(200)
})

test('carte 11 : le schéma est cadré, sans grand vide autour et sans rien de coupé', async ({
  page,
}) => {
  await ouvrir(page)
  await choisir(page, 'Rectangle')
  await glisser(page, [500, 400], [700, 500]) // loin du coin du canevas

  const { octets } = await exporterEnPng(page)
  const image = await lireImage(page, octets)

  // 200 x 100 de forme, plus 20 de marge de chaque côté, au double de la résolution.
  proche(image.largeur, 480, 3)
  proche(image.hauteur, 280, 3)
  // Le trait touche presque la marge de chaque côté, et rien n'est rogné.
  proche(image.encre.x1, 40, 3)
  proche(image.encre.y1, 40, 3)
  proche(image.largeur - image.encre.x2, 40, 3)
  proche(image.hauteur - image.encre.y2, 40, 3)
})

test('carte 11 : sur un canevas vide, rien n’est téléchargé et le bouton le dit', async ({
  page,
}) => {
  await ouvrir(page)
  let telecharge = false
  page.on('download', () => {
    telecharge = true
  })

  await page.getByRole('button', { name: 'Exporter en PNG' }).click()
  await page.waitForTimeout(500)

  expect(telecharge, 'un fichier a été téléchargé pour un canevas vide').toBe(false)
  await expect(page.getByText('rien à exporter')).toBeVisible()
})

// Ctrl+molette sur un point du canevas : zoome vers ce point (négatif : on zoome, positif : on dézoome).
async function zoomerVersPoint(page: Page, [x, y]: PointCanvas, delta: number) {
  const box = await origine(page)
  await page.mouse.move(box.x + x, box.y + y)
  await page.keyboard.down('Control')
  await page.mouse.wheel(0, delta)
  await page.keyboard.up('Control')
  await page.waitForTimeout(80)
}

// La molette seule déplace la vue.
async function deplacerLaVue(page: Page, [x, y]: PointCanvas, dx: number, dy: number) {
  const box = await origine(page)
  await page.mouse.move(box.x + x, box.y + y)
  await page.mouse.wheel(dx, dy)
  await page.waitForTimeout(80)
}

async function niveauDeZoom(page: Page): Promise<number> {
  return parseInt(await page.locator('.zoom').innerText(), 10)
}

test('carte 12 : après un zoom et un déplacement, une forme dessinée apparaît sous la souris', async ({
  page,
}) => {
  await ouvrir(page)
  await zoomerVersPoint(page, [600, 400], -300)
  expect(await niveauDeZoom(page), 'le zoom n’a pas eu lieu').toBeGreaterThan(150)
  await deplacerLaVue(page, [600, 400], 0, 120)

  await choisir(page, 'Rectangle')
  await glisser(page, [300, 300], [500, 450])

  const dessin = await encre(page)
  expect(dessin, 'aucune forme dessinée').not.toBeNull()
  proche(dessin!.x1, 300, 3)
  proche(dessin!.y1, 300, 3)
  proche(dessin!.x2, 500, 3)
  proche(dessin!.y2, 450, 3)
})

test('carte 12 : zoomé, déplacer une forme et relier deux formes se passe sous la souris', async ({
  page,
}) => {
  await ouvrir(page)
  await zoomerVersPoint(page, [600, 400], -200)
  await deplacerLaVue(page, [600, 400], -80, 60)

  await choisir(page, 'Rectangle')
  await glisser(page, [200, 200], [320, 300]) // A
  await glisser(page, [500, 200], [620, 300]) // B
  await choisir(page, 'Flèche')
  await glisser(page, [320, 250], [500, 250]) // A → B : les points d'accroche sont sous la souris
  await choisir(page, 'Sélection')
  expect(await opaque(page, [380, 245, 20, 10]), 'la flèche n’est pas là où on l’a tirée').toBe(true)

  await cliquer(page, [1000, 700])
  const avant = await encre(page, [150, 150, 170, 400]) // A seule
  await glisser(page, [260, 260], [260, 360]) // on descend A de 100 pixels, à l'écran
  await cliquer(page, [1000, 700])
  const apres = await encre(page, [150, 150, 170, 400])

  proche(apres!.y1 - avant!.y1, 100, 3)
  expect(await opaque(page, [405, 295, 10, 10]), 'la flèche ne suit pas la forme déplacée').toBe(true)
  expect(await opaque(page, [380, 245, 20, 10]), 'l’ancien tracé de la flèche est resté').toBe(false)
})

test('carte 12 : le zoom ne change pas le schéma, après un rechargement les formes n’ont pas bougé', async ({
  page,
}) => {
  await ouvrir(page)
  await choisir(page, 'Rectangle')
  await glisser(page, [300, 300], [500, 450])
  const avant = await encre(page)

  await zoomerVersPoint(page, [600, 400], -400)
  await deplacerLaVue(page, [600, 400], 100, -50)
  expect(await niveauDeZoom(page), 'le zoom n’a pas eu lieu').not.toBe(100)

  await recharger(page)
  expect(await niveauDeZoom(page), 'la vue n’est pas revenue à 100 % au rechargement').toBe(100)
  const apres = await encre(page)
  proche(apres!.x1, avant!.x1)
  proche(apres!.y1, avant!.y1)
  proche(apres!.x2, avant!.x2)
  proche(apres!.y2, avant!.y2)
})

test('carte 12 : le niveau de zoom est affiché et le bouton revient à 100 %', async ({ page }) => {
  await ouvrir(page)
  expect(await niveauDeZoom(page)).toBe(100)

  await zoomerVersPoint(page, [600, 400], -300)
  expect(await niveauDeZoom(page), 'le niveau affiché n’a pas suivi le zoom').toBeGreaterThan(100)

  await page.getByRole('button', { name: 'Revenir à 100 %' }).click()
  expect(await niveauDeZoom(page), 'le bouton n’est pas revenu à 100 %').toBe(100)
})

test('carte 12 : la molette déplace la vue, et Espace + glisser aussi, sans rien dessiner', async ({
  page,
}) => {
  await ouvrir(page)
  await choisir(page, 'Rectangle')
  await glisser(page, [300, 300], [500, 400])
  const depart = await encre(page)

  // La molette vers le bas fait remonter le schéma.
  await deplacerLaVue(page, [700, 500], 0, 100)
  const apresMolette = await encre(page)
  proche(apresMolette!.y1 - depart!.y1, -100, 3)

  // Espace + glisser : le schéma suit la souris, et l'outil Rectangle ne dessine rien.
  await page.keyboard.down(' ')
  await glisser(page, [600, 300], [700, 350])
  await page.keyboard.up(' ')
  const apresEspace = await encre(page)
  proche(apresEspace!.x1 - apresMolette!.x1, 100, 3)
  proche(apresEspace!.y1 - apresMolette!.y1, 50, 3)
  proche(apresEspace!.x2 - apresEspace!.x1, apresMolette!.x2 - apresMolette!.x1, 3)
})

test('carte 12 : zoomé, le champ de texte se place sur la forme et le texte y reste centré', async ({
  page,
}) => {
  await ouvrir(page)
  await zoomerVersPoint(page, [600, 400], -300)
  await choisir(page, 'Rectangle')
  await glisser(page, [300, 300], [600, 450])
  await doubleCliquer(page, [450, 375])

  // Pendant la frappe, le champ est centré sur la forme, à l'écran.
  const box = await origine(page)
  const champ = await page.locator('textarea').boundingBox()
  expect(champ, 'le champ de texte ne s’est pas ouvert').not.toBeNull()
  proche(champ!.x + champ!.width / 2 - box.x, 450, 8)
  proche(champ!.y + champ!.height / 2 - box.y, 375, 8)

  await page.keyboard.type('Dedans')
  await cliquer(page, [1000, 700])
  const texte = await encre(page, [310, 310, 280, 130])
  expect(texte, 'le texte a disparu à la validation').not.toBeNull()
  proche(texte!.centre[0], 450, 6)
  proche(texte!.centre[1], 375, 6)
})

// --- Carte 13 : plusieurs schémas ---

async function ouvrirLaListe(page: Page) {
  if (!(await page.locator('.schemas__panneau').isVisible())) {
    await page.locator('.schemas__bouton').click()
  }
}

async function nomDuSchemaOuvert(page: Page): Promise<string> {
  return page.locator('.schemas__courant').innerText()
}

// Crée un schéma : son nom est aussitôt en édition, on tape le nom voulu et on valide.
async function nouveauSchema(page: Page, nom: string) {
  await ouvrirLaListe(page)
  await page.getByRole('button', { name: 'Nouveau schéma' }).click()
  await page.keyboard.type(nom)
  await page.keyboard.press('Enter')
  await page.waitForTimeout(50)
}

async function ouvrirLeSchema(page: Page, nom: string) {
  await ouvrirLaListe(page)
  await page.locator('.schemas__nom', { hasText: nom }).click()
  await page.waitForTimeout(80)
}

// Un rectangle en haut à gauche, une ellipse en bas à droite : on sait de quel schéma on regarde.
const COIN_DU_RECTANGLE: Region = [95, 145, 12, 12]
const HAUT_DE_L_ELLIPSE: Region = [590, 295, 20, 12]

async function dessinerUnRectangle(page: Page) {
  await choisir(page, 'Rectangle')
  await glisser(page, [100, 150], [220, 250])
  await choisir(page, 'Sélection')
}

async function dessinerUneEllipse(page: Page) {
  await choisir(page, 'Ellipse')
  await glisser(page, [500, 300], [700, 400])
  await choisir(page, 'Sélection')
}

test('carte 13 : deux schémas différents gardent chacun leur contenu quand on passe de l’un à l’autre', async ({
  page,
}) => {
  await ouvrir(page)
  await dessinerUnRectangle(page)
  await nouveauSchema(page, 'Autre')
  expect(await encre(page), 'un schéma neuf n’est pas vide').toBeNull()
  await dessinerUneEllipse(page)

  await ouvrirLeSchema(page, 'Schéma 1')
  expect(await opaque(page, COIN_DU_RECTANGLE), 'le premier schéma a perdu son rectangle').toBe(true)
  expect(await opaque(page, HAUT_DE_L_ELLIPSE), 'l’ellipse de l’autre schéma est passée dans celui-ci').toBe(false)

  await ouvrirLeSchema(page, 'Autre')
  expect(await opaque(page, HAUT_DE_L_ELLIPSE), 'le second schéma a perdu son ellipse').toBe(true)
  expect(await opaque(page, COIN_DU_RECTANGLE), 'le rectangle du premier schéma est passé dans celui-ci').toBe(false)
})

test('carte 13 : après un rechargement, on retrouve le dernier schéma ouvert', async ({ page }) => {
  await ouvrir(page)
  await dessinerUnRectangle(page)
  await nouveauSchema(page, 'Autre')
  await dessinerUneEllipse(page)

  await recharger(page)
  expect(await nomDuSchemaOuvert(page), 'ce n’est pas le dernier schéma ouvert').toBe('Autre')
  expect(await opaque(page, HAUT_DE_L_ELLIPSE), 'le contenu du schéma ouvert manque').toBe(true)
  expect(await opaque(page, COIN_DU_RECTANGLE), 'le contenu de l’autre schéma est apparu').toBe(false)

  await ouvrirLeSchema(page, 'Schéma 1')
  await recharger(page)
  expect(await nomDuSchemaOuvert(page)).toBe('Schéma 1')
  expect(await opaque(page, COIN_DU_RECTANGLE)).toBe(true)
})

test('carte 13 : Ctrl+Z n’annule jamais une action faite dans un autre schéma', async ({ page }) => {
  await ouvrir(page)
  await dessinerUnRectangle(page)
  await nouveauSchema(page, 'Autre')

  // Rien à annuler ici : l'action du premier schéma n'est pas touchée.
  await page.keyboard.press(ANNULER)
  await ouvrirLeSchema(page, 'Schéma 1')
  expect(await opaque(page, COIN_DU_RECTANGLE), 'Ctrl+Z a annulé l’action d’un autre schéma').toBe(true)

  // Dans le second schéma, on dessine ; revenu dans le premier, Ctrl+Z défait le rectangle seul.
  await ouvrirLeSchema(page, 'Autre')
  await dessinerUneEllipse(page)
  await ouvrirLeSchema(page, 'Schéma 1')
  await page.keyboard.press(ANNULER)
  expect(await encre(page), 'Ctrl+Z n’a pas annulé l’action de ce schéma').toBeNull()

  await ouvrirLeSchema(page, 'Autre')
  expect(await opaque(page, HAUT_DE_L_ELLIPSE), 'l’ellipse a été annulée depuis un autre schéma').toBe(true)
})

test('carte 13 : renommer un schéma, avec une espace, et le retrouver après un rechargement', async ({
  page,
}) => {
  await ouvrir(page)
  await ouvrirLaListe(page)
  await page.locator('.schemas__nom', { hasText: 'Schéma 1' }).dblclick()
  await page.keyboard.type('Mon plan')
  await page.keyboard.press('Enter')
  expect(await nomDuSchemaOuvert(page)).toBe('Mon plan')

  await recharger(page)
  expect(await nomDuSchemaOuvert(page), 'le nouveau nom n’est pas gardé').toBe('Mon plan')
})

test('carte 13 : supprimer un schéma demande confirmation, puis ouvre celui du dessus', async ({
  page,
}) => {
  await ouvrir(page)
  await dessinerUnRectangle(page)
  await nouveauSchema(page, 'Brouillon')
  expect(await nomDuSchemaOuvert(page)).toBe('Brouillon')

  // « Non » ne supprime rien.
  await ouvrirLaListe(page)
  await page.getByRole('button', { name: 'Supprimer Brouillon' }).click()
  await page.getByRole('button', { name: 'Non' }).click()
  await expect(page.locator('.schemas__nom', { hasText: 'Brouillon' })).toBeVisible()

  // « Oui » supprime, et le schéma juste au-dessus s'ouvre avec son contenu.
  await page.getByRole('button', { name: 'Supprimer Brouillon' }).click()
  await page.getByRole('button', { name: 'Oui, supprimer' }).click()
  await expect(page.locator('.schemas__nom', { hasText: 'Brouillon' })).toHaveCount(0)
  expect(await nomDuSchemaOuvert(page)).toBe('Schéma 1')
  expect(await opaque(page, COIN_DU_RECTANGLE), 'le schéma du dessus n’a pas son contenu').toBe(true)

  // Supprimer le dernier schéma en laisse un neuf et vide.
  await page.getByRole('button', { name: 'Supprimer Schéma 1' }).click()
  await page.getByRole('button', { name: 'Oui, supprimer' }).click()
  await expect(page.locator('.schemas__nom')).toHaveCount(1)
  expect(await nomDuSchemaOuvert(page)).toBe('Schéma 1')
  expect(await encre(page), 'le schéma neuf n’est pas vide').toBeNull()
})

test('carte 13 : le schéma enregistré avant les schémas multiples s’ouvre comme « Schéma 1 »', async ({
  page,
}) => {
  const ancien = JSON.stringify([{ id: 'shape-1', type: 'rect', x: 100, y: 150, w: 120, h: 100 }])
  await page.addInitScript((valeur) => {
    if (localStorage.getItem('croquis:index') === null) localStorage.setItem('croquis:schema', valeur)
  }, ancien)

  await ouvrir(page)
  expect(await nomDuSchemaOuvert(page)).toBe('Schéma 1')
  expect(await opaque(page, COIN_DU_RECTANGLE), 'l’ancien schéma n’est pas là').toBe(true)

  await recharger(page)
  expect(await opaque(page, COIN_DU_RECTANGLE), 'l’ancien schéma n’a pas survécu au rechargement').toBe(true)
})
