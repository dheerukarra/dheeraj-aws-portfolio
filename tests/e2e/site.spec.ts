import { test, expect, Page } from '@playwright/test'

// ---------------------------------------------------------------------------------------------------------------
// helpers. The site exposes `window.__app` (mode(), cur(), enter(i), home(), ...) which we use to drive and observe.
// ---------------------------------------------------------------------------------------------------------------
const A = (page: Page) => ({
  mode: () => page.evaluate(() => (window as any).__app?.mode()),
  cur: () => page.evaluate(() => (window as any).__app?.cur()),
})

type Watch = { errors: string[]; failed: string[]; hosts: Set<string>; insecure: string[] }
function watch(page: Page): Watch {
  const w: Watch = { errors: [], failed: [], hosts: new Set(), insecure: [] }
  page.on('pageerror', (e) => w.errors.push('pageerror: ' + e.message))
  page.on('console', (m) => { if (m.type() === 'error') w.errors.push('console: ' + m.text()) })
  page.on('requestfailed', (r) => w.failed.push(r.url() + ' ' + (r.failure()?.errorText || '')))
  page.on('response', (r) => { if (r.status() >= 400) w.failed.push(r.status() + ' ' + r.url()) })
  page.on('request', (r) => { const u = new URL(r.url()); if (u.protocol === 'http:' || u.protocol === 'https:') { w.hosts.add(u.host); if (u.protocol === 'http:' && !/localhost|127\.0\.0\.1/.test(u.host)) w.insecure.push(r.url()) } })
  return w
}

async function boot(page: Page, query = 'nobook=1') {
  await page.goto('/?' + query)
  await page.waitForFunction(() => (window as any).__app && (window as any).__app.mode() === 'hub', null, { timeout: 120_000 })
}
async function enter(page: Page, i: number) {
  await page.evaluate((n) => (window as any).__app.enter(n), i)
  await page.waitForFunction((n) => (window as any).__app.mode() === 'scene' && (window as any).__app.cur() === n, i, { timeout: 60_000 })
  await page.waitForTimeout(1600) // let the landing animation finish
}
async function goHome(page: Page) {
  await page.evaluate(() => (window as any).__app.home())
  await page.waitForFunction(() => (window as any).__app.mode() === 'hub', null, { timeout: 60_000 })
  await page.waitForTimeout(1200)
}
const badgeCount = (page: Page) => page.evaluate(() => { try { return JSON.parse(localStorage.getItem('dr_ach') || '[]').length } catch { return -1 } })
const ALL_BADGES = ['fault', 'cleaner', 'cartographer', 'gatekeeper', 'drk', 'sharpshooter', 'projects', 'tester', 'card', 'clip', 'timetravel', 'konami', 'hired', 'terminal', 'all']

// ---------------------------------------------------------------------------------------------------------------
test.describe('1. Delivery and health', () => {
  test('root serves the 3D site (no /concept/ needed) and every file it needs', async ({ request, baseURL }) => {
    const res = await request.get('/')
    expect(res.status()).toBe(200)
    const html = await res.text()
    expect(html).toContain('<canvas id="gl"')
    expect(html).toContain('three@0.170.0')
    for (const f of ['main.js', 'common.js', 'compass.js', 'fxtext.js', 'ui.js', 'tools.js', 'scenes1.js', 'scenes2.js', 'scenes5.js', 'scenes6.js', 'scenes7.js', 'scenes9.js', 'scenes10.js', 'icons.json', 'logos/index.json']) {
      const r = await request.get('/' + f)
      expect(r.status(), `${baseURL}/${f}`).toBe(200)
    }
  })

  test('loads to the home globe with no JS errors, no failed requests, HTTPS only, no tracking hosts', async ({ page }) => {
    const w = watch(page)
    await boot(page)
    await page.waitForTimeout(3000)
    expect(w.errors, 'console/page errors').toEqual([])
    expect(w.failed, 'failed or 4xx/5xx requests').toEqual([])
    expect(w.insecure, 'insecure http requests').toEqual([])
    const allowed = /amplifyapp\.com$|localhost|cdn\.jsdelivr\.net$|fonts\.googleapis\.com$|fonts\.gstatic\.com$/
    expect([...w.hosts].filter((h) => !allowed.test(h)), 'unexpected third-party hosts').toEqual([])
  })

  test('page basics: title, language, labelled canvas, safe external links, named buttons', async ({ page }) => {
    await boot(page)
    expect(await page.title()).toMatch(/Dheeraj Reddy Karra/)
    expect(await page.getAttribute('html', 'lang')).toBe('en')
    expect(await page.getAttribute('#gl', 'aria-label')).toBeTruthy()
    const bad = await page.$$eval('a[target=_blank]', (as) => as.filter((a) => !/noopener/.test((a as HTMLAnchorElement).rel)).map((a) => (a as HTMLAnchorElement).href))
    expect(bad, 'external links missing rel=noopener').toEqual([])
    const unnamed = await page.$$eval('button', (bs) => bs.filter((b) => getComputedStyle(b).display !== 'none' && !(b.textContent || b.getAttribute('aria-label') || '').trim()).length)
    expect(unnamed).toBe(0)
  })

  test('the old Next.js leftovers are gone', async ({ request }) => {
    for (const p of ['/dheeraj.jpg', '/avatar/avatar.glb', '/kalshi-reference/README.md', '/avatar-lab/']) {
      expect([404, 403], p).toContain((await request.get(p)).status())
    }
  })
})

