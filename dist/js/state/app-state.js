import { INITIAL_FOODS } from "../data/foods.js";
import { scaleNutrition, sumNutrition, validateQuantity } from "../domain/nutrition.js";
import { classifyWeeklyRate, groupWeeklyAverages } from "../domain/progress.js";

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

export function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function createAppState(repository, todayProvider = () => localDateKey()) {
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
    recordWeight(date, rawValue) {
      const value = typeof rawValue === "string" ? Number(rawValue.replace(",", ".")) : Number(rawValue);
      if (!Number.isFinite(value) || value < 30 || value > 300) {
        return { ok: false, error: "Informe um peso entre 30 e 300 kg." };
      }
      state.weights = [...state.weights.filter((item) => item.date !== date), { date, value }]
        .sort((left, right) => left.date.localeCompare(right.date));
      state.profile.currentWeight = state.weights.at(-1).value;
      persist();
      return { ok: true, weight: { date, value } };
    },
    getHistorySnapshot(date) {
      const weights = structuredClone(state.weights);
      const weeklyAverages = groupWeeklyAverages(weights);
      return {
        selectedDate: date,
        daily: this.getDailySummary(date),
        weights,
        weeklyAverages,
        rate: classifyWeeklyRate(weeklyAverages, state.profile.weeklyGainGoal),
      };
    },
  };
}
