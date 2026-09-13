const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const { chromium } = require('playwright');

// Run with NODE_PATH pointing to the installed Playwright package directory.
// Bind an ephemeral loopback port and use the same subpath as GitHub Pages.
const repo = path.resolve(__dirname, '../..');
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  let file = path.resolve(repo, '.' + pathname.replace(/^\/experience-prototype/, ''));
  if (file !== repo && !file.startsWith(repo + path.sep)) { res.writeHead(403).end(); return; }
  try {
    if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    res.setHeader('Content-Type', ({ '.html':'text/html', '.js':'text/javascript', '.css':'text/css' })[path.extname(file)] || 'text/plain');
    res.end(fs.readFileSync(file));
  } catch { res.writeHead(404).end(); }
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const root = `http://127.0.0.1:${server.address().port}/experience-prototype/`;
  const browser = await chromium.launch({ headless:true, channel:'chrome' });
  const page = await browser.newPage({ viewport:{width:390,height:844}, reducedMotion:'reduce' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const button = action => page.locator(`[data-oo-action="${action}"]`);
  const tab = route => page.locator(`.bottom-nav [data-route="${route}"]`);
  const simulate = async action => {
    if (!await page.locator('.oo-simulation').getAttribute('open')) {
      if (!await page.locator('.oo-simulation').evaluate(el => el.open)) await page.locator('.oo-simulation summary').click();
    }
    await button(action).click();
  };
  const start = async () => {
    await button('details').click();
    await button('review').click();
    await button('search').click();
  };
  const layout = async label => {
    const result = await page.evaluate(() => {
      const screen = document.querySelector('#app > .screen');
      return {
        bodyOverflow:document.documentElement.scrollWidth > innerWidth + 1,
        screenOverflow:screen.scrollWidth > screen.clientWidth + 1,
        navCount:document.querySelectorAll('.bottom-nav').length,
        languageCount:document.querySelectorAll('.language-switch').length,
        badText:/undefined|NaN/.test(screen.textContent),
        fieldsOutside:[...screen.querySelectorAll('select, .choice, .date-choice')].some(el => {
          const r=el.getBoundingClientRect(), s=screen.getBoundingClientRect();
          return r.left < s.left || r.right > s.right + 1;
        })
      };
    });
    assert.deepEqual(result, {bodyOverflow:false,screenOverflow:false,navCount:1,languageCount:1,badText:false,fieldsOutside:false},label);
  };
  try {
    await page.goto(root+'?screen=home&stage=3&demo=ready&lang=en');
    await page.waitForSelector('.oneoff-entry');
    const base = new URL(page.url()).pathname;
    assert.match(base,/living-constellation-v1\/screens\//);
    await page.screenshot({path:'/private/tmp/experience-unified-home.png'});
    await page.locator('.oneoff-entry [data-route="oneoff"]').click();
    await button('details').waitFor();
    await page.locator('[data-oo-date="1"]').click();
    assert.equal(await button('details').isDisabled(),true);
    await page.locator('[data-oo-date="1"]').click();
    await page.locator('[data-oo-date="2"]').click();
    await button('details').click();
    await page.locator('[data-oo-field="city"]').selectOption('krakow');
    await page.locator('[data-oo-field="conversation"]').selectOption('english');
    await button('review').click();
    assert.match(await page.locator('.oneoff-screen > .oneoff-ui').textContent(),/Kraków/);
    await button('search').click();
    await layout('search');
    await page.screenshot({path:'/private/tmp/experience-unified-search.png'});
    await tab('circle').click();
    assert.equal(new URL(page.url()).searchParams.get('stage'),'3');
    await tab('home').click();
    assert.match(await page.locator('.oneoff-entry').textContent(),/Finding people/);
    await tab('plan').click();
    assert.match(await page.locator('.plan-circle-label').textContent(),/REGULAR CIRCLE/);
    await page.locator('.oneoff-entry [data-route="oneoff"]').click();
    assert.match(await page.locator('.oneoff-screen > .oneoff-ui').textContent(),/Kraków/);
    await page.reload();
    await button('edit-search').waitFor();
    await page.locator('[data-action="toggle-language"]').click();
    assert.equal(await page.locator('html').getAttribute('lang'),'pl');
    await layout('Polish search');
    await page.locator('[data-action="toggle-language"]').click();
    await button('cancel-search').click();
    await button('close').click();
    await simulate('sim-invite');
    await button('attend').click();
    await simulate('sim-ready');
    await layout('confirmed');
    await button('meeting-details').click();
    await button('close').click();
    await button('arrival').click();
    assert.equal(await button('arrival').isDisabled(),true);
    await simulate('sim-finish');
    await simulate('sim-followup');
    await page.locator('[data-oo-contact="Alex"]').check();
    await button('save-feedback').click();
    await tab('account').click();
    assert.equal(await page.locator('[data-oo-history]').count(),1);
    assert.equal(await page.locator('.empty-history').count(),0);
    await tab('plan').click();
    await page.locator('.oneoff-entry [data-route="oneoff"]').click();
    await button('begin').click();
    await start();
    await tab('account').click();
    await page.locator('[data-oo-history]').click();
    assert.match(await page.locator('.oneoff-screen > .oneoff-ui').textContent(),/Completed/);
    await button('resume').click();
    await button('edit-search').waitFor();
    await simulate('sim-fail');
    assert.equal(await button('alternate').count(),0);
    await button('begin').click();
    await page.locator('[data-oo-date="2"]').click();
    await start();
    await simulate('sim-fail');
    await button('alternate').click();
    assert.match(await page.locator('.result-date').textContent(),/15/);
    await simulate('sim-invite');
    await simulate('sim-expire');
    assert.equal(await button('alternate').count(),0);
    await button('begin').click();
    await start();
    await simulate('sim-invite');
    await button('attend').click();
    await simulate('sim-venue');
    await button('begin').click();
    await start();
    await simulate('sim-invite');
    await button('attend').click();
    await button('cancel-attendance').click();
    await button('do-cancel').click();
    assert.equal(new URL(page.url()).searchParams.get('stage'),'3');

    // All formats, both languages and phone widths; every step shares the same shell.
    for (const width of [320,390,430]) for (const lang of ['pl','en']) for (const format of ['dinner','coffee','walk']) {
      await page.setViewportSize({width,height:844});
      await page.goto(root+`?screen=oneoff&lang=${lang}&stage=1`);
      await simulate('reset');
      await page.locator(`[data-oo-format="${format}"]`).click();
      await layout(`${width}/${lang}/${format}/when`);
      await button('details').click();
      await layout(`${width}/${lang}/${format}/details`);
      await button('review').click();
      await layout(`${width}/${lang}/${format}/review`);
      await button('search').click();
      await layout(`${width}/${lang}/${format}/search`);
      await simulate('sim-invite');
      await layout(`${width}/${lang}/${format}/invite`);
      await button('attend').click();
      await layout(`${width}/${lang}/${format}/booking`);
      await simulate('sim-ready');
      await layout(`${width}/${lang}/${format}/confirmed`);
      if (width===320 && lang==='en' && format==='walk') await page.screenshot({path:'/private/tmp/experience-unified-320.png'});
    }
    await page.goto(root+'one-off/?lang=en');
    await page.waitForSelector('.oneoff-screen');
    assert.equal(new URL(page.url()).pathname,base);
    await page.goto(root);
    await page.waitForSelector('.welcome-screen');
    assert.equal(new URL(page.url()).pathname,base);
    assert.deepEqual(errors,[]);
    console.log('PASS unified navigation, reload, PL/EN, circle isolation, confirmations, expiry, failures, cancellation, private follow-up, history, legacy redirects and 126 layout checks');
    const regression = await promisify(execFile)(process.execPath, [path.join(__dirname,'browser.test.cjs')], {env:{...process.env, PROTOTYPE_URL:root}});
    console.log(regression.stdout.trim());
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); server.close(); process.exitCode=1; });
