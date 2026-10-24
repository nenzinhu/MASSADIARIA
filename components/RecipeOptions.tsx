"use client";

import { useState } from "react";
import type { Food } from "../dist/js/data/foods.js";

const format = (value: number, digits = 0) => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: digits }).format(value);

export function RecipeOptions({ foods, onSelect }: { foods: Food[]; onSelect: (food: Food) => void }) {
  const [target, setTarget] = useState(0);
  const recipes = foods.filter(food => food.recipe);
  const visible = recipes.filter(food => !target || food.targetCalories === target);
  const denseFoods = foods.filter(food => food.energyDense).sort((a, b) => b.calories / b.baseAmount - a.calories / a.baseAmount);

  return <>
    <section className="panel shake-panel reveal-card" aria-labelledby="shake-title">
      <div className="panel-header">
        <h2 id="shake-title">Bombas hipercalóricas</h2>
        <p>{recipes.length} receitas caseiras para variar, incluindo opções próximas de 600, 800, 1.000 e 1.200 kcal. Os valores são estimados pela soma dos ingredientes.</p>
      </div>
      <div className="recipe-filters" role="group" aria-label="Filtrar receitas por calorias">
        {[0, 600, 800, 1000, 1200].map(value => <button key={value} type="button" className={`btn ${target === value ? "btn-primary" : "btn-secondary"}`} aria-pressed={target === value} onClick={() => setTarget(value)}>{value ? `≈ ${format(value)} kcal` : "Todas"}</button>)}
      </div>
      <p className="recipe-count" role="status">{visible.length} receitas{target ? ` na faixa de ${format(target)} kcal` : " disponíveis"} · 1 unidade = receita inteira; 0,5 = meia receita.</p>
      <div className="shake-grid">{visible.map(food => <article className="shake-card" key={food.id}>
        {food.targetCalories && <span className="recipe-badge">Faixa de {format(food.targetCalories)} kcal</span>}
        <h3>{food.name.replace("Hipercalórico — ", "")}</h3>
        <strong>≈ {format(food.calories)} kcal <small>por receita inteira</small></strong>
        <p>P {format(food.protein, 1)} g · C {format(food.carbs, 1)} g · G {format(food.fat, 1)} g</p>
        <details><summary>Ingredientes e preparo</summary><ul>{food.recipe!.map(ingredient => <li key={ingredient.foodId}>{format(ingredient.quantity, 1)} {ingredient.unit} de {ingredient.name.toLowerCase()}</li>)}</ul><p>{food.preparation}</p></details>
        <button className="btn btn-secondary" type="button" onClick={() => onSelect(food)}>Selecionar receita</button>
      </article>)}</div>
      <p className="shake-note">Você pode dividir a receita em porções. Confira os rótulos e os ingredientes, especialmente leite, amendoim, castanhas, gergelim e cereais. As estimativas variam com a marca e o preparo.</p>
    </section>
    <details className="panel calorie-foods">
      <summary>Alimentos mais calóricos · {denseFoods.length} opções</summary>
      <p className="recipe-count">Compare a energia por 100 g (ou 100 ml, para líquidos). Selecione um alimento e ajuste a quantidade que consumiu.</p>
      <div className="dense-food-grid">{denseFoods.map(food => <article className="dense-food-card" key={food.id}>
        <h3>{food.name}</h3>
        <strong>≈ {format(food.calories * 100 / food.baseAmount)} kcal / 100 {food.unit}</strong>
        <p>Porção de {format(food.baseAmount)} {food.unit}: {format(food.calories)} kcal</p>
        <button type="button" className="btn btn-secondary" onClick={() => onSelect(food)}>Selecionar {food.name.toLowerCase()}</button>
      </article>)}</div>
    </details>
  </>;
}
