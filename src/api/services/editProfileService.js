import * as userRepository from '../repositories/editProfileRepository.js';
import dotenv from 'dotenv';
import { login, httpsRequest, getAuth0Token, sendVerificationEmail } from './authService.js';
dotenv.config();

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN; 
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;
const AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET;
const AUTH0_CONNECTION = 'Username-Password-Authentication'; 

export async function updateUser(userId, userData) {
  let token
  try {
    token = await getAuth0Token()
  }catch(err){
    return new Error()
  }
  if (userData.newPassword) {
    try {
      await login({email: userData.oldEmail, geslo: userData.oldPassword});
      try {
        changeUserPassword(userId, userData.newPassword, token)
      }catch(err) {
        throw new Error(err.msg)
      }
    } catch (err) {
      throw new Error(err.msg || "Napačno trenutno geslo"); 
    }
  }
  if(userData.Email){
    try{
      console.log(userId)
      await changeUserEmail(userId, userData.Email, token)
    }catch (err){
      throw new Error()
    }
  }
  return await userRepository.updateUser(userId, userData);
}

async function changeUserPassword(userId, newPassword, token) {
  const payload = JSON.stringify({
    password: newPassword,
    connection: 'Username-Password-Authentication'
  });

  const options = {
    hostname: AUTH0_DOMAIN,
    path: `/api/v2/users/${encodeURIComponent(userId)}`,
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  return await httpsRequest(options, payload);
}

async function changeUserEmail(userId, newEmail, token) {
  const payload = JSON.stringify({
    email: newEmail,
    connection: 'Username-Password-Authentication'
  });

  const options = {
    hostname: AUTH0_DOMAIN,
    path: `/api/v2/users/${encodeURIComponent(userId)}`,
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  return await httpsRequest(options, payload);
}

export async function getUserById(userId) {
  return await userRepository.getUserById(userId);
}
