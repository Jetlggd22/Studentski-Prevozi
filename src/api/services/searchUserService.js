import * as searchUserRepository from '../repositories/searchUserRepository.js';

export async function searchDrivers(query, minRating) {
  return await searchUserRepository.searchDrivers(query, minRating);
}