// ---------------------------------------------------------------------------------------------------------------
test.describe('2. Intro and home globe', () => {
  test('boot text types and SKIP INTRO reaches the globe', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#boot')).toBeVisible()
    await expect(page.locator('#bt')).toContainText('dheeraj.model', { timeout: 30_000 })
    await page.locator('#skip').click()
    await page.waitForFunction(() => (window as any).__app?.mode() === 'hub', null, { timeout: 120_000 })
    await expect(page.locator('#boot')).toBeHidden({ timeout: 10_000 })
  })

  test('home shows all six regions, badges 0/15, sound on by default', async ({ page }) => {
    await boot(page)
    for (const n of ['Education', 'AI agents', 'Projects', 'Testing', 'Skills and certifications', 'Hobby']) await expect(page.locator('.lbl', { hasText: n })).toHaveCount(1)
    await expect(page.locator('#achb')).toHaveText(/Badges 0\/15/)
    await expect(page.locator('#snd')).toHaveText('Sound on')
    await expect(page.locator('#term')).toHaveCSS('visibility', 'hidden') // closed terminal must not leak an orange edge
    await page.locator('#snd').click()
    await expect(page.locator('#snd')).toHaveText('Sound off')
    await page.locator('#snd').click()
    await expect(page.locator('#snd')).toHaveText('Sound on')
  })

  test('clicking the globe breaks a region and flies into a scene, leaving no overlay behind', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop pointer test')
    await boot(page)
    const vp = page.viewportSize()!
    let hit = false
    for (const [fx, fy] of [[0.55, 0.46], [0.5, 0.4], [0.6, 0.5], [0.45, 0.5], [0.55, 0.38], [0.65, 0.45], [0.5, 0.55], [0.4, 0.42]]) {
      await page.mouse.move(vp.width * fx, vp.height * fy); await page.waitForTimeout(250)
      await page.mouse.click(vp.width * fx, vp.height * fy); await page.waitForTimeout(400)
      if ((await A(page).mode()) !== 'hub') { hit = true; break }
    }
    expect(hit, 'a click on the globe should start the break').toBe(true)
    await page.waitForFunction(() => (window as any).__app.mode() === 'scene', null, { timeout: 60_000 })
    expect(await badgeCount(page)).toBeGreaterThanOrEqual(1) // "First fault"
    await page.waitForTimeout(2500)
    const leftovers = await page.evaluate(() => [...document.body.children].filter((e) => (e as HTMLElement).style.zIndex === '20').length)
    expect(leftovers, 'transition overlay left on screen').toBe(0)
  })

  test('number keys no longer navigate', async ({ page, isMobile }) => {
    test.skip(isMobile, 'keyboard')
    await boot(page)
    for (const k of ['1', '3', '5']) { await page.keyboard.press(k); await page.waitForTimeout(500) }
    expect(await A(page).mode()).toBe('hub')
  })
})

