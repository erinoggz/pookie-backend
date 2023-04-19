import express, { Router } from 'express';
import AuthRouter from './auth';

const AppRouter: Router = express.Router();

AppRouter.use('/auth', AuthRouter);

export default AppRouter;
