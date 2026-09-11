const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const root = process.env.PROTOTYPE_URL || 'http://127.0.0.1:61463/';
const appUrl = new URL('living-constellation-v1/screens/', root);

function urlFor(screen, overrides = {}) {
  const url = new URL(appUrl);
  const values = {
    screen,
    demo: 'new',
    stage: '1',
    payment: 'active',
    attendance: '4',
    result: 'pending',
    decision: 'pending',
    lang: 'pl',
    meetingLang: 'pl',
    ...overrides,
  };
  for (const [key, value] of Object.entries(values)) url.searchParams.set(key, value);
  return url.href;
}

(async () => {
  const browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || 'chrome' });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));

  try {
    await page.goto(`${root}?screen=circle&lang=en&demo=new&stage=1`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.circle-forming-screen');
    assert.match(page.url(), /living-constellation-v1\/screens\/\?screen=circle/);
    assert.match(await page.locator('.circle-forming-screen h1').innerText(), /We are looking for people/);

    for (const lang of ['pl', 'en']) {
      for (const screen of ['welcome', 'membership', 'home', 'circle', 'plan', 'meeting', 'after', 'account', 'safety']) {
        await page.goto(urlFor(screen, { lang }), { waitUntil: 'domcontentloaded' });
        await page.waitForSelector('#app > .screen');
        const layout = await page.evaluate(() => ({
          bodyOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
          appOverflow: document.querySelector('#app').scrollWidth > document.querySelector('#app').clientWidth + 1,
          badText: /undefined|null|NaN/.test(document.body.innerText),
        }));
        assert.deepEqual(layout, { bodyOverflow: false, appOverflow: false, badText: false }, `${lang}/${screen}`);
      }
    }

    await page.goto(urlFor('profile', { step: '3' }));
    assert.equal(await page.locator('[data-action="continue-membership"]').isDisabled(), true);
    await page.locator('[data-adult]').check();
    assert.equal(await page.locator('[data-action="continue-membership"]').isDisabled(), false);

    await page.goto(urlFor('plan', { stage: '3', lang: 'en', meetingLang: 'en' }));
    assert.match(await page.locator('.detail-list').innerText(), /ENGLISH/);
    await page.reload();
    assert.match(await page.locator('.detail-list').innerText(), /ENGLISH/);

    await page.goto(urlFor('after', { demo: 'returning', stage: '3', result: 'none', decision: 'core', lang: 'en' }));
    assert.match(await page.locator('.continuation-screen h1').innerText(), /The circle core/);
    await page.reload();
    assert.match(await page.locator('.continuation-screen').innerText(), /at least 4 for a meeting/);

    await page.goto(urlFor('plan', { stage: '3' }));
    await page.locator('[data-safety-context="plan"]').first().click();
    await page.locator('[data-report="venue"]').click();
    await page.locator('[data-back]').click();
    assert.match(await page.locator('.safety-screen h1').innerText(), /przed spotkaniem/);

    await page.goto(urlFor('circle', { stage: '1' }));
    await page.locator('[data-action="notify-ready"]').click();
    assert.match(await page.locator('[data-action="notify-ready"]').innerText(), /Powiadomienie włączone/);
    await page.locator('[data-action="toggle-demo"]').click();
    await page.locator('[data-matching="2"]').click();
    assert.equal(new URL(page.url()).searchParams.get('screen'), 'circle');
    assert.equal(new URL(page.url()).searchParams.get('stage'), '2');

    assert.deepEqual(errors, []);
    console.log('PASS Pages redirect, PL/EN layouts, consent, language, continuation reload, safety return, and formation demo');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
