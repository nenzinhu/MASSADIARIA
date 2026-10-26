// Run against a running app: PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node scripts/barcode-smoke.mjs
import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => { Object.defineProperty(window, 'BarcodeDetector', { value: undefined, configurable: true }); });
  let fixture = { status: 1, product: { product_name: 'Aveia de teste', brands: 'Teste', nutriments: { 'energy-kcal_100g': 380, proteins_100g: 12, carbohydrates_100g: 60, fat_100g: 8 } } };
  await page.route('https://world.openfoodfacts.org/api/v2/product/**', route => route.fulfill({json: fixture}));
  await page.goto(process.env.APP_URL || 'http://127.0.0.1:3002');
  await page.getByRole('button', {name:'Buscar por código de barras'}).click();
  await page.getByRole('button', {name:'Usar câmera'}).click();
  await page.getByRole('alert').filter({hasText:'Digite o código'}).waitFor();
  await page.getByLabel('Código de barras', {exact:true}).fill('3017620422003');
  await page.getByRole('button', {name:'Consultar produto'}).click();
  await page.getByLabel('Nome do produto').waitFor();
  assert.equal(await page.getByLabel('Calorias (kcal)', {exact:true}).inputValue(), '380');
  await page.getByRole('button', {name:'Salvar e selecionar alimento'}).click();
  assert.equal(await page.getByLabel('Unidade dos valores consultados').evaluate(el => el.validity.valid), false);
  await page.getByLabel('Unidade dos valores consultados').selectOption('g');
  await page.getByRole('button', {name:'Salvar e selecionar alimento'}).click();
  await page.getByLabel(/^Quantidade/).fill('50');
  await page.getByRole('button', {name:'+ Adicionar', exact:true}).click();
  await page.locator('.entry').filter({hasText:'Aveia de teste'}).waitFor();
  assert.match(await page.locator('.entry').innerText(), /190 kcal/);
  await page.reload();
  await page.locator('.entry').filter({hasText:'Aveia de teste'}).waitFor();
  assert.match(await page.locator('.entry').innerText(), /190 kcal/);
  await page.getByRole('button', {name:'Buscar por código de barras'}).click();
  fixture = {status:1, product:{product_name:'Produto incompleto', nutriments:{proteins_100g:0}}};
  await page.getByLabel('Código de barras', {exact:true}).fill('3017620422003');
  await page.getByRole('button', {name:'Consultar produto'}).click();
  await page.getByLabel('Nome do produto').waitFor();
  assert.equal(await page.getByLabel('Calorias (kcal)', {exact:true}).inputValue(), '');
  assert.equal(await page.getByLabel('Proteínas (g)', {exact:true}).inputValue(), '0');
  await page.getByLabel('Código de barras', {exact:true}).fill('3017620422004');
  await page.getByRole('button', {name:'Consultar produto'}).click();
  await page.getByRole('alert').filter({hasText:'Código inválido'}).waitFor();
  fixture = {status:0};
  await page.getByLabel('Código de barras', {exact:true}).fill('3017620422003');
  await page.getByRole('button', {name:'Consultar produto'}).click();
  await page.getByRole('alert').filter({hasText:'Produto não encontrado'}).waitFor();
  await page.unroute('https://world.openfoodfacts.org/api/v2/product/**');
  await page.route('https://world.openfoodfacts.org/api/v2/product/**', route => route.abort());
  await page.getByRole('button', {name:'Consultar produto'}).click();
  await page.getByRole('alert').filter({hasText:'Não foi possível conectar'}).waitFor();
  await page.getByRole('button', {name:'Cadastrar pelo rótulo manualmente'}).click();
  await page.getByRole('dialog').waitFor();
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
  assert.deepEqual(errors, []);
  const cameraPage = await browser.newPage();
  await cameraPage.addInitScript(() => {
    window.__stopped = 0;
    window.__detectCode = false;
    window.BarcodeDetector = class {
      static async getSupportedFormats() { return ['ean_13']; }
      async detect() { return window.__detectCode ? [{rawValue:'3017620422003'}] : []; }
    };
    navigator.mediaDevices.getUserMedia = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 320; canvas.height = 240;
      canvas.getContext('2d').fillRect(0, 0, 320, 240);
      const stream = canvas.captureStream(10);
      for (const track of stream.getTracks()) {
        const stop = track.stop.bind(track);
        track.stop = () => { window.__stopped++; stop(); };
      }
      return stream;
    };
  });
  await cameraPage.route('https://world.openfoodfacts.org/api/v2/product/**', route => route.fulfill({json:{status:1, product:{product_name:'Produto da câmera', nutriments:{}}}}));
  await cameraPage.goto(process.env.APP_URL || 'http://127.0.0.1:3002');
  await cameraPage.getByRole('button', {name:'Buscar por código de barras'}).click();
  await cameraPage.getByRole('button', {name:'Usar câmera'}).click();
  await cameraPage.waitForFunction(() => document.querySelector('video')?.srcObject?.active);
  await cameraPage.getByRole('button', {name:'Fechar consulta'}).click();
  await cameraPage.waitForFunction(() => window.__stopped > 0);
  await cameraPage.evaluate(() => { window.__detectCode = true; });
  await cameraPage.getByRole('button', {name:'Buscar por código de barras'}).click();
  await cameraPage.getByRole('button', {name:'Usar câmera'}).click();
  await cameraPage.getByLabel('Nome do produto').waitFor();
  assert.equal(await cameraPage.getByLabel('Nome do produto').inputValue(), 'Produto da câmera');
  await cameraPage.waitForFunction(() => window.__stopped >= 2);
  console.log('PASS: simulated camera detection and track cleanup on close and successful scan.');
  console.log('PASS: mobile lookup, required unit, scaled diary, reload persistence, missing nutrients, invalid code, not found, offline, camera fallback, manual form; external API mocked.');
} finally { await browser.close(); }
