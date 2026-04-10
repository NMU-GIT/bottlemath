(function () {
  const form = document.getElementById('brixAbvForm');
  if (!form) {
    return;
  }

  const ids = {
    brixNorm: document.getElementById('bx_brixNorm'),
    sgNorm: document.getElementById('bx_sgNorm'),
    potentialAbv: document.getElementById('bx_potentialAbv'),
    dryAbv: document.getElementById('bx_dryAbv')
  };

  const read = (name) => Number(form.elements[name].value);
  const fmt = (value, digits) => value.toLocaleString('en-GB', { maximumFractionDigits: digits });

  function sgFromBrix(brix) {
    return 1 + brix / (258.6 - (brix / 258.2) * 227.1);
  }

  function brixFromSg(sg) {
    return ((182.4601 * sg - 775.6821) * sg + 1262.7794) * sg - 669.5622;
  }

  function calculate() {
    const brixInput = Math.max(0, read('brix'));
    const sgInput = Math.max(0, read('sg'));

    let brix = brixInput;
    let sg = sgInput;

    if (brixInput > 0) {
      sg = sgFromBrix(brixInput);
    } else if (sgInput > 0.9) {
      brix = brixFromSg(sgInput);
    } else {
      brix = 0;
      sg = 1;
    }

    const potentialAbv = brix * 0.55;
    const dryAbv = Math.max(0, (sg - 1) * 131.25);

    ids.brixNorm.textContent = fmt(brix, 2) + ' Brix';
    ids.sgNorm.textContent = fmt(sg, 4) + ' SG';
    ids.potentialAbv.textContent = fmt(potentialAbv, 2) + '% ABV';
    ids.dryAbv.textContent = fmt(dryAbv, 2) + '% ABV';
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    calculate();
  });

  form.addEventListener('input', calculate);
  form.addEventListener('change', calculate);

  calculate();
})();
