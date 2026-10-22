import { createAppState } from "./state/app-state.js";
import { createRepository } from "./storage/repository.js";
import { renderApp } from "./ui/render.js";

const root = document.querySelector("#app");
const toastRegion = document.querySelector("#toast-region");
const appState = createAppState(createRepository(window.localStorage));
const ui = { activeView: "today", search: "", formError: "", weightError: "", undo: null, undoTimer: null };

function normalize(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function viewModel() {
  const snapshot = appState.getSnapshot();
  const daily = appState.getDailySummary(snapshot.selectedDate);
  const history = appState.getHistorySnapshot(snapshot.selectedDate);
  const filteredFoods = snapshot.foods.filter((food) => normalize(food.name).includes(normalize(ui.search)));
  return { ...snapshot, daily, history, filteredFoods, ...ui };
}

function render() {
  renderApp(viewModel(), root);
}

function showUndo(entry, date) {
  clearTimeout(ui.undoTimer);
  ui.undo = { entry, date };
  toastRegion.innerHTML = `<div class="toast">Alimento excluído. <button type="button" id="undo-delete">Desfazer</button></div>`;
  ui.undoTimer = setTimeout(() => {
    ui.undo = null;
    toastRegion.innerHTML = "";
  }, 5000);
}

root.addEventListener("input", (event) => {
  if (event.target.matches("#food-search")) {
    ui.search = event.target.value;
    render();
    const search = document.querySelector("#food-search");
    search.focus();
    search.setSelectionRange(search.value.length, search.value.length);
  }
});

root.addEventListener("submit", (event) => {
  if (event.target.matches("#weight-form")) {
    event.preventDefault();
    const data = new FormData(event.target);
    const result = appState.recordWeight(data.get("date"), data.get("value"));
    ui.weightError = result.ok ? "" : result.error;
    render();
    return;
  }
  if (!event.target.matches("#add-food-form")) return;
  event.preventDefault();
  const data = new FormData(event.target);
  const date = appState.getSnapshot().selectedDate;
  const result = appState.addEntry(date, data.get("foodId"), data.get("quantity"));
  ui.formError = result.ok ? "" : result.error;
  if (result.ok) ui.search = "";
  render();
});

root.addEventListener("change", (event) => {
  if (event.target.matches("#history-date")) {
    appState.selectDate(event.target.value);
    render();
  }
});

root.addEventListener("click", (event) => {
  const nav = event.target.closest("[data-nav]");
  if (nav) { ui.activeView = nav.dataset.nav; render(); return; }

  const edit = event.target.closest("[data-edit-entry]");
  if (edit) {
    const date = appState.getSnapshot().selectedDate;
    const input = document.querySelector(`[data-entry-quantity="${CSS.escape(edit.dataset.editEntry)}"]`);
    const result = appState.updateEntry(date, edit.dataset.editEntry, input.value);
    ui.formError = result.ok ? "" : result.error;
    render();
    return;
  }

  const remove = event.target.closest("[data-remove-entry]");
  if (remove) {
    const date = appState.getSnapshot().selectedDate;
    const result = appState.removeEntry(date, remove.dataset.removeEntry);
    if (result.ok) showUndo(result.entry, date);
    render();
  }
});

toastRegion.addEventListener("click", (event) => {
  if (event.target.id !== "undo-delete" || !ui.undo) return;
  appState.restoreEntry(ui.undo.date, ui.undo.entry);
  clearTimeout(ui.undoTimer);
  ui.undo = null;
  toastRegion.innerHTML = "";
  render();
});

window.addEventListener("hashchange", () => {
  const target = location.hash.slice(1);
  if (["hoje", "historico", "perfil"].includes(target)) {
    ui.activeView = { hoje: "today", historico: "history", perfil: "profile" }[target];
    render();
  }
});

render();
