import type { Food } from "../dist/js/data/foods.js";

const format = (value: number, digits = 0) => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: digits }).format(value);

export function SupplementOptions({ foods, onSelect }: { foods: Food[]; onSelect: (food: Food) => void }) {
  const supplements = foods.filter(food => food.supplement);

  return <details className="panel recipe-drawer supplement-drawer reveal-card">
    <summary>
      <strong>Suplementos</strong>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5" /></svg>
    </summary>
    <div className="supplement-content">
      <div className="panel-header"><h2>Porções de referência</h2><p>Selecione uma opção, ajuste a quantidade no formulário e confira o rótulo da sua marca.</p></div>
      <div className="supplement-list">{supplements.map(food => <article className="supplement-row" key={food.id}>
        <div><h3>{food.name}</h3><p>{format(food.baseAmount, 1)} {food.unit} · {format(food.calories)} kcal · P {format(food.protein, 1)} g · C {format(food.carbs, 1)} g · G {format(food.fat, 1)} g</p><small>{food.description}</small></div>
        <button className="btn btn-secondary" type="button" onClick={() => onSelect(food)}>Selecionar</button>
      </article>)}</div>
      <p className="supplement-note">Valores estimados. Suplementos podem ter contraindicações e não substituem alimentação ou orientação profissional.</p>
    </div>
  </details>;
}
