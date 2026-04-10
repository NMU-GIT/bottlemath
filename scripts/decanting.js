(function () {
  const form = document.getElementById('decantingForm');
  if (!form) {
    return;
  }

  const BASE_MINUTES = {
    light_red: 35,
    full_red: 75,
    white: 15,
    rose: 5,
    sparkling: 0,
    dessert: 20
  };

  const ids = {
    age: document.getElementById('q_age'),
    decantTime: document.getElementById('q_decantTime'),
    approach: document.getElementById('q_approach'),
    servingWindow: document.getElementById('q_servingWindow')
  };

  const read = (name) => Number(form.elements[name].value);
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function calculate() {
    const currentYear = new Date().getFullYear();
    const style = form.elements.style.value;
    const vintage = Math.round(read('vintage'));
    const tannin = clamp(read('tannin'), 1, 5);

    const age = clamp(currentYear - vintage, 0, 120);
    const base = BASE_MINUTES[style] || 30;

    let ageAdjust = 0;
    if (age <= 3) {
      ageAdjust += 20;
    } else if (age <= 7) {
      ageAdjust += 10;
    } else if (age >= 20) {
      ageAdjust -= 50;
    } else if (age >= 12) {
      ageAdjust -= 25;
    }

    let tanninAdjust = 0;
    if (style === 'light_red' || style === 'full_red') {
      tanninAdjust = (tannin - 3) * 10;
    }

    const minutes = clamp(Math.round(base + ageAdjust + tanninAdjust), 0, 180);

    let approach = 'Standard decant.';
    if (style === 'sparkling') {
      approach = 'Do not decant sparkling wine. Chill and serve directly.';
    } else if (age >= 20) {
      approach = 'Slow decant for sediment and serve promptly.';
    } else if (minutes <= 20) {
      approach = 'Pop and pour or brief splash decant.';
    } else if (minutes <= 60) {
      approach = 'Standard decant with one taste check midway.';
    } else {
      approach = 'Extended decant. Re-taste every 20 minutes.';
    }

    let servingWindow = 'Best within 1-2 hours after opening.';
    if (style === 'sparkling') {
      servingWindow = 'Drink immediately after opening.';
    } else if (age >= 15) {
      servingWindow = 'Best in the first 45-90 minutes.';
    } else if (age <= 4) {
      servingWindow = 'Can evolve for 2-4 hours once opened.';
    }

    ids.age.textContent = age.toLocaleString('en-GB') + ' years';
    ids.decantTime.textContent = minutes.toLocaleString('en-GB') + ' min';
    ids.approach.textContent = approach;
    ids.servingWindow.textContent = servingWindow;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    calculate();
  });

  form.addEventListener('input', calculate);
  form.addEventListener('change', calculate);

  calculate();
})();
