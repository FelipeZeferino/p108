const test = require("node:test");
const assert = require("node:assert/strict");

const {
  calcularMG1Valores,
  calcularMM1Valores,
  calcularMM1KValores,
  calcularMM1PopulacaoFinitaValores,
  calcularMMSPopulacaoFinitaValores,
  calcularMMSKValores,
  calcularMMSValores,
  calcularPrioridadesComInterrupcao,
  calcularPrioridadesSemInterrupcao,
  combinacao,
  fatorial
} = require("../calculos.js");

function pertoDe(valor, esperado, tolerancia = 1e-10) {
  assert.ok(
    Math.abs(valor - esperado) <= tolerancia,
    `esperado ${valor} perto de ${esperado}`
  );
}

// Erlang C — P(Wq > 0) em M/M/s, derivado de (λ, μ, s) e do P0 da funcao pura.
// Usado nos itens de cauda de espera que a funcao M/M/s nao retorna.
function probEspera(lambda, mu, s, P0) {
  const a = lambda / mu;
  const rho = lambda / (s * mu);
  return (Math.pow(a, s) / (fatorial(s) * (1 - rho))) * P0;
}

// P(N <= k) em M/M/s, somando as probabilidades de estado a partir do P0.
function probSistemaAte(lambda, mu, s, P0, k) {
  const a = lambda / mu;
  let soma = 0;
  for (let n = 0; n <= k; n++) {
    const Pn = n < s
      ? P0 * Math.pow(a, n) / fatorial(n)
      : P0 * Math.pow(a, n) / (fatorial(s) * Math.pow(s, n - s));
    soma += Pn;
  }
  return soma;
}

test("calcula o exemplo da barbearia em M/M/1", () => {
  const resultado = calcularMM1Valores(3, 4, 1, 1.25);

  pertoDe(resultado.rho, 0.75);
  pertoDe(resultado.P0, 0.25);
  pertoDe(resultado.POcupado, 0.75);
  pertoDe(resultado.L, 3);
  pertoDe(resultado.Lq, 2.25);
  pertoDe(resultado.W, 1);
  pertoDe(resultado.Wq, 0.75);
  pertoDe(resultado.probWMaiorQueT, Math.exp(-1));
  pertoDe(resultado.probWqMaiorQueT, 0.75 * Math.exp(-1));
  pertoDe(resultado.lambdaParaWAlvo, 3.2);
});

test("calcula o exemplo dos motores usando taxas por dia", () => {
  const lambda = 11 / 30;
  const mu = 12.5 / 30;
  const resultado = calcularMM1Valores(lambda, mu, 1, 1.25);

  pertoDe(resultado.rho, 0.88);
  pertoDe(resultado.P0, 0.12);
  pertoDe(resultado.POcupado, 0.88);
  pertoDe(resultado.L, 7.333333333333333);
  pertoDe(resultado.Lq, 6.453333333333332);
  pertoDe(resultado.W, 20);
  pertoDe(resultado.Wq, 17.6);
  pertoDe(resultado.probWMaiorQueT, Math.exp(-0.05));
  pertoDe(resultado.probWqMaiorQueT, 0.88 * Math.exp(-0.05));
});

test("calcula M/M/s para dois servidores", () => {
  const resultado = calcularMMSValores(3, 4, 2, 1);

  pertoDe(resultado.rho, 0.375);
  pertoDe(resultado.P0, 0.45454545454545453);
  pertoDe(resultado.Lq, 0.12272727272727273);
  pertoDe(resultado.Wq, 0.04090909090909091);
  pertoDe(resultado.W, 0.2909090909090909);
  pertoDe(resultado.L, 0.8727272727272727);
  pertoDe(resultado.probEsperar, 0.20454545454545453);
  pertoDe(resultado.probWMaiorQueT, 0.02778829588935585);
  pertoDe(resultado.probWqMaiorQueT, 0.0013782164316311183);
});

test("calcula M/G/1 equivalente a M/M/1 no exemplo do lava-rapido", () => {
  const resultado = calcularMG1Valores(4, 6, 1 / 36);

  pertoDe(resultado.rho, 0.6666666666666666);
  pertoDe(resultado.P0, 0.33333333333333337);
  pertoDe(resultado.Lq, 1.3333, 1e-4);
  pertoDe(resultado.L, 2, 1e-10);
  pertoDe(resultado.Wq, 0.3333, 1e-4);
  pertoDe(resultado.W, 0.5, 1e-10);
});

test("calcula M/G/1 com atendimento constante no exemplo do lava-rapido", () => {
  const resultadoExponencial = calcularMG1Valores(4, 6, 1 / 36);
  const resultadoConstante = calcularMG1Valores(4, 6, 0);

  pertoDe(resultadoConstante.Lq, 0.6667, 1e-4);
  pertoDe(resultadoConstante.L, 1.3333, 1e-4);
  pertoDe(resultadoConstante.Wq, 0.1667, 1e-4);
  pertoDe(resultadoConstante.W, 0.3333, 1e-4);
  pertoDe(resultadoConstante.Lq / resultadoExponencial.Lq, 0.5, 1e-12);
});

// ---------------------------------------------------------------------------
// Lista de exercícios Modelo M/G/1 e com prioridades (PDF enviado).
// ---------------------------------------------------------------------------

test("PDF M/G/1 e prioridades - Ex 1: variacao de sigma com lambda 0,2 e mu 0,25", () => {
  // Enunciado dá sigma (desvio padrao); a funcao recebe sigma² (variancia).
  const gabarito = {
    4: { Lq: 3.2, L: 4.0, Wq: 16.0, W: 20.0 },
    3: { Lq: 2.5, L: 3.3, Wq: 12.5, W: 16.5 },
    2: { Lq: 2.0, L: 2.8, Wq: 10.0, W: 14.0 },
    1: { Lq: 1.7, L: 2.5, Wq: 8.5, W: 12.5 },
    0: { Lq: 1.6, L: 2.4, Wq: 8.0, W: 12.0 }
  };

  for (const [sigma, esperado] of Object.entries(gabarito)) {
    const resultado = calcularMG1Valores(0.2, 0.25, Number(sigma) ** 2);

    pertoDe(resultado.Lq, esperado.Lq, 1e-9);
    pertoDe(resultado.L, esperado.L, 1e-9);
    pertoDe(resultado.Wq, esperado.Wq, 1e-9);
    pertoDe(resultado.W, esperado.W, 1e-9);
  }

  // b) razao entre Lq(sigma=0) e Lq(sigma=4)
  const LqSigma4 = calcularMG1Valores(0.2, 0.25, 16).Lq;
  const LqSigma0 = calcularMG1Valores(0.2, 0.25, 0).Lq;
  pertoDe(LqSigma0 / LqSigma4, 0.5, 1e-12);

  // c) a maior reducao de Lq ocorre de sigma=4 para sigma=3 (0,7),
  //    e a menor de sigma=1 para sigma=0 (0,1)
  pertoDe(gabarito[4].Lq - gabarito[3].Lq, 0.7, 1e-9);
  pertoDe(gabarito[1].Lq - gabarito[0].Lq, 0.1, 1e-9);

  // d) com sigma=4, aumentar mu em ~0,05 (de 0,25 para 0,30) aproxima Lq do
  //    valor que se teria com mu=0,25 e sigma=0 (Lq=1,6)
  const LqMuAumentado = calcularMG1Valores(0.2, 0.3, 16).Lq;
  pertoDe(LqMuAumentado, 1.6, 5e-2);
});

