import * as historyService from '../services/historyService.js';

export async function getUserHistory(req, res) {
  try {
    const userId = req.params.id;
    const history = await historyService.fetchUserRideHistory(userId);
    res.json({ success: true, data: history });
  } catch (error) {
    console.error('Error fetching user history:', error);
    res.status(500).json({ success: false, message: 'Error fetching user history' });
  }
}

export async function getRideDetails(req, res) {
  try {
    const prevozId = req.params.id;
    const details = await historyService.fetchRideDetails(prevozId);
    res.json({ success: true, data: details });
  } catch (error) {
    console.error('Error fetching ride details:', error);
    res.status(500).json({ success: false, message: 'Error fetching ride details' });
  }
}
