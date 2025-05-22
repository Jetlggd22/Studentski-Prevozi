document.addEventListener("DOMContentLoaded", () => {
  const searchForm = document.querySelector('.search-form');
  const fromInput = document.querySelector('input[name="from"]');
  const toInput = document.querySelector('input[name="to"]');
  const container = document.querySelector('.py-5');

  async function fetchPrevozi() {
    try {
      const res = await fetch('/api/prevozi');
      const prevozi = await res.json();
      return prevozi;
    } catch (error) {
      console.error('Napaka pri pridobivanju prevozov:', error);
      return [];
    }
  }

  function renderPrevozi(prevozi) {
    container.innerHTML = '';

    if (prevozi.length === 0) {
      container.innerHTML = '<p>Ni najdenih rezultatov.</p>';
      return;
    }

    prevozi.forEach(prevoz => {
      const card = document.createElement('div');
      card.className = 'booking-card fade-in';
      card.innerHTML = `
        <div class="booking-header">
          <h2 class="booking-title"><i class="fas fa-bus"></i> ${prevoz.voznik}</h2>
        </div>
        <div class="booking-body">
          <div class="route-display slide-up">
            <div class="location">
              <div class="location-name">${prevoz.ime_odhod}</div>
              <div class="location-time">${new Date(prevoz.Cas_odhoda).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            <div class="route-line"></div>
            <div class="location">
              <div class="location-name">${prevoz.ime_prihod}</div>
              <div class="location-time">---</div>
            </div>
          </div>
          <div class="booking-details">
            <div class="detail-card slide-up"><div class="detail-label">Odhod</div><div class="detail-value">${new Date(prevoz.Cas_odhoda).toLocaleDateString()}</div></div>
            <div class="detail-card slide-up"><div class="detail-label">Trajanje</div><div class="detail-value">---</div></div>
            <div class="detail-card slide-up"><div class="detail-label">Prosta Mesta</div><div class="detail-value">${prevoz.Prosta_mesta}</div></div>
          </div>
          <div class="price-section slide-up">
            <div class="price-info">
              <div class="price-amount">${prevoz.Cena} €</div>
            </div>
            <button class="book-btn">Rezerviraj <i class="fas fa-arrow-right"></i></button>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  function filterPrevozi(allPrevozi, from, to) {
    return allPrevozi.filter(p =>
      p.ime_odhod.toLowerCase().includes(from.toLowerCase()) &&
      p.ime_prihod.toLowerCase().includes(to.toLowerCase())
    );
  }

  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const allPrevozi = await fetchPrevozi();
    const filtered = filterPrevozi(allPrevozi, fromInput.value, toInput.value);
    renderPrevozi(filtered);
  });

  fetchPrevozi().then(renderPrevozi);
});
