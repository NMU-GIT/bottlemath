(function () {
  const form = document.getElementById('dutyFreeForm');
  if (!form) {
    return;
  }

  const PRESETS = {
    uk: { allowanceLiters: 18, currency: 'GBP' },
    us: { allowanceLiters: 1, currency: 'USD' },
    singapore: { allowanceLiters: 2, currency: 'SGD' },
    australia: { allowanceLiters: 2.25, currency: 'AUD' },
    eu_guideline: { allowanceLiters: 90, currency: 'EUR' }
  };

  const ids = {
    allowance: document.getElementById('d_allowance'),
    carried: document.getElementById('d_carried'),
    excessLiters: document.getElementById('d_excessLiters'),
    excessBottles: document.getElementById('d_excessBottles'),
    duty: document.getElementById('d_duty'),
    tax: document.getElementById('d_tax'),
    totalCharges: document.getElementById('d_totalCharges')
  };

  const read = (name) => Number(form.elements[name].value);

  function formatMoney(value, currency) {
    try {
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 2
      }).format(value);
    } catch (_error) {
      return value.toFixed(2) + ' ' + currency;
    }
  }

  const fmtNumber = (value) => value.toLocaleString('en-GB', { maximumFractionDigits: 2 });

  function applyPreset() {
    const destination = form.elements.destination.value;
    const preset = PRESETS[destination] || PRESETS.uk;
    form.elements.allowanceLiters.value = preset.allowanceLiters;
    form.elements.currency.value = preset.currency;
    calculate();
  }

  function calculate() {
    const bottles = Math.max(0, read('bottles'));
    const bottleSizeMl = Math.max(100, read('bottleSizeMl'));
    const allowanceLiters = Math.max(0, read('allowanceLiters'));
    const dutyPerLiter = Math.max(0, read('dutyPerLiter'));
    const taxRate = Math.max(0, read('taxRate'));
    const avgBottleValue = Math.max(0, read('avgBottleValue'));
    const currency = form.elements.currency.value || 'GBP';

    const bottleLiters = bottleSizeMl / 1000;
    const carriedLiters = bottles * bottleLiters;
    const excessLiters = Math.max(0, carriedLiters - allowanceLiters);
    const excessBottles = bottleLiters > 0 ? excessLiters / bottleLiters : 0;

    const duty = excessLiters * dutyPerLiter;
    const excessValue = excessBottles * avgBottleValue;
    const tax = excessValue * (taxRate / 100);
    const totalCharges = duty + tax;

    ids.allowance.textContent = fmtNumber(allowanceLiters) + ' L';
    ids.carried.textContent = fmtNumber(carriedLiters) + ' L';
    ids.excessLiters.textContent = fmtNumber(excessLiters) + ' L';
    ids.excessBottles.textContent = fmtNumber(excessBottles);
    ids.duty.textContent = formatMoney(duty, currency);
    ids.tax.textContent = formatMoney(tax, currency);
    ids.totalCharges.textContent = formatMoney(totalCharges, currency);
  }

  form.elements.destination.addEventListener('change', applyPreset);

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    calculate();
  });

  form.addEventListener('input', calculate);
  form.addEventListener('change', calculate);

  applyPreset();
})();
