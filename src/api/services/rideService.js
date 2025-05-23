// src/api/services/rideService.js
import * as prevozRepository from '../repositories/rideRepository.js';

export async function getPrevozById(id) {
  return await prevozRepository.findPrevozById(id);
}

export async function listPrevozi(limit = null) {
  const prevozi = await prevozRepository.getAllPrevozi(limit);
  return prevozi;
}

export async function searchPrevozi(fromLocation, toLocation) {
  const prevozi = await prevozRepository.searchPrevoziByLocation(fromLocation, toLocation);
  return prevozi;
}

export async function removePrevozById(id) {
  const affectedRows = await prevozRepository.deletePrevozById(id);
  if (affectedRows === 0) {
    return null; // Or throw an error indicating not found
  }
  return { message: 'Prevoz successfully deleted', id };
}