import express, { Router } from 'express';
import { container } from 'tsyringe';
import AuthController from '../../controller/auth.controller';
import authMiddleware from '../../middleware/auth.middleware';
import AuthValidator from '../../validator/auth.validator';

const AuthRouter: Router = express.Router();
const authController: AuthController = container.resolve(AuthController);
const authValidator: AuthValidator = container.resolve(AuthValidator);

AuthRouter.post('/register', authValidator.register, authController.register)
  .post('/login', authValidator.login, authController.login)
  .post('/verify', authValidator.verify, authController.verify)
  .post('/resend-otp', authValidator.resendOTP, authController.resendOTP)
  .post('/refresh-token', authController.refreshToken)
  .put('/forgot-password', authValidator.forgot, authController.forgot)
  .put('/reset-password', authValidator.reset, authController.reset)
  .put(
    '/change-password',
    authMiddleware,
    authValidator.change,
    authController.change
  )
  .put('/profile-setup', authMiddleware, authController.profileSetup)
  .get('/me', authMiddleware, authController.me);

export default AuthRouter;
