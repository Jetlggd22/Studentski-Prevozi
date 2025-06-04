import * as userStatsService from '../services/userStatsService.js';

export async function getUserStats(req, res) {
  const userId = req.params.id;
  if (!userId) return res.status(400).json({ success: false, message: 'Missing user id' });
  try {
    const stats = await userStatsService.fetchUserStats(userId);
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
}