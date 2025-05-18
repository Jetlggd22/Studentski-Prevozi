import express from 'express';
import 'express-async-errors';
import dotenv from 'dotenv';
import routes from './routes.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/api', routes);

// basic error handler
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({error: err.message || 'Server error'});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API listening on ${PORT}`));
