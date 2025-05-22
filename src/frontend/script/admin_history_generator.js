document.addEventListener("DOMContentLoaded", () => {
  fetch("/api/admin/history")
    .then(res => res.json())
    .then(({ success, data }) => {
      if (!success) throw new Error("Ni zgodovine");
      const container = document.getElementById("booking-container");
      data.forEach(ride => {
        const card = document.createElement("div");
        card.className = "booking-card fade-in";
        card.innerHTML = `
          <div class="booking-header">
            <h3 class="booking-title">${ride.Voznik_ime} ${ride.Voznik_priimek}</h3>
            <div>${new Date(ride.Cas_odhoda).toLocaleString()}</div>
          </div>
          <div class="booking-details">
            <div class="price-section">
              <div class="price-amount">${ride.Cena}€</div>
            </div>
            <div class="detail-card">
              <p><strong>Relacija:</strong> ${ride.Lokacija_odhoda} → ${ride.Lokacija_prihoda}</p>
              <p><strong>ID vožnje:</strong> ${ride.IdPrevoz}</p>
              ${ride.potniki.map(p=>`
                <hr>
                <p><strong>Potnik:</strong> ${p.Potnik_ime} ${p.Potnik_priimek}</p>
                <p>Ocena za voznika: ${p.Ocena_za_voznika||"–"} ⭐</p>
                <p>Komentar za voznika: ${p.Komentar_za_voznika||"–"}</p>
                <p>Ocena voznika za potnika: ${p.Ocena_voznika_za_potnika||"–"} ⭐</p>
                <p>Komentar voznika za potnika: ${p.Komentar_voznika_za_potnika||"–"}</p>
              `).join("")}
            </div>
          </div>
        `;
        container.appendChild(card);
      });
    })
    .catch(err => console.error(err));
});
