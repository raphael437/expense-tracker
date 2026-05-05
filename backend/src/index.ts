import { configDotenv } from 'dotenv';
configDotenv({ path: './.env' });

import connectDB from './db';
import app from './app';

const port = 4000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`server running at port :${port}`);
    });
  })
  .catch(err => {
    console.log('mongodb connection failed', err.message);
  });
