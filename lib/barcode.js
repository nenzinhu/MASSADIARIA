const API = 'https://world.openfoodfacts.org/api/v2/product/';

export function normalizeBarcode(input) {
  const code = String(input ?? '').replace(/\s/g, '');
  if (!/^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(code)) throw new Error('Digite um código de barras de 8, 12, 13 ou 14 dígitos.');
  const digits = [...code].map(Number);
  const check = digits.pop();
  const sum = digits.reverse().reduce((total, digit, index) => total + digit * (index % 2 === 0 ? 3 : 1), 0);
  if ((10 - sum % 10) % 10 !== check) throw new Error('Código inválido. Confira os números abaixo das barras.');
  return code;
}

function nutrient(value) {
  if (typeof value !== 'number' && typeof value !== 'string') return '';
  if (typeof value === 'string' && !value.trim()) return '';
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : '';
}

function servingUnit(product) {
  const text = String(product.serving_size ?? '').toLowerCase();
  if (/ml\b/.test(text)) return 'ml';
  if (/g\b/.test(text)) return 'g';
  return '';
}

function servingNutrition(nutriments, key, amount) {
  const direct = nutrient(nutriments[`${key}_serving`]);
  if (direct !== '') return direct;
  const per100 = nutrient(nutriments[`${key}_100g`]);
  return per100 === '' ? '' : Math.round(per100 * amount) / 100;
}

export function productToFood(product) {
  const n = product.nutriments ?? {};
  const unit = servingUnit(product);
  const servingQuantity = nutrient(product.serving_quantity);
  const hasExactServing = unit !== '' && servingQuantity !== '' && servingQuantity > 0;
  const baseAmount = hasExactServing ? servingQuantity : 100;
  let calories = hasExactServing ? servingNutrition(n, 'energy-kcal', baseAmount) : nutrient(n['energy-kcal_100g']);
  const kj = hasExactServing ? servingNutrition(n, 'energy-kj', baseAmount) : nutrient(n['energy-kj_100g']);
  if (calories === '' && kj !== '') calories = Math.round(kj / 4.184 * 100) / 100;
  const name = [product.product_name_pt || product.product_name, product.brands].filter(value => typeof value === 'string' && value.trim()).join(' — ');
  const allergenText = Array.isArray(product.allergens_tags) ? product.allergens_tags.join(' ').toLowerCase() : '';
  const allergenMatchers = {
    leite: ['milk', 'leite', 'lait'], amendoim: ['peanut', 'amendoim'], castanhas: ['nut', 'nuts', 'castanha', 'amêndoa', 'almond'],
    gergelim: ['sesame', 'gergelim'], gluten: ['gluten', 'wheat', 'trigo'], soja: ['soy', 'soja'], ovo: ['egg', 'ovo'],
  };
  const allergens = Object.entries(allergenMatchers).filter(([, terms]) => terms.some(term => allergenText.includes(term))).map(([id]) => id);
  return {
    name,
    brand: typeof product.brands === 'string' ? product.brands.trim() : '',
    baseAmount,
    unit,
    calories,
    protein: hasExactServing ? servingNutrition(n, 'proteins', baseAmount) : nutrient(n.proteins_100g),
    carbs: hasExactServing ? servingNutrition(n, 'carbohydrates', baseAmount) : nutrient(n.carbohydrates_100g),
    fat: hasExactServing ? servingNutrition(n, 'fat', baseAmount) : nutrient(n.fat_100g),
    servingLabel: hasExactServing ? String(product.serving_size || `${baseAmount} ${unit}`) : '',
    readyToAdd: hasExactServing,
    allergens,
    source: { type: 'open_food_facts', label: 'Open Food Facts' },
    reviewedAt: new Date().toISOString().slice(0, 10),
  };
}

/** @param {string} input
 * @param {{ fetcher?: typeof fetch, signal?: AbortSignal }} options
 */
export async function lookupBarcode(input, { fetcher = fetch, signal } = {}) {
  const code = normalizeBarcode(input);
  const timeout = AbortSignal.timeout(12000);
  const response = await fetcher(`${API}${code}.json?fields=product_name,product_name_pt,brands,nutriments,allergens_tags,serving_size,serving_quantity`, {
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
  });
  if (response.status === 404) throw new Error('Produto não encontrado. Cadastre os valores do rótulo manualmente.');
  if (!response.ok) throw new Error('A consulta está indisponível. Tente novamente ou cadastre manualmente.');
  const data = await response.json();
  if (data.status === 0) throw new Error('Produto não encontrado. Cadastre os valores do rótulo manualmente.');
  if (data.status !== 1 || !data.product || typeof data.product !== 'object') throw new Error('A base retornou dados inválidos. Cadastre pelo rótulo.');
  const food = productToFood(data.product);
  food.readyToAdd = food.readyToAdd && [food.calories, food.protein, food.carbs, food.fat].every(value => value !== '' && Number.isFinite(Number(value)));
  return { ...food, barcode: code, source: { ...food.source, url: `https://world.openfoodfacts.org/product/${code}` } };
}
