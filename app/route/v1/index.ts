import express, { Router } from 'express';
import AuthRouter from './auth';
import UserRouter from './user';

const AppRouter: Router = express.Router();

AppRouter.use('/auth', AuthRouter);
AppRouter.use('/user', UserRouter);

export default AppRouter;
