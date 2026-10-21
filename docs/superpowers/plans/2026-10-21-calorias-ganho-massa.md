# Diário de Calorias para Ganho de Massa — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar e publicar um aplicativo web responsivo, em português, que registre alimentos manualmente, some calorias e macronutrientes e acompanhe o ganho de peso de 66 kg para 73 kg.

**Architecture:** Aplicação estática, sem login e sem backend, organizada em módulos ES. O domínio mantém cálculos puros, o repositório encapsula `localStorage`, o estado coordena as ações e a camada de interface renderiza as três áreas Hoje, Histórico e Perfil.

**Tech Stack:** HTML5, CSS3, JavaScript ES modules, `localStorage`, SVG nativo, Node.js test runner e Sites para publicação privada.

**Spec:** `docs/superpowers/specs/2026-10-21-calorias-ganho-massa-design.md`

## Global Constraints

- Interface e mensagens em português do Brasil.
- Perfil inicial: homem, 39 anos, 1,79 m, 66 kg, meta de 73 kg e atividade moderada.
- Metas iniciais editáveis: 3.000 kcal, 140 g de proteína, 400 g de carboidratos e 90 g de gorduras por dia.
- Ritmo de referência: aproximadamente 0,5 kg por semana.
- Seleção manual de alimentos em lista diária única, sem divisão obrigatória por refeições.
- Dados salvos somente no navegador; sem conta, servidor ou sincronização.
- Valores nutricionais apresentados como estimativas, com aviso sobre variação de marca e preparo.
- Aplicação responsiva, acessível por teclado e utilizável em celular e computador.
- Publicação privada por padrão.

## Review Focus

- Quantidade vazia, não numérica, zero ou negativa deve ser rejeitada sem alterar o diário; testado na Task 1.
- Armazenamento local com JSON inválido deve voltar a um estado seguro sem impedir a abertura; testado na Task 2.
- Edição ou exclusão em data diferente da selecionada não pode alterar outro dia; testado na Task 3.
- Semana com dias sem pesagem deve calcular média apenas com valores existentes; testado na Task 4.
- Alimento personalizado com macro negativo ou nome repetido deve ser rejeitado com mensagem clara; testado na Task 5.

---

## File Structure

- `package.json` — comandos de teste e metadados do projeto estático.
- `.openai/hosting.json` — identidade do Site e diretório estático `dist`.
- `dist/index.html` — estrutura semântica das três telas, diálogos e navegação.
- `dist/styles.css` — identidade visual, layout responsivo, estados e acessibilidade.
- `dist/js/data/foods.js` — catálogo inicial e modelo de alimento.
- `dist/js/domain/nutrition.js` — cálculos e validações nutricionais puros.
- `dist/js/domain/progress.js` — progresso de peso e agrupamentos semanais puros.
- `dist/js/storage/repository.js` — leitura, normalização e gravação em `localStorage`.
- `dist/js/state/app-state.js` — estado da aplicação e operações de diário, peso, perfil e catálogo.
- `dist/js/ui/render.js` — renderização, diálogos, avisos e gráfico SVG.
- `dist/js/app.js` — inicialização e ligação de eventos da interface.
- `tests/nutrition.test.js` — cálculos de porção, totais e validação.
- `tests/repository.test.js` — persistência, recuperação e migração segura.
- `tests/app-state.test.js` — criação, edição, exclusão e isolamento por data.
- `tests/progress.test.js` — progresso, média semanal e classificação de ritmo.
- `tests/custom-foods.test.js` — cadastro e validação de alimentos personalizados.

### Task 1: Fundação, catálogo e cálculos nutricionais

**Files:**
- Create: `package.json`
- Create: `.openai/hosting.json`
- Create: `dist/js/data/foods.js`
- Create: `dist/js/domain/nutrition.js`
- Test: `tests/nutrition.test.js`

**Interfaces:**
- Consumes: nenhum módulo anterior.
- Produces: `Food`, `Nutrition`, `INITIAL_FOODS`, `scaleNutrition(food, quantity)`, `sumNutrition(items)` e `validateQuantity(value)`.

- [ ] **Step 1: Registrar o Site privado e criar a base testável**

Criar o Site uma única vez, persistir o `project_id` retornado em `.openai/hosting.json` com `static.directory` igual a `dist`, e criar `package.json` com `type: "module"` e script `test` igual a `node --test tests`.

