function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function number(value, digits = 0) {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: digits }).format(value);
}

function percent(value, goal) {
  if (!goal) return 0;
  return Math.min(100, Math.max(0, (value / goal) * 100));
}

function statCard(label, value, unit, goal, primary = false) {
  const used = percent(value, goal);
  return `<article class="stat-card${primary ? " primary" : ""}">
    <span class="label">${escapeHtml(label)}</span>
    <strong>${number(value, value < 10 ? 1 : 0)} <small>${unit}</small></strong>
    <div class="meter" role="progressbar" aria-label="${escapeHtml(label)}" aria-valuemin="0" aria-valuemax="${goal}" aria-valuenow="${Math.round(value)}"><span style="width:${used}%"></span></div>
    <small>${number(Math.max(0, goal - value), 0)} ${unit} restantes</small>
  </article>`;
}

function nav(activeView) {
  return `<nav class="bottom-nav" aria-label="Navegação principal">
    ${[["today", "Hoje"], ["history", "Histórico"], ["profile", "Perfil"]].map(([id, label]) => `
      <button class="nav-button" type="button" data-nav="${id}" ${activeView === id ? 'aria-current="page"' : ""}>${label}</button>`).join("")}
  </nav>`;
}

function entryList(entries) {
  if (!entries.length) return `<div class="empty-state"><strong>Nenhum alimento ainda.</strong><br />Busque ao lado e monte seu dia.</div>`;
  return `<ul class="entries">${entries.map((entry) => `<li class="entry">
    <div>
      <h3>${escapeHtml(entry.food.name)}</h3>
      <p class="entry-meta">${number(entry.quantity, 1)} ${entry.food.unit} · P ${number(entry.nutrition.protein, 1)} g · C ${number(entry.nutrition.carbs, 1)} g · G ${number(entry.nutrition.fat, 1)} g</p>
    </div>
    <div>
      <div class="entry-kcal">${number(entry.nutrition.calories)} kcal</div>
      <div class="entry-actions">
        <label class="sr-only" for="edit-${entry.id}">Nova quantidade de ${escapeHtml(entry.food.name)}</label>
        <input id="edit-${entry.id}" data-entry-quantity="${entry.id}" type="number" min="0.1" step="0.1" value="${entry.quantity}" />
        <button class="btn btn-secondary" type="button" data-edit-entry="${entry.id}">Salvar</button>
        <button class="btn btn-danger" type="button" data-remove-entry="${entry.id}">Excluir</button>
      </div>
    </div>
  </li>`).join("")}</ul>`;
}

