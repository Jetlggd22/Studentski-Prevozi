function showErrorModal(message) {
  const modal = document.getElementById('errorModal');
  const msg = document.getElementById('modalMessage');
  msg.textContent = message;
  modal.style.display = 'flex';
}

function closeModalAndReset() {
  document.getElementById('errorModal').style.display = 'none';
  window.location.reload(); // Reset the page
}

document.getElementById('closeModal').onclick = closeModalAndReset;
window.onclick = function(event) {
  const modal = document.getElementById('errorModal');
  if (event.target === modal) closeModalAndReset();
};

document.querySelector('.login-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const geslo = document.getElementById("password").value.trim();

  if (!email || !geslo) {
    showErrorModal('Prosimo, izpolnite vsa polja.');
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, geslo }),
    });

    const data = await response.json();

    if (data.success) {
      sessionStorage.setItem('user', JSON.stringify(data));
      // Redirect or reload as needed
      window.location.href = "Index.html";
    } else {
      showErrorModal('Prijava ni uspela: ' + (data.message || 'Napačni podatki.'));
    }
  } catch (error) {
    console.error('Napaka pri prijavi:', error);
    showErrorModal('Napaka pri povezavi s strežnikom.');
  }
});