import cron from 'node-cron';
import { container } from 'tsyringe';
import { BookingService } from '../service/booking.service';
import { LoggerService } from '../service/logger.service';

const logger: LoggerService = container.resolve(LoggerService);
const bookingService: BookingService = container.resolve(BookingService);

cron.schedule('*/20 * * * * *', () => {
  logger.log('Running job to validate active booking every 20 seconds');
  bookingService.validateActiveBooking(1);
  logger.log('Completed running job to validate active bookings');
});

cron.schedule('*/20 * * * * *', () => {
  logger.log('Running job to validate accepted booking every 20 seconds');
  bookingService.validateAcceptedBooking(1);
  logger.log('Completed running job to validate accepted bookings');
});

cron.schedule('*/20 * * * * *', () => {
  logger.log('Running job to validate completed booking every 20 seconds');
  bookingService.validateCompletedBooking(1);
  logger.log('Completed running job to validate completed bookings');
});
