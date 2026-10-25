"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { BarcodeFood } from "./BarcodeFood";
import { RecipeOptions } from "./RecipeOptions";
import { SuggestionPanel } from "./SuggestionPanel";
import { createAppState } from "../dist/js/state/app-state.js";
import { createRepository } from "../dist/js/storage/repository.js";
import { ALLERGEN_OPTIONS, allergenLabel, foodSourceLabel, nutritionConsistencyWarning } from "../dist/js/domain/food-quality.js";

type View = "today" | "history" | "profile";
type Dialog = "food" | "clear" | null;

const format = (value: number, digits = 0) => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: digits }).format(value);
const progress = (value: number, goal: number) => goal ? Math.min(100, Math.max(0, (value / goal) * 100)) : 0;
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function AnimatedValue({ value }: { value: number }) {
  const element = useRef<HTMLSpanElement>(null);
  const current = useRef({ value: 0 });
  useEffect(() => {
    const mm = gsap.matchMedia();
    const render = () => {
      if (element.current) element.current.textContent = format(current.current.value, value < 10 ? 1 : 0);
    };
    mm.add("(prefers-reduced-motion: reduce)", () => { current.current.value = value; render(); });
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tween = gsap.to(current.current, { value, duration: 0.7, ease: "power2.out", onUpdate: render, onComplete: render });
      return () => { tween.kill(); };
    });
    return () => {
      const displayed = current.current.value;
      mm.revert();
      current.current.value = displayed;
    };
  }, [value]);
  return <><span ref={element} className="animated-value" aria-hidden="true">{format(value, value < 10 ? 1 : 0)}</span><span className="sr-only">{format(value, value < 10 ? 1 : 0)}</span></>;
}

