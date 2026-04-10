(function () {
  const form = document.getElementById('cellarRoiForm');
  if (!form) {
    return;
  }

  const ids = {
    cashOut: document.getElementById('r_cashOut'),
    grossAfterFees: document.getElementById('r_grossAfterFees'),
    tax: document.getElementById('r_tax'),
    netCashIn: document.getElementById('r_netCashIn'),
    netProfit: document.getElementById('r_netProfit'),
    profitPerBottle: document.getElementById('r_profitPerBottle'),
    breakEvenSale: document.getElementById('r_breakEvenSale'),
    annualized: document.getElementById('r_annualized')
  };

  const read = (name) => Number(form.elements[name].value);

  const fmtMoney = (value) =>
    new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 2
    }).format(value);

  const fmtPct = (value) => value.toLocaleString('en-GB', { maximumFractionDigits: 2 }) + '%';

  function calculate() {
    const purchaseTotal = Math.max(0, read('purchaseTotal'));
    const bottles = Math.max(0, read('bottles'));
    const annualCarry = Math.max(0, read('annualCarry'));
    const years = Math.max(0.1, read('years'));
    const expectedSale = Math.max(0, read('expectedSale'));
    const commissionPct = Math.min(99, Math.max(0, read('commissionPct')));
    const sellerFees = Math.max(0, read('sellerFees'));
    const taxRate = Math.max(0, read('taxRate'));

    const totalCashOut = purchaseTotal + annualCarry * years;
    const grossAfterFees = expectedSale * (1 - commissionPct / 100) - sellerFees;
    const gainBeforeTax = grossAfterFees - totalCashOut;
    const tax = gainBeforeTax > 0 ? gainBeforeTax * (taxRate / 100) : 0;
    const netCashIn = grossAfterFees - tax;
    const netProfit = netCashIn - totalCashOut;
    const profitPerBottle = bottles > 0 ? netProfit / bottles : 0;

    const breakEvenSale = (totalCashOut + sellerFees) / (1 - commissionPct / 100);

    let annualized = null;
    if (totalCashOut > 0 && netCashIn > 0) {
      annualized = (Math.pow(netCashIn / totalCashOut, 1 / years) - 1) * 100;
    }

    ids.cashOut.textContent = fmtMoney(totalCashOut);
    ids.grossAfterFees.textContent = fmtMoney(grossAfterFees);
    ids.tax.textContent = fmtMoney(tax);
    ids.netCashIn.textContent = fmtMoney(netCashIn);
    ids.netProfit.textContent = fmtMoney(netProfit);
    ids.profitPerBottle.textContent = fmtMoney(profitPerBottle);
    ids.breakEvenSale.textContent = fmtMoney(breakEvenSale);
    ids.annualized.textContent = annualized === null ? 'N/A' : fmtPct(annualized);
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    calculate();
  });

  form.addEventListener('input', calculate);
  form.addEventListener('change', calculate);

  calculate();
})();
