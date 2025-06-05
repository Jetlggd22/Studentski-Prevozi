// src/api/controllers/lokacijaController.js

import * as lokacijaService from '../services/lokacijaService.js'; // << NOVO: Ustvarite to datoteko

export async function searchLokacije(req, res) {
  try {
    const query = req.query.q || '';
    const lokacije = await lokacijaService.findLokacijeByName(query);
    res.json({ success: true, data: lokacije });
  } catch (error) {
    console.error('Error searching lokacije in controller:', error);
    res.status(500).json({ success: false, message: 'Napaka pri iskanju lokacij.' });
  }
}