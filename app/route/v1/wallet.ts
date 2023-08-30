import express, { Router } from 'express';
import { container } from 'tsyringe';
import authMiddleware from '../../middleware/auth.middleware';
import WalletController from '../../controller/wallet.controller';

const WalletRouter: Router = express.Router();
const walletController: WalletController = container.resolve(WalletController);

WalletRouter.get('/balance', authMiddleware, walletController.walletBalance)
  .get('/history', authMiddleware, walletController.walletHistory)
  .get('/balance', authMiddleware, walletController.walletBalance)
  .post('/fund', authMiddleware, walletController.fundWallet);

export default WalletRouter;
