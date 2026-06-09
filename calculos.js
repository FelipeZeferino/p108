(function (root) {
  function validarNumero(nome, valor, permiteZero) {
    if (!Number.isFinite(valor) || valor < 0 || (!permiteZero && valor === 0)) {
      throw new Error(`${nome} deve ser um número ${permiteZero ? "maior ou igual a zero" : "maior que zero"}.`);
    }
  }

  function fatorial(n) {
    let resultado = 1;
    for (let i = 2; i <= n; i++) {
      resultado *= i;
    }
    return resultado;
  }

  function combinacao(total, escolhidos) {
    return fatorial(total) / (fatorial(total - escolhidos) * fatorial(escolhidos));
  }

  function calcularMM1Valores(lambda, mu, tempo, wAlvo) {
    validarNumero("λ", lambda, false);
    validarNumero("μ", mu, false);
    validarNumero("t", tempo, true);
    validarNumero("W alvo", wAlvo, false);

    if (lambda >= mu) {
      throw new Error("Sistema instável (λ >= μ)");
    }

    const rho = lambda / mu;
    const P0 = 1 - rho;
    const POcupado = rho;
    const L = lambda / (mu - lambda);
    const Lq = (lambda * lambda) / (mu * (mu - lambda));
    const W = 1 / (mu - lambda);
    const Wq = lambda / (mu * (mu - lambda));
    const probWMaiorQueT = Math.exp(-(mu - lambda) * tempo);
    const probWqMaiorQueT = rho * Math.exp(-(mu - lambda) * tempo);
    const lambdaParaWAlvo = mu - (1 / wAlvo);

    return {
      rho,
      P0,
      POcupado,
      L,
      Lq,
      W,
      Wq,
      probWMaiorQueT,
      probWqMaiorQueT,
      lambdaParaWAlvo: lambdaParaWAlvo > 0 && lambdaParaWAlvo < mu ? lambdaParaWAlvo : null
    };
  }

  function calcularMMSValores(lambda, mu, s) {
    validarNumero("λ", lambda, false);
    validarNumero("μ", mu, false);

    if (!Number.isInteger(s) || s <= 0) {
      throw new Error("s deve ser um número inteiro maior que zero.");
    }

    const rho = lambda / (s * mu);

    if (rho >= 1) {
      throw new Error("Sistema instável (ρ >= 1)");
    }

    let soma = 0;
    for (let n = 0; n < s; n++) {
      soma += Math.pow(lambda / mu, n) / fatorial(n);
    }

    const parte2 = Math.pow(lambda / mu, s) / (fatorial(s) * (1 - rho));
    const P0 = 1 / (soma + parte2);
    const Lq = (P0 * Math.pow(lambda / mu, s) * rho) / (fatorial(s) * Math.pow(1 - rho, 2));
    const Wq = Lq / lambda;
    const W = Wq + (1 / mu);
    const L = lambda * W;

    return {
      rho,
      P0,
      Lq,
      Wq,
      W,
      L
    };
  }

  function calcularMG1Valores(lambda, mu, sigma2) {
    validarNumero("λ", lambda, false);
    validarNumero("μ", mu, false);
    validarNumero("σ²", sigma2, true);

    const rho = lambda / mu;

    if (rho >= 1) {
      throw new Error("Sistema instável (ρ >= 1)");
    }

    const P0 = 1 - rho;
    const Lq = ((lambda * lambda * sigma2) + (rho * rho)) / (2 * (1 - rho));
    const L = rho + Lq;
    const Wq = Lq / lambda;
    const W = Wq + (1 / mu);

    return {
      rho,
      P0,
      Lq,
      L,
      Wq,
      W
    };
  }

  function calcularPrioridadesSemInterrupcao(lambdas, mu, s) {
    if (!Array.isArray(lambdas) || lambdas.length < 2) {
      throw new Error("lambdas deve ser um array com pelo menos 2 taxas de chegada.");
    }

    lambdas.forEach((lambda, indice) => {
      validarNumero(`λ${indice + 1}`, lambda, false);
    });
    validarNumero("μ", mu, false);

    if (!Number.isInteger(s) || s < 1) {
      throw new Error("s deve ser um número inteiro maior ou igual a 1.");
    }

    const lambdaTotal = lambdas.reduce((soma, lambda) => soma + lambda, 0);
    const r = lambdaTotal / mu;
    const rho = lambdaTotal / (s * mu);

    if (rho >= 1) {
      throw new Error("Sistema instável (ρ >= 1)");
    }

    let somaMMs = 0;
    for (let n = 0; n < s; n++) {
      somaMMs += Math.pow(r, n) / fatorial(n);
    }

    const P0 = 1 / (somaMMs + (Math.pow(r, s) / (fatorial(s) * (1 - rho))));
    const fatorEspera = (
      (fatorial(s) * (s * mu - lambdaTotal) * somaMMs) / Math.pow(r, s)
    ) + (s * mu);
    let lambdaAcumulado = 0;

    const classes = lambdas.map((lambdaClasse, indice) => {
      const sigmaAnterior = lambdaAcumulado / (s * mu);
      lambdaAcumulado += lambdaClasse;
      const sigmaAtual = lambdaAcumulado / (s * mu);
      const W = (1 / (fatorEspera * (1 - sigmaAnterior) * (1 - sigmaAtual))) + (1 / mu);
      const Wq = W - (1 / mu);
      const L = lambdaClasse * W;
      const Lq = L - (lambdaClasse / mu);

      return {
        classe: indice + 1,
        W,
        Wq,
        L,
        Lq
      };
    });

    return {
      P0,
      rho,
      lambdaTotal,
      classes
    };
  }

  function calcularPrioridadesComInterrupcao(lambdas, mu) {
    if (!Array.isArray(lambdas) || lambdas.length < 2) {
      throw new Error("lambdas deve ser um array com pelo menos 2 taxas de chegada.");
    }

    lambdas.forEach((lambda, indice) => {
      validarNumero(`λ${indice + 1}`, lambda, false);
    });
    validarNumero("μ", mu, false);

    const lambdaTotal = lambdas.reduce((soma, lambda) => soma + lambda, 0);
    const rho = lambdaTotal / mu;

    if (rho >= 1) {
      throw new Error("Sistema instável (ρ >= 1)");
    }

    const P0 = 1 - rho;
    let lambdaAcumulado = 0;

    const classes = lambdas.map((lambdaClasse, indice) => {
      const sigmaAnterior = lambdaAcumulado / mu;
      lambdaAcumulado += lambdaClasse;
      const sigmaAtual = lambdaAcumulado / mu;
      const W = (
        1 / (mu * (1 - sigmaAnterior))
      ) + (
        lambdaAcumulado / (mu * mu * (1 - sigmaAnterior) * (1 - sigmaAtual))
      );
      const Wq = W - (1 / mu);
      const L = lambdaClasse * W;
      const Lq = lambdaClasse * Wq;

      return {
        classe: indice + 1,
        W,
        Wq,
        L,
        Lq
      };
    });

    return {
      P0,
      rho,
      lambdaTotal,
      classes
    };
  }

  function calcularMM1KValores(lambda, mu, K) {
    validarNumero("λ", lambda, false);
    validarNumero("μ", mu, false);

    if (!Number.isInteger(K) || K < 1) {
      throw new Error("K deve ser um número inteiro maior ou igual a 1.");
    }

    const rho = lambda / mu;
    const rhoIgualAUm = Math.abs(rho - 1) <= 1e-12;
    const P0 = rhoIgualAUm
      ? 1 / (K + 1)
      : (1 - rho) / (1 - Math.pow(rho, K + 1));
    const probabilidades = [];
    let L = 0;

    for (let n = 0; n <= K; n++) {
      const Pn = rhoIgualAUm ? P0 : P0 * Math.pow(rho, n);
      probabilidades.push(Pn);
      L += n * Pn;
    }

    const PK = probabilidades[K];
    const lambdaEfetiva = lambda * (1 - PK);
    const Lq = L - (1 - P0);
    const W = L / lambdaEfetiva;
    const Wq = Lq / lambdaEfetiva;

    return {
      rho,
      P0,
      probabilidades,
      PK,
      lambdaEfetiva,
      L,
      Lq,
      W,
      Wq
    };
  }

  function calcularMMSKValores(lambda, mu, s, K) {
    validarNumero("λ", lambda, false);
    validarNumero("μ", mu, false);

    if (!Number.isInteger(s) || s < 1) {
      throw new Error("s deve ser um número inteiro maior ou igual a 1.");
    }

    if (!Number.isInteger(K) || K < s) {
      throw new Error("K deve ser um número inteiro maior ou igual a s.");
    }

    const rho = lambda / (s * mu);
    const lambdaSobreMu = lambda / mu;
    const fatores = [];
    let somaFatores = 0;

    for (let n = 0; n <= K; n++) {
      const fator = n < s
        ? Math.pow(lambdaSobreMu, n) / fatorial(n)
        : Math.pow(lambdaSobreMu, n) / (fatorial(s) * Math.pow(s, n - s));

      fatores.push(fator);
      somaFatores += fator;
    }

    const P0 = 1 / somaFatores;
    const probabilidades = [];
    let L = 0;
    let Lq = 0;

    for (let n = 0; n <= K; n++) {
      const Pn = fatores[n] * P0;
      probabilidades.push(Pn);
      L += n * Pn;
      Lq += Math.max(n - s, 0) * Pn;
    }

    const PK = probabilidades[K];
    const lambdaEfetiva = lambda * (1 - PK);
    const W = L / lambdaEfetiva;
    const Wq = Lq / lambdaEfetiva;

    return {
      rho,
      P0,
      probabilidades,
      PK,
      lambdaEfetiva,
      L,
      Lq,
      W,
      Wq
    };
  }

  function calcularMM1PopulacaoFinitaValores(lambda, mu, N) {
    validarNumero("λ", lambda, false);
    validarNumero("μ", mu, false);

    if (!Number.isInteger(N) || N < 1) {
      throw new Error("N deve ser um número inteiro maior ou igual a 1.");
    }

    const razao = lambda / mu;
    const fatores = [];
    let somaFatores = 0;

    for (let n = 0; n <= N; n++) {
      const fator = combinacao(N, n) * Math.pow(razao, n);
      fatores.push(fator);
      somaFatores += fator;
    }

    const P0 = 1 / somaFatores;
    const probabilidades = [];
    let L = 0;

    for (let n = 0; n <= N; n++) {
      const Pn = fatores[n] * P0;
      probabilidades.push(Pn);
      L += n * Pn;
    }

    const Lq = L - (1 - P0);
    const clientesFora = N - L;
    const lambdaEfetiva = lambda * clientesFora;
    const W = L / lambdaEfetiva;
    const Wq = Lq / lambdaEfetiva;
    const probOcioso = P0;
    const probOcupado = 1 - P0;

    return {
      razao,
      P0,
      probabilidades,
      lambdaEfetiva,
      L,
      Lq,
      W,
      Wq,
      clientesFora,
      probOcioso,
      probOcupado
    };
  }

  function calcularMMSPopulacaoFinitaValores(lambda, mu, s, N) {
    validarNumero("λ", lambda, false);
    validarNumero("μ", mu, false);

    if (!Number.isInteger(s) || s < 1) {
      throw new Error("s deve ser um número inteiro maior ou igual a 1.");
    }

    if (!Number.isInteger(N) || N < s) {
      throw new Error("N deve ser um número inteiro maior ou igual a s.");
    }

    const razao = lambda / mu;
    const fatores = [];
    let somaFatores = 0;

    for (let n = 0; n <= N; n++) {
      const fator = n <= s
        ? (fatorial(N) / (fatorial(N - n) * fatorial(n))) * Math.pow(razao, n)
        : (fatorial(N) / (fatorial(N - n) * fatorial(s) * Math.pow(s, n - s))) * Math.pow(razao, n);

      fatores.push(fator);
      somaFatores += fator;
    }

    const P0 = 1 / somaFatores;
    const probabilidades = [];
    let L = 0;
    let probAlgumServidorOcioso = 0;

    for (let n = 0; n <= N; n++) {
      const Pn = fatores[n] * P0;
      probabilidades.push(Pn);
      L += n * Pn;

      if (n < s) {
        probAlgumServidorOcioso += Pn;
      }
    }

    const clientesFora = N - L;
    const lambdaEfetiva = lambda * clientesFora;
    const Lq = L - (razao * clientesFora);
    const W = L / lambdaEfetiva;
    const Wq = Lq / lambdaEfetiva;
    const ocupacaoMediaServidor = (razao * clientesFora) / s;
    const ociosidadeMediaServidor = 1 - ocupacaoMediaServidor;

    return {
      razao,
      P0,
      probabilidades,
      lambdaEfetiva,
      L,
      Lq,
      W,
      Wq,
      clientesFora,
      ocupacaoMediaServidor,
      ociosidadeMediaServidor,
      probAlgumServidorOcioso
    };
  }

  const api = {
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
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.CalculosFilas = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
