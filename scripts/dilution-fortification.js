(function () {
  const form = document.getElementById('dilutionFortifyForm');
  if (!form) {
    return;
  }

  const ids = {
    addVolume: document.getElementById('df_addVolume'),
    finalVolume: document.getElementById('df_finalVolume'),
    finalAbv: document.getElementById('df_finalAbv'),
    message: document.getElementById('df_message')
  };

  const read = (name) => Number(form.elements[name].value);
  const fmt = (value, digits) => value.toLocaleString('en-GB', { maximumFractionDigits: digits });

  function calculate() {
    const mode = form.elements.mode.value;
    const currentVolume = Math.max(0, read('currentVolume'));
    const currentAbv = Math.max(0, read('currentAbv'));
    const targetAbv = Math.max(0, read('targetAbv'));
    const fortifierAbv = Math.max(0, read('fortifierAbv'));

    let addVolume = 0;
    let finalVolume = currentVolume;
    let finalAbv = currentAbv;
    let message = '';

    if (mode === 'dilute') {
      if (targetAbv <= 0 || targetAbv >= currentAbv) {
        message = 'For dilution, target ABV must be lower than current ABV.';
      } else {
        finalVolume = (currentVolume * currentAbv) / targetAbv;
        addVolume = Math.max(0, finalVolume - currentVolume);
        finalAbv = targetAbv;
        message = 'Add water gradually and re-check analytically before bottling.';
      }
    } else {
      if (targetAbv <= currentAbv) {
        message = 'For fortification, target ABV must exceed current ABV.';
      } else if (fortifierAbv <= targetAbv) {
        message = 'Fortifier ABV must be above target ABV for a valid blend.';
      } else {
        addVolume =
          (currentVolume * (targetAbv - currentAbv)) /
          Math.max(0.0001, fortifierAbv - targetAbv);
        finalVolume = currentVolume + addVolume;
        finalAbv = targetAbv;
        message = 'Mix thoroughly and allow integration time before final adjustment.';
      }
    }

    ids.addVolume.textContent = fmt(addVolume, 3) + ' L';
    ids.finalVolume.textContent = fmt(finalVolume, 3) + ' L';
    ids.finalAbv.textContent = fmt(finalAbv, 2) + '% ABV';
    ids.message.textContent = message;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    calculate();
  });

  form.addEventListener('input', calculate);
  form.addEventListener('change', calculate);

  calculate();
})();