test("PDF M/G/1 e prioridades - Ex 2: armazem de caminhoes com atendimento constante", () => {
  // λ = 3 caminhoes/h; atendimento medio de 15 min -> μ = 4/h.
  // O gabarito usa tempo de atendimento CONSTANTE (M/D/1 = M/G/1 com σ²=0).
  const resultado = calcularMG1Valores(3, 4, 0);

  pertoDe(resultado.Lq, 1.125, 1e-9); // a) caminhoes na fila
  pertoDe(resultado.L, 1.875, 1e-9); // b) caminhoes no sistema
  pertoDe(resultado.Wq, 0.375, 1e-9); // c) espera media na fila (h)
  pertoDe(resultado.W, 0.625, 1e-9); // d) espera media no sistema (h)
  pertoDe(resultado.rho, 0.75, 1e-9); // e) taxa de ocupacao = 75%
});

test("PDF M/G/1 e prioridades - Ex 3: M/M/1 a partir de Lq medido = 2", () => {
  // Dados: λ = 3/h e Lq = 2. Resolvendo ρ²/(1 - ρ) = 2 -> ρ = √3 - 1,
  // logo μ = λ/ρ. A funcao recebe (λ, μ), entao derivamos μ a partir do Lq.
  const lambda = 3;
  const rho = Math.sqrt(3) - 1;
  const mu = lambda / rho;
  const resultado = calcularMM1Valores(lambda, mu, 1, 1);

  pertoDe(resultado.Lq, 2, 1e-9); // confirma que o μ derivado reproduz o Lq medido
  pertoDe(resultado.Wq, 0.667, 1e-3); // b) gabarito 0,667 -> confere

  // a) e c): software e teoria dao 2,732 e 0,911, divergindo do gabarito
  // (2,830 e 0,943). O gabarito e inconsistente com o proprio dado Lq = 2:
  // seus valores de L e W exigiriam ρ ≈ 0,739, mas Lq = 2 exige ρ = 0,732.
  pertoDe(resultado.L, 2.7320508, 1e-6); // a) gabarito 2,830 -> NAO confere (gabarito errado)
  pertoDe(resultado.W, 0.9106836, 1e-6); // c) gabarito 0,943 -> NAO confere (gabarito errado)
});

test("bloqueia entradas invalidas em M/G/1", () => {
  assert.throws(() => calcularMG1Valores(6, 6, 0), /Sistema instável/);
  assert.throws(() => calcularMG1Valores(4, 6, -0.01), /σ²/);
});

test("calcula prioridades sem interrupcao no hospital com um servidor", () => {
  const resultado = calcularPrioridadesSemInterrupcao([0.2, 0.6, 1.2], 3, 1);

  pertoDe(resultado.rho, 0.6666666666666666);
  pertoDe(resultado.lambdaTotal, 2);
  pertoDe(resultado.classes[0].W, 0.5714, 1e-3);
  pertoDe(resultado.classes[0].Wq, 0.2381, 1e-3);
  pertoDe(resultado.classes[0].L, 0.1143, 1e-3);
  pertoDe(resultado.classes[0].Lq, 0.0476, 1e-3);
  pertoDe(resultado.classes[1].W, 0.6580, 1e-3);
  pertoDe(resultado.classes[1].Wq, 0.3247, 1e-3);
  pertoDe(resultado.classes[1].L, 0.3948, 1e-3);
  pertoDe(resultado.classes[1].Lq, 0.1948, 1e-3);
  pertoDe(resultado.classes[2].W, 1.2424, 1e-3);
  pertoDe(resultado.classes[2].Wq, 0.9091, 1e-3);
  pertoDe(resultado.classes[2].L, 1.4909, 1e-3);
  pertoDe(resultado.classes[2].Lq, 1.0909, 1e-3);
});

test("calcula prioridades sem interrupcao no hospital com dois servidores", () => {
  const resultado = calcularPrioridadesSemInterrupcao([0.2, 0.6, 1.2], 3, 2);

  pertoDe(resultado.classes[0].W, 0.3621, 1e-3);
  pertoDe(resultado.classes[2].Lq, 0.0577, 1e-3);
});

test("calcula prioridades sem interrupcao no exemplo da delegacia", () => {
  const resultado = calcularPrioridadesSemInterrupcao([10, 20], 7.5, 5);

  pertoDe(resultado.classes[0].Wq, 0.0201, 1e-3);
  pertoDe(resultado.classes[1].Wq, 0.1007, 1e-3);
});

test("calcula prioridades com interrupcao no hospital com um servidor", () => {
  const resultado = calcularPrioridadesComInterrupcao([0.2, 0.6, 1.2], 3, 1);

  pertoDe(resultado.rho, 0.6666666666666666);
  pertoDe(resultado.P0, 0.33333333333333337);
  pertoDe(resultado.lambdaTotal, 2);
  pertoDe(resultado.classes[0].W, 0.35714285714285715);
  pertoDe(resultado.classes[0].Wq, 0.023809523809523836);
  pertoDe(resultado.classes[0].L, 0.07142857142857144);
  pertoDe(resultado.classes[0].Lq, 0.004761904761904768);
  pertoDe(resultado.classes[1].W, 0.487012987012987);
  pertoDe(resultado.classes[1].Wq, 0.15367965367965368);
  pertoDe(resultado.classes[1].L, 0.2922077922077922);
  pertoDe(resultado.classes[1].Lq, 0.0922077922077922);
  pertoDe(resultado.classes[2].W, 1.3636363636363633);
  pertoDe(resultado.classes[2].Wq, 1.03030303030303);
  pertoDe(resultado.classes[2].L, 1.636363636363636);
  pertoDe(resultado.classes[2].Lq, 1.236363636363636);
});

test("calcula prioridades com interrupcao usando multiplos servidores", () => {
  const resultado = calcularPrioridadesComInterrupcao([0.2, 0.6, 1.2], 3, 2);

  pertoDe(resultado.rho, 0.3333333333333333);
  pertoDe(resultado.P0, 0.5);
  pertoDe(resultado.lambdaTotal, 2);
  pertoDe(resultado.classes[0].W, 0.3448275862068966);
  pertoDe(resultado.classes[0].Wq, 0.01149425287356326);
  pertoDe(resultado.classes[0].L, 0.06896551724137932);
  pertoDe(resultado.classes[0].Lq, 0.002298850574712652);
  pertoDe(resultado.classes[1].W, 0.39787798408488056);
  pertoDe(resultado.classes[1].Wq, 0.06454465075154725);
  pertoDe(resultado.classes[1].L, 0.23872679045092832);
  pertoDe(resultado.classes[1].Lq, 0.03872679045092835);
  pertoDe(resultado.classes[2].W, 0.5769230769230769);
  pertoDe(resultado.classes[2].Wq, 0.24358974358974356);
  pertoDe(resultado.classes[2].L, 0.6923076923076922);
  pertoDe(resultado.classes[2].Lq, 0.29230769230769227);
});

test("bloqueia entradas invalidas em prioridades sem interrupcao", () => {
  assert.throws(() => calcularPrioridadesSemInterrupcao([1], 3, 1), /pelo menos 2/);
  assert.throws(() => calcularPrioridadesSemInterrupcao([1, 2], 3, 1.5), /s/);
  assert.throws(() => calcularPrioridadesSemInterrupcao([2, 2], 3, 1), /Sistema instável/);
});

