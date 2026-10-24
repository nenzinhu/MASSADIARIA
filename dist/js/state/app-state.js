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

function parseDecimal(value) {
  return typeof value === "string" ? Number(value.replace(",", ".")) : Number(value);
}

function normalizedName(value) {
  return value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
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
    addMeal(date, items) {
      if (!Array.isArray(items) || !items.length) return { ok: false, error: "Informe os ingredientes da refeição." };
      const entries = [];
      for (const item of items) {
        const quantity = validateQuantity(item?.quantity);
        if (!quantity.valid) return { ok: false, error: quantity.error };
        const food = foods().find(food => food.id === item.foodId);
        if (!food) return { ok: false, error: "Alimento não encontrado." };
        entries.push({
          id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
          food: structuredClone(food),
          quantity: quantity.value,
          nutrition: scaleNutrition(food, quantity.value),
        });
      }
      state.entriesByDate[date] = [...entriesFor(date), ...entries];
      persist();
      return { ok: true, entries: structuredClone(entries) };
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
    updateProfile(patch) {
      const next = { ...state.profile };
      const weightFields = ["startWeight", "currentWeight", "targetWeight"];
      const macroFields = ["proteinGoal", "carbsGoal", "fatGoal"];

      for (const [key, rawValue] of Object.entries(patch)) {
        if (![...weightFields, ...macroFields, "calorieGoal"].includes(key)) continue;
        const value = parseDecimal(rawValue);
        if (!Number.isFinite(value)) return { ok: false, error: "Revise os valores informados." };
        if (weightFields.includes(key) && (value < 30 || value > 300)) {
          return { ok: false, error: "Informe pesos entre 30 e 300 kg." };
        }
        if (key === "calorieGoal" && (value < 500 || value > 10000)) {
          return { ok: false, error: "Informe uma meta entre 500 e 10.000 kcal." };
        }
        if (macroFields.includes(key) && (value < 0 || value > 1000)) {
          return { ok: false, error: "Informe metas de macros entre 0 e 1.000 g." };
        }
        next[key] = value;
      }
      state.profile = next;
      persist();
      return { ok: true, profile: structuredClone(next) };
    },
    addCustomFood(input) {
      const name = String(input.name ?? "").trim();
      if (!name) return { ok: false, error: "Informe o nome do alimento." };
      if (foods().some((food) => normalizedName(food.name) === normalizedName(name))) {
        return { ok: false, error: "Já existe um alimento com esse nome." };
      }
      const baseAmount = parseDecimal(input.baseAmount);
      const calories = parseDecimal(input.calories);
      const macros = [parseDecimal(input.protein), parseDecimal(input.carbs), parseDecimal(input.fat)];
      if (!Number.isFinite(baseAmount) || baseAmount <= 0 || baseAmount > 10000 || !["g", "ml", "un"].includes(input.unit)) {
        return { ok: false, error: "Informe uma porção e unidade válidas." };
      }
      if (!Number.isFinite(calories) || calories < 0 || calories > 10000 || macros.some((value) => !Number.isFinite(value) || value < 0 || value > 1000)) {
        return { ok: false, error: "Informe valores nutricionais entre 0 e 1.000." };
      }
      const food = {
        id: `custom-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`}`,
        name,
        baseAmount,
        unit: input.unit,
        calories,
        protein: macros[0],
        carbs: macros[1],
        fat: macros[2],
        custom: true,
      };
      state.customFoods = [...state.customFoods, food];
      persist();
      return { ok: true, food: structuredClone(food) };
    },
    removeCustomFood(id) {
      const food = state.customFoods.find((item) => item.id === id);
      if (!food) return { ok: false, error: "Alimento personalizado não encontrado." };
      state.customFoods = state.customFoods.filter((item) => item.id !== id);
      persist();
      return { ok: true, food: structuredClone(food) };
    },
    clearAllData(confirmation) {
      if (confirmation !== true) return { ok: false, error: "Confirmação necessária." };
      repository.clearState();
      state = createDefaultState();
      selectedDate = todayProvider();
      return { ok: true };
    },
  };
}
