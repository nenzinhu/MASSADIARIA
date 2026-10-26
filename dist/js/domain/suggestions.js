import { scaleNutrition } from "./nutrition.js";

const roundAmount = (amount, unit) => unit === "un"
  ? Math.max(0.25, Math.round(amount * 4) / 4)
  : Math.max(5, Math.round(amount / 5) * 5);

function practicalAmount(food, value) {
  const maximum = food.unit === "un" ? 2 : Math.min(600, food.baseAmount * 5);
  return Math.min(maximum, roundAmount(value, food.unit));
}

function bestPortion(food, remainingCalories, remainingProtein) {
  const amounts = new Set([
    food.baseAmount * 0.5,
    food.baseAmount,
    food.baseAmount * 1.5,
    food.baseAmount * 2,
    food.calories > 0 ? food.baseAmount * remainingCalories / food.calories : food.baseAmount,
    food.protein > 0 ? food.baseAmount * remainingProtein / food.protein : food.baseAmount,
  ].map(value => practicalAmount(food, value)));

  return [...amounts].map(quantity => {
    const nutrition = scaleNutrition(food, quantity);
    const calorieDistance = Math.abs(remainingCalories - nutrition.calories) / Math.max(remainingCalories, 150);
    const proteinDistance = Math.abs(remainingProtein - nutrition.protein) / Math.max(remainingProtein, 15);
    const excess = Math.max(0, nutrition.calories - remainingCalories) / Math.max(remainingCalories, 150)
      + Math.max(0, nutrition.protein - remainingProtein) / Math.max(remainingProtein, 15);
    return { quantity, nutrition, score: calorieDistance + proteinDistance * 0.85 + excess * 0.45 };
  }).sort((left, right) => left.score - right.score)[0];
}

export function getDailySuggestions({ foods, current, profile, preferences }) {
  const remainingCalories = Math.max(0, profile.calorieGoal - current.calories);
  const remainingProtein = Math.max(0, profile.proteinGoal - current.protein);
  if (remainingCalories <= 25 && remainingProtein <= 2) {
    return { status: "complete", remainingCalories, remainingProtein, suggestions: [] };
  }

  const excluded = new Set(preferences.excludedAllergens ?? []);
  const candidates = foods.filter(food => {
    if (food.mealParts) return false;
    if (![food.baseAmount, food.calories, food.protein].every(value => Number.isFinite(Number(value)))) return false;
    if (Number(food.calories) <= 0 || Number(food.baseAmount) <= 0) return false;
    if (!preferences.includeCustomFoods && food.custom) return false;
    if (!preferences.includeEstimates && food.source?.type === "estimate") return false;
    if (preferences.candidateTypes === "recipes" && !food.recipe) return false;
    if (preferences.candidateTypes === "foods" && food.recipe) return false;
    return !(food.allergens ?? []).some(allergen => excluded.has(allergen));
  });

  const suggestions = candidates.map(food => ({ food, ...bestPortion(food, remainingCalories, remainingProtein) }))
    .sort((left, right) => left.score - right.score)
    .slice(0, 3)
    .map(item => ({
      ...item,
      reason: `Ajuda com ${Math.round(item.nutrition.calories)} kcal e ${item.nutrition.protein.toFixed(1).replace(".", ",")} g de proteína.`,
    }));

  return { status: suggestions.length ? "ready" : "empty", remainingCalories, remainingProtein, suggestions };
}