test("bloqueia entradas invalidas em prioridades com interrupcao", () => {
  assert.throws(() => calcularPrioridadesComInterrupcao([1], 3, 1), /pelo menos 2/);
  assert.throws(() => calcularPrioridadesComInterrupcao([1, 2], 0, 1), /μ/);
  assert.throws(() => calcularPrioridadesComInterrupcao([1, 2], 3, 1.5), /s/);
  assert.throws(() => calcularPrioridadesComInterrupcao([2, 2], 3, 1), /Sistema instável/);
});

test("PDF M/G/1 e prioridades - Ex 4: Southeast Airlines sem interrupcao", () => {
  // λ1=2, λ2=10 por hora; atendimento medio 3 min -> μ=20/h; s=1.
  const resultado = calcularPrioridadesSemInterrupcao([2, 10], 20, 1);

  // 1a classe (primeira classe)
  pertoDe(resultado.classes[0].Lq, 0.0667, 1e-3);
  pertoDe(resultado.classes[0].L, 0.1667, 1e-3);
  pertoDe(resultado.classes[0].Wq, 0.0333, 1e-3);
  pertoDe(resultado.classes[0].W, 0.0833, 1e-3);

  // 2a classe (economica)
  pertoDe(resultado.classes[1].L, 1.3333, 1e-3);
  pertoDe(resultado.classes[1].Wq, 0.0833, 1e-3);
  pertoDe(resultado.classes[1].W, 0.1333, 1e-3);
  // Lq2 = λ2*Wq2 = 10*0,0833 = 0,833. O gabarito traz 0,083 (erro de digitacao).
  pertoDe(resultado.classes[1].Lq, 0.8333, 1e-3);

  // c) Wq(1a) / Wq(2a) = 0,4
  pertoDe(resultado.classes[0].Wq / resultado.classes[1].Wq, 0.4, 1e-3);
  // d) horas ocupado por dia = ρ * 12h = 7,2
  pertoDe(resultado.rho * 12, 7.2, 1e-9);
});

test("PDF M/G/1 e prioridades - Ex 5: um atendente rapido vs dois lentos", () => {
  const umRapido = calcularPrioridadesSemInterrupcao([2, 3], 6, 1); // alt 1: μ=6, s=1
  const doisLentos = calcularPrioridadesSemInterrupcao([2, 3], 3, 2); // alt 2: μ=3, s=2

  // Alternativa 1 (s=1, μ=6)
  pertoDe(umRapido.classes[0].Wq, 0.2083, 1e-3);
  pertoDe(umRapido.classes[0].W, 0.375, 1e-3);
  // Gabarito rotula 1a classe como "Lq=0,75; L=0,167". O correto e o inverso:
  // L1 = λ1*W1 = 0,75 e Lq1 = λ1*Wq1 = 0,417 (gabarito mislabel + valor incorreto).
  pertoDe(umRapido.classes[0].L, 0.75, 1e-3);
  pertoDe(umRapido.classes[0].Lq, 0.4167, 1e-3);
  pertoDe(umRapido.classes[1].Lq, 3.75, 1e-3);
  pertoDe(umRapido.classes[1].L, 4.25, 1e-3);
  pertoDe(umRapido.classes[1].Wq, 1.25, 1e-3);
  pertoDe(umRapido.classes[1].W, 1.4167, 1e-3);

  // Alternativa 2 (s=2, μ=3)
  pertoDe(doisLentos.classes[0].Lq, 0.3788, 1e-3);
  pertoDe(doisLentos.classes[0].L, 1.0455, 1e-3);
  pertoDe(doisLentos.classes[0].Wq, 0.1894, 1e-3);
  pertoDe(doisLentos.classes[0].W, 0.5227, 1e-3);
  pertoDe(doisLentos.classes[1].Lq, 3.4091, 1e-3);
  pertoDe(doisLentos.classes[1].L, 4.4091, 1e-3);
  pertoDe(doisLentos.classes[1].Wq, 1.1364, 1e-3);
  pertoDe(doisLentos.classes[1].W, 1.4697, 1e-3);

  // Preocupacao com W1: 1 servidor e melhor (0,375 < 0,523)
  assert.ok(umRapido.classes[0].W < doisLentos.classes[0].W);
  // Preocupacao com a espera na fila da classe 1: 2 servidores e melhor (0,189 < 0,208)
  assert.ok(doisLentos.classes[0].Wq < umRapido.classes[0].Wq);
});

test("PDF M/G/1 e prioridades - Ex 6: disciplinas de fila na ferramentaria", () => {
  // λtotal=8/dia, atendimento 0,1 dia -> μ=10/dia; tipos λ=[2,4,2].
  // a) FCFS: W igual para todos = 1/(μ-λ) = 0,5
  pertoDe(calcularMM1Valores(8, 10, 1, 1).W, 0.5, 1e-9);

  // b) prioridade sem interrupcao
  const semInterrupcao = calcularPrioridadesSemInterrupcao([2, 4, 2], 10, 1);
  pertoDe(semInterrupcao.classes[0].W, 0.2, 1e-9);
  pertoDe(semInterrupcao.classes[1].W, 0.35, 1e-9);
  pertoDe(semInterrupcao.classes[2].W, 1.1, 1e-9);

  // c) prioridade com interrupcao
  const comInterrupcao = calcularPrioridadesComInterrupcao([2, 4, 2], 10, 1);
  pertoDe(comInterrupcao.classes[0].W, 0.125, 1e-9);
  pertoDe(comInterrupcao.classes[1].W, 0.3125, 1e-9);
  pertoDe(comInterrupcao.classes[2].W, 1.25, 1e-9);
});

test("PDF M/G/1 e prioridades - Ex 7: sala de emergencia com novas porcentagens", () => {
  // λtotal=2, μ=3; 5%/20%/75% -> λ=[0,1, 0,4, 1,5].
  const lambdas = [0.1, 0.4, 1.5];

  // Sem interrupcao, s=1
  const semS1 = calcularPrioridadesSemInterrupcao(lambdas, 3, 1);
  pertoDe(semS1.classes[0].Wq, 0.230, 1e-3);
  pertoDe(semS1.classes[1].Wq, 0.276, 1e-3);
  pertoDe(semS1.classes[2].Wq, 0.800, 1e-3);

  // Sem interrupcao, s=2
  const semS2 = calcularPrioridadesSemInterrupcao(lambdas, 3, 2);
  pertoDe(semS2.classes[0].Wq, 0.028, 1e-3);
  pertoDe(semS2.classes[1].Wq, 0.031, 1e-3);
  pertoDe(semS2.classes[2].Wq, 0.045, 1e-3);

  // Com interrupcao, s=1
  const comS1 = calcularPrioridadesComInterrupcao(lambdas, 3, 1);
  pertoDe(comS1.classes[0].Wq, 0.011, 1e-3);
  pertoDe(comS1.classes[1].Wq, 0.080, 1e-3);
  pertoDe(comS1.classes[2].Wq, 0.867, 1e-3);

  // Com interrupcao, s=2
  const comS2 = calcularPrioridadesComInterrupcao(lambdas, 3, 2);
  pertoDe(comS2.classes[0].Wq, 0.0056497175, 1e-10);
  pertoDe(comS2.classes[1].Wq, 0.0364663585, 1e-10);
  pertoDe(comS2.classes[2].Wq, 0.2121212121, 1e-10);
});

