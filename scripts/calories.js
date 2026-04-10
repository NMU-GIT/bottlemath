(function () {
  const form = document.getElementById('calorieForm');
  if (!form) {
    return;
  }

  const ids = {
    unitsServing: document.getElementById('c_unitsServing'),
    calServing: document.getElementById('c_calServing'),
    unitsTotal: document.getElementById('c_unitsTotal'),
    calTotal: document.getElementById('c_calTotal'),
    unitsBottle: document.getElementById('c_unitsBottle'),
    calBottle: document.getElementById('c_calBottle')
  };

  const read = (name) => {
    const input = form.elements[name];
    return Number(input.value);
  };

  const round2 = (value) => value.toLocaleString('en-GB', { maximumFractionDigits: 2 });
  const round0 = (value) => Math.round(value).toLocaleString('en-GB');

  function calculate() {
    const servingMl = Math.max(0, read('servingMl'));
    const abv = Math.max(0, read('abv'));
    const servings = Math.max(0, read('servings'));
    const bottleSizeMl = Math.max(0, read('bottleSizeMl'));

    const unitsPerServing = (servingMl * abv) / 1000;
    const caloriesPerServing = unitsPerServing * 56;

    const unitsTotal = unitsPerServing * servings;
    const caloriesTotal = caloriesPerServing * servings;

    const unitsPerBottle = (bottleSizeMl * abv) / 1000;
    const caloriesPerBottle = unitsPerBottle * 56;

    ids.unitsServing.textContent = round2(unitsPerServing);
    ids.calServing.textContent = round0(caloriesPerServing);
    ids.unitsTotal.textContent = round2(unitsTotal);
    ids.calTotal.textContent = round0(caloriesTotal);
    ids.unitsBottle.textContent = round2(unitsPerBottle);
    ids.calBottle.textContent = round0(caloriesPerBottle);
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    calculate();
  });
  form.addEventListener('input', calculate);
  form.addEventListener('change', calculate);

  calculate();
})();
