import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_FOODS } from '../dist/js/data/foods.js';
import { scaleNutrition } from '../dist/js/domain/nutrition.js';

test('hipercalóricos: receitas disponíveis com ingredientes e porção inteira', () => {
  const shakes = INITIAL_FOODS.filter(food => food.recipe);
  assert.equal(shakes.length, 14);
  assert.equal(new Set(INITIAL_FOODS.map(food => food.id)).size, INITIAL_FOODS.length);
  for (const shake of shakes) {
    assert.equal(shake.baseAmount, 1);
    assert.equal(shake.unit, 'un');
    assert.ok(shake.recipe.length >= 3);
    for (const ingredient of shake.recipe) assert.ok(INITIAL_FOODS.some(food => food.id === ingredient.foodId));
    assert.ok(shake.calories >= 500 && shake.calories <= 1220);
  }
});
test('hipercalóricos: receita de banana soma ingredientes e escala meia porção', () => {
  const shake = INITIAL_FOODS.find(food => food.id === 'shake-banana-amendoim');
  assert.ok(shake);
  // Leite 300 ml + banana 150 g + aveia 60 g + pasta de amendoim 30 g.
  assert.equal(shake.calories, 684.9);
  assert.equal(shake.protein, 28.99);
  assert.equal(shake.carbs, 94.78);
  assert.equal(shake.fat, 24.39);
  assert.equal(scaleNutrition(shake, 0.5).calories, 342.45);
});

// Uma faixa errada ou um ingrediente omitido deve invalidar o total anunciado.
test('hipercalóricos: duas receitas por faixa e totais próximos da faixa anunciada', () => {
  for (const target of [600, 800, 1000, 1200]) {
    const recipes = INITIAL_FOODS.filter(food => food.targetCalories === target);
    assert.equal(recipes.length, 2);
    for (const recipe of recipes) assert.ok(Math.abs(recipe.calories - target) <= 20, recipe.name);
  }
});
test('hipercalóricos: 1200 kcal soma ingredientes e permite meia receita', () => {
  const recipe = INITIAL_FOODS.find(food => food.id === 'shake-1200-leite-po');
  assert.ok(recipe);
  // Leite integral 400 ml (244), banana 200 g (178), aveia 100 g (389),
  // pasta de amendoim 40 g (240), leite em pó 30 g (148,8).
  assert.equal(recipe.calories, 1199.8);
  assert.equal(scaleNutrition(recipe, 0.5).calories, 599.9);
});
test('hipercalóricos: macros e energia correspondem à soma de todos os ingredientes', () => {
  for (const recipe of INITIAL_FOODS.filter(food => food.recipe)) {
    for (const field of ['calories', 'protein', 'carbs', 'fat']) {
      const expected = recipe.recipe.reduce((sum, part) => {
        const food = INITIAL_FOODS.find(food => food.id === part.foodId);
        return sum + food[field] * part.quantity / food.baseAmount;
      }, 0);
      assert.ok(Math.abs(recipe[field] - expected) <= 0.0051, `${recipe.id}: ${field}`);
    }
  }
});
test('catálogo: alimentos densos têm porções individuais ajustáveis', () => {
  for (const id of ['leite-po-integral', 'nozes', 'castanha-caju', 'amendoas', 'coco-seco', 'uvas-passas', 'tamaras', 'tahine']) {
    const food = INITIAL_FOODS.find(food => food.id === id);
    assert.ok(food?.energyDense, id);
    assert.equal(food.unit, 'g');
    assert.ok(food.baseAmount > 0);
    assert.ok(scaleNutrition(food, 100).calories >= 280);
  }
  assert.equal(scaleNutrition(INITIAL_FOODS.find(food => food.id === 'nozes'), 15).calories, 98.1);
});
