// src/frontend/script/relacije.js
document.addEventListener('DOMContentLoaded', function() {
  const searchForm = document.querySelector('.search-form');
  const ridesContainer = document.getElementById('rides-container-relacije'); 

  // Function to fetch and display rides
  async function fetchAndDisplayRides(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch rides');
      }
      
      displayRides(data.data);
    } catch (error) {
      console.error('Error fetching rides:', error);
      displayNoRides(error.message);
    }
  }
  
  // Function to display rides
  function displayRides(rides) {
    ridesContainer.innerHTML = ''; // Clear previous rides
    if (!rides || rides.length === 0) {
      displayNoRides();
      return;
    }
    
    rides.forEach(ride => {
      const rideCard = createRideCard(ride);
      ridesContainer.appendChild(rideCard);
    });
  }
  
  // Function to display "no rides" message
  function displayNoRides(message = "Za izbrano relacijo ni bilo najdenih prevozov.") {
    ridesContainer.innerHTML = `
      <div class="no-rides" style="text-align: center; padding: 20px; color: var(--white);">
        <h3>${message}</h3>
      </div>
    `;
  }
  
  // Function to create a ride card HTML
  function createRideCard(ride) {
    const rideDate = new Date(ride.Cas_odhoda);
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    const formattedDate = rideDate.toLocaleDateString('sl-SI', options);
    const timeString = rideDate.toLocaleTimeString('sl-SI', { hour: '2-digit', minute: '2-digit' });
    
    const durationMinutes = ride.Trajanje || 45; 
    const arrivalTime = new Date(rideDate.getTime() + durationMinutes * 60000).toLocaleTimeString('sl-SI', { hour: '2-digit', minute: '2-digit' });

    const card = document.createElement('div');
    card.className = 'booking-card fade-in';
    card.innerHTML = `
      <div class="booking-header">
        <h2 class="booking-title">
          <i class="fas fa-bus"></i> ${ride.voznik || 'Neznan voznik'} (${ride.voznik_ocena ? ride.voznik_ocena.toFixed(1) : 'N/A'}⭐)
        </h2>
      </div>
      <div class="booking-body">
        <div class="route-display slide-up" style="animation-delay: 0.2s">
          <div class="location">
            <div class="location-name">${ride.ime_odhod || 'Neznano'}</div>
            <div class="location-time">${timeString}</div>
          </div>
          <div class="route-line" style="background-color: #312D18;"></div>
          <div class="location">
            <div class="location-name">${ride.ime_prihod || 'Neznano'}</div>
            <div class="location-time">${arrivalTime}</div>
          </div>
        </div>
        
        <div class="booking-details">
          <div class="detail-card slide-up" style="animation-delay: 0.3s">
            <div class="detail-label">Odhod</div>
            <div class="detail-value">${formattedDate}</div>
          </div>
          <div class="detail-card slide-up" style="animation-delay: 0.4s">
            <div class="detail-label">Avto</div>
            <div class="detail-value">${ride.avto || 'Ni navedeno'}</div>
          </div>
          
          <div class="detail-card slide-up" style="animation-delay: 0.6s">
            <div class="detail-label">Prosta Mesta</div>
            <div class="detail-value">${ride.Prosta_mesta !== undefined ? ride.Prosta_mesta : 'N/A'}</div>
          </div>
        </div>
        
        <div class="price-section slide-up" style="animation-delay: 0.7s">
          <div class="price-info">
             <div class="price-amount">${ride.Cena !== undefined ? ride.Cena + '€' : 'N/A'}</div>
          </div>
          <button class="book-btn" data-ride-id="${ride.IdPrevoz}">
            Več Info <i class="fas fa-arrow-right"></i>
          </button>
        </div>
        
        </div>
    `;

    const bookBtn = card.querySelector('.book-btn');
    if (bookBtn) {
      bookBtn.addEventListener('click', function() {
        const rideId = this.dataset.rideId;
        window.location.href = `RelacijaDetail.html?id=${rideId}`;
      });
    }
    
    return card;
  }

  // Initial load - show 5 newest rides
  fetchAndDisplayRides('http://localhost:3000/api/prevozi?limit=5');
  
  // Handle search form submission
  searchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const from = this.elements.from.value.trim();
    const to = this.elements.to.value.trim();
    
    if (from && to) {
      fetchAndDisplayRides(`http://localhost:3000/api/prevozi?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
    } else if (!from && !to) { 
      fetchAndDisplayRides('http://localhost:3000/api/prevozi?limit=5');
    } else {
        alert("Za iskanje vnesite odhodno in ciljno lokacijo.");
    }
  });

  // General page setup
  const loader = document.getElementById('loader');
  if (loader) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
          loader.style.display = 'none';
        }, 500);
      }, 1000);
    });
  }

  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      mirror: false
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
  
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTop.classList.add('show');
      } else {
        backToTop.classList.remove('show');
      }
    });
    
    backToTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
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
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
      });
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
      }
    });
  });
});