function todayView(view) {
  const { profile, daily, foods, filteredFoods, search, formError } = view;
  const weightProgress = percent(profile.currentWeight - profile.startWeight, profile.targetWeight - profile.startWeight);
  const selectedFood = filteredFoods[0] ?? foods[0];
  return `<div class="app-shell">
    <section class="hero" aria-labelledby="today-title">
      <div><p class="eyebrow">Seu plano de evolução</p><h1 id="today-title">Ganhe massa,<br />um dia de cada vez.</h1><p>Registre o que comeu e acompanhe o combustível que leva você até ${number(profile.targetWeight, 1)} kg.</p></div>
      <div class="goal-pill"><span>Progresso de peso</span><strong>${number(profile.currentWeight, 1)} → ${number(profile.targetWeight, 1)} kg</strong><div class="progress-track" role="progressbar" aria-label="Progresso da meta de peso" aria-valuemin="${profile.startWeight}" aria-valuemax="${profile.targetWeight}" aria-valuenow="${profile.currentWeight}"><span style="width:${weightProgress}%"></span></div><small>${number(Math.max(0, profile.targetWeight - profile.currentWeight), 1)} kg para a meta</small></div>
    </section>
    <section class="stats-grid" aria-label="Resumo nutricional de hoje">
      ${statCard("Energia", daily.nutrition.calories, "kcal", profile.calorieGoal, true)}
      ${statCard("Proteína", daily.nutrition.protein, "g", profile.proteinGoal)}
      ${statCard("Carboidratos", daily.nutrition.carbs, "g", profile.carbsGoal)}
      ${statCard("Gorduras", daily.nutrition.fat, "g", profile.fatGoal)}
    </section>
    <section class="content-grid">
      <article class="panel">
        <div class="panel-header"><h2>Adicionar alimento</h2><p>Escolha manualmente e ajuste a quantidade.</p></div>
        <form class="food-form" id="add-food-form" novalidate>
          <div class="field"><label for="food-search">Buscar alimento</label><input id="food-search" name="search" type="search" value="${escapeHtml(search)}" placeholder="Ex.: banana, leite, aveia" autocomplete="off" /></div>
          <div class="field"><label for="food-select">Alimento</label><select id="food-select" name="foodId" ${filteredFoods.length ? "" : "disabled"}>${filteredFoods.map((food) => `<option value="${food.id}">${escapeHtml(food.name)} — ${food.baseAmount} ${food.unit}</option>`).join("")}</select>${filteredFoods.length ? `<small>Valores médios; confira o rótulo da sua marca.</small>` : `<small>Nenhum alimento encontrado.</small>`}</div>
          <div class="form-row"><div class="field"><label for="food-quantity">Quantidade</label><div class="quantity-wrap"><input id="food-quantity" name="quantity" type="text" inputmode="decimal" value="${selectedFood?.baseAmount ?? ""}" /><span class="quantity-unit">${selectedFood?.unit ?? ""}</span></div></div><button class="btn btn-primary" type="submit" ${filteredFoods.length ? "" : "disabled"}>+ Adicionar</button></div>
          <p class="error" id="form-error">${escapeHtml(formError)}</p>
        </form>
      </article>
      <article class="panel">
        <div class="panel-header"><h2>Diário de hoje</h2><p>${daily.entries.length} ${daily.entries.length === 1 ? "item registrado" : "itens registrados"}</p></div>
        ${entryList(daily.entries)}
      </article>
    </section>
  </div>`;
}

function rateMessage(rate) {
  if (rate.status === "insufficient") return "Registre o peso em pelo menos duas semanas para comparar seu ritmo.";
  const value = number(rate.rate, 2);
  if (rate.status === "below") return `Média de ${value} kg/semana. O ritmo está abaixo da referência; observe mais uma semana e considere revisar as calorias.`;
  if (rate.status === "above") return `Média de ${value} kg/semana. O ritmo está acima da referência; considere revisar as calorias para limitar o ganho de gordura.`;
  return `Média de ${value} kg/semana. Seu ritmo está dentro da faixa planejada.`;
}

function weightChart(weeks) {
  if (!weeks.length) return `<div class="chart-empty">Registre seu primeiro peso para iniciar o gráfico.</div>`;
  const values = weeks.map((week) => week.average);
  const min = Math.min(...values) - 0.5;
  const max = Math.max(...values) + 0.5;
  const range = Math.max(1, max - min);
  const points = weeks.map((week, index) => {
    const x = weeks.length === 1 ? 50 : 8 + (index / (weeks.length - 1)) * 84;
    const y = 84 - ((week.average - min) / range) * 68;
    return `${x},${y}`;
  }).join(" ");
  return `<svg class="weight-chart" viewBox="0 0 100 100" role="img" aria-label="Evolução da média semanal de peso"><line x1="8" y1="84" x2="92" y2="84"></line><polyline points="${points}"></polyline>${points.split(" ").map((point) => { const [x, y] = point.split(","); return `<circle cx="${x}" cy="${y}" r="2.4"></circle>`; }).join("")}</svg>`;
}

function historyEntries(entries) {
  if (!entries.length) return `<div class="empty-state">Nenhum alimento registrado nesta data.</div>`;
  return `<ul class="history-foods">${entries.map((entry) => `<li><span>${escapeHtml(entry.food.name)} <small>${number(entry.quantity, 1)} ${entry.food.unit}</small></span><strong>${number(entry.nutrition.calories)} kcal</strong></li>`).join("")}</ul>`;
}