// ---------------------------------------------------------------------------------------------------------------
test.describe('3. All twelve scenes', () => {
  const NAMES = ['Education', 'AI agents', 'Projects', 'Testing', 'Skills and certifications', 'Hobby', "Master's", "Bachelor's", 'Kalshi', 'shorts-engine', 'Skills', 'Certifications']
  test('every scene loads, renders pixels, has a title and the navigation compass, with no errors', async ({ page, isMobile }) => {
    test.setTimeout(600_000)
    const w = watch(page)
    await boot(page)
    for (let i = 0; i < 12; i++) {
      await enter(page, i)
      const title = (await page.locator('#pname').textContent())?.trim()
      expect(title, `scene ${i} title`).toBeTruthy()
      expect(title!.toLowerCase(), `scene ${i}`).toContain(NAMES[i].toLowerCase().slice(0, 5))
      await expect(page.locator('#compass'), `scene ${i} compass`).toBeVisible()
      const png = await page.screenshot()
      expect(png.length, `scene ${i} looks blank`).toBeGreaterThan(isMobile ? 15_000 : 30_000)
      if (i < 11) await goHome(page)
    }
    expect(w.errors, 'errors while visiting scenes').toEqual([])
    expect(w.failed, 'failed requests while visiting scenes').toEqual([])
  })
})

// ---------------------------------------------------------------------------------------------------------------
test.describe('4. Navigation', () => {
  test('compass lets you jump between scenes and the one-time hint appears only once', async ({ page, isMobile }) => {
    test.skip(isMobile, 'hover based compass')
    await boot(page)
    await enter(page, 3)
    await expect(page.locator('#navtip')).toBeVisible({ timeout: 10_000 })
    await page.locator('#compass').hover()
    await expect(page.locator('#navtip')).toBeHidden({ timeout: 5_000 })
    await page.locator('#compass button[aria-label="Go to AI agents"]').click({ force: true })
    await page.waitForFunction(() => (window as any).__app.cur() === 1, null, { timeout: 60_000 })
    expect(await A(page).mode()).toBe('scene')
    await page.reload(); await page.waitForFunction(() => (window as any).__app?.mode() === 'hub', null, { timeout: 120_000 })
    await enter(page, 2); await page.waitForTimeout(2500)
    await expect(page.locator('#navtip')).toHaveCount(0)
  })

  test('scene to home and back', async ({ page }) => {
    await boot(page)
    await enter(page, 5)
    await goHome(page)
    await expect(page.locator('.lbl', { hasText: 'Hobby' })).toBeVisible()
    await enter(page, 0)
    expect(await A(page).cur()).toBe(0)
  })

  test('globe scenes break open into their sub-scenes (Education -> Master or Bachelor)', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop pointer test')
    await boot(page)
    await enter(page, 0)
    const vp = page.viewportSize()!
    let ok = false
    for (const [fx, fy] of [[0.5, 0.45], [0.6, 0.45], [0.4, 0.45], [0.55, 0.4], [0.5, 0.5], [0.65, 0.5], [0.45, 0.38]]) {
      await page.mouse.move(vp.width * fx, vp.height * fy); await page.waitForTimeout(300)
      await page.mouse.click(vp.width * fx, vp.height * fy); await page.waitForTimeout(400)
      if ((await A(page).mode()) !== 'scene' || (await A(page).cur()) !== 0) { ok = true; break }
    }
    expect(ok).toBe(true)
    await page.waitForFunction(() => { const a = (window as any).__app; return a.mode() === 'scene' && (a.cur() === 6 || a.cur() === 7) }, null, { timeout: 60_000 })
  })
})

// ---------------------------------------------------------------------------------------------------------------
test.describe('5. Explorer badges', () => {
  test('unlock popup, collection modal, persistence', async ({ page }) => {
    await boot(page)
    await page.evaluate(() => window.dispatchEvent(new CustomEvent('ach', { detail: 'fault' })))
    await expect(page.locator('.toast.ach .bt')).toBeVisible()
    await expect(page.locator('#achb')).toHaveText(/Badges 1\/15/)
    await page.locator('#achb').click()
    await expect(page.locator('#bdg .bd-tile')).toHaveCount(15)
    await expect(page.locator('#bdg .bd-tile.lock')).toHaveCount(14)
    await page.keyboard.press('Escape')
    await page.reload(); await page.waitForFunction(() => (window as any).__app?.mode() === 'hub', null, { timeout: 120_000 })
    await expect(page.locator('#achb')).toHaveText(/Badges 1\/15/)
  })

  test('collecting all 15 shows congratulations and Say hello opens a Gmail compose with the address', async ({ page }) => {
    await boot(page)
    await page.evaluate(() => { (window as any).__opened = []; window.open = ((u: string) => { (window as any).__opened.push(u); return null }) as any })
    for (const k of ALL_BADGES) await page.evaluate((key) => window.dispatchEvent(new CustomEvent('ach', { detail: key })), k)
    await expect(page.locator('#achb')).toHaveText(/Badges 15\/15/)
    await expect(page.locator('#cong')).toBeVisible({ timeout: 15_000 })
    await expect(page.locator('#cong h2')).toHaveText(/Congratulations/)
    await page.locator('#chello').click()
    const opened: string[] = await page.evaluate(() => (window as any).__opened)
    expect(opened.length).toBe(1)
    expect(opened[0]).toMatch(/mail\.google\.com.*to=dheerajreddy\.karra@gmail\.com/)
    await expect(page.locator('#chello')).toHaveText(/copied/i)
    await page.locator('#ckeep').click()
    await expect(page.locator('#cong')).toHaveCount(0)
  })
})

