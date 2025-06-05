// src/api/controllers/rideController.js
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
    console.error('Controller error (getPrevoz):', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function getAllPrevozi(req, res, next) {
  try {
    // Check for search query parameters
    const { from, to, limit } = req.query;

    let prevozi;
    if (from && to) {
      prevozi = await prevozService.searchPrevozi(from, to);
    } else {
      prevozi = await prevozService.listPrevozi(limit ? parseInt(limit) : null);
    }
    
    res.json({
      success: true,
      data: prevozi,
    });
  } catch (error) {
    console.error('Error in getAllPrevozi controller:', error);
    next(error);
  }
}

export async function deletePrevoz(req, res, next) {
  const id = req.params.id;
  try {
    const result = await prevozService.removePrevozById(id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Prevoz not found for deletion' });
    }
    res.status(200).json({ success: true, message: `Prevoz with ID ${id} successfully deleted.` });
  } catch (error) {
    console.error(`Error deleting prevoz with ID ${id}:`, error);
    // Pass to the generic error handler
    next(error); 
  }
}

export async function updatePrevoz(req, res, next) {
  const rideId = req.params.id;
  const rideData = req.body; // Contains all updated fields from the admin form
  try {
    // Add validation for rideData here if necessary
    const updatedRide = await prevozService.updatePrevozById(rideId, rideData);
    if (!updatedRide) {
      return res.status(404).json({ success: false, message: 'Prevoz za posodobitev ni bil najden.' });
    }
    res.json({ success: true, message: 'Prevoz uspešno posodobljen.', data: updatedRide });
  } catch (error) {
    console.error(`Error updating prevoz with ID ${rideId}:`, error);
    next(error); // Pass to generic error handler
  }
}