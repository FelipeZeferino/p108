# Guia para Agentes

Este projeto é uma calculadora simples de Teoria das Filas feita com HTML, CSS e JavaScript puro. O objetivo principal é permitir que os modelos vistos em aula sejam calculados no navegador e validados por testes automatizados, evitando surpresas ao usar o programa em sala.

## Visão geral

A aplicação possui seis abas:

- `M/M/1`: uma fila, um servidor, capacidade infinita.
- `M/M/s`: uma fila, múltiplos servidores, capacidade infinita.
- `M/M/1/K`: um servidor, capacidade total limitada a `K`.
- `M/M/s/K`: múltiplos servidores, capacidade total limitada a `K`.
- `M/M/1/N`: um servidor, população finita e sistema fechado.
- `M/M/s/N`: múltiplos servidores, população finita e sistema fechado.

O projeto não usa framework frontend nem biblioteca de testes externa. Os cálculos rodam direto no navegador e os testes usam o runner nativo do Node.js.

## Arquitetura

```text
.
├── calculos.js
├── index.html
├── package.json
├── README.md
├── AGENTS.md
└── test
    └── calculos.test.js
```

## Funções de cálculo

O arquivo `calculos.js` concentra a regra de negócio. As funções devem ser puras: recebem números, validam as entradas, calculam os indicadores e retornam um objeto com os resultados. Elas não devem acessar DOM, formatar HTML, ler inputs ou escrever na tela.

Funções atuais:

- `calcularMM1Valores(lambda, mu, tempo, wAlvo)`
- `calcularMMSValores(lambda, mu, s)`
- `calcularMM1KValores(lambda, mu, K)`
- `calcularMMSKValores(lambda, mu, s, K)`
- `calcularMM1PopulacaoFinitaValores(lambda, mu, N)`
- `calcularMMSPopulacaoFinitaValores(lambda, mu, s, N)`
- `fatorial(n)`

Cada função deve validar suas próprias entradas e lançar `Error` com mensagem clara quando o valor não puder ser calculado. A interface captura esse erro e mostra a mensagem ao usuário.

Convenções importantes:

- Use `lambda` para `λ` e `mu` para `μ`.
- Use `rho` para `ρ`.
- Use `P0`, `PK`, `L`, `Lq`, `W`, `Wq` nos retornos.
- Em modelos com capacidade limitada, retorne também `probabilidades`, `lambdaEfetiva` e `PK`.
- Em modelos de população finita, calcule `lambdaEfetiva` com `λ * (N - L)` e retorne `clientesFora`.
- Em `M/M/1/N`, retorne `probOcioso` e `probOcupado`.
- Em `M/M/s/N`, retorne `ocupacaoMediaServidor`, `ociosidadeMediaServidor` e `probAlgumServidorOcioso`.
- Para comparar casos especiais com número decimal, use tolerância pequena, como `1e-12`.
- Para `s`, `K` e `N`, valide com `Number.isInteger`; a interface deve passar `Number(...)`, não `parseInt(...)`, para não truncar valores decimais inválidos.

## Frontend

O arquivo `index.html` contém a estrutura visual, o CSS e o JavaScript da interface. A interface deve ficar fina: ela lê os campos, chama uma função de `calculos.js`, formata os resultados e renderiza o HTML.

Padrão esperado para uma aba:

1. Criar a seção HTML com inputs.
2. Adicionar uma aba no bloco `.tabs`.
3. Criar uma função `calcular...()` no script inline.
4. Ler os campos com `parseFloat` para taxas e tempos.
5. Ler campos inteiros com `Number(...)`.
6. Chamar a função pura correspondente em `CalculosFilas`.
7. Renderizar resultados com `criarLinhaResultado`.
8. Exibir erros com `resultado.innerText = erro.message`.

Resultados com significado para o usuário devem ter tooltip. Use tooltip curto, explicando o que a métrica representa, sem repetir fórmulas longas.

Para modelos com distribuição de estados `P0...PK`, reutilize `criarLinhasProbabilidades(probabilidades)`.
Para modelos de população finita, a mesma função pode ser reutilizada para exibir `P0...PN`.

## Testes

Os testes ficam em `test/calculos.test.js` e importam as funções diretamente de `calculos.js` via CommonJS. Isso é intencional: os testes validam a regra de negócio sem depender do navegador.

Para rodar:

```bash
npm test
```

Ao adicionar ou alterar um modelo:

- Adicione testes com exemplos conhecidos de aula, PDF ou slide.
- Use o helper `pertoDe(valor, esperado, tolerancia)` para comparar números decimais.
- Teste também entradas inválidas.
- Quando houver divergência pequena por arredondamento de slide, mantenha tolerância explícita.
- Não teste apenas valores formatados; teste os valores numéricos retornados pela função.

## Fluxo recomendado para novas features

1. Implementar a função pura em `calculos.js`.
2. Exportar a função no objeto `api`.
3. Adicionar testes automatizados em `test/calculos.test.js`.
4. Rodar `npm test`.
5. Criar ou ajustar a aba em `index.html`.
6. Atualizar `README.md` se o comportamento mudar para o usuário.
7. Fazer um teste manual no navegador com pelo menos um exemplo conhecido.

## Cuidados

- Não misture cálculo matemático com DOM.
- Não use `parseInt` em campos como `s`, `K` ou `N`; isso esconderia erros como `2.5`.
- Não altere fórmulas existentes sem atualizar os testes correspondentes.
- Mantenha os nomes dos retornos estáveis, pois a interface depende deles.
- Os modelos `M/M/1` e `M/M/s` de capacidade infinita devem bloquear sistemas instáveis.
- Nos modelos com capacidade limitada, `K` é a capacidade total do sistema, incluindo clientes em atendimento e clientes aguardando.
- Nos modelos `M/M/1/N` e `M/M/s/N`, `N` é a população total possível, incluindo clientes no sistema e clientes fora dele.
- Em `M/M/s/N`, não confunda `ociosidadeMediaServidor` com `probAlgumServidorOcioso`; o valor `0,9279` do slide dos robôs corresponde a `P(n < s)`, isto é, probabilidade de existir pelo menos um servidor ocioso.