test("calcula o exemplo 1 do slide em M/M/1/K", () => {
  const resultado = calcularMM1KValores(0.3, 0.5, 2);

  pertoDe(resultado.rho, 0.6);
  pertoDe(resultado.P0, 0.5102040816, 1e-10);
  pertoDe(resultado.probabilidades[0], 0.5102040816, 1e-10);
  pertoDe(resultado.probabilidades[1], 0.3061224490, 1e-10);
  pertoDe(resultado.probabilidades[2], 0.1836734694, 1e-10);
  pertoDe(resultado.PK, 0.1836734694, 1e-10);
  pertoDe(resultado.lambdaEfetiva, 0.24489795918, 1e-10);
  pertoDe(resultado.L, 0.6734693878, 1e-10);
  pertoDe(resultado.Lq, 0.1836734694, 1e-10);
  pertoDe(resultado.W, 2.75);
  pertoDe(resultado.Wq, 0.75);
});

test("calcula o exemplo 2 do slide em M/M/1/K", () => {
  const resultado = calcularMM1KValores(3, 4, 5);

  pertoDe(resultado.rho, 0.75);
  pertoDe(resultado.P0, 0.3041, 5e-5);
  pertoDe(resultado.probabilidades[4], 0.09623, 5e-5);
  pertoDe(resultado.PK, 0.07217107217107216);
  pertoDe(resultado.lambdaEfetiva, 2.7834867834867834);
  pertoDe(resultado.L, 1.7009, 5e-5);
  pertoDe(resultado.Lq, 1.005, 5e-4);
  pertoDe(resultado.W, 0.6111, 5e-5);
  pertoDe(resultado.Wq, 0.3611, 5e-5);
});

test("calcula M/M/1/K no caso especial rho igual a 1", () => {
  const resultado = calcularMM1KValores(2, 2, 3);

  pertoDe(resultado.rho, 1);
  pertoDe(resultado.P0, 0.25);
  assert.deepEqual(resultado.probabilidades, [0.25, 0.25, 0.25, 0.25]);
  pertoDe(resultado.PK, 0.25);
  pertoDe(resultado.lambdaEfetiva, 1.5);
  pertoDe(resultado.L, 1.5);
  pertoDe(resultado.Lq, 0.75);
  pertoDe(resultado.W, 1);
  pertoDe(resultado.Wq, 0.5);
});

test("calcula o exemplo 1 do slide em M/M/s/K com um atendente", () => {
  const resultado = calcularMMSKValores(5, 7, 1, 5);

  pertoDe(resultado.rho, 0.7142857142857143);
  pertoDe(resultado.P0, 0.3294714969, 1e-10);
  pertoDe(resultado.probabilidades[5], 0.0612600957, 1e-10);
  pertoDe(resultado.PK, 0.0612600957, 1e-10);
  pertoDe(resultado.lambdaEfetiva, 4.6936995217, 1e-10);
  pertoDe(resultado.L, 1.5810985650, 1e-10);
  pertoDe(resultado.Lq, 0.9105700619, 1e-10);
  pertoDe(resultado.W, 0.3368555140, 1e-10);
  pertoDe(resultado.Wq, 0.1939983712, 1e-10);
});

test("calcula o exemplo 1 do slide em M/M/s/K com dois atendentes", () => {
  const resultado = calcularMMSKValores(5, 7, 2, 5);

  pertoDe(resultado.rho, 0.35714285714285715);
  pertoDe(resultado.P0, 0.4751372430, 1e-10);
  pertoDe(resultado.probabilidades[5], 0.0055215233, 1e-10);
  pertoDe(resultado.PK, 0.0055215233, 1e-10);
  pertoDe(resultado.lambdaEfetiva, 4.9723923833, 1e-10);
  pertoDe(resultado.L, 0.8011156127, 1e-10);
  pertoDe(resultado.Lq, 0.0907738437, 1e-10);
  pertoDe(resultado.W, 0.1611127101, 1e-10);
  pertoDe(resultado.Wq, 0.0182555673, 1e-10);
});

test("calcula o exemplo 2 do slide em M/M/s/K", () => {
  const resultado = calcularMMSKValores(1, 1 / 6, 3, 7);
  const bloqueadosPorHora = 1 * resultado.PK * 60;

  pertoDe(resultado.rho, 2);
  pertoDe(resultado.P0, 0.00088, 5e-6);
  pertoDe(resultado.PK, 0.5048203330, 1e-10);
  pertoDe(resultado.lambdaEfetiva, 0.4951796670, 1e-10);
  pertoDe(resultado.L, 6.0631, 5e-5);
  pertoDe(resultado.Lq, 3.0920, 5e-5);
  pertoDe(resultado.W, 12.2442, 5e-5);
  pertoDe(resultado.Wq, 6.2442, 5e-5);
  pertoDe(bloqueadosPorHora, 30.29, 5e-3);
});

test("calcula o exemplo 1 do slide em M/M/1 com populacao finita", () => {
  const resultado = calcularMM1PopulacaoFinitaValores(0.01, 0.125, 10);

  pertoDe(resultado.rho, 0.8, 1e-12);
  pertoDe(resultado.P0, 0.3219514221, 1e-10);
  pertoDe(resultado.probOcioso, 0.3219514221, 1e-10);
  pertoDe(resultado.probOcupado, 0.6780485779, 1e-10);
  pertoDe(resultado.L, 1.5243927765, 1e-10);
  pertoDe(resultado.Lq, 0.8463441986, 1e-10);
  pertoDe(resultado.lambdaEfetiva, 0.0847560722, 1e-10);
  pertoDe(resultado.W, 17.9856467657, 1e-10);
  pertoDe(resultado.Wq, 9.9856467657, 1e-10);
  pertoDe(resultado.clientesFora, 8.4756072235, 1e-10);
});

test("calcula o exemplo 2 por formulas em M/M/1 com populacao finita", () => {
  const lambda = 1 / 30;
  const mu = 1 / 3;
  const N = 5;
  const resultado = calcularMM1PopulacaoFinitaValores(lambda, mu, N);

  pertoDe(resultado.P0, 0.5639521769, 1e-10);
  pertoDe(resultado.L, 0.6395217686, 1e-10);
  pertoDe(resultado.Lq, 0.2034739454, 1e-10);
  pertoDe(resultado.lambdaEfetiva, 0.1453492744, 1e-10);
  pertoDe(resultado.W, 4.3998965339, 1e-10);
  pertoDe(resultado.Wq, 1.3998965339, 1e-10);
  pertoDe(resultado.clientesFora, 4.3604782314, 1e-10);
  pertoDe(resultado.L, N - (mu / lambda) * (1 - resultado.P0), 1e-12);
  pertoDe(resultado.Lq, N - ((lambda + mu) / lambda) * (1 - resultado.P0), 1e-12);
});

test("calcula M/M/1/N com lambda 0.1, mu 2 e N 5 como no slide", () => {
  const resultado = calcularMM1PopulacaoFinitaValores(0.1, 2, 5);

  pertoDe(resultado.probabilidades[0], 0.7643579871, 1e-10);
  pertoDe(resultado.probabilidades[1], 0.1910894968, 1e-10);
  pertoDe(resultado.probabilidades[2], 0.0382178994, 1e-10);
  pertoDe(resultado.probabilidades[3], 0.0057326849, 1e-10);
  pertoDe(resultado.probabilidades[4], 0.0005732685, 1e-10);
  pertoDe(resultado.probabilidades[5], 0.0000286634, 1e-10);
  pertoDe(resultado.L, 0.2871597413, 1e-10);
  pertoDe(resultado.lambdaEfetiva, 0.4712840259, 1e-10);
  pertoDe(resultado.W, 0.6093135466, 1e-10);
  pertoDe(resultado.Lq, 0.0515177283, 1e-10);
  pertoDe(resultado.Wq, 0.1093135466, 1e-10);
});

