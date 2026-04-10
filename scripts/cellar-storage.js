(function () {
  const form = document.getElementById('cellarStorageForm');
  if (!form) {
    return;
  }

  const ids = {
    storageTotal: document.getElementById('s_storageTotal'),
    insuranceTotal: document.getElementById('s_insuranceTotal'),
    handlingTotal: document.getElementById('s_handlingTotal'),
    grandTotal: document.getElementById('s_grandTotal'),
    perBottleYear: document.getElementById('s_perBottleYear')
  };

  const read = (name) => Number(form.elements[name].value);

  const fmtMoney = (value) =>
    new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 2
    }).format(value);

  function calculate() {
    const bottles = Math.max(0, read('bottles'));
    const years = Math.max(0, read('years'));
    const monthlyStoragePerBottle = Math.max(0, read('monthlyStoragePerBottle'));
    const avgBottleValue = Math.max(0, read('avgBottleValue'));
    const insuranceRate = Math.max(0, read('insuranceRate'));
    const annualHandling = Math.max(0, read('annualHandling'));

    const storageTotal = bottles * monthlyStoragePerBottle * 12 * years;
    const insuredValue = bottles * avgBottleValue;
    const insuranceTotal = insuredValue * (insuranceRate / 100) * years;
    const handlingTotal = annualHandling * years;
    const grandTotal = storageTotal + insuranceTotal + handlingTotal;

    const perBottleYear = bottles > 0 && years > 0 ? grandTotal / (bottles * years) : 0;

    ids.storageTotal.textContent = fmtMoney(storageTotal);
    ids.insuranceTotal.textContent = fmtMoney(insuranceTotal);
    ids.handlingTotal.textContent = fmtMoney(handlingTotal);
    ids.grandTotal.textContent = fmtMoney(grandTotal);
    ids.perBottleYear.textContent = fmtMoney(perBottleYear);
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    calculate();
  });

  form.addEventListener('input', calculate);
  form.addEventListener('change', calculate);

  calculate();
})();
