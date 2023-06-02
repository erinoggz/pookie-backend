import { injectable } from 'tsyringe';
import { ErrnoException, ISuccess } from '../common/Interface/IResponse';
import Helpers from '../lib/helpers';
import { IRequest } from '../common/Interface/IResponse';
import Booking from '../model/booking.model';
import User from '../model/user.model';
import StatusCodes from '../lib/response/status-codes';
import { StatusType } from '../common/Enum/bookingStatus';
import { Types } from 'mongoose';
import { IBookingModel } from '../model/interface/IBookingModel';
import PaginationService from './pagination.service';
import moment from 'moment';
import { LoggerService } from './logger.service';

@injectable()
export class BookingService {
  pagination: PaginationService<IBookingModel>;

  constructor(private logger: LoggerService) {
    this.pagination = new PaginationService(Booking);
  }

  public createBooking = async (
    req: IRequest
  ): Promise<ISuccess | ErrnoException> => {
    const { merchantId, userId, startDate, endDate, address } = req.body;

    const merchant = await User.findById(merchantId);
    if (!merchant)
      return Helpers.CustomException(
        StatusCodes.BAD_REQUEST,
        `Sitter does not exist or has a disabled Account!`
      );
    if (merchant.availability !== StatusType.AVAILABLE)
      return Helpers.CustomException(
        StatusCodes.BAD_REQUEST,
        `Sitter is currently not available!`
      );

    await Booking.findOneAndUpdate(
      {
        userId: new Types.ObjectId(userId),
        merchantId: new Types.ObjectId(merchantId),
        bookingStatus: StatusType.PENDING,
      },
      {
        userId: new Types.ObjectId(userId),
        merchantId: new Types.ObjectId(merchantId),
        startDate,
        endDate,
        address,
      },
      { upsert: true, new: true }
    );

    return Helpers.success(null);
  };

  public merchantUpdateBooking = async (
    req: IRequest
  ): Promise<ISuccess | ErrnoException> => {
    const { bookingId, status } = req.body;

    const booking = await Booking.findOne({
      _id: new Types.ObjectId(bookingId),
      merchantId: new Types.ObjectId(req.user.id),
    });
    if (!booking)
      return Helpers.CustomException(
        StatusCodes.BAD_REQUEST,
        `Booking does not exist`
      );

    await Booking.findOneAndUpdate(
      {
        _id: new Types.ObjectId(bookingId),
      },
      {
        bookingStatus: status,
        merchantRequest: status,
      },
      { upsert: true, new: true }
    );

    return Helpers.success(null);
  };

  public merchantGetAllBookings = async (
    req: IRequest
  ): Promise<ISuccess | ErrnoException> => {
    const { status } = req.query;

    const bookings = await Booking.find({
      bookingStatus: status,
      merchantId: new Types.ObjectId(req.user.id),
    });

    return Helpers.success(bookings);
  };

  public parentGetAllBookings = async (
    req: IRequest
  ): Promise<ISuccess | ErrnoException> => {
    const { status } = req.query;

    const bookings = await Booking.find({
      bookingStatus: status,
      userId: new Types.ObjectId(req.user.id),
    });

    return Helpers.success(bookings);
  };

  public parentUpdateBooking = async (
    req: IRequest
  ): Promise<ISuccess | ErrnoException> => {
    const { bookingId, status } = req.body;

    await Booking.findOneAndUpdate(
      {
        _id: new Types.ObjectId(bookingId),
        userId: new Types.ObjectId(req.user.id),
      },
      {
        bookingStatus: status,
        customerRequest: status,
      },
      { upsert: true, new: true }
    );

    return Helpers.success(null);
  };

  public validateActiveBooking = async (page = 1) => {
    const query = {};
    query['customerRequest'] = { $eq: StatusType.ACTIVE };
    query['merchantRequest'] = { $eq: StatusType.ACTIVE };
    query['bookingStatus'] = { $ne: StatusType.ACTIVE };
    query['page'] = page;
    query['limit'] = 50;
    query['sort'] = { updatedAt: 'desc' };

    const result = await this.pagination.paginate<IBookingModel>(query, []);

    async function calculateHours(start, end) {
      const startDate = moment(start);
      const endDate = moment(end);

      const duration = moment.duration(endDate.diff(startDate));
      const hours = duration.asHours();

      return hours;
    }

    // for each item in the array, make decision based on the status of ratings
    for (const item of result.data) {
      const hours = await calculateHours(item.startDate, item.endDate);
      const hour = Math.floor(hours);
      await Booking.findByIdAndUpdate(
        item._id,
        { bookingStatus: 'ACTIVE', totalHours: hour },
        { new: true }
      );
    }

    if (result.meta.page < result.meta.pages) {
      await this.validateActiveBooking(page + 1);
    }
  };
}
