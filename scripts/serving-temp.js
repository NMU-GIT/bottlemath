(function () {
  const form = document.getElementById('servingTempForm');
  if (!form) {
    return;
  }

  const STYLE_TARGETS = {
    sparkling: 7,
    light_white: 8,
    full_white: 11,
    rose: 10,
    light_red: 14,
    full_red: 17,
    dessert: 9
  };

  const METHOD_RATES = {
    fridge: { cool: 0.22, warm: 0 },
    freezer: { cool: 0.75, warm: 0 },
    ice_bath: { cool: 1.1, warm: 0 },
    counter: { cool: 0, warm: 0.12 }
  };

  const ids = {
    targetDisplay: document.getElementById('t_targetDisplay'),
    time: document.getElementById('t_time'),
    startTemp: document.getElementById('t_startTemp'),
    targetTemp: document.getElementById('t_targetTemp'),
    method: document.getElementById('t_method'),
    guidance: document.getElementById('t_guidance')
  };

  const read = (name) => {
    const input = form.elements[name];
    return Number(input.value);
  };

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function cToF(tempC) {
    return (tempC * 9) / 5 + 32;
  }

  function round1(value) {
    return value.toLocaleString('en-GB', { maximumFractionDigits: 1 });
  }

  function formatMinutes(totalMinutes) {
    if (!isFinite(totalMinutes) || totalMinutes < 0) {
      return 'N/A';
    }

    if (totalMinutes < 1) {
      return '< 1 min';
    }

    if (totalMinutes < 60) {
      return Math.round(totalMinutes) + ' min';
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    if (minutes === 0) {
      return hours + ' h';
    }

    return hours + ' h ' + minutes + ' min';
  }

  function autoTargetFromStyle() {
    const style = form.elements.style.value;
    const suggested = STYLE_TARGETS[style] || 12;
    form.elements.targetTempC.value = suggested;
    calculate();
  }

  function calculate() {
    const startTemp = clamp(read('startTempC'), -5, 40);
    const targetTemp = clamp(read('targetTempC'), -5, 30);
    const bottleSizeMl = clamp(read('bottleSizeMl'), 187, 3000);
    const ambientTemp = clamp(read('ambientTempC'), 0, 35);
    const method = form.elements.method.value;

    const rates = METHOD_RATES[method] || METHOD_RATES.fridge;
    const bottleFactor = Math.pow(750 / bottleSizeMl, 0.6);

    let minutes = 0;
    let guidance = '';

    if (Math.abs(startTemp - targetTemp) < 0.1) {
      minutes = 0;
      guidance = 'Already at serving target temperature.';
    } else if (targetTemp < startTemp) {
      if (rates.cool <= 0) {
        guidance = 'Selected method does not cool. Use fridge, freezer, or ice bath.';
        minutes = NaN;
      } else {
        const coolRate = rates.cool * bottleFactor;
        minutes = (startTemp - targetTemp) / coolRate;
        guidance = 'Start tasting 5 minutes before the timer ends to avoid over-chilling.';
      }
    } else {
      if (rates.warm <= 0) {
        guidance = 'Selected method does not warm. Use counter rest for warming.';
        minutes = NaN;
      } else if (ambientTemp <= startTemp) {
        guidance = 'Ambient temperature is too low to warm this bottle.';
        minutes = NaN;
      } else {
        const reachable = Math.min(targetTemp, ambientTemp);
        minutes = (reachable - startTemp) / rates.warm;
        if (reachable < targetTemp) {
          guidance = 'Ambient temperature limits warming. Consider a slightly warmer room.';
        } else {
          guidance = 'Keep bottle shaded from direct sunlight while warming.';
        }
      }
    }

    const methodLabels = {
      fridge: 'Fridge cooling',
      freezer: 'Freezer quick chill',
      ice_bath: 'Ice-bath chill',
      counter: 'Counter warming'
    };

    ids.targetDisplay.textContent = round1(targetTemp) + ' C / ' + round1(cToF(targetTemp)) + ' F';
    ids.time.textContent = formatMinutes(minutes);
    ids.startTemp.textContent = round1(startTemp) + ' C / ' + round1(cToF(startTemp)) + ' F';
    ids.targetTemp.textContent = round1(targetTemp) + ' C / ' + round1(cToF(targetTemp)) + ' F';
    ids.method.textContent = methodLabels[method] || 'Method';
    ids.guidance.textContent = guidance;
  }

  form.elements.style.addEventListener('change', autoTargetFromStyle);

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    calculate();
  });

  form.addEventListener('input', calculate);
  form.addEventListener('change', calculate);

  autoTargetFromStyle();
})();
