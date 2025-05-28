const userRepository = require('../repositories/userRepository');

async function updateUser(userId, userData) {
  return await userRepository.updateUser(userId, userData);
}

async function getUserById(userId) {
  return await userRepository.getUserById(userId);
}

module.exports = { updateUser, getUserById };