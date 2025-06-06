
    document.addEventListener('DOMContentLoaded', function () {
      const grid = document.getElementById('drivers-grid');
      const errorModal = document.getElementById('errorModal');
      const modalTitle = document.getElementById('modalTitle');
      const modalMessage = document.getElementById('modalMessage');
      const modalActions = document.getElementById('modalActions');
      const confirmDeleteBtn = document.getElementById('confirmDelete');
      const cancelDeleteBtn = document.getElementById('cancelDelete');
      const closeModalBtn = document.getElementById('closeModal'); 

      // Eksplicitno skrij modal in akcijske gumbe ob nalaganju
      if(errorModal) errorModal.style.display = 'none';
      if(modalActions) modalActions.style.display = 'none';

      async function fetchUserHistory(userId) {
        try {
          const res = await fetch(`http://localhost:3000/api/zgodovina/uporabnik/${userId}`);
          if (!res.ok) {
            console.error(`Error fetching history for user ${userId}: ${res.status}`);
            return { ridesAsDriver: [], ridesAsPassenger: [] };
          }
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            const ridesAsDriver = json.data.filter(ride => ride.Vloga === 'Voznik');
            const ridesAsPassenger = json.data.filter(ride => ride.Vloga === 'Potnik');
            return { ridesAsDriver, ridesAsPassenger };
          }
          return { ridesAsDriver: [], ridesAsPassenger: [] };
        } catch (err) {
          console.error(`Exception fetching history for user ${userId}:`, err);
          return { ridesAsDriver: [], ridesAsPassenger: [] };
        }
      }

      async function loadDrivers() {
        if (!grid) {
            console.error("Element 'drivers-grid' not found.");
            return;
        }
        grid.innerHTML = '<div style="padding:2rem; text-align:center; color:var(--gold);">Nalaganje uporabnikov...</div>';
        try {
          const res = await fetch('http://localhost:3000/api/users');
          const json = await res.json();
          if (!json.success) throw new Error(json.message || 'Napaka pri nalaganju uporabnikov.');
          if (!Array.isArray(json.data) || json.data.length === 0) {
            grid.innerHTML = '<div style="padding:2rem; text-align:center;">Ni uporabnikov za prikaz.</div>';
            return;
          }

          grid.innerHTML = ''; 

          for (const driver of json.data) {
            const { ridesAsDriver, ridesAsPassenger } = await fetchUserHistory(driver.idUporabnik);
            
            let avatarGender = 'men'; 
            const numericPart = String(driver.idUporabnik).match(/\d+/);
            const avatarNumber = numericPart ? (parseInt(numericPart[0]) % 60) + 1 : (Math.floor(Math.random() * 60) +1);


            const driverCardHTML = `
              <div class="driver-card" data-id="${driver.idUporabnik}" 
                style="border-radius:15px; box-shadow:0 5px 18px rgba(0,0,0,0.25); padding:25px; margin:10px; display:flex; flex-direction:column; align-items:center; background: var(--dark-light); transition: transform 0.25s ease-in-out, box-shadow 0.25s ease-in-out;">
                <img src="https://randomuser.me/api/portraits/${avatarGender}/${avatarNumber}.jpg" alt="${driver.Ime || ''} ${driver.Priimek || ''}" class="driver-avatar" style="width:100px;height:100px;border-radius:50%;object-fit:cover;margin-bottom:15px; border: 3px solid var(--gold); box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
                <h3 class="driver-name" style="margin:0 0 10px 0;font-size:1.4rem; color: var(--gold); text-align:center;">${driver.Ime || ''} ${driver.Priimek || ''}</h3>
                <div class="driver-rating" style="margin-bottom:10px; color: var(--gold); font-size:1.1rem;">
                  <i class="ri-star-s-fill"></i> ${driver.Ocena != null ? Number(driver.Ocena).toFixed(1) : 'N/A'}
                </div>
                <div class="driver-stats" style="margin-bottom:15px; display:flex; gap: 30px; text-align:center; justify-content: center; width:100%;">
                  <div class="driver-stat">
                    <div class="driver-stat-value" style="font-weight:700; font-size: 1.3rem; color: var(--white);">${ridesAsDriver.length}</div>
                    <div class="driver-stat-label" style="font-size:0.8rem; color:rgba(255,255,255,0.6);">Kot voznik</div>
                  </div>
                  <div class="driver-stat">
                    <div class="driver-stat-value" style="font-weight:700; font-size: 1.3rem; color: var(--white);">${ridesAsPassenger.length}</div>
                    <div class="driver-stat-label" style="font-size:0.8rem; color:rgba(255,255,255,0.6);">Kot potnik</div>
                  </div>
                </div>
                <p class="driver-bio" style="margin-bottom:20px; font-size:0.95rem; color:rgba(255,255,255,0.75); text-align:center;">${driver.Avto ? 'Avto: ' + driver.Avto : 'Nima Avto'}</p>
                
                <div class="admin-actions" style="display:flex; gap:10px; width:100%; justify-content:space-around; margin-top: auto;">
                  <button class="btn edit-btn">
                    <i class="ri-edit-line"></i> Uredi
                  </button>
                  <button class="btn delete-btn">
                    <i class="ri-delete-bin-line"></i> Izbriši
                  </button>
                </div>
              </div>
            `;
            grid.innerHTML += driverCardHTML;
          }

        } catch (err) {
          grid.innerHTML = `<div style="padding:2rem;color:red; text-align:center;">${err.message || 'Napaka pri nalaganju uporabnikov.'}</div>`;
          // Kličemo modal samo če pride do napake pri nalaganju podatkov
          showModalGenericError(err.message || 'Napaka pri nalaganju uporabnikov.');
        }
      }

      let deleteDriverId = null;
      let deleteCardElement = null;

      if(grid) {
        grid.addEventListener('click', function (e) {
          const targetDeleteBtn = e.target.closest('.delete-btn');
          const targetEditBtn = e.target.closest('.edit-btn');

          if (targetDeleteBtn) {
            deleteCardElement = targetDeleteBtn.closest('.driver-card');
            deleteDriverId = deleteCardElement.getAttribute('data-id');
            const driverName = deleteCardElement.querySelector('.driver-name').textContent;
            
            if(modalTitle) modalTitle.textContent = 'Potrditev brisanja';
            if(modalMessage) modalMessage.textContent = `Ali ste prepričani, da želite trajno izbrisati uporabnika "${driverName}" (ID: ${deleteDriverId}) in vse njegove povezane podatke (vožnje, rezervacije, ocene)? Tega dejanja ni mogoče razveljaviti.`;
            if(modalActions) modalActions.style.display = 'flex';
            if(errorModal) errorModal.style.display = 'flex';
          }
          
          if (targetEditBtn) {
            const card = targetEditBtn.closest('.driver-card');
            const id = card.getAttribute('data-id');
            // Preusmeritev na novo stran za urejanje
            window.location.href = `Admin_UrediUporabnika.html?id=${id}`;
          }
        });
      }

      if(confirmDeleteBtn) {
        confirmDeleteBtn.onclick = async function () {
          if (!deleteDriverId || !deleteCardElement) return;

          try {
            const res = await fetch(`http://localhost:3000/api/users/${deleteDriverId}`, { method: 'DELETE' });
            const json = await res.json();
            
            if(errorModal) errorModal.style.display = 'none'; 

            if (json.success) {
              deleteCardElement.style.transition = 'opacity 0.4s ease, transform 0.4s ease, margin-top 0.4s ease';
              deleteCardElement.style.opacity = '0';
              deleteCardElement.style.transform = 'scale(0.95) translateY(20px)';
              setTimeout(() => {
                  deleteCardElement.remove();
                  if (grid && grid.children.length === 0) {
                      grid.innerHTML = '<div style="padding:2rem; text-align:center;">Ni več uporabnikov za prikaz.</div>';
                  }
              }, 400);
              showToast('Uporabnik je uspešno izbrisan.');
            } else {
              showModalGenericError('Napaka pri brisanju: ' + (json.message || 'Neznana napaka.'));
            }
          } catch(err) {
            if(errorModal) errorModal.style.display = 'none';
            showModalGenericError('Napaka pri povezavi s strežnikom: ' + err.message);
          }
          deleteDriverId = null;
          deleteCardElement = null;
        };
      }

      function showModalGenericError(messageContent) { // Prej: message
        if(modalTitle) modalTitle.textContent = 'Napaka'; 
        if(modalMessage) modalMessage.textContent = messageContent; // Uporabi nov parameter
        if(modalActions) modalActions.style.display = 'none'; 
        if(errorModal) errorModal.style.display = 'flex';
      }

      if(cancelDeleteBtn) {
        cancelDeleteBtn.onclick = function () {
          if(errorModal) errorModal.style.display = 'none';
          if(modalActions) modalActions.style.display = 'none'; // Dodatno skrijemo gumbe
          deleteDriverId = null;
          deleteCardElement = null;
        };
      }

      if(closeModalBtn) {
        closeModalBtn.onclick = function () { 
          if(errorModal) errorModal.style.display = 'none';
          if(modalActions) modalActions.style.display = 'none'; // Dodatno skrijemo gumbe
          deleteDriverId = null;
          deleteCardElement = null;
        };
      }

      window.onclick = function(event) {
        if (event.target === errorModal) {
          if(errorModal) errorModal.style.display = 'none';
          if(modalActions) modalActions.style.display = 'none'; // Dodatno skrijemo gumbe
          deleteDriverId = null;
          deleteCardElement = null;
        }
      };

      loadDrivers(); 
    });

    function showToast(message) {
      const toast = document.getElementById('toast');
      if(!toast) return;
      toast.textContent = message;
      toast.style.opacity = '0'; 
      toast.style.display = 'block';
      toast.style.bottom = '0px'; 
      
      setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.bottom = '30px'; 
      }, 10); 

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.bottom = '0px'; 
        setTimeout(() => { toast.style.display = 'none'; }, 300); 
      }, 2700); 
    }

    // Splošne skripte
    window.addEventListener('load', () => {
      setTimeout(() => {
        const loader = document.getElementById('loader');
        if(loader) {
          loader.style.opacity = '0';
          setTimeout(() => {
            loader.style.display = 'none';
          }, 500);
        }
      }, 1000);
    });

    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true
    });

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
            if (navMenu.classList.contains('active')) { 
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
          });
        });
    }

    const header = document.getElementById('header');
    if (header) { 
        window.addEventListener('scroll', () => {
          if (window.scrollY > 50) {
            header.classList.add('scrolled');
          } else {
            header.classList.remove('scrolled');
          }
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const targetElement = document.querySelector(targetId);
        if (targetElement && header) {
          const headerHeight = header.offsetHeight;
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        } else if (targetElement) {
          window.scrollTo({
            top: targetElement.getBoundingClientRect().top + window.pageYOffset,
            behavior: 'smooth'
          });
        }
      });
    });
