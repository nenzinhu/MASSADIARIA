import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("Next.js: a página principal carrega o diário como componente cliente", () => {
  const page = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /MassaDiariaApp/);
});

test("animações: a interface respeita movimento reduzido e usa GSAP", () => {
  const app = readFileSync(new URL("../components/MassaDiariaApp.tsx", import.meta.url), "utf8");
  assert.match(app, /gsap\.matchMedia/);
  assert.match(app, /prefers-reduced-motion: reduce/);
});

test("animações: cartões permanecem legíveis durante o stagger", () => {
  const app = readFileSync(new URL("../components/MassaDiariaApp.tsx", import.meta.url), "utf8");
  assert.match(app, /gsap\.fromTo\("\.reveal-card", \{ y: 14 \}/);
  assert.doesNotMatch(app, /gsap\.fromTo\("\.reveal-card", \{ autoAlpha: 0/);
});

test("navegação: troca de aba volta ao topo e o cabeçalho usa a meta atual", () => {
  const app = readFileSync(new URL("../components/MassaDiariaApp.tsx", import.meta.url), "utf8");
  assert.match(app, /window\.scrollTo/);
  assert.match(app, /Meta ativa · \{format\(profile\.calorieGoal\)\} kcal/);
});

test("Vercel: o projeto possui um build de Next.js na raiz", () => {
  const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  assert.equal(packageJson.scripts.build, "next build");
  assert.equal(typeof packageJson.dependencies.next, "string");
});
