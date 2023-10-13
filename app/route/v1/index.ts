import express, { Router } from 'express';
import AuthRouter from './auth';
import UserRouter from './user';
import StripeRouter from './stripe';
import PlanRouter from './plan';
import BookingRouter from './booking';
import RatingsRouter from './rating';
import WalletRouter from './wallet';
import PaypalRouter from './paypal';

const AppRouter: Router = express.Router();

AppRouter.use('/auth', AuthRouter);
AppRouter.use('/user', UserRouter);
AppRouter.use('/payment', StripeRouter);
AppRouter.use('/plan', PlanRouter);
AppRouter.use('/booking', BookingRouter);
AppRouter.use('/rating', RatingsRouter);
AppRouter.use('/wallet', WalletRouter);
AppRouter.use('/paypal', PaypalRouter);
AppRouter.use('/stripe', StripeRouter);

export default AppRouter;
