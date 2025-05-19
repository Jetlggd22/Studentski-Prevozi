 const form = document.getElementById('registerForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const ime = form.ime.value.trim();
    const priimek = form.priimek.value.trim();
    const username = form.username.value.trim();
    const telefon = form.telefon.value.trim();
    const email = form.email.value.trim();
    const geslo= form.password.value;
    const confirmPassword = form.confirmPassword.value;

    if (geslo!== confirmPassword) {
      alert('Gesli se ne ujemata!');
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
        alert('Uporabnik je bil uspešno ustvarjen!');
        // Optionally: form.reset();
      } else {
        alert('Napaka: ' + (result.message || 'Registracija ni uspela.'));
      }
    } catch (error) {
      console.error('Napaka pri pošiljanju:', error);
      alert('Napaka pri povezavi s strežnikom.');
    }
  });