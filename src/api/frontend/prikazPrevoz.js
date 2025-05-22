
document.addEventListener('DOMContentLoaded', function() {
  const searchForm = document.querySelector('.search-form');
  const ridesContainer = document.querySelector('.container.py-5');
  
  // Function to fetch and display rides
  async function fetchAndDisplayRides(url) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error('Failed to fetch rides');
      }
      
      displayRides(data.data);
    } catch (error) {
      console.error('Error fetching rides:', error);
      displayNoRides();
    }
  }
  
  // Function to display rides
  function displayRides(rides) {
    if (rides.length === 0) {
      displayNoRides();
      return;
    }
    
    ridesContainer.innerHTML = '';
    
    rides.forEach(ride => {
      const rideCard = createRideCard(ride);
      ridesContainer.appendChild(rideCard);
    });
  }
  
  // Function to display "no rides" message
  function displayNoRides() {
    ridesContainer.innerHTML = `
      <div class="no-rides" style="text-align: center; padding: 20px;">
        <h3>No rides were found for that relation</h3>
      </div>
    `;
  }
  
  // Function to create a ride card
  function createRideCard(ride) {
    const rideDate = new Date(ride.Cas_odhoda);
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    const formattedDate = rideDate.toLocaleDateString('sl-SI', options);
    const timeString = rideDate.toLocaleTimeString('sl-SI', { hour: '2-digit', minute: '2-digit' });
    
    // Calculate duration (example - you might want to calculate this properly)
    const durationMinutes = 45; // This should be calculated based on your data
    
    const card = document.createElement('div');
    card.className = 'booking-card fade-in';
    card.innerHTML = `
      <div class="booking-header">
        <h2 class="booking-title">
          <i class="fas fa-bus"></i> ${ride.voznik} (${ride.voznik_ocena}⭐)
        </h2>
      </div>
      <div class="booking-body">
        <div class="route-display slide-up" style="animation-delay: 0.2s">
          <div class="location">
            <div class="location-name">${ride.ime_odhod}</div>
            <div class="location-time">${timeString}</div>
          </div>
          <div class="route-line"></div>
          <div class="location">
            <div class="location-name">${ride.ime_prihod}</div>
            <div class="location-time">${new Date(rideDate.getTime() + durationMinutes * 60000).toLocaleTimeString('sl-SI', { hour: '2-digit', minute: '2-digit' })}</div>
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
            <div class="detail-value">${ride.Prosta_mesta}</div>
          </div>
        </div>
        
        <div class="price-section slide-up" style="animation-delay: 0.7s">
          <div class="price-info">
            <div class="price-amount">${ride.Cena} €</div>
            <div class="vehicle-info">${ride.avto || 'Vehicle not specified'}</div>
          </div>
          <button class="book-btn">
            Rezerviraj <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    `;
    
    return card;
  }
  
  // Initial load - show 5 newest rides
  fetchAndDisplayRides('/prevozi');
  
  // Handle search form submission
  searchForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const from = this.elements.from.value.trim();
    const to = this.elements.to.value.trim();
    
    if (from && to) {
      fetchAndDisplayRides(`/prevozi/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
    }
  });
});