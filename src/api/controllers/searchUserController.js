import * as searchUserService from '../services/searchUserService.js'; 

export async function searchDrivers(req, res) {
  const { q = '', rating = '' } = req.query;
  try {
    const drivers = await searchUserService.searchDrivers(q, rating);
    res.json({ success: true, data: drivers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Napaka pri iskanju voznikov.' });
  }
}