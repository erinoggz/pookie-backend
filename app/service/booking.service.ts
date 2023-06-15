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
import { NotificationService } from './notification.service';

@injectable()
export class BookingService {
  pagination: PaginationService<IBookingModel>;

  private populateQuery = [
    {
      path: 'merchant',
      select:
        '_id firstName lastName state country profilePicture dateOfBirth experience childcareCertified ratings gardaCheck',
    },
    {
      path: 'user',
      select: '_id firstName lastName state country address profilePicture',
    },
  ];

  constructor(private notificationService: NotificationService) {
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

    await this.notificationService.sendNotification(
      merchant.device_token,
      'New Booking Request',
      'Please kindly check your Pookie app to accept or decline new booking request'
    );
    return Helpers.success(null);
  };

  public merchantUpdateBooking = async (
    req: IRequest
  ): Promise<ISuccess | ErrnoException> => {
    const { bookingId, status } = req.body;

    const booking: any = await Booking.findOne({
      _id: new Types.ObjectId(bookingId),
      merchant: new Types.ObjectId(req.user.id),
    }).populate(['user', 'merchant']);

    if (!booking)
      return Helpers.CustomException(
        StatusCodes.BAD_REQUEST,
        `Booking does not exist`
      );

    if (status === StatusType.DECLINED || status === StatusType.ACCEPTED) {
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
      await this.notificationService.sendNotification(
        booking.user.device_token,
        'Booking Status',
        `${booking.merchant.lastName || ''} ${
          booking.merchant.firstName || ''
        } recently updated booking status to ${status.toLowerCase()} please check your Pookie app`,
        {
          bookingId: booking._id,
          status,
          requestType: status,
          requestInitiator: 'merchant',
        }
      );
    } else {
      await Booking.findOneAndUpdate(
        {
          _id: new Types.ObjectId(bookingId),
        },
        {
          bookingStatus: StatusType.WAITING,
          merchantRequest: status,
        },
        { upsert: true, new: true }
      );
      await this.notificationService.sendNotification(
        booking.user.device_token,
        'Booking Status',
        `${booking.merchant.lastName || ''} ${
          booking.merchant.firstName || ''
        } recently updated booking status to ${status.toLowerCase()} please check your Pookie app`,
        {
          bookingId: booking._id,
          status: StatusType.WAITING,
          requestType: status,
          requestInitiator: 'merchant',
        }
      );
    }

    return Helpers.success(null);
  };

  public merchantGetAllBookings = async (
    req: IRequest
  ): Promise<ISuccess | ErrnoException> => {
    const { status } = req.query;

    const query = { ...req.query, merchant: new Types.ObjectId(req.user.id) };
    if (status) {
      query['bookingStatus'] = { $eq: status };
    }

    query['sort'] = { updatedAt: 'desc' };
    delete query['status'];
    query['populate'] = this.populateQuery;
    const response = await this.pagination.paginate(query);

    return Helpers.success(response);
  };

  public parentGetAllBookings = async (
    req: IRequest
  ): Promise<ISuccess | ErrnoException> => {
    const { status } = req.query;

    const query = { ...req.query, user: new Types.ObjectId(req.user.id) };
    if (status) {
      query['bookingStatus'] = { $eq: status };
    }

    query['sort'] = { updatedAt: 'desc' };
    delete query['status'];
    query['populate'] = this.populateQuery;
    const response = await this.pagination.paginate(query);

    return Helpers.success(response);
  };

  public parentUpdateBooking = async (
    req: IRequest
  ): Promise<ISuccess | ErrnoException> => {
    const { bookingId, status } = req.body;

    const booking: any = await Booking.findOne({
      _id: new Types.ObjectId(bookingId),
      user: new Types.ObjectId(req.user.id),
    }).populate(['user', 'merchant']);

    if (status === StatusType.DECLINED) {
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
      await this.notificationService.sendNotification(
        booking.merchant.device_token,
        'Booking Status',
        `${booking.user.lastName || ''} ${
          booking.user.firstName || ''
        } recently updated booking status to ${status.toLowerCase()} please check your Pookie app`,
        {
          bookingId: booking._id,
          status,
          requestType: status,
          requestInitiator: 'customer',
        }
      );
    } else {
      await Booking.findOneAndUpdate(
        {
          _id: new Types.ObjectId(bookingId),
          user: new Types.ObjectId(req.user.id),
        },
        {
          bookingStatus: StatusType.WAITING,
          customerRequest: status,
        },
        { upsert: true, new: true }
      );
      await this.notificationService.sendNotification(
        booking.merchant.device_token,
        'Booking Status',
        `${booking.user.lastName || ''} ${
          booking.user.firstName || ''
        } recently updated booking status to ${status.toLowerCase()} please check your Pookie app`,
        {
          bookingId: booking._id,
          status: StatusType.WAITING,
          requestType: status,
          requestInitiator: 'customer',
        }
      );
    }

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
    query['limit'] = 100;

    const result = await this.pagination.paginate<IBookingModel>(query, []);

    for (const item of result.data) {
      await Booking.findByIdAndUpdate(
        item._id,
        { bookingStatus: 'ACTIVE', actualStartDate: new Date() },
        { new: true }
      );
    }

    if (result.meta.page < result.meta.pages) {
      await this.validateActiveBooking(page + 1);
    }
  };

  public validateCompletedBooking = async (page = 1) => {
    const query = {};
    query['customerRequest'] = { $eq: StatusType.COMPLETED };
    query['merchantRequest'] = { $eq: StatusType.COMPLETED };
    query['bookingStatus'] = { $ne: StatusType.COMPLETED };
    query['page'] = page;
    query['limit'] = 100;

    const result = await this.pagination.paginate<IBookingModel>(query, []);

    async function calculateHours(start, end) {
      const startDate = moment(start);
      const endDate = moment(end);

      const duration = moment.duration(endDate.diff(startDate));
      const hours = duration.asHours();

      return hours;
    }

    for (const item of result.data) {
      const hours = await calculateHours(item.actualStartDate, new Date());
      const hour = Math.floor(hours);

      await Booking.findByIdAndUpdate(
        item._id,
        {
          bookingStatus: StatusType.COMPLETED,
          totalHours: hour,
          actualEndDate: new Date(),
        },
        { new: true }
      );
    }

    if (result.meta.page < result.meta.pages) {
      await this.validateCompletedBooking(page + 1);
    }
  };

  public validateAcceptedBooking = async (page = 1) => {
    const query = {};
    query['customerRequest'] = { $eq: StatusType.ACCEPTED };
    query['merchantRequest'] = { $eq: StatusType.ACCEPTED };
    query['bookingStatus'] = { $ne: StatusType.ACCEPTED };
    query['page'] = page;
    query['limit'] = 100;

    const result = await this.pagination.paginate<IBookingModel>(query, []);

    for (const item of result.data) {
      await Booking.findByIdAndUpdate(
        item._id,
        {
          bookingStatus: StatusType.ACCEPTED,
        },
        { new: true }
      );
    }

    if (result.meta.page < result.meta.pages) {
      await this.validateCompletedBooking(page + 1);
    }
  };
}
