/**
 * Valores médios por porção de referência. Podem variar conforme marca e preparo.
 * @typedef {{id:string,name:string,baseAmount:number,unit:"g"|"ml"|"un",calories:number,protein:number,carbs:number,fat:number,custom:boolean,brand?:string,source?:{type:"catalog"|"label"|"open_food_facts"|"estimate",label:string,url?:string},reviewedAt?:string,allergens?:string[],description?:string,energyDense?:boolean,supplement?:boolean,targetCalories?:number,mealParts?:Array<{foodId:string,quantity:number}>,recipe?:Array<{foodId:string,quantity:number,name:string,unit:string}>,preparation?:string}} Food
 */

/** @type {Food[]} */
export const INITIAL_FOODS = [
  // Estimativas genéricas por peso comestível; confira o rótulo da marca.
  {"id": "leite-integral", "name": "Leite integral", "baseAmount": 200, "unit": "ml", "calories": 122.0, "protein": 6.4, "carbs": 9.6, "fat": 6.6, "custom": false},
  {"id": "leite-po-integral", "name": "Leite em pó integral", "baseAmount": 30, "unit": "g", "calories": 148.8, "protein": 7.8, "carbs": 11.4, "fat": 8.1, "custom": false, "energyDense": true},
  {"id": "cacau-po", "name": "Cacau em pó sem açúcar", "baseAmount": 10, "unit": "g", "calories": 22.8, "protein": 1.96, "carbs": 5.79, "fat": 1.37, "custom": false},
  {"id": "abacate", "name": "Abacate", "baseAmount": 100, "unit": "g", "calories": 160.0, "protein": 2.0, "carbs": 8.5, "fat": 14.7, "custom": false},
  {"id": "nozes", "name": "Nozes", "baseAmount": 30, "unit": "g", "calories": 196.2, "protein": 4.56, "carbs": 4.11, "fat": 19.56, "custom": false, "energyDense": true},
  {"id": "castanha-caju", "name": "Castanha-de-caju torrada", "baseAmount": 30, "unit": "g", "calories": 172.2, "protein": 4.59, "carbs": 9.81, "fat": 13.92, "custom": false, "energyDense": true},
  {"id": "amendoas", "name": "Amêndoas", "baseAmount": 30, "unit": "g", "calories": 173.7, "protein": 6.36, "carbs": 6.48, "fat": 14.97, "custom": false, "energyDense": true},
  {"id": "coco-seco", "name": "Coco seco ralado sem açúcar", "baseAmount": 20, "unit": "g", "calories": 132.0, "protein": 1.38, "carbs": 4.74, "fat": 12.9, "custom": false, "energyDense": true},
  {"id": "uvas-passas", "name": "Uvas-passas", "baseAmount": 30, "unit": "g", "calories": 89.7, "protein": 0.93, "carbs": 23.76, "fat": 0.15, "custom": false, "energyDense": true},
  {"id": "tamaras", "name": "Tâmaras sem caroço", "baseAmount": 30, "unit": "g", "calories": 84.6, "protein": 0.75, "carbs": 22.5, "fat": 0.12, "custom": false, "energyDense": true},
  {"id": "mel", "name": "Mel", "baseAmount": 20, "unit": "g", "calories": 60.8, "protein": 0.06, "carbs": 16.48, "fat": 0.0, "custom": false, "energyDense": true},
  {"id": "tahine", "name": "Tahine (pasta de gergelim)", "baseAmount": 20, "unit": "g", "calories": 119.0, "protein": 3.4, "carbs": 4.24, "fat": 10.76, "custom": false, "energyDense": true},
  { id: "pasta-amendoim", energyDense: true, name: "Pasta de amendoim", baseAmount: 15, unit: "g", calories: 90, protein: 3.8, carbs: 3.2, fat: 7.5, custom: false },
  { id: "granola", energyDense: true, name: "Granola", baseAmount: 40, unit: "g", calories: 188, protein: 4, carbs: 25.6, fat: 7.6, custom: false },
  { id: "banana", name: "Banana", baseAmount: 100, unit: "g", calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, custom: false },
  { id: "amendoim-triturado", energyDense: true, name: "Amendoim triturado", baseAmount: 30, unit: "g", calories: 170, protein: 7.8, carbs: 4.8, fat: 14.8, custom: false },
  { id: "azeite-oliva", energyDense: true, name: "Azeite de oliva", baseAmount: 13, unit: "ml", calories: 108, protein: 0, carbs: 0, fat: 12, custom: false },
  { id: "farinha-lactea", energyDense: true, name: "Farinha láctea", baseAmount: 30, unit: "g", calories: 124, protein: 3.9, carbs: 22.8, fat: 2.1, custom: false },
  { id: "leite-semidesnatado", name: "Leite semidesnatado", baseAmount: 200, unit: "ml", calories: 92, protein: 6.4, carbs: 9.6, fat: 3.2, custom: false },
  { id: "cafe-com-leite", name: "Café com leite sem açúcar", baseAmount: 200, unit: "ml", calories: 46, protein: 3.2, carbs: 4.8, fat: 1.6, custom: false },
  { id: "iogurte-natural-integral", name: "Iogurte natural integral", baseAmount: 170, unit: "g", calories: 115, protein: 6.6, carbs: 9.3, fat: 5.7, custom: false },
  { id: "trophic-basic", name: "Trophic Basic", baseAmount: 100, unit: "ml", calories: 120, protein: 4.6, carbs: 16, fat: 4.1, custom: false },
  { id: "arroz-cozido", name: "Arroz branco cozido", baseAmount: 100, unit: "g", calories: 128, protein: 2.5, carbs: 28.1, fat: 0.2, custom: false },
  { id: "carne-moida", name: "Carne moída preparada", baseAmount: 100, unit: "g", calories: 212, protein: 26, carbs: 0, fat: 12, custom: false, description: "Peso da carne já preparada. Estimativa que varia com o corte e o óleo usado." },
  { id: "strogonoff-frango", name: "Strogonoff de frango", baseAmount: 100, unit: "g", calories: 180, protein: 14, carbs: 4, fat: 12, custom: false, description: "Peso do strogonoff pronto, incluindo molho. Sem arroz nem batata palha. Valores estimados." },
  // Estimativas para as proporções descritas; o teor de gordura varia com o preparo.
  { id: "carne-moida-arroz", name: "Carne moída com arroz", baseAmount: 250, unit: "g", calories: 404, protein: 29.75, carbs: 42.15, fat: 12.3, custom: false, mealParts: [{ foodId: "arroz-cozido", quantity: 150 }, { foodId: "carne-moida", quantity: 100 }], description: "Informe o peso preparado de cada ingrediente. Arroz e carne serão registrados separadamente. Nutrientes estimados." },
  { id: "strogonoff-frango-arroz", name: "Strogonoff de frango com arroz", baseAmount: 300, unit: "g", calories: 462, protein: 24.75, carbs: 48.15, fat: 18.3, custom: false, mealParts: [{ foodId: "arroz-cozido", quantity: 150 }, { foodId: "strogonoff-frango", quantity: 150 }], description: "Informe o arroz e o strogonoff com molho separadamente, já preparados. Sem batata palha. Nutrientes estimados." },
  { id: "feijao-cozido", name: "Feijão carioca cozido", baseAmount: 100, unit: "g", calories: 76, protein: 4.8, carbs: 13.6, fat: 0.5, custom: false },
  { id: "ovo", name: "Ovo de galinha", baseAmount: 1, unit: "un", calories: 72, protein: 6.3, carbs: 0.4, fat: 4.8, custom: false },
  { id: "ovo-cozido", name: "Ovo cozido", baseAmount: 1, unit: "un", calories: 74, protein: 6, carbs: 0, fat: 5, custom: false },
  { id: "batata-doce-cozida", name: "Batata-doce cozida", baseAmount: 100, unit: "g", calories: 86, protein: 2, carbs: 20, fat: 0.1, custom: false },
  { id: "peito-frango", name: "Peito de frango grelhado", baseAmount: 100, unit: "g", calories: 159, protein: 32, carbs: 0, fat: 2.5, custom: false },
  { id: "carne-bovina", name: "Carne bovina grelhada", baseAmount: 100, unit: "g", calories: 219, protein: 32.4, carbs: 0, fat: 9, custom: false },
  { id: "aveia", energyDense: true, name: "Aveia em flocos", baseAmount: 100, unit: "g", calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, custom: false },
  { id: "pao", name: "Pão francês", baseAmount: 1, unit: "un", calories: 135, protein: 4.5, carbs: 28.5, fat: 1.5, custom: false },
  { id: "wafer-chocolate", name: "Biscoito wafer de chocolate", baseAmount: 30, unit: "g", calories: 150, protein: 2, carbs: 20, fat: 7, custom: false },
  { id: "pao-de-queijo", name: "Pão de queijo", baseAmount: 50, unit: "g", calories: 165, protein: 3.5, carbs: 22, fat: 7, custom: false, description: "Estimativa para uma porção de 50 g. O tamanho e os valores variam por receita e marca." },
  { id: "adocante", name: "Adoçante de mesa", baseAmount: 1, unit: "un", calories: 0, protein: 0, carbs: 0, fat: 0, custom: false, description: "Uma unidade representa um sachê ou porção indicada no rótulo. Algumas marcas podem informar pequenas quantidades de carboidratos." },
  { id: "suplemento-creatina", name: "Creatina monohidratada", baseAmount: 3, unit: "g", calories: 0, protein: 0, carbs: 0, fat: 0, custom: false, supplement: true, description: "Porção de referência de 3 g. Use a quantidade indicada no rótulo ou por profissional." },
  { id: "suplemento-hipercalorico", name: "Hipercalórico em pó", baseAmount: 120, unit: "g", calories: 450, protein: 20, carbs: 84, fat: 4, custom: false, supplement: true, energyDense: true, description: "Estimativa genérica por 120 g; calorias e macros variam bastante conforme a marca." },
  { id: "suplemento-feno-grego", name: "Feno-grego em cápsulas", baseAmount: 2, unit: "un", calories: 0, protein: 0, carbs: 0, fat: 0, custom: false, supplement: true, description: "Duas cápsulas como referência. Confira a dose e as orientações no rótulo." },
  { id: "suplemento-albumina", name: "Albumina em pó", baseAmount: 30, unit: "g", calories: 110, protein: 24, carbs: 2, fat: 0.5, custom: false, supplement: true, description: "Estimativa por 30 g. Valores variam conforme a marca e o sabor." },
  { id: "suplemento-whey", name: "Whey protein concentrado", baseAmount: 30, unit: "g", calories: 120, protein: 23, carbs: 4, fat: 2, custom: false, supplement: true, description: "Estimativa por 30 g. Confira a tabela nutricional da sua marca." },
  { id: "suplemento-caseina", name: "Caseína em pó", baseAmount: 30, unit: "g", calories: 110, protein: 24, carbs: 3, fat: 1, custom: false, supplement: true, description: "Estimativa por 30 g. Confira a tabela nutricional da sua marca." },
  { id: "suplemento-maltodextrina", name: "Maltodextrina", baseAmount: 40, unit: "g", calories: 152, protein: 0, carbs: 38, fat: 0, custom: false, supplement: true, description: "Estimativa por 40 g. Ajuste conforme o rótulo e a porção utilizada." },
  { id: "suplemento-dextrose", name: "Dextrose", baseAmount: 40, unit: "g", calories: 152, protein: 0, carbs: 38, fat: 0, custom: false, supplement: true, description: "Estimativa por 40 g. Ajuste conforme o rótulo e a porção utilizada." },
  { id: "suplemento-beta-alanina", name: "Beta-alanina", baseAmount: 3, unit: "g", calories: 0, protein: 0, carbs: 0, fat: 0, custom: false, supplement: true, description: "Porção de referência de 3 g. Use a quantidade indicada no rótulo ou por profissional." },
];

