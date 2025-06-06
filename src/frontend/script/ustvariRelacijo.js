document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selection ---
    const createRideForm = document.getElementById('createRideForm');
    if (!createRideForm) {
        console.error("Form with ID 'createRideForm' not found!");
        return; // Stop script execution if the main form is missing
    }

    const steps = Array.from(createRideForm.querySelectorAll('.form-step'));
    const progressBar = document.getElementById('progressBar');
    const nextBtns = createRideForm.querySelectorAll('.next-btn');
    const prevBtns = createRideForm.querySelectorAll('.prev-btn');
    const formErrorMessage = document.getElementById('formErrorMessage');

    // Location input fields and their corresponding suggestion lists / hidden coordinate fields
    const locationFieldsConfig = [
        { inputId: 'toLocation', suggestionsId: 'toLocationSuggestions', lonId: 'toLocationLongitude', latId: 'toLocationLatitude' },
        { inputId: 'fromLocation', suggestionsId: 'fromLocationSuggestions', lonId: 'fromLocationLongitude', latId: 'fromLocationLatitude' }
    ];

    // Recurring ride options elements
    const isRecurringCheckbox = document.getElementById('isRecurring');
    const ponavljanjeOptionsDiv = document.getElementById('ponavljanjeOptions');
    const tipPonavljanjaRadios = document.getElementsByName('tipPonavljanja');
    const dneviVTednuContainer = document.getElementById('dneviVTednuContainer');

    let currentStep = 0;

    // --- Helper Functions ---
    function showFormError(message) {
        if (formErrorMessage) {
            formErrorMessage.textContent = message;
            formErrorMessage.style.display = 'block';
        } else {
            alert(message); // Fallback
        }
    }

    function hideFormError() {
        if (formErrorMessage) {
            formErrorMessage.style.display = 'none';
        }
    }

    // --- Multi-Step Form Navigation Logic ---
    function updateStepDisplay() {
        if (!steps.length || !progressBar) return; // Ensure elements exist

        steps.forEach((step, index) => {
            step.classList.toggle('active', index === currentStep);
        });
        const progressPercentage = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;
        progressBar.style.width = `${progressPercentage}%`;
    }

    function validateCurrentStep() {
        hideFormError(); // Clear previous errors
        const currentStepElement = steps[currentStep];
        if (!currentStepElement) return false;

        const inputs = currentStepElement.querySelectorAll('input[required], select[required], textarea[required]');
        for (let input of inputs) {
            if (!input.value.trim()) {
                const label = input.previousElementSibling && input.previousElementSibling.tagName === 'LABEL' ?
                              input.previousElementSibling.textContent.replace(':', '') :
                              input.name || input.id;
                showFormError(`Prosimo, izpolnite polje: ${label}`);
                input.focus();
                return false;
            }
        }

        // Specific validation for location coordinates (Step 1 & 2)
        if (currentStep === 0) { // Step 1: To Location
            const toLocInput = document.getElementById('toLocation');
            const toLon = document.getElementById('toLocationLongitude');
            const toLat = document.getElementById('toLocationLatitude');
            if (toLocInput && toLocInput.value.trim() && (!toLon || !toLon.value || !toLat || !toLat.value)) {
                showFormError('Za ciljno lokacijo izberite predlog s seznama ali zagotovite, da so koordinate pravilno vnesene (če omogočate ročni vnos).');
                // return false; // Uncomment if coordinates are strictly required and not auto-filled.
            }
        }
        if (currentStep === 1) { // Step 2: From Location
             const fromLocInput = document.getElementById('fromLocation');
            const fromLon = document.getElementById('fromLocationLongitude');
            const fromLat = document.getElementById('fromLocationLatitude');
            if (fromLocInput && fromLocInput.value.trim() && (!fromLon || !fromLon.value || !fromLat || !fromLat.value)) {
                 showFormError('Za odhodno lokacijo izberite predlog s seznama ali zagotovite, da so koordinate pravilno vnesene.');
                // return false; // Uncomment if coordinates are strictly required.
            }
        }


        // Specific validation for Step 4 (Travel Time)
        if (currentStep === 3) {
            const departureTimeInput = document.getElementById('departureTime');
            if (departureTimeInput && departureTimeInput.value) {
                const departureDate = new Date(departureTimeInput.value);
                if (departureDate < new Date()) {
                    showFormError('Datum in ura odhoda ne smeta biti v preteklosti.');
                    departureTimeInput.focus();
                    return false;
                }
            }
            if (isRecurringCheckbox && isRecurringCheckbox.checked) {
                const selectedTip = document.querySelector('input[name="tipPonavljanja"]:checked');
                if (!selectedTip) {
                    showFormError("Prosimo, izberite tip ponavljanja.");
                    return false;
                }
                if (selectedTip.value === 'tedensko') {
                    const izbraniDnevi = Array.from(document.querySelectorAll('input[name="dneviTedna"]:checked'));
                    if (izbraniDnevi.length === 0) {
                         showFormError("Za tedensko ponavljanje izberite vsaj en dan.");
                         return false;
                    }
                }
            }
        }
        return true;
    }

    nextBtns.forEach(button => {
        button.addEventListener('click', () => {
            if (validateCurrentStep()) {
                if (currentStep < steps.length - 1) {
                    currentStep++;
                    updateStepDisplay();
                }
            }
        });
    });

    prevBtns.forEach(button => {
        button.addEventListener('click', () => {
            if (currentStep > 0) {
                currentStep--;
                updateStepDisplay();
                hideFormError(); // Hide error when going back
            }
        });
    });

    // --- Recurring Ride Options Logic ---
    if (isRecurringCheckbox && ponavljanjeOptionsDiv && tipPonavljanjaRadios.length > 0 && dneviVTednuContainer) {
        isRecurringCheckbox.addEventListener('change', function() {
            ponavljanjeOptionsDiv.style.display = this.checked ? 'block' : 'none';
            if (!this.checked) {
                tipPonavljanjaRadios.forEach(radio => radio.checked = false);
                document.getElementsByName('dneviTedna').forEach(checkbox => checkbox.checked = false);
                dneviVTednuContainer.style.display = 'none';
            }
        });

        tipPonavljanjaRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'tedensko' && this.checked) {
                    dneviVTednuContainer.style.display = 'block';
                } else {
                    dneviVTednuContainer.style.display = 'none';
                }
            });
        });
    } else {
        console.warn("One or more elements for recurring ride options are missing.");
    }

    // --- Location Autocomplete Logic ---
    async function fetchLocationSuggestions(query, inputElement, suggestionsElement, lonElement, latElement) {
        if (!query.trim()) {
            suggestionsElement.innerHTML = '';
            suggestionsElement.style.display = 'none';
            return;
        }
        try {
            // ***** MODIFIED URL HERE *****
            const response = await fetch(`http://localhost:3000/api/lokacije/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) {
                console.error("Server error fetching locations:", response.status, await response.text());
                suggestionsElement.innerHTML = '<li>Napaka pri nalaganju predlogov.</li>';
                suggestionsElement.style.display = 'block';
                return;
            }
            const data = await response.json();

            if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                suggestionsElement.innerHTML = ''; // Clear previous suggestions
                data.data.forEach(loc => {
                    const li = document.createElement('li');
                    li.textContent = loc.Ime;
                    li.dataset.longitude = loc.Longitude; // Store coordinates in data attributes
                    li.dataset.latitude = loc.Latitude;
                    li.addEventListener('click', () => {
                        inputElement.value = loc.Ime;
                        if (lonElement) lonElement.value = loc.Longitude;
                        if (latElement) latElement.value = loc.Latitude;
                        suggestionsElement.innerHTML = '';
                        suggestionsElement.style.display = 'none';
                    });
                    suggestionsElement.appendChild(li);
                });
                suggestionsElement.style.display = 'block';
            } else {
                suggestionsElement.innerHTML = '<li>Ni najdenih predlogov. Vnesite polno ime ali preverite vnos.</li>';
                suggestionsElement.style.display = 'block';
                if (lonElement) lonElement.value = ''; // Clear coordinates if no suggestion is picked
                if (latElement) latElement.value = '';
            }
        } catch (error) {
            console.error('Error fetching location suggestions:', error);
            suggestionsElement.innerHTML = '<li>Napaka pri iskanju. Poskusite znova.</li>';
            suggestionsElement.style.display = 'block';
        }
    }

    locationFieldsConfig.forEach(config => {
        const inputEl = document.getElementById(config.inputId);
        const suggestionsEl = document.getElementById(config.suggestionsId);
        const lonEl = document.getElementById(config.lonId);
        const latEl = document.getElementById(config.latId);

        if (inputEl && suggestionsEl) {
            let debounceTimeout;
            inputEl.addEventListener('input', () => {
                clearTimeout(debounceTimeout);
                debounceTimeout = setTimeout(() => {
                    fetchLocationSuggestions(inputEl.value, inputEl, suggestionsEl, lonEl, latEl);
                }, 300); // Debounce to avoid too many API calls
            });

            document.addEventListener('click', (event) => {
                if (!inputEl.contains(event.target) && !suggestionsEl.contains(event.target)) {
                    suggestionsEl.style.display = 'none';
                }
            });
        } else {
            console.warn(`Location field elements not found for config:`, config);
        }
    });

    // --- Form Submission Logic ---
    createRideForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideFormError();

        if (!validateCurrentStep()) { 
            return;
        }

        let userSessionData = sessionStorage.getItem('user');
        if (!userSessionData) {
            showFormError('Za objavo relacije morate biti prijavljeni.');
            return;
        }

        let userData;
        try {
            userData = JSON.parse(userSessionData);
            if (userData.data) userData = userData.data; 
        } catch (parseError) {
            console.error("Error parsing user data from sessionStorage:", parseError);
            showFormError('Napaka pri pridobivanju podatkov o uporabniku. Prosimo, prijavite se ponovno.');
            return;
        }

        const voznikId = userData.idUporabnik;
        if (!voznikId) {
            showFormError('ID uporabnika ni na voljo. Prosimo, prijavite se ponovno.');
            return;
        }

        let ponavljanjeFinalValue = null; 
        if (isRecurringCheckbox && isRecurringCheckbox.checked) {
            const selectedTipRadio = document.querySelector('input[name="tipPonavljanja"]:checked');
            if (selectedTipRadio) {
                ponavljanjeFinalValue = selectedTipRadio.value;
                if (selectedTipRadio.value === 'tedensko') {
                    const izbraniDnevi = Array.from(document.querySelectorAll('input[name="dneviTedna"]:checked'))
                                           .map(cb => cb.value)
                                           .join(',');
                    if(izbraniDnevi) ponavljanjeFinalValue += `: ${izbraniDnevi}`;
                } else if (selectedTipRadio.value === 'mesecno') {
                    const danVMesecu = new Date(document.getElementById('departureTime').value).getDate();
                    ponavljanjeFinalValue = `mesecno: ${danVMesecu}`;
                }
            }
        }


        const rideData = {
            from: document.getElementById('fromLocation').value,
            to: document.getElementById('toLocation').value,
            fromLongitude: document.getElementById('fromLocationLongitude').value,
            fromLatitude: document.getElementById('fromLocationLatitude').value,
            toLongitude: document.getElementById('toLocationLongitude').value,
            toLatitude: document.getElementById('toLocationLatitude').value,
            date: document.getElementById('departureTime').value,
            seats: parseInt(document.getElementById('seats').value),
            price: parseFloat(document.getElementById('price').value),
            car: document.getElementById('car').value,
            note: document.getElementById('note').value,
            Ponavljanje: ponavljanjeFinalValue, 
            voznikId: voznikId
        };
        
        if ((!rideData.fromLongitude || !rideData.fromLatitude) && rideData.from) {
             showFormError(`Koordinate za odhodno lokacijo "${rideData.from}" niso bile izbrane. Prosimo, izberite predlog ali vnesite lokacijo, ki jo sistem prepozna.`);
             return;
        }
        if ((!rideData.toLongitude || !rideData.toLatitude) && rideData.to) {
             showFormError(`Koordinate za ciljno lokacijo "${rideData.to}" niso bile izbrane. Prosimo, izberite predlog ali vnesite lokacijo, ki jo sistem prepozna.`);
             return;
        }

        const submitButton = createRideForm.querySelector('button[type="submit"]');
        if(submitButton) submitButton.disabled = true;

        try {
            // ***** MODIFIED URL HERE *****
            const response = await fetch('http://localhost:3000/api/prevozi', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(rideData),
            });
            const result = await response.json();

            if (response.ok && result.success && result.id) {
                window.location.href = `RelacijaDetail.html?id=${result.id}`;
            } else {
                showFormError(result.message || 'Napaka pri ustvarjanju relacije. Poskusite kasneje.');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            showFormError('Napaka v omrežju ali na strežniku. Poskusite kasneje.');
        } finally {
            if(submitButton) submitButton.disabled = false;
        }
    });

    // --- Initial Setup ---
    updateStepDisplay(); 
});