function Meter({ label, value, goal, unit, primary = false }: any) {
  const width = progress(value, goal);
  return (
    <article className={`stat-card reveal-card${primary ? " primary" : ""}`}>
      <span className="label">{label}</span>
      <strong><AnimatedValue value={value} /> <small>{unit}</small></strong>
      <div className="meter" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={goal} aria-valuenow={Math.round(value)}>
        <span className="meter-fill" style={{ width: `${width}%` }} />
      </div>
      <small>{format(Math.max(0, goal - value))} {unit} restantes</small>
    </article>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="empty-state">{children}</div>;
}

function WeightChart({ weeks }: any) {
  if (!weeks.length) return <div className="chart-empty">Registre seu primeiro peso para iniciar o gráfico.</div>;
  const values = weeks.map((week: any) => week.average);
  const min = Math.min(...values) - 0.5;
  const max = Math.max(...values) + 0.5;
  const range = Math.max(1, max - min);
  const points = weeks.map((week: any, index: number) => {
    const x = weeks.length === 1 ? 50 : 8 + (index / (weeks.length - 1)) * 84;
    const y = 84 - ((week.average - min) / range) * 68;
    return { x, y };
  });
  return (
    <svg className="weight-chart" viewBox="0 0 100 100" role="img" aria-label="Evolução da média semanal de peso">
      <line x1="8" y1="84" x2="92" y2="84" />
      <polyline className="chart-line" points={points.map(({ x, y }: any) => `${x},${y}`).join(" ")} />
      {points.map(({ x, y }: any, index: number) => <circle className="chart-point" key={index} cx={x} cy={y} r="2.4" />)}
    </svg>
  );
}

export function MassaDiariaApp() {
  const [engine, setEngine] = useState<any>(null);
  const [revision, setRevision] = useState(0);
  const [view, setView] = useState<View>("today");
  const [search, setSearch] = useState("");
  const [foodId, setFoodId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [mealQuantities, setMealQuantities] = useState<Record<string, string>>({});
  const [dialog, setDialog] = useState<Dialog>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [undo, setUndo] = useState<any>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setEngine(createAppState(createRepository(window.localStorage)));
  }, []);

  const snapshot = useMemo(() => engine?.getSnapshot(), [engine, revision]);
  const filteredFoods = useMemo(() => snapshot?.foods.filter((food: any) => normalize(food.name).includes(normalize(search))) ?? [], [snapshot, search]);
  const selectedFood = filteredFoods.find((food: any) => food.id === foodId) ?? filteredFoods[0];

  useEffect(() => {
    if (!selectedFood) return;
    if (foodId !== selectedFood.id) setFoodId(selectedFood.id);
    if (!quantity) setQuantity(String(selectedFood.baseAmount));
  }, [selectedFood, foodId, quantity]);

  useEffect(() => {
    if (!viewRef.current || !snapshot) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: reduce)", () => gsap.set(viewRef.current, { clearProps: "all" }));
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        const meterFills = gsap.utils.toArray(".meter-fill");
        const chartLines = gsap.utils.toArray(".chart-line");
        const chartPoints = gsap.utils.toArray(".chart-point");
        gsap.fromTo(".view-stage", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out" });
        gsap.fromTo(".reveal-card", { y: 14 }, { y: 0, duration: 0.38, stagger: 0.055, ease: "power2.out", delay: 0.08 });
        if (meterFills.length) gsap.fromTo(meterFills, { scaleX: 0, transformOrigin: "left center" }, { scaleX: 1, duration: 0.75, ease: "power2.out", delay: 0.15 });
        if (chartLines.length) gsap.fromTo(chartLines, { strokeDasharray: 240, strokeDashoffset: 240 }, { strokeDashoffset: 0, duration: 1, ease: "power2.out" });
        if (chartPoints.length) gsap.fromTo(chartPoints, { scale: 0, transformOrigin: "center" }, { scale: 1, duration: 0.25, stagger: 0.09, delay: 0.55 });
        if (dialog) gsap.fromTo(".modal-card", { autoAlpha: 0, y: 20, scale: 0.97 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.28, ease: "power3.out" });
      }, viewRef);
      return () => context.revert();
    });
    return () => mm.revert();
  }, [view, dialog, snapshot?.selectedDate]);

  useEffect(() => {
    if (!viewRef.current || !revision) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        const entries = gsap.utils.toArray(".entry");
        const toast = gsap.utils.toArray(".toast");
        if (entries.length) gsap.fromTo(entries, { x: 8 }, { x: 0, duration: 0.25, stagger: 0.03, clearProps: "transform" });
        if (toast.length) gsap.fromTo(toast, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.25, clearProps: "transform,opacity" });
      }, viewRef);
      return () => context.revert();
    });
    return () => mm.revert();
  }, [revision]);

  const refresh = (notice = "") => {
    setRevision((value) => value + 1);
    setMessage(notice);
    setError("");
  };

  const navigate = (next: View) => {
    setView(next);
    setError("");
    window.history.replaceState(null, "", `#${next === "today" ? "hoje" : next === "history" ? "historico" : "perfil"}`);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const submitFood = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = selectedFood?.mealParts
      ? engine.addMeal(snapshot.selectedDate, selectedFood.mealParts.map((part: any) => ({ foodId: part.foodId, quantity: mealQuantities[part.foodId] ?? String(part.quantity) })))
      : engine.addEntry(snapshot.selectedDate, selectedFood?.id, quantity);
    if (!result.ok) return setError(result.error);
    setSearch("");
    setQuantity("");
    setMealQuantities({});
    refresh(`${selectedFood.name} adicionado ao diário.`);
  };

  const removeEntry = (entryId: string) => {
    const result = engine.removeEntry(snapshot.selectedDate, entryId);
    if (!result.ok) return setError(result.error);
    setUndo({ entry: result.entry, date: snapshot.selectedDate });
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setUndo(null), 5000);
    refresh("Alimento excluído.");
  };

  const restoreEntry = () => {
    if (!undo) return;
    engine.restoreEntry(undo.date, undo.entry);
    setUndo(null);
    refresh("Registro restaurado.");
  };

  const selectFoodForReview = (food: any, amount = food.baseAmount) => {
    setSearch(food.name);
    setFoodId(food.id);
    setQuantity(String(amount));
    setError("");
    window.requestAnimationFrame(() => {
      const input = document.getElementById("food-quantity");
      input?.focus({ preventScroll: true });
      input?.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    });
  };

  if (!snapshot) return <main className="loading-shell" aria-busy="true"><div className="loading-mark">M</div><p>Preparando seu diário…</p></main>;

  const daily = engine.getDailySummary(snapshot.selectedDate);
  const history = engine.getHistorySnapshot(snapshot.selectedDate);
  const profile = snapshot.profile;
  const weightProgress = progress(profile.currentWeight - profile.startWeight, profile.targetWeight - profile.startWeight);

  const rateMessage = () => {
    if (history.rate.status === "insufficient") return "Registre o peso em pelo menos duas semanas para comparar seu ritmo.";
    const rate = format(history.rate.rate, 2);
    if (history.rate.status === "below") return `Média de ${rate} kg/semana. O ritmo está abaixo da referência.`;
    if (history.rate.status === "above") return `Média de ${rate} kg/semana. O ritmo está acima da referência.`;
    return `Média de ${rate} kg/semana. Seu ritmo está dentro da faixa planejada.`;
  };

  return (
    <div ref={viewRef}>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <header className="topbar">
        <button className="brand" type="button" onClick={() => navigate("today")} aria-label="Massa Diária, início"><span className="brand-mark">M</span><span>Massa <strong>Diária</strong></span></button>
        <div className="topbar-status"><span className="pulse" /> Meta ativa · {format(profile.calorieGoal)} kcal</div>
      </header>

      <main id="conteudo" className="view-stage">
        {view === "today" && (
          <div className="app-shell">
            <section className="hero">
              <div><p className="eyebrow">Seu plano de evolução</p><h1>Ganhe massa,<br />um dia de cada vez.</h1><p>Registre o que comeu e acompanhe o combustível que leva você até {format(profile.targetWeight, 1)} kg.</p></div>
              <div className="goal-pill reveal-card"><span>Progresso de peso</span><strong>{format(profile.currentWeight, 1)} → {format(profile.targetWeight, 1)} kg</strong><div className="progress-track"><span className="meter-fill" style={{ width: `${weightProgress}%` }} /></div><small>{format(Math.max(0, profile.targetWeight - profile.currentWeight), 1)} kg para a meta</small></div>
            </section>
            <section className="stats-grid" aria-label="Resumo nutricional de hoje">
              <Meter label="Energia" value={daily.nutrition.calories} goal={profile.calorieGoal} unit="kcal" primary />
              <Meter label="Proteína" value={daily.nutrition.protein} goal={profile.proteinGoal} unit="g" />
              <Meter label="Carboidratos" value={daily.nutrition.carbs} goal={profile.carbsGoal} unit="g" />
              <Meter label="Gorduras" value={daily.nutrition.fat} goal={profile.fatGoal} unit="g" />
            </section>
            <SuggestionPanel foods={snapshot.foods} current={daily.nutrition} profile={profile} preferences={snapshot.suggestionPreferences} onSelect={selectFoodForReview} />
            <RecipeOptions foods={snapshot.foods} onSelect={selectFoodForReview} />
            <section className="content-grid">
              <article className="panel reveal-card">
                <div className="panel-header"><h2>Adicionar alimento</h2><p>Busque no catálogo ou consulte o código de barras.</p></div>
                <BarcodeFood onManual={() => { setError(""); setDialog("food"); }} onSave={food => {
                  const result = engine.addCustomFood(food);
                  if (!result.ok) return result.error;
                  setSearch(result.food.name);
                  setFoodId(result.food.id);
                  setQuantity(String(result.food.baseAmount));
                  refresh("Alimento salvo. Informe a quantidade consumida e adicione ao diário.");
                  return null;
                }} />
                <form className="food-form" onSubmit={submitFood}>
                  <label className="field">Buscar alimento<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Ex.: banana, leite, aveia" /></label>
                  <label className="field">Alimento<select value={selectedFood?.id ?? ""} onChange={(event) => { const food = filteredFoods.find((item: any) => item.id === event.target.value); setFoodId(event.target.value); setQuantity(String(food?.baseAmount ?? "")); }} disabled={!filteredFoods.length}>{filteredFoods.map((food: any) => <option key={food.id} value={food.id}>{food.name} — {food.mealParts ? "gramas por ingrediente" : `${food.baseAmount} ${food.unit}`}</option>)}</select><small>{filteredFoods.length ? (selectedFood?.description ?? "Valores médios; confira o rótulo da sua marca.") : "Nenhum alimento encontrado."}</small></label>
                  {selectedFood && <div className="food-provenance"><span>Origem: {foodSourceLabel(selectedFood)}</span>{selectedFood.brand && <span>Marca: {selectedFood.brand}</span>}<span>{selectedFood.allergens?.length ? `Contém: ${selectedFood.allergens.map(allergenLabel).join(", ")}` : "Alergênicos não informados"}</span></div>}
                  {selectedFood?.mealParts ? <div className="compact-form">
                    {selectedFood.mealParts.map((part: any) => {
                      const ingredient = snapshot.foods.find((food: any) => food.id === part.foodId);
                      return <label className="field" key={part.foodId}>{ingredient.name} (g)<input inputMode="decimal" required value={mealQuantities[part.foodId] ?? String(part.quantity)} onChange={event => setMealQuantities({ ...mealQuantities, [part.foodId]: event.target.value })} /></label>;
                    })}
                    <button className="btn btn-primary">+ Adicionar refeição</button>
                  </div> : <div className="form-row"><label className="field">Quantidade<span className="quantity-wrap"><input id="food-quantity" inputMode="decimal" value={quantity} onChange={(event) => setQuantity(event.target.value)} /><span className="quantity-unit">{selectedFood?.unit}</span></span></label><button className="btn btn-primary" disabled={!selectedFood}>+ Adicionar</button></div>}
                  <p className="error" role="alert">{error}</p>
                </form>
              </article>
              <article className="panel reveal-card">
                <div className="panel-header"><h2>Diário de hoje</h2><p>{daily.entries.length} {daily.entries.length === 1 ? "item registrado" : "itens registrados"}</p></div>
                {!daily.entries.length ? <Empty><strong>Nenhum alimento ainda.</strong><br />Busque ao lado e monte seu dia.</Empty> : <ul className="entries">{daily.entries.map((entry: any) => <li className="entry" key={entry.id}><div><h3>{entry.food.name}</h3><p className="entry-meta">{format(entry.quantity, 1)} {entry.food.unit} · P {format(entry.nutrition.protein, 1)} g · C {format(entry.nutrition.carbs, 1)} g · G {format(entry.nutrition.fat, 1)} g</p></div><div><div className="entry-kcal">{format(entry.nutrition.calories)} kcal</div><div className="entry-actions"><label className="sr-only" htmlFor={`edit-${entry.id}`}>Nova quantidade</label><input id={`edit-${entry.id}`} type="number" min="0.1" step="0.1" value={editing[entry.id] ?? entry.quantity} onChange={(event) => setEditing({ ...editing, [entry.id]: event.target.value })} /><button className="btn btn-secondary" type="button" onClick={() => { const result = engine.updateEntry(snapshot.selectedDate, entry.id, editing[entry.id] ?? entry.quantity); result.ok ? refresh("Quantidade atualizada.") : setError(result.error); }}>Salvar</button><button className="btn btn-danger" type="button" onClick={() => removeEntry(entry.id)}>Excluir</button></div></div></li>)}</ul>}
              </article>
            </section>
          </div>
        )}

        {view === "history" && (
          <div className="app-shell">
            <section className="section-heading"><p className="eyebrow">Consistência acima de perfeição</p><h1>Histórico</h1><p>Acompanhe a alimentação e a tendência do seu peso ao longo das semanas.</p></section>
            <section className="history-grid">
              <article className="panel reveal-card"><div className="panel-header"><h2>Resumo do dia</h2><p>Selecione uma data para consultar.</p></div><div className="panel-body"><label className="field">Data<input type="date" value={snapshot.selectedDate} onChange={(event) => { engine.selectDate(event.target.value); refresh(); }} /></label><div className="daily-total"><strong>{format(history.daily.nutrition.calories)} kcal</strong><span>P {format(history.daily.nutrition.protein, 1)} g · C {format(history.daily.nutrition.carbs, 1)} g · G {format(history.daily.nutrition.fat, 1)} g</span></div></div>{!history.daily.entries.length ? <Empty>Nenhum alimento registrado nesta data.</Empty> : <ul className="history-foods">{history.daily.entries.map((entry: any) => <li key={entry.id}><span>{entry.food.name} <small>{format(entry.quantity, 1)} {entry.food.unit}</small></span><strong>{format(entry.nutrition.calories)} kcal</strong></li>)}</ul>}</article>
              <article className="panel reveal-card"><div className="panel-header"><h2>Registrar peso</h2><p>A pesagem mais recente atualiza seu progresso.</p></div><form className="panel-body compact-form" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); const result = engine.recordWeight(data.get("date"), data.get("value")); result.ok ? refresh("Peso registrado.") : setError(result.error); }}><label className="field">Data<input name="date" type="date" defaultValue={snapshot.selectedDate} /></label><label className="field">Peso em kg<input name="value" inputMode="decimal" placeholder="66,8" /></label><button className="btn btn-primary">Salvar peso</button><p className="error">{error}</p></form></article>
              <article className="panel chart-panel reveal-card"><div className="panel-header"><h2>Média semanal</h2><p>{rateMessage()}</p></div><div className="panel-body"><WeightChart weeks={history.weeklyAverages} /><details><summary>Ver dados do gráfico</summary><div className="table-wrap"><table><thead><tr><th>Semana</th><th>Média</th><th>Pesagens</th></tr></thead><tbody>{history.weeklyAverages.length ? history.weeklyAverages.map((week: any) => <tr key={week.weekStart}><td>{new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${week.weekStart}T12:00:00Z`))}</td><td>{format(week.average, 2)} kg</td><td>{week.count}</td></tr>) : <tr><td colSpan={3}>Sem dados</td></tr>}</tbody></table></div></details></div></article>
            </section>
          </div>
        )}

        {view === "profile" && (
          <div className="app-shell">
            <section className="section-heading"><p className="eyebrow">Seu plano, suas escolhas</p><h1>Perfil e metas</h1><p>Ajuste as referências conforme sua evolução e orientação profissional.</p></section>
            <section className="profile-grid">
              <article className="panel reveal-card"><div className="panel-header"><h2>Metas pessoais</h2><p>Valores iniciais para o ganho de aproximadamente 2 kg por mês.</p></div><form className="panel-body profile-form" onSubmit={(event) => { event.preventDefault(); const result = engine.updateProfile(Object.fromEntries(new FormData(event.currentTarget))); result.ok ? refresh("Metas atualizadas.") : setError(result.error); }}><div className="form-row"><label className="field">Peso atual (kg)<input name="currentWeight" inputMode="decimal" defaultValue={profile.currentWeight} /></label><label className="field">Meta de peso (kg)<input name="targetWeight" inputMode="decimal" defaultValue={profile.targetWeight} /></label></div><label className="field">Meta de calorias<input name="calorieGoal" type="number" min="500" max="10000" defaultValue={profile.calorieGoal} /></label><div className="macro-fields"><label className="field">Proteínas (g)<input name="proteinGoal" type="number" defaultValue={profile.proteinGoal} /></label><label className="field">Carboidratos (g)<input name="carbsGoal" type="number" defaultValue={profile.carbsGoal} /></label><label className="field">Gorduras (g)<input name="fatGoal" type="number" defaultValue={profile.fatGoal} /></label></div><p className="error">{error}</p><button className="btn btn-primary">Salvar metas</button></form></article>
              <article className="panel reveal-card"><div className="panel-header split-header"><div><h2>Meus alimentos</h2><p>Cadastre os valores do rótulo da sua marca.</p></div><button className="btn btn-secondary" onClick={() => setDialog("food")}>+ Novo</button></div>{snapshot.customFoods.length ? <ul className="custom-foods">{snapshot.customFoods.map((food: any) => <li key={food.id}><div><strong>{food.name}</strong><small>{food.baseAmount} {food.unit} · {format(food.calories)} kcal</small></div><button className="btn btn-danger" onClick={() => { const result = engine.removeCustomFood(food.id); result.ok ? refresh("Alimento removido.") : setError(result.error); }}>Remover</button></li>)}</ul> : <Empty>Você ainda não cadastrou alimentos próprios.</Empty>}</article>
              <article className="panel reveal-card"><div className="panel-header"><h2>Preferências das sugestões</h2><p>Escolha quais opções podem aparecer para completar suas metas.</p></div><form className="panel-body preference-form" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); const result = engine.updateSuggestionPreferences({ excludedAllergens: data.getAll("excludedAllergens"), includeCustomFoods: data.has("includeCustomFoods"), includeEstimates: data.has("includeEstimates"), candidateTypes: data.get("candidateTypes") }); result.ok ? refresh("Preferências atualizadas.") : setError(result.error); }}>
                <fieldset><legend>Não sugerir itens com</legend><div className="check-grid">{ALLERGEN_OPTIONS.map(([id, label]) => <label className="check-control" key={id}><input type="checkbox" name="excludedAllergens" value={id} defaultChecked={snapshot.suggestionPreferences.excludedAllergens.includes(id)} />{label}</label>)}</div></fieldset>
                <label className="field">Tipos de opção<select name="candidateTypes" defaultValue={snapshot.suggestionPreferences.candidateTypes}><option value="all">Alimentos e receitas</option><option value="foods">Somente alimentos</option><option value="recipes">Somente receitas</option></select></label>
                <label className="check-control"><input type="checkbox" name="includeCustomFoods" defaultChecked={snapshot.suggestionPreferences.includeCustomFoods} />Incluir meus alimentos</label>
                <label className="check-control"><input type="checkbox" name="includeEstimates" defaultChecked={snapshot.suggestionPreferences.includeEstimates} />Incluir valores estimados</label>
                <p className="preference-note">Alergênicos são informativos e podem estar incompletos. Confira sempre o rótulo.</p><button className="btn btn-primary">Salvar preferências</button>
              </form></article>
              <aside className="panel privacy-card reveal-card"><p className="eyebrow">Privacidade local</p><h2>Seus dados ficam neste navegador</h2><p>Não há conta nem sincronização. Limpar os dados do navegador também pode apagar seu histórico.</p><p>As metas e informações nutricionais são estimativas e não substituem médico ou nutricionista.</p><button className="btn btn-danger" onClick={() => setDialog("clear")}>Apagar todo o histórico</button></aside>
            </section>
          </div>
        )}
      </main>

      <nav className="bottom-nav" aria-label="Navegação principal">{([["today", "Hoje", "◉"], ["history", "Histórico", "↗"], ["profile", "Perfil", "○"]] as const).map(([id, label, icon]) => <button key={id} className="nav-button" onClick={() => navigate(id)} aria-current={view === id ? "page" : undefined}><span aria-hidden="true">{icon}</span>{label}</button>)}</nav>

      {(message || undo) && <div className="toast" role="status"><span>{message}</span>{undo && <button onClick={restoreEntry}>Desfazer</button>}</div>}

      {dialog && <div className="modal-layer" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setDialog(null); }}><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">{dialog === "food" ? <form className="dialog-card" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); const input = { ...Object.fromEntries(data), allergens: data.getAll("allergens") }; const result = engine.addCustomFood(input); if (!result.ok) return setError(result.error); const warning = nutritionConsistencyWarning(result.food); setDialog(null); refresh(warning ? `Alimento cadastrado. ${warning}` : "Alimento cadastrado."); }}><div className="dialog-heading"><div><p className="eyebrow">Novo alimento</p><h2 id="modal-title">Valores do rótulo</h2></div><button className="icon-button" type="button" onClick={() => setDialog(null)} aria-label="Fechar">×</button></div><label className="field">Nome<input name="name" required autoFocus /></label><label className="field">Marca (opcional)<input name="brand" /></label><div className="form-row"><label className="field">Porção<input name="baseAmount" inputMode="decimal" defaultValue="100" /></label><label className="field">Unidade<select name="unit"><option value="g">gramas</option><option value="ml">mililitros</option><option value="un">unidade</option></select></label></div><div className="macro-fields"><label className="field">Calorias<input name="calories" inputMode="decimal" required /></label><label className="field">Proteínas<input name="protein" inputMode="decimal" required /></label><label className="field">Carboidratos<input name="carbs" inputMode="decimal" required /></label><label className="field">Gorduras<input name="fat" inputMode="decimal" required /></label></div><fieldset><legend>Alergênicos informados no rótulo</legend><div className="check-grid">{ALLERGEN_OPTIONS.map(([id, label]) => <label className="check-control" key={id}><input type="checkbox" name="allergens" value={id} />{label}</label>)}</div></fieldset><p className="form-note">Origem: rótulo informado por você. Confira os valores antes de salvar.</p><p className="error">{error}</p><button className="btn btn-primary">Cadastrar alimento</button></form> : <div className="dialog-card"><p className="eyebrow">Ação permanente</p><h2 id="modal-title">Apagar todo o histórico?</h2><p>Todos os alimentos personalizados, registros, pesos e metas deste navegador serão removidos.</p><div className="dialog-actions"><button className="btn btn-secondary" onClick={() => setDialog(null)}>Cancelar</button><button className="btn btn-danger" onClick={() => { engine.clearAllData(true); setDialog(null); refresh("Histórico apagado."); }}>Sim, apagar tudo</button></div></div>}</section></div>}
    </div>
  );
}
