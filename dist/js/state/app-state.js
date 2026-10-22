import { INITIAL_FOODS } from "../data/foods.js";

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

  return {
    getSnapshot() {
      return {
        ...structuredClone(state),
        selectedDate,
        foods: [...INITIAL_FOODS, ...state.customFoods],
      };
    },
    selectDate(date) {
      selectedDate = date;
    },
  };
}
