(function () {
  const form = document.getElementById('weddingForm');
  if (!form) {
    return;
  }

  const ids = {
    totalGlasses: document.getElementById('w_totalGlasses'),
    totalBottles: document.getElementById('w_totalBottles'),
    totalCases: document.getElementById('w_totalCases'),
    budget: document.getElementById('w_budget'),
    red: document.getElementById('w_red'),
    white: document.getElementById('w_white'),
    sparkling: document.getElementById('w_sparkling')
  };

  const read = (name) => {
    const input = form.elements[name];
    return Number(input.value);
  };

  const fmtInt = (value) => Math.round(value).toLocaleString('en-GB');
  const fmtMoney = (value) =>
    new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0
    }).format(value);

  function calculate() {
    const guests = Math.max(0, read('guests'));
    const drinkersPct = Math.min(100, Math.max(0, read('drinkersPct')));
    const hours = Math.max(0, read('hours'));
    const glassesPerHour = Math.max(0, read('glassesPerHour'));
    const avgBottlePrice = Math.max(0, read('avgBottlePrice'));

    const redShare = Math.max(0, read('redShare'));
    const whiteShare = Math.max(0, read('whiteShare'));
    const sparklingShare = Math.max(0, read('sparklingShare'));

    const drinkers = guests * (drinkersPct / 100);
    const totalGlasses = drinkers * hours * glassesPerHour;
    const totalBottles = Math.ceil(totalGlasses / 5);
    const totalCases = Math.ceil(totalBottles / 12);
    const budget = totalBottles * avgBottlePrice;

    const splitTotal = redShare + whiteShare + sparklingShare;
    const ratios =
      splitTotal > 0
        ? [
            { key: 'red', ratio: redShare / splitTotal },
            { key: 'white', ratio: whiteShare / splitTotal },
            { key: 'sparkling', ratio: sparklingShare / splitTotal }
          ]
        : [
            { key: 'red', ratio: 0.45 },
            { key: 'white', ratio: 0.45 },
            { key: 'sparkling', ratio: 0.1 }
          ];

    const allocations = ratios.map((item) => {
      const raw = totalBottles * item.ratio;
      return {
        key: item.key,
        count: Math.floor(raw),
        remainder: raw - Math.floor(raw)
      };
    });

    let assigned = allocations.reduce((sum, item) => sum + item.count, 0);
    let remaining = Math.max(0, totalBottles - assigned);

    allocations.sort((a, b) => b.remainder - a.remainder);
    for (let i = 0; i < allocations.length && remaining > 0; i += 1) {
      allocations[i].count += 1;
      remaining -= 1;
    }

    if (remaining > 0) {
      allocations[0].count += remaining;
    }

    const getCount = (key) => allocations.find((item) => item.key === key).count;
    const redBottles = getCount('red');
    const whiteBottles = getCount('white');
    const sparklingBottles = getCount('sparkling');

    ids.totalGlasses.textContent = fmtInt(totalGlasses);
    ids.totalBottles.textContent = fmtInt(totalBottles);
    ids.totalCases.textContent = fmtInt(totalCases);
    ids.budget.textContent = fmtMoney(budget);
    ids.red.textContent = fmtInt(redBottles);
    ids.white.textContent = fmtInt(whiteBottles);
    ids.sparkling.textContent = fmtInt(sparklingBottles);
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    calculate();
  });
  form.addEventListener('input', calculate);
  form.addEventListener('change', calculate);

  calculate();
})();
