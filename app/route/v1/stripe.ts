import express, { Router } from 'express';
import { container } from 'tsyringe';
import StripeController from '../../controller/stripe.controller';
import authMiddleware from '../../middleware/auth.middleware';

const StripeRouter: Router = express.Router();
const stripeController: StripeController = container.resolve(StripeController);

StripeRouter.post(
  '/initialzie',
  authMiddleware,
  stripeController.initializePayment
)
// .get('/verify', authMiddleware, stripeController.verifyPayment);

export default StripeRouter;
