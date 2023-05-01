import express, { Router } from 'express';
import AuthRouter from './auth';
import UserRouter from './user';
import PlanRouter from './plan';

const AppRouter: Router = express.Router();

AppRouter.use('/auth', AuthRouter);
AppRouter.use('/user', UserRouter);
AppRouter.use('/plan', PlanRouter);

export default AppRouter;
