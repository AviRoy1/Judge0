import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import mongoSanitize from "express-mongo-sanitize";
import allApi from './Router/index';
import helmet from 'helmet';
import httpStatus from "http-status";
import ApiError from './utils';
import { errorConverter } from './middleware/error';
import executionQueue from './processors/jobQueue';

dotenv.config();
const app = express();

connectDB();
executionQueue;
app.use(express.json());
app.use(express.urlencoded({extended: true}));


// set security HTTP headers
app.use(helmet());

// sanitize request data
app.use(mongoSanitize());

app.use('/api', allApi);



  



// send back a 404 error for any unknown api request
app.use((_req, _res, next) => {
    next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

// convert error to ApiError, if needed
app.use(errorConverter);


const server = app.listen(process.env.port, () => {
    console.log(`Listening to port ${process.env.port}`);
  });
  
  const exitHandler = () => {
    if (server) {
      server.close(() => {
        console.log("Server closed");
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  };
  
  const unexpectedErrorHandler = (error: any) => {
    console.error(error);
    exitHandler();
  };
  
  process.on("uncaughtException", unexpectedErrorHandler);
  process.on("unhandledRejection", unexpectedErrorHandler);
  
  process.on("SIGTERM", () => {
    console.log("SIGTERM received");
    if (server) {
      server.close();
    }
  });