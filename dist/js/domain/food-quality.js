export const ALLERGEN_OPTIONS = Object.freeze([
  ["leite", "Leite"],
  ["amendoim", "Amendoim"],
  ["castanhas", "Castanhas"],
  ["gergelim", "Gergelim"],
  ["gluten", "Glúten"],
  ["soja", "Soja"],
  ["ovo", "Ovo"],
]);

export function allergenLabel(value) {
  return ALLERGEN_OPTIONS.find(([id]) => id === value)?.[1] ?? value;
}

export function foodSourceLabel(food) {
  return food?.source?.label || (food?.custom ? "Rótulo informado pelo usuário" : "Estimativa do catálogo MassaDiária");
}

export function nutritionConsistencyWarning(food) {
  const values = [food?.calories, food?.protein, food?.carbs, food?.fat].map(Number);
  if (values.some(value => !Number.isFinite(value))) return "";
  const [calories, protein, carbs, fat] = values;
  const calculated = (protein * 4) + (carbs * 4) + (fat * 9);
  if (Math.abs(calories - calculated) <= Math.max(50, calories * 0.2)) return "";
  return `As calorias diferem do cálculo pelos macros (${Math.round(calculated)} kcal). Confira o rótulo; fibras e arredondamentos podem explicar a diferença.`;
}
