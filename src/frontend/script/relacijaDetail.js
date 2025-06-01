  // Global variable to store fetched prevoz details
    let fetchedPrevozDetails = null; 

    window.addEventListener('load', () => {
      setTimeout(() => {
        const loader = document.getElementById('loader');
        if (loader) {
          loader.style.opacity = '0';
          setTimeout(() => {
            loader.style.display = 'none';
          }, 500);
        }
      }, 1000);
    });

    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, easing: 'ease-in-out', once: true, mirror: false });
    }
    
    const header = document.getElementById('header');
    if (header) {
      window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
      });
    }

    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
      window.addEventListener('scroll', () => {
        backToTop.classList.toggle('show', window.scrollY > 300);
      });
      backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const overlay = document.getElementById('overlay');
    const navLinks = document.querySelectorAll('.nav-link');

    if (hamburger && navMenu && overlay) {
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : 'auto';
      });
      overlay.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
      });
      navLinks.forEach(link => {
          link.addEventListener('click', () => {
            if (hamburger.classList.contains('active')) { // Only if menu is open
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
          });
        });
    }
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return; 
        const target = document.querySelector(targetId);
        if (target && header) {
          const offset = target.getBoundingClientRect().top + window.scrollY - header.offsetHeight;
          window.scrollTo({ top: offset, behavior: 'smooth' });
        } else if (target) {
             window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY, behavior: 'smooth'});
        }
      });
    });

    function showMessageModal(title, message) {
      const modal = document.getElementById('messageModal');
      const modalTitle = document.getElementById('messageModalTitle');
      const modalText = document.getElementById('messageModalText');
      
      if (modal && modalTitle && modalText) {
        modalTitle.textContent = title;
        modalText.textContent = message;
        modal.style.display = 'flex';
      } else {
        alert(`${title}: ${message}`);
      }
    }
    
    // --- Main logic ---
    document.addEventListener('DOMContentLoaded', async () => {
        const loginProfilLink = document.getElementById('login_profil_link');
        if (loginProfilLink) {
            if (sessionStorage.getItem('user')) {
                loginProfilLink.innerHTML = '<i class="ri-user-line nav-icon"></i> Profil';
                loginProfilLink.href = 'Profil.html';
            } else {
                loginProfilLink.innerHTML = '<i class="ri-login-circle-line nav-icon"></i> Prijava';
                loginProfilLink.href = 'Login.html';
            }
        }

        const prevozDetailsContainer = document.getElementById('prevozDetailsContainer');
        if (!prevozDetailsContainer) {
            console.error("Element #prevozDetailsContainer ne obstaja.");
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const prevozId = urlParams.get('id');

        if (!prevozId) {
          prevozDetailsContainer.innerHTML = '<p class="text-center py-5" style="color:white;">ID prevoza ni podan v URL-ju.</p>';
          return;
        }

        try {
          const res = await fetch(`http://localhost:3000/api/prevozi/${prevozId}`);
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({ message: `HTTP napaka! Status: ${res.status}` }));
            throw new Error(errorData.message);
          }
          fetchedPrevozDetails = await res.json(); 

          if (!fetchedPrevozDetails || Object.keys(fetchedPrevozDetails).length === 0) {
              prevozDetailsContainer.innerHTML = '<p class="text-center py-5" style="color:white;">Podatki o prevozu niso bili najdeni.</p>';
              return;
          }

          renderPrevozDetails(fetchedPrevozDetails);
          await initializeButtonState(prevozId, fetchedPrevozDetails);

        } catch (error) {
          console.error('Napaka pri pridobivanju podrobnosti prevoza:', error);
          prevozDetailsContainer.innerHTML = `<p class="text-center py-5" style="color:red;">Napaka pri nalaganju podrobnosti prevoza: ${error.message}.</p>`;
        }
    });

    function renderPrevozDetails(prevozData) {
        const datumObj = new Date(prevozData.Cas_odhoda);
        const datum = datumObj.toLocaleDateString('sl-SI', {
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
        });
        const ura = datumObj.toLocaleTimeString('sl-SI', { hour: '2-digit', minute: '2-digit' });

        const html = `
          <div class="booking-card fade-in">
            <div class="booking-header">
              <h2 class="booking-title">
                <i class="ri-road-map-line"></i> Vožnja iz ${prevozData.Odhod_Ime || 'Neznano'} v ${prevozData.Prihod_Ime || 'Neznano'}
                <span style="float: right; font-size: 0.8em; color: var(--gold);">ID: ${prevozData.IdPrevoz}</span>
              </h2>
            </div>
            <div class="booking-body">
              <div class="route-display slide-up">
                <div class="location">
                  <div class="location-name">${prevozData.Odhod_Ime || 'Neznano'}</div>
                  <div class="location-time">${ura}</div>
                </div>
                <div class="route-line"></div>
                <div class="location">
                  <div class="location-name">${prevozData.Prihod_Ime || 'Neznano'}</div>
                  <div class="location-time">Pričakovani prihod...</div>
                </div>
              </div>
              <div class="booking-details">
                <div class="detail-card"><div class="detail-label">Datum</div><div class="detail-value">${datum}</div></div>
                <div class="detail-card"><div class="detail-label">Cena</div><div class="detail-value" id="detail-cena">${prevozData.Cena != null ? prevozData.Cena + '€' : 'N/A'}</div></div>
                <div class="detail-card"><div class="detail-label">Prosta mesta</div><div class="detail-value" id="detail-prosta-mesta">${prevozData.Prosta_mesta != null ? prevozData.Prosta_mesta : 'N/A'}</div></div>
                <div class="detail-card"><div class="detail-label">Ponavljanje</div><div class="detail-value">${prevozData.Ponavljanje || 'Ne ponavlja se'}</div></div>
                <div class="detail-card"><div class="detail-label">Avto</div><div class="detail-value">${prevozData.Voznik_Avto || 'Ni navedeno'}</div></div>
              </div>
              <div class="booking-details section-header" style="margin-top:2rem; margin-bottom:1rem; padding-bottom:0.5rem;">
                 <h2 style="font-size:1.3rem; color:var(--gold);"><i class="ri-user-star-line"></i> Podatki o vozniku</h2>
              </div>
              <div class="booking-details">
                <div class="detail-card"><div class="detail-label">Voznik</div><div class="detail-value">${prevozData.Voznik_Ime || ''} ${prevozData.Voznik_Priimek || ''}</div></div>
                <div class="detail-card"><div class="detail-label">Telefon</div><div class="detail-value">${prevozData.Voznik_Telefon || 'Ni navedeno'}</div></div>
                <div class="detail-card"><div class="detail-label">Uporabniško ime</div><div class="detail-value">${prevozData.Voznik_Username || 'Ni navedeno'}</div></div>
                <div class="detail-card"><div class="detail-label">Ocena voznika</div><div class="detail-value">${prevozData.Voznik_Ocena != null ? parseFloat(prevozData.Voznik_Ocena).toFixed(1) + ' ⭐' : 'Brez ocene'}</div></div>
                <div class="detail-card"><div class="detail-label">Datum registracije voznika</div><div class="detail-value">${prevozData.Voznik_Datum_registriranja ? new Date(prevozData.Voznik_Datum_registriranja).toLocaleDateString('sl-SI') : 'N/A'}</div></div>
              </div>
              <div class="map-placeholder" style="height: 300px; background-color: #2a2a2a; border-radius: 10px; margin: 30px 0; display:flex; align-items:center; justify-content:center;">
                <p style="color: #aaa; text-align: center; margin: 0;">Zemljevid poti bo prikazan tukaj (integracija v prihodnosti).</p>
              </div>
              <div class="price-section slide-up">
                <div class="price-info">
                  <div class="price-label" style="font-size:1rem;">Cena za sopotnika</div>
                  <div class="price-amount" style="font-size:2rem;">${prevozData.Cena != null ? prevozData.Cena + '€' : 'N/A'}</div>
                </div>
                <button class="book-btn btn" id="bookNowBtn">
                    Rezerviraj zdaj <i class="ri-arrow-right-line"></i>
                </button>
              </div>
            </div>
          </div>`;
        document.getElementById('prevozDetailsContainer').innerHTML = html;
    }

    function updateProstaMestaUI(newValue) {
        const el = document.getElementById('detail-prosta-mesta');
        if (el) el.textContent = newValue;
    }

    async function initializeButtonState(currentPrevozId, rideDetails) {
        const bookNowButton = document.getElementById('bookNowBtn');
        if (!bookNowButton) return;

        const userSessionData = sessionStorage.getItem('user');
        if (userSessionData) {
            let userData = JSON.parse(userSessionData);
            if (userData.data) userData = userData.data;
            const userId = userData.idUporabnik;

            if (userId) {
                try {
                    const res = await fetch(`http://localhost:3000/api/rezervacije/uporabnik/${userId}/prevoz/${currentPrevozId}`);
                    const statusData = await res.json();
                    if (statusData.success && statusData.data && ['čaka', 'potrjeno'].includes(statusData.data.Status)) {
                        updateButtonUI(bookNowButton, 'reserved', statusData.data.idRezervacija, currentPrevozId, rideDetails);
                    } else {
                        updateButtonUI(bookNowButton, 'available', null, currentPrevozId, rideDetails);
                    }
                } catch (err) {
                    console.error('Error fetching reservation status:', err);
                    updateButtonUI(bookNowButton, 'available', null, currentPrevozId, rideDetails);
                }
            } else {
                 updateButtonUI(bookNowButton, 'available', null, currentPrevozId, rideDetails); // No user ID in session
            }
        } else {
            // Not logged in
            updateButtonUI(bookNowButton, 'available', null, currentPrevozId, rideDetails);
        }
    }
    
    function updateButtonUI(button, state, reservationId, currentPrevozId, rideDetails) {
        button.onclick = null; // Clear previous listeners

        if (state === 'reserved') {
            button.textContent = 'Prekliči Rezervacijo';
            button.disabled = false;
            button.style.backgroundColor = '#dc3545'; // Red for cancel
            button.onclick = () => handlePrekliciRezervacijo(reservationId, currentPrevozId);
        } else { // 'available' or other states
            button.textContent = 'Rezerviraj zdaj';
            button.style.backgroundColor = 'var(--gold)';
            
            let userIsDriver = false;
            const userSession = sessionStorage.getItem('user');
            if (userSession) {
                let sessionUserData = JSON.parse(userSession);
                if (sessionUserData.data) sessionUserData = sessionUserData.data;
                if (rideDetails && sessionUserData.idUporabnik === rideDetails.Voznik_idUporabnik) {
                    userIsDriver = true;
                }
            }

            if (userIsDriver) {
                button.textContent = 'Vi ste voznik';
                button.disabled = true;
                button.style.backgroundColor = 'grey';
            } else if (rideDetails && rideDetails.Prosta_mesta <= 0) {
                button.textContent = 'Ni prostih mest';
                button.disabled = true;
                button.style.backgroundColor = 'grey';
            } else {
                button.disabled = false;
                button.onclick = () => handleRezervacija(currentPrevozId);
            }
        }
    }

    async function handleRezervacija(prevozIdToBook) {
        const bookNowButton = document.getElementById('bookNowBtn');
        let userSession = sessionStorage.getItem('user');
        if (!userSession) {
            showMessageModal('Niste prijavljeni!', 'Za rezervacijo se morate prijaviti.');
            return;
        }
        let userData = JSON.parse(userSession);
        if (userData.data) userData = userData.data;
        const potnikId = userData.idUporabnik;

        if (!prevozIdToBook || !potnikId) {
            showMessageModal('Napaka', 'ID prevoza ali ID potnika manjka.');
            return;
        }

        if (fetchedPrevozDetails && fetchedPrevozDetails.Voznik_idUporabnik === potnikId) {
            showMessageModal('Napaka', 'Ne morete rezervirati lastnega prevoza.');
            return;
        }
        if (fetchedPrevozDetails && fetchedPrevozDetails.Prosta_mesta <= 0) {
            showMessageModal('Napaka', 'Za ta prevoz ni več prostih mest.');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/rezervacije', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ TK_Prevoz: parseInt(prevozIdToBook), TK_Potnik: potnikId }),
            });
            const result = await response.json();

            if (response.ok && result.success && result.data && result.data.idRezervacija) {
                showMessageModal('Uspeh!', 'Rezervacija uspešno oddana. Status: čaka.');
                if (fetchedPrevozDetails) { // Ensure fetchedPrevozDetails is available
                    fetchedPrevozDetails.Prosta_mesta--;
                    updateProstaMestaUI(fetchedPrevozDetails.Prosta_mesta);
                }
                updateButtonUI(bookNowButton, 'reserved', result.data.idRezervacija, prevozIdToBook, fetchedPrevozDetails);
            } else {
                showMessageModal('Napaka pri rezervaciji', result.message || 'Neznana napaka.');
            }
        } catch (error) {
            console.error('Napaka pri pošiljanju zahteve za rezervacijo:', error);
            showMessageModal('Napaka', 'Prišlo je do težave pri komunikaciji s strežnikom.');
        }
    }

    async function handlePrekliciRezervacijo(idRezervacija, prevozIdForReset) {
        const bookNowButton = document.getElementById('bookNowBtn');
        if (!idRezervacija) {
            showMessageModal('Napaka', 'ID rezervacije za preklic ni na voljo.');
            return;
        }
        try {
            const response = await fetch(`http://localhost:3000/api/rezervacije/${idRezervacija}/preklici`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
            });
            const result = await response.json();
            if (response.ok && result.success) {
                showMessageModal('Uspeh!', 'Rezervacija je bila preklicana.');
                 if (fetchedPrevozDetails) { // Ensure fetchedPrevozDetails is available
                    fetchedPrevozDetails.Prosta_mesta++;
                    updateProstaMestaUI(fetchedPrevozDetails.Prosta_mesta);
                }
                updateButtonUI(bookNowButton, 'available', null, prevozIdForReset, fetchedPrevozDetails);
            } else {
                showMessageModal('Napaka pri preklicu', result.message || 'Neznana napaka.');
            }
        } catch (error) {
            console.error('Napaka pri pošiljanju zahteve za preklic:', error);
            showMessageModal('Napaka', 'Prišlo je do težave pri komunikaciji s strežnikom za preklic.');
        }
    }