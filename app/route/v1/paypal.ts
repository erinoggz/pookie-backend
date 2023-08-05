import express, { Router } from 'express';
import { container } from 'tsyringe';
import PaypalController from '../../controller/paypal.controller';
import authMiddleware from '../../middleware/auth.middleware';

const PaypalRouter: Router = express.Router();
const paypalController: PaypalController = container.resolve(PaypalController);

PaypalRouter.post('/payout', authMiddleware, paypalController.issuePayout);

export default PaypalRouter;
