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

export function productToFood(product) {
  const n = product.nutriments ?? {};
  let calories = nutrient(n['energy-kcal_100g']);
  const kj = nutrient(n['energy-kj_100g']);
  if (calories === '' && kj !== '') calories = Math.round(kj / 4.184 * 100) / 100;
  const name = [product.product_name_pt || product.product_name, product.brands].filter(value => typeof value === 'string' && value.trim()).join(' — ');
  return { name, baseAmount: 100, unit: '', calories, protein: nutrient(n.proteins_100g), carbs: nutrient(n.carbohydrates_100g), fat: nutrient(n.fat_100g) };
}

/** @param {string} input
 * @param {{ fetcher?: typeof fetch, signal?: AbortSignal }} options
 */
export async function lookupBarcode(input, { fetcher = fetch, signal } = {}) {
  const code = normalizeBarcode(input);
  const timeout = AbortSignal.timeout(12000);
  const response = await fetcher(`${API}${code}.json?fields=product_name,product_name_pt,brands,nutriments`, {
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
  });
  if (response.status === 404) throw new Error('Produto não encontrado. Cadastre os valores do rótulo manualmente.');
  if (!response.ok) throw new Error('A consulta está indisponível. Tente novamente ou cadastre manualmente.');
  const data = await response.json();
  if (data.status === 0) throw new Error('Produto não encontrado. Cadastre os valores do rótulo manualmente.');
  if (data.status !== 1 || !data.product || typeof data.product !== 'object') throw new Error('A base retornou dados inválidos. Cadastre pelo rótulo.');
  return { ...productToFood(data.product), barcode: code };
}
