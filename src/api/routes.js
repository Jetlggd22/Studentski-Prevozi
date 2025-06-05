// src/api/routes.js
import { Router } from 'express';
import { expressjwt } from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import authController from './controllers/authController.js';
import catchAsync from './utils/catchAsync.js';
import { getUserHistory, getRideDetails } from "./controllers/historyController.js";
import { getAllHistories } from './controllers/adminHistoryController.js';// ... other imports
import { searchLokacije } from './controllers/lokacijaController.js'; // Create this controller
import { getAllPrevozi, getPrevoz, deletePrevoz , updatePrevoz} from './controllers/rideController.js'; 
import * as userController from './controllers/editProfileController.js';
import * as usersController from './controllers/usersController.js';
import { getAdminStats } from './controllers/adminStatsController.js';
import * as searchUserController from './controllers/searchUserController.js';
import * as createPrevozController from './controllers/createPrevozController.js';
import * as rezervacijaController from './controllers/rezervacijaController.js'; 

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
router.put('/prevozi/:id', catchAsync(updatePrevoz)); //
router.get('/prevozi', getAllPrevozi); 
router.get('/admin/history', getAllHistories);
router.post('/login', catchAsync(authController.loginUser));
router.get('/prevozi/:id', catchAsync(getPrevoz));
router.get('/search', catchAsync(authController.searchRoutes));
router.put('/uporabnik/:id', userController.updateUser);
router.get('/users', usersController.getAllUsers);
router.get('/users/:id', usersController.getUserById);
router.post('/users', usersController.createUser);
router.put('/users/:id', usersController.updateUser);
router.delete('/users/:id', usersController.deleteUser);
router.get('/admin/stats', getAdminStats);
router.get('/uporabnik/:id', userController.getUserById);
router.get('/top-drivers', usersController.getTopDrivers);
router.get('/search-drivers', searchUserController.searchDrivers);
router.post('/prevozi', createPrevozController.createPrevoz);
router.post('/rezervacije', catchAsync(rezervacijaController.createRezervacija));
router.patch('/rezervacije/:idRezervacija/preklici', catchAsync(rezervacijaController.prekliciRezervacija));
router.get('/rezervacije/uporabnik/:idUporabnik/prevoz/:idPrevoz', catchAsync(rezervacijaController.getUserRezervacijaForPrevoz));

router.delete('/prevozi/:id', catchAsync(deletePrevoz)); // We can protect this with admin middleware later
router.get('/lokacije/search', searchLokacije);
export default router;