import test from "node:test";
import assert from "node:assert/strict";

import {
  calculateGoalProgress,
  classifyWeeklyRate,
  groupWeeklyAverages,
} from "../dist/js/domain/progress.js";
import { createAppState, createDefaultState, localDateKey } from "../dist/js/state/app-state.js";

function repository() {
  let state = createDefaultState();
  return {
    loadState: () => structuredClone(state),
    saveState: (next) => { state = structuredClone(next); },
    clearState: () => { state = createDefaultState(); },
  };
}

test("progresso: limita a meta entre zero e cem por cento", () => {
  assert.equal(calculateGoalProgress(66, 65, 73), 0);
  assert.equal(calculateGoalProgress(66, 69.5, 73), 50);
  assert.equal(calculateGoalProgress(66, 75, 73), 100);
});

test("progresso: agrupa por segunda-feira e usa apenas pesagens existentes", () => {
  assert.deepEqual(groupWeeklyAverages([
    { date: "2026-10-22", value: 67 },
    { date: "2026-10-12", value: 66 },
    { date: "2026-10-14", value: 67 },
  ]), [
    { weekStart: "2026-10-12", average: 66.5, count: 2 },
    { weekStart: "2026-10-19", average: 67, count: 1 },
  ]);
});

test("progresso: ordena pesagens recebidas fora de ordem", () => {
  const weeks = groupWeeklyAverages([
    { date: "2026-10-26", value: 67.5 },
    { date: "2026-10-05", value: 66 },
    { date: "2026-10-19", value: 67 },
  ]);
  assert.deepEqual(weeks.map((week) => week.weekStart), ["2026-10-05", "2026-10-19", "2026-10-26"]);
});

test("progresso: classifica ritmo abaixo, dentro e acima da faixa", () => {
  assert.equal(classifyWeeklyRate([{ average: 66 }, { average: 66.3 }], 0.5).status, "below");
  assert.equal(classifyWeeklyRate([{ average: 66 }, { average: 66.5 }], 0.5).status, "on-track");
  assert.equal(classifyWeeklyRate([{ average: 66 }, { average: 66.8 }], 0.5).status, "above");
});

test("progresso: informa dados insuficientes com uma semana", () => {
  assert.deepEqual(classifyWeeklyRate([{ average: 66 }], 0.5), {
    status: "insufficient",
    rate: null,
  });
});

test("peso: nova pesagem válida atualiza o peso atual", () => {
  const app = createAppState(repository(), () => "2026-10-21");
  assert.equal(app.recordWeight("2026-10-21", 66.8).ok, true);
  assert.equal(app.getSnapshot().profile.currentWeight, 66.8);
  assert.deepEqual(app.getHistorySnapshot("2026-10-21").weights, [{ date: "2026-10-21", value: 66.8 }]);
});

test("peso: rejeita valor fora do intervalo plausível", () => {
  const app = createAppState(repository(), () => "2026-10-21");
  assert.deepEqual(app.recordWeight("2026-10-21", 301), {
    ok: false,
    error: "Informe um peso entre 30 e 300 kg.",
  });
  assert.equal(app.getSnapshot().weights.length, 0);
});

test("data local: não avança o dia durante a noite no fuso de Brasília", () => {
  const localDate = {
    getFullYear: () => 2026,
    getMonth: () => 9,
    getDate: () => 21,
  };
  assert.equal(localDateKey(localDate), "2026-10-21");
});
