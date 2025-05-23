// src/frontend/script/relacije.js
document.addEventListener('DOMContentLoaded', function() {
  const searchForm = document.querySelector('.search-form');
  const ridesContainer = document.getElementById('rides-container-relacije'); // Use the new ID
  const modal = document.getElementById('commentModal');
  const closeModalBtn = document.getElementById('closeModal');
  const cancelCommentBtn = document.getElementById('cancelComment');
  const saveCommentBtn = document.getElementById('saveComment');
  const commentText = document.getElementById('commentText');
  const modalStarsContainer = modal.querySelector('.modal-stars');

  let currentRideIdForModal = null;
  let selectedRatingForModal = 0;

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
    
    // Placeholder for duration - you'll need to calculate this or get it from backend
    const durationMinutes = ride.Trajanje || 45; // Assuming 'Trajanje' might come from backend, else default
    const arrivalTime = new Date(rideDate.getTime() + durationMinutes * 60000).toLocaleTimeString('sl-SI', { hour: '2-digit', minute: '2-digit' });

    const card = document.createElement('div');
    card.className = 'booking-card fade-in'; // Ensure Styles/Style.css has .fade-in
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
            <div class="detail-label">Trajanje</div>
            <div class="detail-value">${durationMinutes} min</div>
          </div>
          
          <div class="detail-card slide-up" style="animation-delay: 0.6s">
            <div class="detail-label">Prosta Mesta</div>
            <div class="detail-value">${ride.Prosta_mesta !== undefined ? ride.Prosta_mesta : 'N/A'}</div>
          </div>
        </div>
        
        <div class="price-section slide-up" style="animation-delay: 0.7s">
          <div class="price-info">
             <div class="price-amount">${ride.Cena !== undefined ? ride.Cena + '€' : 'N/A'}</div>
             ${ride.avto ? `<div class="vehicle-info" style="font-size: 0.8em; color: rgba(255,255,255,0.7);">${ride.avto}</div>` : ''}
          </div>
          <button class="book-btn" data-ride-id="${ride.IdPrevoz}">
            Več Info <i class="fas fa-arrow-right"></i>
          </button>
        </div>

        <div class="rating-comment-section slide-up" style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; padding: 10px; background: #222222; border-radius: 8px; animation-delay: 0.8s">
          <div class="rating-stars" style="display: flex; align-items: center;">
            <span style="margin-right: 10px; font-size: 14px; color: var(--white);">Ocenite:</span>
            <div class="stars-interactive" data-ride-id="${ride.IdPrevoz}" style="color: #ddd; font-size: 18px; cursor:pointer;">
              ${[1,2,3,4,5].map(i => `<img src="img/star_empty.png" data-rating="${i}" class="star-img interactive-star" alt="${i}" style="width:20px; height:20px; margin-right:2px;">`).join('')}
            </div>
          </div>
          <button class="comment-btn-trigger btn" data-ride-id="${ride.IdPrevoz}" style="border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; transition: background 0.2s; background: var(--gold); color: var(--dark)">
            <i class="fas fa-comment"></i> Komentar
          </button>
        </div>
      </div>
    `;

    // Add event listener for "Več Info" button
    const bookBtn = card.querySelector('.book-btn');
    if (bookBtn) {
      bookBtn.addEventListener('click', function() {
        const rideId = this.dataset.rideId;
        window.location.href = `RelacijaDetail.html?id=${rideId}`;
      });
    }
    
    // Add event listeners for interactive stars
    card.querySelectorAll('.interactive-star').forEach(star => {
        star.addEventListener('click', function() {
            const rideId = this.closest('.stars-interactive').dataset.rideId;
            const rating = parseInt(this.dataset.rating);
            // Here, you might want to save this temporary selection or directly open modal
            console.log(`Star clicked for ride ${rideId}, rating ${rating}`);
            selectedRatingForModal = rating; // Store for modal
            updateInteractiveStars(this.closest('.stars-interactive'), rating);
            // Optionally open modal immediately: openCommentModal(rideId, rating);
        });
    });

    // Add event listener for comment button
    const commentBtnTrigger = card.querySelector('.comment-btn-trigger');
    if (commentBtnTrigger) {
        commentBtnTrigger.addEventListener('click', function() {
            const rideId = this.dataset.rideId;
            const currentStarsContainer = this.closest('.rating-comment-section').querySelector('.stars-interactive');
            let preSelectedRating = 0;
            // Check if any star is already 'filled' to get pre-selected rating
            currentStarsContainer.querySelectorAll('.interactive-star').forEach(starImg => {
                if (starImg.src.includes('star_fill.png')) {
                    preSelectedRating = Math.max(preSelectedRating, parseInt(starImg.dataset.rating));
                }
            });
            openCommentModal(rideId, preSelectedRating);
        });
    }

    return card;
  }

  function updateInteractiveStars(starsContainer, rating) {
    starsContainer.querySelectorAll('.interactive-star').forEach(starImg => {
        const starValue = parseInt(starImg.dataset.rating);
        starImg.src = starValue <= rating ? 'img/star_fill.png' : 'img/star_empty.png';
    });
  }
  
  function setupModalStars() {
    modalStarsContainer.querySelectorAll('.star-img').forEach(star => {
        star.addEventListener('click', function() {
            selectedRatingForModal = parseInt(this.dataset.rating);
            updateModalStars(selectedRatingForModal);
        });
    });
  }

  function updateModalStars(rating) {
    modalStarsContainer.querySelectorAll('.star-img').forEach(starImg => {
        const starValue = parseInt(starImg.dataset.rating);
        starImg.src = starValue <= rating ? 'img/star_fill.png' : 'img/star_empty.png';
    });
  }

  function openCommentModal(rideId, preSelectedRating = 0) {
    currentRideIdForModal = rideId;
    selectedRatingForModal = preSelectedRating;
    updateModalStars(selectedRatingForModal); // Update stars in modal based on pre-selected or 0
    commentText.value = ''; // Clear previous comment
    modal.style.display = 'flex';
  }

  closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
  cancelCommentBtn.addEventListener('click', () => modal.style.display = 'none');
  
  saveCommentBtn.addEventListener('click', () => {
    if (!currentRideIdForModal) return;
    if (selectedRatingForModal === 0) {
        alert("Prosimo, izberite oceno.");
        return;
    }
    // Here you would typically send the rating and comment to your backend
    console.log(`Saving comment for ride ${currentRideIdForModal}: Rating: ${selectedRatingForModal}, Comment: ${commentText.value}`);
    alert('Komentar in ocena shranjena (simulirano)!'); // Replace with actual save logic
    modal.style.display = 'none';
  });

  // Initial load - show 5 newest rides
  fetchAndDisplayRides('http://localhost:3000/api/prevozi?limit=5');
  
  // Handle search form submission
  searchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const from = this.elements.from.value.trim();
    const to = this.elements.to.value.trim();
    
    if (from && to) {
      fetchAndDisplayRides(`http://localhost:3000/api/prevozi?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
    } else if (!from && !to) { // If both are empty, fetch initial 5
      fetchAndDisplayRides('http://localhost:3000/api/prevozi?limit=5');
    } else {
        alert("Za iskanje vnesite odhodno in ciljno lokacijo.");
    }
  });

  // General page setup like loader, header scroll, navigation, etc.
  // Loader
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

  // AOS Initialization
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  
  // Header Scroll
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
  
  // Back to Top
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
  
  // Mobile Navigation
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
  
  // Smooth scrolling for anchor links (if any)
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
  setupModalStars(); 
});