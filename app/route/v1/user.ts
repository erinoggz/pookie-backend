import express, { Router } from 'express';
import { container } from 'tsyringe';
import UserController from '../../controller/user.controller';
import authMiddleware from '../../middleware/auth.middleware';

const UserRouter: Router = express.Router();
const userController: UserController = container.resolve(UserController);

UserRouter.post('/sitters', authMiddleware, userController.getSitters);
UserRouter.post('/report', authMiddleware, userController.report);
UserRouter.put('/account/delete', authMiddleware, userController.deleteAccount);
UserRouter.put('/account/block', authMiddleware, userController.blockAccount);
UserRouter.put('/account/unblock', authMiddleware, userController.unBlockAccount);
UserRouter.get('/account/blacklist', authMiddleware, userController.blockedList);
UserRouter.put('/garda-check', authMiddleware, userController.addGarderCheck);
UserRouter.get('/verify', authMiddleware, userController.complycubeVerification);
UserRouter.post('/comply/webhook', userController.complycubeWebhook);
  UserRouter.put('/account/update', authMiddleware, userController.addAccountNumber);

export default UserRouter;
