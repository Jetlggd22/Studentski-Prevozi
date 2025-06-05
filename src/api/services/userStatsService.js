import { getUserStats } from '../repositories/userStatsRepository.js';

export async function fetchUserStats(userId) {
  return await getUserStats(userId);
}