test("mantem M/M/1/N consistente com M/M/s/N quando s vale 1", () => {
  const resultadoMM1N = calcularMM1PopulacaoFinitaValores(0.01, 1 / 8, 10);
  const resultadoMMSN = calcularMMSPopulacaoFinitaValores(0.01, 1 / 8, 1, 10);

  pertoDe(resultadoMM1N.P0, resultadoMMSN.P0, 1e-12);
  pertoDe(resultadoMM1N.L, resultadoMMSN.L, 1e-12);
  pertoDe(resultadoMM1N.Lq, resultadoMMSN.Lq, 1e-12);
  pertoDe(resultadoMM1N.lambdaEfetiva, resultadoMMSN.lambdaEfetiva, 1e-12);
  pertoDe(resultadoMM1N.W, resultadoMMSN.W, 1e-12);
  pertoDe(resultadoMM1N.Wq, resultadoMMSN.Wq, 1e-12);
});

test("calcula o exemplo 1 do slide em M/M/s com populacao finita", () => {
  const resultadoUmTecnico = calcularMMSPopulacaoFinitaValores(0.01, 1 / 8, 1, 10);
  const resultadoDoisTecnicos = calcularMMSPopulacaoFinitaValores(0.01, 1 / 8, 2, 10);

  pertoDe(resultadoUmTecnico.L, 1.5243927765, 1e-10);
  pertoDe(resultadoUmTecnico.Lq, 0.8463441986, 1e-10);
  pertoDe(resultadoUmTecnico.W, 17.9856467657, 1e-10);
  pertoDe(resultadoUmTecnico.Wq, 9.9856467657, 1e-10);

  pertoDe(resultadoDoisTecnicos.L, 0.8112014353, 1e-10);
  pertoDe(resultadoDoisTecnicos.Lq, 0.0760975501, 1e-10);
  pertoDe(resultadoDoisTecnicos.W, 8.8281556024, 1e-10);
  pertoDe(resultadoDoisTecnicos.Wq, 0.8281556024, 1e-10);
});

test("calcula o exemplo 2 do slide em M/M/s com populacao finita", () => {
  const resultado = calcularMMSPopulacaoFinitaValores(1 / 30, 1 / 3, 2, 5);

  pertoDe(resultado.clientesFora, 4.535, 5e-4);
  pertoDe(resultado.W, 3.075, 5e-4);
  pertoDe(resultado.probAlgumServidorOcioso, 0.9279, 5e-5);
  pertoDe(resultado.ociosidadeMediaServidor, 0.7732, 5e-5);
});

test("calcula fatorial usado no modelo M/M/s", () => {
  assert.equal(fatorial(0), 1);
  assert.equal(fatorial(1), 1);
  assert.equal(fatorial(5), 120);
});

test("calcula combinacao usada no modelo de populacao finita", () => {
  assert.equal(combinacao(5, 0), 1);
  assert.equal(combinacao(5, 2), 10);
  assert.equal(combinacao(10, 3), 120);
});

test("bloqueia M/M/1 instavel", () => {
  assert.throws(
    () => calcularMM1Valores(4, 4, 1, 1.25),
    /Sistema instável/
  );
});

test("bloqueia M/M/s instavel", () => {
  assert.throws(
    () => calcularMMSValores(8, 4, 2, 1),
    /Sistema instável/
  );
});

test("bloqueia entradas invalidas", () => {
  assert.throws(() => calcularMM1Valores(0, 4, 1, 1.25), /λ/);
  assert.throws(() => calcularMM1Valores(3, 0, 1, 1.25), /μ/);
  assert.throws(() => calcularMM1Valores(3, 4, -1, 1.25), /t/);
  assert.throws(() => calcularMM1Valores(3, 4, 1, 0), /W alvo/);
  assert.throws(() => calcularMMSValores(3, 4, 1.5, 1), /s/);
  assert.throws(() => calcularMMSValores(3, 4, 2, -1), /t/);
  assert.throws(() => calcularMM1KValores(0, 4, 2), /λ/);
  assert.throws(() => calcularMM1KValores(3, 0, 2), /μ/);
  assert.throws(() => calcularMM1KValores(3, 4, 0), /K/);
  assert.throws(() => calcularMM1KValores(3, 4, 1.5), /K/);
  assert.throws(() => calcularMMSKValores(0, 4, 1, 5), /λ/);
  assert.throws(() => calcularMMSKValores(3, 0, 1, 5), /μ/);
  assert.throws(() => calcularMMSKValores(3, 4, 0, 5), /s/);
  assert.throws(() => calcularMMSKValores(3, 4, 1.5, 5), /s/);
  assert.throws(() => calcularMMSKValores(3, 4, 3, 2), /K/);
  assert.throws(() => calcularMMSKValores(3, 4, 2, 2.5), /K/);
  assert.throws(() => calcularMM1PopulacaoFinitaValores(0, 4, 5), /λ/);
  assert.throws(() => calcularMM1PopulacaoFinitaValores(3, 0, 5), /μ/);
  assert.throws(() => calcularMM1PopulacaoFinitaValores(3, 4, 0), /N/);
  assert.throws(() => calcularMM1PopulacaoFinitaValores(3, 4, 2.5), /N/);
  assert.throws(() => calcularMMSPopulacaoFinitaValores(0, 4, 2, 5), /λ/);
  assert.throws(() => calcularMMSPopulacaoFinitaValores(3, 0, 2, 5), /μ/);
  assert.throws(() => calcularMMSPopulacaoFinitaValores(3, 4, 0, 5), /s/);
  assert.throws(() => calcularMMSPopulacaoFinitaValores(3, 4, 1.5, 5), /s/);
  assert.throws(() => calcularMMSPopulacaoFinitaValores(3, 4, 3, 2), /N/);
  assert.throws(() => calcularMMSPopulacaoFinitaValores(3, 4, 2, 2.5), /N/);
});

// ---------------------------------------------------------------------------
// Lista de exercicios de Otimizacao 2 (Teoria das Filas).
// Pulados por divergencia/ambiguidade de gabarito: 2 (W "em dias" nao
// reproduzivel), 8 (gabarito usa Wq medido + Little, nao o M/M/2 teorico),
// 10 (item c traz o complemento) e 12 (interpretacao P0 vs 1-rho^2).
// ---------------------------------------------------------------------------

test("Otimizacao 2 - Ex 1: equipamentos danificados em M/M/1", () => {
  // λ = media da distribuicao de danos ≈ 12/mes; ρ=0,75 (ocupacao) → μ=16/mes.
  // Itens g/h convertem dias→mes (mes = 30 dias).
  const r = calcularMM1Valores(12, 16, 20 / 30, 1);   // t = 20 dias (item g)
  const rWq = calcularMM1Valores(12, 16, 15 / 30, 1); // t = 15 dias (item h)

  pertoDe(r.W, 0.25, 1e-9);        // a) tempo fora de servico (mes)
  pertoDe(r.P0, 0.25, 1e-9);       // b) ociosidade da secao
  pertoDe(1 - Math.pow(r.rho, 5), 0.7627, 5e-5); // c) P(n <= 4) = 1 - ρ^5
  pertoDe(r.Lq, 2.25, 1e-9);       // d) Lq
  pertoDe(r.Wq, 0.1875, 1e-9);     // e) Wq
  pertoDe(r.L, 3, 1e-9);           // f) L
  pertoDe(r.probWMaiorQueT, 0.069, 1e-3);     // g) P(W>20 dias) ≈ 0,0695
  pertoDe(rWq.probWqMaiorQueT, 0.1015, 5e-5); // h) P(Wq>15 dias)
});

