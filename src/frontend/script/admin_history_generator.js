/**
 * admin_history_generator.js
 * Fetches and displays admin ride history with a modern card interface,
 * strictly showing original data points with enhanced aesthetics for passenger feedback.
 */

document.addEventListener("DOMContentLoaded", () => {
  fetch("/api/admin/history")
    .then(res => {
      if (!res.ok) {
        return res.json().then(errData => {
          throw new Error(errData.message || `Napaka pri pridobivanju podatkov: ${res.status}`);
        }).catch(() => {
          throw new Error(`Napaka pri pridobivanju podatkov: ${res.status}`);
        });
      }
      return res.json();
    })
    .then(({ success, data, message }) => {
      if (!success) {
        throw new Error(message || "Prišlo je do napake pri nalaganju zgodovine.");
      }

      const container = document.getElementById("booking-container");
      if (!container) {
        console.error("Element 'booking-container' not found.");
        return;
      }
      
      container.innerHTML = ''; // Clear previous content

      if (!data || data.length === 0) {
        container.innerHTML = "<p style='text-align: center; padding: 20px; color: var(--white);'>Ni podatkov o zgodovini voženj.</p>";
        return;
      }

      data.forEach((ride) => {
        const card = document.createElement("div");
        card.className = "booking-card fade-in";

        const driverName = `${ride.Voznik_ime || ''} ${ride.Voznik_priimek || ''}`.trim() || "Neznan voznik";
        const departureFullDateTime = ride.Cas_odhoda ? new Date(ride.Cas_odhoda).toLocaleString('sl-SI', { dateStyle: 'medium', timeStyle: 'short' }) : "N/A";
        
        const departureLocation = ride.Lokacija_odhoda || 'Neznana';
        const arrivalLocation = ride.Lokacija_prihoda || 'Neznana';
        const rideId = ride.IdPrevoz; // Will be conditionally rendered
        const price = ride.Cena !== undefined ? `${ride.Cena}€` : ""; // Conditionally rendered

        const animationDelayBase = 0.2;

        // --- Passenger Details ---
        let passengerCardsHTML = '';
        if (ride.potniki && ride.potniki.length > 0) {
            passengerCardsHTML = ride.potniki.map(p => {
                const potnikImePriimek = `${p.Potnik_ime || ''} ${p.Potnik_priimek || ''}`.trim();
                
                let mnenjeOVoznikuHTML = '';
                if (p.Ocena_za_voznika || p.Komentar_za_voznika) {
                    mnenjeOVoznikuHTML = `
                        <div style="margin-top: 0.5rem;">
                            <strong style="font-size: 0.9em; color: rgba(255,255,255,0.75);">Mnenje o vozniku:</strong>
                            ${p.Ocena_za_voznika ? `<p style="font-size: 0.9em; margin: 0.25rem 0 0.25rem 1em;">Ocena: ${p.Ocena_za_voznika} ⭐</p>` : ''}
                            ${p.Komentar_za_voznika ? `<p style="font-size: 0.9em; margin: 0.25rem 0 0.25rem 1em;">Komentar: ${p.Komentar_za_voznika}</p>` : ''}
                        </div>
                    `;
                }

                let voznikovoMnenjeHTML = '';
                if (p.Ocena_voznika_za_potnika || p.Komentar_voznika_za_potnika) {
                    voznikovoMnenjeHTML = `
                        <div style="margin-top: 0.5rem;">
                            <strong style="font-size: 0.9em; color: rgba(255,255,255,0.75);">Voznikovo mnenje o potniku:</strong>
                            ${p.Ocena_voznika_za_potnika ? `<p style="font-size: 0.9em; margin: 0.25rem 0 0.25rem 1em;">Ocena: ${p.Ocena_voznika_za_potnika} ⭐</p>` : ''}
                            ${p.Komentar_voznika_za_potnika ? `<p style="font-size: 0.9em; margin: 0.25rem 0 0.25rem 1em;">Komentar: ${p.Komentar_voznika_za_potnika}</p>` : ''}
                        </div>
                    `;
                }
                
                const noFeedbackHTML = (!mnenjeOVoznikuHTML && !voznikovoMnenjeHTML && potnikImePriimek) ? `<p style="font-size: 0.9em; color: rgba(255,255,255,0.6); margin-top: 0.5rem;">Ni oddanih mnenj za tega potnika.</p>` : '';

                if (!potnikImePriimek && !mnenjeOVoznikuHTML && !voznikovoMnenjeHTML) return ''; // Skip empty passenger entries

                return `
                    <div class="passenger-feedback-card" style="background: var(--dark-medium); border-radius: 8px; padding: 1rem; margin-bottom: 1rem; border: 1px solid rgba(255,215,0,0.15); box-shadow: 0 3px 6px rgba(0,0,0,0.1);">
                        ${potnikImePriimek ? `<p style="font-weight: 700; color: var(--gold); margin-bottom: 0.75rem; font-size: 1.05em;">Potnik: ${potnikImePriimek}</p>` : ''}
                        ${mnenjeOVoznikuHTML}
                        ${voznikovoMnenjeHTML}
                        ${noFeedbackHTML}
                    </div>
                `;
            }).join('');
        }

        let passengerSectionHTML = '';
        // Only create the "Mnenja Potnikov" section if there's actual content to show
        if (passengerCardsHTML.trim() !== '') { 
            passengerSectionHTML = `
                <div class="passengers-container slide-up" style="animation-delay: ${animationDelayBase + 0.2}s; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,215,0,0.2);">
                    <h4 style="margin-bottom: 1.25rem; color: var(--gold); font-weight: 700; font-size: 1.15em;">Mnenja Potnikov:</h4>
                    ${passengerCardsHTML}
                </div>
            `;
        }
        // --- End Passenger Details ---

        card.innerHTML = `
          <div class="booking-header">
            <h2 class="booking-title">
              <i class="fas fa-bus" style="margin-right: 10px;"></i>${driverName}
            </h2>
            <div style="font-size: 0.9em; color: rgba(255,255,255,0.8);">${departureFullDateTime}</div>
          </div>
          <div class="booking-body">
            <div class="route-display slide-up" style="animation-delay: ${animationDelayBase}s">
              <div class="location">
                <div class="location-name">${departureLocation}</div>
                ${'' /* No separate time here, header has full date/time */}
              </div>
              <div class="route-line"></div>
              <div class="location">
                <div class="location-name">${arrivalLocation}</div>
                ${'' /* No separate time here */}
              </div>
            </div>
            
            ${rideId ? `
            <div class="booking-details" style="margin-top: 1rem;"> ${'' /* Grid container, even for one item */}
              <div class="detail-card slide-up" style="animation-delay: ${animationDelayBase + 0.1}s">
                <div class="detail-label">ID Vožnje</div>
                <div class="detail-value">${rideId}</div>
              </div>
            </div>
            ` : ''}

            ${passengerSectionHTML}
            
            ${price ? `
            <div class="price-section slide-up" style="animation-delay: ${animationDelayBase + (passengerSectionHTML ? 0.3 : 0.2)}s; margin-top: 2rem;">
              <div class="price-info">
                <div class="price-amount">${price}</div>
              </div>
            </div>
            ` : ''}
          </div>
        `;
        container.appendChild(card);
      });
    })
    .catch(err => {
      console.error("Error fetching or processing admin history:", err);
      const container = document.getElementById("booking-container");
      if (container) {
        container.innerHTML = `<p style="color: red; text-align: center; padding: 20px;">Napaka pri nalaganju zgodovine: ${err.message}</p>`;
      }
    });
});