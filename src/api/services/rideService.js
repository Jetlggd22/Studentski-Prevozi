import * as prevozRepository from '../repositories/rideRepository.js';

export async function listPrevozi() {
  const prevozi = await prevozRepository.getAllPrevozi();
  return prevozi;
}
