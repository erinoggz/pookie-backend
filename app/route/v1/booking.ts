import express, { Router } from 'express';
import { container } from 'tsyringe';
import BookingController from '../../controller/booking.controller';
import authMiddleware from '../../middleware/auth.middleware';
import parentMiddleware from '../../middleware/parent.middleware';
// import sitterMiddleware from '../../middleware/sitter.middleware';
import sitterTutorMiddleware from '../../middleware/sitter-and-tutor.middleware';
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
  .post(
    '/payment',
    authMiddleware,
    parentMiddleware,
    bookingController.completeBookingPayment
  )
  .put(
    '/sitter',
    authMiddleware,
    sitterTutorMiddleware,
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
    sitterTutorMiddleware,
    bookingController.merchantGetAllBookings
  )
  .get(
    '/sitter/:bookingId',
    authMiddleware,
    sitterTutorMiddleware,
    bookingController.merchantGetBooking
  )
  .get(
    '/parent',
    authMiddleware,
    parentMiddleware,
    bookingController.parentGetAllBookings
  )
  .get(
    '/parent/:bookingId',
    authMiddleware,
    parentMiddleware,
    bookingController.parentGetBooking
  );

export default BookingRouter;
