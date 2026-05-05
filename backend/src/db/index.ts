import mongoose from 'mongoose';
import process from 'node:process';
import { configDotenv } from 'dotenv';
configDotenv({ path: './.env' });
export default async function connectDB() {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URI!);
    console.log(
      'mongo connected',
      connectionInstance.connection.host,
      process.env.MONGODB_URI,
    );
  } catch (error) {
    console.log('mongo connection error', error);
    process.exit();
  }
}