test("Otimizacao 2 - Ex 3: M/M/1 inverso a partir de Lq=3,2 e W=0,5h", () => {
  // Lq=3,2 → ρ=0,8; W=0,5h → λ=8/h, μ=10/h. Pede P(n<6) = 1 - ρ^6.
  const r = calcularMM1Valores(8, 10, 1, 1);
  pertoDe(r.rho, 0.8, 1e-9);
  pertoDe(1 - Math.pow(r.rho, 6), 0.7378, 1e-4);
});

test("Otimizacao 2 - Ex 4: fila de bilheteria em M/M/1", () => {
  // λ=1/min; atendimento 20s → μ=3/min.
  const r = calcularMM1Valores(1, 3, 1, 1);
  pertoDe(r.W, 0.5, 1e-9); // tempo no sistema (compra do ingresso)
  // 2 min disponiveis: W + 1,5 min ate o assento = 2,0 min ⇒ senta a tempo.
  assert.ok(r.W + 1.5 <= 2 + 1e-12);
});

test("Otimizacao 2 - Ex 5: armazem de caminhoes com atendimento exponencial (M/M/1)", () => {
  // λ=3/h; atendimento 15 min EXPONENCIAL → μ=4/h.
  const r = calcularMM1Valores(3, 4, 2, 1);     // t=2h (item g)
  const rWq = calcularMM1Valores(3, 4, 1.5, 1); // t=1,5h (item h)

  pertoDe(r.Lq, 2.25, 1e-9);   // a
  pertoDe(r.L, 3, 1e-9);       // b
  pertoDe(r.Wq, 0.75, 1e-9);   // c
  pertoDe(r.W, 1, 1e-9);       // d
  pertoDe((1 - r.rho) * Math.pow(r.rho, 6), 0.0445, 5e-5); // e) P(n=6)
  pertoDe(r.rho, 0.75, 1e-9);  // f
  pertoDe(r.probWMaiorQueT, 0.1353, 1e-4);    // g) P(W>2h)
  pertoDe(rWq.probWqMaiorQueT, 0.1673, 1e-4); // h) P(Wq>1,5h)
});

test("Otimizacao 2 - Ex 6: cooperativa, λ maxima para Wq=0,8h (M/M/1)", () => {
  // μ=5/h; Wq_max=0,8h ⇒ λ=4/h.
  const r = calcularMM1Valores(4, 5, 1, 1);     // t=1h (item e)
  const rWq = calcularMM1Valores(4, 5, 0.8, 1); // t=0,8h (item f)

  pertoDe(r.Wq, 0.8, 1e-9);  // a) confirma λ=4 reproduz Wq=0,8
  pertoDe(r.Lq, 3.2, 1e-9);  // b
  pertoDe(r.L, 4, 1e-9);     // c
  pertoDe(r.W, 1, 1e-9);     // d
  pertoDe(r.probWMaiorQueT, 0.3679, 1e-4);    // e) P(W>1h)
  pertoDe(rWq.probWqMaiorQueT, 0.3595, 1e-4); // f) P(Wq>0,8h)
});

test("Otimizacao 2 - Ex 7: sala de emergencia com 1 e 2 medicos (M/M/s)", () => {
  // λ=1 por ½h=2/h; atendimento 20min → μ=3/h.
  // --- 1 medico (M/M/1) ---
  const s1 = calcularMM1Valores(2, 3, 1, 1);     // t=1h (item i)
  const s1Wq = calcularMM1Valores(2, 3, 0.5, 1); // t=0,5h (item h)
  pertoDe(s1.rho, 2 / 3, 1e-9);   // a
  pertoDe(s1.L, 2, 1e-9);         // b
  pertoDe(s1.Lq, 4 / 3, 1e-9);    // c
  pertoDe(s1.P0, 1 / 3, 1e-9);    // d
  pertoDe(Math.pow(s1.rho, 3), 8 / 27, 1e-9); // e) P(n>2)=ρ^3=0,2963 (gab. 0,2962)
  pertoDe(s1.Wq, 2 / 3, 1e-9);    // f
  pertoDe(s1.W, 1, 1e-9);         // g
  pertoDe(s1Wq.probWqMaiorQueT, 0.404, 1e-3); // h) P(Wq>½h)
  pertoDe(s1.probWMaiorQueT, 0.3679, 1e-4);   // i) P(W>1h)

  // --- 2 medicos (M/M/2) ---
  const s2 = calcularMMSValores(2, 3, 2, 1);
  pertoDe(s2.rho, 1 / 3, 1e-9);   // a
  pertoDe(s2.L, 0.75, 1e-9);      // b
  pertoDe(s2.Lq, 1 / 12, 1e-9);   // c
  pertoDe(s2.P0, 0.5, 1e-9);      // d
  pertoDe(s2.Wq, 1 / 24, 1e-9);   // f
  pertoDe(s2.W, 0.375, 1e-9);     // g
  // e/h/i para s=2 nao sao retornados pela funcao: caudas via Erlang (manual).
  const Pwait = probEspera(2, 3, 2, s2.P0);
  pertoDe(1 - probSistemaAte(2, 3, 2, s2.P0, 2), 0.0556, 5e-4);   // e) P(n>2)
  pertoDe(Pwait * Math.exp(-(2 * 3 - 2) * 0.5), 0.023, 1e-3);     // h) P(Wq>½h)
  const ex = 2 - 1 - 2 / 3; // s-1-λ/μ
  pertoDe(Math.exp(-3) * (1 + Pwait * (1 - Math.exp(-3 * ex)) / ex), 0.0655, 5e-4); // i) P(W>1h)
});

test("Otimizacao 2 - Ex 9: SAC, numero de atendentes para Wq<=2min", () => {
  // λ=5/h, μ=7/h.
  const s1 = calcularMM1Valores(5, 7, 1, 1);
  pertoDe(s1.Wq, 5 / 14, 1e-9);  // ≈0,357h = 21,4min > 5min
  assert.ok(s1.Wq > 5 / 60);

  const s2 = calcularMMSValores(5, 7, 2, 1);
  assert.ok(s2.Wq <= 2 / 60);    // ≈1,25min ≤ 2min ⇒ resposta: 2 atendentes
  pertoDe(s2.Wq * 60, 1.2531, 1e-3);
});

test("Otimizacao 2 - Ex 11: torno-revolver, proporcao com armazenagem adequada (M/M/1)", () => {
  // λ=2/dia, μ=4/dia (¼ dia). Espaco acomoda 3 esperando + 1 em servico ⇒ N≤4.
  const r = calcularMM1Valores(2, 4, 1, 1);
  pertoDe(r.rho, 0.5, 1e-9);
  pertoDe(1 - Math.pow(r.rho, 5), 0.96875, 1e-9); // P(N<=4); gabarito arred. 0,97
});

