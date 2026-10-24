import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeBarcode, productToFood, lookupBarcode } from '../lib/barcode.js';
import { createAppState, createDefaultState } from '../dist/js/state/app-state.js';

const product = { product_name: 'Aveia', brands: 'Marca', nutriments: { 'energy-kcal_100g': 380, proteins_100g: 12, carbohydrates_100g: 60, fat_100g: 8 } };
test('barcode: preserves leading zeros and validates GTIN checksum', () => {
  assert.equal(normalizeBarcode(' 0 3017620422003 '), '03017620422003');
  for (const value of ['3017620422004', 'abc3017620422003', '', '../3017620422003', '1234567']) assert.throws(() => normalizeBarcode(value));
  assert.equal(normalizeBarcode('3017620422003'), '3017620422003');
});
test('barcode: maps per-100 nutrients and does not guess mass versus volume', () => {
  const food = productToFood(product);
  assert.equal(food.name, 'Aveia — Marca');
  assert.equal(food.calories, 380);
  assert.equal(food.protein, 12);
  assert.equal(food.carbs, 60);
  assert.equal(food.fat, 8);
  assert.equal(food.baseAmount, 100);
  assert.equal(food.unit, '');
});
test('barcode: missing, negative and malformed nutrients remain blank; zero is valid', () => {
  const food = productToFood({ nutriments: { proteins_100g: 0, fat_100g: -1, carbohydrates_100g: '', 'energy-kcal_100g': null } });
  assert.equal(food.protein, 0);
  assert.equal(food.fat, '');
  assert.equal(food.carbs, '');
  assert.equal(food.calories, '');
});
test('barcode: converts explicitly labelled kJ to kcal, never substitutes serving values', () => {
  assert.equal(productToFood({ nutriments: { 'energy-kj_100g': 418.4 } }).calories, 100);
  assert.equal(productToFood({ nutriments: { 'energy-kcal_serving': 120 } }).calories, '');
});
test('barcode: retrieves only requested product and surfaces provider failures', async () => {
  const food = await lookupBarcode('3017620422003', { fetcher: async (url) => {
    assert.equal(new URL(url).pathname, '/api/v2/product/3017620422003.json');
    return Response.json({ status: 1, product });
  }});
  assert.equal(food.name, 'Aveia — Marca');
  for (const response of [Response.json({ status: 0 }), Response.json({}, {status: 429}), Response.json({status: 1})]) {
    await assert.rejects(lookupBarcode('3017620422003', {fetcher: async () => response}));
  }
  await assert.rejects(lookupBarcode('3017620422003', {fetcher: async () => { throw new TypeError('offline'); }}));
});
test('barcode: reviewed product persists and 50 g scales nutrition in the diary', () => {
  let saved = createDefaultState();
  const repo = {loadState: () => structuredClone(saved), saveState: value => { saved = structuredClone(value); }};
  const app = createAppState(repo, () => '2026-10-23');
  const result = app.addCustomFood({...productToFood(product), unit: 'g'});
  assert.equal(result.ok, true);
  assert.equal(app.addEntry('2026-10-23', result.food.id, 50).ok, true);
  const restored = createAppState(repo, () => '2026-10-23');
  assert.deepEqual(restored.getDailySummary('2026-10-23').nutrition, {calories:190, protein:6, carbs:30, fat:4});
});
