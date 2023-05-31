import { Errback, NextFunction, Request, Response, Router } from 'express';
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import path from 'path';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
dotenv.config();

//environment variables
const { MONGO_URI, SERVER_PORT } = process.env;

if (!MONGO_URI) {
  //type guarding
  throw new Error('MONGO_URI environment variable is not set');
}
//databse connection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log('Database connection started'))
  .catch((err) => console.log(err));

//
//
//Route Handler Can go in here
app.get('/', (req: Request, res: Response) => {
  return res
    .status(200)
    .sendFile(path.resolve(__dirname, '../client/index.html'));
});
//
//

//404 Handler
app.use('*', (req: Request, res: Response) => {
  console.log('run');
  return res.status(404).json('Not found');
});

//global error handler
app.use((err: Errback, req: Request, res: Response, next: NextFunction) => {
  const defaultErr = {
    log: 'Express error handler caught unknown middleware error',
    status: 400,
    message: { err: 'An error occurred' }
  };
  const errorObj = Object.assign(defaultErr, err);
  return res.status(errorObj.status).json(errorObj.message);
});

//app starts on port 3000
app.listen(SERVER_PORT, () => {
  console.log(`Server started to listen on port ${SERVER_PORT}`);
});