const form = document.getElementById('registerForm');

function showRegisterModal(title, message) {
  document.getElementById('registerModalTitle').textContent = title;
  document.getElementById('registerModalMessage').textContent = message;
  document.getElementById('registerModal').style.display = 'flex';
}

function closeRegisterModalAndReset() {
  document.getElementById('registerModal').style.display = 'none';
  window.location.reload(); // Reset the page
}

document.getElementById('closeRegisterModal').onclick = closeRegisterModalAndReset;
window.onclick = function(event) {
  const modal = document.getElementById('registerModal');
  if (event.target === modal) closeRegisterModalAndReset();
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const ime = form.ime.value.trim();
  const priimek = form.priimek.value.trim();
  const username = form.username.value.trim();
  const telefon = form.telefon.value.trim();
  const email = form.email.value.trim();
  const geslo = form.password.value;
  const confirmPassword = form.confirmPassword.value;

  if (geslo !== confirmPassword) {
    showRegisterModal('Napaka', 'Gesli se ne ujemata!');
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ime,
        priimek,
        username,
        telefon,
        email,
        geslo
      })
    });

    const result = await response.json();

    if (result.success) {
      showRegisterModal('Uspeh', 'Uporabnik je bil uspešno ustvarjen!');
    } else {
      showRegisterModal('Napaka', result.message || 'Registracija ni uspela.');
    }
  } catch (error) {
    console.error('Napaka pri pošiljanju:', error);
    showRegisterModal('Napaka', 'Napaka pri povezavi s strežnikom.');
  }
});