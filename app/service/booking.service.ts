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

  private populateQuery = [
    {
      path: 'merchant',
      select:
        '_id firstName lastName state country profilePicture dateOfBirth experience childcareCertification ratings',
    },
  ];

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
        user: new Types.ObjectId(userId),
        merchant: new Types.ObjectId(merchantId),
        bookingStatus: StatusType.PENDING,
      },
      {
        user: new Types.ObjectId(userId),
        merchant: new Types.ObjectId(merchantId),
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
      merchant: new Types.ObjectId(req.user.id),
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

    const query = { merchant: new Types.ObjectId(req.user.id) };
    if (status) {
      query['bookingStatus'] = { $eq: status };
    }
    query['populate'] = this.populateQuery;
    const response = await this.pagination.paginate(query);

    return Helpers.success(response);
  };

  public parentGetAllBookings = async (
    req: IRequest
  ): Promise<ISuccess | ErrnoException> => {
    const { status } = req.query;

    const query = { user: new Types.ObjectId(req.user.id) };
    if (status) {
      query['bookingStatus'] = { $eq: status };
    }
    query['populate'] = this.populateQuery;
    const response = await this.pagination.paginate(query);

    return Helpers.success(response);
  };

  public parentUpdateBooking = async (
    req: IRequest
  ): Promise<ISuccess | ErrnoException> => {
    const { bookingId, status } = req.body;

    await Booking.findOneAndUpdate(
      {
        _id: new Types.ObjectId(bookingId),
        user: new Types.ObjectId(req.user.id),
      },
      {
        bookingStatus: status,
        customerRequest: status,
      },
      { upsert: true, new: true }
    );

    return Helpers.success(null);
  };

  public parentGetBooking = async (
    req: IRequest
  ): Promise<ISuccess | ErrnoException> => {
    const { bookingId } = req.params;
    const booking = await Booking.findOne({
      user: new Types.ObjectId(req.user.id),
      _id: bookingId,
    });
    return Helpers.success(booking);
  };

  public merchantGetBooking = async (
    req: IRequest
  ): Promise<ISuccess | ErrnoException> => {
    const { bookingId } = req.params;
    const booking = await Booking.findOne({
      merchant: new Types.ObjectId(req.user.id),
      _id: bookingId,
    });
    return Helpers.success(booking);
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
