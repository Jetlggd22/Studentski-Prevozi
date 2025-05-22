// src/api/routes.js
import { Router } from 'express';
import { expressjwt } from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import authController from './controllers/authController.js';
import catchAsync from './utils/catchAsync.js';
import { getUserHistory, getRideDetails } from "./controllers/historyController.js";
// Removed duplicate import of getAllPrevozi from here
import { getAllHistories } from './controllers/adminHistoryController.js';
import { getAllPrevozi, getPrevoz } from './controllers/rideController.js'; // Keep this one


const checkJwt = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256'],
});

const router = Router();

router.post('/users', catchAsync(authController.createUser));
router.get('/zgodovina/uporabnik/:id', getUserHistory);
router.get('/zgodovina/prevoz/:id', getRideDetails);
router.get('/prevozi', getAllPrevozi); 
router.get('/admin/history', getAllHistories);
router.post('/login', catchAsync(authController.loginUser));
router.get('/prevozi/:id', catchAsync(getPrevoz));


export default router;