import test from "node:test";
import assert from "node:assert/strict";

import {
  scaleNutrition,
  sumNutrition,
  validateQuantity,
} from "../dist/js/domain/nutrition.js";

const oats = {
  id: "oats",
  name: "Aveia",
  baseAmount: 100,
  unit: "g",
  calories: 389,
  protein: 16.9,
  carbs: 66.3,
  fat: 6.9,
  custom: false,
};

test("nutrição: escala uma porção de 30 g a partir de 100 g", () => {
  const result = scaleNutrition(oats, 30);
  assert.ok(Math.abs(result.calories - 116.7) < 1e-9);
  assert.ok(Math.abs(result.protein - 5.07) < 1e-9);
  assert.ok(Math.abs(result.carbs - 19.89) < 1e-9);
  assert.ok(Math.abs(result.fat - 2.07) < 1e-9);
});

test("nutrição: soma dois registros", () => {
  assert.deepEqual(
    sumNutrition([
      { calories: 100, protein: 4, carbs: 12, fat: 3 },
      { calories: 250, protein: 16, carbs: 28, fat: 9 },
    ]),
    { calories: 350, protein: 20, carbs: 40, fat: 12 },
  );
});

test("nutrição: preserva precisão interna sem arredondar cedo", () => {
  const result = scaleNutrition({ ...oats, calories: 1 }, 33.333);
  assert.ok(Math.abs(result.calories - 0.33333) < 1e-12);
});

for (const invalid of ["", "abc", 0, -1]) {
  test(`quantidade: rejeita ${JSON.stringify(invalid)}`, () => {
    assert.deepEqual(validateQuantity(invalid), {
      valid: false,
      value: null,
      error: "Informe uma quantidade maior que zero.",
    });
  });
}

test("quantidade: aceita número decimal positivo", () => {
  assert.deepEqual(validateQuantity("25,5"), {
    valid: true,
    value: 25.5,
    error: "",
  });
});
