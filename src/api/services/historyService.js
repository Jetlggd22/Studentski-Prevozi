import * as historyRepository from '../repositories/historyRepository.js';

export async function fetchUserRideHistory(userId) {
  return await historyRepository.getUserRideHistory(userId);
}

export async function fetchRideDetails(prevozId) {
  return await historyRepository.getRideDetails(prevozId);
}
