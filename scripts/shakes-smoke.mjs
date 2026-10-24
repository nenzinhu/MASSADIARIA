import assert from 'node:assert/strict';
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try {
  for (const reducedMotion of ['no-preference','reduce']) {
    const page = await browser.newPage({viewport:{width:390,height:844},reducedMotion});
    await page.goto(process.env.APP_URL || 'http://127.0.0.1:3003');
    await page.getByRole('heading',{name:'Bombas hipercalóricas'}).waitFor();
    assert.equal(await page.locator('.shake-card').count(),14);
    const card = page.locator('.shake-card').filter({hasText:'Banana e pasta de amendoim'});
    await card.getByText('Ingredientes e preparo').click();
    assert.match(await card.innerText(),/300 ml/);
    await card.getByRole('button',{name:'Selecionar receita'}).click();
    await page.getByLabel(/^Quantidade/).fill('0,5');
    await page.getByRole('button',{name:'+ Adicionar',exact:true}).click();
    await page.locator('.entry').waitFor();
    const counter = page.locator('.stat-card.primary .animated-value');
    if (reducedMotion === 'no-preference') {
      await page.waitForTimeout(120);
      const during = Number((await counter.innerText()).replace(',','.'));
      assert.ok(during > 0 && during < 342, `Expected animated intermediate value, got ${during}`);
    }
    await page.waitForFunction(() => document.querySelector('.stat-card.primary .animated-value')?.textContent === '342');
    assert.match(await page.locator('.entry').innerText(), /342 kcal/);
    await page.getByRole('button',{name:'Excluir',exact:true}).click();
    if (reducedMotion === 'no-preference') {
      await page.waitForTimeout(120);
      const during = Number((await counter.innerText()).replace(',','.'));
      assert.ok(during > 0 && during < 342, `Expected decreasing animation, got ${during}`);
    }
    await page.waitForFunction(() => document.querySelector('.stat-card.primary .animated-value')?.textContent === '0');
    for (const label of ['600', '800', '1.000', '1.200']) {
      await page.getByRole('button', { name: `≈ ${label} kcal`, exact: true }).click();
      assert.equal(await page.locator('.shake-card').count(), 2);
      const badges = await page.locator('.recipe-badge').allTextContents();
      assert.ok(badges.every(text => text === `Faixa de ${label} kcal`));
    }
    const largeRecipe = page.locator('.shake-card').filter({ hasText: 'Banana, leite em pó e amendoim' });
    await largeRecipe.getByText('Ingredientes e preparo').click();
    assert.match(await largeRecipe.innerText(), /30 g de leite em pó integral/);
    await largeRecipe.getByRole('button', { name: 'Selecionar receita' }).click();
    await page.getByLabel(/^Quantidade/).fill('0,5');
    await page.getByRole('button', { name: '+ Adicionar', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('.stat-card.primary .animated-value')?.textContent === '600');
    await page.getByText('Alimentos mais calóricos · 15 opções', { exact: true }).click();
    const nuts = page.locator('.dense-food-card').filter({ has: page.getByRole('heading', { name: 'Nozes', exact: true }) });
    assert.match(await nuts.innerText(), /654 kcal \/ 100 g/);
    await nuts.getByRole('button', { name: 'Selecionar nozes', exact: true }).click();
    await page.getByLabel(/^Quantidade/).fill('15');
    await page.getByRole('button', { name: '+ Adicionar', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('.stat-card.primary .animated-value')?.textContent === '698');
    await page.reload();
    await page.waitForFunction(() => document.querySelector('.stat-card.primary .animated-value')?.textContent === '698');
    assert.equal(await page.locator('.entry').count(), 2);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.close();
  }
  console.log('PASS: 14 recipes, all calorie filters, ingredients, half of a 1200 kcal recipe, dense food portions, persistence, animations and reduced motion on mobile.');
} finally {await browser.close();}