- [ ] **Step 2: Escrever os testes que falham para cálculos e quantidades**

Em `tests/nutrition.test.js`, cobrir: 30 g de um alimento definido por 100 g resulta em 30% dos macros; soma de dois registros; preservação da precisão interna; rejeição de `""`, `"abc"`, `0` e `-1`; aceitação de número decimal positivo.

- [ ] **Step 3: Rodar o teste e confirmar a falha**

Run: `npm test -- --test-name-pattern="nutrição|quantidade"`
Expected: FAIL porque os módulos de domínio ainda não existem.

- [ ] **Step 4: Implementar catálogo e funções puras**

Definir em `foods.js` o tipo documental `Food = { id, name, baseAmount, unit, calories, protein, carbs, fat, custom }` e incluir pasta de amendoim, granola, banana, amendoim triturado, azeite de oliva, farinha láctea, leite semidesnatado, arroz, feijão, ovos, peito de frango, carne bovina, aveia e pão. Em `nutrition.js`, implementar as assinaturas descritas nas interfaces e retornar resultados numéricos sem arredondamento prematuro.

- [ ] **Step 5: Rodar os testes e confirmar aprovação**

Run: `npm test`
Expected: PASS em todos os testes da Task 1.

- [ ] **Step 6: Commit**

```bash
git add package.json .openai/hosting.json dist/js/data/foods.js dist/js/domain/nutrition.js tests/nutrition.test.js
git commit -m "feat: add food catalog and nutrition calculations"
```

### Task 2: Persistência local e estado inicial

**Files:**
- Create: `dist/js/storage/repository.js`
- Create: `dist/js/state/app-state.js`
- Test: `tests/repository.test.js`

**Interfaces:**
- Consumes: `INITIAL_FOODS` e `Nutrition` da Task 1.
- Produces: `createRepository(storage, key)`, `loadState()`, `saveState(state)`, `clearState()`, `DEFAULT_PROFILE` e `createAppState(repository, todayProvider)`.

- [ ] **Step 1: Escrever os testes que falham para o repositório**

Testar round-trip do estado, retorno dos padrões quando não há dados, recuperação após JSON inválido, descarte apenas de registros malformados dentro de um estado parcialmente válido e limpeza pela chave `massa-diaria:v1`.

- [ ] **Step 2: Rodar o teste e confirmar a falha**

Run: `node --test tests/repository.test.js`
Expected: FAIL porque `repository.js` e `app-state.js` ainda não existem.

- [ ] **Step 3: Implementar o repositório e o estado padrão**

Usar estado serializável `{ profile, entriesByDate, weights, customFoods, version }`. `DEFAULT_PROFILE` deve conter exatamente as metas e medidas da especificação. Injetar `storage` e `todayProvider` para permitir testes sem navegador.

- [ ] **Step 4: Rodar os testes e confirmar aprovação**

Run: `node --test tests/repository.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add dist/js/storage/repository.js dist/js/state/app-state.js tests/repository.test.js
git commit -m "feat: persist calorie diary locally"
```

### Task 3: Tela Hoje e operações do diário

**Files:**
- Create: `dist/index.html`
- Create: `dist/styles.css`
- Create: `dist/js/ui/render.js`
- Create: `dist/js/app.js`
- Test: `tests/app-state.test.js`

**Interfaces:**
- Consumes: `createAppState`, catálogo, validação e cálculos das Tasks 1–2.
- Produces: `addEntry(date, foodId, quantity)`, `updateEntry(date, entryId, quantity)`, `removeEntry(date, entryId)`, `restoreEntry(date, entry)`, `getDailySummary(date)` e `renderApp(snapshot, root)`.

- [ ] **Step 1: Escrever os testes que falham para CRUD diário**

Testar inclusão, edição, remoção, restauração e totais de uma data; confirmar que editar ou excluir um ID em outra data não altera nenhum registro; confirmar que quantidade inválida mantém o estado anterior. A restauração visual deve permanecer disponível por 5 segundos após a exclusão.

- [ ] **Step 2: Rodar o teste e confirmar a falha**

Run: `node --test tests/app-state.test.js`
Expected: FAIL porque as operações ainda não existem.

- [ ] **Step 3: Implementar as operações de estado**

