import test from "node:test";
import assert from "node:assert/strict";

import { createAppState, createDefaultState } from "../dist/js/state/app-state.js";

function repository() {
  let state = createDefaultState();
  let cleared = 0;
  return {
    loadState: () => structuredClone(state),
    saveState: (next) => { state = structuredClone(next); },
    clearState: () => { state = createDefaultState(); cleared += 1; },
    get cleared() { return cleared; },
  };
}

const customFood = {
  name: "Vitamina hipercalórica",
  baseAmount: 300,
  unit: "ml",
  calories: 520,
  protein: 24,
  carbs: 72,
  fat: 16,
};

test("perfil: atualiza pesos e as quatro metas", () => {
  const app = createAppState(repository(), () => "2026-10-21");
  const result = app.updateProfile({
    currentWeight: 67,
    targetWeight: 74,
    calorieGoal: 3200,
    proteinGoal: 150,
    carbsGoal: 420,
    fatGoal: 95,
  });
  assert.equal(result.ok, true);
  assert.deepEqual(
    Object.fromEntries(["currentWeight", "targetWeight", "calorieGoal", "proteinGoal", "carbsGoal", "fatGoal"].map((key) => [key, app.getSnapshot().profile[key]])),
    { currentWeight: 67, targetWeight: 74, calorieGoal: 3200, proteinGoal: 150, carbsGoal: 420, fatGoal: 95 },
  );
});

test("perfil: rejeita peso e meta calórica fora dos limites", () => {
  const app = createAppState(repository(), () => "2026-10-21");
  assert.equal(app.updateProfile({ currentWeight: 20 }).ok, false);
  assert.equal(app.updateProfile({ calorieGoal: 12000 }).ok, false);
  assert.equal(app.getSnapshot().profile.currentWeight, 66);
  assert.equal(app.getSnapshot().profile.calorieGoal, 3000);
});

test("alimento personalizado: cadastra valores válidos", () => {
  const app = createAppState(repository(), () => "2026-10-21");
  const result = app.addCustomFood(customFood);
  assert.equal(result.ok, true);
  assert.equal(result.food.custom, true);
  assert.equal(app.getSnapshot().customFoods[0].name, "Vitamina hipercalórica");
});

test("alimento personalizado: rejeita nome vazio ou repetido ignorando maiúsculas", () => {
  const app = createAppState(repository(), () => "2026-10-21");
  assert.equal(app.addCustomFood({ ...customFood, name: "  " }).ok, false);
  assert.equal(app.addCustomFood(customFood).ok, true);
  assert.deepEqual(app.addCustomFood({ ...customFood, name: "VITAMINA HIPERCALÓRICA" }), {
    ok: false,
    error: "Já existe um alimento com esse nome.",
  });
});

test("alimento personalizado: rejeita macronutriente negativo", () => {
  const app = createAppState(repository(), () => "2026-10-21");
  assert.deepEqual(app.addCustomFood({ ...customFood, protein: -1 }), {
    ok: false,
    error: "Informe valores nutricionais entre 0 e 1.000.",
  });
});

test("alimento personalizado: remoção não apaga registros antigos", () => {
  const app = createAppState(repository(), () => "2026-10-21");
  const { food } = app.addCustomFood(customFood);
  app.addEntry("2026-10-21", food.id, 300);
  assert.equal(app.removeCustomFood(food.id).ok, true);
  assert.equal(app.getSnapshot().customFoods.length, 0);
  assert.equal(app.getDailySummary("2026-10-21").entries[0].food.name, customFood.name);
});

test("limpeza: exige confirmação explícita", () => {
  const repo = repository();
  const app = createAppState(repo, () => "2026-10-21");
  app.addCustomFood(customFood);
  assert.equal(app.clearAllData(false).ok, false);
  assert.equal(repo.cleared, 0);
  assert.equal(app.clearAllData(true).ok, true);
  assert.equal(repo.cleared, 1);
  assert.deepEqual(app.getSnapshot().customFoods, []);
});
