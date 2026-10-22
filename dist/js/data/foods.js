/**
 * Valores médios por porção de referência. Podem variar conforme marca e preparo.
 * @typedef {{id:string,name:string,baseAmount:number,unit:"g"|"ml"|"un",calories:number,protein:number,carbs:number,fat:number,custom:boolean}} Food
 */

/** @type {Food[]} */
export const INITIAL_FOODS = [
  { id: "pasta-amendoim", name: "Pasta de amendoim", baseAmount: 15, unit: "g", calories: 90, protein: 3.8, carbs: 3.2, fat: 7.5, custom: false },
  { id: "granola", name: "Granola", baseAmount: 40, unit: "g", calories: 188, protein: 4, carbs: 25.6, fat: 7.6, custom: false },
  { id: "banana", name: "Banana", baseAmount: 100, unit: "g", calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, custom: false },
  { id: "amendoim-triturado", name: "Amendoim triturado", baseAmount: 30, unit: "g", calories: 170, protein: 7.8, carbs: 4.8, fat: 14.8, custom: false },
  { id: "azeite-oliva", name: "Azeite de oliva", baseAmount: 13, unit: "ml", calories: 108, protein: 0, carbs: 0, fat: 12, custom: false },
  { id: "farinha-lactea", name: "Farinha láctea", baseAmount: 30, unit: "g", calories: 124, protein: 3.9, carbs: 22.8, fat: 2.1, custom: false },
  { id: "leite-semidesnatado", name: "Leite semidesnatado", baseAmount: 200, unit: "ml", calories: 92, protein: 6.4, carbs: 9.6, fat: 3.2, custom: false },
  { id: "arroz-cozido", name: "Arroz branco cozido", baseAmount: 100, unit: "g", calories: 128, protein: 2.5, carbs: 28.1, fat: 0.2, custom: false },
  { id: "feijao-cozido", name: "Feijão carioca cozido", baseAmount: 100, unit: "g", calories: 76, protein: 4.8, carbs: 13.6, fat: 0.5, custom: false },
  { id: "ovo", name: "Ovo de galinha", baseAmount: 1, unit: "un", calories: 72, protein: 6.3, carbs: 0.4, fat: 4.8, custom: false },
  { id: "peito-frango", name: "Peito de frango grelhado", baseAmount: 100, unit: "g", calories: 159, protein: 32, carbs: 0, fat: 2.5, custom: false },
  { id: "carne-bovina", name: "Carne bovina grelhada", baseAmount: 100, unit: "g", calories: 219, protein: 32.4, carbs: 0, fat: 9, custom: false },
  { id: "aveia", name: "Aveia em flocos", baseAmount: 100, unit: "g", calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, custom: false },
  { id: "pao", name: "Pão francês", baseAmount: 1, unit: "un", calories: 135, protein: 4.5, carbs: 28.5, fat: 1.5, custom: false },
];
