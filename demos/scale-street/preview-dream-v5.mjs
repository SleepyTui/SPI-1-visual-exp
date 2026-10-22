import fs from 'node:fs';
const {chromium}=await import('file:///C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const page=await browser.newPage({viewport:{width:1440,height:1200}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:4178/');await page.waitForTimeout(1300);fs.mkdirSync('test-output-dream-v5',{recursive:true});
await page.screenshot({path:'test-output-dream-v5/desktop.png',fullPage:true});await page.locator('#screen').screenshot({path:'test-output-dream-v5/street-640.png'});
console.log(JSON.stringify({errors,signs:await page.locator('.street-sign').count(),programs:await page.locator('.circuit-animation').count(),title:await page.title(),size:await page.locator('#screen').boundingBox()},null,2));
await page.locator('[data-size="320"]').click();await page.locator('#open-menu').click();await page.locator('#screen').screenshot({path:'test-output-dream-v5/menu-320.png'});await browser.close();
