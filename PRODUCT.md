# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

O usuário principal é a própria pessoa que mantém sua rotina de ganho de massa. Ela usa o app no dia a dia para registrar refeições, conferir o que falta para atingir as metas e acompanhar a evolução do peso.

## Product Purpose

O Massa Diária é um diário pessoal de alimentação e progresso para ganho de massa. Ele reúne calorias, proteína, carboidratos, gorduras e peso, e deve ajudar o usuário a completar as metas diárias com sugestões práticas de alimentos, receitas e porções.

Sucesso significa registrar uma refeição em poucos passos, entender rapidamente o progresso do dia e decidir o que comer para se aproximar das metas sem fazer cálculos manuais.

## Positioning

O diferencial principal é transformar o que ainda falta de calorias e proteína em sugestões concretas com quantidades ajustáveis. O app combina esse fechamento de metas com receitas hipercalóricas caseiras e mantém a decisão final nas mãos do usuário antes de registrar qualquer alimento.

## Operating Context

- Uso recorrente no celular durante o dia, especialmente perto das refeições.
- Registro por busca no catálogo, receita, refeição composta, cadastro manual ou código de barras.
- Revisão do consumo por data e acompanhamento do peso por médias semanais.
- Ajuste manual das metas e dos valores nutricionais conforme rótulos e necessidades pessoais.

## Capabilities and Constraints

- App em português do Brasil, construído com Next.js, React, TypeScript e GSAP.
- Metas editáveis de calorias e macronutrientes, catálogo de alimentos e histórico diário.
- Receitas hipercalóricas em faixas aproximadas de 600, 800, 1.000 e 1.200 kcal.
- Refeições compostas permitem informar as gramas de cada ingrediente.
- Consulta de código de barras usa o Open Food Facts e exige conexão; os valores devem ser conferidos no rótulo.
- Histórico e preferências são armazenados no `localStorage` do navegador, sem conta ou sincronização entre aparelhos.
- Os valores nutricionais e as sugestões são estimativas e não substituem acompanhamento médico ou nutricional.
- A evolução planejada inclui origem dos dados, alergênicos, sugestões para completar calorias e proteína e funcionamento como PWA offline.

## Brand Commitments

- Nome: Massa Diária.
- Idioma: português do Brasil.
- Voz direta, encorajadora e prática, sem promessas médicas ou resultados garantidos.
- A identidade existente usa a marca “M” e associa o produto ao acompanhamento cotidiano de ganho de massa.

## Evidence on Hand

- Catálogo nutricional, receitas e refeições em `dist/js/data/foods.js`.
- Fluxos principais e conteúdo da interface em `components/MassaDiariaApp.tsx`, `components/BarcodeFood.tsx` e `components/RecipeOptions.tsx`.
- Regras de estado, metas e persistência local em `dist/js/state/app-state.js` e `dist/js/storage/repository.js`.
- Especificações de produto e decisões anteriores em `docs/superpowers/specs/` e `docs/superpowers/plans/`.
- Não há depoimentos, validação clínica, resultados comprovados ou recomendações profissionais que possam ser apresentados como evidência.

## Product Principles

1. Registrar deve ser simples e rápido, especialmente no celular.
2. Mostrar o que falta e oferecer uma próxima ação concreta é mais útil do que exibir apenas totais.
3. Toda sugestão deve ser revisável; o app nunca registra ou altera metas automaticamente.
4. Origem, limitações e possíveis alergênicos devem ser claros quando os dados existirem.
5. O histórico pessoal deve continuar privado e disponível localmente.

## Accessibility & Inclusion

- Respeitar `prefers-reduced-motion` em todas as animações.
- Manter navegação por teclado, foco visível, textos associados aos campos e mensagens anunciadas por leitores de tela.
- Não depender apenas de cor para comunicar progresso, origem, alertas ou estado.
- Usar linguagem simples e valores legíveis no celular.
