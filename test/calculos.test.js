const test = require("node:test");
const assert = require("node:assert/strict");

const {
  calcularMM1Valores,
  calcularMM1KValores,
  calcularMM1PopulacaoFinitaValores,
  calcularMMSPopulacaoFinitaValores,
  calcularMMSKValores,
  calcularMMSValores,
  combinacao,
  fatorial
} = require("../calculos.js");

function pertoDe(valor, esperado, tolerancia = 1e-10) {
  assert.ok(
    Math.abs(valor - esperado) <= tolerancia,
    `esperado ${valor} perto de ${esperado}`
  );
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
  const resultado = calcularMMSValores(3, 4, 2);

  pertoDe(resultado.rho, 0.375);
  pertoDe(resultado.P0, 0.45454545454545453);
  pertoDe(resultado.Lq, 0.12272727272727273);
  pertoDe(resultado.Wq, 0.04090909090909091);
  pertoDe(resultado.W, 0.2909090909090909);
  pertoDe(resultado.L, 0.8727272727272727);
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

  pertoDe(resultado.P0, 0.4631934881, 1e-10);
  pertoDe(resultado.probOcioso, 0.4631934881, 1e-10);
  pertoDe(resultado.probOcupado, 0.5368065119, 1e-10);
  pertoDe(resultado.L, 0.7407407407, 1e-10);
  pertoDe(resultado.Lq, 0.2039342288, 1e-10);
  pertoDe(resultado.lambdaEfetiva, 0.0925925926, 1e-10);
  pertoDe(resultado.W, 8);
  pertoDe(resultado.Wq, 2.2024896713, 1e-10);
  pertoDe(resultado.clientesFora, 9.2592592593, 1e-10);
});

test("calcula o exemplo 2 por formulas em M/M/1 com populacao finita", () => {
  const resultado = calcularMM1PopulacaoFinitaValores(1 / 30, 1 / 3, 5);

  pertoDe(resultado.P0, 0.6209213231, 1e-10);
  pertoDe(resultado.L, 0.4545454545, 1e-10);
  pertoDe(resultado.Lq, 0.0754667776, 1e-10);
  pertoDe(resultado.lambdaEfetiva, 0.1515151515, 1e-10);
  pertoDe(resultado.W, 3, 1e-10);
  pertoDe(resultado.Wq, 0.4980807322, 1e-10);
  pertoDe(resultado.clientesFora, 4.5454545455, 1e-10);
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
    () => calcularMMSValores(8, 4, 2),
    /Sistema instável/
  );
});

test("bloqueia entradas invalidas", () => {
  assert.throws(() => calcularMM1Valores(0, 4, 1, 1.25), /λ/);
  assert.throws(() => calcularMM1Valores(3, 0, 1, 1.25), /μ/);
  assert.throws(() => calcularMM1Valores(3, 4, -1, 1.25), /t/);
  assert.throws(() => calcularMM1Valores(3, 4, 1, 0), /W alvo/);
  assert.throws(() => calcularMMSValores(3, 4, 1.5), /s/);
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