const ALLERGENS_BY_FOOD = {
  "leite-integral": ["leite"],
  "leite-po-integral": ["leite"],
  nozes: ["castanhas"],
  "castanha-caju": ["castanhas"],
  amendoas: ["castanhas"],
  tahine: ["gergelim"],
  "pasta-amendoim": ["amendoim"],
  "amendoim-triturado": ["amendoim"],
  "farinha-lactea": ["leite", "gluten"],
  "leite-semidesnatado": ["leite"],
  "cafe-com-leite": ["leite"],
  "iogurte-natural-integral": ["leite"],
  "trophic-basic": ["leite", "soja"],
  granola: ["gluten"],
  aveia: ["gluten"],
  pao: ["gluten"],
  "wafer-chocolate": ["gluten", "leite", "soja"],
  ovo: ["ovo"],
  "ovo-cozido": ["ovo"],
  "strogonoff-frango": ["leite"],
  "strogonoff-frango-arroz": ["leite"],
  "pao-de-queijo": ["leite", "ovo"],
  "suplemento-hipercalorico": ["leite", "soja", "gluten"],
  "suplemento-albumina": ["ovo"],
  "suplemento-whey": ["leite", "soja"],
  "suplemento-caseina": ["leite"],
};

for (const food of INITIAL_FOODS) {
  food.source = { type: "estimate", label: "Estimativa do catálogo MassaDiária" };
  food.reviewedAt = "2026-10-26";
  food.allergens = [...(ALLERGENS_BY_FOOD[food.id] ?? [])];
}

