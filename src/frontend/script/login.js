
function showErrorModal(message) {
  const modal = document.getElementById('errorModal');
  const msg = document.getElementById('modalMessage');
  if (modal && msg) {
    msg.textContent = message;
    modal.style.display = 'flex';
  } else {
    alert(message); // Fallback if modal elements are not found
  }
}

function closeModalAndReset() {
  const modal = document.getElementById('errorModal');
  if (modal) {
    modal.style.display = 'none';
  }
  // It's generally not a good idea to reload the page on a simple modal close
  // unless specifically intended for resetting the form after an error.
  // window.location.reload(); 
}

const closeModalButton = document.getElementById('closeModal');
if (closeModalButton) {
  closeModalButton.onclick = closeModalAndReset;
}

window.onclick = function(event) {
  const modal = document.getElementById('errorModal');
  if (modal && event.target === modal) {
    closeModalAndReset();
  }
};

const loginForm = document.querySelector('.login-form');

if (loginForm) {
  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    if (!emailInput || !passwordInput) {
      showErrorModal('Napaka: Vnosna polja niso bila najdena.');
      return;
    }

    const email = emailInput.value.trim();
    const geslo = passwordInput.value.trim();

    if (!email || !geslo) {
      showErrorModal('Prosimo, izpolnite vsa polja.');
      return;
    }

    // Optional: Show some loading indicator here
    const submitButton = loginForm.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Prijavljam...';
    }

    try {
      const response = await fetch('http://localhost:3000/api/login', { // Assuming backend is on port 3000
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, geslo }),
      });

      const data = await response.json();

      if (data.success && data.data) { // Ensure data.data exists
        sessionStorage.setItem('user', JSON.stringify(data)); // Store the whole response which includes tokens and user data
        
        // The backend authService includes the Auth0 user_id as 'idUporabnik' 
        // in the 'data' part of the response (from dbResponse).
        const userId = data.data.idUporabnik; 
        const adminUserId = "auth0|683ca514129d84db01ca86c2";

        if (userId === adminUserId) {
          window.location.href = "Admin_Dashboard.html";
        } else {
          window.location.href = "Index.html";
        }
      } else {
        showErrorModal('Prijava ni uspela: ' + (data.message || 'Napačni podatki ali nepreverjen email.'));
      }
    } catch (error) {
      console.error('Napaka pri prijavi:', error);
      showErrorModal('Napaka pri povezavi s strežnikom. Poskusite kasneje.');
    } finally {
      if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = '<i class="ri-login-box-line"></i> Prijavi se';
      }
    }
  });
} else {
  console.error("Login form element (.login-form) not found.");
}
