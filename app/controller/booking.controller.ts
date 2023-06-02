import { injectable } from 'tsyringe';
import { IRequest, IResponse } from '../common/Interface/IResponse';
import { BookingService } from '../service/booking.service';

@injectable()
class BookingController {
  constructor(private bookingService: BookingService) {}

  /**
   * @route POST api/v1/booking
   * @desc create booking endpoint
   * @access Public.
   */
  createBooking = async (req: IRequest, res: IResponse) => {
    try {
      const result = await this.bookingService.createBooking(req);
      return res.ok(
        result?.data,
        result?.message || 'Booking created successfully!'
      );
    } catch (error) {
      return res.serverError(
        error,
        error?.message || 'An error occured while trying to create booking',
        error?.code
      );
    }
  };

  /**
   * @route PUT api/v1/booking/sitter
   * @desc create booking endpoint
   * @access Public.
   */
  merchantUpdateBooking = async (req: IRequest, res: IResponse) => {
    try {
      const result = await this.bookingService.merchantUpdateBooking(req);
      return res.ok(
        result?.data,
        result?.message || 'Booking updated successfully!'
      );
    } catch (error) {
      return res.serverError(
        error,
        error?.message || 'An error occured while trying to update booking',
        error?.code
      );
    }
  };

  /**
   * @route PUT api/v1/booking/parent
   * @desc create booking endpoint
   * @access Public.
   */
  parentUpdateBooking = async (req: IRequest, res: IResponse) => {
    try {
      const result = await this.bookingService.parentUpdateBooking(req);
      return res.ok(
        result?.data,
        result?.message || 'Booking updated successfully!'
      );
    } catch (error) {
      return res.serverError(
        error,
        error?.message || 'An error occured while trying to update booking',
        error?.code
      );
    }
  };

  /**
   * @route GET api/v1/booking/sitter
   * @desc get all bookings endpoint
   * @access Public.
   */
  merchantGetAllBookings = async (req: IRequest, res: IResponse) => {
    try {
      const result = await this.bookingService.merchantGetAllBookings(req);
      return res.ok(
        result?.data,
        result?.message || 'Bookings fetched successfully!'
      );
    } catch (error) {
      return res.serverError(
        error,
        error?.message || 'An error occured while trying to fetched bookings',
        error?.code
      );
    }
  };

  /**
   * @route GET api/v1/booking/parent
   * @desc get all bookings endpoint
   * @access Public.
   */
  parentGetAllBookings = async (req: IRequest, res: IResponse) => {
    try {
      const result = await this.bookingService.parentGetAllBookings(req);
      return res.ok(
        result?.data,
        result?.message || 'Bookings fetched successfully!'
      );
    } catch (error) {
      return res.serverError(
        error,
        error?.message || 'An error occured while trying to fetched bookings',
        error?.code
      );
    }
  };
}

export default BookingController;