Adicionar as assinaturas das interfaces ao objeto retornado por `createAppState`. Cada operação válida deve persistir uma vez; operações inválidas devem retornar `{ ok: false, error }` sem gravação.

- [ ] **Step 4: Rodar os testes de estado**

Run: `node --test tests/app-state.test.js`
Expected: PASS.

- [ ] **Step 5: Implementar a interface Hoje**

Criar estrutura semântica com cabeçalho de progresso 66→73 kg, cartões de 3.000 kcal e macros, busca filtrável, seletor de alimento, quantidade/unidade, botão de adicionar e lista editável. Renderizar estado vazio, erros junto ao campo e ação temporária “Desfazer” após exclusão.

- [ ] **Step 6: Verificar o fluxo Hoje no navegador**

Servir `dist`, abrir em largura móvel e desktop e confirmar: busca, inclusão, edição, exclusão/desfazer, totais e recarga preservada. Expected: nenhum erro no console e foco visível nos controles.

- [ ] **Step 7: Commit**

```bash
git add dist/index.html dist/styles.css dist/js/ui/render.js dist/js/app.js dist/js/state/app-state.js tests/app-state.test.js
git commit -m "feat: build daily calorie tracking experience"
```

### Task 4: Histórico, peso e progresso semanal

**Files:**
- Create: `dist/js/domain/progress.js`
- Modify: `dist/js/state/app-state.js`
- Modify: `dist/js/ui/render.js`
- Modify: `dist/index.html`
- Test: `tests/progress.test.js`

**Interfaces:**
- Consumes: `weights`, `profile` e `entriesByDate` da Task 2.
- Produces: `calculateGoalProgress(startWeight, currentWeight, targetWeight)`, `groupWeeklyAverages(weights)`, `classifyWeeklyRate(weeklyAverages, targetRate)`, `recordWeight(date, value)` e `getHistorySnapshot(date)`.

- [ ] **Step 1: Escrever os testes que falham para progresso**

Testar progresso de 66 para 73 kg nos limites e no meio; média semanal usando somente pesagens existentes; ordenação de datas; atualização do peso atual pela pesagem mais recente; classificação abaixo, dentro e acima de 0,5 kg/semana; rejeição de peso não plausível.

- [ ] **Step 2: Rodar o teste e confirmar a falha**

Run: `node --test tests/progress.test.js`
Expected: FAIL porque `progress.js` ainda não existe.

- [ ] **Step 3: Implementar cálculos e ações de peso**

Usar datas locais no formato `YYYY-MM-DD`. Considerar “dentro da referência” a faixa inclusiva de 0,4 a 0,6 kg/semana e manter a mensagem como sugestão de revisão, não prescrição.

- [ ] **Step 4: Rodar o teste e confirmar aprovação**

Run: `node --test tests/progress.test.js`
Expected: PASS.

- [ ] **Step 5: Implementar Histórico**

Adicionar seletor de dia, resumo nutricional, lista daquele dia, formulário de peso, média semanal, classificação do ritmo e gráfico SVG acessível com tabela textual equivalente.

- [ ] **Step 6: Verificar histórico no navegador**

Registrar pesos em semanas com e sem lacunas e confirmar gráfico, tabela, médias, seleção de dias e mensagens de ritmo. Expected: dados corretos após recarga.

- [ ] **Step 7: Commit**

```bash
git add dist/js/domain/progress.js dist/js/state/app-state.js dist/js/ui/render.js dist/index.html tests/progress.test.js
git commit -m "feat: add weight history and weekly progress"
```

### Task 5: Perfil e alimentos personalizados

**Files:**
- Modify: `dist/js/state/app-state.js`
- Modify: `dist/js/ui/render.js`
- Modify: `dist/index.html`
- Test: `tests/custom-foods.test.js`

**Interfaces:**
- Consumes: `Food`, `profile` e `repository` das Tasks 1–2.
- Produces: `updateProfile(patch)`, `addCustomFood(input)`, `removeCustomFood(id)` e `clearAllData(confirmation)`.

- [ ] **Step 1: Escrever os testes que falham para perfil e catálogo pessoal**

Testar alteração das quatro metas e dos pesos, cadastro de alimento válido, rejeição de nome vazio ou repetido sem diferenciar maiúsculas, rejeição de macro negativo, remoção de alimento personalizado sem apagar entradas antigas e limpeza apenas com confirmação explícita.

