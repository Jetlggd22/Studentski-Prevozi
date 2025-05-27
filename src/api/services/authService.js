import authRepository from '../repositories/authRepository.js';
import https from "https"
import dotenv from 'dotenv';
import jwt from "jsonwebtoken"
dotenv.config();


const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN; 
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;
const AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET;
const AUTH0_CONNECTION = 'Username-Password-Authentication';
console.log('[ENV LOADED]', {
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET: !!process.env.AUTH0_CLIENT_SECRET,
  AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE
});


export function httpsRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let body = '';
      res.on('data', chunk => (body += chunk));
      res.on('end', () => {
        console.log('[Raw Auth0 Response]:', body);
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 400) return reject(parsed);
          resolve(parsed);
        } catch (e) {
          reject(new Error('Invalid JSON: ' + body));
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function getAuth0Token() {
  const postData = JSON.stringify({
    grant_type: 'client_credentials',
    client_id: AUTH0_CLIENT_ID,
    client_secret: AUTH0_CLIENT_SECRET,
    audience: `https://${AUTH0_DOMAIN}/api/v2/`
  });
const options = {
    hostname: AUTH0_DOMAIN,
    path: '/oauth/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const response = await httpsRequest(options, postData);
  return response.access_token;
}


const createUser = async ({ email, geslo, ime, priimek, telefon, username }) => {
let token;
try {
  token = await getAuth0Token();
} catch (err) {
  console.error('Failed to get Auth0 token:', err);
  throw err; // optional: rethrow or handle gracefully
}


  const userData = JSON.stringify({
    email,
    password: geslo,
    connection: AUTH0_CONNECTION,
    given_name: ime,
    family_name: priimek
  });

  const options = {
    hostname: AUTH0_DOMAIN,
    path: '/api/v2/users',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(userData)
    }
  };

  const user = await httpsRequest(options, userData);

  const auth0UserId = user.user_id;

  return authRepository.createUser({ auth0UserId, ime, priimek, telefon, username });
};

const login = async ({ email, geslo }) => {
  const postData = JSON.stringify({
    grant_type: 'password',
    username: email,
    password: geslo,
    scope: 'openid profile email',
    client_secret: AUTH0_CLIENT_SECRET,
    audience:AUTH0_AUDIENCE,
    client_id: AUTH0_CLIENT_ID,
    connection: 'Username-Password-Authentication'
  });

  const options = {
    hostname: AUTH0_DOMAIN,
    path: '/oauth/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  const response = await httpsRequest(options, postData);
  const decoded = jwt.decode(response.access_token)
  const dbResponse = await authRepository.getUserById(decoded.sub)
  console.log(dbResponse)

  return {...response, ...dbResponse}; 
}

export default { createUser, login };
