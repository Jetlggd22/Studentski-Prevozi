import * as prevozRepository from '../repositories/rideRepository.js';

export async function getPrevozById(id) {
  return await prevozRepository.findPrevozById(id);
}

export async function listPrevozi() {
  const prevozi = await prevozRepository.getAllPrevozi();
  return prevozi;
}