- [ ] **Step 2: Rodar o teste e confirmar a falha**

Run: `node --test tests/custom-foods.test.js`
Expected: FAIL porque as ações ainda não existem.

- [ ] **Step 3: Implementar validações e ações**

Validar peso entre 30 e 300 kg, calorias entre 500 e 10.000 kcal, macros entre 0 e 1.000 g e nome normalizado não duplicado. Preservar em cada entrada um snapshot do alimento para manter o histórico após remoção do catálogo.

- [ ] **Step 4: Rodar o teste e confirmar aprovação**

Run: `node --test tests/custom-foods.test.js`
Expected: PASS.

- [ ] **Step 5: Implementar Perfil e diálogo de alimento**

Adicionar formulários editáveis, textos sobre estimativas e armazenamento local, cadastro personalizado e diálogo de confirmação para apagar todo o histórico. Exibir sucesso ou erro em região `aria-live`.

- [ ] **Step 6: Verificar no navegador**

Confirmar alteração das metas, cadastro e uso imediato de alimento, erros inline, persistência e cancelamento/confirmação da limpeza. Expected: fluxos completos por teclado.

- [ ] **Step 7: Commit**

```bash
git add dist/index.html dist/js/state/app-state.js dist/js/ui/render.js tests/custom-foods.test.js
git commit -m "feat: add editable profile and custom foods"
```

### Task 6: Acabamento responsivo e verificação completa

**Files:**
- Modify: `dist/styles.css`
- Modify: `dist/index.html`
- Modify: `dist/js/ui/render.js`
- Modify: `README.md`

**Interfaces:**
- Consumes: aplicativo completo das Tasks 1–5.
- Produces: experiência final responsiva e instruções de uso/manutenção.

- [ ] **Step 1: Finalizar o sistema visual**

Aplicar fundo claro, cartões arredondados, azul-escuro, branco e verde-limão; criar navegação Hoje/Histórico/Perfil fixa no celular e layout amplo no desktop; respeitar `prefers-reduced-motion`, contraste e alvos de toque de pelo menos 44 px.

- [ ] **Step 2: Adicionar metadados e documentação**

Definir título e descrição reais no HTML. Criar `README.md` com execução dos testes, visualização local, limites do armazenamento local e aviso de que o app não substitui nutricionista.

- [ ] **Step 3: Rodar a suíte completa**

Run: `npm test`
Expected: todos os testes PASS, sem testes ignorados.

- [ ] **Step 4: Fazer validação manual final**

Em celular e desktop, percorrer: adicionar alimento, editar, excluir/desfazer, recarregar, escolher outro dia, registrar peso, ler gráfico/tabela, mudar metas, cadastrar alimento e cancelar a limpeza. Expected: nenhum erro no console, conteúdo sem corte horizontal e navegação completa por teclado.

- [ ] **Step 5: Commit**

```bash
git add dist/styles.css dist/index.html dist/js/ui/render.js README.md
git commit -m "feat: polish responsive calorie tracker"
```

### Task 7: Empacotar, revisar e publicar

**Files:**
- Verify: `.openai/hosting.json`
- Verify: `dist/**`

**Interfaces:**
- Consumes: Site registrado e aplicação validada das Tasks 1–6.
- Produces: versão salva, implantação privada concluída e URL final.

- [ ] **Step 1: Verificar a árvore de trabalho e o manifesto**

Run: `git status --short` e leitura de `.openai/hosting.json`.
Expected: apenas alterações intencionais; `project_id` existente e `static.directory` igual a `dist`.

- [ ] **Step 2: Empacotar e sincronizar a fonte exata**

Usar o fluxo oficial de Sites para executar `npm test`, fazer commit/push da fonte e produzir o arquivo de publicação associado ao mesmo `commit_sha`.

- [ ] **Step 3: Salvar e implantar a versão privada**

Enviar o arquivo, `project_id` e `commit_sha` verificados ao fluxo de versão e implantação privada. Não criar outro Site.

- [ ] **Step 4: Confirmar o estado terminal**

Consultar o status apenas enquanto estiver pendente, construindo ou publicando. Expected: estado de sucesso e URL de produção retornada.

- [ ] **Step 5: Registrar a entrega**

Reportar a URL literal, o resultado dos testes e a limitação de que os dados ficam somente no navegador atual.
