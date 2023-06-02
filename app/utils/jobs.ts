import cron from 'node-cron';
import { container } from 'tsyringe';
import { BookingService } from '../service/booking.service';
import { LoggerService } from '../service/logger.service';

const logger: LoggerService = container.resolve(LoggerService);
const bookingService: BookingService = container.resolve(BookingService);

cron.schedule('* * * * *', () => {
  logger.log('Running job to validate active booking every minute');
  bookingService.validateActiveBooking(1);
  logger.log('Completed running job to validate active bookings');
});
