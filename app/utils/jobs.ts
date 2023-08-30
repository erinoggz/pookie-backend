import cron from 'node-cron';
import { container } from 'tsyringe';
import { BookingService } from '../service/booking.service';
import { LoggerService } from '../service/logger.service';
import { RatingsService } from '../service/ratings.service';
import { PlanService } from '../service/plan.service';
import { PaypalService } from '../service/paypal.service';

const logger: LoggerService = container.resolve(LoggerService);
const bookingService: BookingService = container.resolve(BookingService);
const ratingsService: RatingsService = container.resolve(RatingsService);
const planService: PlanService = container.resolve(PlanService);
const paypalService: PaypalService = container.resolve(PaypalService);

cron.schedule('*/10 * * * * *', () => {
  logger.log('Running job to validate active booking every 10 seconds');
  bookingService.validateActiveBooking(1);
  logger.log('Completed running job to validate active bookings');
});

cron.schedule('*/10 * * * * *', () => {
  logger.log('Running job to validate accepted booking every 10 seconds');
  bookingService.validateAcceptedBooking(1);
  logger.log('Completed running job to validate accepted bookings');
});

cron.schedule('*/10 * * * * *', () => {
  logger.log('Running job to validate completed booking every 10 seconds');
  bookingService.validateCompletedBooking(1);
  logger.log('Completed running job to validate completed bookings');
});

cron.schedule('*/10 * * * *', () => {
  logger.log('Running job to update merchant ratings every 10 min');
  ratingsService.updateMerchantRatings(1);
  logger.log('Completed running job to update merchant ratings');
});

cron.schedule('0 0 * * *', () => {
  logger.log('Running job to validate parent subscriptions every midnight');
  planService.validateParentSubscriptions(1);
  logger.log('Completed running job to validate parent subscriptions');
});

cron.schedule('0 0 * * *', () => {
  logger.log('Running job to validate sitter subscriptions every midnight');
  planService.validateSitterSubscriptions(1);
  logger.log('Completed running job to validate sitter subscriptions');
});

cron.schedule('*/30 * * * * *', () => {
  logger.log('Running job to validate payout 30 seconds');
  paypalService.validatePayout(1);
  logger.log('Completed running job to validate payout');
});