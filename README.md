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

## Executar localmente

Requer Node.js para os testes e qualquer servidor HTTP estático para abrir a interface.

```powershell
npm test
python -m http.server 4173 --directory dist
```

Depois, abra `http://127.0.0.1:4173/`.

## Privacidade e limites

Os registros ficam no `localStorage` do navegador atual. Eles não são sincronizados entre aparelhos e podem ser apagados ao limpar os dados do navegador.

Os valores nutricionais e as metas são estimativas. Este aplicativo não substitui avaliação ou acompanhamento de médico ou nutricionista.
