import test from "node:test";
import assert from "node:assert/strict";

import { INITIAL_FOODS } from "../dist/js/data/foods.js";

const requestedFoods = [
  "Ovo cozido",
  "Batata-doce cozida",
  "Trophic Basic",
  "Iogurte natural integral",
  "Biscoito wafer de chocolate",
  "Café com leite sem açúcar",
];

test("catálogo: contém os novos alimentos solicitados", () => {
  const names = new Set(INITIAL_FOODS.map((food) => food.name));
  for (const name of requestedFoods) assert.equal(names.has(name), true, `${name} não foi encontrado`);
});

test("catálogo: Trophic Basic usa os valores oficiais por 100 ml", () => {
  const food = INITIAL_FOODS.find((item) => item.id === "trophic-basic");
  assert.deepEqual(food, {
    id: "trophic-basic",
    name: "Trophic Basic",
    baseAmount: 100,
    unit: "ml",
    calories: 120,
    protein: 4.6,
    carbs: 16,
    fat: 4.1,
    custom: false,
  });
});
