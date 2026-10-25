# Massa Diária

Aplicativo web pessoal para registrar alimentos, somar calorias e macronutrientes e acompanhar a evolução de 66 kg para 73 kg com foco em ganho de massa.

## Funcionalidades

- meta inicial de 3.000 kcal, 140 g de proteína, 400 g de carboidratos e 90 g de gorduras;
- catálogo com alimentos comuns e quantidades ajustáveis;
- edição, exclusão e restauração de registros do dia;
- histórico nutricional por data;
- registro de peso, médias semanais e indicação do ritmo de evolução;
- metas editáveis e cadastro de alimentos personalizados;
- dados mantidos apenas no navegador, sem conta ou servidor.
- sugestões de porção para completar calorias e proteína, com filtros de alergênicos;
- origem e marca dos alimentos, quando disponíveis;
- instalação como PWA e acesso offline ao diário após a primeira visita.

## Executar localmente

O projeto usa Next.js com App Router, TypeScript e GSAP. Nesta primeira versão, os dados continuam salvos somente no navegador.

```powershell
npm install
npm run dev
```

Abra `http://localhost:3000/`. Para validar uma versão de produção:

```powershell
npm test
npm run build
npm start
```

Na Vercel, mantenha a raiz do projeto em `.`. O framework e a pasta de saída são detectados automaticamente pelo Next.js.

## Privacidade e limites

Os registros ficam no `localStorage` do navegador atual. Eles não são sincronizados entre aparelhos e podem ser apagados ao limpar os dados do navegador.

Os valores nutricionais e as metas são estimativas. Este aplicativo não substitui avaliação ou acompanhamento de médico ou nutricionista.

## Código de barras

Em **Hoje → Buscar por código de barras**, digite um EAN-8, UPC-A, EAN-13 ou GTIN-14 e consulte o produto. **Usar câmera** lê EAN-8, EAN-13 e UPC-A em navegadores com `BarcodeDetector`, em HTTPS (ou localhost) e com permissão de câmera. Em navegadores sem suporte, use a digitação.

A consulta pública usa o [Open Food Facts](https://world.openfoodfacts.org/) (base colaborativa, ODbL). Confira os nutrientes no rótulo, complete campos ausentes e confirme se a base é **100 g ou 100 ml**. Salve o alimento, informe a quantidade consumida e adicione ao diário. Produtos não encontrados podem ser cadastrados manualmente. Não é necessária chave de API: somente o código é enviado à base externa; o histórico continua no navegador. A rede precisa permitir `world.openfoodfacts.org`.

Quando disponíveis, marca, origem e alergênicos retornados pela base também são mantidos. A informação de alergênicos pode estar incompleta e não cobre contaminação cruzada; confira sempre o rótulo.

## Sugestões e uso offline

Na tela **Hoje**, o app calcula o que falta para as metas de calorias e proteína e apresenta até três opções com porção ajustável. Selecionar uma sugestão apenas preenche o formulário para revisão. Em **Perfil**, é possível excluir alergênicos e escolher entre alimentos, receitas ou ambos.

O manifesto e o service worker permitem instalar o Massa Diária em navegadores compatíveis. Depois da primeira visita online, a interface e o histórico local continuam disponíveis sem conexão. A busca no Open Food Facts permanece dependente da internet.

Os testes do adaptador estão incluídos em `npm test`. O teste de navegador usa respostas controladas da API e requer Playwright e Chromium disponíveis fora ou dentro do projeto:

```bash
npm run build
npm start -- --hostname 127.0.0.1 --port 3002
# Em outro terminal; PLAYWRIGHT_MODULE pode indicar o index.mjs de uma instalação existente.
node scripts/barcode-smoke.mjs
```

Variáveis opcionais do teste: `APP_URL`, `PLAYWRIGHT_MODULE` e `CHROMIUM_PATH`. O teste não valida câmera física nem disponibilidade real da base pública.

## Vitaminas hipercalóricas e animações

A seção **Bombas hipercalóricas**, na tela Hoje, oferece 14 receitas com ingredientes e preparo. Os filtros de aproximadamente 600, 800, 1.000 e 1.200 kcal mostram duas receitas novas por faixa; Todas também mostra as seis receitas anteriores. Os nutrientes são estimativas somadas a partir dos alimentos do catálogo: **1 un é a receita inteira**, e **0,5 un é meia receita**. Selecionar uma receita preenche o formulário; confirme a quantidade e clique em Adicionar para registrá-la.

O GSAP anima a entrada das telas, os totais de calorias/macros e as atualizações do diário. A preferência de movimento reduzido do sistema é respeitada. O teste `scripts/shakes-smoke.mjs` verifica o fluxo móvel e as duas preferências de movimento; aceita as mesmas variáveis do teste de código de barras, com `APP_URL` padrão na porta 3003.


### Novas receitas por faixa calórica

Os totais são estimativas calculadas a partir do catálogo, e não medições do preparo. As quantidades aparecem em **Ingredientes e preparo**; o cadastro considera os ingredientes e líquidos da receita inteira.

| Faixa | Receita | kcal estimadas |
| --- | --- | ---: |
| 600 | Banana, aveia e mel | 608 |
| 600 | Coco com tâmaras | 598,5 |
| 800 | Abacate com leite em pó | 798,9 |
| 800 | Iogurte, granola e nozes | 809 |
| 1.000 | Banana, cacau e amendoim | 1.004,7 |
| 1.000 | Tâmaras, banana e tahine | 1.001,1 |
| 1.200 | Banana, leite em pó e amendoim | 1.199,8 |
| 1.200 | Castanha-de-caju, coco e granola | 1.206,3 |

A seção expansível **Alimentos mais calóricos** compara 15 opções por 100 g (ou 100 ml quando a unidade é volume). O botão de seleção preenche uma porção de referência que pode ser ajustada antes de registrar. O catálogo ganhou 12 alimentos: leite integral, leite em pó integral, cacau, abacate, nozes, castanha-de-caju, amêndoas, coco seco, uvas-passas, tâmaras, mel e tahine. Valores variam por marca e preparo; use o rótulo para cadastrar uma versão específica.
