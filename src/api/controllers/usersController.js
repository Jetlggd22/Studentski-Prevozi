import * as usersService from '../services/usersService.js';

export async function getAllUsers(req, res) {
  const users = await usersService.getAllUsers();
  res.json({ success: true, data: users });
}

export async function getUserById(req, res) {
  const user = await usersService.getUserById(req.params.id);
  if (user) res.json({ success: true, data: user });
  else res.status(404).json({ success: false, message: 'User not found' });
}

export async function createUser(req, res) {
  await usersService.createUser(req.body);
  res.json({ success: true });
}

export async function updateUser(req, res) {
  const success = await usersService.updateUser(req.params.id, req.body);
  if (success) res.json({ success: true });
  else res.status(404).json({ success: false, message: 'User not found' });
}

export async function deleteUser(req, res) {
  const success = await usersService.deleteUser(req.params.id);
  if (success) res.json({ success: true });
  else res.status(404).json({ success: false, message: 'User not found' });
}

export async function getTopDrivers(req, res) {
  const limit = parseInt(req.query.limit) || 5;
  const drivers = await usersService.getTopDrivers(limit);
  res.json({ success: true, data: drivers });
}