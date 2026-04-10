(function () {
  const form = document.getElementById('primeurForm');
  if (!form) {
    return;
  }

  const ids = {
    bottles: document.getElementById('p_bottles'),
    inBond: document.getElementById('p_inBond'),
    duty: document.getElementById('p_duty'),
    vat: document.getElementById('p_vat'),
    total: document.getElementById('p_total'),
    perBottle: document.getElementById('p_perBottle')
  };

  const read = (name) => {
    const input = form.elements[name];
    return Number(input.value);
  };

  const fmtMoney = (value) =>
    new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 2
    }).format(value);

  const fmtInt = (value) => Math.round(value).toLocaleString('en-GB');

  function calculate() {
    const cases = Math.max(0, read('cases'));
    const bottlesPerCase = Math.max(0, read('bottlesPerCase'));
    const bottleSizeMl = Math.max(0, read('bottleSizeMl'));
    const abv = Math.max(0, read('abv'));
    const pricePerCase = Math.max(0, read('pricePerCase'));
    const dutyPerLpa = Math.max(0, read('dutyPerLpa'));
    const vatRate = Math.max(0, read('vatRate'));
    const shipping = Math.max(0, read('shipping'));
    const storage = Math.max(0, read('storage'));
    const otherFees = Math.max(0, read('otherFees'));

    const totalBottles = cases * bottlesPerCase;
    const inBond = cases * pricePerCase;

    const litersPerBottle = bottleSizeMl / 1000;
    const alcoholFraction = abv / 100;
    const lpaPerBottle = litersPerBottle * alcoholFraction;
    const totalLpa = lpaPerBottle * totalBottles;

    const duty = totalLpa * dutyPerLpa;
    const preVatTotal = inBond + duty + shipping + storage + otherFees;
    const vat = preVatTotal * (vatRate / 100);
    const total = preVatTotal + vat;
    const perBottle = totalBottles > 0 ? total / totalBottles : 0;

    ids.bottles.textContent = fmtInt(totalBottles);
    ids.inBond.textContent = fmtMoney(inBond);
    ids.duty.textContent = fmtMoney(duty);
    ids.vat.textContent = fmtMoney(vat);
    ids.total.textContent = fmtMoney(total);
    ids.perBottle.textContent = fmtMoney(perBottle);
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    calculate();
  });
  form.addEventListener('input', calculate);
  form.addEventListener('change', calculate);

  calculate();
})();
