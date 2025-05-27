/**
 * admin_upcoming_rides_generator.js
 * Fetches and displays upcoming rides for the admin relacije page.
 */
document.addEventListener("DOMContentLoaded", () => {
  const ridesContainer = document.getElementById("upcoming-rides-container");
  if (!ridesContainer) {
    console.error("Container for upcoming rides (#upcoming-rides-container) not found.");
    return;
  }

  async function fetchAndRenderRides() {
    try {
      const res = await fetch("/api/prevozi"); // This endpoint is defined in your routes.js
      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch (e) {
          errorData = { message: `Napaka pri pridobivanju podatkov: ${res.status}` };
        }
        throw new Error(errorData.message || `Napaka pri pridobivanju podatkov: ${res.status}`);
      }
      
      const response = await res.json();

      if (!response.success || !response.data) {
        throw new Error(response.message || "Prišlo je do napake pri nalaganju prihajajočih voženj.");
      }

      const allRides = response.data;
      const now = new Date();
      const upcomingRides = allRides.filter(ride => {
        const departureTime = new Date(ride.Cas_odhoda);
        return departureTime > now; // Show only future rides
      });

      ridesContainer.innerHTML = ''; // Clear previous content or static examples

      if (upcomingRides.length === 0) {
        ridesContainer.innerHTML = "<p style='text-align: center; padding: 20px; color: var(--white);'>Trenutno ni na voljo prihajajočih voženj.</p>";
        return;
      }

      upcomingRides.forEach((ride) => {
        const card = document.createElement("div");
        card.className = "booking-card fade-in"; // Uses styles from Style.css
        card.setAttribute('data-ride-id', ride.IdPrevoz); // Add ride ID to the card for easy removal

        const driverName = ride.voznik || "Neznan voznik";
        const departureFullDateTime = ride.Cas_odhoda ? new Date(ride.Cas_odhoda).toLocaleString('sl-SI', { dateStyle: 'medium', timeStyle: 'short' }) : "N/A";
        const departureLocation = ride.ime_odhod || 'Neznana';
        const arrivalLocation = ride.ime_prihod || 'Neznana';
        const rideId = ride.IdPrevoz;
        const price = ride.Cena !== undefined ? `${ride.Cena}€` : "";
        const freeSeats = ride.Prosta_mesta;
        const vehicle = ride.avto; // Assuming 'avto' is part of the ride object from API
        const driverRating = ride.voznik_ocena; // Assuming 'voznik_ocena' is part of the ride object

        const animationDelayBase = 0.1;

        let rideDetailsHTML = '';
        if (rideId) {
            rideDetailsHTML += `<p style="margin-bottom: 0.5rem;"><strong>ID Vožnje:</strong> ${rideId}</p>`;
        }
        if (price) {
            rideDetailsHTML += `<p style="margin-bottom: 0.5rem;"><strong>Cena:</strong> ${price}</p>`;
        }
        if (freeSeats !== undefined) {
            rideDetailsHTML += `<p style="margin-bottom: 0.5rem;"><strong>Prosta mesta:</strong> ${freeSeats}</p>`;
        }
         if (vehicle) {
            rideDetailsHTML += `<p style="margin-bottom: 0.5rem;"><strong>Avto:</strong> ${vehicle}</p>`;
        }
        if (driverRating !== undefined && driverRating !== null) { // Check for null as well
            rideDetailsHTML += `<p style="margin-bottom: 0.5rem;"><strong>Ocena voznika:</strong> ${driverRating.toFixed(1)} ⭐</p>`;
        }


        card.innerHTML = `
          <div class="booking-header">
            <h2 class="booking-title" style="display: flex; align-items: center;">
              <i class="fas fa-bus" style="margin-right: 10px; font-size: 1.2em;"></i>${driverName}
            </h2>
            <div style="font-size: 0.9em; color: rgba(255,255,255,0.8);">${departureFullDateTime}</div>
          </div>
          <div class="booking-body">
            <div class="route-display slide-up" style="animation-delay: ${animationDelayBase}s;">
              <div class="location">
                <div class="location-name">${departureLocation}</div>
              </div>
              <div class="route-line"></div>
              <div class="location">
                <div class="location-name">${arrivalLocation}</div>
              </div>
            </div>
            
            ${rideDetailsHTML ? `
            <div class="ride-info-details slide-up" style="animation-delay: ${animationDelayBase + 0.1}s; margin-top: 1.5rem; padding: 1rem; background: var(--dark-medium); border-radius: 8px; border: 1px solid rgba(255,215,0,0.1);">
                ${rideDetailsHTML}
            </div>
            ` : ''}

            <div class="admin-actions slide-up" style="animation-delay: ${animationDelayBase + 0.2}s; margin-top: 1.5rem;">
              <button class="admin-btn edit-btn" data-id="${rideId || ''}">
                <i class="ri-edit-line"></i> Uredi
              </button>
              <button class="admin-btn delete-btn" data-id="${rideId || ''}">
                <i class="ri-delete-bin-line"></i> Izbriši
              </button>
            </div>
          </div>
        `;
        ridesContainer.appendChild(card);
      });
      
      attachEventListeners();

    } catch (err) {
      console.error("Error fetching or processing upcoming rides:", err);
      if (ridesContainer) {
        ridesContainer.innerHTML = `<p style="color: red; text-align: center; padding: 20px;">Napaka pri nalaganju prihajajočih voženj: ${err.message}</p>`;
      }
    }
  }

  function attachEventListeners() {
    ridesContainer.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (e) => {
        const rideId = e.currentTarget.dataset.id;
        alert(`Funkcija Uredi za vožnjo ID ${rideId} še ni implementirana.`);
        // TODO: Implement edit functionality (e.g., open modal, redirect to edit page)
        });
    });

    ridesContainer.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', async (e) => { // Made async
        const rideId = e.currentTarget.dataset.id;
        if (confirm(`Ali ste prepričani, da želite izbrisati vožnjo z ID ${rideId}?`)) {
            try {
                const response = await fetch(`/api/prevozi/${rideId}`, {
                    method: 'DELETE',
                });
                const result = await response.json();
                if (response.ok && result.success) {
                    alert(`Vožnja z ID ${rideId} je bila uspešno izbrisana.`);
                    // Remove the card from the UI
                    const cardToRemove = ridesContainer.querySelector(`.booking-card[data-ride-id="${rideId}"]`);
                    if (cardToRemove) {
                        cardToRemove.remove();
                    }
                     // Check if there are any rides left
                    if (ridesContainer.children.length === 0) {
                         ridesContainer.innerHTML = "<p style='text-align: center; padding: 20px; color: var(--white);'>Ni več prihajajočih voženj.</p>";
                    }
                } else {
                    alert(`Napaka pri brisanju vožnje: ${result.message || response.statusText}`);
                }
            } catch (error) {
                console.error('Error deleting ride:', error);
                alert('Prišlo je do napake pri brisanju vožnje.');
            }
        }
        });
    });
  }
  
  fetchAndRenderRides();
});