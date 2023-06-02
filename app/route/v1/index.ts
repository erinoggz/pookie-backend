import express, { Router } from 'express';
import AuthRouter from './auth';
import UserRouter from './user';
import PlanRouter from './plan';
import BookingRouter from './booking';

const AppRouter: Router = express.Router();

AppRouter.use('/auth', AuthRouter);
AppRouter.use('/user', UserRouter);
AppRouter.use('/plan', PlanRouter);
AppRouter.use('/booking', BookingRouter);

export default AppRouter;
