export const EMPTY_NUTRITION = Object.freeze({
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
});

export function validateQuantity(rawValue) {
  if (rawValue === "" || rawValue === null || rawValue === undefined) {
    return { valid: false, value: null, error: "Informe uma quantidade maior que zero." };
  }

  const value = typeof rawValue === "string"
    ? Number(rawValue.replace(",", "."))
    : Number(rawValue);

  if (!Number.isFinite(value) || value <= 0) {
    return { valid: false, value: null, error: "Informe uma quantidade maior que zero." };
  }

  return { valid: true, value, error: "" };
}

export function scaleNutrition(food, quantity) {
  const factor = quantity / food.baseAmount;
  return {
    calories: food.calories * factor,
    protein: food.protein * factor,
    carbs: food.carbs * factor,
    fat: food.fat * factor,
  };
}

export function sumNutrition(items) {
  return items.reduce(
    (total, item) => ({
      calories: total.calories + item.calories,
      protein: total.protein + item.protein,
      carbs: total.carbs + item.carbs,
      fat: total.fat + item.fat,
    }),
    { ...EMPTY_NUTRITION },
  );
}