// ---------------------------------------------------------------------------------------------------------------
test.describe('6. Command palette and tools', () => {
  test.skip(({ isMobile }) => isMobile, 'palette is keyboard driven (hidden on small screens)')
  const run = async (page: Page, q: string) => {
    await page.keyboard.press('Control+k')
    await expect(page.locator('#pal')).toHaveClass(/on/)
    await page.locator('#pin').fill(q)
    await page.keyboard.press('Enter')
  }

  test('palette opens, filters, closes', async ({ page }) => {
    await boot(page)
    await page.keyboard.press('Control+k')
    await expect(page.locator('#pls li').first()).toBeVisible()
    await page.locator('#pin').fill('zzzzzz'); await expect(page.locator('#pls li.none')).toBeVisible()
    await page.keyboard.press('Escape')
  })

  test('career git log: 5 commits, check one out and the model rewinds', async ({ page }) => {
    await boot(page)
    await run(page, 'git log')
    await expect(page.locator('ul.git li')).toHaveCount(5)
    await expect(page.locator('ul.git li.head')).toHaveCount(1)
    await page.locator('ul.git li').nth(2).click()
    await expect(page.locator('#ov')).not.toHaveClass(/on/)
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('dr_ach') || '[]').includes('timetravel'))).toBe(true)
  })

  test('self-test suite runs 12 real checks and all pass', async ({ page }) => {
    await boot(page)
    await run(page, 'self-test')
    await expect(page.locator('.st-txt h4')).toHaveText(/All checks passed|failed/, { timeout: 30_000 })
    const rows = await page.locator('ul.tests li').count()
    const bad = await page.locator('ul.tests li.bad span').allTextContents()
    expect(rows).toBe(12)
    expect(bad, 'failing checks').toEqual([])
  })

  test('patch notes show four releases', async ({ page }) => {
    await boot(page)
    await run(page, 'patch notes')
    await expect(page.locator('.pn')).toHaveCount(4)
    await page.keyboard.press('Escape')
  })

  test('"How this site is hosted" documents AWS Amplify and links to the repo (palette and terminal)', async ({ page }) => {
    await boot(page)
    await run(page, 'hosted')
    await expect(page.locator('#ov .pn')).toHaveCount(4)
    await expect(page.locator('#ov')).toContainText('AWS Amplify Hosting')
    await expect(page.locator('#ov a[href="https://github.com/dheerukarra/dheeraj-aws-portfolio"]')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('#ov')).not.toHaveClass(/on/)
    await page.keyboard.press('~')
    await page.locator('#tcmd').fill('aws'); await page.keyboard.press('Enter')
    await expect(page.locator('#ov')).toContainText('us-east-1')
  })

  test('header GitHub link points at the repo', async ({ page }) => {
    await boot(page)
    await expect(page.locator('header a', { hasText: 'GitHub' })).toHaveAttribute('href', 'https://github.com/dheerukarra/dheeraj-aws-portfolio')
  })

  test('fault-injector card is drawn locally and downloadable', async ({ page }) => {
    await boot(page)
    await run(page, 'fault-injector')
    await page.locator('#cn').fill('E2E Tester')
    await page.locator('#cg').click()
    await expect(page.locator('#cc')).toBeVisible()
    await expect(page.locator('#cd')).toHaveAttribute('href', /^data:image\/png/)
  })

  test('6 second clip records and downloads a video', async ({ page }) => {
    await boot(page)
    const dl = page.waitForEvent('download', { timeout: 30_000 })
    await run(page, 'record')
    const d = await dl
    expect(d.suggestedFilename()).toMatch(/\.webm$/)
  })
})

