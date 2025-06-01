import * as statsRepo from '../repositories/adminStatsRepository.js';

export async function getAdminStats() {
  const [userCount, rideCount, avgRating] = await Promise.all([
    statsRepo.getUserCount(),
    statsRepo.getActiveRidesCount(),
    statsRepo.getAverageRating()
  ]);
  return { userCount, rideCount, avgRating };
}