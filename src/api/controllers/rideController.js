import * as prevozService from '../services/rideService.js';

export async function getAllPrevozi(req, res, next) {
  try {
    const prevozi = await prevozService.listPrevozi();
    res.json({
      success: true,
      data: prevozi,
    });
  } catch (error) {
    console.error('Error in getAllPrevozi:', error);
    next(error);
  }
}