// ---------------------------------------------------------------------------------------------------------------
test.describe('7. Terminal', () => {
  test.skip(({ isMobile }) => isMobile, 'needs a keyboard')
  test('~ opens the terminal; commands work; sudo hire gives the badge', async ({ page }) => {
    await boot(page)
    await page.keyboard.press('~')
    await expect(page.locator('#term')).toHaveClass(/on/)
    await expect(page.locator('#term')).toHaveCSS('visibility', 'visible')
    const cmd = async (c: string) => { await page.locator('#tcmd').fill(c); await page.keyboard.press('Enter') }
    await cmd('help'); await expect(page.locator('#tout')).toContainText('whoami')
    await cmd('whoami'); await expect(page.locator('#tout')).toContainText('Dheeraj Reddy Karra')
    await cmd('ls'); await expect(page.locator('#tout')).toContainText('hobby/')
    await cmd('cat edu'); await expect(page.locator('#tout')).toContainText(/Master/)
    await cmd('nonsense'); await expect(page.locator('#tout')).toContainText('command not found')
    await cmd('sudo hire dheeraj'); await expect(page.locator('#tout')).toContainText('dheerajreddy.karra@gmail.com')
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('dr_ach') || '[]'))).toEqual(expect.arrayContaining(['terminal', 'hired']))
    await cmd('enter ai')
    await page.waitForFunction(() => (window as any).__app.mode() === 'scene' && (window as any).__app.cur() === 1, null, { timeout: 60_000 })
  })
})

// ---------------------------------------------------------------------------------------------------------------
test.describe('8. In-scene interactions grant their badges', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop pointer test')
  const clickCentre = async (page: Page) => { const v = page.viewportSize()!; await page.mouse.move(v.width * 0.55, v.height * 0.4); await page.waitForTimeout(300); await page.mouse.click(v.width * 0.55, v.height * 0.4) }
  const has = (page: Page, k: string) => page.evaluate((key) => JSON.parse(localStorage.getItem('dr_ach') || '[]').includes(key), k)

  test("Master's: click trains the network (Trainer badge)", async ({ page }) => { await boot(page); await enter(page, 6); await clickCentre(page); await expect.poll(() => has(page, 'cleaner')).toBe(true) })
  test("Bachelor's: click runs another algorithm (Pathfinder badge)", async ({ page }) => { await boot(page); await enter(page, 7); await clickCentre(page); await expect.poll(() => has(page, 'cartographer')).toBe(true) })
  test('AI agents: audit-gate game button toggles', async ({ page }) => {
    await boot(page); await enter(page, 1)
    const btn = page.locator('#act'); await expect(btn).toBeVisible()
    const before = await btn.textContent(); await btn.click(); await page.waitForTimeout(800)
    expect(await btn.textContent()).not.toBe(before)
  })
  test('Testing: click plants bugs in the run', async ({ page }) => {
    await boot(page); await enter(page, 3)
    const before = await page.locator('#pstat').textContent(); await clickCentre(page); await page.waitForTimeout(2500)
    expect(await page.locator('#pstat').textContent()).not.toBe(before)
  })
  test('Hobby: six games listed, scene responds to clicks', async ({ page }) => {
    await boot(page); await enter(page, 5)
    await expect(page.locator('#pbody')).toContainText('Valorant')
    await clickCentre(page); await page.waitForTimeout(500)
    expect(await A(page).mode()).toBe('scene')
  })
})

// ---------------------------------------------------------------------------------------------------------------
test.describe('9. Mobile and accessibility', () => {
  test('mobile: no horizontal scroll, globe and scene work on a phone viewport', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile project only')
    await boot(page)
    const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(over, 'horizontal overflow (px)').toBeLessThanOrEqual(1)
    await expect(page.locator('.lbl').first()).toBeVisible()
    await enter(page, 1)
    await expect(page.locator('#compass')).toBeVisible()
    const over2 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(over2).toBeLessThanOrEqual(1)
    expect((await page.screenshot()).length).toBeGreaterThan(15_000)
  })

  test('reduced-motion users still get to every scene quickly', async ({ browser, baseURL }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce', baseURL: baseURL! })
    const page = await ctx.newPage()
    await boot(page)
    await page.evaluate(() => (window as any).__app.enter(3))
    await page.waitForFunction(() => (window as any).__app.mode() === 'scene' && (window as any).__app.cur() === 3, null, { timeout: 30_000 })
    await ctx.close()
  })
})
