import express, { Router } from 'express';
import { container } from 'tsyringe';
import PlanController from '../../controller/plan.controller';
import authMiddleware from '../../middleware/auth.middleware';

const PlanRouter: Router = express.Router();
const planController: PlanController = container.resolve(PlanController);

PlanRouter.get('/', authMiddleware, planController.getPlans);

export default PlanRouter;