// A unidade de cada vitamina é uma receita inteira, não um volume estimado.
const shakeRecipes = [
  {"id": "shake-600-banana-mel", "name": "Banana, aveia e mel", "targetCalories": 600, "ingredients": [["leite-integral", 300], ["banana", 100], ["aveia", 40], ["pasta-amendoim", 25], ["mel", 10]]},
  {"id": "shake-600-coco-tamaras", "name": "Coco com tâmaras", "targetCalories": 600, "ingredients": [["leite-integral", 250], ["tamaras", 40], ["aveia", 40], ["coco-seco", 20], ["mel", 15]], "preparation": "Pique as tâmaras sem caroço e bata com o leite e os demais ingredientes até ficar homogêneo. A receita inteira equivale a 1 porção."},
  {"id": "shake-800-abacate", "name": "Abacate com leite em pó", "targetCalories": 800, "ingredients": [["leite-integral", 300], ["abacate", 150], ["leite-po-integral", 40], ["aveia", 30], ["mel", 20]]},
  {"id": "shake-800-iogurte-nozes", "name": "Iogurte, granola e nozes", "targetCalories": 800, "ingredients": [["iogurte-natural-integral", 340], ["banana", 150], ["granola", 60], ["nozes", 25]]},
  {"id": "shake-1000-cacau", "name": "Banana, cacau e amendoim", "targetCalories": 1000, "ingredients": [["leite-integral", 400], ["banana", 150], ["aveia", 80], ["pasta-amendoim", 40], ["cacau-po", 20], ["mel", 10]]},
  {"id": "shake-1000-tahine", "name": "Tâmaras, banana e tahine", "targetCalories": 1000, "ingredients": [["aveia", 100], ["tamaras", 80], ["tahine", 50], ["banana", 100]], "preparation": "Deixe as tâmaras sem caroço amolecerem em 350 ml de água. Bata essa água e todos os ingredientes até ficar cremoso. A receita inteira equivale a 1 porção."},
  {"id": "shake-1200-leite-po", "name": "Banana, leite em pó e amendoim", "targetCalories": 1200, "ingredients": [["leite-integral", 400], ["banana", 200], ["aveia", 100], ["pasta-amendoim", 40], ["leite-po-integral", 30]]},
  {"id": "shake-1200-castanha-coco", "name": "Castanha-de-caju, coco e granola", "targetCalories": 1200, "ingredients": [["leite-integral", 400], ["banana", 150], ["granola", 80], ["castanha-caju", 40], ["coco-seco", 20], ["mel", 30]]},
  { id: 'shake-banana-amendoim', name: 'Banana e pasta de amendoim', ingredients: [['leite-semidesnatado', 300], ['banana', 150], ['aveia', 60], ['pasta-amendoim', 30]] },
  { id: 'shake-iogurte-granola', name: 'Iogurte com granola', ingredients: [['iogurte-natural-integral', 340], ['granola', 60], ['banana', 100], ['pasta-amendoim', 15]] },
  { id: 'shake-farinha-lactea', name: 'Banana com farinha láctea', ingredients: [['leite-semidesnatado', 300], ['farinha-lactea', 60], ['banana', 100], ['pasta-amendoim', 30]] },
  { id: 'shake-banana-aveia-agua', name: 'Banana e aveia com água', ingredients: [['banana', 200], ['aveia', 80], ['pasta-amendoim', 30]], water: true },
  { id: 'shake-aveia-cremosa', name: 'Aveia cremosa com amendoim', ingredients: [['leite-semidesnatado', 300], ['aveia', 80], ['pasta-amendoim', 30]] },
  { id: 'shake-granola-amendoim', name: 'Iogurte, banana e amendoim', ingredients: [['iogurte-natural-integral', 170], ['banana', 150], ['granola', 80], ['amendoim-triturado', 30]] },
];

