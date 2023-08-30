import express, { Router } from 'express';
import { container } from 'tsyringe';
import UserController from '../../controller/user.controller';
import authMiddleware from '../../middleware/auth.middleware';

const UserRouter: Router = express.Router();
const userController: UserController = container.resolve(UserController);

UserRouter.post('/sitters', authMiddleware, userController.getSitters);
UserRouter.put('/garda-check', authMiddleware, userController.addGarderCheck);
UserRouter.get('/verify', authMiddleware, userController.complycubeVerification);
UserRouter.post('/comply/webhook', userController.complycubeWebhook);

export default UserRouter;
