(function () {
  const form = document.getElementById('byGlassForm');
  if (!form) {
    return;
  }

  const ids = {
    sellableGlasses: document.getElementById('g_sellableGlasses'),
    revenuePerBottle: document.getElementById('g_revenuePerBottle'),
    grossProfitPerBottle: document.getElementById('g_grossProfitPerBottle'),
    grossMargin: document.getElementById('g_grossMargin'),
    weeklyGrossProfit: document.getElementById('g_weeklyGrossProfit'),
    breakEvenPrice: document.getElementById('g_breakEvenPrice')
  };

  const read = (name) => Number(form.elements[name].value);

  const fmtMoney = (value) =>
    new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 2
    }).format(value);

  const fmtPct = (value) => value.toLocaleString('en-GB', { maximumFractionDigits: 1 }) + '%';

  function calculate() {
    const bottleCost = Math.max(0, read('bottleCost'));
    const bottleSizeMl = Math.max(100, read('bottleSizeMl'));
    const pourSizeMl = Math.max(25, read('pourSizeMl'));
    const menuPrice = Math.max(0, read('menuPrice'));
    const wastagePct = Math.min(30, Math.max(0, read('wastagePct')));
    const bottlesPerWeek = Math.max(0, read('bottlesPerWeek'));

    const usableMl = bottleSizeMl * (1 - wastagePct / 100);
    const sellableGlasses = Math.floor(usableMl / pourSizeMl);

    const revenuePerBottle = sellableGlasses * menuPrice;
    const grossProfitPerBottle = revenuePerBottle - bottleCost;
    const grossMargin = revenuePerBottle > 0 ? (grossProfitPerBottle / revenuePerBottle) * 100 : 0;
    const weeklyGrossProfit = grossProfitPerBottle * bottlesPerWeek;
    const breakEvenPrice = sellableGlasses > 0 ? bottleCost / sellableGlasses : 0;

    ids.sellableGlasses.textContent = sellableGlasses.toLocaleString('en-GB');
    ids.revenuePerBottle.textContent = fmtMoney(revenuePerBottle);
    ids.grossProfitPerBottle.textContent = fmtMoney(grossProfitPerBottle);
    ids.grossMargin.textContent = fmtPct(grossMargin);
    ids.weeklyGrossProfit.textContent = fmtMoney(weeklyGrossProfit);
    ids.breakEvenPrice.textContent = fmtMoney(breakEvenPrice);
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    calculate();
  });

  form.addEventListener('input', calculate);
  form.addEventListener('change', calculate);

  calculate();
})();
