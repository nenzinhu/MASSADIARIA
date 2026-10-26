import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try {
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 await page.goto(process.env.APP_URL || 'http://127.0.0.1:3005');
 await page.locator('.food-form select').selectOption('carne-moida-arroz');
 await page.getByLabel('Arroz branco cozido (g)',{exact:true}).fill('200');
 await page.getByLabel('Carne moída preparada (g)',{exact:true}).fill('-1');
 await page.getByRole('button',{name:'+ Adicionar refeição',exact:true}).click();
 await page.getByRole('alert').filter({hasText:'maior que zero'}).waitFor();
 assert.equal(await page.locator('.entry').count(),0);
 await page.getByLabel('Carne moída preparada (g)',{exact:true}).fill('80,5');
 await page.getByRole('button',{name:'+ Adicionar refeição',exact:true}).click();
 await page.waitForFunction(()=>document.querySelectorAll('.entry').length===2);
 assert.match(await page.locator('.entries').innerText(),/200 g/);
 assert.match(await page.locator('.entries').innerText(),/80,5 g/);
 await page.locator('.food-form select').selectOption('strogonoff-frango-arroz');
 await page.getByLabel('Arroz branco cozido (g)',{exact:true}).fill('100');
 await page.getByLabel('Strogonoff de frango (g)',{exact:true}).fill('200');
 await page.getByRole('button',{name:'+ Adicionar refeição',exact:true}).click();
 await page.waitForFunction(()=>document.querySelectorAll('.entry').length===4);
 await page.reload();
 await page.waitForFunction(()=>document.querySelectorAll('.entry').length===4);
 assert.match(await page.locator('.entry').filter({hasText:'Strogonoff de frango'}).innerText(),/200 g/);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 console.log('PASS: individual gram inputs, decimal comma, atomic validation, both meals and reload persistence on mobile.');
} finally {await browser.close();}
