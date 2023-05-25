import express, { Router } from 'express';
import { container } from 'tsyringe';
import UserController from '../../controller/user.controller';
import authMiddleware from '../../middleware/auth.middleware';

const UserRouter: Router = express.Router();
const userController: UserController = container.resolve(UserController);

UserRouter.get('/sitters', authMiddleware, userController.getSitters);
UserRouter.put('/garda-check', authMiddleware, userController.addGarderCheck);

export default UserRouter;
