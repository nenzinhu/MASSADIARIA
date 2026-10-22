import { createDefaultState, DEFAULT_PROFILE } from "../state/app-state.js";

const DEFAULT_KEY = "massa-diaria:v1";
const PROFILE_FIELDS = Object.keys(DEFAULT_PROFILE);

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function isNutrition(value) {
  return value && ["calories", "protein", "carbs", "fat"].every((key) => isFiniteNumber(value[key]));
}

function isFood(value) {
  return Boolean(
    value
    && typeof value.id === "string"
    && typeof value.name === "string"
    && isFiniteNumber(value.baseAmount)
    && value.baseAmount > 0
    && ["g", "ml", "un"].includes(value.unit)
    && isNutrition(value),
  );
}

function isEntry(value) {
  return Boolean(
    value
    && typeof value.id === "string"
    && isFood(value.food)
    && isFiniteNumber(value.quantity)
    && value.quantity > 0
    && isNutrition(value.nutrition),
  );
}

function normalizeProfile(value) {
  const profile = { ...DEFAULT_PROFILE };
  if (!value || typeof value !== "object") return profile;
  for (const key of PROFILE_FIELDS) {
    const candidate = value[key];
    if (typeof DEFAULT_PROFILE[key] === "number" && isFiniteNumber(candidate)) profile[key] = candidate;
    if (typeof DEFAULT_PROFILE[key] === "string" && typeof candidate === "string") profile[key] = candidate;
  }
  return profile;
}

function normalizeState(value) {
  const fallback = createDefaultState();
  if (!value || typeof value !== "object") return fallback;

  const entriesByDate = {};
  if (value.entriesByDate && typeof value.entriesByDate === "object") {
    for (const [date, entries] of Object.entries(value.entriesByDate)) {
      if (Array.isArray(entries)) entriesByDate[date] = entries.filter(isEntry);
    }
  }

  return {
    version: 1,
    profile: normalizeProfile(value.profile),
    entriesByDate,
    weights: Array.isArray(value.weights)
      ? value.weights.filter((item) => item && typeof item.date === "string" && isFiniteNumber(item.value))
      : [],
    customFoods: Array.isArray(value.customFoods) ? value.customFoods.filter(isFood) : [],
  };
}

export function createRepository(storage, key = DEFAULT_KEY) {
  return {
    loadState() {
      const raw = storage.getItem(key);
      if (raw === null) return createDefaultState();
      try {
        return normalizeState(JSON.parse(raw));
      } catch {
        return createDefaultState();
      }
    },
    saveState(state) {
      storage.setItem(key, JSON.stringify(state));
    },
    clearState() {
      storage.removeItem(key);
    },
  };
}
