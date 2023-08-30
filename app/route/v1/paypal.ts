import express, { Router } from 'express';
import { container } from 'tsyringe';
import PaypalController from '../../controller/paypal.controller';
import authMiddleware from '../../middleware/auth.middleware';
import sitterAndTutorMiddleware from '../../middleware/sitter-and-tutor.middleware';

const PaypalRouter: Router = express.Router();
const paypalController: PaypalController = container.resolve(PaypalController);

PaypalRouter.post(
  '/payout',
  authMiddleware,
  sitterAndTutorMiddleware,
  paypalController.issuePayout
).get(
  '/payout',
  authMiddleware,
  sitterAndTutorMiddleware,
  paypalController.payoutHistory
);

export default PaypalRouter;
