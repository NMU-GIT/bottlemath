(function () {
  const form = document.getElementById('homeSearchForm');
  if (!form) {
    return;
  }

  const input = document.getElementById('calculatorSearch');
  const clearButton = document.getElementById('clearSearch');
  const status = document.getElementById('searchStatus');
  const cards = Array.from(document.querySelectorAll('.cards > .card'));

  const normalize = (text) =>
    String(text)
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();

  function updateStatus(visible, total, query) {
    if (!status) {
      return;
    }

    if (!query) {
      status.textContent = 'Showing all calculators.';
      return;
    }

    status.textContent =
      'Showing ' +
      visible.toLocaleString('en-GB') +
      ' of ' +
      total.toLocaleString('en-GB') +
      ' calculators for "' +
      query +
      '".';
  }

  function writeQueryToUrl(query) {
    const url = new URL(window.location.href);
    if (query) {
      url.searchParams.set('q', query);
    } else {
      url.searchParams.delete('q');
    }

    const next = url.pathname + (url.search ? url.search : '') + url.hash;
    window.history.replaceState({}, '', next);
  }

  function applyFilter(rawQuery, syncUrl) {
    const query = normalize(rawQuery);
    const total = cards.length;
    let visible = 0;

    cards.forEach(function (card) {
      const haystack = normalize(card.textContent);
      const match = !query || haystack.indexOf(query) !== -1;
      card.classList.toggle('is-hidden', !match);
      if (match) {
        visible += 1;
      }
    });

    updateStatus(visible, total, rawQuery.trim());

    if (syncUrl) {
      writeQueryToUrl(query ? rawQuery.trim() : '');
    }
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    applyFilter(input.value, true);
  });

  input.addEventListener('input', function () {
    applyFilter(input.value, true);
  });

  if (clearButton) {
    clearButton.addEventListener('click', function () {
      input.value = '';
      applyFilter('', true);
      input.focus();
    });
  }

  const initialQuery = new URLSearchParams(window.location.search).get('q') || '';
  if (initialQuery) {
    input.value = initialQuery;
  }

  applyFilter(initialQuery, false);
})();
