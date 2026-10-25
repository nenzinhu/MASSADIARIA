import { allergenLabel, foodSourceLabel } from "../dist/js/domain/food-quality.js";
import { getDailySuggestions } from "../dist/js/domain/suggestions.js";

const number = (value: number, digits = 0) => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: digits }).format(value);

export function SuggestionPanel({ foods, current, profile, preferences, onSelect }: any) {
  const result = getDailySuggestions({ foods, current, profile, preferences });

  return <section className="suggestion-panel reveal-card" aria-labelledby="suggestion-title">
    <div className="suggestion-heading">
      <div><h2 id="suggestion-title">Complete seu dia</h2><p>{number(result.remainingCalories)} kcal e {number(result.remainingProtein, 1)} g de proteína restantes.</p></div>
      <span className="suggestion-count">Até 3 opções</span>
    </div>
    {result.status === "complete" && <p className="suggestion-state">Metas de calorias e proteína atingidas. Continue registrando para manter o resumo atualizado.</p>}
    {result.status === "empty" && <p className="suggestion-state">Nenhuma opção combina com seus filtros. Ajuste as preferências no Perfil ou escolha um alimento no catálogo.</p>}
    {result.status === "ready" && <div className="suggestion-list">{result.suggestions.map(({ food, quantity, nutrition, reason }: any) => <article className="suggestion-item" key={food.id}>
      <div className="suggestion-copy"><h3>{food.name}</h3><strong>{number(quantity, food.unit === "un" ? 2 : 0)} {food.unit} · {number(nutrition.calories)} kcal</strong><p>{reason}</p><small>Origem: {foodSourceLabel(food)}{food.allergens?.length ? ` · Contém: ${food.allergens.map(allergenLabel).join(", ")}` : " · Sem alergênicos informados"}</small></div>
      <button className="btn btn-secondary" type="button" onClick={() => onSelect(food, quantity)}>Selecionar e revisar</button>
    </article>)}</div>}
    <p className="suggestion-disclaimer">Sugestões estimadas. Confira rótulos e ajuste a porção antes de registrar.</p>
  </section>;
}
