document.addEventListener('DOMContentLoaded', async () => {
    // Pridobivanje elementov iz DOM
    const form = document.getElementById('editForm');
    const imeInput = document.getElementById('ime');
    const priimekInput = document.getElementById('priimek');
    const usernameInput = document.getElementById('username');
    const telefonInput = document.getElementById('telefon');
    const ocenaInput = document.getElementById('ocena');
    const avtoInput = document.getElementById('avto');

    // Elementi modalnega okna
    const modal = document.getElementById('messageModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const closeModalBtn = document.getElementById('closeModal');
    const okButton = document.getElementById('modalOkButton');
    
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');

    // Funkcija za prikaz modalnega okna
    const showModal = (title, message) => {
        if (!modal || !modalTitle || !modalMessage) {
            alert(`${title}\n\n${message}`);
            return;
        }
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modal.style.display = 'flex';
    };

    const setupModalEvents = (isSuccess) => {
        const action = isSuccess 
            ? () => { window.location.href = 'Admin_Vozniki.html'; }
            : () => { modal.style.display = 'none'; };

        if (okButton) okButton.onclick = action;
        if (closeModalBtn) closeModalBtn.onclick = action;
        window.onclick = (event) => {
            if (event.target == modal) {
                action();
            }
        };
    };

    if (!userId) {
        showModal('Napaka!', 'ID uporabnika ni podan v URL-ju.');
        setupModalEvents(false);
        return;
    }

    // Pridobivanje in prikaz podatkov uporabnika
    try {
        const res = await fetch(`http://localhost:3000/api/users/${userId}`);
        if (!res.ok) throw new Error(`Uporabnik ni najden (HTTP ${res.status})`);
        
        const json = await res.json();
        if (json.success && json.data) {
            const user = json.data;
            imeInput.value = user.Ime || '';
            priimekInput.value = user.Priimek || '';
            usernameInput.value = user.Username || '';
            telefonInput.value = user.Telefon || '';
            // Display 'Brez ocene' if rating is null/undefined, otherwise format it
            ocenaInput.value = user.Ocena !== null && user.Ocena !== undefined ? parseFloat(user.Ocena).toFixed(1) : 'Brez ocene';
            avtoInput.value = user.Avto || '';
        } else {
            throw new Error(json.message || 'Podatkov o uporabniku ni mogoče naložiti.');
        }
    } catch (err) {
        showModal('Napaka pri nalaganju!', err.message);
        setupModalEvents(false);
    }

    // Oddaja obrazca in shranjevanje sprememb
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Ensure ocena value is parsed correctly, handle 'Brez ocene' or empty string as null
        const ocenaValue = ocenaInput.value.trim();
        const parsedOcena = (ocenaValue === '' || ocenaValue === 'Brez ocene') ? null : parseFloat(ocenaValue);

        const updatedData = {
            Ime: imeInput.value.trim(),
            Priimek: priimekInput.value.trim(),
            Username: usernameInput.value.trim(),
            Telefon: telefonInput.value.trim(),
            Avto: avtoInput.value.trim(),
            Ocena: parsedOcena // Add the parsed rating here
        };

        if (!updatedData.Ime || !updatedData.Priimek || !updatedData.Username) {
            showModal('Napaka v vnosu', 'Ime, priimek in uporabniško ime so obvezna polja.');
            setupModalEvents(false);
            return;
        }

        try {
            const res = await fetch(`http://localhost:3000/api/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
            const result = await res.json();

            if (result.success) {
                showModal('Uspeh!', 'Podatki uporabnika so bili uspešno posodobljeni.');
                setupModalEvents(true); // Preusmeri po zaprtju
            } else {
                throw new Error(result.message || 'Napaka pri shranjevanju podatkov.');
            }
        } catch (err) {
            showModal('Napaka pri shranjevanju!', err.message);
            setupModalEvents(false);
        }
    });
});