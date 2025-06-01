import * as statsService from '../services/adminStatsService.js';

export async function getAdminStats(req, res) {
  try {
    const stats = await statsService.getAdminStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Napaka pri pridobivanju statistik.' });
  }
}