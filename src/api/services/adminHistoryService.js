// services/adminHistoryService.js
import * as adminRepo from '../repositories/adminHistoryRepository.js';

export async function fetchAllRideHistories() {
  return await adminRepo.getAllRideHistories();
}
