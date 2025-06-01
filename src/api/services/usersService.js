import * as usersRepository from '../repositories/usersRepository.js';

export async function getAllUsers() {
  return await usersRepository.getAllUsers();
}

export async function getUserById(id) {
  return await usersRepository.getUserById(id);
}

export async function createUser(user) {
  return await usersRepository.createUser(user);
}

export async function updateUser(id, user) {
  return await usersRepository.updateUser(id, user);
}

export async function deleteUser(id) {
  return await usersRepository.deleteUser(id);
}

export async function getTopDrivers(limit = 5) {
  return await usersRepository.getTopDrivers(limit);
}