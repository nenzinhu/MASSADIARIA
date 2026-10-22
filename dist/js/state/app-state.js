import { INITIAL_FOODS } from "../data/foods.js";
import { scaleNutrition, sumNutrition, validateQuantity } from "../domain/nutrition.js";

export const DEFAULT_PROFILE = Object.freeze({
  sex: "masculino",
  age: 39,
  height: 179,
  startWeight: 66,
  currentWeight: 66,
  targetWeight: 73,
  activityLevel: "moderada",
  calorieGoal: 3000,
  proteinGoal: 140,
  carbsGoal: 400,
  fatGoal: 90,
  weeklyGainGoal: 0.5,
});

export function createDefaultState() {
  return {
    version: 1,
    profile: { ...DEFAULT_PROFILE },
    entriesByDate: {},
    weights: [],
    customFoods: [],
  };
}

export function createAppState(repository, todayProvider = () => new Date().toISOString().slice(0, 10)) {
  let state = repository.loadState();
  let selectedDate = todayProvider();

  function foods() {
    return [...INITIAL_FOODS, ...state.customFoods];
  }

  function entriesFor(date) {
    return state.entriesByDate[date] ?? [];
  }

  function persist() {
    repository.saveState(state);
  }

  function findEntry(date, entryId) {
    return entriesFor(date).find((entry) => entry.id === entryId);
  }

  return {
    getSnapshot() {
      return {
        ...structuredClone(state),
        selectedDate,
        foods: foods(),
      };
    },
    selectDate(date) {
      selectedDate = date;
    },
    addEntry(date, foodId, rawQuantity) {
      const quantity = validateQuantity(rawQuantity);
      if (!quantity.valid) return { ok: false, error: quantity.error };
      const food = foods().find((item) => item.id === foodId);
      if (!food) return { ok: false, error: "Alimento não encontrado." };

      const entry = {
        id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
        food: structuredClone(food),
        quantity: quantity.value,
        nutrition: scaleNutrition(food, quantity.value),
      };
      state.entriesByDate[date] = [...entriesFor(date), entry];
      persist();
      return { ok: true, entry: structuredClone(entry) };
    },
    updateEntry(date, entryId, rawQuantity) {
      const quantity = validateQuantity(rawQuantity);
      if (!quantity.valid) return { ok: false, error: quantity.error };
      const entry = findEntry(date, entryId);
      if (!entry) return { ok: false, error: "Registro não encontrado nesta data." };
      entry.quantity = quantity.value;
      entry.nutrition = scaleNutrition(entry.food, quantity.value);
      persist();
      return { ok: true, entry: structuredClone(entry) };
    },
    removeEntry(date, entryId) {
      const entry = findEntry(date, entryId);
      if (!entry) return { ok: false, error: "Registro não encontrado nesta data." };
      state.entriesByDate[date] = entriesFor(date).filter((item) => item.id !== entryId);
      persist();
      return { ok: true, entry: structuredClone(entry) };
    },
    restoreEntry(date, entry) {
      if (!entry || findEntry(date, entry.id)) return { ok: false, error: "Não foi possível restaurar o registro." };
      state.entriesByDate[date] = [...entriesFor(date), structuredClone(entry)];
      persist();
      return { ok: true, entry: structuredClone(entry) };
    },
    getDailySummary(date) {
      const entries = structuredClone(entriesFor(date));
      return {
        date,
        entries,
        nutrition: sumNutrition(entries.map((entry) => entry.nutrition)),
      };
    },
  };
}
