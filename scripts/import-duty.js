(function () {
  const form = document.getElementById('importDutyForm');
  if (!form) {
    return;
  }

  const PRESETS = {
    uk: {
      currency: 'GBP',
      customsRate: 0,
      excisePerLpa: 31.64,
      salesTaxRate: 20
    },
    hk: {
      currency: 'HKD',
      customsRate: 0,
      excisePerLpa: 0,
      salesTaxRate: 0
    },
    sg: {
      currency: 'SGD',
      customsRate: 0,
      excisePerLpa: 0,
      salesTaxRate: 9
    },
    us: {
      currency: 'USD',
      customsRate: 0,
      excisePerLpa: 0,
      salesTaxRate: 0
    }
  };

  const ids = {
    currencyLabel: document.getElementById('i_currencyLabel'),
    cif: document.getElementById('i_cif'),
    customs: document.getElementById('i_customs'),
    excise: document.getElementById('i_excise'),
    tax: document.getElementById('i_tax'),
    total: document.getElementById('i_total'),
    perBottle: document.getElementById('i_perBottle'),
    lpa: document.getElementById('i_lpa')
  };

  const read = (name) => {
    const input = form.elements[name];
    return Number(input.value);
  };

  function getCurrency() {
    const value = form.elements.currencyCode.value;
    return value || 'GBP';
  }

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

  function formatNumber(value) {
    return value.toLocaleString('en-GB', { maximumFractionDigits: 3 });
  }

  function applyPreset() {
    const selected = form.elements.country.value;
    const preset = PRESETS[selected] || PRESETS.uk;

    form.elements.currencyCode.value = preset.currency;
    form.elements.customsRate.value = preset.customsRate;
    form.elements.excisePerLpa.value = preset.excisePerLpa;
    form.elements.salesTaxRate.value = preset.salesTaxRate;

    calculate();
  }

  function calculate() {
    const bottles = Math.max(0, read('bottles'));
    const bottleSizeMl = Math.max(0, read('bottleSizeMl'));
    const abv = Math.max(0, read('abv'));
    const wineValue = Math.max(0, read('wineValue'));
    const shippingInsurance = Math.max(0, read('shippingInsurance'));
    const customsRate = Math.max(0, read('customsRate'));
    const excisePerLpa = Math.max(0, read('excisePerLpa'));
    const salesTaxRate = Math.max(0, read('salesTaxRate'));
    const otherFees = Math.max(0, read('otherFees'));
    const currency = getCurrency();

    const litersPerBottle = bottleSizeMl / 1000;
    const lpa = bottles * litersPerBottle * (abv / 100);

    const cif = wineValue + shippingInsurance;
    const customs = cif * (customsRate / 100);
    const excise = lpa * excisePerLpa;
    const preTax = cif + customs + excise + otherFees;
    const tax = preTax * (salesTaxRate / 100);
    const total = preTax + tax;
    const perBottle = bottles > 0 ? total / bottles : 0;

    ids.currencyLabel.textContent = currency;
    ids.cif.textContent = formatMoney(cif, currency);
    ids.customs.textContent = formatMoney(customs, currency);
    ids.excise.textContent = formatMoney(excise, currency);
    ids.tax.textContent = formatMoney(tax, currency);
    ids.total.textContent = formatMoney(total, currency);
    ids.perBottle.textContent = formatMoney(perBottle, currency);
    ids.lpa.textContent = formatNumber(lpa);
  }

  form.elements.country.addEventListener('change', applyPreset);

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    calculate();
  });

  form.addEventListener('input', calculate);
  form.addEventListener('change', calculate);

  applyPreset();
})();