function historyView(view) {
  const { history, weightError } = view;
  const tableRows = history.weeklyAverages.map((week) => `<tr><td>${new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${week.weekStart}T12:00:00Z`))}</td><td>${number(week.average, 2)} kg</td><td>${week.count}</td></tr>`).join("");
  return `<div class="app-shell">
    <section class="section-heading"><p class="eyebrow">Consistência acima de perfeição</p><h1>Histórico</h1><p>Acompanhe a alimentação e a tendência do seu peso ao longo das semanas.</p></section>
    <section class="history-grid">
      <article class="panel history-day">
        <div class="panel-header"><h2>Resumo do dia</h2><p>Selecione uma data para consultar.</p></div>
        <div class="panel-body">
          <div class="field"><label for="history-date">Data</label><input id="history-date" type="date" value="${history.selectedDate}" /></div>
          <div class="daily-total"><strong>${number(history.daily.nutrition.calories)} kcal</strong><span>P ${number(history.daily.nutrition.protein, 1)} g · C ${number(history.daily.nutrition.carbs, 1)} g · G ${number(history.daily.nutrition.fat, 1)} g</span></div>
        </div>
        ${historyEntries(history.daily.entries)}
      </article>
      <article class="panel">
        <div class="panel-header"><h2>Registrar peso</h2><p>A pesagem mais recente atualiza seu progresso.</p></div>
        <form class="panel-body compact-form" id="weight-form" novalidate><div class="field"><label for="weight-date">Data</label><input id="weight-date" name="date" type="date" value="${history.selectedDate}" /></div><div class="field"><label for="weight-value">Peso em kg</label><input id="weight-value" name="value" type="text" inputmode="decimal" placeholder="66,8" /></div><button class="btn btn-primary" type="submit">Salvar peso</button><p class="error">${escapeHtml(weightError)}</p></form>
      </article>
      <article class="panel chart-panel">
        <div class="panel-header"><h2>Média semanal</h2><p>${escapeHtml(rateMessage(history.rate))}</p></div>
        <div class="panel-body">${weightChart(history.weeklyAverages)}<details><summary>Ver dados do gráfico</summary><div class="table-wrap"><table><thead><tr><th>Semana</th><th>Média</th><th>Pesagens</th></tr></thead><tbody>${tableRows || `<tr><td colspan="3">Sem dados</td></tr>`}</tbody></table></div></details></div>
      </article>
    </section>
  </div>`;
}

function profileView(view) {
  const { profile, customFoods, profileError, customFoodError, notice } = view;
  return `<div class="app-shell">
    <section class="section-heading"><p class="eyebrow">Seu plano, suas escolhas</p><h1>Perfil e metas</h1><p>Ajuste as referências conforme sua evolução e orientação profissional.</p></section>
    <div class="profile-grid">
      <article class="panel">
        <div class="panel-header"><h2>Metas pessoais</h2><p>Valores iniciais para o ganho de aproximadamente 2 kg por mês.</p></div>
        <form id="profile-form" class="panel-body profile-form" novalidate>
          <div class="form-row"><div class="field"><label for="current-weight">Peso atual (kg)</label><input id="current-weight" name="currentWeight" type="text" inputmode="decimal" value="${profile.currentWeight}" /></div><div class="field"><label for="target-weight">Meta de peso (kg)</label><input id="target-weight" name="targetWeight" type="text" inputmode="decimal" value="${profile.targetWeight}" /></div></div>
          <div class="field"><label for="calorie-goal">Meta de calorias</label><input id="calorie-goal" name="calorieGoal" type="number" min="500" max="10000" value="${profile.calorieGoal}" /></div>
          <div class="macro-fields"><div class="field"><label for="protein-goal">Proteínas (g)</label><input id="protein-goal" name="proteinGoal" type="number" min="0" max="1000" value="${profile.proteinGoal}" /></div><div class="field"><label for="carbs-goal">Carboidratos (g)</label><input id="carbs-goal" name="carbsGoal" type="number" min="0" max="1000" value="${profile.carbsGoal}" /></div><div class="field"><label for="fat-goal">Gorduras (g)</label><input id="fat-goal" name="fatGoal" type="number" min="0" max="1000" value="${profile.fatGoal}" /></div></div>
          <p class="error">${escapeHtml(profileError)}</p><button class="btn btn-primary" type="submit">Salvar metas</button>
        </form>
      </article>
      <article class="panel">
        <div class="panel-header split-header"><div><h2>Meus alimentos</h2><p>Cadastre os valores do rótulo da sua marca.</p></div><button class="btn btn-secondary" type="button" id="open-custom-food">+ Novo</button></div>
        ${customFoods.length ? `<ul class="custom-foods">${customFoods.map((food) => `<li><div><strong>${escapeHtml(food.name)}</strong><small>${food.baseAmount} ${food.unit} · ${number(food.calories)} kcal</small></div><button class="btn btn-danger" type="button" data-remove-custom="${food.id}">Remover</button></li>`).join("")}</ul>` : `<div class="empty-state">Você ainda não cadastrou alimentos próprios.</div>`}
      </article>
      <aside class="panel privacy-card"><p class="eyebrow">Privacidade local</p><h2>Seus dados ficam neste navegador</h2><p>Não há conta nem sincronização. Limpar os dados do navegador também pode apagar seu histórico.</p><p>As metas e informações nutricionais são estimativas e não substituem médico ou nutricionista.</p><button class="btn btn-danger" type="button" id="open-clear-data">Apagar todo o histórico</button></aside>
    </div>
    <p class="sr-only" aria-live="polite">${escapeHtml(notice)}</p>
    <dialog id="custom-food-dialog"><form id="custom-food-form" method="dialog" class="dialog-card"><div class="dialog-heading"><div><p class="eyebrow">Novo alimento</p><h2>Valores do rótulo</h2></div><button class="icon-button" type="button" data-close-dialog aria-label="Fechar">×</button></div><div class="field"><label for="custom-name">Nome</label><input id="custom-name" name="name" required /></div><div class="form-row"><div class="field"><label for="custom-amount">Porção</label><input id="custom-amount" name="baseAmount" inputmode="decimal" value="100" /></div><div class="field"><label for="custom-unit">Unidade</label><select id="custom-unit" name="unit"><option value="g">gramas</option><option value="ml">mililitros</option><option value="un">unidade</option></select></div></div><div class="macro-fields"><div class="field"><label for="custom-calories">Calorias</label><input id="custom-calories" name="calories" inputmode="decimal" /></div><div class="field"><label for="custom-protein">Proteínas</label><input id="custom-protein" name="protein" inputmode="decimal" /></div><div class="field"><label for="custom-carbs">Carboidratos</label><input id="custom-carbs" name="carbs" inputmode="decimal" /></div><div class="field"><label for="custom-fat">Gorduras</label><input id="custom-fat" name="fat" inputmode="decimal" /></div></div><p class="error">${escapeHtml(customFoodError)}</p><button class="btn btn-primary" type="submit">Cadastrar alimento</button></form></dialog>
    <dialog id="clear-data-dialog"><div class="dialog-card"><p class="eyebrow">Ação permanente</p><h2>Apagar todo o histórico?</h2><p>Todos os alimentos personalizados, registros, pesos e metas salvos neste navegador serão removidos.</p><div class="dialog-actions"><button class="btn btn-secondary" type="button" data-close-dialog>Cancelar</button><button class="btn btn-danger" type="button" id="confirm-clear-data">Sim, apagar tudo</button></div></div></dialog>
  </div>`;
}

export function renderApp(view, root) {
  const content = view.activeView === "today"
    ? todayView(view)
    : view.activeView === "history"
      ? historyView(view)
      : profileView(view);
  root.innerHTML = content + nav(view.activeView);
}
