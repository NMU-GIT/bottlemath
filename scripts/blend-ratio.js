(function () {
  const form = document.getElementById('blendRatioForm');
  if (!form) {
    return;
  }

  const ids = {
    totalVol: document.getElementById('bl_totalVol'),
    abv: document.getElementById('bl_abv'),
    acidity: document.getElementById('bl_acidity'),
    sugar: document.getElementById('bl_sugar'),
    targetRatio: document.getElementById('bl_targetRatio')
  };

  const read = (name) => Number(form.elements[name].value);
  const fmt = (value, digits) => value.toLocaleString('en-GB', { maximumFractionDigits: digits });

  function calculate() {
    const volA = Math.max(0, read('volA'));
    const abvA = Math.max(0, read('abvA'));
    const acidA = Math.max(0, read('acidA'));
    const sugarA = Math.max(0, read('sugarA'));

    const volB = Math.max(0, read('volB'));
    const abvB = Math.max(0, read('abvB'));
    const acidB = Math.max(0, read('acidB'));
    const sugarB = Math.max(0, read('sugarB'));

    const targetAbv = Math.max(0, read('targetAbv'));

    const totalVol = volA + volB;
    const blendAbv = totalVol > 0 ? (volA * abvA + volB * abvB) / totalVol : 0;
    const blendAcid = totalVol > 0 ? (volA * acidA + volB * acidB) / totalVol : 0;
    const blendSugar = totalVol > 0 ? (volA * sugarA + volB * sugarB) / totalVol : 0;

    let targetRatio = 'N/A';
    if (Math.abs(abvA - abvB) < 0.0001) {
      targetRatio = 'Components have equal ABV; ratio does not affect target ABV.';
    } else {
      const fractionA = (targetAbv - abvB) / (abvA - abvB);
      if (fractionA >= 0 && fractionA <= 1) {
        const fractionB = 1 - fractionA;
        targetRatio =
          fmt(fractionA * 100, 1) +
          '% A / ' +
          fmt(fractionB * 100, 1) +
          '% B (for ABV target)';
      } else {
        targetRatio = 'Target ABV is outside the range of these two components.';
      }
    }

    ids.totalVol.textContent = fmt(totalVol, 2) + ' L';
    ids.abv.textContent = fmt(blendAbv, 2) + '%';
    ids.acidity.textContent = fmt(blendAcid, 2) + ' g/L';
    ids.sugar.textContent = fmt(blendSugar, 2) + ' g/L';
    ids.targetRatio.textContent = targetRatio;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    calculate();
  });

  form.addEventListener('input', calculate);
  form.addEventListener('change', calculate);

  calculate();
})();
