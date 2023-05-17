import 'reflect-metadata';
import express, { Application } from 'express';
import config from './app/config/config';
import Routes from './app/route';
import cors from 'cors';
import mongoose from 'mongoose';
import response from './app/lib/response';
import jwtMiddleware from './app/middleware/jwt.middleware';
import passport from 'passport';
import cookieParser from 'cookie-parser';

import { container } from 'tsyringe';
import { LoggerService } from './app/service/logger.service';
import StatusCodes from './app/lib/response/status-codes';
import seeder from './app/seeds';
const logger: LoggerService = container.resolve(LoggerService);

class Server {
  private app: Application;
  constructor() {
    this.app = express();
  }

  private mongooseConnection() {
    mongoose
      .connect(config.mongo.uri)
      .then(() => logger.log('Database Connected'))
      .catch((err) => {
        logger.error(err);
      });

    mongoose.connection.on('error', (err) => {
      logger.error(`DB connection error: ${err.message}`);
    });
  }

  public configuration() {
    this.mongooseConnection();
    this.app.use(response);
    this.app.use(cookieParser());
    this.app.use(cors());
    this.app.use(express.json());

    // Initialize passport middleware
    this.app.use(passport.initialize());
    jwtMiddleware(passport);

    this.app.get('/', (req, res) => {
      res.status(StatusCodes.OK).json('starting...');
    });

    // Mount routes
    Routes(this.app);
  }

  public databaseSeeds = async function () {
    await seeder.seedDb();
  };

  public async start() {
    const PORT = config.web.port;
    this.configuration();
    this.databaseSeeds();
    this.app.listen(PORT, () => {
      logger.log(`Server is listening on port ${PORT}.`);
    });
  }
}
const server = new Server();
server.start();
