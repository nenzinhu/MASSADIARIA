import { createDefaultState, DEFAULT_PROFILE, DEFAULT_SUGGESTION_PREFERENCES } from "../state/app-state.js";

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

function normalizeSource(value, custom = false) {
  if (value && ["catalog", "label", "open_food_facts", "estimate"].includes(value.type) && typeof value.label === "string") {
    return {
      type: value.type,
      label: value.label,
      ...(typeof value.url === "string" ? { url: value.url } : {}),
    };
  }
  return custom
    ? { type: "label", label: "Rótulo informado pelo usuário" }
    : { type: "estimate", label: "Estimativa do catálogo MassaDiária" };
}

function normalizeFood(value) {
  if (!isFood(value)) return null;
  return {
    ...value,
    brand: typeof value.brand === "string" ? value.brand : "",
    source: normalizeSource(value.source, value.custom === true),
    reviewedAt: typeof value.reviewedAt === "string" ? value.reviewedAt : "",
    allergens: Array.isArray(value.allergens) ? [...new Set(value.allergens.filter(item => typeof item === "string"))] : [],
  };
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

function normalizeEntry(value) {
  if (!isEntry(value)) return null;
  return { ...value, food: normalizeFood(value.food) };
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
      if (Array.isArray(entries)) entriesByDate[date] = entries.map(normalizeEntry).filter(Boolean);
    }
  }

  return {
    version: 2,
    profile: normalizeProfile(value.profile),
    entriesByDate,
    weights: Array.isArray(value.weights)
      ? value.weights.filter((item) => item && typeof item.date === "string" && isFiniteNumber(item.value))
      : [],
    customFoods: Array.isArray(value.customFoods) ? value.customFoods.map(normalizeFood).filter(Boolean) : [],
    suggestionPreferences: {
      ...DEFAULT_SUGGESTION_PREFERENCES,
      ...(value.suggestionPreferences && typeof value.suggestionPreferences === "object" ? value.suggestionPreferences : {}),
      excludedAllergens: Array.isArray(value.suggestionPreferences?.excludedAllergens)
        ? value.suggestionPreferences.excludedAllergens.filter(item => typeof item === "string")
        : [],
    },
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
