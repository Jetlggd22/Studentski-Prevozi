import * as createPrevozService from '../services/createPrevozService.js';

export async function createPrevoz(req, res) {
  try {
    const { from, to, date, seats, price, car, note, voznikId } = req.body;
    if (!from || !to || !date || !seats || !price || !car || !voznikId) {
      return res.status(400).json({ success: false, message: 'Manjkajoči podatki.' });
    }
    const id = await createPrevozService.createPrevoz({ from, to, date, seats, price, car, note, voznikId });
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Napaka pri ustvarjanju relacije.' });
  }
}