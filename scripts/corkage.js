(function () {
  const form = document.getElementById('corkageForm');
  if (!form) {
    return;
  }

  const ids = {
    breakEven: document.getElementById('k_breakEven'),
    byoTotal: document.getElementById('k_byoTotal'),
    restaurantTotal: document.getElementById('k_restaurantTotal'),
    savings: document.getElementById('k_savings'),
    percent: document.getElementById('k_percent')
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
    const retail = Math.max(0, read('retailBottlePrice'));
    const corkage = Math.max(0, read('corkageFee'));
    const restaurant = Math.max(0, read('restaurantBottlePrice'));
    const bottles = Math.max(1, read('bottleCount'));

    const byoPerBottle = retail + corkage;
    const breakEvenListPrice = byoPerBottle;

    const byoTotal = byoPerBottle * bottles;
    const restaurantTotal = restaurant * bottles;
    const savings = restaurantTotal - byoTotal;

    const pct = restaurantTotal > 0 ? (savings / restaurantTotal) * 100 : 0;

    ids.breakEven.textContent = fmtMoney(breakEvenListPrice);
    ids.byoTotal.textContent = fmtMoney(byoTotal);
    ids.restaurantTotal.textContent = fmtMoney(restaurantTotal);
    ids.savings.textContent = fmtMoney(savings);
    ids.percent.textContent = fmtPct(pct);
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    calculate();
  });

  form.addEventListener('input', calculate);
  form.addEventListener('change', calculate);

  calculate();
})();
