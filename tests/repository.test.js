import test from "node:test";
import assert from "node:assert/strict";

import { createRepository } from "../dist/js/storage/repository.js";
import { DEFAULT_PROFILE, createAppState, createDefaultState } from "../dist/js/state/app-state.js";

function createMemoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
    has(key) { return values.has(key); },
  };
}

test("repositório: retorna estado padrão quando não há dados", () => {
  const repository = createRepository(createMemoryStorage());
  assert.deepEqual(repository.loadState(), createDefaultState());
  assert.deepEqual(repository.loadState().profile, DEFAULT_PROFILE);
});

test("repositório: salva e recupera o estado completo", () => {
  const storage = createMemoryStorage();
  const repository = createRepository(storage);
  const state = createDefaultState();
  state.weights.push({ date: "2026-10-21", value: 66.4 });

  repository.saveState(state);
  assert.deepEqual(repository.loadState(), state);
});

test("repositório: JSON inválido volta para um estado seguro", () => {
  const repository = createRepository(createMemoryStorage({
    "massa-diaria:v1": "{quebrado",
  }));
  assert.deepEqual(repository.loadState(), createDefaultState());
});

test("repositório: descarta só registros malformados", () => {
  const validEntry = {
    id: "entry-1",
    food: { id: "banana", name: "Banana", baseAmount: 100, unit: "g", calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, custom: false },
    quantity: 100,
    nutrition: { calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3 },
  };
  const storage = createMemoryStorage({
    "massa-diaria:v1": JSON.stringify({
      version: 1,
      profile: { ...DEFAULT_PROFILE, currentWeight: 67 },
      entriesByDate: { "2026-10-21": [validEntry, { id: "bad" }] },
      weights: [{ date: "2026-10-21", value: 67 }, { nope: true }],
      customFoods: [{ id: "custom-ok", name: "Vitamina", baseAmount: 300, unit: "ml", calories: 400, protein: 20, carbs: 50, fat: 12, custom: true }, { id: "bad" }],
    }),
  });

  const state = createRepository(storage).loadState();
  assert.equal(state.profile.currentWeight, 67);
  assert.deepEqual(state.entriesByDate["2026-10-21"], [validEntry]);
  assert.deepEqual(state.weights, [{ date: "2026-10-21", value: 67 }]);
  assert.equal(state.customFoods.length, 1);
});

test("repositório: remove somente sua chave ao limpar", () => {
  const storage = createMemoryStorage({
    "massa-diaria:v1": "{}",
    outro: "preservado",
  });
  createRepository(storage).clearState();
  assert.equal(storage.has("massa-diaria:v1"), false);
  assert.equal(storage.getItem("outro"), "preservado");
});

test("estado: usa o repositório e a data local injetados", () => {
  const repository = createRepository(createMemoryStorage());
  const appState = createAppState(repository, () => "2026-10-21");
  assert.equal(appState.getSnapshot().selectedDate, "2026-10-21");
  assert.deepEqual(appState.getSnapshot().profile, DEFAULT_PROFILE);
});
