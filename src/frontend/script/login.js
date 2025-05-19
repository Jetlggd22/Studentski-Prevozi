document.querySelector('.login-form').addEventListener('submit', async function (e) {
    e.preventDefault(); 

    const email = document.getElementById("email").value;
    const geslo= document.getElementById("password").value;

    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, geslo}),
      });

      const data = await response.json();

      if (data.success) {
        sessionStorage.setItem('user', JSON.stringify(data));
        console.log(data)
      } else {
        alert('Prijava ni uspela: ' + (data.message || 'Napačni podatki.'));
      }
    } catch (error) {
      console.error('Napaka pri prijavi:', error);
      alert('Napaka pri povezavi s strežnikom.');
    }
  });