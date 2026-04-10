(function () {
  const form = document.getElementById('chaptalizationForm');
  if (!form) {
    return;
  }

  const ids = {
    deltaBrix: document.getElementById('ch_deltaBrix'),
    sugarGrams: document.getElementById('ch_sugarGrams'),
    sugarKg: document.getElementById('ch_sugarKg'),
    abvGain: document.getElementById('ch_abvGain'),
    guidance: document.getElementById('ch_guidance')
  };

  const read = (name) => Number(form.elements[name].value);
  const fmt = (value, digits) => value.toLocaleString('en-GB', { maximumFractionDigits: digits });

  function calculate() {
    const currentBrix = Math.max(0, read('currentBrix'));
    const targetBrix = Math.max(0, read('targetBrix'));
    const volumeL = Math.max(0, read('volumeL'));

    const deltaBrix = Math.max(0, targetBrix - currentBrix);

    const sugarGrams = deltaBrix * 10 * volumeL;
    const sugarKg = sugarGrams / 1000;
    const abvGain = deltaBrix * 0.55;

    let guidance = 'Approximation: 1 Brix increase uses roughly 10 g sugar per liter.';
    if (deltaBrix <= 0) {
      guidance = 'Target Brix is not above current Brix; no sugar addition required.';
    }

    ids.deltaBrix.textContent = fmt(deltaBrix, 2) + ' Brix';
    ids.sugarGrams.textContent = fmt(sugarGrams, 0) + ' g';
    ids.sugarKg.textContent = fmt(sugarKg, 3) + ' kg';
    ids.abvGain.textContent = fmt(abvGain, 2) + '% ABV';
    ids.guidance.textContent = guidance;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    calculate();
  });

  form.addEventListener('input', calculate);
  form.addEventListener('change', calculate);

  calculate();
})();
