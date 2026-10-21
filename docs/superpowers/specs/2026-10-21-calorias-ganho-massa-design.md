# Design: Diário de calorias para ganho de massa

## Objetivo

Criar um aplicativo web pessoal, em português, para registrar alimentos manualmente, somar calorias e macronutrientes e acompanhar a evolução de peso de 66 kg para 73 kg. O plano inicial busca um ganho aproximado de 2 kg por mês, com metas editáveis e acompanhamento semanal.

## Perfil inicial e metas

- Sexo: masculino
- Idade: 39 anos
- Altura: 1,79 m
- Peso inicial: 66 kg
- Peso desejado: 73 kg
- Atividade física: moderada, de 3 a 5 treinos por semana
- Meta energética inicial: 3.000 kcal por dia
- Proteínas: 140 g por dia
- Carboidratos: 400 g por dia
- Gorduras: 90 g por dia
- Ritmo de referência: aproximadamente 0,5 kg por semana

As metas são estimativas iniciais e poderão ser alteradas no perfil. O aplicativo informará que valores nutricionais e projeções não substituem orientação médica ou nutricional.

## Experiência principal

### Hoje

A tela inicial apresentará:

- progresso visual do peso atual até 73 kg;
- calorias consumidas e restantes em relação à meta diária;
- totais de proteínas, carboidratos e gorduras;
- busca de alimentos;
- controle de quantidade em gramas, mililitros ou porções;
- lista dos alimentos registrados no dia;
- ações para editar ou excluir um registro;
- acesso ao cadastro de um alimento personalizado.

Os alimentos serão escolhidos manualmente em uma lista diária única. Não haverá divisão obrigatória por refeições.

### Histórico

O histórico permitirá selecionar dias anteriores e consultar os alimentos e totais registrados. Um gráfico exibirá o peso e a média semanal. A comparação com o ritmo de 0,5 kg por semana indicará se o ganho está abaixo, dentro ou acima da referência, sugerindo revisar a ingestão quando necessário.

### Perfil

O perfil permitirá alterar peso atual, peso desejado, meta calórica e metas de macronutrientes. Também permitirá registrar um novo peso e apagar o histórico mediante confirmação explícita.

## Catálogo inicial de alimentos

O catálogo incluirá alimentos comuns para ganho de massa, entre eles:

- pasta de amendoim;
- granola;
- banana;
- amendoim triturado;
- azeite de oliva;
- farinha láctea;
- leite semidesnatado;
- arroz;
- feijão;
- ovos;
- peito de frango;
- carne bovina;
- aveia;
- pão.

Cada alimento terá uma porção de referência e valores estimados de calorias, proteínas, carboidratos e gorduras. A interface avisará que os valores variam conforme marca, receita e método de preparo. O usuário poderá criar alimentos personalizados com seus próprios valores nutricionais.

## Cálculos e fluxo de dados

Ao selecionar um alimento, o usuário informa a quantidade. O aplicativo multiplica os valores da porção de referência pela quantidade escolhida, arredonda apenas para exibição e mantém precisão suficiente nos totais internos.

Cada registro contém data, alimento, quantidade, unidade e valores nutricionais calculados. Os totais diários são derivados dos registros do dia. Pesos são armazenados separadamente com data e valor. As médias semanais usam os registros de peso disponíveis na semana, sem inventar valores para dias ausentes.

## Persistência e privacidade

Esta primeira versão não terá conta nem servidor. Alimentos personalizados, registros diários, pesos e configurações serão armazenados no navegador do aparelho. A interface explicará que limpar os dados do navegador pode apagar o histórico e que os registros não serão sincronizados entre aparelhos.

## Navegação e aparência

O aplicativo será responsivo para celular e computador. No celular, haverá três áreas principais: Hoje, Histórico e Perfil.

A identidade visual será esportiva e acolhedora, com fundo claro, cartões arredondados, azul-escuro, branco e verde-limão como cor de destaque. Textos, controles, contraste, foco de teclado e áreas de toque seguirão boas práticas de acessibilidade.

## Estados e tratamento de erros

- Quantidades vazias, iguais a zero, negativas ou não numéricas não serão aceitas.
- Metas e pesos terão limites plausíveis e mensagens claras de correção.
- A lista vazia mostrará uma orientação para adicionar o primeiro alimento.
- A exclusão de um alimento será reversível durante alguns segundos.
- A exclusão completa do histórico exigirá confirmação explícita.
- Dados locais inválidos ou incompatíveis serão ignorados com segurança, preservando o restante válido quando possível.

## Verificação

A implementação será verificada com:

- testes unitários dos cálculos de porção, totais diários, progresso e médias semanais;
- testes de criação, edição e exclusão de registros;
- testes de persistência e recuperação dos dados locais;
- validação manual dos principais fluxos em larguras de celular e computador;
- revisão de acessibilidade para navegação por teclado, rótulos e contraste;
- conferência de que as metas iniciais e o catálogo solicitado aparecem corretamente.

## Fora do escopo inicial

- login e sincronização entre aparelhos;
- leitura de código de barras;
- integração com relógios ou aplicativos de saúde;
- recomendação automática de dieta ou plano clínico;
- banco de dados remoto.
