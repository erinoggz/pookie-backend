import express, { Router } from 'express';
import { container } from 'tsyringe';
import BookingController from '../../controller/booking.controller';
import authMiddleware from '../../middleware/auth.middleware';
import parentMiddleware from '../../middleware/parent.middleware';
import sitterMiddleware from '../../middleware/sitter.middleware';
import BookingValidator from '../../validator/booking.validator';

const BookingRouter: Router = express.Router();
const bookingController: BookingController = container.resolve(BookingController);
const bookingValidator: BookingValidator = container.resolve(BookingValidator);

BookingRouter.post(
  '/',
  authMiddleware,
  parentMiddleware,
  bookingValidator.createBooking,
  bookingController.createBooking
)
  .put(
    '/sitter',
    authMiddleware,
    sitterMiddleware,
    bookingController.merchantUpdateBooking
  )
  .put(
    '/parent',
    authMiddleware,
    parentMiddleware,
    bookingController.parentUpdateBooking
  )
  .get(
    '/sitter',
    authMiddleware,
    sitterMiddleware,
    bookingController.merchantGetAllBookings
  )
  .get(
    '/parent',
    authMiddleware,
    parentMiddleware,
    bookingController.parentGetAllBookings
  );

export default BookingRouter;
