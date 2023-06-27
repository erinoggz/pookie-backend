import express, { Router } from 'express';
import AuthRouter from './auth';
import UserRouter from './user';
import StripeRouter from './stripe';
import PlanRouter from './plan';
import BookingRouter from './booking';
import RatingsRouter from './rating';

const AppRouter: Router = express.Router();

AppRouter.use('/auth', AuthRouter);
AppRouter.use('/user', UserRouter);
AppRouter.use('/payment', StripeRouter);
AppRouter.use('/plan', PlanRouter);
AppRouter.use('/booking', BookingRouter);
AppRouter.use('/rating', RatingsRouter);

export default AppRouter;
