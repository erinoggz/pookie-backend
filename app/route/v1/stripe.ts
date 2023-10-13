import express, { Router } from 'express';
import { container } from 'tsyringe';
import StripeController from '../../controller/stripe.controller';
import authMiddleware from '../../middleware/auth.middleware';

const StripeRouter: Router = express.Router();
const stripeController: StripeController = container.resolve(StripeController);

StripeRouter.post('/initialzie', authMiddleware, stripeController.initializePayment)
  .post('/payout', authMiddleware, stripeController.issuePayout)
  .put('/account/update', authMiddleware, stripeController.updateAccountNumber);

// .get('/verify', authMiddleware, stripeController.verifyPayment);

export default StripeRouter;