for (const recipe of shakeRecipes) {
  const nutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const ingredients = recipe.ingredients.map(([foodId, quantity]) => {
    const ingredient = INITIAL_FOODS.find(food => food.id === foodId);
    for (const key of Object.keys(nutrition)) nutrition[key] += ingredient[key] * Number(quantity) / ingredient.baseAmount;
    return { foodId, quantity, name: ingredient.name, unit: ingredient.unit };
  });
  for (const key of Object.keys(nutrition)) nutrition[key] = Math.round(nutrition[key] * 100) / 100;
  const allergens = [...new Set(ingredients.flatMap(({ foodId }) => INITIAL_FOODS.find(food => food.id === foodId)?.allergens ?? []))];
  INITIAL_FOODS.push({
    id: recipe.id,
    name: `Hipercalórico — ${recipe.name}`,
    baseAmount: 1,
    unit: 'un',
    ...nutrition,
    custom: false,
    targetCalories: recipe.targetCalories,
    recipe: ingredients,
    preparation: recipe.preparation ?? (recipe.water ? 'Bata com 300 ml de água. A receita inteira equivale a 1 porção.' : 'Bata os ingredientes até ficar homogêneo. A receita inteira equivale a 1 porção.'),
    source: { type: "estimate", label: "Receita calculada pelo catálogo MassaDiária" },
    reviewedAt: "2026-10-25",
    allergens,
  });
}
