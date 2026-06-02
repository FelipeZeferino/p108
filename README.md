# Calculadora de Filas

Projeto simples em HTML, CSS e JavaScript para calcular indicadores básicos de Teoria das Filas.

## Sobre o projeto

A aplicação possui uma interface com abas para oito modelos de filas:

- **M/M/1**: sistema com uma fila, um servidor, chegadas Poisson e tempo de serviço exponencial.
- **M/M/s**: sistema com uma fila e múltiplos servidores.
- **M/G/1**: sistema com um servidor e distribuição geral de atendimento, usando média e variância do tempo de serviço.
- **Prioridades**: sistema com múltiplas classes de prioridade sem interrupção do atendimento em andamento.
- **M/M/1/K**: sistema com um servidor e capacidade total limitada a `K` clientes.
- **M/M/s/K**: sistema com múltiplos servidores e capacidade total limitada a `K` clientes.
- **M/M/1/N**: sistema fechado com um servidor e população finita `N`.
- **M/M/s/N**: sistema fechado com múltiplos servidores e população finita `N`.

Os cálculos são feitos diretamente no navegador, sem necessidade de servidor ou instalação de dependências.

## Funcionalidades

- Cálculo do fator de utilização do sistema.
- Cálculo de métricas como `L`, `Lq`, `W` e `Wq`.
- Cálculo de `P0`, `P(ocupado)`, `P(W > t)` e `P(Wq > t)` no modelo `M/M/1`.
- Cálculo da taxa de chegada necessária para atingir um `W` alvo no modelo `M/M/1`.
- Cálculo do modelo `M/G/1` pela fórmula de Pollaczek-Khintchine, incluindo casos com atendimento exponencial ou constante.
- Cálculo de filas com prioridades sem interrupção, exibindo métricas globais e resultados por classe.
- Cálculo de bloqueio, taxa efetiva de entrada e distribuição `P0...PK` no modelo `M/M/1/K`.
- Cálculo de bloqueio, taxa efetiva de entrada e distribuição `P0...PK` no modelo `M/M/s/K`.
- Cálculo de população finita, taxa efetiva dependente de `N - L` e distribuição `P0...PN` no modelo `M/M/1/N`.
- Cálculo de população finita com múltiplos servidores, incluindo ocupação média por servidor e probabilidade de haver algum servidor ocioso no modelo `M/M/s/N`.
- Tooltips explicando o significado de cada resultado ao passar o mouse sobre o ícone `?`.
- Testes automatizados para validar as fórmulas principais.
- Validação básica para identificar sistemas instáveis.
- Alternância entre os modelos por abas.

## Como usar

1. Abra o arquivo `index.html` em qualquer navegador.
2. Escolha o modelo desejado: `M/M/1`, `M/M/s`, `M/G/1`, `Prioridades`, `M/M/1/K`, `M/M/s/K`, `M/M/1/N` ou `M/M/s/N`.
3. Informe os valores solicitados:
   - `λ`: taxa de chegada.
   - `μ`: taxa de serviço.
   - `σ²`: variância do tempo de atendimento, usada no modelo `M/G/1`.
   - `t`: tempo usado para calcular as probabilidades `P(W > t)` e `P(Wq > t)`.
   - `W alvo`: tempo médio desejado no sistema para calcular a taxa de chegada correspondente.
   - `k`: número de classes de prioridade.
   - `λ1...λk`: taxas de chegada de cada classe de prioridade.
   - `s`: número de servidores, usado nos modelos `M/M/s`, `Prioridades`, `M/M/s/K` e `M/M/s/N`.
   - `K`: capacidade total do sistema, usado nos modelos `M/M/1/K` e `M/M/s/K`.
   - `N`: população total possível, usado nos modelos `M/M/1/N` e `M/M/s/N`.
4. Clique em **Calcular** para visualizar os resultados.

Use a aba **M/G/1** quando o atendimento não for necessariamente exponencial, mas a média e a variância do tempo de atendimento forem conhecidas.

Use a aba **Prioridades** quando houver classes com ordem de atendimento diferente e o atendimento em andamento não puder ser interrompido.

Use a aba **M/M/1/K** quando o sistema tiver uma capacidade máxima e novas chegadas forem bloqueadas se o sistema estiver cheio.

Use a aba **M/M/s/K** quando houver múltiplos servidores, capacidade máxima no sistema e bloqueio de chegadas quando o sistema atingir `K`.

Use a aba **M/M/1/N** quando existir uma população total fixa, como máquinas ou robôs que quebram, aguardam reparo e voltam a operar. Nesse modelo, a taxa efetiva de chegada depende de quantos clientes ainda estão fora do sistema.

Use a aba **M/M/s/N** quando esse sistema fechado tiver múltiplos servidores, como vários técnicos reparando máquinas. Nessa aba, `P(algum servidor ocioso)` indica a probabilidade de haver pelo menos um servidor livre, enquanto `ociosidade média por servidor` é a fração média de tempo ociosa de cada servidor.

## Como testar

Para rodar os testes automatizados das fórmulas:

```bash
npm test
```

Os testes usam o runner nativo do Node.js e não precisam de bibliotecas externas.

## Métricas exibidas

- `ρ`: taxa de utilização do sistema.
- `L`: número médio de clientes no sistema.
- `Lq`: número médio de clientes na fila.
- `W`: tempo médio no sistema.
- `Wq`: tempo médio na fila.
- `P0`: probabilidade de o sistema estar vazio.
- `P(ocupado)`: probabilidade de o servidor estar ocupado.
- `P(W > t)`: probabilidade de o tempo total no sistema ser maior que `t`.
- `P(Wq > t)`: probabilidade de o tempo de espera na fila ser maior que `t`.
- `λ para W alvo`: taxa de chegada que faria o sistema atingir o tempo médio informado em `W alvo`.
- `λ total`: soma das taxas de chegada das classes de prioridade.
- `W1...Wk`, `Wq1...Wqk`, `L1...Lk`, `Lq1...Lqk`: métricas por classe no modelo com prioridades.
- `PK / bloqueio`: probabilidade de o sistema estar cheio e bloquear uma nova chegada.
- `λ efetiva`: taxa real de entrada no sistema após descontar as chegadas bloqueadas.
- `P0...PK`: distribuição de probabilidade para cada quantidade possível de clientes no sistema.
- `N - L / operacionais`: número médio de clientes fora do sistema em modelos de população finita.
- `P0...PN`: distribuição de probabilidade para cada quantidade possível de clientes no sistema fechado.
- `ocupação média por servidor`: fração média de tempo ocupada por cada servidor.
- `ociosidade média por servidor`: fração média de tempo ociosa por servidor.
- `P(algum servidor ocioso)`: probabilidade de haver pelo menos um servidor livre.

## Estrutura

```text
.
├── calculos.js
├── index.html
├── package.json
├── AGENTS.md
├── test
│   └── calculos.test.js
└── README.md
```

## Observações

O modelo `M/M/s` considera uma implementação simplificada das fórmulas de filas com múltiplos servidores. Para resultados válidos, a taxa de utilização deve ser menor que 1. O modelo `M/G/1` também exige `ρ < 1`. No modelo de prioridades, a classe 1 tem a maior prioridade e o atendimento em andamento não é interrompido. Nos modelos com capacidade limitada, `K` representa a capacidade total do sistema, incluindo clientes em atendimento e clientes na fila. Nos modelos com população finita, `N` representa a população total possível e a taxa efetiva é calculada por `λ(N - L)`.
