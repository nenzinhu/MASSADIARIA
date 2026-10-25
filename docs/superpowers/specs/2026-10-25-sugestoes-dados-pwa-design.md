# Sugestões nutricionais, qualidade dos dados e PWA

## Intenção

Evoluir o MassaDiária em três frentes conectadas: tornar os dados nutricionais verificáveis, sugerir alimentos e receitas para completar as metas diárias de calorias e proteína, e permitir instalação e uso offline como PWA. O registro diário deve continuar rápido e funcionar sem conta ou banco externo.

## Objetivos

- Persistir origem, marca, data de revisão e alergênicos dos alimentos.
- Distinguir claramente valor zero de dado ausente.
- Avisar sobre inconsistências entre calorias e macronutrientes sem bloquear o cadastro.
- Oferecer até três sugestões proporcionais às calorias e à proteína restantes.
- Respeitar alergênicos e preferências definidos pelo usuário.
- Permitir instalar o app e registrar dados sem conexão.
- Preservar e migrar automaticamente os dados existentes no `localStorage`.

## Limites

- As sugestões não substituem nutricionista ou orientação médica.
- Alergênicos são informativos e não garantem ausência de contaminação cruzada.
- A primeira versão não combina vários alimentos em uma nova refeição automática; sugere itens ou receitas existentes com uma porção calculada.
- Sincronização Neon, notificações e ajuste automático de metas não fazem parte desta entrega.
- O funcionamento offline cobre a interface e os dados locais. Consulta ao Open Food Facts exige conexão.

## Abordagens consideradas

### Integrada em etapas — escolhida

Implementar qualidade dos dados, sugestões e PWA nessa ordem. As sugestões passam a depender de metadados confiáveis e a PWA é configurada quando o fluxo final já está estável. Reduz retrabalho e permite validar cada parte separadamente.

### Sugestões primeiro

Usaria imediatamente o catálogo atual, mas exigiria revisão do algoritmo e da interface quando origem, alergênicos e campos ausentes fossem adicionados.

### PWA primeiro

Entregaria instalação rapidamente, porém o cache e os arquivos precisariam ser revistos após as alterações de dados e sugestões.

## 1. Qualidade e origem dos dados

Cada alimento poderá ter:

- `source.type`: `catalog`, `label`, `open_food_facts` ou `estimate`;
- `source.label`: texto curto apresentado ao usuário;
- `source.url`: endereço público opcional;
- `brand`: marca opcional;
- `reviewedAt`: data da última revisão, quando conhecida;
- `allergens`: lista normalizada, inicialmente leite, amendoim, castanhas, gergelim, glúten, soja e ovo;
- nutrientes numéricos ou ausentes, sem converter campo ausente em zero.

O catálogo incluído no app será marcado como estimativa ou catálogo. Produtos lidos por código de barras conservarão Open Food Facts como origem e a marca retornada. Alimentos cadastrados manualmente serão marcados como rótulo informado pelo usuário.

A ficha do alimento mostrará a origem e os alergênicos conhecidos. O formulário manual permitirá informar marca, origem e alergênicos. Uma validação comparará calorias declaradas com `4 × proteína + 4 × carboidratos + 9 × gorduras`; diferenças relevantes gerarão um aviso explicativo, sem impedir o salvamento porque fibras, polióis e arredondamentos podem justificar diferenças.

O estado local ganhará uma nova versão. A migração preencherá metadados seguros nos alimentos antigos e manterá todo o histórico. Entradas antigas conservarão a cópia do alimento usada no momento do registro.

## 2. Preferências e alergênicos

O Perfil terá uma área “Preferências das sugestões” com:

- alergênicos a excluir;
- opção de esconder alimentos personalizados ou estimativas;
- escolha de usar alimentos, receitas ou ambos.

As exclusões afetam apenas sugestões. O usuário ainda poderá procurar e registrar manualmente qualquer alimento. A interface explicará que as informações de alergênicos podem estar incompletas e devem ser conferidas no rótulo.

## 3. Sugestões para completar o dia

