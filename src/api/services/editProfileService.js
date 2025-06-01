import * as userRepository from '../repositories/editProfileRepository.js';

export async function updateUser(userId, userData) {
  return await userRepository.updateUser(userId, userData);
}

export async function getUserById(userId) {
  return await userRepository.getUserById(userId);
}