import * as prevozService from '../services/rideService.js';

export async function getPrevoz(req, res) {
  const id = req.params.id;

  try {
    const prevoz = await prevozService.getPrevozById(id);

    if (!prevoz) {
      return res.status(404).json({ message: 'Prevoz not found' });
    }

    res.json(prevoz);
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

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
