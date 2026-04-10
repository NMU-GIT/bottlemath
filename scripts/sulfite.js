(function () {
  const form = document.getElementById('sulfiteForm');
  if (!form) {
    return;
  }

  const ids = {
    delta: document.getElementById('su_delta'),
    so2mg: document.getElementById('su_so2mg'),
    kmsGrams: document.getElementById('su_kmsGrams'),
    tablets: document.getElementById('su_tablets'),
    note: document.getElementById('su_note')
  };

  const read = (name) => Number(form.elements[name].value);
  const fmt = (value, digits) => value.toLocaleString('en-GB', { maximumFractionDigits: digits });

  function calculate() {
    const volumeL = Math.max(0, read('volumeL'));
    const currentFree = Math.max(0, read('currentFree'));
    const targetFree = Math.max(0, read('targetFree'));
    const kmsStrength = Math.max(1, read('kmsStrength'));
    const tabletWeight = Math.max(0.01, read('tabletWeight'));

    const delta = Math.max(0, targetFree - currentFree);
    const so2mg = delta * volumeL;
    const kmsGrams = so2mg / (1000 * (kmsStrength / 100));
    const tablets = kmsGrams / tabletWeight;

    let note = 'Assumes uniform mixing and no immediate SO2 binding loss.';
    if (delta <= 0) {
      note = 'Target free SO2 is not above current free SO2; addition is zero.';
    }

    ids.delta.textContent = fmt(delta, 1) + ' mg/L';
    ids.so2mg.textContent = fmt(so2mg, 0) + ' mg SO2';
    ids.kmsGrams.textContent = fmt(kmsGrams, 3) + ' g KMS';
    ids.tablets.textContent = fmt(tablets, 2) + ' tablets';
    ids.note.textContent = note;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    calculate();
  });

  form.addEventListener('input', calculate);
  form.addEventListener('change', calculate);

  calculate();
})();
