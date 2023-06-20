import express, { Router } from 'express';
import { container } from 'tsyringe';
import RatingsController from '../../controller/ratings.controller';
import authMiddleware from '../../middleware/auth.middleware';
import parentMiddleware from '../../middleware/parent.middleware';
import RatingsValidator from '../../validator/rating.validator';

const RatingsRouter: Router = express.Router();
const ratingsController: RatingsController = container.resolve(RatingsController);
const ratingsValidator: RatingsValidator = container.resolve(RatingsValidator);

RatingsRouter.post(
  '/',
  authMiddleware,
  parentMiddleware,
  ratingsValidator.addRatings,
  ratingsController.addRatings
);

export default RatingsRouter;