test("Otimizacao 2 - Ex 13: caixa do supermercado, situacao atual e alternativa (M/M/1)", () => {
  // a/b) atual: λ=20/h, μ=30/h (2min). Tempos em horas.
  const a1 = calcularMM1Valores(20, 30, 7 / 60, 1); // t=7min (P(W>7))
  const a2 = calcularMM1Valores(20, 30, 1 / 12, 1); // t=5min (P(Wq>5))
  pertoDe(a1.L, 2, 1e-9);
  pertoDe(a1.W, 0.1, 1e-9);                                 // 6 min
  pertoDe(a1.Wq, 1 / 15, 1e-9);                            // 4 min
  pertoDe(a1.Lq, 4 / 3, 1e-9);
  pertoDe(a1.P0, 1 / 3, 1e-9);
  pertoDe((1 - a1.rho) * a1.rho, 2 / 9, 1e-9);             // P1
  pertoDe((1 - a1.rho) * Math.pow(a1.rho, 2), 4 / 27, 1e-9); // P2
  pertoDe(Math.pow(a1.rho, 3), 8 / 27, 1e-9);             // P(n>2)
  pertoDe(a2.probWqMaiorQueT, 0.2897, 5e-4); // b) P(Wq>5min)
  pertoDe(a1.probWMaiorQueT, 0.3114, 5e-4);  // b) P(W>7min)

  // c/d) alternativa: λ=20/h, μ=40/h (1,5min).
  const c1 = calcularMM1Valores(20, 40, 7 / 60, 1);
  const c2 = calcularMM1Valores(20, 40, 1 / 12, 1);
  pertoDe(c1.L, 1, 1e-9);
  pertoDe(c1.W, 0.05, 1e-9);                                // 3 min
  pertoDe(c1.Wq, 0.025, 1e-9);                             // 1,5 min
  pertoDe(c1.Lq, 0.5, 1e-9);
  pertoDe(c1.P0, 0.5, 1e-9);
  pertoDe((1 - c1.rho) * c1.rho, 0.25, 1e-9);              // P1
  pertoDe((1 - c1.rho) * Math.pow(c1.rho, 2), 0.125, 1e-9); // P2
  pertoDe(c2.probWqMaiorQueT, 0.0944, 5e-4); // d) P(Wq>5min)
  pertoDe(c1.probWMaiorQueT, 0.0970, 5e-4);  // d) P(W>7min)
});

test("Otimizacao 2 - Ex 14: aeroporto, criterios da FAA (M/M/1 e M/M/s)", () => {
  // μ=20/h (3min). Crit: (1) Lq; (2) P(n_fila<=4)≥95%; (3) P(Wq<=30min)≥99%.
  // a) λ=10/h (M/M/1)
  const a = calcularMM1Valores(10, 20, 0.5, 1);
  pertoDe(a.Lq, 0.5, 1e-9);                       // crit 1
  pertoDe(1 - Math.pow(a.rho, 6), 0.984, 1e-3);   // crit 2: P(n<=5)=1-ρ^6
  pertoDe(1 - a.probWqMaiorQueT, 0.9966, 5e-4);   // crit 3

  // b) λ=15/h (M/M/1)
  const b = calcularMM1Valores(15, 20, 0.5, 1);
  pertoDe(b.Lq, 2.25, 1e-9);                       // crit 1
  pertoDe(1 - Math.pow(b.rho, 6), 0.822, 1e-3);    // crit 2
  pertoDe(1 - b.probWqMaiorQueT, 0.9384, 5e-4);    // crit 3

  // c) duas pistas: λ=25/h, μ=20/h, s=2 (M/M/s)
  const c = calcularMMSValores(25, 20, 2, 0.5);
  pertoDe(c.Lq, 0.8013, 5e-4);                                          // crit 1
  const Pwait = probEspera(25, 20, 2, c.P0);
  pertoDe(1 - Pwait * Math.exp(-(2 * 20 - 25) * 0.5), 0.9997, 5e-4);    // crit 3
  // crit 2 do gabarito (92,7%) NAO e aplicado: ele usa P(N<=5)=0,9266, mas
  // para s=2 "n_fila<=4" equivale a N<=6, cujo correto e P(N<=6)=0,9542.
  pertoDe(probSistemaAte(25, 20, 2, c.P0, 6), 0.9542, 5e-4); // valor correto
});

test("Otimizacao 2 - Ex 15: banco com 4 caixas, diretrizes de atendimento (M/M/s)", () => {
  // μ=1/min. Crit: (1) Lq; (2) P(n_fila<=5)≥95% ⇔ P(N<=s+5); (3) P(Wq<=5min)≥95%.
  // a) λ=2/min, s=4
  const a = calcularMMSValores(2, 1, 4, 5);
  pertoDe(a.Lq, 0.1739, 5e-4);                                          // crit 1
  pertoDe(probSistemaAte(2, 1, 4, a.P0, 9), 0.997, 5e-4);              // crit 2: P(N<=9)
  pertoDe(1 - probEspera(2, 1, 4, a.P0) * Math.exp(-(4 - 2) * 5), 0.9999, 5e-4); // crit 3

  // b) λ=3/min, s=4
  const b = calcularMMSValores(3, 1, 4, 5);
  pertoDe(b.Lq, 1.5283, 5e-4);                                          // crit 1
  pertoDe(probSistemaAte(3, 1, 4, b.P0, 9), 0.909, 1e-3);              // crit 2
  pertoDe(1 - probEspera(3, 1, 4, b.P0) * Math.exp(-(4 - 3) * 5), 0.9966, 5e-4); // crit 3

  // c) λ=3/min: 5 caixas atendem completamente as diretrizes.
  const c = calcularMMSValores(3, 1, 5, 5);
  assert.ok(c.Lq < 1);                                                  // crit 1
  assert.ok(probSistemaAte(3, 1, 5, c.P0, 10) >= 0.95);               // crit 2
  assert.ok(1 - probEspera(3, 1, 5, c.P0) * Math.exp(-(5 - 3) * 5) >= 0.95); // crit 3
});

// ---------------------------------------------------------------------------
// Lista de filas com capacidade limitada (M/M/1/K e M/M/s/K).
// Ex 5 pulado: enunciado diz K=5 ("max 5 pacientes"), mas o gabarito so fecha
// com K=4 (provavel typo) -> decidido nao testar.
// ---------------------------------------------------------------------------

test("Capacidade limitada - Ex 1: agencia bancaria em M/M/1/K (K=5)", () => {
  // λ=2/min; atendimento 0,25min → μ=4/min; K=5.
  const r = calcularMM1KValores(2, 4, 5);
  pertoDe(r.P0, 0.5079, 1e-4);              // a) sistema vazio
  pertoDe(r.L, 0.9048, 1e-4);              // b) clientes no sistema
  pertoDe(r.Lq, 0.4127, 1e-4);            // c) clientes na fila
  pertoDe(r.probabilidades[4], 0.03175, 1e-5); // d) P(4 no sistema)
  pertoDe(r.W, 0.4597, 1e-4);            // e) tempo no sistema
  pertoDe(r.Wq, 0.2097, 1e-4);          // f) tempo na fila
});

test("Capacidade limitada - Ex 2: radiologia 1 equipamento em M/M/1/K (K=4)", () => {
  // λ=1/h; atendimento 45min → μ=4/3/h; K=4.
  const r = calcularMM1KValores(1, 4 / 3, 4);
  pertoDe(r.L, 1.4443, 5e-4);   // a) pacientes no laboratorio
  pertoDe(r.PK, 0.1037, 5e-5);  // b) "ocupado" = laboratorio cheio (bloqueio)
  pertoDe(r.Wq, 0.8614, 1e-4);  // c) espera ate ser atendido
});

