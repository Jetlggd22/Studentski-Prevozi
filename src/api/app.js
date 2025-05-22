import express from 'express';
import dotenv from 'dotenv';
import routes from './routes.js';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url'; // Dodano

// Pravilna definicija __dirname za ES module
const __filename = fileURLToPath(import.meta.url); // Dodano
const __dirname = path.dirname(__filename); // Dodano

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(
  // Pot do mape 'frontend' je sedaj relativna na trenutno datoteko 'app.js'
  express.static(path.join(__dirname, '..', 'frontend'))
);
app.use('/api', routes);

// basic error handler
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({error: err.message || 'Server error'});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API listening on ${PORT}`));