Um painel aparecerá na tela Hoje após os cartões de energia e macros. Ele calculará:

- calorias restantes;
- proteína restante;
- candidatos compatíveis com as preferências;
- porção ajustada de cada candidato;
- resultado previsto após adicionar a sugestão.

O algoritmo priorizará simultaneamente calorias e proteína, conforme escolhido. Para cada alimento ou receita elegível, calculará uma porção dentro de limites práticos da unidade original. A pontuação combinará distância relativa das calorias restantes, distância relativa da proteína restante e penalidade por exceder muito a meta. Itens com dados essenciais ausentes, porção inválida ou alergênico excluído não serão sugeridos.

Serão mostradas até três opções diferentes, com:

- quantidade sugerida;
- calorias e proteína adicionadas;
- explicação curta, como “aproxima as calorias e acrescenta 24 g de proteína”;
- indicação de origem e possíveis alergênicos;
- botão “Selecionar e revisar”.

O botão preencherá o formulário de registro, mas não salvará automaticamente. O usuário poderá ajustar a quantidade antes de adicionar. Quando a meta já estiver atingida, os dados forem insuficientes ou não houver candidato compatível, o painel mostrará uma mensagem clara em vez de fabricar uma sugestão.

## 4. PWA e funcionamento offline

O Next.js fornecerá um manifesto com nome, nome curto, cores, ícones e modo `standalone`. Um service worker será registrado no cliente e armazenará o shell do app e arquivos estáticos versionados.

Estratégia de cache:

- navegação e shell: rede primeiro, com fallback para a versão armazenada;
- arquivos estáticos versionados: cache primeiro;
- Open Food Facts: rede, sem tratar falha como produto inexistente;
- gravações do diário: continuam no `localStorage`, disponíveis offline.

O app mostrará estado discreto de conexão: online, offline e atualização disponível. Uma nova versão do service worker não substituirá silenciosamente uma tela em uso; o usuário receberá a ação “Atualizar agora”. Falhas de rede na leitura de código de barras manterão a opção de cadastro manual.

## 5. Interface e acessibilidade

- O painel de sugestões será compacto e virá antes da lista extensa de receitas.
- Origem e alergênicos usarão texto e ícones, sem depender apenas de cor.
- Avisos estarão ligados aos campos correspondentes e serão anunciados por leitor de tela.
- Botões terão alvos mínimos adequados, foco visível e navegação por teclado.
- Animações continuarão respeitando `prefers-reduced-motion`.
- A PWA não exibirá mensagens repetitivas de instalação; usará a instalação nativa do navegador e uma orientação discreta quando disponível.

## 6. Privacidade e falhas

Preferências, histórico e sugestões permanecem no navegador. Nenhum dado pessoal será enviado para gerar sugestões. A única chamada externa continua sendo a consulta explícita de código de barras ao Open Food Facts.

Uma falha de cache ou rede não pode apagar registros locais. Migrações devem preservar o estado original quando encontrarem dados desconhecidos. Erros da PWA, do service worker ou da API serão apresentados como ações recuperáveis.

## 7. Critérios de aceite

- Dados antigos abrem sem perda após a migração.
- Origem e alergênicos aparecem nas fichas relevantes.
- Campos ausentes continuam ausentes e não aparecem como zero.
- Alimentos excluídos por alergênico nunca entram nas sugestões.
- As sugestões apresentam porção, calorias, proteína e justificativa.
- Selecionar uma sugestão apenas preenche o registro para revisão.
- O app pode ser instalado em navegador compatível.
- Após uma visita online, a interface e o diário abrem offline.
- A consulta por código de barras informa corretamente quando está offline.
- Atualizações do app não apagam o histórico local.

## Decisões deixadas para implementação

- Valores exatos dos limites de porção e pesos da função de pontuação serão calibrados com exemplos do catálogo, mantendo as regras acima.
- Ícones PWA seguirão a identidade atual “M” em verde.
- A lista inicial de alergênicos poderá ser ampliada sem alterar o formato do estado.