test("Capacidade limitada - Ex 3: aeroporto 1 pista em M/M/1/K (K=4)", () => {
  // λ=1/4 por min; atendimento 3min → μ=1/3 por min; K=4 (3 em espera + 1 em servico).
  const r = calcularMM1KValores(0.25, 1 / 3, 4);
  pertoDe(r.Lq, 0.7721, 5e-4);  // a) avioes em espera
  pertoDe(r.Wq, 3.4457, 1e-3);  // b) espera ate permissao (min)
  // c) "mais que 2 em espera": Nq>2 ⇔ N=4 ⇔ PK (=P[4]).
  pertoDe(r.PK, 0.1037, 5e-5);
});

test("Capacidade limitada - Ex 4: aeroporto 2 pistas em M/M/s/K (s=2, K=4)", () => {
  // λ=1/4 por min; μ=1/3 por min; s=2. Gabarito reproduz com K=4 (espaco aereo
  // total = 4 avioes: 2 pousando + 2 esperando).
  const r = calcularMMSKValores(0.25, 1 / 3, 2, 4);
  pertoDe(r.Lq, 0.0848, 5e-5);  // a) avioes em espera
  pertoDe(r.Wq, 0.3455, 1e-4);  // b) espera ate permissao (min)
  // c) gabarito usa PK (prob. de bloqueio); literalmente Nq>2 com s=2,K=4 seria 0.
  pertoDe(r.PK, 0.0182, 5e-5);
});

test("Capacidade limitada - Ex 6: terminal de descarga em M/M/1/K e M/M/s/K (K=4)", () => {
  // λ=3/h; μ=4/h; patio comporta 3 → K=4 (3 na fila + 1 em servico).
  const r = calcularMM1KValores(3, 4, 4);
  pertoDe(r.Lq, 0.7721, 5e-4);  // a) caminhoes na fila
  pertoDe(r.L, 1.4443, 5e-4);   // b) caminhoes no sistema
  pertoDe(r.W, 0.5371, 1e-4);   // c) tempo no sistema (h)
  pertoDe(r.Wq, 0.2871, 1e-4);  // d) tempo na fila (h)

  // e) dois terminais (s=2), mantendo capacidade total K=4.
  const r2 = calcularMMSKValores(3, 4, 2, 4);
  pertoDe(r2.Wq, 0.0288, 1e-4);
});

// ---------------------------------------------------------------------------
// Lista de reparo de maquinas (fonte/populacao finita).
// IMPORTANTE: o modelo correto de 1 reparador e' calcularMMSPopulacaoFinita
// com s=1. A funcao calcularMM1PopulacaoFinitaValores usa C(N,n)*(λ/μ)^n
// (binomial / servidores amplos) e NAO reproduz estes gabaritos.
// Ex 5 pulado (custos b/c nao reproduziveis com modelo de custo consistente).
// ---------------------------------------------------------------------------

test("Populacao finita - Ex 1: 3 maquinas, 1 reparador (N=10, s=1) + custo diario", () => {
  // λ=1/200/h; reparo 10h → μ=0,1/h; N=10; s=1.
  const r = calcularMMSPopulacaoFinitaValores(0.005, 0.1, 1, 10);
  pertoDe(r.P0, 0.5380, 1e-3);   // P0
  pertoDe(r.Lq, 0.2972, 5e-4);   // Lq
  pertoDe(r.L, 0.7593, 5e-4);    // L
  pertoDe(r.Wq, 6.4330, 5e-3);   // Wq (software 6,4347; arred. do gabarito)
  pertoDe(r.W, 16.4330, 5e-3);   // W  (software 16,4348)
  // Custo total/dia: maquinas paradas (R$30/h) + mao de obra so quando ocupada
  // (R$10/h), turno de 8h.
  const CT = r.L * 30 * 8 + (1 - r.P0) * 10 * 8;
  pertoDe(CT, 219.192, 5e-2);
});

test("Populacao finita - Ex 2: mineradora, 6 trens, 1 servidor (N=6, s=1)", () => {
  // λ=1/30/h; abastecimento 6h40min → μ=0,15/h; N=6; s=1.
  // ATENCAO: o gabarito troca rotulos: b)=Wq, d)=L, e)=Lq (valores corretos).
  const r = calcularMMSPopulacaoFinitaValores(1 / 30, 0.15, 1, 6);
  pertoDe(r.W, 17.2906, 1e-3);              // a) tempo no sistema
  pertoDe(r.Wq, 10.6239, 1e-3);            // b) gabarito rotula "Lq", mas e' Wq
  pertoDe(r.probabilidades[4], 0.1353, 5e-4); // c) P(4 no sistema)
  pertoDe(r.L, 2.1937, 1e-3);              // d) gabarito rotula "W", mas e' L
  pertoDe(r.Lq, 1.3479, 1e-3);            // e) gabarito rotula "Wq", mas e' Lq
});

test("Populacao finita - Ex 3: 1 tecnico, 2 maquinas (N=2, s=1)", () => {
  // λ=1/10/h; reparo 8h → μ=0,125/h; N=2; s=1.
  const r = calcularMMSPopulacaoFinitaValores(0.1, 0.125, 1, 2);
  pertoDe(r.P0, 0.2577, 5e-4);   // a) P0
  pertoDe(r.L, 1.072, 1e-3);     // b) L
  pertoDe(r.Lq, 0.330, 1e-3);    // b) Lq
  pertoDe(r.W, 11.556, 1e-3);    // b) W
  pertoDe(r.Wq, 3.556, 1e-3);    // b) Wq
  pertoDe(1 - r.P0, 0.7423, 5e-4);            // c) tecnico ocupado = 1-P0
  pertoDe(r.clientesFora / 2, 0.464, 5e-4);   // d) maquina operando = (N-L)/N
});

test("Populacao finita - Ex 4: Forrester, 1 tecnico, 3 maquinas (N=3, s=1 e s=2)", () => {
  // λ=1/9/h; reparo 2h → μ=0,5/h; N=3.
  const s1 = calcularMMSPopulacaoFinitaValores(1 / 9, 0.5, 1, 3);
  pertoDe(s1.L, 0.7181, 5e-4);   // a) maquinas paradas
  pertoDe(s1.W, 2.832, 1e-3);    // b) tempo entre quebra e fim do reparo
  // c) pulado: gabarito 0,667 (=N·λ/μ) e' incoerente; o correto seria 1-P0=0,5071.

  // d) segundo tecnico disponivel (s=2).
  const s2 = calcularMMSPopulacaoFinitaValores(1 / 9, 0.5, 2, 3);
  pertoDe(s2.L, 0.5528, 5e-4);
});

test("Populacao finita - Ex 6: 4M Company, 4 maquinas, 2 tecnicos (N=4, s=2)", () => {
  // λ=1/100/h; reparo 10h → μ=0,1/h; N=4; s=2.
  const r = calcularMMSPopulacaoFinitaValores(0.01, 0.1, 2, 4);
  pertoDe(r.P0, 0.6820, 5e-4);    // a) P0
  pertoDe(r.L, 0.3677, 5e-4);     // b) L
  pertoDe(r.Lq, 0.0045, 5e-5);    // b) Lq
  pertoDe(r.W, 10.1239, 1e-3);    // b) W
  pertoDe(r.Wq, 0.1239, 5e-4);    // b) Wq
  pertoDe(1 - r.P0, 0.3180, 5e-4); // c) tecnico ocupado = 1-P0
  // d) "maquina operando": gabarito traz 0,8184 = ociosidade media do servidor;
  // o valor literal (N-L)/N = 0,9081. Asseguro os dois.
  pertoDe(r.ociosidadeMediaServidor, 0.8184, 5e-4);
  pertoDe(r.clientesFora / 4, 0.9081, 5e-4);
});
