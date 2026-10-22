import test from "node:test";
import assert from "node:assert/strict";

import { createAppState, createDefaultState } from "../dist/js/state/app-state.js";

function createRepository(initial = createDefaultState()) {
  let stored = structuredClone(initial);
  let saves = 0;
  return {
    loadState: () => structuredClone(stored),
    saveState(next) { stored = structuredClone(next); saves += 1; },
    clearState() { stored = createDefaultState(); },
    get saves() { return saves; },
  };
}

test("diário: inclui alimento e calcula o total do dia", () => {
  const repository = createRepository();
  const app = createAppState(repository, () => "2026-10-21");

  const result = app.addEntry("2026-10-21", "banana", 200);

  assert.equal(result.ok, true);
  assert.equal(result.entry.food.name, "Banana");
  assert.deepEqual(app.getDailySummary("2026-10-21").nutrition, {
    calories: 178,
    protein: 2.2,
    carbs: 45.6,
    fat: 0.6,
  });
  assert.equal(repository.saves, 1);
});

test("diário: edita a quantidade e persiste uma vez", () => {
  const repository = createRepository();
  const app = createAppState(repository, () => "2026-10-21");
  const { entry } = app.addEntry("2026-10-21", "banana", 100);

  const result = app.updateEntry("2026-10-21", entry.id, 150);

  assert.equal(result.ok, true);
  assert.equal(app.getDailySummary("2026-10-21").entries[0].quantity, 150);
  assert.equal(app.getDailySummary("2026-10-21").nutrition.calories, 133.5);
  assert.equal(repository.saves, 2);
});

test("diário: remove e restaura o mesmo registro", () => {
  const app = createAppState(createRepository(), () => "2026-10-21");
  const { entry } = app.addEntry("2026-10-21", "banana", 100);

  const removed = app.removeEntry("2026-10-21", entry.id);
  assert.equal(removed.ok, true);
  assert.equal(app.getDailySummary("2026-10-21").entries.length, 0);

  assert.equal(app.restoreEntry("2026-10-21", removed.entry).ok, true);
  assert.deepEqual(app.getDailySummary("2026-10-21").entries, [entry]);
});

test("diário: não edita nem exclui registro pertencente a outra data", () => {
  const repository = createRepository();
  const app = createAppState(repository, () => "2026-10-21");
  const { entry } = app.addEntry("2026-10-20", "banana", 100);
  const savesBefore = repository.saves;

  assert.equal(app.updateEntry("2026-10-21", entry.id, 200).ok, false);
  assert.equal(app.removeEntry("2026-10-21", entry.id).ok, false);
  assert.equal(app.getDailySummary("2026-10-20").entries[0].quantity, 100);
  assert.equal(repository.saves, savesBefore);
});

test("diário: quantidade inválida não altera nem salva o estado", () => {
  const repository = createRepository();
  const app = createAppState(repository, () => "2026-10-21");

  const result = app.addEntry("2026-10-21", "banana", 0);

  assert.deepEqual(result, { ok: false, error: "Informe uma quantidade maior que zero." });
  assert.equal(app.getDailySummary("2026-10-21").entries.length, 0);
  assert.equal(repository.saves, 0);
});

test("diário: rejeita alimento inexistente sem salvar", () => {
  const repository = createRepository();
  const app = createAppState(repository, () => "2026-10-21");
  assert.deepEqual(app.addEntry("2026-10-21", "nao-existe", 10), {
    ok: false,
    error: "Alimento não encontrado.",
  });
  assert.equal(repository.saves, 0);
});
