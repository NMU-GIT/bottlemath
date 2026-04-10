(function () {
  const form = document.getElementById('restaurantMarkupForm');
  if (!form) {
    return;
  }

  const ids = {
    markupMultiple: document.getElementById('m_markupMultiple'),
    markupPercent: document.getElementById('m_markupPercent'),
    grossMargin: document.getElementById('m_grossMargin'),
    revenuePerGlass: document.getElementById('m_revenuePerGlass'),
    costPerGlass: document.getElementById('m_costPerGlass')
  };

  const read = (name) => Number(form.elements[name].value);

  const fmtMoney = (value) =>
    new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 2
    }).format(value);

  const fmtPct = (value) => value.toLocaleString('en-GB', { maximumFractionDigits: 1 }) + '%';
  const fmtRatio = (value) => value.toLocaleString('en-GB', { maximumFractionDigits: 2 }) + 'x';

  function calculate() {
    const retailCost = Math.max(0, read('retailCost'));
    const listPrice = Math.max(0, read('listPrice'));
    const bottleSize = Math.max(100, read('bottleSizeMl'));
    const pourSize = Math.max(50, read('pourSizeMl'));

    const markupMultiple = retailCost > 0 ? listPrice / retailCost : 0;
    const markupPercent = retailCost > 0 ? ((listPrice - retailCost) / retailCost) * 100 : 0;
    const grossMargin = listPrice > 0 ? ((listPrice - retailCost) / listPrice) * 100 : 0;

    const glasses = bottleSize / pourSize;
    const revenuePerGlass = glasses > 0 ? listPrice / glasses : 0;
    const costPerGlass = glasses > 0 ? retailCost / glasses : 0;

    ids.markupMultiple.textContent = fmtRatio(markupMultiple);
    ids.markupPercent.textContent = fmtPct(markupPercent);
    ids.grossMargin.textContent = fmtPct(grossMargin);
    ids.revenuePerGlass.textContent = fmtMoney(revenuePerGlass);
    ids.costPerGlass.textContent = fmtMoney(costPerGlass);
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    calculate();
  });

  form.addEventListener('input', calculate);
  form.addEventListener('change', calculate);

  calculate();
})();
