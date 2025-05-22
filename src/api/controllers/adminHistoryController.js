// controllers/adminHistoryController.js
import * as adminService from '../services/adminHistoryService.js';

export async function getAllHistories(req, res) {
  try {
    const data = await adminService.fetchAllRideHistories();
    res.json({ success: true, data });
  } catch (error) {
    console.error("Napaka pri pridobivanju zgodovine prevozov:", error);
    res.status(500).json({ success: false, message: "Napaka pri pridobivanju zgodovine prevozov" });
  }
}
