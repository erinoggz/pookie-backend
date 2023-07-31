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
import { WalletService } from './wallet.service';

@injectable()
export class BookingService {
  pagination: PaginationService<IBookingModel>;

  private populateQuery = [
    {
      path: 'merchant',
      select:
        '_id firstName lastName state country rate profilePicture dateOfBirth experience childcareCertified ratings gardaCheck',
    },
    {
      path: 'user',
      select: '_id firstName lastName state country address profilePicture',
    },
  ];

  constructor(
    private notificationService: NotificationService,
    private walletService: WalletService
  ) {
    this.pagination = new PaginationService(Booking);
  }

  public createBooking = async (
    req: IRequest
  ): Promise<ISuccess | ErrnoException> => {
    const {
      merchantId,
      userId,
      startDate,
      endDate,
      address,
      walletId,
      transactionId,
      bookingFee,
    } = req.body;

    const merchant = await User.findById(merchantId);
    if (!merchant)
      return Helpers.CustomException(
        StatusCodes.BAD_REQUEST,
        `Sitter does not exist or has a disabled Account!`
      );
    if (merchant.availability !== StatusType.available)
      return Helpers.CustomException(
        StatusCodes.BAD_REQUEST,
        `Sitter is currently not available!`
      );

    const booking: IBookingModel = new Booking({
      user: new Types.ObjectId(userId),
      merchant: new Types.ObjectId(merchantId),
      startDate,
      endDate,
      address,
    });

    if (walletId) {
      await this.walletService.debitWallet(walletId, bookingFee, booking._id);
    }

    await booking.save();

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

    if (status === StatusType.declined || status === StatusType.accepted) {
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
          bookingStatus: StatusType.waiting,
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
          status: StatusType.waiting,
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

    if (status === StatusType.declined) {
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
          bookingStatus: StatusType.waiting,
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
          status: StatusType.waiting,
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
    query['customerRequest'] = { $eq: StatusType.active };
    query['merchantRequest'] = { $eq: StatusType.active };
    query['bookingStatus'] = { $ne: StatusType.active };
    query['page'] = page;
    query['limit'] = 100;

    const result = await this.pagination.paginate<IBookingModel>(query, []);

    for (const item of result.data) {
      await Booking.findByIdAndUpdate(
        item._id,
        { bookingStatus: 'active', actualStartDate: new Date() },
        { new: true }
      );
    }

    if (result.meta.page < result.meta.pages) {
      await this.validateActiveBooking(page + 1);
    }
  };

  public validateCompletedBooking = async (page = 1) => {
    const query = {};
    query['customerRequest'] = { $eq: StatusType.completed };
    query['merchantRequest'] = { $eq: StatusType.completed };
    query['bookingStatus'] = { $ne: StatusType.completed };
    query['page'] = page;
    query['limit'] = 100;

    const result = await this.pagination.paginate<IBookingModel>(query, []);

    async function calculateHours(startD: Date, endD: Date, actualStartD: Date) {
      const startDate = moment(startD);
      const endDate = moment(endD).add(1, 'day');
      const actualStartDate = moment(actualStartD);
      const actualEndDate = moment(new Date()).add(1, 'day');
      const startTime = startDate.utc().format('HH:mm:ss');
      const endTime = endDate.utc().format('HH:mm:ss');
      const actualStartTime = actualStartDate.utc().format('HH:mm:ss');
      const actualEndTime = actualEndDate.format('HH:mm:ss');
      const date = '1970-01-01';
      const dateTime1 = moment(`${date} ${startTime}`);
      const dateTime2 = moment(`${date} ${endTime}`);
      const dateTime3 = moment(`${date} ${actualStartTime}`);
      const dateTime4 = moment(`${date} ${actualEndTime}`);
      const hoursdif = dateTime2.diff(dateTime1, 'hours');
      const days = endDate.diff(startDate, 'days');
      const actualDays = actualEndDate.diff(actualStartDate, 'days');
      let noHrs = dateTime4.diff(dateTime3, 'hours');
      if (days > 1) {
        noHrs = actualDays * hoursdif;
      }
      return noHrs;
    }

    for (const item of result.data) {
      const hour = await calculateHours(
        item.startDate,
        item.endDate,
        item.actualStartDate
      );

      await Booking.findByIdAndUpdate(
        item._id,
        {
          bookingStatus: StatusType.completed,
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
    query['customerRequest'] = { $eq: StatusType.accepted };
    query['merchantRequest'] = { $eq: StatusType.accepted };
    query['bookingStatus'] = { $ne: StatusType.accepted };
    query['page'] = page;
    query['limit'] = 100;

    const result = await this.pagination.paginate<IBookingModel>(query, []);

    for (const item of result.data) {
      await Booking.findByIdAndUpdate(
        item._id,
        {
          bookingStatus: StatusType.accepted,
        },
        { new: true }
      );
    }

    if (result.meta.page < result.meta.pages) {
      await this.validateCompletedBooking(page + 1);
    }
  };
}
