import test from 'node:test';
import assert from 'node:assert/strict';
import {createAppState,createDefaultState} from '../dist/js/state/app-state.js';
function setup(){let state=createDefaultState(),writes=0;return {app:createAppState({loadState:()=>state,saveState:s=>{state=structuredClone(s);writes++;}}),writes:()=>writes};}
test('refeição: arroz e carne têm pesos independentes e uma gravação',()=>{
 const {app,writes}=setup();
 assert.equal(app.addMeal('2026-10-23',[{foodId:'arroz-cozido',quantity:'200'},{foodId:'carne-moida',quantity:'80,5'}]).ok,true);
 const daily=app.getDailySummary('2026-10-23');
 assert.equal(daily.entries.length,2);
 assert.equal(daily.entries[1].quantity,80.5);
 assert.ok(Math.abs(daily.nutrition.calories-426.66)<0.001);
 assert.equal(writes(),1);
});
test('refeição: ingrediente inválido não registra parcialmente',()=>{
 const {app,writes}=setup();
 for(const items of [[],[{foodId:'arroz-cozido',quantity:100},{foodId:'carne-moida',quantity:''}],[{foodId:'arroz-cozido',quantity:100},{foodId:'ausente',quantity:100}]]) assert.equal(app.addMeal('2026-10-23',items).ok,false);
 assert.equal(app.getDailySummary('2026-10-23').entries.length,0);
 assert.equal(writes(),0);
});
test('refeição: strogonoff pode ser registrado com outra proporção de arroz',()=>{
 const {app}=setup();
 assert.equal(app.addMeal('2026-10-23',[{foodId:'arroz-cozido',quantity:100},{foodId:'strogonoff-frango',quantity:200}]).ok,true);
 assert.equal(app.getDailySummary('2026-10-23').nutrition.calories,488);
});
